import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Validation schema for treatment data
const treatmentSchema = z.object({
  patient_id: z.string().uuid('Invalid patient ID format'),
  doctor_id: z.string().uuid('Invalid doctor ID format'),
  diagnosis_id: z.string().uuid('Invalid diagnosis ID format').optional(),
  treatment_name: z.string().min(1, 'Treatment name is required').max(200, 'Treatment name must be less than 200 characters'),
  description: z.string().min(1, 'Description is required').max(1000, 'Description must be less than 1000 characters'),
  treatment_type: z.enum(['medication', 'therapy', 'surgery', 'lifestyle', 'monitoring', 'other']),
  dosage: z.string().max(100, 'Dosage must be less than 100 characters').optional(),
  frequency: z.string().max(100, 'Frequency must be less than 100 characters').optional(),
  duration: z.string().max(100, 'Duration must be less than 100 characters').optional(),
  instructions: z.string().max(1000, 'Instructions must be less than 1000 characters').optional(),
  start_date: z.string().date('Invalid start date format'),
  end_date: z.string().date('Invalid end date format').optional(),
  status: z.enum(['planned', 'active', 'completed', 'cancelled', 'paused']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  side_effects: z.string().max(500, 'Side effects must be less than 500 characters').optional(),
  follow_up_required: z.boolean().optional(),
  follow_up_date: z.string().date('Invalid follow-up date format').optional()
});

// GET /api/treatments - List all treatments with pagination and filters
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
    const patientId = searchParams.get('patient_id') || '';
    const doctorId = searchParams.get('doctor_id') || '';
    const treatmentType = searchParams.get('treatment_type') || '';
    const priority = searchParams.get('priority') || '';
    const dateFrom = searchParams.get('date_from') || '';
    const dateTo = searchParams.get('date_to') || '';
    
    const offset = (page - 1) * limit;

    // Build query with joins
    let query = supabase
      .from('treatments')
      .select(`
        *,
        patient:patients!treatments_patient_id_fkey(
          id,
          patient_id,
          first_name,
          last_name,
          phone,
          date_of_birth,
          gender
        ),
        doctor:doctors!treatments_doctor_id_fkey(
          id,
          name,
          specialty,
          phone
        ),
        diagnosis:diagnoses!treatments_diagnosis_id_fkey(
          id,
          diagnosis,
          symptoms,
          confidence_level
        )
      `, { count: 'exact' })
      .order('created_at', { ascending: false });

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }
    
    if (patientId) {
      query = query.eq('patient_id', patientId);
    }
    
    if (doctorId) {
      query = query.eq('doctor_id', doctorId);
    }
    
    if (treatmentType) {
      query = query.eq('treatment_type', treatmentType);
    }
    
    if (priority) {
      query = query.eq('priority', priority);
    }
    
    if (dateFrom) {
      query = query.gte('start_date', dateFrom);
    }
    
    if (dateTo) {
      query = query.lte('start_date', dateTo);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: treatments, error, count } = await query;

    if (error) {
      console.error('Error fetching treatments:', error);
      return NextResponse.json({ error: 'Failed to fetch treatments' }, { status: 500 });
    }

    return NextResponse.json({
      treatments: treatments || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Error in GET /api/treatments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/treatments - Create new treatment
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has permission to create treatments
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['admin', 'doctor'].includes(profile.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    
    // Validate input data
    const validatedData = treatmentSchema.parse(body);

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

    // Check if diagnosis exists (if provided)
    if (validatedData.diagnosis_id) {
      const { data: diagnosis } = await supabase
        .from('diagnoses')
        .select('id')
        .eq('id', validatedData.diagnosis_id)
        .single();

      if (!diagnosis) {
        return NextResponse.json({ error: 'Diagnosis not found' }, { status: 400 });
      }
    }

    // Validate date range
    if (validatedData.end_date && new Date(validatedData.end_date) <= new Date(validatedData.start_date)) {
      return NextResponse.json({ 
        error: 'End date must be after start date' 
      }, { status: 400 });
    }

    // Create treatment
    const { data: newTreatment, error } = await supabase
      .from('treatments')
      .insert({
        ...validatedData,
        created_by: user.id,
        status: validatedData.status || 'planned'
      })
      .select(`
        *,
        patient:patients!treatments_patient_id_fkey(
          id,
          patient_id,
          first_name,
          last_name,
          phone
        ),
        doctor:doctors!treatments_doctor_id_fkey(
          id,
          name,
          specialty
        ),
        diagnosis:diagnoses!treatments_diagnosis_id_fkey(
          id,
          diagnosis,
          symptoms
        )
      `)
      .single();

    if (error) {
      console.error('Error creating treatment:', error);
      return NextResponse.json({ error: 'Failed to create treatment' }, { status: 500 });
    }

    return NextResponse.json(newTreatment, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.errors 
      }, { status: 400 });
    }
    
    console.error('Error in POST /api/treatments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
