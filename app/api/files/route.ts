import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/files - List all files with pagination and filters
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const patientId = searchParams.get('patient_id') || '';
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

    // Build query with joins
    let query = supabase
      .from('file_uploads')
      .select(`
        *,
        patient:patients!file_uploads_patient_id_fkey(
          id,
          patient_id,
          first_name,
          last_name,
          phone,
          date_of_birth,
          gender
        ),
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
      `, { count: 'exact' });

    // Apply filters
    if (patientId) {
      query = query.eq('patient_id', patientId);
    }
    
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
      console.error('Error fetching files:', error);
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

    return NextResponse.json({
      files: filesWithCalculations || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Error in GET /api/files:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
