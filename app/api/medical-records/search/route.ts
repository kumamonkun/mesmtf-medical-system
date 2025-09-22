import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/medical-records/search - Advanced search for medical records
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
    const recordType = searchParams.get('record_type') || '';
    const doctorId = searchParams.get('doctor_id') || '';
    const department = searchParams.get('department') || '';
    const priority = searchParams.get('priority') || '';
    const status = searchParams.get('status') || '';
    const dateFrom = searchParams.get('date_from') || '';
    const dateTo = searchParams.get('date_to') || '';
    const tags = searchParams.get('tags') || '';
    const confidential = searchParams.get('confidential');
    const followUpRequired = searchParams.get('follow_up_required');
    const sortBy = searchParams.get('sort_by') || 'visit_date';
    const sortOrder = searchParams.get('sort_order') || 'desc';
    const limit = parseInt(searchParams.get('limit') || '20');

    // Build query with joins
    let query = supabase
      .from('medical_records')
      .select(`
        *,
        patient:patients!medical_records_patient_id_fkey(
          id,
          patient_id,
          first_name,
          last_name,
          phone,
          date_of_birth,
          gender
        ),
        doctor:doctors!medical_records_doctor_id_fkey(
          id,
          name,
          specialty,
          phone
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
        ),
        created_by_user:user_profiles!medical_records_created_by_fkey(
          id,
          first_name,
          last_name,
          role
        )
      `, { count: 'exact' });

    // Apply search filters
    if (q) {
      query = query.or(`
        title.ilike.%${q}%,
        description.ilike.%${q}%,
        content.ilike.%${q}%,
        notes.ilike.%${q}%
      `);
    }

    if (patientId) {
      query = query.eq('patient_id', patientId);
    }

    if (recordType) {
      query = query.eq('record_type', recordType);
    }

    if (doctorId) {
      query = query.eq('doctor_id', doctorId);
    }

    if (department) {
      query = query.eq('department', department);
    }

    if (priority) {
      query = query.eq('priority', priority);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (dateFrom) {
      query = query.gte('visit_date', dateFrom);
    }

    if (dateTo) {
      query = query.lte('visit_date', dateTo);
    }

    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      query = query.overlaps('tags', tagArray);
    }

    if (confidential !== null && confidential !== undefined) {
      query = query.eq('confidential', confidential === 'true');
    }

    if (followUpRequired !== null && followUpRequired !== undefined) {
      query = query.eq('follow_up_required', followUpRequired === 'true');
    }

    // Apply sorting
    const validSortFields = ['visit_date', 'created_at', 'title', 'record_type', 'priority', 'status'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'visit_date';
    const order = sortOrder === 'asc';
    
    query = query.order(sortField, { ascending: order });

    // Apply limit
    query = query.limit(limit);

    const { data: medicalRecords, error, count } = await query;

    if (error) {
      console.error('Error searching medical records:', error);
      return NextResponse.json({ error: 'Failed to search medical records' }, { status: 500 });
    }

    // Add calculated fields
    const recordsWithCalculations = medicalRecords?.map(record => ({
      ...record,
      days_ago: Math.ceil((new Date().getTime() - new Date(record.visit_date).getTime()) / (1000 * 60 * 60 * 24)),
      is_recent: new Date(record.visit_date) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      has_follow_up: record.follow_up_required && record.follow_up_date,
      is_overdue: record.follow_up_required && record.follow_up_date && new Date(record.follow_up_date) < new Date()
    }));

    // Get search statistics
    const totalResults = count || 0;
    const recordTypeCounts = medicalRecords?.reduce((acc, record) => {
      acc[record.record_type] = (acc[record.record_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    const departmentCounts = medicalRecords?.reduce((acc, record) => {
      if (record.department) {
        acc[record.department] = (acc[record.department] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>) || {};

    const priorityCounts = medicalRecords?.reduce((acc, record) => {
      if (record.priority) {
        acc[record.priority] = (acc[record.priority] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>) || {};

    return NextResponse.json({
      medical_records: recordsWithCalculations || [],
      total: totalResults,
      statistics: {
        record_types: recordTypeCounts,
        departments: departmentCounts,
        priorities: priorityCounts
      },
      filters: {
        q,
        patientId,
        recordType,
        doctorId,
        department,
        priority,
        status,
        dateFrom,
        dateTo,
        tags,
        confidential,
        followUpRequired,
        sortBy: sortField,
        sortOrder: order ? 'asc' : 'desc'
      }
    });

  } catch (error) {
    console.error('Error in GET /api/medical-records/search:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
