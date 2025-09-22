import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Validation schema for medical report data
const medicalReportSchema = z.object({
  patient_id: z.string().uuid('Invalid patient ID format'),
  report_type: z.enum(['lab_result', 'imaging', 'pathology', 'radiology', 'cardiology', 'neurology', 'oncology', 'other']),
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().min(1, 'Description is required').max(2000, 'Description must be less than 2000 characters'),
  content: z.string().min(1, 'Content is required').max(10000, 'Content must be less than 10000 characters'),
  findings: z.string().max(5000, 'Findings must be less than 5000 characters').optional(),
  recommendations: z.string().max(2000, 'Recommendations must be less than 2000 characters').optional(),
  report_date: z.string().date('Invalid report date format'),
  doctor_id: z.string().uuid('Invalid doctor ID format').optional(),
  department: z.string().max(100, 'Department must be less than 100 characters').optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  status: z.enum(['pending', 'completed', 'reviewed', 'archived']).optional(),
  tags: z.array(z.string()).max(20, 'Maximum 20 tags allowed').optional(),
  attachments: z.array(z.string()).max(10, 'Maximum 10 attachments allowed').optional(),
  follow_up_required: z.boolean().optional(),
  follow_up_date: z.string().date('Invalid follow-up date format').optional(),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
  confidential: z.boolean().optional(),
  normal_range: z.string().max(500, 'Normal range must be less than 500 characters').optional(),
  abnormal_values: z.array(z.string()).max(50, 'Maximum 50 abnormal values allowed').optional()
});

// GET /api/medical-reports - List all medical reports with pagination and filters
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
    
    const offset = (page - 1) * limit;

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
      `, { count: 'exact' })
      .order('report_date', { ascending: false });

    // Apply filters
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

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: medicalReports, error, count } = await query;

    if (error) {
      console.error('Error fetching medical reports:', error);
      return NextResponse.json({ error: 'Failed to fetch medical reports' }, { status: 500 });
    }

    return NextResponse.json({
      medical_reports: medicalReports || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Error in GET /api/medical-reports:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/medical-reports - Create new medical report
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has permission to create medical reports
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['admin', 'doctor', 'nurse', 'receptionist'].includes(profile.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    
    // Validate input data
    const validatedData = medicalReportSchema.parse(body);

    // Check if patient exists
    const { data: patient } = await supabase
      .from('patients')
      .select('id')
      .eq('id', validatedData.patient_id)
      .single();

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 400 });
    }

    // Check if doctor exists (if provided)
    if (validatedData.doctor_id) {
      const { data: doctor } = await supabase
        .from('doctors')
        .select('id')
        .eq('id', validatedData.doctor_id)
        .single();

      if (!doctor) {
        return NextResponse.json({ error: 'Doctor not found' }, { status: 400 });
      }
    }

    // Validate follow-up date
    if (validatedData.follow_up_date && new Date(validatedData.follow_up_date) <= new Date(validatedData.report_date)) {
      return NextResponse.json({ 
        error: 'Follow-up date must be after report date' 
      }, { status: 400 });
    }

    // Create medical report
    const { data: newMedicalReport, error } = await supabase
      .from('medical_reports')
      .insert({
        ...validatedData,
        created_by: user.id,
        status: validatedData.status || 'pending'
      })
      .select(`
        *,
        patient:patients!medical_reports_patient_id_fkey(
          id,
          patient_id,
          first_name,
          last_name,
          phone
        ),
        doctor:doctors!medical_reports_doctor_id_fkey(
          id,
          name,
          specialty
        )
      `)
      .single();

    if (error) {
      console.error('Error creating medical report:', error);
      return NextResponse.json({ error: 'Failed to create medical report' }, { status: 500 });
    }

    return NextResponse.json(newMedicalReport, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.errors 
      }, { status: 400 });
    }
    
    console.error('Error in POST /api/medical-reports:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
