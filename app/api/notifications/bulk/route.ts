import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Validation schema for bulk operations
const bulkOperationSchema = z.object({
  action: z.enum(['mark_read', 'mark_unread', 'delete', 'archive']),
  notification_ids: z.array(z.string().uuid()).min(1, 'At least one notification ID is required'),
  filters: z.object({
    type: z.string().optional(),
    priority: z.string().optional(),
    category: z.string().optional(),
    status: z.string().optional(),
    date_from: z.string().optional(),
    date_to: z.string().optional()
  }).optional()
});

// POST /api/notifications/bulk - Perform bulk operations on notifications
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has permission to perform bulk operations
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
    const validatedData = bulkOperationSchema.parse(body);

    const { action, notification_ids, filters } = validatedData;

    // Build query for notifications
    let query = supabase
      .from('notifications')
      .select('id, user_id, status, is_read')
      .eq('user_id', user.id) // Users can only operate on their own notifications
      .in('id', notification_ids);

    // Apply filters if provided
    if (filters) {
      if (filters.type) {
        query = query.eq('type', filters.type);
      }
      if (filters.priority) {
        query = query.eq('priority', filters.priority);
      }
      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.date_from) {
        query = query.gte('created_at', filters.date_from);
      }
      if (filters.date_to) {
        query = query.lte('created_at', filters.date_to);
      }
    }

    const { data: notifications, error: fetchError } = await query;

    if (fetchError) {
      console.error('Error fetching notifications:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
    }

    if (!notifications || notifications.length === 0) {
      return NextResponse.json({ 
        error: 'No notifications found matching the criteria' 
      }, { status: 404 });
    }

    // Filter out notifications that cannot be modified
    const modifiableNotifications = notifications.filter(notification => {
      if (action === 'delete' || action === 'archive') {
        return notification.status !== 'sent' && notification.status !== 'cancelled';
      }
      return true;
    });

    if (modifiableNotifications.length === 0) {
      return NextResponse.json({ 
        error: 'No notifications can be modified with the selected action' 
      }, { status: 400 });
    }

    const modifiableIds = modifiableNotifications.map(n => n.id);

    // Perform bulk operation
    let updateData: any = {};
    let successMessage = '';

    switch (action) {
      case 'mark_read':
        updateData = {
          is_read: true,
          read_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        successMessage = 'Notifications marked as read successfully';
        break;

      case 'mark_unread':
        updateData = {
          is_read: false,
          read_at: null,
          updated_at: new Date().toISOString()
        };
        successMessage = 'Notifications marked as unread successfully';
        break;

      case 'archive':
        updateData = {
          status: 'archived',
          archived_at: new Date().toISOString(),
          archived_by: user.id,
          updated_at: new Date().toISOString()
        };
        successMessage = 'Notifications archived successfully';
        break;

      case 'delete':
        // For delete, we'll use a different approach
        const { error: deleteError } = await supabase
          .from('notifications')
          .delete()
          .in('id', modifiableIds);

        if (deleteError) {
          console.error('Error deleting notifications:', deleteError);
          return NextResponse.json({ error: 'Failed to delete notifications' }, { status: 500 });
        }

        return NextResponse.json({
          message: 'Notifications deleted successfully',
          deleted_count: modifiableIds.length,
          skipped_count: notifications.length - modifiableIds.length
        });

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    // Update notifications
    const { error: updateError } = await supabase
      .from('notifications')
      .update(updateData)
      .in('id', modifiableIds);

    if (updateError) {
      console.error('Error updating notifications:', updateError);
      return NextResponse.json({ error: 'Failed to update notifications' }, { status: 500 });
    }

    return NextResponse.json({
      message: successMessage,
      updated_count: modifiableIds.length,
      skipped_count: notifications.length - modifiableIds.length,
      action
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.errors 
      }, { status: 400 });
    }
    
    console.error('Error in POST /api/notifications/bulk:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
