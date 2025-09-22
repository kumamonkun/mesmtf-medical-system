"use client"

import { DashboardLayout } from "./dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, FileText, Users, Stethoscope, ClipboardList, TrendingUp, Clock, AlertTriangle } from "lucide-react"
import { useDoctorData } from "@/hooks/use-doctor-data"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"

interface User {
  username: string
  role: string
  loginTime: string
}

interface DoctorDashboardProps {
  user: User
}

export function DoctorDashboard({ user }: DoctorDashboardProps) {
  const { profile } = useAuth()
  const router = useRouter()
  
  // Get doctor ID from profile
  const doctorId = profile?.id
  
  // Fetch doctor data
  const { stats, appointments, diagnoses, alerts, loading, error } = useDoctorData(doctorId || '')
  
  const sidebarItems = [
    { icon: <Users className="h-4 w-4" />, label: "Patients", href: "/patients", active: true },
    { icon: <Calendar className="h-4 w-4" />, label: "Appointments", href: "/appointments" },
    { icon: <Stethoscope className="h-4 w-4" />, label: "Diagnosis Tool", href: "/diagnosis" },
    { icon: <ClipboardList className="h-4 w-4" />, label: "Treatment Plans", href: "/treatment" },
    { icon: <FileText className="h-4 w-4" />, label: "Medical Records", href: "/records" },
    { icon: <TrendingUp className="h-4 w-4" />, label: "Reports", href: "/reports" },
  ]

  const handleAIDiagnosis = () => {
    router.push('/diagnosis')
  }

  const handlePatientRecords = () => {
    router.push('/patients')
  }

  const handleGenerateReport = () => {
    router.push('/reports')
  }

  if (loading) {
    return (
      <DashboardLayout user={user} sidebarItems={sidebarItems}>
        <div className="space-y-6">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-8 mb-2" />
                  <Skeleton className="h-3 w-20" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout user={user} sidebarItems={sidebarItems}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-destructive mb-2">Error Loading Data</h2>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout user={user} sidebarItems={sidebarItems}>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold text-balance">Good morning, Dr. {user.username}</h1>
          <p className="text-muted-foreground">You have {stats.todayPatients} appointments scheduled for today</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Today's Patients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.todayPatients}</div>
              <p className="text-xs text-muted-foreground">Scheduled today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pending Diagnoses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingDiagnoses}</div>
              <p className="text-xs text-muted-foreground">Awaiting review</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Treatments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeTreatments}</div>
              <p className="text-xs text-muted-foreground">Ongoing cases</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Critical Cases</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{stats.criticalCases}</div>
              <p className="text-xs text-muted-foreground">Require attention</p>
            </CardContent>
          </Card>
        </div>

        {/* Today's Schedule & Critical Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Today's Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {appointments.length > 0 ? (
                appointments.slice(0, 3).map((appointment, index) => (
                  <div 
                    key={appointment.id} 
                    className={`flex items-center justify-between p-3 border rounded-lg ${
                      index === 0 ? 'bg-primary/5' : ''
                    }`}
                  >
                    <div>
                      <p className="font-medium">{appointment.patient_name}</p>
                      <p className="text-sm text-muted-foreground">{appointment.reason}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(appointment.appointment_date).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true
                        })} - {appointment.room}
                      </p>
                    </div>
                    <Badge variant={index === 0 ? 'default' : 'outline'}>
                      {index === 0 ? 'Next' : appointment.status}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <p>No appointments scheduled for today</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-destructive" />
                Critical Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {alerts.length > 0 ? (
                alerts.map((alert) => (
                  <div 
                    key={alert.id}
                    className={`p-3 border rounded-lg ${
                      alert.severity === 'critical' 
                        ? 'border-destructive/20 bg-destructive/5' 
                        : 'border-amber-200 bg-amber-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className={`font-medium ${
                          alert.severity === 'critical' ? 'text-destructive' : 'text-amber-700'
                        }`}>
                          Patient ID: {alert.patient_id}
                        </p>
                        <p className="text-sm text-muted-foreground">{alert.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(alert.created_at).toLocaleString()}
                        </p>
                      </div>
                      <Badge 
                        variant={alert.severity === 'critical' ? 'destructive' : 'outline'}
                        className={alert.severity === 'warning' ? 'bg-amber-100 text-amber-700' : ''}
                      >
                        {alert.severity === 'critical' ? 'Critical' : 'Warning'}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <p>No critical alerts at this time</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleAIDiagnosis}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Stethoscope className="h-5 w-5 mr-2 text-primary" />
                AI Diagnosis Tool
              </CardTitle>
              <CardDescription>Use expert system for diagnosis</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Open Tool</Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handlePatientRecords}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Users className="h-5 w-5 mr-2 text-primary" />
                Patient Records
              </CardTitle>
              <CardDescription>View and manage patient data</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full bg-transparent">
                View Records
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={handleGenerateReport}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-primary" />
                Generate Report
              </CardTitle>
              <CardDescription>Create medical reports</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full bg-transparent">
                New Report
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Diagnoses */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Recent Diagnoses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {diagnoses.length > 0 ? (
                diagnoses.slice(0, 2).map((diagnosis) => (
                  <div key={diagnosis.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Patient: {diagnosis.patient_name}</p>
                      <p className="text-sm text-muted-foreground">Diagnosis: {diagnosis.diagnosis}</p>
                      <p className="text-xs text-muted-foreground">Treatment: {diagnosis.treatment}</p>
                    </div>
                    <Badge>{diagnosis.status}</Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <p>No recent diagnoses</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
