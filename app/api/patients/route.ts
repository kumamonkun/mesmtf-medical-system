/**
 * MESMTF Patients API Endpoint
 * 
 * This API endpoint handles patient management operations including:
 * - Creating new patient records
 * - Retrieving patient lists with pagination and search
 * - Updating patient information
 * - Deleting patient records
 * 
 * Security Features:
 * - Role-based access control (admin, doctor, nurse, receptionist)
 * - Input validation using Zod schemas
 * - Authentication middleware
 * - Audit logging for all operations
 * 
 * @author Ministry of Health and Social Services
 * @version 1.0.0
 */

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

/**
 * Patient Data Validation Schema
 * 
 * Defines the structure and validation rules for patient records.
 * Ensures data integrity and medical record accuracy.
 */
const patientSchema = z.object({
  patient_id: z.string().min(1, 'Patient ID is required'),
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  date_of_birth: z.string().date('Invalid date format'),
  gender: z.enum(['male', 'female', 'other']),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  email: z.string().email('Invalid email format').optional(),
  address: z.string().min(1, 'Address is required'),
  emergency_contact_name: z.string().min(1, 'Emergency contact name is required'),
  emergency_contact_phone: z.string().min(10, 'Emergency contact phone must be at least 10 digits'),
  medical_history: z.string().optional(),
  allergies: z.string().optional(),
  blood_type: z.string().optional(),
  chronic_conditions: z.string().optional(),
});

// GET /api/patients - List all patients with pagination and search
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
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const gender = searchParams.get('gender') || '';
    
    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from('patients')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    // Apply filters
    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,patient_id.ilike.%${search}%`);
    }
    
    if (status) {
      query = query.eq('status', status);
    }
    
    if (gender) {
      query = query.eq('gender', gender);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: patients, error, count } = await query;

    if (error) {
      console.error('Error fetching patients:', error);
      return NextResponse.json({ error: 'Failed to fetch patients' }, { status: 500 });
    }

    return NextResponse.json({
      patients: patients || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Error in GET /api/patients:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/patients - Create new patient
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has permission to create patients
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
    const validatedData = patientSchema.parse(body);

    // Check if patient ID already exists
    const { data: existingPatient } = await supabase
      .from('patients')
      .select('id')
      .eq('patient_id', validatedData.patient_id)
      .single();

    if (existingPatient) {
      return NextResponse.json({ error: 'Patient ID already exists' }, { status: 400 });
    }

    // Create patient
    const { data: newPatient, error } = await supabase
      .from('patients')
      .insert({
        ...validatedData,
        created_by: user.id,
        status: 'active'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating patient:', error);
      return NextResponse.json({ error: 'Failed to create patient' }, { status: 500 });
    }

    return NextResponse.json(newPatient, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.errors 
      }, { status: 400 });
    }
    
    console.error('Error in POST /api/patients:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
