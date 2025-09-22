import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Validation schema for date parameter
const dateSchema = z.string().date('Invalid date format');

// GET /api/appointments/calendar/[date] - Get appointments for a specific date
export async function GET(
  request: NextRequest,
  { params }: { params: { date: string } }
) {
  try {
    const supabase = createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { date } = params;
    
    // Validate date parameter
    const validatedDate = dateSchema.parse(date);

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const doctorId = searchParams.get('doctor_id');
    const status = searchParams.get('status');
    const type = searchParams.get('type');

    // Build query
    let query = supabase
      .from('appointments')
      .select(`
        *,
        patient:patients!appointments_patient_id_fkey(
          id,
          patient_id,
          first_name,
          last_name,
          phone,
          email
        ),
        doctor:doctors!appointments_doctor_id_fkey(
          id,
          name,
          specialty,
          phone
        )
      `);

    // Filter by date
    const startOfDay = new Date(validatedDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(validatedDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    query = query
      .gte('appointment_date', startOfDay.toISOString())
      .lte('appointment_date', endOfDay.toISOString());

    // Apply additional filters
    if (doctorId) {
      query = query.eq('doctor_id', doctorId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (type) {
      query = query.eq('type', type);
    }

    // Order by appointment time
    query = query.order('appointment_date', { ascending: true });

    const { data: appointments, error } = await query;

    if (error) {
      console.error('Error fetching calendar appointments:', error);
      return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 });
    }

    // Group appointments by time slots for better calendar display
    const groupedAppointments = groupAppointmentsByTimeSlot(appointments || []);

    return NextResponse.json({
      date: validatedDate,
      appointments: appointments || [],
      groupedAppointments,
      total: appointments?.length || 0
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.errors 
      }, { status: 400 });
    }
    
    console.error('Error in GET /api/appointments/calendar/[date]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper function to group appointments by time slots
function groupAppointmentsByTimeSlot(appointments: any[]) {
  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00'
  ];

  const grouped: { [key: string]: any[] } = {};

  // Initialize all time slots
  timeSlots.forEach(slot => {
    grouped[slot] = [];
  });

  // Group appointments by their time slot
  appointments.forEach(appointment => {
    const appointmentTime = new Date(appointment.appointment_date);
    const timeString = appointmentTime.toTimeString().slice(0, 5);
    
    // Find the closest time slot
    const closestSlot = findClosestTimeSlot(timeString, timeSlots);
    if (closestSlot) {
      grouped[closestSlot].push(appointment);
    }
  });

  return grouped;
}

// Helper function to find the closest time slot
function findClosestTimeSlot(time: string, timeSlots: string[]): string | null {
  const [hours, minutes] = time.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes;

  let closestSlot = null;
  let minDifference = Infinity;

  timeSlots.forEach(slot => {
    const [slotHours, slotMinutes] = slot.split(':').map(Number);
    const slotTotalMinutes = slotHours * 60 + slotMinutes;
    const difference = Math.abs(totalMinutes - slotTotalMinutes);

    if (difference < minDifference) {
      minDifference = difference;
      closestSlot = slot;
    }
  });

  return closestSlot;
}
