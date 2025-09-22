import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/analytics/financial - Get financial analytics
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has permission to view financial analytics
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['admin', 'receptionist'].includes(profile.role)) {
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

    // Get appointment data for revenue calculation
    const { data: appointments } = await supabase
      .from('appointments')
      .select(`
        id,
        status,
        appointment_date,
        created_at,
        doctor_id,
        department,
        fee
      `)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    // Get prescription data for pharmacy revenue
    const { data: prescriptions } = await supabase
      .select(`
        *,
        drug:drugs!prescriptions_drug_id_fkey(
          id,
          name,
          price,
          cost
        )
      `)
      .from('prescriptions')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    // Get drug inventory data for cost analysis
    const { data: drugs } = await supabase
      .from('drugs')
      .select('id, name, price, cost, stock, category')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    // Calculate appointment revenue
    const completedAppointments = appointments?.filter(a => a.status === 'completed') || [];
    const totalAppointmentRevenue = completedAppointments.reduce((sum, appointment) => 
      sum + (appointment.fee || 0), 0);

    const averageAppointmentFee = completedAppointments.length > 0 ? 
      totalAppointmentRevenue / completedAppointments.length : 0;

    // Calculate prescription revenue
    const fulfilledPrescriptions = prescriptions?.filter(p => p.status === 'fulfilled') || [];
    const totalPrescriptionRevenue = fulfilledPrescriptions.reduce((sum, prescription) => {
      if (prescription.drug && prescription.quantity) {
        return sum + (prescription.drug.price * prescription.quantity);
      }
      return sum;
    }, 0);

    const averagePrescriptionValue = fulfilledPrescriptions.length > 0 ? 
      totalPrescriptionRevenue / fulfilledPrescriptions.length : 0;

    // Calculate total revenue
    const totalRevenue = totalAppointmentRevenue + totalPrescriptionRevenue;

    // Calculate drug costs
    const totalDrugCosts = drugs?.reduce((sum, drug) => 
      sum + ((drug.cost || 0) * drug.stock), 0) || 0;

    // Calculate gross profit
    const grossProfit = totalPrescriptionRevenue - totalDrugCosts;
    const grossProfitMargin = totalPrescriptionRevenue > 0 ? 
      (grossProfit / totalPrescriptionRevenue) * 100 : 0;

    // Revenue by department
    const revenueByDepartment = completedAppointments.reduce((acc, appointment) => {
      const department = appointment.department || 'General';
      acc[department] = (acc[department] || 0) + (appointment.fee || 0);
      return acc;
    }, {} as Record<string, number>);

    // Revenue by doctor
    const revenueByDoctor = completedAppointments.reduce((acc, appointment) => {
      if (appointment.doctor_id) {
        acc[appointment.doctor_id] = (acc[appointment.doctor_id] || 0) + (appointment.fee || 0);
      }
      return acc;
    }, {} as Record<string, number>);

    // Daily revenue trends
    const dailyRevenueTrends = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayAppointments = completedAppointments.filter(a => 
        a.appointment_date?.startsWith(dateStr)
      );
      
      const dayPrescriptions = fulfilledPrescriptions.filter(p => 
        p.fulfilled_at?.startsWith(dateStr)
      );

      const dayAppointmentRevenue = dayAppointments.reduce((sum, a) => sum + (a.fee || 0), 0);
      const dayPrescriptionRevenue = dayPrescriptions.reduce((sum, p) => 
        sum + (p.drug?.price * p.quantity || 0), 0);

      dailyRevenueTrends.push({
        date: dateStr,
        appointment_revenue: dayAppointmentRevenue,
        prescription_revenue: dayPrescriptionRevenue,
        total_revenue: dayAppointmentRevenue + dayPrescriptionRevenue
      });
    }

    // Monthly revenue projection
    const averageDailyRevenue = dailyRevenueTrends.reduce((sum, day) => 
      sum + day.total_revenue, 0) / days;
    const projectedMonthlyRevenue = averageDailyRevenue * 30;

    // Revenue growth calculation
    const firstHalfRevenue = dailyRevenueTrends.slice(0, Math.floor(days / 2))
      .reduce((sum, day) => sum + day.total_revenue, 0);
    const secondHalfRevenue = dailyRevenueTrends.slice(Math.floor(days / 2))
      .reduce((sum, day) => sum + day.total_revenue, 0);
    
    const revenueGrowth = firstHalfRevenue > 0 ? 
      ((secondHalfRevenue - firstHalfRevenue) / firstHalfRevenue) * 100 : 0;

    // Top revenue generating departments
    const topDepartments = Object.entries(revenueByDepartment)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([department, revenue]) => ({ department, revenue }));

    // Top revenue generating doctors
    const topDoctors = Object.entries(revenueByDoctor)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([doctorId, revenue]) => ({ doctor_id: doctorId, revenue }));

    // Cost analysis
    const costAnalysis = {
      total_drug_costs: totalDrugCosts,
      average_drug_cost: drugs?.length > 0 ? totalDrugCosts / drugs.length : 0,
      cost_by_category: drugs?.reduce((acc, drug) => {
        acc[drug.category] = (acc[drug.category] || 0) + ((drug.cost || 0) * drug.stock);
        return acc;
      }, {} as Record<string, number>) || {}
    };

    // Profitability analysis
    const profitabilityAnalysis = {
      total_revenue: totalRevenue,
      total_costs: totalDrugCosts,
      gross_profit: grossProfit,
      gross_profit_margin: grossProfitMargin,
      net_profit_margin: totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0
    };

    // Revenue distribution
    const revenueDistribution = {
      appointment_revenue: totalAppointmentRevenue,
      prescription_revenue: totalPrescriptionRevenue,
      appointment_percentage: totalRevenue > 0 ? (totalAppointmentRevenue / totalRevenue) * 100 : 0,
      prescription_percentage: totalRevenue > 0 ? (totalPrescriptionRevenue / totalRevenue) * 100 : 0
    };

    // Financial KPIs
    const financialKPIs = {
      total_revenue: totalRevenue,
      average_daily_revenue: averageDailyRevenue,
      projected_monthly_revenue: projectedMonthlyRevenue,
      revenue_growth: revenueGrowth,
      gross_profit_margin: grossProfitMargin,
      average_appointment_fee: averageAppointmentFee,
      average_prescription_value: averagePrescriptionValue
    };

    // Payment method analysis (if available)
    const paymentMethodAnalysis = {
      // This would be implemented when payment tracking is added
      cash: 0,
      card: 0,
      insurance: 0,
      other: 0
    };

    return NextResponse.json({
      period: {
        days,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0]
      },
      revenue: {
        total: totalRevenue,
        appointment: totalAppointmentRevenue,
        prescription: totalPrescriptionRevenue,
        distribution: revenueDistribution
      },
      costs: costAnalysis,
      profitability: profitabilityAnalysis,
      kpis: financialKPIs,
      trends: {
        daily_revenue: dailyRevenueTrends,
        revenue_growth: revenueGrowth,
        projected_monthly: projectedMonthlyRevenue
      },
      top_performers: {
        departments: topDepartments,
        doctors: topDoctors
      },
      payment_methods: paymentMethodAnalysis
    });

  } catch (error) {
    console.error('Error in GET /api/analytics/financial:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
