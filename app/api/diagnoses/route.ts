import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Validation schema for diagnosis data
const diagnosisSchema = z.object({
  patient_id: z.string().uuid('Invalid patient ID format'),
  doctor_id: z.string().uuid('Invalid doctor ID format'),
  symptoms: z.array(z.string()).min(1, 'At least one symptom is required'),
  diagnosis: z.string().min(1, 'Diagnosis is required').max(500, 'Diagnosis must be less than 500 characters'),
  confidence_level: z.number().min(0).max(100, 'Confidence level must be between 0 and 100'),
  expert_system_result: z.string().optional(),
  requires_xray: z.boolean().optional(),
  requires_lab_tests: z.boolean().optional(),
  doctor_notes: z.string().max(1000, 'Doctor notes must be less than 1000 characters').optional(),
  status: z.enum(['pending', 'confirmed', 'ruled_out', 'under_investigation']).optional(),
  severity: z.enum(['mild', 'moderate', 'severe', 'critical']).optional(),
  follow_up_required: z.boolean().optional(),
  follow_up_date: z.string().datetime('Invalid follow-up date format').optional()
});

// GET /api/diagnoses - List all diagnoses with pagination and filters
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
    const severity = searchParams.get('severity') || '';
    const dateFrom = searchParams.get('date_from') || '';
    const dateTo = searchParams.get('date_to') || '';
    
    const offset = (page - 1) * limit;

    // Build query with joins
    let query = supabase
      .from('diagnoses')
      .select(`
        *,
        patient:patients!diagnoses_patient_id_fkey(
          id,
          patient_id,
          first_name,
          last_name,
          phone,
          date_of_birth,
          gender
        ),
        doctor:doctors!diagnoses_doctor_id_fkey(
          id,
          name,
          specialty,
          phone
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
    
    if (severity) {
      query = query.eq('severity', severity);
    }
    
    if (dateFrom) {
      query = query.gte('created_at', dateFrom);
    }
    
    if (dateTo) {
      query = query.lte('created_at', dateTo);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: diagnoses, error, count } = await query;

    if (error) {
      console.error('Error fetching diagnoses:', error);
      return NextResponse.json({ error: 'Failed to fetch diagnoses' }, { status: 500 });
    }

    return NextResponse.json({
      diagnoses: diagnoses || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Error in GET /api/diagnoses:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/diagnoses - Create new diagnosis
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has permission to create diagnoses
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
    const validatedData = diagnosisSchema.parse(body);

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

    // Create diagnosis
    const { data: newDiagnosis, error } = await supabase
      .from('diagnoses')
      .insert({
        ...validatedData,
        created_by: user.id,
        status: validatedData.status || 'pending'
      })
      .select(`
        *,
        patient:patients!diagnoses_patient_id_fkey(
          id,
          patient_id,
          first_name,
          last_name,
          phone
        ),
        doctor:doctors!diagnoses_doctor_id_fkey(
          id,
          name,
          specialty
        )
      `)
      .single();

    if (error) {
      console.error('Error creating diagnosis:', error);
      return NextResponse.json({ error: 'Failed to create diagnosis' }, { status: 500 });
    }

    return NextResponse.json(newDiagnosis, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.errors 
      }, { status: 400 });
    }
    
    console.error('Error in POST /api/diagnoses:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
