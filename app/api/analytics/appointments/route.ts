import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/analytics/appointments - Get appointment analytics
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has permission to view appointment analytics
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
    const status = searchParams.get('status') || '';

    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const endDate = new Date();

    // Build query conditions
    let query = supabase
      .from('appointments')
      .select(`
        *,
        patient:patients!appointments_patient_id_fkey(
          id,
          patient_id,
          first_name,
          last_name,
          phone,
          date_of_birth,
          gender
        ),
        doctor:doctors!appointments_doctor_id_fkey(
          id,
          name,
          specialty,
          phone
        )
      `)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    if (department) {
      query = query.eq('department', department);
    }
    if (doctorId) {
      query = query.eq('doctor_id', doctorId);
    }
    if (status) {
      query = query.eq('status', status);
    }

    const { data: appointments } = await query;

    // Calculate appointment statistics
    const totalAppointments = appointments?.length || 0;
    const completedAppointments = appointments?.filter(a => a.status === 'completed').length || 0;
    const cancelledAppointments = appointments?.filter(a => a.status === 'cancelled').length || 0;
    const pendingAppointments = appointments?.filter(a => a.status === 'pending').length || 0;
    const noShowAppointments = appointments?.filter(a => a.status === 'no_show').length || 0;
    const inProgressAppointments = appointments?.filter(a => a.status === 'in_progress').length || 0;

    // Status distribution
    const statusDistribution = appointments?.reduce((acc, appointment) => {
      acc[appointment.status] = (acc[appointment.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    // Completion rate
    const completionRate = totalAppointments > 0 ? (completedAppointments / totalAppointments) * 100 : 0;

    // No-show rate
    const noShowRate = totalAppointments > 0 ? (noShowAppointments / totalAppointments) * 100 : 0;

    // Cancellation rate
    const cancellationRate = totalAppointments > 0 ? (cancelledAppointments / totalAppointments) * 100 : 0;

    // Appointment type distribution
    const typeDistribution = appointments?.reduce((acc, appointment) => {
      acc[appointment.appointment_type] = (acc[appointment.appointment_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    // Department distribution
    const departmentDistribution = appointments?.reduce((acc, appointment) => {
      if (appointment.department) {
        acc[appointment.department] = (acc[appointment.department] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>) || {};

    // Doctor performance
    const doctorPerformance = appointments?.reduce((acc, appointment) => {
      if (appointment.doctor_id) {
        if (!acc[appointment.doctor_id]) {
          acc[appointment.doctor_id] = {
            doctor_name: appointment.doctor?.name || 'Unknown',
            specialty: appointment.doctor?.specialty || 'Unknown',
            total_appointments: 0,
            completed: 0,
            cancelled: 0,
            no_show: 0,
            completion_rate: 0
          };
        }
        acc[appointment.doctor_id].total_appointments++;
        if (appointment.status === 'completed') acc[appointment.doctor_id].completed++;
        if (appointment.status === 'cancelled') acc[appointment.doctor_id].cancelled++;
        if (appointment.status === 'no_show') acc[appointment.doctor_id].no_show++;
      }
      return acc;
    }, {} as Record<string, any>) || {};

    // Calculate completion rates for each doctor
    Object.values(doctorPerformance).forEach((doctor: any) => {
      doctor.completion_rate = doctor.total_appointments > 0 ? 
        (doctor.completed / doctor.total_appointments) * 100 : 0;
    });

    // Sort doctors by completion rate
    const sortedDoctors = Object.values(doctorPerformance).sort((a: any, b: any) => 
      b.completion_rate - a.completion_rate
    );

    // Daily appointment trends
    const dailyTrends = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayAppointments = appointments?.filter(a => 
        a.appointment_date?.startsWith(dateStr)
      ) || [];
      
      const dayCompleted = dayAppointments.filter(a => a.status === 'completed').length;
      const dayCancelled = dayAppointments.filter(a => a.status === 'cancelled').length;
      const dayNoShow = dayAppointments.filter(a => a.status === 'no_show').length;
      const dayPending = dayAppointments.filter(a => a.status === 'pending').length;

      dailyTrends.push({
        date: dateStr,
        total: dayAppointments.length,
        completed: dayCompleted,
        cancelled: dayCancelled,
        no_show: dayNoShow,
        pending: dayPending
      });
    }

    // Hourly appointment distribution
    const hourlyDistribution = appointments?.reduce((acc, appointment) => {
      if (appointment.appointment_time) {
        const hour = parseInt(appointment.appointment_time.split(':')[0]);
        acc[hour] = (acc[hour] || 0) + 1;
      }
      return acc;
    }, {} as Record<number, number>) || {};

    // Appointment duration analysis
    const durationAnalysis = appointments?.reduce((acc, appointment) => {
      if (appointment.duration) {
        const duration = appointment.duration;
        if (duration <= 15) acc['0-15min'] = (acc['0-15min'] || 0) + 1;
        else if (duration <= 30) acc['16-30min'] = (acc['16-30min'] || 0) + 1;
        else if (duration <= 45) acc['31-45min'] = (acc['31-45min'] || 0) + 1;
        else if (duration <= 60) acc['46-60min'] = (acc['46-60min'] || 0) + 1;
        else acc['60+min'] = (acc['60+min'] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>) || {};

    // Average appointment duration
    const averageDuration = appointments?.length > 0 ? 
      Math.round(appointments.reduce((sum, a) => sum + (a.duration || 0), 0) / appointments.length) : 0;

    // Patient demographics for appointments
    const patientDemographics = {
      gender_distribution: appointments?.reduce((acc, appointment) => {
        if (appointment.patient?.gender) {
          acc[appointment.patient.gender] = (acc[appointment.patient.gender] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>) || {},
      
      age_distribution: appointments?.reduce((acc, appointment) => {
        if (appointment.patient?.date_of_birth) {
          const age = Math.floor((new Date().getTime() - new Date(appointment.patient.date_of_birth).getTime()) / (1000 * 60 * 60 * 24 * 365.25));
          if (age < 18) acc['0-17'] = (acc['0-17'] || 0) + 1;
          else if (age < 30) acc['18-29'] = (acc['18-29'] || 0) + 1;
          else if (age < 45) acc['30-44'] = (acc['30-44'] || 0) + 1;
          else if (age < 60) acc['45-59'] = (acc['45-59'] || 0) + 1;
          else acc['60+'] = (acc['60+'] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>) || {}
    };

    // Appointment patterns
    const patterns = {
      most_common_type: Object.keys(typeDistribution).reduce((a, b) => 
        typeDistribution[a] > typeDistribution[b] ? a : b, ''),
      most_common_department: Object.keys(departmentDistribution).reduce((a, b) => 
        departmentDistribution[a] > departmentDistribution[b] ? a : b, ''),
      busiest_hour: Object.keys(hourlyDistribution).reduce((a, b) => 
        hourlyDistribution[parseInt(a)] > hourlyDistribution[parseInt(b)] ? a : b, ''),
      average_duration: averageDuration
    };

    return NextResponse.json({
      period: {
        days,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0]
      },
      summary: {
        total_appointments: totalAppointments,
        completed: completedAppointments,
        cancelled: cancelledAppointments,
        pending: pendingAppointments,
        no_show: noShowAppointments,
        in_progress: inProgressAppointments,
        completion_rate: completionRate,
        no_show_rate: noShowRate,
        cancellation_rate: cancellationRate
      },
      distributions: {
        status: statusDistribution,
        type: typeDistribution,
        department: departmentDistribution,
        hourly: hourlyDistribution,
        duration: durationAnalysis
      },
      patient_demographics: patientDemographics,
      doctor_performance: sortedDoctors,
      daily_trends: dailyTrends,
      patterns: patterns
    });

  } catch (error) {
    console.error('Error in GET /api/analytics/appointments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
