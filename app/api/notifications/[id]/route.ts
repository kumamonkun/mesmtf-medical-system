import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Validation schema for notification updates
const notificationUpdateSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters').optional(),
  message: z.string().min(1, 'Message is required').max(1000, 'Message must be less than 1000 characters').optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  category: z.string().max(100, 'Category must be less than 100 characters').optional(),
  action_url: z.string().url('Invalid action URL format').optional(),
  scheduled_for: z.string().datetime('Invalid scheduled date format').optional(),
  expires_at: z.string().datetime('Invalid expiry date format').optional(),
  metadata: z.record(z.any()).optional(),
  status: z.enum(['active', 'scheduled', 'sent', 'read', 'archived', 'cancelled']).optional()
});

// GET /api/notifications/[id] - Get notification by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // Get notification with related data
    const { data: notification, error } = await supabase
      .from('notifications')
      .select(`
        *,
        user:user_profiles!notifications_user_id_fkey(
          id,
          first_name,
          last_name,
          role
        ),
        created_by_user:user_profiles!notifications_created_by_fkey(
          id,
          first_name,
          last_name,
          role
        )
      `)
      .eq('id', id)
      .eq('user_id', user.id) // Users can only access their own notifications
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
      }
      console.error('Error fetching notification:', error);
      return NextResponse.json({ error: 'Failed to fetch notification' }, { status: 500 });
    }

    // Add calculated fields
    const notificationWithCalculations = {
      ...notification,
      time_ago: Math.ceil((new Date().getTime() - new Date(notification.created_at).getTime()) / (1000 * 60 * 60 * 24)),
      is_recent: new Date(notification.created_at) >= new Date(Date.now() - 24 * 60 * 60 * 1000),
      is_expired: notification.expires_at ? new Date(notification.expires_at) <= new Date() : false,
      is_scheduled: notification.scheduled_for ? new Date(notification.scheduled_for) > new Date() : false
    };

    return NextResponse.json(notificationWithCalculations);

  } catch (error) {
    console.error('Error in GET /api/notifications/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/notifications/[id] - Update notification
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has permission to update notifications
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['admin', 'doctor', 'nurse', 'receptionist', 'pharmacist'].includes(profile.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { id } = params;
    const body = await request.json();
    
    // Validate input data
    const validatedData = notificationUpdateSchema.parse(body);

    // Check if notification exists
    const { data: existingNotification } = await supabase
      .from('notifications')
      .select('id, user_id, created_by, status')
      .eq('id', id)
      .single();

    if (!existingNotification) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    // Check if the user is the creator (for non-admin users)
    if (profile.role !== 'admin' && existingNotification.created_by !== user.id) {
      return NextResponse.json({ 
        error: 'You can only update notifications you created' 
      }, { status: 403 });
    }

    // Check if notification can be modified
    if (existingNotification.status === 'sent' || existingNotification.status === 'cancelled') {
      return NextResponse.json({ 
        error: 'Cannot modify sent or cancelled notifications' 
      }, { status: 400 });
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

    // Update notification
    const { data: updatedNotification, error } = await supabase
      .from('notifications')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
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
      console.error('Error updating notification:', error);
      return NextResponse.json({ error: 'Failed to update notification' }, { status: 500 });
    }

    return NextResponse.json(updatedNotification);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.errors 
      }, { status: 400 });
    }
    
    console.error('Error in PUT /api/notifications/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/notifications/[id] - Cancel notification
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has permission to delete notifications
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['admin', 'doctor', 'nurse', 'receptionist', 'pharmacist'].includes(profile.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { id } = params;

    // Check if notification exists
    const { data: existingNotification } = await supabase
      .from('notifications')
      .select('id, user_id, created_by, status')
      .eq('id', id)
      .single();

    if (!existingNotification) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    // Check if the user is the creator (for non-admin users)
    if (profile.role !== 'admin' && existingNotification.created_by !== user.id) {
      return NextResponse.json({ 
        error: 'You can only delete notifications you created' 
      }, { status: 403 });
    }

    // Check if notification can be cancelled
    if (existingNotification.status === 'sent' || existingNotification.status === 'cancelled') {
      return NextResponse.json({ 
        error: 'Cannot cancel sent or already cancelled notifications' 
      }, { status: 400 });
    }

    // Cancel notification
    const { data: cancelledNotification, error } = await supabase
      .from('notifications')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancelled_by: user.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error cancelling notification:', error);
      return NextResponse.json({ error: 'Failed to cancel notification' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Notification cancelled successfully',
      notification: cancelledNotification
    });

  } catch (error) {
    console.error('Error in DELETE /api/notifications/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
