import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Validation schema for expert system rule updates
const expertRuleUpdateSchema = z.object({
  disease: z.string().min(1, 'Disease name is required').max(100, 'Disease name must be less than 100 characters').optional(),
  description: z.string().min(1, 'Description is required').max(500, 'Description must be less than 500 characters').optional(),
  symptoms: z.array(z.string()).min(1, 'At least one symptom is required').optional(),
  conditions: z.object({
    min_age: z.number().min(0).max(150).optional(),
    max_age: z.number().min(0).max(150).optional(),
    gender: z.enum(['male', 'female', 'other']).optional(),
    medical_history: z.string().optional(),
    allergies: z.string().optional()
  }).optional(),
  treatment: z.string().max(1000, 'Treatment must be less than 1000 characters').optional(),
  severity: z.enum(['mild', 'moderate', 'severe', 'critical']).optional(),
  requires_xray: z.boolean().optional(),
  requires_lab_tests: z.boolean().optional(),
  follow_up_required: z.boolean().optional(),
  weight: z.number().min(0.1).max(10).optional(),
  is_active: z.boolean().optional(),
  priority: z.number().min(1).max(1000).optional()
});

// GET /api/diagnoses/expert-rules/[id] - Get expert system rule by ID
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

    // Get expert system rule
    const { data: rule, error } = await supabase
      .from('expert_system_rules')
      .select(`
        *,
        created_by_user:user_profiles!expert_system_rules_created_by_fkey(
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
        return NextResponse.json({ error: 'Expert system rule not found' }, { status: 404 });
      }
      console.error('Error fetching expert system rule:', error);
      return NextResponse.json({ error: 'Failed to fetch expert system rule' }, { status: 500 });
    }

    return NextResponse.json(rule);

  } catch (error) {
    console.error('Error in GET /api/diagnoses/expert-rules/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/diagnoses/expert-rules/[id] - Update expert system rule
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

    // Check if user is admin
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { id } = params;
    const body = await request.json();
    
    // Validate input data
    const validatedData = expertRuleUpdateSchema.parse(body);

    // Check if rule exists
    const { data: existingRule } = await supabase
      .from('expert_system_rules')
      .select('id')
      .eq('id', id)
      .single();

    if (!existingRule) {
      return NextResponse.json({ error: 'Expert system rule not found' }, { status: 404 });
    }

    // Update expert system rule
    const { data: updatedRule, error } = await supabase
      .from('expert_system_rules')
      .update({
        ...validatedData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating expert system rule:', error);
      return NextResponse.json({ error: 'Failed to update expert system rule' }, { status: 500 });
    }

    return NextResponse.json(updatedRule);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.errors 
      }, { status: 400 });
    }
    
    console.error('Error in PUT /api/diagnoses/expert-rules/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/diagnoses/expert-rules/[id] - Delete expert system rule
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

    // Check if user is admin
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'admin') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const { id } = params;

    // Check if rule exists
    const { data: existingRule } = await supabase
      .from('expert_system_rules')
      .select('id, is_active')
      .eq('id', id)
      .single();

    if (!existingRule) {
      return NextResponse.json({ error: 'Expert system rule not found' }, { status: 404 });
    }

    // Soft delete by deactivating the rule
    const { data: deactivatedRule, error } = await supabase
      .from('expert_system_rules')
      .update({
        is_active: false,
        deactivated_at: new Date().toISOString(),
        deactivated_by: user.id,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error deactivating expert system rule:', error);
      return NextResponse.json({ error: 'Failed to deactivate expert system rule' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Expert system rule deactivated successfully',
      rule: deactivatedRule
    });

  } catch (error) {
    console.error('Error in DELETE /api/diagnoses/expert-rules/[id]:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
