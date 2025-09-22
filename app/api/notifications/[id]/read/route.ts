import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// PUT /api/notifications/[id]/read - Mark notification as read
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

    const { id } = params;

    // Check if notification exists and belongs to user
    const { data: existingNotification } = await supabase
      .from('notifications')
      .select('id, user_id, is_read, status')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (!existingNotification) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    // Check if notification is already read
    if (existingNotification.is_read) {
      return NextResponse.json({ 
        message: 'Notification is already marked as read',
        notification: existingNotification
      });
    }

    // Check if notification can be marked as read
    if (existingNotification.status === 'cancelled') {
      return NextResponse.json({ 
        error: 'Cannot mark cancelled notification as read' 
      }, { status: 400 });
    }

    // Mark notification as read
    const { data: updatedNotification, error } = await supabase
      .from('notifications')
      .update({
        is_read: true,
        read_at: new Date().toISOString(),
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
      console.error('Error marking notification as read:', error);
      return NextResponse.json({ error: 'Failed to mark notification as read' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Notification marked as read successfully',
      notification: updatedNotification
    });

  } catch (error) {
    console.error('Error in PUT /api/notifications/[id]/read:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
