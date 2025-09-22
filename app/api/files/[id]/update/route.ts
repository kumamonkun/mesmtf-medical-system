import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Validation schema for file updates
const fileUpdateSchema = z.object({
  file_name: z.string().min(1, 'File name is required').max(255, 'File name must be less than 255 characters').optional(),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  confidential: z.boolean().optional(),
  tags: z.array(z.string()).max(10, 'Maximum 10 tags allowed').optional()
});

// PUT /api/files/[id]/update - Update file metadata
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

    // Check if user has permission to update files
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['admin', 'doctor', 'nurse', 'receptionist', 'pharmacist'].includes(profile.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { id } = params;
    const body = await request.json();
    
    // Validate input data
    const validatedData = fileUpdateSchema.parse(body);

    // Check if file exists
    const { data: existingFile } = await supabase
      .from('file_uploads')
      .select('id, uploaded_by, patient_id')
      .eq('id', id)
      .single();

    if (!existingFile) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Check if the user is the uploader (for non-admin users)
    if (profile.role !== 'admin' && existingFile.uploaded_by !== user.id) {
      return NextResponse.json({ 
        error: 'You can only update files you uploaded' 
      }, { status: 403 });
    }

    // Update file metadata
    const { data: updatedFile, error } = await supabase
      .from('file_uploads')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
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

    if (error) {
      console.error('Error updating file:', error);
      return NextResponse.json({ error: 'Failed to update file' }, { status: 500 });
    }

    return NextResponse.json(updatedFile);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.errors 
      }, { status: 400 });
    }
    
    console.error('Error in PUT /api/files/[id]/update:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
