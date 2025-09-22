import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Validation schema for report generation
const reportGenerationSchema = z.object({
  report_type: z.enum(['patient_summary', 'appointment_summary', 'pharmacy_summary', 'financial_summary', 'custom']),
  format: z.enum(['pdf', 'excel', 'csv', 'json']).optional(),
  date_from: z.string().date('Invalid start date format'),
  date_to: z.string().date('Invalid end date format'),
  filters: z.object({
    patient_id: z.string().uuid().optional(),
    doctor_id: z.string().uuid().optional(),
    department: z.string().optional(),
    status: z.string().optional(),
    category: z.string().optional()
  }).optional(),
  include_charts: z.boolean().optional(),
  include_details: z.boolean().optional()
});

// POST /api/reports/generate - Generate report
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has permission to generate reports
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['admin', 'doctor', 'nurse', 'receptionist', 'pharmacist'].includes(profile.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    
    // Validate input data
    const validatedData = reportGenerationSchema.parse(body);

    const { report_type, format = 'pdf', date_from, date_to, filters = {}, include_charts = true, include_details = true } = validatedData;

    // Validate date range
    if (new Date(date_from) > new Date(date_to)) {
      return NextResponse.json({ 
        error: 'Start date must be before end date' 
      }, { status: 400 });
    }

    // Generate report based on type
    let reportData;
    
    switch (report_type) {
      case 'patient_summary':
        reportData = await generatePatientSummaryReport(supabase, date_from, date_to, filters);
        break;
      case 'appointment_summary':
        reportData = await generateAppointmentSummaryReport(supabase, date_from, date_to, filters);
        break;
      case 'pharmacy_summary':
        reportData = await generatePharmacySummaryReport(supabase, date_from, date_to, filters);
        break;
      case 'financial_summary':
        reportData = await generateFinancialSummaryReport(supabase, date_from, date_to, filters);
        break;
      default:
        return NextResponse.json({ error: 'Invalid report type' }, { status: 400 });
    }

    // Add report metadata
    const reportMetadata = {
      report_id: `report_${Date.now()}_${Math.random().toString(36).substring(2)}`,
      generated_by: user.id,
      generated_at: new Date().toISOString(),
      report_type,
      format,
      date_range: { from: date_from, to: date_to },
      filters,
      include_charts,
      include_details
    };

    // Create report record in database
    const { data: reportRecord, error: reportError } = await supabase
      .from('reports')
      .insert({
        report_id: reportMetadata.report_id,
        report_type,
        format,
        date_from,
        date_to,
        filters: filters,
        generated_by: user.id,
        status: 'completed',
        data: reportData
      })
      .select()
      .single();

    if (reportError) {
      console.error('Error creating report record:', reportError);
      // Continue with report generation even if database record creation fails
    }

    // Format response based on requested format
    if (format === 'json') {
      return NextResponse.json({
        metadata: reportMetadata,
        data: reportData
      });
    } else {
      // For PDF, Excel, CSV formats, return the data with instructions for frontend processing
      return NextResponse.json({
        metadata: reportMetadata,
        data: reportData,
        format_instructions: {
          format,
          download_url: `/api/reports/download/${reportMetadata.report_id}`,
          processing_required: true
        }
      });
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.errors 
      }, { status: 400 });
    }
    
    console.error('Error in POST /api/reports/generate:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Helper function to generate patient summary report
async function generatePatientSummaryReport(supabase: any, dateFrom: string, dateTo: string, filters: any) {
  const { data: patients } = await supabase
    .from('patients')
    .select(`
      *,
      appointments:appointments!appointments_patient_id_fkey(
        id,
        status,
        appointment_date,
        doctor_id
      ),
      diagnoses:diagnoses!diagnoses_patient_id_fkey(
        id,
        diagnosis,
        confidence_level,
        created_at
      ),
      treatments:treatments!treatments_patient_id_fkey(
        id,
        treatment_name,
        status,
        created_at
      )
    `)
    .gte('created_at', dateFrom)
    .lte('created_at', dateTo);

  // Apply filters
  let filteredPatients = patients || [];
  if (filters.doctor_id) {
    filteredPatients = filteredPatients.filter(p => 
      p.appointments?.some(a => a.doctor_id === filters.doctor_id)
    );
  }

  return {
    summary: {
      total_patients: filteredPatients.length,
      new_patients: filteredPatients.filter(p => 
        new Date(p.created_at) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ).length,
      gender_distribution: filteredPatients.reduce((acc, p) => {
        acc[p.gender] = (acc[p.gender] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    },
    patients: filteredPatients.map(patient => ({
      patient_id: patient.patient_id,
      name: `${patient.first_name} ${patient.last_name}`,
      age: patient.date_of_birth ? 
        Math.floor((new Date().getTime() - new Date(patient.date_of_birth).getTime()) / (1000 * 60 * 60 * 24 * 365.25)) : null,
      gender: patient.gender,
      phone: patient.phone,
      email: patient.email,
      appointments_count: patient.appointments?.length || 0,
      diagnoses_count: patient.diagnoses?.length || 0,
      treatments_count: patient.treatments?.length || 0,
      last_visit: patient.appointments?.length > 0 ? 
        Math.max(...patient.appointments.map(a => new Date(a.appointment_date).getTime())) : null
    }))
  };
}

// Helper function to generate appointment summary report
async function generateAppointmentSummaryReport(supabase: any, dateFrom: string, dateTo: string, filters: any) {
  let query = supabase
    .from('appointments')
    .select(`
      *,
      patient:patients!appointments_patient_id_fkey(
        id,
        patient_id,
        first_name,
        last_name
      ),
      doctor:doctors!appointments_doctor_id_fkey(
        id,
        name,
        specialty
      )
    `)
    .gte('created_at', dateFrom)
    .lte('created_at', dateTo);

  if (filters.doctor_id) {
    query = query.eq('doctor_id', filters.doctor_id);
  }
  if (filters.department) {
    query = query.eq('department', filters.department);
  }
  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  const { data: appointments } = await query;

  return {
    summary: {
      total_appointments: appointments?.length || 0,
      completed: appointments?.filter(a => a.status === 'completed').length || 0,
      cancelled: appointments?.filter(a => a.status === 'cancelled').length || 0,
      no_show: appointments?.filter(a => a.status === 'no_show').length || 0,
      completion_rate: appointments?.length > 0 ? 
        (appointments.filter(a => a.status === 'completed').length / appointments.length) * 100 : 0
    },
    appointments: appointments?.map(appointment => ({
      id: appointment.id,
      patient_name: `${appointment.patient?.first_name} ${appointment.patient?.last_name}`,
      doctor_name: appointment.doctor?.name,
      specialty: appointment.doctor?.specialty,
      appointment_date: appointment.appointment_date,
      status: appointment.status,
      fee: appointment.fee
    })) || []
  };
}

// Helper function to generate pharmacy summary report
async function generatePharmacySummaryReport(supabase: any, dateFrom: string, dateTo: string, filters: any) {
  const { data: prescriptions } = await supabase
    .from('prescriptions')
    .select(`
      *,
      patient:patients!prescriptions_patient_id_fkey(
        id,
        patient_id,
        first_name,
        last_name
      ),
      drug:drugs!prescriptions_drug_id_fkey(
        id,
        name,
        category,
        price
      )
    `)
    .gte('created_at', dateFrom)
    .lte('created_at', dateTo);

  const { data: drugs } = await supabase
    .from('drugs')
    .select('*')
    .gte('created_at', dateFrom)
    .lte('created_at', dateTo);

  return {
    summary: {
      total_prescriptions: prescriptions?.length || 0,
      fulfilled: prescriptions?.filter(p => p.status === 'fulfilled').length || 0,
      pending: prescriptions?.filter(p => p.status === 'pending').length || 0,
      total_drugs: drugs?.length || 0,
      low_stock: drugs?.filter(d => d.stock <= d.min_stock).length || 0
    },
    prescriptions: prescriptions?.map(prescription => ({
      id: prescription.id,
      patient_name: `${prescription.patient?.first_name} ${prescription.patient?.last_name}`,
      drug_name: prescription.drug?.name,
      category: prescription.drug?.category,
      quantity: prescription.quantity,
      status: prescription.status,
      value: prescription.drug?.price * prescription.quantity || 0
    })) || [],
    inventory: drugs?.map(drug => ({
      name: drug.name,
      category: drug.category,
      stock: drug.stock,
      min_stock: drug.min_stock,
      price: drug.price,
      status: drug.stock <= drug.min_stock ? 'low' : 'normal'
    })) || []
  };
}

// Helper function to generate financial summary report
async function generateFinancialSummaryReport(supabase: any, dateFrom: string, dateTo: string, filters: any) {
  const { data: appointments } = await supabase
    .from('appointments')
    .select('id, status, fee, appointment_date, doctor_id, department')
    .gte('created_at', dateFrom)
    .lte('created_at', dateTo);

  const { data: prescriptions } = await supabase
    .from('prescriptions')
    .select(`
      id,
      status,
      quantity,
      drug:drugs!prescriptions_drug_id_fkey(
        id,
        name,
        price
      )
    `)
    .gte('created_at', dateFrom)
    .lte('created_at', dateTo);

  const appointmentRevenue = appointments?.filter(a => a.status === 'completed')
    .reduce((sum, a) => sum + (a.fee || 0), 0) || 0;

  const prescriptionRevenue = prescriptions?.filter(p => p.status === 'fulfilled')
    .reduce((sum, p) => sum + (p.drug?.price * p.quantity || 0), 0) || 0;

  return {
    summary: {
      total_revenue: appointmentRevenue + prescriptionRevenue,
      appointment_revenue: appointmentRevenue,
      prescription_revenue: prescriptionRevenue,
      total_appointments: appointments?.length || 0,
      total_prescriptions: prescriptions?.length || 0
    },
    revenue_breakdown: {
      by_department: appointments?.reduce((acc, a) => {
        if (a.status === 'completed') {
          const dept = a.department || 'General';
          acc[dept] = (acc[dept] || 0) + (a.fee || 0);
        }
        return acc;
      }, {} as Record<string, number>) || {},
      by_doctor: appointments?.reduce((acc, a) => {
        if (a.status === 'completed' && a.doctor_id) {
          acc[a.doctor_id] = (acc[a.doctor_id] || 0) + (a.fee || 0);
        }
        return acc;
      }, {} as Record<string, number>) || {}
    }
  };
}
