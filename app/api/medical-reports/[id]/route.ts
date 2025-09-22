import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Validation schema for medical report updates
const medicalReportUpdateSchema = z.object({
  report_type: z.enum(['lab_result', 'imaging', 'pathology', 'radiology', 'cardiology', 'neurology', 'oncology', 'other']).optional(),
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters').optional(),
  description: z.string().min(1, 'Description is required').max(2000, 'Description must be less than 2000 characters').optional(),
  content: z.string().min(1, 'Content is required').max(10000, 'Content must be less than 10000 characters').optional(),
  findings: z.string().max(5000, 'Findings must be less than 5000 characters').optional(),
  recommendations: z.string().max(2000, 'Recommendations must be less than 2000 characters').optional(),
  report_date: z.string().date('Invalid report date format').optional(),
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

// GET /api/medical-reports/[id] - Get medical report by ID
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

    // Get medical report with related data
    const { data: medicalReport, error } = await supabase
      .from('medical_reports')
      .select(`
        *,
        patient:patients!medical_reports_patient_id_fkey(
          id,
          patient_id,
          first_name,
          last_name,
          phone,
          email,
          date_of_birth,
          gender,
          medical_history,
          allergies,
          chronic_conditions
        ),
        doctor:doctors!medical_reports_doctor_id_fkey(
          id,
          name,
          specialty,
          phone,
          email
        ),
        created_by_user:user_profiles!medical_reports_created_by_fkey(
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
        return NextResponse.json({ error: 'Medical report not found' }, { status: 404 });
      }
      console.error('Error fetching medical report:', error);
      return NextResponse.json({ error: 'Failed to fetch medical report' }, { status: 500 });
    }

    return NextResponse.json(medicalReport);

  } catch (error) {
    console.error('Error in GET /api/medical-reports/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/medical-reports/[id] - Update medical report
export async function PUT(
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

    // Check if user has permission to update medical reports
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['admin', 'doctor', 'nurse', 'receptionist'].includes(profile.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { id } = params;
    const body = await request.json();
    
    // Validate input data
    const validatedData = medicalReportUpdateSchema.parse(body);

    // Check if medical report exists
    const { data: existingReport } = await supabase
      .from('medical_reports')
      .select('id, created_by, patient_id, status')
      .eq('id', id)
      .single();

    if (!existingReport) {
      return NextResponse.json({ error: 'Medical report not found' }, { status: 404 });
    }

    // Check if the user is the creator (for non-admin users)
    if (profile.role !== 'admin' && existingReport.created_by !== user.id) {
      return NextResponse.json({ 
        error: 'You can only update medical reports you created' 
      }, { status: 403 });
    }

    // Check if report can be modified
    if (existingReport.status === 'archived') {
      return NextResponse.json({ 
        error: 'Cannot modify archived medical reports' 
      }, { status: 400 });
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
    if (validatedData.follow_up_date && validatedData.report_date && 
        new Date(validatedData.follow_up_date) <= new Date(validatedData.report_date)) {
      return NextResponse.json({ 
        error: 'Follow-up date must be after report date' 
      }, { status: 400 });
    }

    // Update medical report
    const { data: updatedReport, error } = await supabase
      .from('medical_reports')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
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
      console.error('Error updating medical report:', error);
      return NextResponse.json({ error: 'Failed to update medical report' }, { status: 500 });
    }

    return NextResponse.json(updatedReport);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.errors 
      }, { status: 400 });
    }
    
    console.error('Error in PUT /api/medical-reports/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/medical-reports/[id] - Archive medical report
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

    // Check if user has permission to delete medical reports
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['admin', 'doctor'].includes(profile.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { id } = params;

    // Check if medical report exists
    const { data: existingReport } = await supabase
      .from('medical_reports')
      .select('id, created_by, status')
      .eq('id', id)
      .single();

    if (!existingReport) {
      return NextResponse.json({ error: 'Medical report not found' }, { status: 404 });
    }

    // Check if the user is the creator (for non-admin users)
    if (profile.role !== 'admin' && existingReport.created_by !== user.id) {
      return NextResponse.json({ 
        error: 'You can only delete medical reports you created' 
      }, { status: 403 });
    }

    // Check if report can be deleted
    if (existingReport.status === 'archived') {
      return NextResponse.json({ 
        error: 'Medical report is already archived' 
      }, { status: 400 });
    }

    // Archive medical report (soft delete)
    const { data: archivedReport, error } = await supabase
      .from('medical_reports')
      .update({
        status: 'archived',
        archived_at: new Date().toISOString(),
        archived_by: user.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error archiving medical report:', error);
      return NextResponse.json({ error: 'Failed to archive medical report' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Medical report archived successfully',
      report: archivedReport
    });

  } catch (error) {
    console.error('Error in DELETE /api/medical-reports/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
