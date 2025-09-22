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
  type ApiResponse
} from '@/lib/api/middleware';
import { logger } from '@/lib/utils/logger';

// Validation schema for patient data
const patientSchema = z.object({
  patient_id: z.string().min(1, 'Patient ID is required'),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  date_of_birth: z.string().date('Invalid date of birth format'),
  gender: z.enum(['male', 'female', 'other']),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  email: z.string().email('Invalid email format').optional(),
  address: z.string().max(500, 'Address must be less than 500 characters').optional(),
  emergency_contact: z.string().max(100, 'Emergency contact must be less than 100 characters').optional(),
  blood_type: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional(),
  medical_history: z.array(z.string()).max(50, 'Maximum 50 medical history items allowed').optional(),
  allergies: z.array(z.string()).max(50, 'Maximum 50 allergies allowed').optional(),
  chronic_conditions: z.array(z.string()).max(50, 'Maximum 50 chronic conditions allowed').optional()
});

// GET /api/patients - List all patients with pagination and filters
export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    // Authentication
    const authResult = await withAuth(request, ['admin', 'doctor', 'nurse', 'receptionist']);
    if (authResult instanceof NextResponse) return authResult;
    const { user, profile } = authResult;

    logger.logApiRequest('GET', '/api/patients', user.id);

    const supabase = createClient();
    const { page, limit, offset } = getPaginationParams(request);
    const { search, sortBy, sortOrder } = getSearchParams(request);

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const gender = searchParams.get('gender');
    const bloodType = searchParams.get('blood_type');
    const status = searchParams.get('status');

    // Build query
    let query = supabase
      .from('patients')
      .select(`
        *,
        created_by_user:user_profiles!patients_created_by_fkey(
          id,
          first_name,
          last_name,
          role
        )
      `, { count: 'exact' })
      .order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply filters
    if (gender) query = query.eq('gender', gender);
    if (bloodType) query = query.eq('blood_type', bloodType);
    if (status) query = query.eq('status', status);
    
    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,patient_id.ilike.%${search}%,phone.ilike.%${search}%`);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: patients, error, count } = await query;

    if (error) {
      logger.logApiError('GET', '/api/patients', error, user.id);
      return createErrorResponse('Failed to fetch patients', 500);
    }

    logger.info('Patients fetched successfully', {
      userId: user.id,
      action: 'patients_fetch',
      metadata: { count: patients?.length || 0 }
    });

    return createSuccessResponse({
      patients: patients || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    logger.error('Error in GET /api/patients', undefined, error as Error);
    return createErrorResponse('Internal server error', 500);
  }
}

// POST /api/patients - Create new patient
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    // Authentication
    const authResult = await withAuth(request, ['admin', 'doctor', 'nurse', 'receptionist']);
    if (authResult instanceof NextResponse) return authResult;
    const { user, profile } = authResult;

    logger.logApiRequest('POST', '/api/patients', user.id);

    // Validation
    const validationResult = await withValidation(patientSchema)(request);
    if (validationResult instanceof NextResponse) return validationResult;
    const validatedData = validationResult;

    const supabase = createClient();

    // Check if patient ID already exists
    const { data: existingPatient } = await supabase
      .from('patients')
      .select('id')
      .eq('patient_id', validatedData.patient_id)
      .single();

    if (existingPatient) {
      return createErrorResponse('Patient ID already exists', 400);
    }

    // Create patient
    const { data: newPatient, error } = await supabase
      .from('patients')
      .insert({
        ...validatedData,
        created_by: user.id,
        status: 'active'
      })
      .select(`
        *,
        created_by_user:user_profiles!patients_created_by_fkey(
          id,
          first_name,
          last_name,
          role
        )
      `)
      .single();

    if (error) {
      logger.logApiError('POST', '/api/patients', error, user.id);
      return createErrorResponse('Failed to create patient', 500);
    }

    logger.logUserAction('patient_created', user.id, 'patient', {
      patientId: newPatient.id,
      patientName: `${newPatient.first_name} ${newPatient.last_name}`
    });

    return createSuccessResponse(newPatient, 'Patient created successfully', 201);

  } catch (error) {
    logger.error('Error in POST /api/patients', undefined, error as Error);
    return createErrorResponse('Internal server error', 500);
  }
}
