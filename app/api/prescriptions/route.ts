import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Validation schema for prescription data (simplified to match actual database schema)
const prescriptionSchema = z.object({
  treatment_id: z.string().uuid('Invalid treatment ID format'),
  drug_id: z.string().uuid('Invalid drug ID format'),
  dosage: z.string().min(1, 'Dosage is required').max(100, 'Dosage must be less than 100 characters'),
  frequency: z.string().min(1, 'Frequency is required').max(100, 'Frequency must be less than 100 characters'),
  duration_days: z.number().min(1, 'Duration must be at least 1 day'),
  instructions: z.string().max(1000, 'Instructions must be less than 1000 characters').optional(),
  quantity: z.number().min(1, 'Quantity must be at least 1')
});

// GET /api/prescriptions - List all prescriptions with pagination and filters
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
    const drugId = searchParams.get('drug_id') || '';
    const treatmentId = searchParams.get('treatment_id') || '';
    
    const offset = (page - 1) * limit;

    // Build query with joins
    let query = supabase
      .from('prescriptions')
      .select(`
        *,
        drug:drugs!prescriptions_drug_id_fkey(
          id,
          name,
          generic_name,
          dosage_form,
          strength,
          manufacturer,
          is_prescription_required
        ),
        treatment:treatments!prescriptions_treatment_id_fkey(
          id,
          treatment_plan,
          duration_days,
          status
        )
      `, { count: 'exact' })
      .order('created_at', { ascending: false });

    // Apply filters
    if (drugId) {
      query = query.eq('drug_id', drugId);
    }
    
    if (treatmentId) {
      query = query.eq('treatment_id', treatmentId);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: prescriptions, error, count } = await query;

    if (error) {
      console.error('Error fetching prescriptions:', error);
      return NextResponse.json({ error: 'Failed to fetch prescriptions' }, { status: 500 });
    }

    return NextResponse.json({
      prescriptions: prescriptions || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Error in GET /api/prescriptions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/prescriptions - Create new prescription
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has permission to create prescriptions
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['admin', 'doctor', 'pharmacist'].includes(profile.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    
    // Validate input data
    const validatedData = prescriptionSchema.parse(body);

    // Check if treatment exists
    const { data: treatment } = await supabase
      .from('treatments')
      .select('id')
      .eq('id', validatedData.treatment_id)
      .single();

    if (!treatment) {
      return NextResponse.json({ error: 'Treatment not found' }, { status: 400 });
    }

    // Check if drug exists
    const { data: drug } = await supabase
      .from('drugs')
      .select('id, name, is_prescription_required')
      .eq('id', validatedData.drug_id)
      .single();

    if (!drug) {
      return NextResponse.json({ error: 'Drug not found' }, { status: 400 });
    }

    // Create prescription
    const { data: newPrescription, error } = await supabase
      .from('prescriptions')
      .insert(validatedData)
      .select(`
        *,
        drug:drugs!prescriptions_drug_id_fkey(
          id,
          name,
          generic_name,
          dosage_form,
          strength,
          manufacturer
        ),
        treatment:treatments!prescriptions_treatment_id_fkey(
          id,
          treatment_plan,
          duration_days,
          status
        )
      `)
      .single();

    if (error) {
      console.error('Error creating prescription:', error);
      return NextResponse.json({ error: 'Failed to create prescription' }, { status: 500 });
    }

    return NextResponse.json(newPrescription, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.errors 
      }, { status: 400 });
    }
    
    console.error('Error in POST /api/prescriptions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
