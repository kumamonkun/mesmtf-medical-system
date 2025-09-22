import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/analytics/dashboard - Get dashboard analytics
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has permission to view analytics
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['admin', 'doctor', 'nurse', 'receptionist', 'pharmacist'].includes(profile.role)) {
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

    // Build base query conditions
    const dateCondition = `created_at >= '${startDate.toISOString()}' AND created_at <= '${endDate.toISOString()}'`;
    const departmentCondition = department ? `AND department = '${department}'` : '';
    const doctorCondition = doctorId ? `AND doctor_id = '${doctorId}'` : '';

    // Get patient statistics
    const { data: patientStats } = await supabase
      .from('patients')
      .select('id, created_at, gender, date_of_birth')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    // Get appointment statistics
    const { data: appointmentStats } = await supabase
      .from('appointments')
      .select('id, status, appointment_date, created_at, doctor_id')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    // Get diagnosis statistics
    const { data: diagnosisStats } = await supabase
      .from('diagnoses')
      .select('id, diagnosis, confidence_level, created_at, doctor_id')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    // Get treatment statistics
    const { data: treatmentStats } = await supabase
      .from('treatments')
      .select('id, status, created_at, doctor_id')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    // Get prescription statistics
    const { data: prescriptionStats } = await supabase
      .from('prescriptions')
      .select('id, status, created_at, doctor_id')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    // Get medical records statistics
    const { data: medicalRecordStats } = await supabase
      .from('medical_records')
      .select('id, record_type, created_at, doctor_id')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    // Get drug statistics
    const { data: drugStats } = await supabase
      .from('drugs')
      .select('id, stock, min_stock, expiry_date, created_at');

    // Calculate patient analytics
    const totalPatients = patientStats?.length || 0;
    const newPatients = patientStats?.filter(p => 
      new Date(p.created_at) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    ).length || 0;
    
    const genderDistribution = patientStats?.reduce((acc, patient) => {
      acc[patient.gender] = (acc[patient.gender] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    // Calculate age distribution
    const ageDistribution = patientStats?.reduce((acc, patient) => {
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

    // Calculate appointment analytics
    const totalAppointments = appointmentStats?.length || 0;
    const completedAppointments = appointmentStats?.filter(a => a.status === 'completed').length || 0;
    const cancelledAppointments = appointmentStats?.filter(a => a.status === 'cancelled').length || 0;
    const pendingAppointments = appointmentStats?.filter(a => a.status === 'pending').length || 0;
    const noShowAppointments = appointmentStats?.filter(a => a.status === 'no_show').length || 0;

    const appointmentStatusDistribution = appointmentStats?.reduce((acc, appointment) => {
      acc[appointment.status] = (acc[appointment.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    // Calculate diagnosis analytics
    const totalDiagnoses = diagnosisStats?.length || 0;
    const highConfidenceDiagnoses = diagnosisStats?.filter(d => d.confidence_level >= 0.8).length || 0;
    const mediumConfidenceDiagnoses = diagnosisStats?.filter(d => d.confidence_level >= 0.6 && d.confidence_level < 0.8).length || 0;
    const lowConfidenceDiagnoses = diagnosisStats?.filter(d => d.confidence_level < 0.6).length || 0;

    const diagnosisDistribution = diagnosisStats?.reduce((acc, diagnosis) => {
      acc[diagnosis.diagnosis] = (acc[diagnosis.diagnosis] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    // Calculate treatment analytics
    const totalTreatments = treatmentStats?.length || 0;
    const activeTreatments = treatmentStats?.filter(t => t.status === 'active').length || 0;
    const completedTreatments = treatmentStats?.filter(t => t.status === 'completed').length || 0;
    const pausedTreatments = treatmentStats?.filter(t => t.status === 'paused').length || 0;

    const treatmentStatusDistribution = treatmentStats?.reduce((acc, treatment) => {
      acc[treatment.status] = (acc[treatment.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    // Calculate prescription analytics
    const totalPrescriptions = prescriptionStats?.length || 0;
    const pendingPrescriptions = prescriptionStats?.filter(p => p.status === 'pending').length || 0;
    const fulfilledPrescriptions = prescriptionStats?.filter(p => p.status === 'fulfilled').length || 0;
    const cancelledPrescriptions = prescriptionStats?.filter(p => p.status === 'cancelled').length || 0;

    const prescriptionStatusDistribution = prescriptionStats?.reduce((acc, prescription) => {
      acc[prescription.status] = (acc[prescription.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    // Calculate medical records analytics
    const totalMedicalRecords = medicalRecordStats?.length || 0;
    const recordTypeDistribution = medicalRecordStats?.reduce((acc, record) => {
      acc[record.record_type] = (acc[record.record_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    // Calculate drug inventory analytics
    const totalDrugs = drugStats?.length || 0;
    const lowStockDrugs = drugStats?.filter(d => d.stock <= d.min_stock).length || 0;
    const outOfStockDrugs = drugStats?.filter(d => d.stock === 0).length || 0;
    const expiringDrugs = drugStats?.filter(d => 
      new Date(d.expiry_date) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    ).length || 0;

    // Calculate daily trends for the last 30 days
    const dailyTrends = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayAppointments = appointmentStats?.filter(a => 
        a.appointment_date?.startsWith(dateStr)
      ).length || 0;
      
      const dayPatients = patientStats?.filter(p => 
        p.created_at.startsWith(dateStr)
      ).length || 0;
      
      const dayDiagnoses = diagnosisStats?.filter(d => 
        d.created_at.startsWith(dateStr)
      ).length || 0;

      dailyTrends.push({
        date: dateStr,
        appointments: dayAppointments,
        patients: dayPatients,
        diagnoses: dayDiagnoses
      });
    }

    // Calculate doctor performance (if doctor_id is provided)
    let doctorPerformance = null;
    if (doctorId) {
      const doctorAppointments = appointmentStats?.filter(a => a.doctor_id === doctorId) || [];
      const doctorDiagnoses = diagnosisStats?.filter(d => d.doctor_id === doctorId) || [];
      const doctorTreatments = treatmentStats?.filter(t => t.doctor_id === doctorId) || [];
      const doctorPrescriptions = prescriptionStats?.filter(p => p.doctor_id === doctorId) || [];

      doctorPerformance = {
        appointments: doctorAppointments.length,
        diagnoses: doctorDiagnoses.length,
        treatments: doctorTreatments.length,
        prescriptions: doctorPrescriptions.length,
        completion_rate: doctorAppointments.length > 0 ? 
          (doctorAppointments.filter(a => a.status === 'completed').length / doctorAppointments.length) * 100 : 0
      };
    }

    return NextResponse.json({
      period: {
        days,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0]
      },
      patients: {
        total: totalPatients,
        new: newPatients,
        gender_distribution: genderDistribution,
        age_distribution: ageDistribution
      },
      appointments: {
        total: totalAppointments,
        completed: completedAppointments,
        cancelled: cancelledAppointments,
        pending: pendingAppointments,
        no_show: noShowAppointments,
        completion_rate: totalAppointments > 0 ? (completedAppointments / totalAppointments) * 100 : 0,
        status_distribution: appointmentStatusDistribution
      },
      diagnoses: {
        total: totalDiagnoses,
        high_confidence: highConfidenceDiagnoses,
        medium_confidence: mediumConfidenceDiagnoses,
        low_confidence: lowConfidenceDiagnoses,
        average_confidence: diagnosisStats?.length > 0 ? 
          diagnosisStats.reduce((sum, d) => sum + d.confidence_level, 0) / diagnosisStats.length : 0,
        diagnosis_distribution: diagnosisDistribution
      },
      treatments: {
        total: totalTreatments,
        active: activeTreatments,
        completed: completedTreatments,
        paused: pausedTreatments,
        status_distribution: treatmentStatusDistribution
      },
      prescriptions: {
        total: totalPrescriptions,
        pending: pendingPrescriptions,
        fulfilled: fulfilledPrescriptions,
        cancelled: cancelledPrescriptions,
        fulfillment_rate: totalPrescriptions > 0 ? (fulfilledPrescriptions / totalPrescriptions) * 100 : 0,
        status_distribution: prescriptionStatusDistribution
      },
      medical_records: {
        total: totalMedicalRecords,
        record_type_distribution: recordTypeDistribution
      },
      inventory: {
        total_drugs: totalDrugs,
        low_stock: lowStockDrugs,
        out_of_stock: outOfStockDrugs,
        expiring: expiringDrugs,
        low_stock_percentage: totalDrugs > 0 ? (lowStockDrugs / totalDrugs) * 100 : 0
      },
      daily_trends: dailyTrends,
      doctor_performance: doctorPerformance
    });

  } catch (error) {
    console.error('Error in GET /api/analytics/dashboard:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
