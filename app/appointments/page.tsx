"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { AppointmentView } from "@/components/appointments/appointment-view"
import { useAuth } from "@/lib/auth-context"

export default function AppointmentsPage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="text-lg">Loading appointments...</span>
        </div>
      </div>
    )
  }

  if (!user || !profile) {
    return null
  }

  // Create user object compatible with AppointmentView
  const userData = {
    username: profile.username || profile.first_name || 'User',
    role: profile.role || 'patient',
    loginTime: new Date().toISOString()
  }

  return <AppointmentView user={userData} />
}
