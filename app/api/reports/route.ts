import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/reports - List all reports
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has permission to view reports
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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const reportType = searchParams.get('report_type') || '';
    const format = searchParams.get('format') || '';
    const status = searchParams.get('status') || '';
    const dateFrom = searchParams.get('date_from') || '';
    const dateTo = searchParams.get('date_to') || '';
    const generatedBy = searchParams.get('generated_by') || '';
    
    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from('reports')
      .select(`
        *,
        generated_by_user:user_profiles!reports_generated_by_fkey(
          id,
          first_name,
          last_name,
          role
        )
      `, { count: 'exact' })
      .order('created_at', { ascending: false });

    // Apply filters
    if (reportType) {
      query = query.eq('report_type', reportType);
    }
    
    if (format) {
      query = query.eq('format', format);
    }
    
    if (status) {
      query = query.eq('status', status);
    }
    
    if (dateFrom) {
      query = query.gte('created_at', dateFrom);
    }
    
    if (dateTo) {
      query = query.lte('created_at', dateTo);
    }
    
    if (generatedBy) {
      query = query.eq('generated_by', generatedBy);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: reports, error, count } = await query;

    if (error) {
      console.error('Error fetching reports:', error);
      return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 });
    }

    // Add calculated fields
    const reportsWithCalculations = reports?.map(report => ({
      ...report,
      days_ago: Math.ceil((new Date().getTime() - new Date(report.created_at).getTime()) / (1000 * 60 * 60 * 24)),
      is_recent: new Date(report.created_at) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      download_url: `/api/reports/download/${report.report_id}`,
      file_size: report.data ? JSON.stringify(report.data).length : 0
    }));

    return NextResponse.json({
      reports: reportsWithCalculations || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Error in GET /api/reports:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
