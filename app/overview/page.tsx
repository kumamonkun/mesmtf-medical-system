"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { OverviewView } from "@/components/admin/overview-view"
import { useAuth } from "@/lib/auth-context"
import { BackButton } from "@/components/common/back-button"

export default function OverviewPage() {
  const { user, profile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/")
    }
  }, [user, loading, router])

  // Check if user is admin
  useEffect(() => {
    if (!loading && profile && profile.role !== 'admin') {
      router.push("/dashboard")
    }
  }, [profile, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="text-lg">Loading overview...</span>
        </div>
      </div>
    )
  }

  if (!user || !profile || profile.role !== 'admin') {
    return null
  }

  // Create user object compatible with OverviewView
  const userData = {
    username: profile.username || profile.first_name || 'User',
    role: profile.role || 'admin',
    loginTime: new Date().toISOString()
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-2">
        <div className="mb-2">
          <BackButton fallbackPath="/dashboard" />
        </div>
        <OverviewView user={userData} />
      </div>
    </div>
  )
}
