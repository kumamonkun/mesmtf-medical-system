import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Validation schema for notification template
const notificationTemplateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  type: z.enum(['appointment', 'prescription', 'lab_result', 'reminder', 'alert', 'system', 'emergency']),
  title_template: z.string().min(1, 'Title template is required').max(200, 'Title template must be less than 200 characters'),
  message_template: z.string().min(1, 'Message template is required').max(1000, 'Message template must be less than 1000 characters'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  category: z.string().max(100, 'Category must be less than 100 characters').optional(),
  variables: z.array(z.string()).max(20, 'Maximum 20 variables allowed').optional(),
  is_active: z.boolean().optional(),
  description: z.string().max(500, 'Description must be less than 500 characters').optional()
});

// GET /api/notifications/templates - List all notification templates
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has permission to view templates
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
    const type = searchParams.get('type') || '';
    const priority = searchParams.get('priority') || '';
    const category = searchParams.get('category') || '';
    const is_active = searchParams.get('is_active');
    const search = searchParams.get('search') || '';
    
    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from('notification_templates')
      .select(`
        *,
        created_by_user:user_profiles!notification_templates_created_by_fkey(
          id,
          first_name,
          last_name,
          role
        )
      `, { count: 'exact' })
      .order('created_at', { ascending: false });

    // Apply filters
    if (type) {
      query = query.eq('type', type);
    }
    
    if (priority) {
      query = query.eq('priority', priority);
    }
    
    if (category) {
      query = query.eq('category', category);
    }
    
    if (is_active !== null && is_active !== undefined) {
      query = query.eq('is_active', is_active === 'true');
    }
    
    if (search) {
      query = query.or(`
        name.ilike.%${search}%,
        description.ilike.%${search}%
      `);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data: templates, error, count } = await query;

    if (error) {
      console.error('Error fetching notification templates:', error);
      return NextResponse.json({ error: 'Failed to fetch notification templates' }, { status: 500 });
    }

    return NextResponse.json({
      templates: templates || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Error in GET /api/notifications/templates:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/notifications/templates - Create new notification template
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has permission to create templates
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['admin', 'doctor', 'nurse', 'receptionist', 'pharmacist'].includes(profile.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    
    // Validate input data
    const validatedData = notificationTemplateSchema.parse(body);

    // Check if template with same name already exists
    const { data: existingTemplate } = await supabase
      .from('notification_templates')
      .select('id')
      .eq('name', validatedData.name)
      .single();

    if (existingTemplate) {
      return NextResponse.json({ 
        error: 'Template with this name already exists' 
      }, { status: 400 });
    }

    // Create template
    const { data: newTemplate, error } = await supabase
      .from('notification_templates')
      .insert({
        ...validatedData,
        created_by: user.id,
        is_active: validatedData.is_active !== undefined ? validatedData.is_active : true
      })
      .select(`
        *,
        created_by_user:user_profiles!notification_templates_created_by_fkey(
          id,
          first_name,
          last_name,
          role
        )
      `)
      .single();

    if (error) {
      console.error('Error creating notification template:', error);
      return NextResponse.json({ error: 'Failed to create notification template' }, { status: 500 });
    }

    return NextResponse.json(newTemplate, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.errors 
      }, { status: 400 });
    }
    
    console.error('Error in POST /api/notifications/templates:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
