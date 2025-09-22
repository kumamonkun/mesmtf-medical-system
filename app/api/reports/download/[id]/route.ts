import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/reports/download/[id] - Download report
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has permission to download reports
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['admin', 'doctor', 'nurse', 'receptionist', 'pharmacist'].includes(profile.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { id: reportId } = params;

    // Get report
    const { data: report, error: reportError } = await supabase
      .from('reports')
      .select('*')
      .eq('report_id', reportId)
      .single();

    if (reportError) {
      if (reportError.code === 'PGRST116') {
        return NextResponse.json({ error: 'Report not found' }, { status: 404 });
      }
      console.error('Error fetching report:', reportError);
      return NextResponse.json({ error: 'Failed to fetch report' }, { status: 500 });
    }

    // Check if user can access this report (non-admin users can only access their own reports)
    if (profile.role !== 'admin' && report.generated_by !== user.id) {
      return NextResponse.json({ 
        error: 'You can only download reports you generated' 
      }, { status: 403 });
    }

    // Log download activity
    const { error: logError } = await supabase
      .from('report_download_logs')
      .insert({
        report_id: reportId,
        downloaded_by: user.id,
        downloaded_at: new Date().toISOString(),
        ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
      });

    if (logError) {
      console.error('Error logging download:', logError);
      // Don't fail the download if logging fails
    }

    // Return report data based on format
    if (report.format === 'json') {
      return NextResponse.json({
        metadata: {
          report_id: report.report_id,
          report_type: report.report_type,
          format: report.format,
          generated_at: report.created_at,
          date_range: {
            from: report.date_from,
            to: report.date_to
          }
        },
        data: report.data
      });
    } else {
      // For other formats, return the data with format information
      // The frontend will handle the actual file generation
      return NextResponse.json({
        metadata: {
          report_id: report.report_id,
          report_type: report.report_type,
          format: report.format,
          generated_at: report.created_at,
          date_range: {
            from: report.date_from,
            to: report.date_to
          },
          file_name: `${report.report_type}_${report.date_from}_to_${report.date_to}.${report.format}`
        },
        data: report.data,
        format_instructions: {
          format: report.format,
          needs_processing: true,
          suggested_filename: `${report.report_type}_${report.date_from}_to_${report.date_to}.${report.format}`
        }
      });
    }

  } catch (error) {
    console.error('Error in GET /api/reports/download/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
