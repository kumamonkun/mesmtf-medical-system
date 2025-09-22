import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Validation schema for drug updates
const drugUpdateSchema = z.object({
  name: z.string().min(1, 'Drug name is required').max(200, 'Drug name must be less than 200 characters').optional(),
  generic_name: z.string().max(200, 'Generic name must be less than 200 characters').optional(),
  category: z.string().min(1, 'Category is required').max(100, 'Category must be less than 100 characters').optional(),
  description: z.string().max(1000, 'Description must be less than 1000 characters').optional(),
  indication: z.array(z.string()).min(1, 'At least one indication is required').optional(),
  contraindications: z.array(z.string()).optional(),
  side_effects: z.array(z.string()).optional(),
  dosage_form: z.enum(['tablet', 'capsule', 'syrup', 'injection', 'cream', 'drops', 'inhaler', 'patch', 'other']).optional(),
  strength: z.string().min(1, 'Strength is required').max(100, 'Strength must be less than 100 characters').optional(),
  unit: z.string().min(1, 'Unit is required').max(50, 'Unit must be less than 50 characters').optional(),
  stock: z.number().min(0, 'Stock cannot be negative').optional(),
  min_stock: z.number().min(0, 'Minimum stock cannot be negative').optional(),
  max_stock: z.number().min(0, 'Maximum stock cannot be negative').optional(),
  expiry_date: z.string().date('Invalid expiry date format').optional(),
  batch_number: z.string().min(1, 'Batch number is required').max(100, 'Batch number must be less than 100 characters').optional(),
  supplier: z.string().min(1, 'Supplier is required').max(200, 'Supplier must be less than 200 characters').optional(),
  price: z.number().min(0, 'Price cannot be negative').optional(),
  cost: z.number().min(0, 'Cost cannot be negative').optional(),
  requires_prescription: z.boolean().optional(),
  controlled_substance: z.boolean().optional(),
  storage_conditions: z.string().max(500, 'Storage conditions must be less than 500 characters').optional(),
  notes: z.string().max(1000, 'Notes must be less than 1000 characters').optional()
});

// GET /api/drugs/[id] - Get drug by ID
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

    const { id } = params;

    // Get drug
    const { data: drug, error } = await supabase
      .from('drugs')
      .select(`
        *,
        created_by_user:user_profiles!drugs_created_by_fkey(
          id,
          first_name,
          last_name,
          role
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({ error: 'Drug not found' }, { status: 404 });
      }
      console.error('Error fetching drug:', error);
      return NextResponse.json({ error: 'Failed to fetch drug' }, { status: 500 });
    }

    // Add calculated fields
    const drugWithCalculations = {
      ...drug,
      stock_status: drug.stock <= drug.min_stock ? 'low' : 
                   drug.max_stock && drug.stock >= drug.max_stock ? 'high' : 'normal',
      days_to_expiry: Math.ceil((new Date(drug.expiry_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
      is_expired: new Date(drug.expiry_date) <= new Date(),
      is_expiring_soon: new Date(drug.expiry_date) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    };

    return NextResponse.json(drugWithCalculations);

  } catch (error) {
    console.error('Error in GET /api/drugs/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/drugs/[id] - Update drug
export async function PUT(
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

    // Check if user has permission to update drugs
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['admin', 'pharmacist'].includes(profile.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { id } = params;
    const body = await request.json();
    
    // Validate input data
    const validatedData = drugUpdateSchema.parse(body);

    // Check if drug exists
    const { data: existingDrug } = await supabase
      .from('drugs')
      .select('id, name, strength, dosage_form')
      .eq('id', id)
      .single();

    if (!existingDrug) {
      return NextResponse.json({ error: 'Drug not found' }, { status: 404 });
    }

    // Check if updated drug name/strength combination already exists
    if (validatedData.name || validatedData.strength || validatedData.dosage_form) {
      const { data: duplicateDrug } = await supabase
        .from('drugs')
        .select('id')
        .eq('name', validatedData.name || existingDrug.name)
        .eq('strength', validatedData.strength || existingDrug.strength)
        .eq('dosage_form', validatedData.dosage_form || existingDrug.dosage_form)
        .neq('id', id)
        .single();

      if (duplicateDrug) {
        return NextResponse.json({ 
          error: 'Drug with this name, strength, and dosage form already exists' 
        }, { status: 400 });
      }
    }

    // Validate stock limits
    if (validatedData.max_stock && validatedData.min_stock && 
        validatedData.max_stock <= validatedData.min_stock) {
      return NextResponse.json({ 
        error: 'Maximum stock must be greater than minimum stock' 
      }, { status: 400 });
    }

    // Validate expiry date
    if (validatedData.expiry_date && new Date(validatedData.expiry_date) <= new Date()) {
      return NextResponse.json({ 
        error: 'Expiry date must be in the future' 
      }, { status: 400 });
    }

    // Update drug
    const { data: updatedDrug, error } = await supabase
      .from('drugs')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating drug:', error);
      return NextResponse.json({ error: 'Failed to update drug' }, { status: 500 });
    }

    return NextResponse.json(updatedDrug);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.errors 
      }, { status: 400 });
    }
    
    console.error('Error in PUT /api/drugs/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/drugs/[id] - Delete drug
export async function DELETE(
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

    // Check if user has permission to delete drugs
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { id } = params;

    // Check if drug exists
    const { data: existingDrug } = await supabase
      .from('drugs')
      .select('id, stock')
      .eq('id', id)
      .single();

    if (!existingDrug) {
      return NextResponse.json({ error: 'Drug not found' }, { status: 404 });
    }

    // Check if drug has stock
    if (existingDrug.stock > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete drug with remaining stock. Please adjust stock to zero first.' 
      }, { status: 400 });
    }

    // Check if drug is used in prescriptions
    const { data: prescriptions } = await supabase
      .from('prescriptions')
      .select('id')
      .eq('drug_id', id)
      .limit(1);

    if (prescriptions && prescriptions.length > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete drug that is used in prescriptions' 
      }, { status: 400 });
    }

    // Delete drug
    const { error } = await supabase
      .from('drugs')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting drug:', error);
      return NextResponse.json({ error: 'Failed to delete drug' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Drug deleted successfully' });

  } catch (error) {
    console.error('Error in DELETE /api/drugs/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
