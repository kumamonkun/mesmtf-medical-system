import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Validation schema for drug data (simplified to match actual database schema)
const drugSchema = z.object({
  name: z.string().min(1, 'Drug name is required').max(200, 'Drug name must be less than 200 characters'),
  generic_name: z.string().max(200, 'Generic name must be less than 200 characters').optional(),
  dosage_form: z.string().min(1, 'Dosage form is required').max(100, 'Dosage form must be less than 100 characters'),
  strength: z.string().max(100, 'Strength must be less than 100 characters').optional(),
  manufacturer: z.string().max(200, 'Manufacturer must be less than 200 characters').optional(),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  contraindications: z.string().max(1000, 'Contraindications must be less than 1000 characters').optional(),
  side_effects: z.string().max(1000, 'Side effects must be less than 1000 characters').optional(),
  is_prescription_required: z.boolean().optional()
});

// GET /api/drugs - List all drugs with pagination and filters
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
    const search = searchParams.get('search') || '';
    const requiresPrescription = searchParams.get('requires_prescription');
    
    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from('drugs')
      .select('*', { count: 'exact' })
      .order('name', { ascending: true });

    // Apply filters
    if (search) {
      query = query.or(`
        name.ilike.%${search}%,
        generic_name.ilike.%${search}%,
        manufacturer.ilike.%${search}%,
        dosage_form.ilike.%${search}%,
        strength.ilike.%${search}%
      `);
    }
    
    if (requiresPrescription !== null && requiresPrescription !== undefined) {
      query = query.eq('is_prescription_required', requiresPrescription === 'true');
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: drugs, error, count } = await query;

    if (error) {
      console.error('Error fetching drugs:', error);
      return NextResponse.json({ error: 'Failed to fetch drugs' }, { status: 500 });
    }

    return NextResponse.json({
      drugs: drugs || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Error in GET /api/drugs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/drugs - Create new drug
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has permission to create drugs
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['admin', 'pharmacist'].includes(profile.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    
    // Validate input data
    const validatedData = drugSchema.parse(body);

    // Check if drug already exists (by name and dosage form)
    const { data: existingDrug } = await supabase
      .from('drugs')
      .select('id')
      .eq('name', validatedData.name)
      .eq('dosage_form', validatedData.dosage_form)
      .single();

    if (existingDrug) {
      return NextResponse.json({ 
        error: 'Drug with this name and dosage form already exists' 
      }, { status: 400 });
    }

    // Create drug
    const { data: newDrug, error } = await supabase
      .from('drugs')
      .insert(validatedData)
      .select()
      .single();

    if (error) {
      console.error('Error creating drug:', error);
      return NextResponse.json({ error: 'Failed to create drug' }, { status: 500 });
    }

    return NextResponse.json(newDrug, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.errors 
      }, { status: 400 });
    }
    
    console.error('Error in POST /api/drugs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
