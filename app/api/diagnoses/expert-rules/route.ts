import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Validation schema for expert system rules
const expertRuleSchema = z.object({
  disease: z.string().min(1, 'Disease name is required').max(100, 'Disease name must be less than 100 characters'),
  description: z.string().min(1, 'Description is required').max(500, 'Description must be less than 500 characters'),
  symptoms: z.array(z.string()).min(1, 'At least one symptom is required'),
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
  is_active: z.boolean().optional()
});

// GET /api/diagnoses/expert-rules - Get expert system rules
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
    const disease = searchParams.get('disease') || '';
    const isActive = searchParams.get('is_active');
    const severity = searchParams.get('severity') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    
    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from('expert_system_rules')
      .select('*', { count: 'exact' })
      .order('priority', { ascending: true });

    // Apply filters
    if (disease) {
      query = query.ilike('disease', `%${disease}%`);
    }
    
    if (isActive !== null && isActive !== undefined) {
      query = query.eq('is_active', isActive === 'true');
    }
    
    if (severity) {
      query = query.eq('severity', severity);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: rules, error, count } = await query;

    if (error) {
      console.error('Error fetching expert system rules:', error);
      return NextResponse.json({ error: 'Failed to fetch expert system rules' }, { status: 500 });
    }

    return NextResponse.json({
      rules: rules || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Error in GET /api/diagnoses/expert-rules:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/diagnoses/expert-rules - Create new expert system rule
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    
    // Validate input data
    const validatedData = expertRuleSchema.parse(body);

    // Create expert system rule
    const { data: newRule, error } = await supabase
      .from('expert_system_rules')
      .insert({
        ...validatedData,
        created_by: user.id,
        is_active: validatedData.is_active !== undefined ? validatedData.is_active : true
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating expert system rule:', error);
      return NextResponse.json({ error: 'Failed to create expert system rule' }, { status: 500 });
    }

    return NextResponse.json(newRule, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.errors 
      }, { status: 400 });
    }
    
    console.error('Error in POST /api/diagnoses/expert-rules:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
