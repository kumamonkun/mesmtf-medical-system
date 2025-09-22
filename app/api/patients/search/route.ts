import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/patients/search - Search patients with advanced filters
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
    const status = searchParams.get('status') || '';
    const gender = searchParams.get('gender') || '';
    const bloodType = searchParams.get('blood_type') || '';
    const ageMin = searchParams.get('age_min');
    const ageMax = searchParams.get('age_max');
    const hasAllergies = searchParams.get('has_allergies');
    const hasChronicConditions = searchParams.get('has_chronic_conditions');
    const sortBy = searchParams.get('sort_by') || 'created_at';
    const sortOrder = searchParams.get('sort_order') || 'desc';
    const limit = parseInt(searchParams.get('limit') || '20');

    // Build base query
    let query = supabase
      .from('patients')
      .select('*', { count: 'exact' });

    // Apply search filters
    if (q) {
      query = query.or(`
        first_name.ilike.%${q}%,
        last_name.ilike.%${q}%,
        patient_id.ilike.%${q}%,
        phone.ilike.%${q}%,
        email.ilike.%${q}%
      `);
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (gender) {
      query = query.eq('gender', gender);
    }

    if (bloodType) {
      query = query.eq('blood_type', bloodType);
    }

    if (hasAllergies === 'true') {
      query = query.not('allergies', 'is', null).neq('allergies', '');
    } else if (hasAllergies === 'false') {
      query = query.or('allergies.is.null,allergies.eq.');
    }

    if (hasChronicConditions === 'true') {
      query = query.not('chronic_conditions', 'is', null).neq('chronic_conditions', '');
    } else if (hasChronicConditions === 'false') {
      query = query.or('chronic_conditions.is.null,chronic_conditions.eq.');
    }

    // Apply age filters (calculate from date_of_birth)
    if (ageMin || ageMax) {
      const currentDate = new Date();
      
      if (ageMax) {
        const minBirthDate = new Date(currentDate.getFullYear() - parseInt(ageMax), currentDate.getMonth(), currentDate.getDate());
        query = query.gte('date_of_birth', minBirthDate.toISOString().split('T')[0]);
      }
      
      if (ageMin) {
        const maxBirthDate = new Date(currentDate.getFullYear() - parseInt(ageMin), currentDate.getMonth(), currentDate.getDate());
        query = query.lte('date_of_birth', maxBirthDate.toISOString().split('T')[0]);
      }
    }

    // Apply sorting
    const validSortFields = ['created_at', 'first_name', 'last_name', 'patient_id', 'date_of_birth'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
    const order = sortOrder === 'asc' ? true : false;
    
    query = query.order(sortField, { ascending: order });

    // Apply limit
    query = query.limit(limit);

    const { data: patients, error, count } = await query;

    if (error) {
      console.error('Error searching patients:', error);
      return NextResponse.json({ error: 'Failed to search patients' }, { status: 500 });
    }

    // Calculate ages for response
    const patientsWithAge = patients?.map(patient => {
      const birthDate = new Date(patient.date_of_birth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      return {
        ...patient,
        age
      };
    });

    return NextResponse.json({
      patients: patientsWithAge || [],
      total: count || 0,
      filters: {
        q,
        status,
        gender,
        bloodType,
        ageMin,
        ageMax,
        hasAllergies,
        hasChronicConditions,
        sortBy: sortField,
        sortOrder: order ? 'asc' : 'desc'
      }
    });

  } catch (error) {
    console.error('Error in GET /api/patients/search:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
