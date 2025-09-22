import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { 
  withAuth, 
  withValidation, 
  createSuccessResponse, 
  createErrorResponse,
  getPaginationParams,
  getSearchParams,
  checkEntityExists,
  type ApiResponse
} from '@/lib/api/middleware';
import { logger } from '@/lib/utils/logger';

// Validation schema for medical record data
const medicalRecordSchema = z.object({
  patient_id: z.string().uuid('Invalid patient ID format'),
  record_type: z.enum(['consultation', 'diagnosis', 'treatment', 'lab_result', 'imaging', 'prescription', 'vaccination', 'surgery', 'emergency', 'follow_up', 'other']),
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().min(1, 'Description is required').max(2000, 'Description must be less than 2000 characters'),
  content: z.string().max(10000, 'Content must be less than 10000 characters').optional(),
  diagnosis_id: z.string().uuid('Invalid diagnosis ID format').optional(),
  treatment_id: z.string().uuid('Invalid treatment ID format').optional(),
  prescription_id: z.string().uuid('Invalid prescription ID format').optional(),
  visit_date: z.string().date('Invalid visit date format'),
  doctor_id: z.string().uuid('Invalid doctor ID format').optional(),
  department: z.string().max(100, 'Department must be less than 100 characters').optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  status: z.enum(['draft', 'active', 'archived', 'deleted']).optional(),
  tags: z.array(z.string()).max(20, 'Maximum 20 tags allowed').optional(),
  attachments: z.array(z.string()).max(10, 'Maximum 10 attachments allowed').optional(),
  follow_up_required: z.boolean().optional(),
  follow_up_date: z.string().date('Invalid follow-up date format').optional(),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
  confidential: z.boolean().optional()
});

// GET /api/medical-records - List all medical records with pagination and filters
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
    const patientId = searchParams.get('patient_id') || '';
    const recordType = searchParams.get('record_type') || '';
    const doctorId = searchParams.get('doctor_id') || '';
    const department = searchParams.get('department') || '';
    const priority = searchParams.get('priority') || '';
    const status = searchParams.get('status') || '';
    const dateFrom = searchParams.get('date_from') || '';
    const dateTo = searchParams.get('date_to') || '';
    const search = searchParams.get('search') || '';
    const tags = searchParams.get('tags') || '';
    const confidential = searchParams.get('confidential');
    
    const offset = (page - 1) * limit;

    // Build query with joins
    let query = supabase
      .from('medical_records')
      .select(`
        *,
        patient:patients!medical_records_patient_id_fkey(
          id,
          patient_id,
          first_name,
          last_name,
          phone,
          date_of_birth,
          gender
        ),
        doctor:doctors!medical_records_doctor_id_fkey(
          id,
          name,
          specialty,
          phone
        ),
        diagnosis:diagnoses!medical_records_diagnosis_id_fkey(
          id,
          diagnosis,
          symptoms
        ),
        treatment:treatments!medical_records_treatment_id_fkey(
          id,
          treatment_name,
          description
        ),
        prescription:prescriptions!medical_records_prescription_id_fkey(
          id,
          dosage,
          frequency,
          instructions
        ),
        created_by_user:user_profiles!medical_records_created_by_fkey(
          id,
          first_name,
          last_name,
          role
        )
      `, { count: 'exact' })
      .order('visit_date', { ascending: false });

    // Apply filters
    if (patientId) {
      query = query.eq('patient_id', patientId);
    }
    
    if (recordType) {
      query = query.eq('record_type', recordType);
    }
    
    if (doctorId) {
      query = query.eq('doctor_id', doctorId);
    }
    
    if (department) {
      query = query.eq('department', department);
    }
    
    if (priority) {
      query = query.eq('priority', priority);
    }
    
    if (status) {
      query = query.eq('status', status);
    }
    
    if (dateFrom) {
      query = query.gte('visit_date', dateFrom);
    }
    
    if (dateTo) {
      query = query.lte('visit_date', dateTo);
    }
    
    if (search) {
      query = query.or(`
        title.ilike.%${search}%,
        description.ilike.%${search}%,
        content.ilike.%${search}%
      `);
    }
    
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      query = query.overlaps('tags', tagArray);
    }
    
    if (confidential !== null && confidential !== undefined) {
      query = query.eq('confidential', confidential === 'true');
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: medicalRecords, error, count } = await query;

    if (error) {
      console.error('Error fetching medical records:', error);
      return NextResponse.json({ error: 'Failed to fetch medical records' }, { status: 500 });
    }

    return NextResponse.json({
      medical_records: medicalRecords || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Error in GET /api/medical-records:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/medical-records - Create new medical record
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has permission to create medical records
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
    const validatedData = medicalRecordSchema.parse(body);

    // Check if patient exists
    const { data: patient } = await supabase
      .from('patients')
      .select('id')
      .eq('id', validatedData.patient_id)
      .single();

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 400 });
    }

    // Check if doctor exists (if provided)
    if (validatedData.doctor_id) {
      const { data: doctor } = await supabase
        .from('doctors')
        .select('id')
        .eq('id', validatedData.doctor_id)
        .single();

      if (!doctor) {
        return NextResponse.json({ error: 'Doctor not found' }, { status: 400 });
      }
    }

    // Check if diagnosis exists (if provided)
    if (validatedData.diagnosis_id) {
      const { data: diagnosis } = await supabase
        .from('diagnoses')
        .select('id, patient_id')
        .eq('id', validatedData.diagnosis_id)
        .single();

      if (!diagnosis) {
        return NextResponse.json({ error: 'Diagnosis not found' }, { status: 400 });
      }

      // Verify diagnosis belongs to the patient
      if (diagnosis.patient_id !== validatedData.patient_id) {
        return NextResponse.json({ 
          error: 'Diagnosis does not belong to the specified patient' 
        }, { status: 400 });
      }
    }

    // Check if treatment exists (if provided)
    if (validatedData.treatment_id) {
      const { data: treatment } = await supabase
        .from('treatments')
        .select('id, patient_id')
        .eq('id', validatedData.treatment_id)
        .single();

      if (!treatment) {
        return NextResponse.json({ error: 'Treatment not found' }, { status: 400 });
      }

      // Verify treatment belongs to the patient
      if (treatment.patient_id !== validatedData.patient_id) {
        return NextResponse.json({ 
          error: 'Treatment does not belong to the specified patient' 
        }, { status: 400 });
      }
    }

    // Check if prescription exists (if provided)
    if (validatedData.prescription_id) {
      const { data: prescription } = await supabase
        .from('prescriptions')
        .select('id, patient_id')
        .eq('id', validatedData.prescription_id)
        .single();

      if (!prescription) {
        return NextResponse.json({ error: 'Prescription not found' }, { status: 400 });
      }

      // Verify prescription belongs to the patient
      if (prescription.patient_id !== validatedData.patient_id) {
        return NextResponse.json({ 
          error: 'Prescription does not belong to the specified patient' 
        }, { status: 400 });
      }
    }

    // Validate follow-up date
    if (validatedData.follow_up_date && new Date(validatedData.follow_up_date) <= new Date(validatedData.visit_date)) {
      return NextResponse.json({ 
        error: 'Follow-up date must be after visit date' 
      }, { status: 400 });
    }

    // Create medical record
    const { data: newMedicalRecord, error } = await supabase
      .from('medical_records')
      .insert({
        ...validatedData,
        created_by: user.id,
        status: validatedData.status || 'active'
      })
      .select(`
        *,
        patient:patients!medical_records_patient_id_fkey(
          id,
          patient_id,
          first_name,
          last_name,
          phone
        ),
        doctor:doctors!medical_records_doctor_id_fkey(
          id,
          name,
          specialty
        ),
        diagnosis:diagnoses!medical_records_diagnosis_id_fkey(
          id,
          diagnosis,
          symptoms
        ),
        treatment:treatments!medical_records_treatment_id_fkey(
          id,
          treatment_name,
          description
        ),
        prescription:prescriptions!medical_records_prescription_id_fkey(
          id,
          dosage,
          frequency,
          instructions
        )
      `)
      .single();

    if (error) {
      console.error('Error creating medical record:', error);
      return NextResponse.json({ error: 'Failed to create medical record' }, { status: 500 });
    }

    return NextResponse.json(newMedicalRecord, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.errors 
      }, { status: 400 });
    }
    
    console.error('Error in POST /api/medical-records:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
  