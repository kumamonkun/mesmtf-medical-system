import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/medical-records/patient/[id] - Get medical records for a specific patient
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
    const recordType = searchParams.get('record_type') || '';
    const doctorId = searchParams.get('doctor_id') || '';
    const department = searchParams.get('department') || '';
    const priority = searchParams.get('priority') || '';
    const status = searchParams.get('status') || '';
    const dateFrom = searchParams.get('date_from') || '';
    const dateTo = searchParams.get('date_to') || '';
    const search = searchParams.get('search') || '';
    const tags = searchParams.get('tags') || '';
    const confidential = searchParams.get('confidential');
    const sortBy = searchParams.get('sort_by') || 'visit_date';
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

    // Check if user has permission to view patient's medical records
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    // Patients can only view their own records
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
      .from('medical_records')
      .select(`
        *,
        doctor:doctors!medical_records_doctor_id_fkey(
          id,
          name,
          specialty,
          phone
        ),
        diagnosis:diagnoses!medical_records_diagnosis_id_fkey(
          id,
          diagnosis,
          symptoms,
          confidence_level
        ),
        treatment:treatments!medical_records_treatment_id_fkey(
          id,
          treatment_name,
          description,
          status
        ),
        prescription:prescriptions!medical_records_prescription_id_fkey(
          id,
          dosage,
          frequency,
          instructions,
          status
        ),
        created_by_user:user_profiles!medical_records_created_by_fkey(
          id,
          first_name,
          last_name,
          role
        )
      `, { count: 'exact' })
      .eq('patient_id', patientId);

    // Apply filters
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
    
    if (search) {
      query = query.or(`
        title.ilike.%${search}%,
        description.ilike.%${search}%,
        content.ilike.%${search}%
      `);
    }
    
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      query = query.overlaps('tags', tagArray);
    }
    
    if (confidential !== null && confidential !== undefined) {
      query = query.eq('confidential', confidential === 'true');
    }

    // Apply sorting
    const validSortFields = ['visit_date', 'created_at', 'title', 'record_type', 'priority', 'status'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'visit_date';
    const order = sortOrder === 'asc';
    
    query = query.order(sortField, { ascending: order });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: medicalRecords, error, count } = await query;

    if (error) {
      console.error('Error fetching patient medical records:', error);
      return NextResponse.json({ error: 'Failed to fetch medical records' }, { status: 500 });
    }

    // Add calculated fields
    const recordsWithCalculations = medicalRecords?.map(record => ({
      ...record,
      days_ago: Math.ceil((new Date().getTime() - new Date(record.visit_date).getTime()) / (1000 * 60 * 60 * 24)),
      is_recent: new Date(record.visit_date) >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      has_follow_up: record.follow_up_required && record.follow_up_date,
      is_overdue: record.follow_up_required && record.follow_up_date && new Date(record.follow_up_date) < new Date()
    }));

    // Get summary statistics
    const totalRecords = count || 0;
    const activeRecords = medicalRecords?.filter(record => record.status === 'active').length || 0;
    const archivedRecords = medicalRecords?.filter(record => record.status === 'archived').length || 0;
    const confidentialRecords = medicalRecords?.filter(record => record.confidential).length || 0;
    const followUpRequired = medicalRecords?.filter(record => record.follow_up_required).length || 0;
    const overdueFollowUps = medicalRecords?.filter(record => 
      record.follow_up_required && record.follow_up_date && new Date(record.follow_up_date) < new Date()
    ).length || 0;

    // Get record type distribution
    const recordTypeDistribution = medicalRecords?.reduce((acc, record) => {
      acc[record.record_type] = (acc[record.record_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    // Get department distribution
    const departmentDistribution = medicalRecords?.reduce((acc, record) => {
      if (record.department) {
        acc[record.department] = (acc[record.department] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>) || {};

    return NextResponse.json({
      patient: {
        id: patient.id,
        patient_id: patient.patient_id
      },
      medical_records: recordsWithCalculations || [],
      summary: {
        total: totalRecords,
        active: activeRecords,
        archived: archivedRecords,
        confidential: confidentialRecords,
        follow_up_required: followUpRequired,
        overdue_follow_ups: overdueFollowUps,
        record_types: recordTypeDistribution,
        departments: departmentDistribution
      },
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Error in GET /api/medical-records/patient/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
