import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Validation schema for appointment completion
const completeAppointmentSchema = z.object({
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
  diagnosis: z.string().max(500, 'Diagnosis must be less than 500 characters').optional(),
  treatment_plan: z.string().max(1000, 'Treatment plan must be less than 1000 characters').optional(),
  follow_up_required: z.boolean().optional(),
  follow_up_date: z.string().datetime('Invalid follow-up date format').optional(),
  prescription_required: z.boolean().optional()
});

// PUT /api/appointments/[id]/complete - Complete appointment
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

    // Check if user has permission to complete appointments
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['admin', 'doctor', 'nurse'].includes(profile.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { id } = params;
    const body = await request.json();
    
    // Validate input data
    const validatedData = completeAppointmentSchema.parse(body);

    // Check if appointment exists and can be completed
    const { data: existingAppointment } = await supabase
      .from('appointments')
      .select('id, status, doctor_id, patient_id')
      .eq('id', id)
      .single();

    if (!existingAppointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    if (existingAppointment.status !== 'in_progress') {
      return NextResponse.json({ 
        error: 'Only in-progress appointments can be completed' 
      }, { status: 400 });
    }

    // Check if the user is the assigned doctor (for doctors)
    if (profile.role === 'doctor' && existingAppointment.doctor_id !== user.id) {
      return NextResponse.json({ 
        error: 'You can only complete your own appointments' 
      }, { status: 403 });
    }

    // Complete appointment
    const { data: completedAppointment, error } = await supabase
      .from('appointments')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        completed_by: user.id,
        updated_at: new Date().toISOString(),
        ...validatedData
      })
      .eq('id', id)
      .select(`
        *,
        patient:patients!appointments_patient_id_fkey(
          id,
          patient_id,
          first_name,
          last_name,
          phone
        ),
        doctor:doctors!appointments_doctor_id_fkey(
          id,
          name,
          specialty
        )
      `)
      .single();

    if (error) {
      console.error('Error completing appointment:', error);
      return NextResponse.json({ error: 'Failed to complete appointment' }, { status: 500 });
    }

    // If follow-up is required, create a new appointment
    if (validatedData.follow_up_required && validatedData.follow_up_date) {
      const followUpDate = new Date(validatedData.follow_up_date);
      const { error: followUpError } = await supabase
        .from('appointments')
        .insert({
          patient_id: existingAppointment.patient_id,
          doctor_id: existingAppointment.doctor_id,
          appointment_date: followUpDate.toISOString(),
          reason: 'Follow-up appointment',
          type: 'follow_up',
          status: 'scheduled',
          created_by: user.id,
          duration: 30
        });

      if (followUpError) {
        console.error('Error creating follow-up appointment:', followUpError);
        // Don't fail the main operation, just log the error
      }
    }

    return NextResponse.json({
      message: 'Appointment completed successfully',
      appointment: completedAppointment,
      followUpCreated: validatedData.follow_up_required && validatedData.follow_up_date
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.errors 
      }, { status: 400 });
    }
    
    console.error('Error in PUT /api/appointments/[id]/complete:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
