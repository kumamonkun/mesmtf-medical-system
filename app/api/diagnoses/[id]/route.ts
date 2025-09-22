import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Validation schema for diagnosis updates
const diagnosisUpdateSchema = z.object({
  symptoms: z.array(z.string()).min(1, 'At least one symptom is required').optional(),
  diagnosis: z.string().min(1, 'Diagnosis is required').max(500, 'Diagnosis must be less than 500 characters').optional(),
  confidence_level: z.number().min(0).max(100, 'Confidence level must be between 0 and 100').optional(),
  expert_system_result: z.string().optional(),
  requires_xray: z.boolean().optional(),
  requires_lab_tests: z.boolean().optional(),
  doctor_notes: z.string().max(1000, 'Doctor notes must be less than 1000 characters').optional(),
  status: z.enum(['pending', 'confirmed', 'ruled_out', 'under_investigation']).optional(),
  severity: z.enum(['mild', 'moderate', 'severe', 'critical']).optional(),
  follow_up_required: z.boolean().optional(),
  follow_up_date: z.string().datetime('Invalid follow-up date format').optional()
});

// GET /api/diagnoses/[id] - Get diagnosis by ID
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

    // Get diagnosis with related data
    const { data: diagnosis, error } = await supabase
      .from('diagnoses')
      .select(`
        *,
        patient:patients!diagnoses_patient_id_fkey(
          id,
          patient_id,
          first_name,
          last_name,
          phone,
          email,
          date_of_birth,
          gender,
          medical_history,
          allergies,
          chronic_conditions
        ),
        doctor:doctors!diagnoses_doctor_id_fkey(
          id,
          name,
          specialty,
          phone,
          email
        ),
        created_by_user:user_profiles!diagnoses_created_by_fkey(
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
        return NextResponse.json({ error: 'Diagnosis not found' }, { status: 404 });
      }
      console.error('Error fetching diagnosis:', error);
      return NextResponse.json({ error: 'Failed to fetch diagnosis' }, { status: 500 });
    }

    return NextResponse.json(diagnosis);

  } catch (error) {
    console.error('Error in GET /api/diagnoses/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/diagnoses/[id] - Update diagnosis
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

    // Check if user has permission to update diagnoses
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['admin', 'doctor'].includes(profile.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { id } = params;
    const body = await request.json();
    
    // Validate input data
    const validatedData = diagnosisUpdateSchema.parse(body);

    // Check if diagnosis exists
    const { data: existingDiagnosis } = await supabase
      .from('diagnoses')
      .select('id, doctor_id, status')
      .eq('id', id)
      .single();

    if (!existingDiagnosis) {
      return NextResponse.json({ error: 'Diagnosis not found' }, { status: 404 });
    }

    // Check if the user is the assigned doctor (for doctors)
    if (profile.role === 'doctor' && existingDiagnosis.doctor_id !== user.id) {
      return NextResponse.json({ 
        error: 'You can only update your own diagnoses' 
      }, { status: 403 });
    }

    // Update diagnosis
    const { data: updatedDiagnosis, error } = await supabase
      .from('diagnoses')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
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
      console.error('Error updating diagnosis:', error);
      return NextResponse.json({ error: 'Failed to update diagnosis' }, { status: 500 });
    }

    return NextResponse.json(updatedDiagnosis);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.errors 
      }, { status: 400 });
    }
    
    console.error('Error in PUT /api/diagnoses/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/diagnoses/[id] - Delete diagnosis
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

    // Check if user has permission to delete diagnoses
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { id } = params;

    // Check if diagnosis exists
    const { data: existingDiagnosis } = await supabase
      .from('diagnoses')
      .select('id, status')
      .eq('id', id)
      .single();

    if (!existingDiagnosis) {
      return NextResponse.json({ error: 'Diagnosis not found' }, { status: 404 });
    }

    // Check if diagnosis can be deleted (not confirmed)
    if (existingDiagnosis.status === 'confirmed') {
      return NextResponse.json({ 
        error: 'Cannot delete confirmed diagnoses. Please update status instead.' 
      }, { status: 400 });
    }

    // Delete diagnosis
    const { error } = await supabase
      .from('diagnoses')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting diagnosis:', error);
      return NextResponse.json({ error: 'Failed to delete diagnosis' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Diagnosis deleted successfully' });

  } catch (error) {
    console.error('Error in DELETE /api/diagnoses/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
