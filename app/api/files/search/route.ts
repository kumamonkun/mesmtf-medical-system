import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/files/search - Advanced search for files
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
    const q = searchParams.get('q') || '';
    const patientId = searchParams.get('patient_id') || '';
    const fileCategory = searchParams.get('file_category') || '';
    const fileType = searchParams.get('file_type') || '';
    const confidential = searchParams.get('confidential');
    const tags = searchParams.get('tags') || '';
    const dateFrom = searchParams.get('date_from') || '';
    const dateTo = searchParams.get('date_to') || '';
    const uploadedBy = searchParams.get('uploaded_by') || '';
    const sortBy = searchParams.get('sort_by') || 'uploaded_at';
    const sortOrder = searchParams.get('sort_order') || 'desc';
    const limit = parseInt(searchParams.get('limit') || '20');

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

    // Apply search filters
    if (q) {
      query = query.or(`
        file_name.ilike.%${q}%,
        description.ilike.%${q}%,
        tags.cs.{${q}}
      `);
    }

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

    if (uploadedBy) {
      query = query.eq('uploaded_by', uploadedBy);
    }

    // Apply sorting
    const validSortFields = ['uploaded_at', 'file_name', 'file_size', 'file_category', 'file_type'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'uploaded_at';
    const order = sortOrder === 'asc';
    
    query = query.order(sortField, { ascending: order });

    // Apply limit
    query = query.limit(limit);

    const { data: files, error, count } = await query;

    if (error) {
      console.error('Error searching files:', error);
      return NextResponse.json({ error: 'Failed to search files' }, { status: 500 });
    }

    // Add calculated fields
    const filesWithCalculations = files?.map(file => ({
      ...file,
      days_ago: Math.ceil((new Date().getTime() - new Date(file.uploaded_at).getTime()) / (1000 * 60 * 60 * 24)),
      is_recent: new Date(file.uploaded_at) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      file_size_mb: Math.round((file.file_size / (1024 * 1024)) * 100) / 100,
      file_extension: file.file_name.split('.').pop()?.toLowerCase() || 'unknown'
    }));

    // Get search statistics
    const totalResults = count || 0;
    const fileCategoryCounts = files?.reduce((acc, file) => {
      acc[file.file_category] = (acc[file.file_category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    const fileTypeCounts = files?.reduce((acc, file) => {
      acc[file.file_type] = (acc[file.file_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    const confidentialCount = files?.filter(file => file.confidential).length || 0;

    const totalSize = files?.reduce((sum, file) => sum + file.file_size, 0) || 0;
    const totalSizeMB = Math.round((totalSize / (1024 * 1024)) * 100) / 100;

    return NextResponse.json({
      files: filesWithCalculations || [],
      total: totalResults,
      statistics: {
        file_categories: fileCategoryCounts,
        file_types: fileTypeCounts,
        confidential: confidentialCount,
        total_size_mb: totalSizeMB
      },
      filters: {
        q,
        patientId,
        fileCategory,
        fileType,
        confidential,
        tags,
        dateFrom,
        dateTo,
        uploadedBy,
        sortBy: sortField,
        sortOrder: order ? 'asc' : 'desc'
      }
    });

  } catch (error) {
    console.error('Error in GET /api/files/search:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
