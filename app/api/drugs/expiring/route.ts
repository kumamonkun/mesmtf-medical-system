import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/drugs/expiring - Get expiring drugs
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has permission to view expiring drugs
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
    const days = parseInt(searchParams.get('days') || '30');
    const limit = parseInt(searchParams.get('limit') || '50');
    const category = searchParams.get('category') || '';

    // Calculate expiry date threshold
    const expiryThreshold = new Date();
    expiryThreshold.setDate(expiryThreshold.getDate() + days);

    // Build query for expiring drugs
    let query = supabase
      .from('drugs')
      .select('*', { count: 'exact' })
      .lte('expiry_date', expiryThreshold.toISOString().split('T')[0])
      .gt('stock', 0) // Only include drugs with stock
      .order('expiry_date', { ascending: true });

    // Apply category filter
    if (category) {
      query = query.eq('category', category);
    }

    // Apply limit
    query = query.limit(limit);

    const { data: expiringDrugs, error, count } = await query;

    if (error) {
      console.error('Error fetching expiring drugs:', error);
      return NextResponse.json({ error: 'Failed to fetch expiring drugs' }, { status: 500 });
    }

    // Add calculated fields
    const drugsWithCalculations = expiringDrugs?.map(drug => {
      const daysToExpiry = Math.ceil((new Date(drug.expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      const isExpired = daysToExpiry <= 0;
      const isExpiringSoon = daysToExpiry <= 7;
      
      return {
        ...drug,
        days_to_expiry: daysToExpiry,
        is_expired: isExpired,
        is_expiring_soon: isExpiringSoon,
        urgency: isExpired ? 'expired' : 
                 daysToExpiry <= 7 ? 'critical' : 
                 daysToExpiry <= 14 ? 'high' : 'medium',
        stock_status: drug.stock <= drug.min_stock ? 'low' : 'normal'
      };
    });

    // Group by urgency
    const groupedDrugs = {
      expired: drugsWithCalculations?.filter(drug => drug.urgency === 'expired') || [],
      critical: drugsWithCalculations?.filter(drug => drug.urgency === 'critical') || [],
      high: drugsWithCalculations?.filter(drug => drug.urgency === 'high') || [],
      medium: drugsWithCalculations?.filter(drug => drug.urgency === 'medium') || []
    };

    // Calculate summary statistics
    const totalValue = drugsWithCalculations?.reduce((sum, drug) => sum + (drug.stock * drug.cost), 0) || 0;
    const totalStock = drugsWithCalculations?.reduce((sum, drug) => sum + drug.stock, 0) || 0;

    return NextResponse.json({
      drugs: drugsWithCalculations || [],
      grouped: groupedDrugs,
      total: count || 0,
      summary: {
        expired: groupedDrugs.expired.length,
        critical: groupedDrugs.critical.length,
        high: groupedDrugs.high.length,
        medium: groupedDrugs.medium.length,
        total: count || 0,
        total_value: totalValue,
        total_stock: totalStock
      },
      filters: {
        days,
        category,
        expiry_threshold: expiryThreshold.toISOString().split('T')[0]
      }
    });

  } catch (error) {
    console.error('Error in GET /api/drugs/expiring:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
