import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/files/patient/[id] - Get files for a specific patient
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

    const { id: patientId } = params;

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const fileCategory = searchParams.get('file_category') || '';
    const fileType = searchParams.get('file_type') || '';
    const confidential = searchParams.get('confidential');
    const search = searchParams.get('search') || '';
    const tags = searchParams.get('tags') || '';
    const dateFrom = searchParams.get('date_from') || '';
    const dateTo = searchParams.get('date_to') || '';
    const sortBy = searchParams.get('sort_by') || 'uploaded_at';
    const sortOrder = searchParams.get('sort_order') || 'desc';
    
    const offset = (page - 1) * limit;

    // Check if patient exists
    const { data: patient } = await supabase
      .from('patients')
      .select('id, patient_id')
      .eq('id', patientId)
      .single();

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    // Check if user has permission to view patient's files
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    // Patients can only view their own files
    if (profile?.role === 'patient') {
      const { data: patientProfile } = await supabase
        .from('patients')
        .select('patient_id')
        .eq('patient_id', profile.username)
        .single();

      if (!patientProfile || patientProfile.patient_id !== patient.patient_id) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
      }
    } else if (!profile || !['admin', 'doctor', 'nurse', 'receptionist', 'pharmacist'].includes(profile.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Build query with joins
    let query = supabase
      .from('file_uploads')
      .select(`
        *,
        medical_record:medical_records!file_uploads_medical_record_id_fkey(
          id,
          title,
          record_type,
          visit_date
        ),
        medical_report:medical_reports!file_uploads_medical_report_id_fkey(
          id,
          title,
          report_type,
          report_date
        ),
        prescription:prescriptions!file_uploads_prescription_id_fkey(
          id,
          dosage,
          frequency,
          created_at
        ),
        uploaded_by_user:user_profiles!file_uploads_uploaded_by_fkey(
          id,
          first_name,
          last_name,
          role
        )
      `, { count: 'exact' })
      .eq('patient_id', patientId);

    // Apply filters
    if (fileCategory) {
      query = query.eq('file_category', fileCategory);
    }
    
    if (fileType) {
      query = query.eq('file_type', fileType);
    }
    
    if (confidential !== null && confidential !== undefined) {
      query = query.eq('confidential', confidential === 'true');
    }
    
    if (search) {
      query = query.or(`
        file_name.ilike.%${search}%,
        description.ilike.%${search}%
      `);
    }
    
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      query = query.overlaps('tags', tagArray);
    }
    
    if (dateFrom) {
      query = query.gte('uploaded_at', dateFrom);
    }
    
    if (dateTo) {
      query = query.lte('uploaded_at', dateTo);
    }

    // Apply sorting
    const validSortFields = ['uploaded_at', 'file_name', 'file_size', 'file_category', 'file_type'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'uploaded_at';
    const order = sortOrder === 'asc';
    
    query = query.order(sortField, { ascending: order });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: files, error, count } = await query;

    if (error) {
      console.error('Error fetching patient files:', error);
      return NextResponse.json({ error: 'Failed to fetch files' }, { status: 500 });
    }

    // Add calculated fields
    const filesWithCalculations = files?.map(file => ({
      ...file,
      days_ago: Math.ceil((new Date().getTime() - new Date(file.uploaded_at).getTime()) / (1000 * 60 * 60 * 24)),
      is_recent: new Date(file.uploaded_at) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      file_size_mb: Math.round((file.file_size / (1024 * 1024)) * 100) / 100,
      file_extension: file.file_name.split('.').pop()?.toLowerCase() || 'unknown'
    }));

    // Get summary statistics
    const totalFiles = count || 0;
    const confidentialFiles = files?.filter(file => file.confidential).length || 0;
    const recentFiles = files?.filter(file => 
      new Date(file.uploaded_at) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length || 0;

    // Get file category distribution
    const fileCategoryDistribution = files?.reduce((acc, file) => {
      acc[file.file_category] = (acc[file.file_category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    // Get file type distribution
    const fileTypeDistribution = files?.reduce((acc, file) => {
      acc[file.file_type] = (acc[file.file_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    // Get total size
    const totalSize = files?.reduce((sum, file) => sum + file.file_size, 0) || 0;
    const totalSizeMB = Math.round((totalSize / (1024 * 1024)) * 100) / 100;

    // Get files by related records
    const medicalRecordFiles = files?.filter(file => file.medical_record_id).length || 0;
    const medicalReportFiles = files?.filter(file => file.medical_report_id).length || 0;
    const prescriptionFiles = files?.filter(file => file.prescription_id).length || 0;
    const standaloneFiles = files?.filter(file => 
      !file.medical_record_id && !file.medical_report_id && !file.prescription_id
    ).length || 0;

    return NextResponse.json({
      patient: {
        id: patient.id,
        patient_id: patient.patient_id
      },
      files: filesWithCalculations || [],
      summary: {
        total: totalFiles,
        confidential: confidentialFiles,
        recent: recentFiles,
        total_size_mb: totalSizeMB,
        file_categories: fileCategoryDistribution,
        file_types: fileTypeDistribution,
        by_relation: {
          medical_records: medicalRecordFiles,
          medical_reports: medicalReportFiles,
          prescriptions: prescriptionFiles,
          standalone: standaloneFiles
        }
      },
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Error in GET /api/files/patient/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
