import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/analytics/patients - Get patient analytics
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has permission to view patient analytics
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['admin', 'doctor', 'nurse', 'receptionist'].includes(profile.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30'; // days
    const department = searchParams.get('department') || '';
    const doctorId = searchParams.get('doctor_id') || '';

    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const endDate = new Date();

    // Get all patients with related data
    const { data: patients } = await supabase
      .from('patients')
      .select(`
        id,
        patient_id,
        first_name,
        last_name,
        date_of_birth,
        gender,
        phone,
        email,
        created_at,
        medical_history,
        allergies,
        chronic_conditions
      `)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    // Get patient appointments
    const { data: appointments } = await supabase
      .from('appointments')
      .select(`
        id,
        patient_id,
        status,
        appointment_date,
        created_at,
        doctor_id
      `)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    // Get patient diagnoses
    const { data: diagnoses } = await supabase
      .from('diagnoses')
      .select(`
        id,
        patient_id,
        diagnosis,
        confidence_level,
        created_at,
        doctor_id
      `)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    // Get patient treatments
    const { data: treatments } = await supabase
      .from('treatments')
      .select(`
        id,
        patient_id,
        treatment_name,
        status,
        created_at,
        doctor_id
      `)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    // Get patient prescriptions
    const { data: prescriptions } = await supabase
      .from('prescriptions')
      .select(`
        id,
        patient_id,
        status,
        created_at,
        doctor_id
      `)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    // Get patient medical records
    const { data: medicalRecords } = await supabase
      .from('medical_records')
      .select(`
        id,
        patient_id,
        record_type,
        created_at,
        doctor_id
      `)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    // Calculate patient statistics
    const totalPatients = patients?.length || 0;
    const newPatients = patients?.filter(p => 
      new Date(p.created_at) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length || 0;

    // Gender distribution
    const genderDistribution = patients?.reduce((acc, patient) => {
      acc[patient.gender] = (acc[patient.gender] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    // Age distribution
    const ageDistribution = patients?.reduce((acc, patient) => {
      if (patient.date_of_birth) {
        const age = Math.floor((new Date().getTime() - new Date(patient.date_of_birth).getTime()) / (1000 * 60 * 60 * 24 * 365.25));
        if (age < 18) acc['0-17'] = (acc['0-17'] || 0) + 1;
        else if (age < 30) acc['18-29'] = (acc['18-29'] || 0) + 1;
        else if (age < 45) acc['30-44'] = (acc['30-44'] || 0) + 1;
        else if (age < 60) acc['45-59'] = (acc['45-59'] || 0) + 1;
        else acc['60+'] = (acc['60+'] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>) || {};

    // Patient activity analysis
    const patientActivity = patients?.map(patient => {
      const patientAppointments = appointments?.filter(a => a.patient_id === patient.id) || [];
      const patientDiagnoses = diagnoses?.filter(d => d.patient_id === patient.id) || [];
      const patientTreatments = treatments?.filter(t => t.patient_id === patient.id) || [];
      const patientPrescriptions = prescriptions?.filter(p => p.patient_id === patient.id) || [];
      const patientMedicalRecords = medicalRecords?.filter(m => m.patient_id === patient.id) || [];

      return {
        patient_id: patient.patient_id,
        name: `${patient.first_name} ${patient.last_name}`,
        age: patient.date_of_birth ? 
          Math.floor((new Date().getTime() - new Date(patient.date_of_birth).getTime()) / (1000 * 60 * 60 * 24 * 365.25)) : null,
        gender: patient.gender,
        appointments: patientAppointments.length,
        diagnoses: patientDiagnoses.length,
        treatments: patientTreatments.length,
        prescriptions: patientPrescriptions.length,
        medical_records: patientMedicalRecords.length,
        total_activity: patientAppointments.length + patientDiagnoses.length + 
                       patientTreatments.length + patientPrescriptions.length + 
                       patientMedicalRecords.length,
        last_activity: Math.max(
          ...patientAppointments.map(a => new Date(a.created_at).getTime()),
          ...patientDiagnoses.map(d => new Date(d.created_at).getTime()),
          ...patientTreatments.map(t => new Date(t.created_at).getTime()),
          ...patientPrescriptions.map(p => new Date(p.created_at).getTime()),
          ...patientMedicalRecords.map(m => new Date(m.created_at).getTime()),
          new Date(patient.created_at).getTime()
        )
      };
    }) || [];

    // Sort by activity level
    patientActivity.sort((a, b) => b.total_activity - a.total_activity);

    // Most active patients (top 10)
    const mostActivePatients = patientActivity.slice(0, 10);

    // Patient demographics
    const demographics = {
      total_patients: totalPatients,
      new_patients: newPatients,
      gender_distribution: genderDistribution,
      age_distribution: ageDistribution,
      average_age: patients?.length > 0 ? 
        Math.round(patients.reduce((sum, p) => {
          if (p.date_of_birth) {
            return sum + Math.floor((new Date().getTime() - new Date(p.date_of_birth).getTime()) / (1000 * 60 * 60 * 24 * 365.25));
          }
          return sum;
        }, 0) / patients.length) : 0
    };

    // Patient health conditions analysis
    const healthConditions = {
      with_allergies: patients?.filter(p => p.allergies && p.allergies.length > 0).length || 0,
      with_chronic_conditions: patients?.filter(p => p.chronic_conditions && p.chronic_conditions.length > 0).length || 0,
      with_medical_history: patients?.filter(p => p.medical_history && p.medical_history.length > 0).length || 0
    };

    // Common allergies
    const commonAllergies = patients?.reduce((acc, patient) => {
      if (patient.allergies) {
        patient.allergies.forEach(allergy => {
          acc[allergy] = (acc[allergy] || 0) + 1;
        });
      }
      return acc;
    }, {} as Record<string, number>) || {};

    // Common chronic conditions
    const commonChronicConditions = patients?.reduce((acc, patient) => {
      if (patient.chronic_conditions) {
        patient.chronic_conditions.forEach(condition => {
          acc[condition] = (acc[condition] || 0) + 1;
        });
      }
      return acc;
    }, {} as Record<string, number>) || {};

    // Patient engagement metrics
    const engagementMetrics = {
      average_appointments_per_patient: totalPatients > 0 ? 
        Math.round((appointments?.length || 0) / totalPatients * 100) / 100 : 0,
      average_diagnoses_per_patient: totalPatients > 0 ? 
        Math.round((diagnoses?.length || 0) / totalPatients * 100) / 100 : 0,
      average_treatments_per_patient: totalPatients > 0 ? 
        Math.round((treatments?.length || 0) / totalPatients * 100) / 100 : 0,
      average_prescriptions_per_patient: totalPatients > 0 ? 
        Math.round((prescriptions?.length || 0) / totalPatients * 100) / 100 : 0
    };

    // Patient retention analysis
    const retentionAnalysis = {
      new_patients_this_period: newPatients,
      returning_patients: totalPatients - newPatients,
      retention_rate: totalPatients > 0 ? ((totalPatients - newPatients) / totalPatients) * 100 : 0
    };

    return NextResponse.json({
      period: {
        days,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0]
      },
      demographics,
      health_conditions: healthConditions,
      common_allergies: commonAllergies,
      common_chronic_conditions: commonChronicConditions,
      engagement_metrics: engagementMetrics,
      retention_analysis: retentionAnalysis,
      most_active_patients: mostActivePatients,
      patient_activity: patientActivity
    });

  } catch (error) {
    console.error('Error in GET /api/analytics/patients:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
