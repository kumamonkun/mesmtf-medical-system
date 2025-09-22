import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/medical-reports/search - Advanced search for medical reports
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
    const reportType = searchParams.get('report_type') || '';
    const doctorId = searchParams.get('doctor_id') || '';
    const department = searchParams.get('department') || '';
    const priority = searchParams.get('priority') || '';
    const status = searchParams.get('status') || '';
    const dateFrom = searchParams.get('date_from') || '';
    const dateTo = searchParams.get('date_to') || '';
    const tags = searchParams.get('tags') || '';
    const confidential = searchParams.get('confidential');
    const followUpRequired = searchParams.get('follow_up_required');
    const abnormalValues = searchParams.get('abnormal_values');
    const sortBy = searchParams.get('sort_by') || 'report_date';
    const sortOrder = searchParams.get('sort_order') || 'desc';
    const limit = parseInt(searchParams.get('limit') || '20');

    // Build query with joins
    let query = supabase
      .from('medical_reports')
      .select(`
        *,
        patient:patients!medical_reports_patient_id_fkey(
          id,
          patient_id,
          first_name,
          last_name,
          phone,
          date_of_birth,
          gender
        ),
        doctor:doctors!medical_reports_doctor_id_fkey(
          id,
          name,
          specialty,
          phone
        ),
        created_by_user:user_profiles!medical_reports_created_by_fkey(
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
        findings.ilike.%${q}%,
        recommendations.ilike.%${q}%,
        notes.ilike.%${q}%
      `);
    }

    if (patientId) {
      query = query.eq('patient_id', patientId);
    }

    if (reportType) {
      query = query.eq('report_type', reportType);
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
      query = query.gte('report_date', dateFrom);
    }

    if (dateTo) {
      query = query.lte('report_date', dateTo);
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

    if (abnormalValues !== null && abnormalValues !== undefined) {
      if (abnormalValues === 'true') {
        query = query.not('abnormal_values', 'is', null);
        query = query.gt('array_length(abnormal_values, 1)', 0);
      } else {
        query = query.or('abnormal_values.is.null,array_length(abnormal_values, 1).eq.0');
      }
    }

    // Apply sorting
    const validSortFields = ['report_date', 'created_at', 'title', 'report_type', 'priority', 'status'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'report_date';
    const order = sortOrder === 'asc';
    
    query = query.order(sortField, { ascending: order });

    // Apply limit
    query = query.limit(limit);

    const { data: medicalReports, error, count } = await query;

    if (error) {
      console.error('Error searching medical reports:', error);
      return NextResponse.json({ error: 'Failed to search medical reports' }, { status: 500 });
    }

    // Add calculated fields
    const reportsWithCalculations = medicalReports?.map(report => ({
      ...report,
      days_ago: Math.ceil((new Date().getTime() - new Date(report.report_date).getTime()) / (1000 * 60 * 60 * 24)),
      is_recent: new Date(report.report_date) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      has_follow_up: report.follow_up_required && report.follow_up_date,
      is_overdue: report.follow_up_required && report.follow_up_date && new Date(report.follow_up_date) < new Date(),
      has_abnormal_values: report.abnormal_values && report.abnormal_values.length > 0
    }));

    // Get search statistics
    const totalResults = count || 0;
    const reportTypeCounts = medicalReports?.reduce((acc, report) => {
      acc[report.report_type] = (acc[report.report_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    const departmentCounts = medicalReports?.reduce((acc, report) => {
      if (report.department) {
        acc[report.department] = (acc[report.department] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>) || {};

    const priorityCounts = medicalReports?.reduce((acc, report) => {
      if (report.priority) {
        acc[report.priority] = (acc[report.priority] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>) || {};

    const statusCounts = medicalReports?.reduce((acc, report) => {
      acc[report.status] = (acc[report.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    const abnormalCount = medicalReports?.filter(report => 
      report.abnormal_values && report.abnormal_values.length > 0
    ).length || 0;

    const confidentialCount = medicalReports?.filter(report => report.confidential).length || 0;

    return NextResponse.json({
      medical_reports: reportsWithCalculations || [],
      total: totalResults,
      statistics: {
        report_types: reportTypeCounts,
        departments: departmentCounts,
        priorities: priorityCounts,
        statuses: statusCounts,
        abnormal_values: abnormalCount,
        confidential: confidentialCount
      },
      filters: {
        q,
        patientId,
        reportType,
        doctorId,
        department,
        priority,
        status,
        dateFrom,
        dateTo,
        tags,
        confidential,
        followUpRequired,
        abnormalValues,
        sortBy: sortField,
        sortOrder: order ? 'asc' : 'desc'
      }
    });

  } catch (error) {
    console.error('Error in GET /api/medical-reports/search:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
