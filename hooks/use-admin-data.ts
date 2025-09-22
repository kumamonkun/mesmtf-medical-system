import { useState, useEffect } from 'react'

interface AdminStats {
  totalUsers: number
  userGrowth: number
  activeSessions: number
  sessionGrowth: number
  systemUptime: number
  pendingApprovals: number
  roleCounts: {
    patients: number
    doctors: number
    nurses: number
    pharmacists: number
    receptionists: number
    admins: number
  }
  appointmentStats: {
    total: number
    scheduled: number
    completed: number
    cancelled: number
  }
  recentUsers: Array<{
    id: string
    username: string
    name: string
    role: string
    specialization: string | null
    registeredAt: string
  }>
}

interface User {
  id: string
  username: string
  first_name: string
  last_name: string
  role: string
  specialization: string | null
  email: string
  created_at: string
  updated_at: string
}

export function useAdminStats() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/admin/stats')
        if (!response.ok) {
          throw new Error('Failed to fetch admin stats')
        }
        const data = await response.json()
        setStats(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  return { stats, loading, error }
}

export function useUsers(role?: string) {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        const params = new URLSearchParams()
        if (role) params.append('role', role)
        
        const response = await fetch(`/api/admin/users?${params.toString()}`)
        if (!response.ok) {
          throw new Error('Failed to fetch users')
        }
        const data = await response.json()
        setUsers(data.users)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [role])

  const approveUser = async (userId: string) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, action: 'approve' }),
      })

      if (!response.ok) {
        throw new Error('Failed to approve user')
      }

      // Refresh users list
      const data = await response.json()
      setUsers(users.map(user => 
        user.id === userId ? { ...user, ...data.user } : user
      ))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  const rejectUser = async (userId: string) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, action: 'reject' }),
      })

      if (!response.ok) {
        throw new Error('Failed to reject user')
      }

      // Refresh users list
      const data = await response.json()
      setUsers(users.map(user => 
        user.id === userId ? { ...user, ...data.user } : user
      ))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  return { users, loading, error, approveUser, rejectUser }
}