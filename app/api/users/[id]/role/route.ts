import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Validation schema for role updates
const updateRoleSchema = z.object({
  role: z.enum(['admin', 'doctor', 'nurse', 'receptionist', 'pharmacist', 'patient'], {
    errorMap: () => ({ message: 'Invalid role' })
  })
});

// PUT /api/users/[id]/role - Update user role (Admin only)
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

    const { id } = params;
    const body = await request.json();
    
    // Check if user is admin
    const { data: currentUserProfile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!currentUserProfile || currentUserProfile.role !== 'admin') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Validate input data
    const validatedData = updateRoleSchema.parse(body);

    // Check if target user exists
    const { data: targetProfile } = await supabase
      .from('user_profiles')
      .select('id, role, is_active')
      .eq('id', id)
      .single();

    if (!targetProfile) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    if (!targetProfile.is_active) {
      return NextResponse.json({ error: 'Cannot update role of inactive user' }, { status: 400 });
    }

    // Prevent admin from changing their own role
    if (id === user.id) {
      return NextResponse.json({ error: 'Cannot change your own role' }, { status: 400 });
    }

    // Update user role
    const { data: updatedProfile, error } = await supabase
      .from('user_profiles')
      .update({
        role: validatedData.role,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating user role:', error);
      return NextResponse.json({ error: 'Failed to update user role' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'User role updated successfully',
      profile: updatedProfile
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.errors 
      }, { status: 400 });
    }
    
    console.error('Error in PUT /api/users/[id]/role:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
