import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Validation schema for drug administration data
const drugAdministrationSchema = z.object({
  patient_id: z.string().uuid('Invalid patient ID format'),
  drug_id: z.string().uuid('Invalid drug ID format'),
  prescription_id: z.string().uuid('Invalid prescription ID format').optional(),
  quantity: z.number().min(0.1, 'Quantity must be at least 0.1'),
  dosage: z.string().min(1, 'Dosage is required').max(100, 'Dosage must be less than 100 characters'),
  administration_date: z.string().datetime('Invalid administration date format'),
  administration_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format').optional(),
  route: z.enum(['oral', 'injection', 'topical', 'inhalation', 'rectal', 'sublingual', 'other']),
  site: z.string().max(100, 'Site must be less than 100 characters').optional(),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional(),
  status: z.enum(['scheduled', 'administered', 'missed', 'cancelled']).optional(),
  side_effects: z.string().max(500, 'Side effects must be less than 500 characters').optional(),
  effectiveness_rating: z.number().min(1).max(5, 'Effectiveness rating must be between 1 and 5').optional()
});

// GET /api/drug-administration - List all drug administrations with pagination and filters
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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const patientId = searchParams.get('patient_id') || '';
    const drugId = searchParams.get('drug_id') || '';
    const status = searchParams.get('status') || '';
    const route = searchParams.get('route') || '';
    const dateFrom = searchParams.get('date_from') || '';
    const dateTo = searchParams.get('date_to') || '';
    
    const offset = (page - 1) * limit;

    // Build query with joins
    let query = supabase
      .from('drug_administration')
      .select(`
        *,
        patient:patients!drug_administration_patient_id_fkey(
          id,
          patient_id,
          first_name,
          last_name,
          phone,
          date_of_birth,
          gender
        ),
        drug:drugs!drug_administration_drug_id_fkey(
          id,
          name,
          generic_name,
          strength,
          unit,
          dosage_form
        ),
        prescription:prescriptions!drug_administration_prescription_id_fkey(
          id,
          dosage,
          frequency,
          instructions
        ),
        administered_by_user:user_profiles!drug_administration_administered_by_fkey(
          id,
          first_name,
          last_name,
          role
        )
      `, { count: 'exact' })
      .order('administration_date', { ascending: false });

    // Apply filters
    if (patientId) {
      query = query.eq('patient_id', patientId);
    }
    
    if (drugId) {
      query = query.eq('drug_id', drugId);
    }
    
    if (status) {
      query = query.eq('status', status);
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

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: administrations, error, count } = await query;

    if (error) {
      console.error('Error fetching drug administrations:', error);
      return NextResponse.json({ error: 'Failed to fetch drug administrations' }, { status: 500 });
    }

    return NextResponse.json({
      administrations: administrations || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Error in GET /api/drug-administration:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/drug-administration - Create new drug administration record
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has permission to create drug administration records
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['admin', 'doctor', 'nurse', 'pharmacist'].includes(profile.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    
    // Validate input data
    const validatedData = drugAdministrationSchema.parse(body);

    // Check if patient exists
    const { data: patient } = await supabase
      .from('patients')
      .select('id')
      .eq('id', validatedData.patient_id)
      .single();

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 400 });
    }

    // Check if drug exists
    const { data: drug } = await supabase
      .from('drugs')
      .select('id, name, stock')
      .eq('id', validatedData.drug_id)
      .single();

    if (!drug) {
      return NextResponse.json({ error: 'Drug not found' }, { status: 400 });
    }

    // Check if prescription exists (if provided)
    if (validatedData.prescription_id) {
      const { data: prescription } = await supabase
        .from('prescriptions')
        .select('id, patient_id, drug_id, status')
        .eq('id', validatedData.prescription_id)
        .single();

      if (!prescription) {
        return NextResponse.json({ error: 'Prescription not found' }, { status: 400 });
      }

      // Verify prescription belongs to the patient
      if (prescription.patient_id !== validatedData.patient_id) {
        return NextResponse.json({ 
          error: 'Prescription does not belong to the specified patient' 
        }, { status: 400 });
      }

      // Verify prescription is for the specified drug
      if (prescription.drug_id !== validatedData.drug_id) {
        return NextResponse.json({ 
          error: 'Prescription is not for the specified drug' 
        }, { status: 400 });
      }

      // Check if prescription is fulfilled
      if (prescription.status !== 'fulfilled') {
        return NextResponse.json({ 
          error: 'Prescription must be fulfilled before administration' 
        }, { status: 400 });
      }
    }

    // Validate administration date
    const adminDate = new Date(validatedData.administration_date);
    const now = new Date();
    
    if (adminDate > now) {
      return NextResponse.json({ 
        error: 'Administration date cannot be in the future' 
      }, { status: 400 });
    }

    // Create drug administration record
    const { data: newAdministration, error } = await supabase
      .from('drug_administration')
      .insert({
        ...validatedData,
        administered_by: user.id,
        status: validatedData.status || 'administered'
      })
      .select(`
        *,
        patient:patients!drug_administration_patient_id_fkey(
          id,
          patient_id,
          first_name,
          last_name,
          phone
        ),
        drug:drugs!drug_administration_drug_id_fkey(
          id,
          name,
          generic_name,
          strength,
          unit,
          dosage_form
        ),
        prescription:prescriptions!drug_administration_prescription_id_fkey(
          id,
          dosage,
          frequency,
          instructions
        )
      `)
      .single();

    if (error) {
      console.error('Error creating drug administration record:', error);
      return NextResponse.json({ error: 'Failed to create drug administration record' }, { status: 500 });
    }

    return NextResponse.json(newAdministration, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.errors 
      }, { status: 400 });
    }
    
    console.error('Error in POST /api/drug-administration:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
