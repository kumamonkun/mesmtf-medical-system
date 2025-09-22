import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/analytics/pharmacy - Get pharmacy analytics
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has permission to view pharmacy analytics
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
    const category = searchParams.get('category') || '';
    const supplier = searchParams.get('supplier') || '';

    const days = parseInt(period);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const endDate = new Date();

    // Get drug inventory data
    const { data: drugs } = await supabase
      .from('drugs')
      .select('*')
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    // Get prescription data
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
          price,
          cost
        ),
        doctor:doctors!prescriptions_doctor_id_fkey(
          id,
          name,
          specialty
        )
      `)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    // Get drug administration data
    const { data: drugAdministrations } = await supabase
      .from('drug_administration')
      .select(`
        *,
        patient:patients!drug_administration_patient_id_fkey(
          id,
          patient_id,
          first_name,
          last_name
        ),
        drug:drugs!drug_administration_drug_id_fkey(
          id,
          name,
          category
        )
      `)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    // Calculate inventory statistics
    const totalDrugs = drugs?.length || 0;
    const lowStockDrugs = drugs?.filter(d => d.stock <= d.min_stock).length || 0;
    const outOfStockDrugs = drugs?.filter(d => d.stock === 0).length || 0;
    const expiringDrugs = drugs?.filter(d => 
      new Date(d.expiry_date) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    ).length || 0;

    // Calculate total inventory value
    const totalInventoryValue = drugs?.reduce((sum, drug) => 
      sum + (drug.stock * (drug.cost || drug.price)), 0) || 0;

    // Calculate total inventory cost
    const totalInventoryCost = drugs?.reduce((sum, drug) => 
      sum + (drug.stock * (drug.cost || 0)), 0) || 0;

    // Inventory value by category
    const inventoryValueByCategory = drugs?.reduce((acc, drug) => {
      acc[drug.category] = (acc[drug.category] || 0) + (drug.stock * (drug.cost || drug.price));
      return acc;
    }, {} as Record<string, number>) || {};

    // Drug category distribution
    const categoryDistribution = drugs?.reduce((acc, drug) => {
      acc[drug.category] = (acc[drug.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    // Supplier distribution
    const supplierDistribution = drugs?.reduce((acc, drug) => {
      acc[drug.supplier] = (acc[drug.supplier] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    // Prescription statistics
    const totalPrescriptions = prescriptions?.length || 0;
    const pendingPrescriptions = prescriptions?.filter(p => p.status === 'pending').length || 0;
    const fulfilledPrescriptions = prescriptions?.filter(p => p.status === 'fulfilled').length || 0;
    const cancelledPrescriptions = prescriptions?.filter(p => p.status === 'cancelled').length || 0;

    const prescriptionStatusDistribution = prescriptions?.reduce((acc, prescription) => {
      acc[prescription.status] = (acc[prescription.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    // Prescription fulfillment rate
    const fulfillmentRate = totalPrescriptions > 0 ? (fulfilledPrescriptions / totalPrescriptions) * 100 : 0;

    // Most prescribed drugs
    const drugPrescriptionCounts = prescriptions?.reduce((acc, prescription) => {
      if (prescription.drug) {
        const drugName = prescription.drug.name;
        acc[drugName] = (acc[drugName] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>) || {};

    const mostPrescribedDrugs = Object.entries(drugPrescriptionCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([drug, count]) => ({ drug, count }));

    // Prescription value analysis
    const totalPrescriptionValue = prescriptions?.reduce((sum, prescription) => {
      if (prescription.drug && prescription.quantity) {
        return sum + (prescription.drug.price * prescription.quantity);
      }
      return sum;
    }, 0) || 0;

    const averagePrescriptionValue = totalPrescriptions > 0 ? 
      totalPrescriptionValue / totalPrescriptions : 0;

    // Drug administration statistics
    const totalAdministrations = drugAdministrations?.length || 0;
    const administeredCount = drugAdministrations?.filter(a => a.status === 'administered').length || 0;
    const missedCount = drugAdministrations?.filter(a => a.status === 'missed').length || 0;
    const scheduledCount = drugAdministrations?.filter(a => a.status === 'scheduled').length || 0;

    const administrationStatusDistribution = drugAdministrations?.reduce((acc, admin) => {
      acc[admin.status] = (acc[admin.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    // Most administered drugs
    const drugAdministrationCounts = drugAdministrations?.reduce((acc, admin) => {
      if (admin.drug) {
        const drugName = admin.drug.name;
        acc[drugName] = (acc[drugName] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>) || {};

    const mostAdministeredDrugs = Object.entries(drugAdministrationCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([drug, count]) => ({ drug, count }));

    // Daily trends
    const dailyTrends = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayPrescriptions = prescriptions?.filter(p => 
        p.created_at.startsWith(dateStr)
      ) || [];
      
      const dayAdministrations = drugAdministrations?.filter(a => 
        a.administration_date?.startsWith(dateStr)
      ) || [];

      dailyTrends.push({
        date: dateStr,
        prescriptions: dayPrescriptions.length,
        administrations: dayAdministrations.length,
        prescription_value: dayPrescriptions.reduce((sum, p) => 
          sum + (p.drug?.price * p.quantity || 0), 0)
      });
    }

    // Stock alerts
    const stockAlerts = drugs?.filter(drug => 
      drug.stock <= drug.min_stock
    ).map(drug => ({
      drug_name: drug.name,
      current_stock: drug.stock,
      min_stock: drug.min_stock,
      deficit: drug.min_stock - drug.stock,
      urgency: drug.stock === 0 ? 'critical' : 
               drug.stock <= drug.min_stock * 0.5 ? 'high' : 'medium'
    })) || [];

    // Expiry alerts
    const expiryAlerts = drugs?.filter(drug => 
      new Date(drug.expiry_date) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    ).map(drug => ({
      drug_name: drug.name,
      expiry_date: drug.expiry_date,
      days_to_expiry: Math.ceil((new Date(drug.expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
      urgency: new Date(drug.expiry_date) <= new Date() ? 'expired' :
               new Date(drug.expiry_date) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) ? 'critical' : 'warning'
    })) || [];

    // Revenue analysis
    const revenueAnalysis = {
      total_prescription_value: totalPrescriptionValue,
      average_prescription_value: averagePrescriptionValue,
      inventory_value: totalInventoryValue,
      inventory_cost: totalInventoryCost,
      profit_margin: totalInventoryValue > 0 ? 
        ((totalInventoryValue - totalInventoryCost) / totalInventoryValue) * 100 : 0
    };

    // Performance metrics
    const performanceMetrics = {
      fulfillment_rate: fulfillmentRate,
      stock_availability: totalDrugs > 0 ? ((totalDrugs - outOfStockDrugs) / totalDrugs) * 100 : 0,
      low_stock_percentage: totalDrugs > 0 ? (lowStockDrugs / totalDrugs) * 100 : 0,
      expiring_percentage: totalDrugs > 0 ? (expiringDrugs / totalDrugs) * 100 : 0
    };

    return NextResponse.json({
      period: {
        days,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0]
      },
      inventory: {
        total_drugs: totalDrugs,
        low_stock: lowStockDrugs,
        out_of_stock: outOfStockDrugs,
        expiring: expiringDrugs,
        total_value: totalInventoryValue,
        total_cost: totalInventoryCost,
        value_by_category: inventoryValueByCategory,
        category_distribution: categoryDistribution,
        supplier_distribution: supplierDistribution
      },
      prescriptions: {
        total: totalPrescriptions,
        pending: pendingPrescriptions,
        fulfilled: fulfilledPrescriptions,
        cancelled: cancelledPrescriptions,
        fulfillment_rate: fulfillmentRate,
        status_distribution: prescriptionStatusDistribution,
        most_prescribed: mostPrescribedDrugs,
        total_value: totalPrescriptionValue,
        average_value: averagePrescriptionValue
      },
      administrations: {
        total: totalAdministrations,
        administered: administeredCount,
        missed: missedCount,
        scheduled: scheduledCount,
        status_distribution: administrationStatusDistribution,
        most_administered: mostAdministeredDrugs
      },
      alerts: {
        stock_alerts: stockAlerts,
        expiry_alerts: expiryAlerts
      },
      revenue: revenueAnalysis,
      performance: performanceMetrics,
      daily_trends: dailyTrends
    });

  } catch (error) {
    console.error('Error in GET /api/analytics/pharmacy:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
