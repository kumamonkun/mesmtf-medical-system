import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/drug-administration/patient/[id] - Get drug administrations for a specific patient
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

    const { id: patientId } = params;

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const status = searchParams.get('status') || '';
    const drugId = searchParams.get('drug_id') || '';
    const route = searchParams.get('route') || '';
    const dateFrom = searchParams.get('date_from') || '';
    const dateTo = searchParams.get('date_to') || '';
    const sortBy = searchParams.get('sort_by') || 'administration_date';
    const sortOrder = searchParams.get('sort_order') || 'desc';
    
    const offset = (page - 1) * limit;

    // Check if patient exists
    const { data: patient } = await supabase
      .from('patients')
      .select('id, patient_id')
      .eq('id', patientId)
      .single();

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    // Check if user has permission to view patient's drug administrations
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    // Patients can only view their own records
    if (profile?.role === 'patient') {
      const { data: patientProfile } = await supabase
        .from('patients')
        .select('patient_id')
        .eq('patient_id', profile.username)
        .single();

      if (!patientProfile || patientProfile.patient_id !== patient.patient_id) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
      }
    } else if (!profile || !['admin', 'doctor', 'nurse', 'pharmacist'].includes(profile.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Build query with joins
    let query = supabase
      .from('drug_administration')
      .select(`
        *,
        drug:drugs!drug_administration_drug_id_fkey(
          id,
          name,
          generic_name,
          strength,
          unit,
          dosage_form,
          indication,
          side_effects
        ),
        prescription:prescriptions!drug_administration_prescription_id_fkey(
          id,
          dosage,
          frequency,
          instructions,
          start_date,
          end_date
        ),
        administered_by_user:user_profiles!drug_administration_administered_by_fkey(
          id,
          first_name,
          last_name,
          role
        )
      `, { count: 'exact' })
      .eq('patient_id', patientId);

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }
    
    if (drugId) {
      query = query.eq('drug_id', drugId);
    }
    
    if (route) {
      query = query.eq('route', route);
    }
    
    if (dateFrom) {
      query = query.gte('administration_date', dateFrom);
    }
    
    if (dateTo) {
      query = query.lte('administration_date', dateTo);
    }

    // Apply sorting
    const validSortFields = ['administration_date', 'created_at', 'drug_name', 'status'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'administration_date';
    const order = sortOrder === 'asc';
    
    query = query.order(sortField, { ascending: order });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: administrations, error, count } = await query;

    if (error) {
      console.error('Error fetching patient drug administrations:', error);
      return NextResponse.json({ error: 'Failed to fetch drug administrations' }, { status: 500 });
    }

    // Add calculated fields
    const administrationsWithCalculations = administrations?.map(admin => ({
      ...admin,
      days_ago: Math.ceil((new Date().getTime() - new Date(admin.administration_date).getTime()) / (1000 * 60 * 60 * 24)),
      is_recent: new Date(admin.administration_date) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    }));

    // Get summary statistics
    const totalAdministrations = count || 0;
    const administeredCount = administrations?.filter(admin => admin.status === 'administered').length || 0;
    const missedCount = administrations?.filter(admin => admin.status === 'missed').length || 0;
    const scheduledCount = administrations?.filter(admin => admin.status === 'scheduled').length || 0;

    // Get unique drugs administered
    const uniqueDrugs = [...new Set(administrations?.map(admin => admin.drug_id))].length;

    return NextResponse.json({
      patient: {
        id: patient.id,
        patient_id: patient.patient_id
      },
      administrations: administrationsWithCalculations || [],
      summary: {
        total: totalAdministrations,
        administered: administeredCount,
        missed: missedCount,
        scheduled: scheduledCount,
        unique_drugs: uniqueDrugs
      },
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Error in GET /api/drug-administration/patient/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
