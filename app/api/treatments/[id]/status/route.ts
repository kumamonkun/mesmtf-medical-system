import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Validation schema for treatment status updates
const treatmentStatusUpdateSchema = z.object({
  status: z.enum(['planned', 'active', 'completed', 'cancelled', 'paused'], {
    errorMap: () => ({ message: 'Invalid status' })
  }),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
  side_effects: z.string().max(500, 'Side effects must be less than 500 characters').optional(),
  effectiveness_rating: z.number().min(1).max(5, 'Effectiveness rating must be between 1 and 5').optional(),
  completion_date: z.string().date('Invalid completion date format').optional()
});

// PUT /api/treatments/[id]/status - Update treatment status
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

    // Check if user has permission to update treatment status
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
    const validatedData = treatmentStatusUpdateSchema.parse(body);

    // Check if treatment exists
    const { data: existingTreatment } = await supabase
      .from('treatments')
      .select('id, doctor_id, status, start_date, end_date')
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

    // Validate status transitions
    const validTransitions = {
      'planned': ['active', 'cancelled'],
      'active': ['completed', 'paused', 'cancelled'],
      'paused': ['active', 'cancelled'],
      'completed': [], // No transitions from completed
      'cancelled': [] // No transitions from cancelled
    };

    const currentStatus = existingTreatment.status;
    const newStatus = validatedData.status;

    if (!validTransitions[currentStatus as keyof typeof validTransitions]?.includes(newStatus)) {
      return NextResponse.json({ 
        error: `Cannot transition from ${currentStatus} to ${newStatus}` 
      }, { status: 400 });
    }

    // Additional validation for specific statuses
    if (newStatus === 'active' && new Date() < new Date(existingTreatment.start_date)) {
      return NextResponse.json({ 
        error: 'Cannot start treatment before start date' 
      }, { status: 400 });
    }

    if (newStatus === 'completed' && existingTreatment.end_date && new Date() > new Date(existingTreatment.end_date)) {
      return NextResponse.json({ 
        error: 'Cannot complete treatment after end date' 
      }, { status: 400 });
    }

    // Prepare update data
    const updateData: any = {
      status: newStatus,
      updated_at: new Date().toISOString()
    };

    // Add status-specific fields
    if (validatedData.notes) {
      updateData.notes = validatedData.notes;
    }

    if (validatedData.side_effects) {
      updateData.side_effects = validatedData.side_effects;
    }

    if (validatedData.effectiveness_rating) {
      updateData.effectiveness_rating = validatedData.effectiveness_rating;
    }

    if (newStatus === 'active') {
      updateData.started_at = new Date().toISOString();
      updateData.started_by = user.id;
    }

    if (newStatus === 'completed') {
      updateData.completed_at = validatedData.completion_date ? 
        new Date(validatedData.completion_date).toISOString() : 
        new Date().toISOString();
      updateData.completed_by = user.id;
    }

    if (newStatus === 'cancelled') {
      updateData.cancelled_at = new Date().toISOString();
      updateData.cancelled_by = user.id;
    }

    if (newStatus === 'paused') {
      updateData.paused_at = new Date().toISOString();
      updateData.paused_by = user.id;
    }

    // Update treatment
    const { data: updatedTreatment, error } = await supabase
      .from('treatments')
      .update(updateData)
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
      console.error('Error updating treatment status:', error);
      return NextResponse.json({ error: 'Failed to update treatment status' }, { status: 500 });
    }

    return NextResponse.json({
      message: `Treatment status updated to ${newStatus} successfully`,
      treatment: updatedTreatment
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.errors 
      }, { status: 400 });
    }
    
    console.error('Error in PUT /api/treatments/[id]/status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
