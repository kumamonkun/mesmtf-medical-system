import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// POST /api/prescriptions/[id]/fulfill - Fulfill a prescription
export async function POST(
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

    // Check if user has permission to fulfill prescriptions
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['admin', 'pharmacist'].includes(profile.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const prescriptionId = params.id;

    // Check if prescription exists
    const { data: prescription, error: prescriptionError } = await supabase
      .from('prescriptions')
      .select('id, treatment_id, drug_id, quantity, dosage, frequency')
      .eq('id', prescriptionId)
      .single();

    if (prescriptionError || !prescription) {
      return NextResponse.json({ error: 'Prescription not found' }, { status: 404 });
    }

    // Update prescription status to fulfilled
    const { data: updatedPrescription, error: updateError } = await supabase
      .from('prescriptions')
      .update({ 
        status: 'fulfilled',
        fulfilled_at: new Date().toISOString(),
        fulfilled_by: user.id
      })
      .eq('id', prescriptionId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating prescription:', updateError);
      return NextResponse.json({ error: 'Failed to fulfill prescription' }, { status: 500 });
    }

    // Create drug administration record
    const { data: administrationRecord, error: adminError } = await supabase
      .from('drug_administration')
      .insert({
        prescription_id: prescriptionId,
        administered_by: user.id,
        administered_at: new Date().toISOString(),
        quantity_administered: prescription.quantity,
        notes: `Prescription fulfilled by ${profile.role}`
      })
      .select()
      .single();

    if (adminError) {
      console.error('Error creating administration record:', adminError);
      // Don't fail the fulfillment if admin record creation fails
    }

    return NextResponse.json({
      message: 'Prescription fulfilled successfully',
      prescription: updatedPrescription,
      administrationRecord
    });

  } catch (error) {
    console.error('Error in POST /api/prescriptions/[id]/fulfill:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}