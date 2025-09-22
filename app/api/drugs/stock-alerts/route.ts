import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/drugs/stock-alerts - Get low stock alerts
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has permission to view stock alerts
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['admin', 'pharmacist', 'nurse'].includes(profile.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const threshold = parseInt(searchParams.get('threshold') || '10'); // Default threshold of 10 units

    // Get all drugs
    const { data: drugs, error: drugsError } = await supabase
      .from('drugs')
      .select('*')
      .order('name', { ascending: true });

    if (drugsError) {
      console.error('Error fetching drugs:', drugsError);
      return NextResponse.json({ error: 'Failed to fetch drugs' }, { status: 500 });
    }

    // Mock stock levels (in real system, this would come from inventory table)
    const drugsWithStock = drugs?.map(drug => ({
      ...drug,
      current_stock: Math.floor(Math.random() * 50) + 1, // Mock stock between 1-50
      min_stock: threshold,
      max_stock: threshold * 3,
      last_restocked: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString() // Mock last restocked date
    })) || [];

    // Filter low stock drugs
    const lowStockDrugs = drugsWithStock.filter(drug => drug.current_stock <= drug.min_stock);
    
    // Categorize by severity
    const criticalStock = lowStockDrugs.filter(drug => drug.current_stock <= drug.min_stock * 0.5);
    const warningStock = lowStockDrugs.filter(drug => drug.current_stock > drug.min_stock * 0.5 && drug.current_stock <= drug.min_stock);

    // Calculate stock statistics
    const stockStats = {
      total_drugs: drugsWithStock.length,
      low_stock_count: lowStockDrugs.length,
      critical_count: criticalStock.length,
      warning_count: warningStock.length,
      total_value: drugsWithStock.reduce((sum, drug) => sum + (drug.current_stock * (Math.random() * 50 + 10)), 0), // Mock value calculation
      threshold
    };

    return NextResponse.json({
      stock_alerts: {
        critical: criticalStock,
        warning: warningStock,
        all_low_stock: lowStockDrugs
      },
      statistics: stockStats
    });

  } catch (error) {
    console.error('Error in GET /api/drugs/stock-alerts:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
