import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient()

    // Get user counts by role
    const { data: userStats, error: userError } = await supabase
      .from('user_profiles')
      .select('role')

    if (userError) {
      console.error('Error fetching user stats:', userError)
      return NextResponse.json({ error: 'Failed to fetch user statistics' }, { status: 500 })
    }

    // Count users by role
    const roleCounts = userStats.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Get patient count
    const { count: patientCount, error: patientError } = await supabase
      .from('patients')
      .select('*', { count: 'exact', head: true })

    if (patientError) {
      console.error('Error fetching patient count:', patientError)
      return NextResponse.json({ error: 'Failed to fetch patient count' }, { status: 500 })
    }

    // Get appointment statistics
    const { data: appointments, error: appointmentError } = await supabase
      .from('appointments')
      .select('status, created_at')

    if (appointmentError) {
      console.error('Error fetching appointments:', appointmentError)
      return NextResponse.json({ error: 'Failed to fetch appointment statistics' }, { status: 500 })
    }

    const appointmentStats = appointments.reduce((acc, apt) => {
      acc[apt.status] = (acc[apt.status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Get recent user registrations (last 7 days)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const { data: recentUsers, error: recentUsersError } = await supabase
      .from('user_profiles')
      .select('id, username, first_name, last_name, role, specialization, created_at')
      .gte('created_at', sevenDaysAgo.toISOString())
      .order('created_at', { ascending: false })

    if (recentUsersError) {
      console.error('Error fetching recent users:', recentUsersError)
      return NextResponse.json({ error: 'Failed to fetch recent users' }, { status: 500 })
    }

    // Get system uptime (mock for now - in real implementation, this would come from monitoring)
    const systemUptime = 99.9

    // Calculate trends (mock for now - in real implementation, this would compare with historical data)
    const totalUsers = userStats.length
    const userGrowth = totalUsers > 0 ? Math.round((totalUsers / 100) * 12) : 0 // Mock 12% growth
    const activeSessions = Math.floor(Math.random() * 50) + 50 // Mock active sessions
    const sessionGrowth = Math.floor(Math.random() * 10) + 1 // Mock 1-10% growth

    const stats = {
      totalUsers,
      userGrowth,
      activeSessions,
      sessionGrowth,
      systemUptime,
      pendingApprovals: recentUsers.length,
      roleCounts: {
        patients: patientCount || 0,
        doctors: roleCounts.doctor || 0,
        nurses: roleCounts.nurse || 0,
        pharmacists: roleCounts.pharmacist || 0,
        receptionists: roleCounts.receptionist || 0,
        admins: roleCounts.admin || 0,
      },
      appointmentStats: {
        total: appointments.length,
        scheduled: appointmentStats.scheduled || 0,
        completed: appointmentStats.completed || 0,
        cancelled: appointmentStats.cancelled || 0,
      },
      recentUsers: recentUsers.map(user => ({
        id: user.id,
        username: user.username,
        name: `${user.first_name} ${user.last_name}`,
        role: user.role,
        specialization: user.specialization,
        registeredAt: user.created_at,
      })),
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error in admin stats API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}