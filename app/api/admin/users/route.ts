import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient()
    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (role && role !== 'all') {
      query = query.eq('role', role)
    }

    const { data: users, error } = await query

    if (error) {
      console.error('Error fetching users:', error)
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
    }

    return NextResponse.json({ users })
  } catch (error) {
    console.error('Error in users API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = createAdminClient()
    const { userId, action } = await request.json()

    if (!userId || !action) {
      return NextResponse.json({ error: 'Missing userId or action' }, { status: 400 })
    }

    let result
    if (action === 'approve') {
      // In a real system, you might have an approval status field
      // For now, we'll just update the user's updated_at timestamp
      const { data, error } = await supabase
        .from('user_profiles')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select()

      if (error) {
        console.error('Error approving user:', error)
        return NextResponse.json({ error: 'Failed to approve user' }, { status: 500 })
      }

      result = data
    } else if (action === 'reject') {
      // In a real system, you might delete the user or mark them as rejected
      // For now, we'll just update the updated_at timestamp
      const { data, error } = await supabase
        .from('user_profiles')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', userId)
        .select()

      if (error) {
        console.error('Error rejecting user:', error)
        return NextResponse.json({ error: 'Failed to reject user' }, { status: 500 })
      }

      result = data
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    return NextResponse.json({ success: true, user: result })
  } catch (error) {
    console.error('Error in user action API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}