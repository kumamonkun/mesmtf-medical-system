import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Validation schema for drug administration updates
const drugAdministrationUpdateSchema = z.object({
  quantity: z.number().min(0.1, 'Quantity must be at least 0.1').optional(),
  dosage: z.string().min(1, 'Dosage is required').max(100, 'Dosage must be less than 100 characters').optional(),
  administration_date: z.string().datetime('Invalid administration date format').optional(),
  administration_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format').optional(),
  route: z.enum(['oral', 'injection', 'topical', 'inhalation', 'rectal', 'sublingual', 'other']).optional(),
  site: z.string().max(100, 'Site must be less than 100 characters').optional(),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
  status: z.enum(['scheduled', 'administered', 'missed', 'cancelled']).optional(),
  side_effects: z.string().max(500, 'Side effects must be less than 500 characters').optional(),
  effectiveness_rating: z.number().min(1).max(5, 'Effectiveness rating must be between 1 and 5').optional()
});

// GET /api/drug-administration/[id] - Get drug administration by ID
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

    // Get drug administration with related data
    const { data: administration, error } = await supabase
      .from('drug_administration')
      .select(`
        *,
        patient:patients!drug_administration_patient_id_fkey(
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
        drug:drugs!drug_administration_drug_id_fkey(
          id,
          name,
          generic_name,
          strength,
          unit,
          dosage_form,
          indication,
          side_effects,
          contraindications
        ),
        prescription:prescriptions!drug_administration_prescription_id_fkey(
          id,
          dosage,
          frequency,
          instructions,
          start_date,
          end_date
        ),
        administered_by_user:user_profiles!drug_administration_administered_by_fkey(
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
        return NextResponse.json({ error: 'Drug administration record not found' }, { status: 404 });
      }
      console.error('Error fetching drug administration:', error);
      return NextResponse.json({ error: 'Failed to fetch drug administration record' }, { status: 500 });
    }

    return NextResponse.json(administration);

  } catch (error) {
    console.error('Error in GET /api/drug-administration/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/drug-administration/[id] - Update drug administration
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

    // Check if user has permission to update drug administration records
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['admin', 'doctor', 'nurse', 'pharmacist'].includes(profile.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { id } = params;
    const body = await request.json();
    
    // Validate input data
    const validatedData = drugAdministrationUpdateSchema.parse(body);

    // Check if drug administration record exists
    const { data: existingAdministration } = await supabase
      .from('drug_administration')
      .select('id, administered_by, status')
      .eq('id', id)
      .single();

    if (!existingAdministration) {
      return NextResponse.json({ error: 'Drug administration record not found' }, { status: 404 });
    }

    // Check if the user is the one who administered the drug (for non-admin users)
    if (profile.role !== 'admin' && existingAdministration.administered_by !== user.id) {
      return NextResponse.json({ 
        error: 'You can only update your own drug administration records' 
      }, { status: 403 });
    }

    // Check if record can be modified
    if (existingAdministration.status === 'cancelled') {
      return NextResponse.json({ 
        error: 'Cannot modify cancelled drug administration records' 
      }, { status: 400 });
    }

    // Validate administration date
    if (validatedData.administration_date) {
      const adminDate = new Date(validatedData.administration_date);
      const now = new Date();
      
      if (adminDate > now) {
        return NextResponse.json({ 
          error: 'Administration date cannot be in the future' 
        }, { status: 400 });
      }
    }

    // Update drug administration record
    const { data: updatedAdministration, error } = await supabase
      .from('drug_administration')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select(`
        *,
        patient:patients!drug_administration_patient_id_fkey(
          id,
          patient_id,
          first_name,
          last_name,
          phone
        ),
        drug:drugs!drug_administration_drug_id_fkey(
          id,
          name,
          generic_name,
          strength,
          unit,
          dosage_form
        ),
        prescription:prescriptions!drug_administration_prescription_id_fkey(
          id,
          dosage,
          frequency,
          instructions
        )
      `)
      .single();

    if (error) {
      console.error('Error updating drug administration record:', error);
      return NextResponse.json({ error: 'Failed to update drug administration record' }, { status: 500 });
    }

    return NextResponse.json(updatedAdministration);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.errors 
      }, { status: 400 });
    }
    
    console.error('Error in PUT /api/drug-administration/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/drug-administration/[id] - Cancel drug administration
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

    // Check if user has permission to cancel drug administration records
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['admin', 'doctor', 'nurse', 'pharmacist'].includes(profile.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { id } = params;

    // Check if drug administration record exists
    const { data: existingAdministration } = await supabase
      .from('drug_administration')
      .select('id, administered_by, status')
      .eq('id', id)
      .single();

    if (!existingAdministration) {
      return NextResponse.json({ error: 'Drug administration record not found' }, { status: 404 });
    }

    // Check if the user is the one who administered the drug (for non-admin users)
    if (profile.role !== 'admin' && existingAdministration.administered_by !== user.id) {
      return NextResponse.json({ 
        error: 'You can only cancel your own drug administration records' 
      }, { status: 403 });
    }

    // Check if record can be cancelled
    if (existingAdministration.status === 'cancelled') {
      return NextResponse.json({ 
        error: 'Drug administration record is already cancelled' 
      }, { status: 400 });
    }

    // Cancel drug administration record
    const { data: cancelledAdministration, error } = await supabase
      .from('drug_administration')
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
      console.error('Error cancelling drug administration record:', error);
      return NextResponse.json({ error: 'Failed to cancel drug administration record' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Drug administration record cancelled successfully',
      administration: cancelledAdministration
    });

  } catch (error) {
    console.error('Error in DELETE /api/drug-administration/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
