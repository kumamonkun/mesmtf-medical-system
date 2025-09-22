import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Validation schema for patient updates
const patientUpdateSchema = z.object({
  first_name: z.string().min(1, 'First name is required').optional(),
  last_name: z.string().min(1, 'Last name is required').optional(),
  date_of_birth: z.string().date('Invalid date format').optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').optional(),
  email: z.string().email('Invalid email format').optional(),
  address: z.string().min(1, 'Address is required').optional(),
  emergency_contact_name: z.string().min(1, 'Emergency contact name is required').optional(),
  emergency_contact_phone: z.string().min(10, 'Emergency contact phone must be at least 10 digits').optional(),
  medical_history: z.string().optional(),
  allergies: z.string().optional(),
  blood_type: z.string().optional(),
  chronic_conditions: z.string().optional(),
  status: z.enum(['active', 'inactive', 'critical']).optional(),
});

// GET /api/patients/[id] - Get patient by ID
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

    // Get patient with related data
    const { data: patient, error } = await supabase
      .from('patients')
      .select(`
        *,
        created_by_user:user_profiles!patients_created_by_fkey(
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
        return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
      }
      console.error('Error fetching patient:', error);
      return NextResponse.json({ error: 'Failed to fetch patient' }, { status: 500 });
    }

    return NextResponse.json(patient);

  } catch (error) {
    console.error('Error in GET /api/patients/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/patients/[id] - Update patient
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

    // Check if user has permission to update patients
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
    const validatedData = patientUpdateSchema.parse(body);

    // Check if patient exists
    const { data: existingPatient } = await supabase
      .from('patients')
      .select('id')
      .eq('id', id)
      .single();

    if (!existingPatient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    // Update patient
    const { data: updatedPatient, error } = await supabase
      .from('patients')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating patient:', error);
      return NextResponse.json({ error: 'Failed to update patient' }, { status: 500 });
    }

    return NextResponse.json(updatedPatient);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.errors 
      }, { status: 400 });
    }
    
    console.error('Error in PUT /api/patients/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/patients/[id] - Delete patient
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

    // Check if user has permission to delete patients (admin only)
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { id } = params;

    // Check if patient exists
    const { data: existingPatient } = await supabase
      .from('patients')
      .select('id')
      .eq('id', id)
      .single();

    if (!existingPatient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    // Check if patient has related records (appointments, diagnoses, etc.)
    const { data: relatedRecords } = await supabase
      .from('appointments')
      .select('id')
      .eq('patient_id', id)
      .limit(1);

    if (relatedRecords && relatedRecords.length > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete patient with existing appointments. Please deactivate instead.' 
      }, { status: 400 });
    }

    // Delete patient
    const { error } = await supabase
      .from('patients')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting patient:', error);
      return NextResponse.json({ error: 'Failed to delete patient' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Patient deleted successfully' });

  } catch (error) {
    console.error('Error in DELETE /api/patients/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
