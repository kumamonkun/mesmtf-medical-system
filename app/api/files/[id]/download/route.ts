import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/files/[id]/download - Download file
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

    // Get file record
    const { data: file, error: fileError } = await supabase
      .from('file_uploads')
      .select(`
        *,
        patient:patients!file_uploads_patient_id_fkey(
          id,
          patient_id,
          first_name,
          last_name
        )
      `)
      .eq('id', id)
      .single();

    if (fileError) {
      if (fileError.code === 'PGRST116') {
        return NextResponse.json({ error: 'File not found' }, { status: 404 });
      }
      console.error('Error fetching file:', fileError);
      return NextResponse.json({ error: 'Failed to fetch file' }, { status: 500 });
    }

    // Check if user has permission to download the file
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    // Patients can only download their own files
    if (profile?.role === 'patient') {
      const { data: patientProfile } = await supabase
        .from('patients')
        .select('patient_id')
        .eq('patient_id', profile.username)
        .single();

      if (!patientProfile || !file.patient_id || 
          patientProfile.patient_id !== file.patient.patient_id) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
      }
    } else if (!profile || !['admin', 'doctor', 'nurse', 'receptionist', 'pharmacist'].includes(profile.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Get file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('medical-files')
      .download(file.file_path);

    if (downloadError) {
      console.error('Error downloading file:', downloadError);
      return NextResponse.json({ error: 'Failed to download file' }, { status: 500 });
    }

    // Convert file to buffer
    const fileBuffer = await fileData.arrayBuffer();
    const buffer = Buffer.from(fileBuffer);

    // Set response headers
    const headers = new Headers();
    headers.set('Content-Type', file.file_type);
    headers.set('Content-Disposition', `attachment; filename="${file.file_name}"`);
    headers.set('Content-Length', file.file_size.toString());
    headers.set('Cache-Control', 'no-cache');

    // Log download activity
    const { error: logError } = await supabase
      .from('file_download_logs')
      .insert({
        file_id: id,
        downloaded_by: user.id,
        downloaded_at: new Date().toISOString(),
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
      });

    if (logError) {
      console.error('Error logging download:', logError);
      // Don't fail the download if logging fails
    }

    return new NextResponse(buffer, {
      status: 200,
      headers
    });

  } catch (error) {
    console.error('Error in GET /api/files/[id]/download:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
