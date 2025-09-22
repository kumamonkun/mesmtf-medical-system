"use client"

import { useRouter } from "next/navigation"
import { PatientDashboard } from "@/components/dashboard/patient-dashboard"
import { DoctorDashboard } from "@/components/dashboard/doctor-dashboard"
import { NurseDashboard } from "@/components/dashboard/nurse-dashboard"
import { PharmacistDashboard } from "@/components/dashboard/pharmacist-dashboard"
import { ReceptionistDashboard } from "@/components/dashboard/receptionist-dashboard"
import { AdminDashboard } from "@/components/dashboard/admin-dashboard"
import { GuestDashboard } from "@/components/dashboard/guest-dashboard"
import { useAuth } from "@/lib/auth-context"

export default function DashboardPage() {
  const { user, profile, loading, isAnonymous } = useAuth()
  const router = useRouter()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="text-lg">Loading dashboard...</span>
        </div>
      </div>
    )
  }

  if (!user || !profile) {
    router.push("/")
    return null
  }

  // Create user object for dashboard components
  const userData = {
    username: profile.username,
    role: profile.role,
    loginTime: new Date().toISOString(),
    isAnonymous,
  }

  // Render appropriate dashboard based on user type and role
  if (isAnonymous) {
    return <GuestDashboard user={userData} />
  }

  switch (profile.role) {
    case "patient":
      return <PatientDashboard user={userData} />
    case "doctor":
      return <DoctorDashboard user={userData} />
    case "nurse":
      return <NurseDashboard user={userData} />
    case "pharmacist":
      return <PharmacistDashboard user={userData} />
    case "receptionist":
      return <ReceptionistDashboard user={userData} />
    case "admin":
      return <AdminDashboard user={userData} />
    default:
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-destructive">Invalid Role</h1>
            <p className="text-muted-foreground">Your account role is not recognized.</p>
          </div>
        </div>
      )
  }
}
