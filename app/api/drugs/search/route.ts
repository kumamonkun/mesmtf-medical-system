import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/drugs/search - Search drugs with advanced filters
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    const category = searchParams.get('category') || '';
    const dosageForm = searchParams.get('dosage_form') || '';
    const indication = searchParams.get('indication') || '';
    const requiresPrescription = searchParams.get('requires_prescription');
    const controlledSubstance = searchParams.get('controlled_substance');
    const stockStatus = searchParams.get('stock_status') || '';
    const sortBy = searchParams.get('sort_by') || 'name';
    const sortOrder = searchParams.get('sort_order') || 'asc';
    const limit = parseInt(searchParams.get('limit') || '20');

    // Build query
    let query = supabase
      .from('drugs')
      .select('*', { count: 'exact' });

    // Apply search filters
    if (q) {
      query = query.or(`
        name.ilike.%${q}%,
        generic_name.ilike.%${q}%,
        indication.cs.{${q}}
      `);
    }

    if (category) {
      query = query.eq('category', category);
    }

    if (dosageForm) {
      query = query.eq('dosage_form', dosageForm);
    }

    if (indication) {
      query = query.contains('indication', [indication]);
    }

    if (requiresPrescription !== null && requiresPrescription !== undefined) {
      query = query.eq('requires_prescription', requiresPrescription === 'true');
    }

    if (controlledSubstance !== null && controlledSubstance !== undefined) {
      query = query.eq('controlled_substance', controlledSubstance === 'true');
    }

    // Apply stock status filter
    if (stockStatus) {
      if (stockStatus === 'low') {
        query = query.lt('stock', supabase.raw('min_stock'));
      } else if (stockStatus === 'out') {
        query = query.eq('stock', 0);
      } else if (stockStatus === 'expiring') {
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        query = query.lte('expiry_date', thirtyDaysFromNow.toISOString().split('T')[0]);
      }
    }

    // Apply sorting
    const validSortFields = ['name', 'category', 'stock', 'expiry_date', 'price', 'created_at'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'name';
    const order = sortOrder === 'desc' ? false : true;
    
    query = query.order(sortField, { ascending: order });

    // Apply limit
    query = query.limit(limit);

    const { data: drugs, error, count } = await query;

    if (error) {
      console.error('Error searching drugs:', error);
      return NextResponse.json({ error: 'Failed to search drugs' }, { status: 500 });
    }

    // Add calculated fields
    const drugsWithCalculations = drugs?.map(drug => ({
      ...drug,
      stock_status: drug.stock <= drug.min_stock ? 'low' : 
                   drug.max_stock && drug.stock >= drug.max_stock ? 'high' : 'normal',
      days_to_expiry: Math.ceil((new Date(drug.expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
      is_expired: new Date(drug.expiry_date) <= new Date(),
      is_expiring_soon: new Date(drug.expiry_date) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    }));

    return NextResponse.json({
      drugs: drugsWithCalculations || [],
      total: count || 0,
      filters: {
        q,
        category,
        dosageForm,
        indication,
        requiresPrescription,
        controlledSubstance,
        stockStatus,
        sortBy: sortField,
        sortOrder: order ? 'asc' : 'desc'
      }
    });

  } catch (error) {
    console.error('Error in GET /api/drugs/search:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
