import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/medical-reports/patient/[id] - Get medical reports for a specific patient
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
    const reportType = searchParams.get('report_type') || '';
    const doctorId = searchParams.get('doctor_id') || '';
    const department = searchParams.get('department') || '';
    const priority = searchParams.get('priority') || '';
    const status = searchParams.get('status') || '';
    const dateFrom = searchParams.get('date_from') || '';
    const dateTo = searchParams.get('date_to') || '';
    const search = searchParams.get('search') || '';
    const tags = searchParams.get('tags') || '';
    const confidential = searchParams.get('confidential');
    const followUpRequired = searchParams.get('follow_up_required');
    const sortBy = searchParams.get('sort_by') || 'report_date';
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

    // Check if user has permission to view patient's medical reports
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    // Patients can only view their own reports
    if (profile?.role === 'patient') {
      const { data: patientProfile } = await supabase
        .from('patients')
        .select('patient_id')
        .eq('patient_id', profile.username)
        .single();

      if (!patientProfile || patientProfile.patient_id !== patient.patient_id) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
      }
    } else if (!profile || !['admin', 'doctor', 'nurse', 'receptionist'].includes(profile.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Build query with joins
    let query = supabase
      .from('medical_reports')
      .select(`
        *,
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
      `, { count: 'exact' })
      .eq('patient_id', patientId);

    // Apply filters
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
    
    if (search) {
      query = query.or(`
        title.ilike.%${search}%,
        description.ilike.%${search}%,
        content.ilike.%${search}%,
        findings.ilike.%${search}%,
        recommendations.ilike.%${search}%
      `);
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
    const validSortFields = ['report_date', 'created_at', 'title', 'report_type', 'priority', 'status'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'report_date';
    const order = sortOrder === 'asc';
    
    query = query.order(sortField, { ascending: order });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: medicalReports, error, count } = await query;

    if (error) {
      console.error('Error fetching patient medical reports:', error);
      return NextResponse.json({ error: 'Failed to fetch medical reports' }, { status: 500 });
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

    // Get summary statistics
    const totalReports = count || 0;
    const pendingReports = medicalReports?.filter(report => report.status === 'pending').length || 0;
    const completedReports = medicalReports?.filter(report => report.status === 'completed').length || 0;
    const reviewedReports = medicalReports?.filter(report => report.status === 'reviewed').length || 0;
    const archivedReports = medicalReports?.filter(report => report.status === 'archived').length || 0;
    const confidentialReports = medicalReports?.filter(report => report.confidential).length || 0;
    const followUpRequiredCount = medicalReports?.filter(report => report.follow_up_required).length || 0;
    const overdueFollowUps = medicalReports?.filter(report => 
      report.follow_up_required && report.follow_up_date && new Date(report.follow_up_date) < new Date()
    ).length || 0;
    const abnormalReports = medicalReports?.filter(report => 
      report.abnormal_values && report.abnormal_values.length > 0
    ).length || 0;

    // Get report type distribution
    const reportTypeDistribution = medicalReports?.reduce((acc, report) => {
      acc[report.report_type] = (acc[report.report_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    // Get department distribution
    const departmentDistribution = medicalReports?.reduce((acc, report) => {
      if (report.department) {
        acc[report.department] = (acc[report.department] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>) || {};

    // Get priority distribution
    const priorityDistribution = medicalReports?.reduce((acc, report) => {
      if (report.priority) {
        acc[report.priority] = (acc[report.priority] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>) || {};

    return NextResponse.json({
      patient: {
        id: patient.id,
        patient_id: patient.patient_id
      },
      medical_reports: reportsWithCalculations || [],
      summary: {
        total: totalReports,
        pending: pendingReports,
        completed: completedReports,
        reviewed: reviewedReports,
        archived: archivedReports,
        confidential: confidentialReports,
        follow_up_required: followUpRequiredCount,
        overdue_follow_ups: overdueFollowUps,
        abnormal_values: abnormalReports,
        report_types: reportTypeDistribution,
        departments: departmentDistribution,
        priorities: priorityDistribution
      },
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Error in GET /api/medical-reports/patient/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
