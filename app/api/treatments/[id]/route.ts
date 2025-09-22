import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Validation schema for treatment updates
const treatmentUpdateSchema = z.object({
  treatment_name: z.string().min(1, 'Treatment name is required').max(200, 'Treatment name must be less than 200 characters').optional(),
  description: z.string().min(1, 'Description is required').max(1000, 'Description must be less than 1000 characters').optional(),
  treatment_type: z.enum(['medication', 'therapy', 'surgery', 'lifestyle', 'monitoring', 'other']).optional(),
  dosage: z.string().max(100, 'Dosage must be less than 100 characters').optional(),
  frequency: z.string().max(100, 'Frequency must be less than 100 characters').optional(),
  duration: z.string().max(100, 'Duration must be less than 100 characters').optional(),
  instructions: z.string().max(1000, 'Instructions must be less than 1000 characters').optional(),
  start_date: z.string().date('Invalid start date format').optional(),
  end_date: z.string().date('Invalid end date format').optional(),
  status: z.enum(['planned', 'active', 'completed', 'cancelled', 'paused']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  side_effects: z.string().max(500, 'Side effects must be less than 500 characters').optional(),
  follow_up_required: z.boolean().optional(),
  follow_up_date: z.string().date('Invalid follow-up date format').optional(),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional()
});

// GET /api/treatments/[id] - Get treatment by ID
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

    // Get treatment with related data
    const { data: treatment, error } = await supabase
      .from('treatments')
      .select(`
        *,
        patient:patients!treatments_patient_id_fkey(
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
        doctor:doctors!treatments_doctor_id_fkey(
          id,
          name,
          specialty,
          phone,
          email
        ),
        diagnosis:diagnoses!treatments_diagnosis_id_fkey(
          id,
          diagnosis,
          symptoms,
          confidence_level,
          severity
        ),
        created_by_user:user_profiles!treatments_created_by_fkey(
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
        return NextResponse.json({ error: 'Treatment not found' }, { status: 404 });
      }
      console.error('Error fetching treatment:', error);
      return NextResponse.json({ error: 'Failed to fetch treatment' }, { status: 500 });
    }

    return NextResponse.json(treatment);

  } catch (error) {
    console.error('Error in GET /api/treatments/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/treatments/[id] - Update treatment
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

    // Check if user has permission to update treatments
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['admin', 'doctor', 'nurse'].includes(profile.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { id } = params;
    const body = await request.json();
    
    // Validate input data
    const validatedData = treatmentUpdateSchema.parse(body);

    // Check if treatment exists
    const { data: existingTreatment } = await supabase
      .from('treatments')
      .select('id, doctor_id, status')
      .eq('id', id)
      .single();

    if (!existingTreatment) {
      return NextResponse.json({ error: 'Treatment not found' }, { status: 404 });
    }

    // Check if the user is the assigned doctor (for doctors)
    if (profile.role === 'doctor' && existingTreatment.doctor_id !== user.id) {
      return NextResponse.json({ 
        error: 'You can only update your own treatments' 
      }, { status: 403 });
    }

    // Validate date range if both dates are provided
    if (validatedData.end_date && validatedData.start_date) {
      if (new Date(validatedData.end_date) <= new Date(validatedData.start_date)) {
        return NextResponse.json({ 
          error: 'End date must be after start date' 
        }, { status: 400 });
      }
    }

    // Update treatment
    const { data: updatedTreatment, error } = await supabase
      .from('treatments')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
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
      console.error('Error updating treatment:', error);
      return NextResponse.json({ error: 'Failed to update treatment' }, { status: 500 });
    }

    return NextResponse.json(updatedTreatment);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.errors 
      }, { status: 400 });
    }
    
    console.error('Error in PUT /api/treatments/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/treatments/[id] - Cancel treatment
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

    // Check if user has permission to cancel treatments
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['admin', 'doctor'].includes(profile.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { id } = params;

    // Check if treatment exists
    const { data: existingTreatment } = await supabase
      .from('treatments')
      .select('id, doctor_id, status')
      .eq('id', id)
      .single();

    if (!existingTreatment) {
      return NextResponse.json({ error: 'Treatment not found' }, { status: 404 });
    }

    // Check if the user is the assigned doctor (for doctors)
    if (profile.role === 'doctor' && existingTreatment.doctor_id !== user.id) {
      return NextResponse.json({ 
        error: 'You can only cancel your own treatments' 
      }, { status: 403 });
    }

    // Check if treatment can be cancelled
    if (existingTreatment.status === 'completed') {
      return NextResponse.json({ 
        error: 'Cannot cancel completed treatments' 
      }, { status: 400 });
    }

    // Cancel treatment
    const { data: cancelledTreatment, error } = await supabase
      .from('treatments')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancelled_by: user.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error cancelling treatment:', error);
      return NextResponse.json({ error: 'Failed to cancel treatment' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Treatment cancelled successfully',
      treatment: cancelledTreatment
    });

  } catch (error) {
    console.error('Error in DELETE /api/treatments/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
