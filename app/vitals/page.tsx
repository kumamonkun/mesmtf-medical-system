"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { VitalsView } from "@/components/nurse/vitals-view"
import { useAuth } from "@/lib/auth-context"

export default function VitalsPage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/")
    }
  }, [user, loading, router])

  // Check if user is nurse or admin
  useEffect(() => {
    if (!loading && profile && !['nurse', 'admin'].includes(profile.role)) {
      router.push("/dashboard")
    }
  }, [profile, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="text-lg">Loading vitals...</span>
        </div>
      </div>
    )
  }

  if (!user || !profile || !['nurse', 'admin'].includes(profile.role)) {
    return null
  }

  // Create user object compatible with VitalsView
  const userData = {
    username: profile.username || profile.first_name || 'User',
    role: profile.role || 'nurse',
    loginTime: new Date().toISOString()
  }

  return <VitalsView user={userData} />
}
