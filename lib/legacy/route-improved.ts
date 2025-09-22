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

// Validation schemas
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
export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    // Authentication
    const authResult = await withAuth(request, ['admin', 'doctor', 'nurse', 'receptionist']);
    if (authResult instanceof NextResponse) return authResult;
    const { user, profile } = authResult;

    logger.logApiRequest('GET', '/api/medical-records', user.id);

    const supabase = createClient();
    const { page, limit, offset } = getPaginationParams(request);
    const { search, sortBy, sortOrder } = getSearchParams(request);

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get('patient_id');
    const recordType = searchParams.get('record_type');
    const doctorId = searchParams.get('doctor_id');
    const department = searchParams.get('department');
    const priority = searchParams.get('priority');
    const status = searchParams.get('status');
    const dateFrom = searchParams.get('date_from');
    const dateTo = searchParams.get('date_to');

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
      .order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply filters
    if (patientId) query = query.eq('patient_id', patientId);
    if (recordType) query = query.eq('record_type', recordType);
    if (doctorId) query = query.eq('doctor_id', doctorId);
    if (department) query = query.eq('department', department);
    if (priority) query = query.eq('priority', priority);
    if (status) query = query.eq('status', status);
    if (dateFrom) query = query.gte('visit_date', dateFrom);
    if (dateTo) query = query.lte('visit_date', dateTo);
    
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,content.ilike.%${search}%`);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: medicalRecords, error, count } = await query;

    if (error) {
      logger.logApiError('GET', '/api/medical-records', error, user.id);
      return createErrorResponse('Failed to fetch medical records', 500);
    }

    logger.info('Medical records fetched successfully', {
      userId: user.id,
      action: 'medical_records_fetch',
      metadata: { count: medicalRecords?.length || 0 }
    });

    return createSuccessResponse({
      medicalRecords: medicalRecords || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    logger.error('Error in GET /api/medical-records', undefined, error as Error);
    return createErrorResponse('Internal server error', 500);
  }
}

// POST /api/medical-records - Create new medical record
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    // Authentication
    const authResult = await withAuth(request, ['admin', 'doctor', 'nurse', 'receptionist']);
    if (authResult instanceof NextResponse) return authResult;
    const { user, profile } = authResult;

    logger.logApiRequest('POST', '/api/medical-records', user.id);

    // Validation
    const validationResult = await withValidation(medicalRecordSchema)(request);
    if (validationResult instanceof NextResponse) return validationResult;
    const validatedData = validationResult;

    const supabase = createClient();

    // Check if patient exists
    const patientExists = await checkEntityExists('patients', validatedData.patient_id);
    if (!patientExists) {
      return createErrorResponse('Patient not found', 400);
    }

    // Check if doctor exists (if provided)
    if (validatedData.doctor_id) {
      const doctorExists = await checkEntityExists('doctors', validatedData.doctor_id);
      if (!doctorExists) {
        return createErrorResponse('Doctor not found', 400);
      }
    }

    // Check if diagnosis exists (if provided)
    if (validatedData.diagnosis_id) {
      const diagnosisExists = await checkEntityExists('diagnoses', validatedData.diagnosis_id);
      if (!diagnosisExists) {
        return createErrorResponse('Diagnosis not found', 400);
      }
    }

    // Check if treatment exists (if provided)
    if (validatedData.treatment_id) {
      const treatmentExists = await checkEntityExists('treatments', validatedData.treatment_id);
      if (!treatmentExists) {
        return createErrorResponse('Treatment not found', 400);
      }
    }

    // Check if prescription exists (if provided)
    if (validatedData.prescription_id) {
      const prescriptionExists = await checkEntityExists('prescriptions', validatedData.prescription_id);
      if (!prescriptionExists) {
        return createErrorResponse('Prescription not found', 400);
      }
    }

    // Validate follow-up date
    if (validatedData.follow_up_date && new Date(validatedData.follow_up_date) <= new Date(validatedData.visit_date)) {
      return createErrorResponse('Follow-up date must be after visit date', 400);
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
      logger.logApiError('POST', '/api/medical-records', error, user.id);
      return createErrorResponse('Failed to create medical record', 500);
    }

    logger.logMedicalRecordAccess(newMedicalRecord.id, user.id, 'create');

    return createSuccessResponse(newMedicalRecord, 'Medical record created successfully', 201);

  } catch (error) {
    logger.error('Error in POST /api/medical-records', undefined, error as Error);
    return createErrorResponse('Internal server error', 500);
  }
}
