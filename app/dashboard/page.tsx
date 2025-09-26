/**
 * MESMTF Dashboard Page
 * 
 * This is the main dashboard page that routes users to their appropriate
 * dashboard based on their role in the medical system.
 * 
 * Role-based routing:
 * - Admin: Full system management dashboard
 * - Doctor: Medical diagnosis and patient management
 * - Nurse: Patient care and vital signs monitoring
 * - Pharmacist: Drug inventory and prescription management
 * - Receptionist: Appointment scheduling and patient registration
 * - Patient: Personal medical records and appointments
 * - Guest: Public information and basic features
 * 
 * @author Ministry of Health and Social Services
 * @version 1.0.0
 */

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

/**
 * Dashboard Page Component
 * 
 * Renders the appropriate dashboard based on user role.
 * Provides role-based access control and routing.
 * 
 * @returns The appropriate dashboard component for the user's role
 */
export default function DashboardPage() {
  // Get authentication state and user information
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
