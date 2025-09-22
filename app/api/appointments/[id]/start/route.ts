import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// PUT /api/appointments/[id]/start - Start appointment
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

    // Check if user has permission to start appointments
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['admin', 'doctor', 'nurse'].includes(profile.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { id } = params;

    // Check if appointment exists and can be started
    const { data: existingAppointment } = await supabase
      .from('appointments')
      .select('id, status, appointment_date, doctor_id')
      .eq('id', id)
      .single();

    if (!existingAppointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    if (existingAppointment.status !== 'confirmed' && existingAppointment.status !== 'scheduled') {
      return NextResponse.json({ 
        error: 'Only confirmed or scheduled appointments can be started' 
      }, { status: 400 });
    }

    // Check if the user is the assigned doctor (for doctors)
    if (profile.role === 'doctor' && existingAppointment.doctor_id !== user.id) {
      return NextResponse.json({ 
        error: 'You can only start your own appointments' 
      }, { status: 403 });
    }

    // Start appointment
    const { data: startedAppointment, error } = await supabase
      .from('appointments')
      .update({
        status: 'in_progress',
        started_at: new Date().toISOString(),
        started_by: user.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        patient:patients!appointments_patient_id_fkey(
          id,
          patient_id,
          first_name,
          last_name,
          phone,
          date_of_birth,
          gender,
          medical_history,
          allergies,
          chronic_conditions
        ),
        doctor:doctors!appointments_doctor_id_fkey(
          id,
          name,
          specialty,
          phone
        )
      `)
      .single();

    if (error) {
      console.error('Error starting appointment:', error);
      return NextResponse.json({ error: 'Failed to start appointment' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Appointment started successfully',
      appointment: startedAppointment
    });

  } catch (error) {
    console.error('Error in PUT /api/appointments/[id]/start:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
