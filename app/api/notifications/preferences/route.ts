import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Validation schema for notification preferences
const notificationPreferencesSchema = z.object({
  email_notifications: z.boolean().optional(),
  sms_notifications: z.boolean().optional(),
  push_notifications: z.boolean().optional(),
  appointment_reminders: z.boolean().optional(),
  prescription_reminders: z.boolean().optional(),
  lab_result_alerts: z.boolean().optional(),
  system_alerts: z.boolean().optional(),
  emergency_alerts: z.boolean().optional(),
  quiet_hours_start: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format').optional(),
  quiet_hours_end: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format').optional(),
  timezone: z.string().max(50, 'Timezone must be less than 50 characters').optional(),
  language: z.string().max(10, 'Language must be less than 10 characters').optional()
});

// GET /api/notifications/preferences - Get user notification preferences
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user notification preferences
    const { data: preferences, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching notification preferences:', error);
      return NextResponse.json({ error: 'Failed to fetch notification preferences' }, { status: 500 });
    }

    // If no preferences exist, return default preferences
    if (!preferences) {
      const defaultPreferences = {
        user_id: user.id,
        email_notifications: true,
        sms_notifications: false,
        push_notifications: true,
        appointment_reminders: true,
        prescription_reminders: true,
        lab_result_alerts: true,
        system_alerts: true,
        emergency_alerts: true,
        quiet_hours_start: '22:00',
        quiet_hours_end: '08:00',
        timezone: 'UTC',
        language: 'en'
      };

      return NextResponse.json(defaultPreferences);
    }

    return NextResponse.json(preferences);

  } catch (error) {
    console.error('Error in GET /api/notifications/preferences:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/notifications/preferences - Update user notification preferences
export async function PUT(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Validate input data
    const validatedData = notificationPreferencesSchema.parse(body);

    // Validate quiet hours
    if (validatedData.quiet_hours_start && validatedData.quiet_hours_end) {
      const startTime = new Date(`2000-01-01T${validatedData.quiet_hours_start}:00`);
      const endTime = new Date(`2000-01-01T${validatedData.quiet_hours_end}:00`);
      
      if (startTime >= endTime) {
        return NextResponse.json({ 
          error: 'Quiet hours start time must be before end time' 
        }, { status: 400 });
      }
    }

    // Check if preferences exist
    const { data: existingPreferences } = await supabase
      .from('notification_preferences')
      .select('id')
      .eq('user_id', user.id)
      .single();

    let preferences;

    if (existingPreferences) {
      // Update existing preferences
      const { data: updatedPreferences, error: updateError } = await supabase
        .from('notification_preferences')
        .update({
          ...validatedData,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating notification preferences:', updateError);
        return NextResponse.json({ error: 'Failed to update notification preferences' }, { status: 500 });
      }

      preferences = updatedPreferences;
    } else {
      // Create new preferences
      const { data: newPreferences, error: createError } = await supabase
        .from('notification_preferences')
        .insert({
          user_id: user.id,
          ...validatedData
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating notification preferences:', createError);
        return NextResponse.json({ error: 'Failed to create notification preferences' }, { status: 500 });
      }

      preferences = newPreferences;
    }

    return NextResponse.json({
      message: 'Notification preferences updated successfully',
      preferences
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.errors 
      }, { status: 400 });
    }
    
    console.error('Error in PUT /api/notifications/preferences:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
