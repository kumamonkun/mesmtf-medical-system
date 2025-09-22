"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { DispensingView } from "@/components/pharmacy/dispensing-view"
import { useAuth } from "@/lib/auth-context"

export default function DispensingPage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/")
    }
  }, [user, loading, router])

  // Check if user is pharmacist or admin
  useEffect(() => {
    if (!loading && profile && !['pharmacist', 'admin'].includes(profile.role)) {
      router.push("/dashboard")
    }
  }, [profile, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="text-lg">Loading dispensing...</span>
        </div>
      </div>
    )
  }

  if (!user || !profile || !['pharmacist', 'admin'].includes(profile.role)) {
    return null
  }

  // Create user object compatible with DispensingView
  const userData = {
    username: profile.username || profile.first_name || 'User',
    role: profile.role || 'pharmacist',
    loginTime: new Date().toISOString()
  }

  return <DispensingView user={userData} />
}
