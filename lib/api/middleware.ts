import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Standard API response types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Standard error response
export function createErrorResponse(
  message: string, 
  status: number = 500, 
  details?: any
): NextResponse {
  return NextResponse.json({
    success: false,
    error: message,
    details
  }, { status });
}

// Standard success response
export function createSuccessResponse<T>(
  data: T, 
  message?: string, 
  status: number = 200
): NextResponse {
  return NextResponse.json({
    success: true,
    data,
    message
  }, { status });
}

// Authentication middleware
export async function withAuth(
  request: NextRequest,
  allowedRoles?: string[]
): Promise<{ user: any; profile: any } | NextResponse> {
  try {
    const supabase = createClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return createErrorResponse('Unauthorized', 401);
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('role, first_name, last_name, id')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return createErrorResponse('User profile not found', 404);
    }

    // Check role permissions
    if (allowedRoles && !allowedRoles.includes(profile.role)) {
      return createErrorResponse('Insufficient permissions', 403);
    }

    return { user, profile };
  } catch (error) {
    console.error('Auth middleware error:', error);
    return createErrorResponse('Authentication failed', 500);
  }
}

// Validation middleware
export function withValidation<T>(schema: z.ZodSchema<T>) {
  return async (request: NextRequest): Promise<T | NextResponse> => {
    try {
      const body = await request.json();
      return schema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return createErrorResponse('Validation error', 400, error.errors);
      }
      return createErrorResponse('Invalid request body', 400);
    }
  };
}

// Database entity existence checker
export async function checkEntityExists(
  table: string,
  id: string,
  selectFields: string = 'id'
): Promise<boolean> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from(table)
      .select(selectFields)
      .eq('id', id)
      .single();
    
    return !error && !!data;
  } catch {
    return false;
  }
}

// Pagination helper
export function getPaginationParams(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '10')));
  const offset = (page - 1) * limit;
  
  return { page, limit, offset };
}

// Search helper
export function getSearchParams(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  return {
    search: searchParams.get('search') || undefined,
    sortBy: searchParams.get('sortBy') || 'created_at',
    sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
  };
}
