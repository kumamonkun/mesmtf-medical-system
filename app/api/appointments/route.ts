import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Validation schema for appointment data
const appointmentSchema = z.object({
  patient_id: z.string().uuid('Invalid patient ID'),
  doctor_id: z.string().uuid('Invalid doctor ID'),
  appointment_date: z.string().datetime('Invalid appointment date'),
  reason: z.string().min(1, 'Reason is required'),
  notes: z.string().optional(),
  duration: z.number().min(15, 'Duration must be at least 15 minutes').max(240, 'Duration cannot exceed 4 hours').optional(),
  type: z.enum(['consultation', 'follow_up', 'emergency', 'routine']).optional(),
  room: z.string().optional(),
});

// GET /api/appointments - List all appointments with pagination and filters
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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status') || '';
    const date = searchParams.get('date') || '';
    const doctorId = searchParams.get('doctor_id') || '';
    const patientId = searchParams.get('patient_id') || '';
    const type = searchParams.get('type') || '';
    
    const offset = (page - 1) * limit;

    // Build query with joins
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
      `, { count: 'exact' })
      .order('appointment_date', { ascending: true });

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }
    
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      query = query
        .gte('appointment_date', startOfDay.toISOString())
        .lte('appointment_date', endOfDay.toISOString());
    }
    
    if (doctorId) {
      query = query.eq('doctor_id', doctorId);
    }
    
    if (patientId) {
      query = query.eq('patient_id', patientId);
    }
    
    if (type) {
      query = query.eq('type', type);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: appointments, error, count } = await query;

    if (error) {
      console.error('Error fetching appointments:', error);
      return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 });
    }

    return NextResponse.json({
      appointments: appointments || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Error in GET /api/appointments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/appointments - Create new appointment
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has permission to create appointments
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['admin', 'doctor', 'nurse', 'receptionist'].includes(profile.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    
    // Validate input data
    const validatedData = appointmentSchema.parse(body);

    // Check if patient exists
    const { data: patient } = await supabase
      .from('patients')
      .select('id')
      .eq('id', validatedData.patient_id)
      .single();

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 400 });
    }

    // Check if doctor exists
    const { data: doctor } = await supabase
      .from('doctors')
      .select('id')
      .eq('id', validatedData.doctor_id)
      .single();

    if (!doctor) {
      return NextResponse.json({ error: 'Doctor not found' }, { status: 400 });
    }

    // Check for conflicting appointments
    const appointmentDate = new Date(validatedData.appointment_date);
    const duration = validatedData.duration || 30;
    const endTime = new Date(appointmentDate.getTime() + duration * 60000);

    const { data: conflictingAppointments } = await supabase
      .from('appointments')
      .select('id, appointment_date, duration')
      .eq('doctor_id', validatedData.doctor_id)
      .eq('status', 'scheduled')
      .or(`and(appointment_date.lt.${endTime.toISOString()},appointment_date.gte.${appointmentDate.toISOString()})`);

    if (conflictingAppointments && conflictingAppointments.length > 0) {
      return NextResponse.json({ 
        error: 'Doctor has a conflicting appointment at this time' 
      }, { status: 400 });
    }

    // Create appointment
    const { data: newAppointment, error } = await supabase
      .from('appointments')
      .insert({
        ...validatedData,
        created_by: user.id,
        status: 'scheduled',
        duration: duration
      })
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
      console.error('Error creating appointment:', error);
      return NextResponse.json({ error: 'Failed to create appointment' }, { status: 500 });
    }

    return NextResponse.json(newAppointment, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.errors 
      }, { status: 400 });
    }
    
    console.error('Error in POST /api/appointments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
