import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// PUT /api/appointments/[id]/confirm - Confirm appointment
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

    // Check if user has permission to confirm appointments
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['admin', 'doctor', 'nurse', 'receptionist'].includes(profile.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { id } = params;

    // Check if appointment exists and can be confirmed
    const { data: existingAppointment } = await supabase
      .from('appointments')
      .select('id, status, appointment_date')
      .eq('id', id)
      .single();

    if (!existingAppointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    if (existingAppointment.status !== 'scheduled') {
      return NextResponse.json({ 
        error: 'Only scheduled appointments can be confirmed' 
      }, { status: 400 });
    }

    // Check if appointment is in the past
    const appointmentDate = new Date(existingAppointment.appointment_date);
    const now = new Date();
    if (appointmentDate < now) {
      return NextResponse.json({ 
        error: 'Cannot confirm past appointments' 
      }, { status: 400 });
    }

    // Confirm appointment
    const { data: confirmedAppointment, error } = await supabase
      .from('appointments')
      .update({
        status: 'confirmed',
        confirmed_at: new Date().toISOString(),
        confirmed_by: user.id,
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
      console.error('Error confirming appointment:', error);
      return NextResponse.json({ error: 'Failed to confirm appointment' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Appointment confirmed successfully',
      appointment: confirmedAppointment
    });

  } catch (error) {
    console.error('Error in PUT /api/appointments/[id]/confirm:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
