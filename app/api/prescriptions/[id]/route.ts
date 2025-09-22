import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Validation schema for prescription updates
const prescriptionUpdateSchema = z.object({
  quantity: z.number().min(1, 'Quantity must be at least 1').optional(),
  dosage: z.string().min(1, 'Dosage is required').max(100, 'Dosage must be less than 100 characters').optional(),
  frequency: z.string().min(1, 'Frequency is required').max(100, 'Frequency must be less than 100 characters').optional(),
  duration: z.string().min(1, 'Duration is required').max(100, 'Duration must be less than 100 characters').optional(),
  instructions: z.string().max(1000, 'Instructions must be less than 1000 characters').optional(),
  start_date: z.string().date('Invalid start date format').optional(),
  end_date: z.string().date('Invalid end date format').optional(),
  refills_allowed: z.number().min(0, 'Refills cannot be negative').optional(),
  refills_remaining: z.number().min(0, 'Refills remaining cannot be negative').optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
  status: z.enum(['pending', 'approved', 'fulfilled', 'cancelled', 'expired']).optional()
});

// GET /api/prescriptions/[id] - Get prescription by ID
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

    // Get prescription with related data
    const { data: prescription, error } = await supabase
      .from('prescriptions')
      .select(`
        *,
        patient:patients!prescriptions_patient_id_fkey(
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
        doctor:doctors!prescriptions_doctor_id_fkey(
          id,
          name,
          specialty,
          phone,
          email
        ),
        drug:drugs!prescriptions_drug_id_fkey(
          id,
          name,
          generic_name,
          strength,
          unit,
          dosage_form,
          requires_prescription,
          controlled_substance,
          stock,
          price
        ),
        diagnosis:diagnoses!prescriptions_diagnosis_id_fkey(
          id,
          diagnosis,
          symptoms,
          confidence_level
        ),
        created_by_user:user_profiles!prescriptions_created_by_fkey(
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
        return NextResponse.json({ error: 'Prescription not found' }, { status: 404 });
      }
      console.error('Error fetching prescription:', error);
      return NextResponse.json({ error: 'Failed to fetch prescription' }, { status: 500 });
    }

    return NextResponse.json(prescription);

  } catch (error) {
    console.error('Error in GET /api/prescriptions/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/prescriptions/[id] - Update prescription
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

    // Check if user has permission to update prescriptions
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['admin', 'doctor', 'pharmacist'].includes(profile.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { id } = params;
    const body = await request.json();
    
    // Validate input data
    const validatedData = prescriptionUpdateSchema.parse(body);

    // Check if prescription exists
    const { data: existingPrescription } = await supabase
      .from('prescriptions')
      .select('id, doctor_id, status, drug_id, quantity')
      .eq('id', id)
      .single();

    if (!existingPrescription) {
      return NextResponse.json({ error: 'Prescription not found' }, { status: 404 });
    }

    // Check if the user is the prescribing doctor (for doctors)
    if (profile.role === 'doctor' && existingPrescription.doctor_id !== user.id) {
      return NextResponse.json({ 
        error: 'You can only update your own prescriptions' 
      }, { status: 403 });
    }

    // Check if prescription can be modified
    if (existingPrescription.status === 'fulfilled' || existingPrescription.status === 'cancelled') {
      return NextResponse.json({ 
        error: 'Cannot modify fulfilled or cancelled prescriptions' 
      }, { status: 400 });
    }

    // If updating quantity, check drug stock
    if (validatedData.quantity) {
      const { data: drug } = await supabase
        .from('drugs')
        .select('stock')
        .eq('id', existingPrescription.drug_id)
        .single();

      if (drug && drug.stock < validatedData.quantity) {
        return NextResponse.json({ 
          error: `Insufficient stock. Available: ${drug.stock}, Required: ${validatedData.quantity}` 
        }, { status: 400 });
      }
    }

    // Validate date range
    if (validatedData.end_date && validatedData.start_date && 
        new Date(validatedData.end_date) <= new Date(validatedData.start_date)) {
      return NextResponse.json({ 
        error: 'End date must be after start date' 
      }, { status: 400 });
    }

    // Update prescription
    const { data: updatedPrescription, error } = await supabase
      .from('prescriptions')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        patient:patients!prescriptions_patient_id_fkey(
          id,
          patient_id,
          first_name,
          last_name,
          phone
        ),
        doctor:doctors!prescriptions_doctor_id_fkey(
          id,
          name,
          specialty
        ),
        drug:drugs!prescriptions_drug_id_fkey(
          id,
          name,
          generic_name,
          strength,
          unit,
          dosage_form
        ),
        diagnosis:diagnoses!prescriptions_diagnosis_id_fkey(
          id,
          diagnosis,
          symptoms
        )
      `)
      .single();

    if (error) {
      console.error('Error updating prescription:', error);
      return NextResponse.json({ error: 'Failed to update prescription' }, { status: 500 });
    }

    return NextResponse.json(updatedPrescription);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.errors 
      }, { status: 400 });
    }
    
    console.error('Error in PUT /api/prescriptions/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/prescriptions/[id] - Cancel prescription
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

    // Check if user has permission to cancel prescriptions
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['admin', 'doctor', 'pharmacist'].includes(profile.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { id } = params;

    // Check if prescription exists
    const { data: existingPrescription } = await supabase
      .from('prescriptions')
      .select('id, doctor_id, status')
      .eq('id', id)
      .single();

    if (!existingPrescription) {
      return NextResponse.json({ error: 'Prescription not found' }, { status: 404 });
    }

    // Check if the user is the prescribing doctor (for doctors)
    if (profile.role === 'doctor' && existingPrescription.doctor_id !== user.id) {
      return NextResponse.json({ 
        error: 'You can only cancel your own prescriptions' 
      }, { status: 403 });
    }

    // Check if prescription can be cancelled
    if (existingPrescription.status === 'fulfilled' || existingPrescription.status === 'cancelled') {
      return NextResponse.json({ 
        error: 'Cannot cancel fulfilled or already cancelled prescriptions' 
      }, { status: 400 });
    }

    // Cancel prescription
    const { data: cancelledPrescription, error } = await supabase
      .from('prescriptions')
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
      console.error('Error cancelling prescription:', error);
      return NextResponse.json({ error: 'Failed to cancel prescription' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Prescription cancelled successfully',
      prescription: cancelledPrescription
    });

  } catch (error) {
    console.error('Error in DELETE /api/prescriptions/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
