import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Validation schema for medical record updates
const medicalRecordUpdateSchema = z.object({
  record_type: z.enum(['consultation', 'diagnosis', 'treatment', 'lab_result', 'imaging', 'prescription', 'vaccination', 'surgery', 'emergency', 'follow_up', 'other']).optional(),
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters').optional(),
  description: z.string().min(1, 'Description is required').max(2000, 'Description must be less than 2000 characters').optional(),
  content: z.string().max(10000, 'Content must be less than 10000 characters').optional(),
  diagnosis_id: z.string().uuid('Invalid diagnosis ID format').optional(),
  treatment_id: z.string().uuid('Invalid treatment ID format').optional(),
  prescription_id: z.string().uuid('Invalid prescription ID format').optional(),
  visit_date: z.string().date('Invalid visit date format').optional(),
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

// GET /api/medical-records/[id] - Get medical record by ID
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

    // Get medical record with related data
    const { data: medicalRecord, error } = await supabase
      .from('medical_records')
      .select(`
        *,
        patient:patients!medical_records_patient_id_fkey(
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
        doctor:doctors!medical_records_doctor_id_fkey(
          id,
          name,
          specialty,
          phone,
          email
        ),
        diagnosis:diagnoses!medical_records_diagnosis_id_fkey(
          id,
          diagnosis,
          symptoms,
          confidence_level,
          notes
        ),
        treatment:treatments!medical_records_treatment_id_fkey(
          id,
          treatment_name,
          description,
          status,
          start_date,
          end_date
        ),
        prescription:prescriptions!medical_records_prescription_id_fkey(
          id,
          dosage,
          frequency,
          instructions,
          status,
          start_date,
          end_date
        ),
        created_by_user:user_profiles!medical_records_created_by_fkey(
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
        return NextResponse.json({ error: 'Medical record not found' }, { status: 404 });
      }
      console.error('Error fetching medical record:', error);
      return NextResponse.json({ error: 'Failed to fetch medical record' }, { status: 500 });
    }

    return NextResponse.json(medicalRecord);

  } catch (error) {
    console.error('Error in GET /api/medical-records/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/medical-records/[id] - Update medical record
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

    // Check if user has permission to update medical records
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
    const validatedData = medicalRecordUpdateSchema.parse(body);

    // Check if medical record exists
    const { data: existingRecord } = await supabase
      .from('medical_records')
      .select('id, created_by, patient_id, status')
      .eq('id', id)
      .single();

    if (!existingRecord) {
      return NextResponse.json({ error: 'Medical record not found' }, { status: 404 });
    }

    // Check if the user is the creator (for non-admin users)
    if (profile.role !== 'admin' && existingRecord.created_by !== user.id) {
      return NextResponse.json({ 
        error: 'You can only update medical records you created' 
      }, { status: 403 });
    }

    // Check if record can be modified
    if (existingRecord.status === 'deleted') {
      return NextResponse.json({ 
        error: 'Cannot modify deleted medical records' 
      }, { status: 400 });
    }

    // Check if doctor exists (if provided)
    if (validatedData.doctor_id) {
      const { data: doctor } = await supabase
        .from('doctors')
        .select('id')
        .eq('id', validatedData.doctor_id)
        .single();

      if (!doctor) {
        return NextResponse.json({ error: 'Doctor not found' }, { status: 400 });
      }
    }

    // Check if diagnosis exists (if provided)
    if (validatedData.diagnosis_id) {
      const { data: diagnosis } = await supabase
        .from('diagnoses')
        .select('id, patient_id')
        .eq('id', validatedData.diagnosis_id)
        .single();

      if (!diagnosis) {
        return NextResponse.json({ error: 'Diagnosis not found' }, { status: 400 });
      }

      // Verify diagnosis belongs to the patient
      if (diagnosis.patient_id !== existingRecord.patient_id) {
        return NextResponse.json({ 
          error: 'Diagnosis does not belong to the patient' 
        }, { status: 400 });
      }
    }

    // Check if treatment exists (if provided)
    if (validatedData.treatment_id) {
      const { data: treatment } = await supabase
        .from('treatments')
        .select('id, patient_id')
        .eq('id', validatedData.treatment_id)
        .single();

      if (!treatment) {
        return NextResponse.json({ error: 'Treatment not found' }, { status: 400 });
      }

      // Verify treatment belongs to the patient
      if (treatment.patient_id !== existingRecord.patient_id) {
        return NextResponse.json({ 
          error: 'Treatment does not belong to the patient' 
        }, { status: 400 });
      }
    }

    // Check if prescription exists (if provided)
    if (validatedData.prescription_id) {
      const { data: prescription } = await supabase
        .from('prescriptions')
        .select('id, patient_id')
        .eq('id', validatedData.prescription_id)
        .single();

      if (!prescription) {
        return NextResponse.json({ error: 'Prescription not found' }, { status: 400 });
      }

      // Verify prescription belongs to the patient
      if (prescription.patient_id !== existingRecord.patient_id) {
        return NextResponse.json({ 
          error: 'Prescription does not belong to the patient' 
        }, { status: 400 });
      }
    }

    // Validate follow-up date
    if (validatedData.follow_up_date && validatedData.visit_date && 
        new Date(validatedData.follow_up_date) <= new Date(validatedData.visit_date)) {
      return NextResponse.json({ 
        error: 'Follow-up date must be after visit date' 
      }, { status: 400 });
    }

    // Update medical record
    const { data: updatedRecord, error } = await supabase
      .from('medical_records')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
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
      console.error('Error updating medical record:', error);
      return NextResponse.json({ error: 'Failed to update medical record' }, { status: 500 });
    }

    return NextResponse.json(updatedRecord);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.errors 
      }, { status: 400 });
    }
    
    console.error('Error in PUT /api/medical-records/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/medical-records/[id] - Archive medical record
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

    // Check if user has permission to delete medical records
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['admin', 'doctor'].includes(profile.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { id } = params;

    // Check if medical record exists
    const { data: existingRecord } = await supabase
      .from('medical_records')
      .select('id, created_by, status')
      .eq('id', id)
      .single();

    if (!existingRecord) {
      return NextResponse.json({ error: 'Medical record not found' }, { status: 404 });
    }

    // Check if the user is the creator (for non-admin users)
    if (profile.role !== 'admin' && existingRecord.created_by !== user.id) {
      return NextResponse.json({ 
        error: 'You can only delete medical records you created' 
      }, { status: 403 });
    }

    // Check if record can be deleted
    if (existingRecord.status === 'deleted') {
      return NextResponse.json({ 
        error: 'Medical record is already deleted' 
      }, { status: 400 });
    }

    // Archive medical record (soft delete)
    const { data: archivedRecord, error } = await supabase
      .from('medical_records')
      .update({
        status: 'deleted',
        deleted_at: new Date().toISOString(),
        deleted_by: user.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error archiving medical record:', error);
      return NextResponse.json({ error: 'Failed to archive medical record' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Medical record archived successfully',
      record: archivedRecord
    });

  } catch (error) {
    console.error('Error in DELETE /api/medical-records/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
