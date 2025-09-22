import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Validation schema for appointment updates
const appointmentUpdateSchema = z.object({
  patient_id: z.string().uuid('Invalid patient ID').optional(),
  doctor_id: z.string().uuid('Invalid doctor ID').optional(),
  appointment_date: z.string().datetime('Invalid appointment date').optional(),
  reason: z.string().min(1, 'Reason is required').optional(),
  notes: z.string().optional(),
  duration: z.number().min(15, 'Duration must be at least 15 minutes').max(240, 'Duration cannot exceed 4 hours').optional(),
  type: z.enum(['consultation', 'follow_up', 'emergency', 'routine']).optional(),
  room: z.string().optional(),
  status: z.enum(['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show']).optional(),
});

// GET /api/appointments/[id] - Get appointment by ID
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

    // Get appointment with related data
    const { data: appointment, error } = await supabase
      .from('appointments')
      .select(`
        *,
        patient:patients!appointments_patient_id_fkey(
          id,
          patient_id,
          first_name,
          last_name,
          phone,
          email,
          date_of_birth,
          gender
        ),
        doctor:doctors!appointments_doctor_id_fkey(
          id,
          name,
          specialty,
          phone,
          email
        ),
        created_by_user:user_profiles!appointments_created_by_fkey(
          id,
          first_name,
          last_name,
          role
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
      }
      console.error('Error fetching appointment:', error);
      return NextResponse.json({ error: 'Failed to fetch appointment' }, { status: 500 });
    }

    return NextResponse.json(appointment);

  } catch (error) {
    console.error('Error in GET /api/appointments/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/appointments/[id] - Update appointment
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

    // Check if user has permission to update appointments
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['admin', 'doctor', 'nurse', 'receptionist'].includes(profile.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { id } = params;
    const body = await request.json();
    
    // Validate input data
    const validatedData = appointmentUpdateSchema.parse(body);

    // Check if appointment exists
    const { data: existingAppointment } = await supabase
      .from('appointments')
      .select('id, status, doctor_id, appointment_date, duration')
      .eq('id', id)
      .single();

    if (!existingAppointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    // Check if appointment can be modified (not completed or cancelled)
    if (existingAppointment.status === 'completed' || existingAppointment.status === 'cancelled') {
      return NextResponse.json({ 
        error: 'Cannot modify completed or cancelled appointments' 
      }, { status: 400 });
    }

    // If changing doctor or time, check for conflicts
    if (validatedData.doctor_id || validatedData.appointment_date) {
      const doctorId = validatedData.doctor_id || existingAppointment.doctor_id;
      const appointmentDate = new Date(validatedData.appointment_date || existingAppointment.appointment_date);
      const duration = validatedData.duration || existingAppointment.duration || 30;
      const endTime = new Date(appointmentDate.getTime() + duration * 60000);

      const { data: conflictingAppointments } = await supabase
        .from('appointments')
        .select('id, appointment_date, duration')
        .eq('doctor_id', doctorId)
        .eq('status', 'scheduled')
        .neq('id', id)
        .or(`and(appointment_date.lt.${endTime.toISOString()},appointment_date.gte.${appointmentDate.toISOString()})`);

      if (conflictingAppointments && conflictingAppointments.length > 0) {
        return NextResponse.json({ 
          error: 'Doctor has a conflicting appointment at this time' 
        }, { status: 400 });
      }
    }

    // Update appointment
    const { data: updatedAppointment, error } = await supabase
      .from('appointments')
      .update({
        ...validatedData,
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
      console.error('Error updating appointment:', error);
      return NextResponse.json({ error: 'Failed to update appointment' }, { status: 500 });
    }

    return NextResponse.json(updatedAppointment);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.errors 
      }, { status: 400 });
    }
    
    console.error('Error in PUT /api/appointments/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/appointments/[id] - Cancel appointment
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

    // Check if user has permission to cancel appointments
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['admin', 'doctor', 'nurse', 'receptionist'].includes(profile.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { id } = params;

    // Check if appointment exists
    const { data: existingAppointment } = await supabase
      .from('appointments')
      .select('id, status')
      .eq('id', id)
      .single();

    if (!existingAppointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    // Check if appointment can be cancelled
    if (existingAppointment.status === 'completed' || existingAppointment.status === 'cancelled') {
      return NextResponse.json({ 
        error: 'Cannot cancel completed or already cancelled appointments' 
      }, { status: 400 });
    }

    // Cancel appointment (soft delete by updating status)
    const { data: cancelledAppointment, error } = await supabase
      .from('appointments')
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
      console.error('Error cancelling appointment:', error);
      return NextResponse.json({ error: 'Failed to cancel appointment' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Appointment cancelled successfully',
      appointment: cancelledAppointment
    });

  } catch (error) {
    console.error('Error in DELETE /api/appointments/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
