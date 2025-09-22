import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Validation schema for available slots request
const availableSlotsSchema = z.object({
  doctor_id: z.string().uuid('Invalid doctor ID format'),
  date: z.string().date('Invalid date format'),
  duration: z.number()
    .min(15, 'Duration must be at least 15 minutes')
    .max(240, 'Duration cannot exceed 4 hours')
    .optional()
});

// GET /api/appointments/available-slots - Get available time slots for a doctor
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
    const doctorId = searchParams.get('doctor_id');
    const date = searchParams.get('date');
    const duration = parseInt(searchParams.get('duration') || '30');

    // Validate parameters
    const validatedParams = availableSlotsSchema.parse({
      doctor_id: doctorId,
      date,
      duration
    });

    // Check if doctor exists
    const { data: doctor } = await supabase
      .from('doctors')
      .select('id, name, specialty')
      .eq('id', validatedParams.doctor_id)
      .single();

    if (!doctor) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 404 });
    }

    // Get available slots
    const slots = await getAvailableSlots(
      supabase,
      validatedParams.doctor_id,
      validatedParams.date,
      validatedParams.duration
    );

    return NextResponse.json({
      slots,
      doctor: {
        id: doctor.id,
        name: doctor.name,
        specialty: doctor.specialty
      },
      date: validatedParams.date,
      duration: validatedParams.duration
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.errors 
      }, { status: 400 });
    }
    
    console.error('Error in GET /api/appointments/available-slots:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper function to get available slots
async function getAvailableSlots(
  supabase: any,
  doctorId: string,
  date: string,
  duration: number = 30
) {
  const startOfDay = new Date(date);
  startOfDay.setHours(8, 0, 0, 0); // Start at 8 AM
  const endOfDay = new Date(date);
  endOfDay.setHours(17, 0, 0, 0); // End at 5 PM

  // Get existing appointments for the doctor on this date
  const { data: existingAppointments } = await supabase
    .from('appointments')
    .select('appointment_date, duration')
    .eq('doctor_id', doctorId)
    .eq('status', 'scheduled')
    .gte('appointment_date', startOfDay.toISOString())
    .lte('appointment_date', endOfDay.toISOString())
    .order('appointment_date', { ascending: true });

  // Generate available slots
  const slots = [];
  const currentTime = new Date(startOfDay);
  
  while (currentTime < endOfDay) {
    const slotEnd = new Date(currentTime.getTime() + duration * 60000);
    
    // Check if this slot conflicts with existing appointments
    const hasConflict = existingAppointments?.some(appointment => {
      const appointmentStart = new Date(appointment.appointment_date);
      const appointmentEnd = new Date(appointmentStart.getTime() + (appointment.duration || 30) * 60000);
      
      return (currentTime < appointmentEnd && slotEnd > appointmentStart);
    });

    if (!hasConflict) {
      slots.push({
        start: currentTime.toISOString(),
        end: slotEnd.toISOString(),
        time: currentTime.toTimeString().slice(0, 5),
        date: currentTime.toISOString().split('T')[0]
      });
    }

    currentTime.setMinutes(currentTime.getMinutes() + 30); // 30-minute intervals
  }

  return slots;
}
