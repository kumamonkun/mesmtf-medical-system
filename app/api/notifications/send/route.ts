import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Validation schema for sending notifications
const sendNotificationSchema = z.object({
  user_ids: z.array(z.string().uuid()).min(1, 'At least one user ID is required'),
  template_id: z.string().uuid('Invalid template ID format').optional(),
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
  metadata: z.record(z.any()).optional(),
  send_immediately: z.boolean().optional()
});

// POST /api/notifications/send - Send notifications
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has permission to send notifications
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
    const validatedData = sendNotificationSchema.parse(body);

    const { 
      user_ids, 
      template_id, 
      type, 
      title, 
      message, 
      priority, 
      category, 
      related_id, 
      related_type, 
      action_url, 
      scheduled_for, 
      expires_at, 
      metadata,
      send_immediately = true
    } = validatedData;

    // Check if template exists (if provided)
    let template = null;
    if (template_id) {
      const { data: templateData } = await supabase
        .from('notification_templates')
        .select('*')
        .eq('id', template_id)
        .eq('is_active', true)
        .single();

      if (!templateData) {
        return NextResponse.json({ error: 'Template not found or inactive' }, { status: 400 });
      }
      template = templateData;
    }

    // Check if all target users exist
    const { data: targetUsers } = await supabase
      .from('user_profiles')
      .select('id')
      .in('id', user_ids);

    if (!targetUsers || targetUsers.length !== user_ids.length) {
      return NextResponse.json({ 
        error: 'One or more target users not found' 
      }, { status: 400 });
    }

    // Validate scheduled date
    if (scheduled_for && new Date(scheduled_for) <= new Date()) {
      return NextResponse.json({ 
        error: 'Scheduled date must be in the future' 
      }, { status: 400 });
    }

    // Validate expiry date
    if (expires_at && new Date(expires_at) <= new Date()) {
      return NextResponse.json({ 
        error: 'Expiry date must be in the future' 
      }, { status: 400 });
    }

    // Prepare notification data
    const notificationData = {
      type,
      title: template ? template.title_template : title,
      message: template ? template.message_template : message,
      priority: priority || template?.priority || 'medium',
      category: category || template?.category || 'general',
      related_id,
      related_type,
      action_url,
      scheduled_for,
      expires_at,
      metadata: {
        ...metadata,
        template_id: template_id || null,
        template_name: template?.name || null
      },
      created_by: user.id,
      status: scheduled_for ? 'scheduled' : 'active'
    };

    // Create notifications for all target users
    const notificationsToCreate = user_ids.map(user_id => ({
      ...notificationData,
      user_id
    }));

    const { data: createdNotifications, error: createError } = await supabase
      .from('notifications')
      .insert(notificationsToCreate)
      .select(`
        *,
        user:user_profiles!notifications_user_id_fkey(
          id,
          first_name,
          last_name,
          role
        )
      `);

    if (createError) {
      console.error('Error creating notifications:', createError);
      return NextResponse.json({ error: 'Failed to create notifications' }, { status: 500 });
    }

    // If send_immediately is true and no scheduled date, mark as sent
    if (send_immediately && !scheduled_for) {
      const notificationIds = createdNotifications?.map(n => n.id) || [];
      
      const { error: updateError } = await supabase
        .from('notifications')
        .update({
          status: 'sent',
          sent_at: new Date().toISOString()
        })
        .in('id', notificationIds);

      if (updateError) {
        console.error('Error updating notification status:', updateError);
        // Don't fail the operation if status update fails
      }
    }

    // Log notification sending activity
    const { error: logError } = await supabase
      .from('notification_send_logs')
      .insert({
        sent_by: user.id,
        sent_at: new Date().toISOString(),
        notification_count: createdNotifications?.length || 0,
        notification_type: type,
        template_id: template_id || null,
        target_users: user_ids
      });

    if (logError) {
      console.error('Error logging notification send:', logError);
      // Don't fail the operation if logging fails
    }

    return NextResponse.json({
      message: 'Notifications sent successfully',
      notifications: createdNotifications,
      count: createdNotifications?.length || 0,
      status: send_immediately && !scheduled_for ? 'sent' : 'scheduled'
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.errors 
      }, { status: 400 });
    }
    
    console.error('Error in POST /api/notifications/send:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
