import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Validation schema for notification data
const notificationSchema = z.object({
  user_id: z.string().uuid('Invalid user ID format'),
  type: z.enum(['appointment', 'prescription', 'lab_result', 'reminder', 'alert', 'system', 'emergency']),
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  message: z.string().min(1, 'Message is required').max(1000, 'Message must be less than 1000 characters'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  category: z.string().max(100, 'Category must be less than 100 characters').optional(),
  related_id: z.string().uuid('Invalid related ID format').optional(),
  related_type: z.enum(['appointment', 'prescription', 'patient', 'diagnosis', 'treatment', 'medical_record']).optional(),
  action_url: z.string().url('Invalid action URL format').optional(),
  scheduled_for: z.string().datetime('Invalid scheduled date format').optional(),
  expires_at: z.string().datetime('Invalid expiry date format').optional(),
  metadata: z.record(z.any()).optional()
});

// GET /api/notifications - List all notifications with pagination and filters
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const type = searchParams.get('type') || '';
    const priority = searchParams.get('priority') || '';
    const category = searchParams.get('category') || '';
    const status = searchParams.get('status') || '';
    const unread_only = searchParams.get('unread_only') === 'true';
    const date_from = searchParams.get('date_from') || '';
    const date_to = searchParams.get('date_to') || '';
    const sort_by = searchParams.get('sort_by') || 'created_at';
    const sort_order = searchParams.get('sort_order') || 'desc';
    
    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from('notifications')
      .select(`
        *,
        user:user_profiles!notifications_user_id_fkey(
          id,
          first_name,
          last_name,
          role
        )
      `, { count: 'exact' })
      .eq('user_id', user.id); // Users can only see their own notifications

    // Apply filters
    if (type) {
      query = query.eq('type', type);
    }
    
    if (priority) {
      query = query.eq('priority', priority);
    }
    
    if (category) {
      query = query.eq('category', category);
    }
    
    if (status) {
      query = query.eq('status', status);
    }
    
    if (unread_only) {
      query = query.eq('is_read', false);
    }
    
    if (date_from) {
      query = query.gte('created_at', date_from);
    }
    
    if (date_to) {
      query = query.lte('created_at', date_to);
    }

    // Apply sorting
    const validSortFields = ['created_at', 'priority', 'type', 'status', 'is_read'];
    const sortField = validSortFields.includes(sort_by) ? sort_by : 'created_at';
    const order = sort_order === 'asc';
    
    query = query.order(sortField, { ascending: order });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: notifications, error, count } = await query;

    if (error) {
      console.error('Error fetching notifications:', error);
      return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
    }

    // Add calculated fields
    const notificationsWithCalculations = notifications?.map(notification => ({
      ...notification,
      time_ago: Math.ceil((new Date().getTime() - new Date(notification.created_at).getTime()) / (1000 * 60 * 60 * 24)),
      is_recent: new Date(notification.created_at) >= new Date(Date.now() - 24 * 60 * 60 * 1000),
      is_expired: notification.expires_at ? new Date(notification.expires_at) <= new Date() : false,
      is_scheduled: notification.scheduled_for ? new Date(notification.scheduled_for) > new Date() : false
    }));

    // Get notification summary
    const totalNotifications = count || 0;
    const unreadCount = notifications?.filter(n => !n.is_read).length || 0;
    const urgentCount = notifications?.filter(n => n.priority === 'urgent' && !n.is_read).length || 0;
    const expiredCount = notifications?.filter(n => 
      n.expires_at && new Date(n.expires_at) <= new Date()
    ).length || 0;

    return NextResponse.json({
      notifications: notificationsWithCalculations || [],
      summary: {
        total: totalNotifications,
        unread: unreadCount,
        urgent: urgentCount,
        expired: expiredCount
      },
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Error in GET /api/notifications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/notifications - Create new notification
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has permission to create notifications
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['admin', 'doctor', 'nurse', 'receptionist', 'pharmacist'].includes(profile.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    
    // Validate input data
    const validatedData = notificationSchema.parse(body);

    // Check if target user exists
    const { data: targetUser } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('id', validatedData.user_id)
      .single();

    if (!targetUser) {
      return NextResponse.json({ error: 'Target user not found' }, { status: 400 });
    }

    // Validate scheduled date
    if (validatedData.scheduled_for && new Date(validatedData.scheduled_for) <= new Date()) {
      return NextResponse.json({ 
        error: 'Scheduled date must be in the future' 
      }, { status: 400 });
    }

    // Validate expiry date
    if (validatedData.expires_at && new Date(validatedData.expires_at) <= new Date()) {
      return NextResponse.json({ 
        error: 'Expiry date must be in the future' 
      }, { status: 400 });
    }

    // Create notification
    const { data: newNotification, error } = await supabase
      .from('notifications')
      .insert({
        ...validatedData,
        created_by: user.id,
        status: validatedData.scheduled_for ? 'scheduled' : 'active'
      })
      .select(`
        *,
        user:user_profiles!notifications_user_id_fkey(
          id,
          first_name,
          last_name,
          role
        )
      `)
      .single();

    if (error) {
      console.error('Error creating notification:', error);
      return NextResponse.json({ error: 'Failed to create notification' }, { status: 500 });
    }

    return NextResponse.json(newNotification, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.errors 
      }, { status: 400 });
    }
    
    console.error('Error in POST /api/notifications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
