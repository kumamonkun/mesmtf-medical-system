import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/drugs/low-stock - Get drugs with low stock
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has permission to view low stock
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['admin', 'pharmacist', 'doctor', 'nurse'].includes(profile.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const category = searchParams.get('category') || '';

    // Build query for low stock drugs
    let query = supabase
      .from('drugs')
      .select('*', { count: 'exact' })
      .lt('stock', supabase.raw('min_stock'))
      .order('stock', { ascending: true });

    // Apply category filter
    if (category) {
      query = query.eq('category', category);
    }

    // Apply limit
    query = query.limit(limit);

    const { data: lowStockDrugs, error, count } = await query;

    if (error) {
      console.error('Error fetching low stock drugs:', error);
      return NextResponse.json({ error: 'Failed to fetch low stock drugs' }, { status: 500 });
    }

    // Add calculated fields
    const drugsWithCalculations = lowStockDrugs?.map(drug => ({
      ...drug,
      stock_deficit: drug.min_stock - drug.stock,
      stock_percentage: Math.round((drug.stock / drug.min_stock) * 100),
      days_to_expiry: Math.ceil((new Date(drug.expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
      is_expired: new Date(drug.expiry_date) <= new Date(),
      is_expiring_soon: new Date(drug.expiry_date) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      urgency: drug.stock === 0 ? 'critical' : 
               drug.stock <= drug.min_stock * 0.5 ? 'high' : 'medium'
    }));

    // Group by urgency
    const groupedDrugs = {
      critical: drugsWithCalculations?.filter(drug => drug.urgency === 'critical') || [],
      high: drugsWithCalculations?.filter(drug => drug.urgency === 'high') || [],
      medium: drugsWithCalculations?.filter(drug => drug.urgency === 'medium') || []
    };

    return NextResponse.json({
      drugs: drugsWithCalculations || [],
      grouped: groupedDrugs,
      total: count || 0,
      summary: {
        critical: groupedDrugs.critical.length,
        high: groupedDrugs.high.length,
        medium: groupedDrugs.medium.length,
        total: count || 0
      }
    });

  } catch (error) {
    console.error('Error in GET /api/drugs/low-stock:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
