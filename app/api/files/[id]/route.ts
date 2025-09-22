import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/files/[id] - Get file by ID
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

    // Get file with related data
    const { data: file, error } = await supabase
      .from('file_uploads')
      .select(`
        *,
        patient:patients!file_uploads_patient_id_fkey(
          id,
          patient_id,
          first_name,
          last_name,
          phone,
          email,
          date_of_birth,
          gender
        ),
        medical_record:medical_records!file_uploads_medical_record_id_fkey(
          id,
          title,
          record_type,
          visit_date,
          description
        ),
        medical_report:medical_reports!file_uploads_medical_report_id_fkey(
          id,
          title,
          report_type,
          report_date,
          description
        ),
        prescription:prescriptions!file_uploads_prescription_id_fkey(
          id,
          dosage,
          frequency,
          instructions,
          created_at
        ),
        uploaded_by_user:user_profiles!file_uploads_uploaded_by_fkey(
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
        return NextResponse.json({ error: 'File not found' }, { status: 404 });
      }
      console.error('Error fetching file:', error);
      return NextResponse.json({ error: 'Failed to fetch file' }, { status: 500 });
    }

    // Add calculated fields
    const fileWithCalculations = {
      ...file,
      days_ago: Math.ceil((new Date().getTime() - new Date(file.uploaded_at).getTime()) / (1000 * 60 * 60 * 24)),
      is_recent: new Date(file.uploaded_at) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      file_size_mb: Math.round((file.file_size / (1024 * 1024)) * 100) / 100,
      file_extension: file.file_name.split('.').pop()?.toLowerCase() || 'unknown'
    };

    return NextResponse.json(fileWithCalculations);

  } catch (error) {
    console.error('Error in GET /api/files/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/files/[id] - Delete file
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

    // Check if user has permission to delete files
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['admin', 'doctor', 'nurse', 'receptionist', 'pharmacist'].includes(profile.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { id } = params;

    // Check if file exists
    const { data: existingFile } = await supabase
      .from('file_uploads')
      .select('id, uploaded_by, file_path, patient_id')
      .eq('id', id)
      .single();

    if (!existingFile) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    // Check if the user is the uploader (for non-admin users)
    if (profile.role !== 'admin' && existingFile.uploaded_by !== user.id) {
      return NextResponse.json({ 
        error: 'You can only delete files you uploaded' 
      }, { status: 403 });
    }

    // Delete file from storage
    const { error: storageError } = await supabase.storage
      .from('medical-files')
      .remove([existingFile.file_path]);

    if (storageError) {
      console.error('Error deleting file from storage:', storageError);
      // Continue with database deletion even if storage deletion fails
    }

    // Delete file record from database
    const { error: dbError } = await supabase
      .from('file_uploads')
      .delete()
      .eq('id', id);

    if (dbError) {
      console.error('Error deleting file record:', dbError);
      return NextResponse.json({ error: 'Failed to delete file record' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'File deleted successfully',
      file_id: id
    });

  } catch (error) {
    console.error('Error in DELETE /api/files/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
