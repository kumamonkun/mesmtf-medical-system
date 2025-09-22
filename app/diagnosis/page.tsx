"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { DiagnosisView } from "@/components/diagnosis/diagnosis-view"
import { useAuth } from "@/lib/auth-context"
import { Skeleton } from "@/components/ui/skeleton"

export default function DiagnosisPage() {
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
          <span className="text-lg">Loading AI diagnosis system...</span>
        </div>
      </div>
    )
  }

  if (!user || !profile) {
    return null
  }

  // Create user object compatible with DiagnosisView
  const userData = {
    username: profile.username || profile.first_name || 'User',
    role: profile.role || 'patient',
    loginTime: new Date().toISOString()
  }

  return <DiagnosisView user={userData} />
}
