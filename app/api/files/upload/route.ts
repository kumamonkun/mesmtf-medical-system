import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Validation schema for file upload
const fileUploadSchema = z.object({
  file_name: z.string().min(1, 'File name is required').max(255, 'File name must be less than 255 characters'),
  file_type: z.string().min(1, 'File type is required').max(100, 'File type must be less than 100 characters'),
  file_size: z.number().min(1, 'File size must be at least 1 byte').max(50 * 1024 * 1024, 'File size must be less than 50MB'),
  file_category: z.enum(['medical_record', 'lab_result', 'imaging', 'prescription', 'insurance', 'identification', 'other']),
  patient_id: z.string().uuid('Invalid patient ID format').optional(),
  medical_record_id: z.string().uuid('Invalid medical record ID format').optional(),
  medical_report_id: z.string().uuid('Invalid medical report ID format').optional(),
  prescription_id: z.string().uuid('Invalid prescription ID format').optional(),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  confidential: z.boolean().optional(),
  tags: z.array(z.string()).max(10, 'Maximum 10 tags allowed').optional()
});

// POST /api/files/upload - Upload file
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has permission to upload files
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['admin', 'doctor', 'nurse', 'receptionist', 'pharmacist'].includes(profile.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file
    const maxFileSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxFileSize) {
      return NextResponse.json({ 
        error: 'File size exceeds maximum limit of 50MB' 
      }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain', 'text/csv', 'application/json'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'File type not allowed. Allowed types: JPEG, PNG, GIF, WebP, PDF, DOC, DOCX, TXT, CSV, JSON' 
      }, { status: 400 });
    }

    // Get additional metadata from form data
    const metadata = {
      file_name: formData.get('file_name') as string || file.name,
      file_type: formData.get('file_type') as string || file.type,
      file_size: file.size,
      file_category: formData.get('file_category') as string || 'other',
      patient_id: formData.get('patient_id') as string || null,
      medical_record_id: formData.get('medical_record_id') as string || null,
      medical_report_id: formData.get('medical_report_id') as string || null,
      prescription_id: formData.get('prescription_id') as string || null,
      description: formData.get('description') as string || null,
      confidential: formData.get('confidential') === 'true',
      tags: formData.get('tags') ? JSON.parse(formData.get('tags') as string) : []
    };

    // Validate metadata
    const validatedData = fileUploadSchema.parse(metadata);

    // Check if patient exists (if provided)
    if (validatedData.patient_id) {
      const { data: patient } = await supabase
        .from('patients')
        .select('id')
        .eq('id', validatedData.patient_id)
        .single();

      if (!patient) {
        return NextResponse.json({ error: 'Patient not found' }, { status: 400 });
      }
    }

    // Check if medical record exists (if provided)
    if (validatedData.medical_record_id) {
      const { data: medicalRecord } = await supabase
        .from('medical_records')
        .select('id, patient_id')
        .eq('id', validatedData.medical_record_id)
        .single();

      if (!medicalRecord) {
        return NextResponse.json({ error: 'Medical record not found' }, { status: 400 });
      }

      // Verify medical record belongs to the patient
      if (validatedData.patient_id && medicalRecord.patient_id !== validatedData.patient_id) {
        return NextResponse.json({ 
          error: 'Medical record does not belong to the specified patient' 
        }, { status: 400 });
      }
    }

    // Check if medical report exists (if provided)
    if (validatedData.medical_report_id) {
      const { data: medicalReport } = await supabase
        .from('medical_reports')
        .select('id, patient_id')
        .eq('id', validatedData.medical_report_id)
        .single();

      if (!medicalReport) {
        return NextResponse.json({ error: 'Medical report not found' }, { status: 400 });
      }

      // Verify medical report belongs to the patient
      if (validatedData.patient_id && medicalReport.patient_id !== validatedData.patient_id) {
        return NextResponse.json({ 
          error: 'Medical report does not belong to the specified patient' 
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
      if (validatedData.patient_id && prescription.patient_id !== validatedData.patient_id) {
        return NextResponse.json({ 
          error: 'Prescription does not belong to the specified patient' 
        }, { status: 400 });
      }
    }

    // Generate unique file name
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const uniqueFileName = `${timestamp}_${Math.random().toString(36).substring(2)}.${fileExtension}`;
    
    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('medical-files')
      .upload(uniqueFileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('medical-files')
      .getPublicUrl(uniqueFileName);

    // Create file record in database
    const { data: fileRecord, error: dbError } = await supabase
      .from('file_uploads')
      .insert({
        file_name: validatedData.file_name,
        file_type: validatedData.file_type,
        file_size: validatedData.file_size,
        file_category: validatedData.file_category,
        file_path: uploadData.path,
        file_url: urlData.publicUrl,
        patient_id: validatedData.patient_id,
        medical_record_id: validatedData.medical_record_id,
        medical_report_id: validatedData.medical_report_id,
        prescription_id: validatedData.prescription_id,
        description: validatedData.description,
        confidential: validatedData.confidential,
        tags: validatedData.tags,
        uploaded_by: user.id
      })
      .select(`
        *,
        patient:patients!file_uploads_patient_id_fkey(
          id,
          patient_id,
          first_name,
          last_name
        ),
        medical_record:medical_records!file_uploads_medical_record_id_fkey(
          id,
          title,
          record_type
        ),
        medical_report:medical_reports!file_uploads_medical_report_id_fkey(
          id,
          title,
          report_type
        ),
        prescription:prescriptions!file_uploads_prescription_id_fkey(
          id,
          dosage,
          frequency
        ),
        uploaded_by_user:user_profiles!file_uploads_uploaded_by_fkey(
          id,
          first_name,
          last_name,
          role
        )
      `)
      .single();

    if (dbError) {
      console.error('Error creating file record:', dbError);
      // Clean up uploaded file
      await supabase.storage
        .from('medical-files')
        .remove([uploadData.path]);
      
      return NextResponse.json({ error: 'Failed to create file record' }, { status: 500 });
    }

    return NextResponse.json(fileRecord, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.errors 
      }, { status: 400 });
    }
    
    console.error('Error in POST /api/files/upload:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
