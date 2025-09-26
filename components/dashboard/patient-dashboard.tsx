"use client"

import { useRouter } from "next/navigation"
import { DashboardLayout } from "./dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, FileText, Heart, MessageSquare, Pill, Stethoscope, Clock, AlertCircle } from "lucide-react"
import Image from "next/image"

interface PatientDashboardProps {
  user: {
    username: string
    role: string
    loginTime: string
  }
}

export function PatientDashboard({ user }: PatientDashboardProps) {
  const router = useRouter()
  
  const sidebarItems = [
    { icon: <Stethoscope className="h-4 w-4" />, label: "My Profile", href: "/profile", active: true },
    { icon: <Calendar className="h-4 w-4" />, label: "Appointments", href: "/appointments" },
    { icon: <Stethoscope className="h-4 w-4" />, label: "AI Diagnosis", href: "/diagnosis" },
    { icon: <FileText className="h-4 w-4" />, label: "Medical Records", href: "/records" },
    { icon: <Pill className="h-4 w-4" />, label: "Prescriptions", href: "/prescriptions" },
    { icon: <MessageSquare className="h-4 w-4" />, label: "Messages", href: "/messages" },
  ]

  return (
    <DashboardLayout user={user} sidebarItems={sidebarItems}>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-balance">Welcome back, {user.username}</h1>
            <p className="text-muted-foreground">Manage your health records and appointments</p>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white shadow-sm border">
              <Image
                src="/logo-48706.jpg"
                alt="MESMTF Logo"
                width={32}
                height={32}
                className="rounded-md object-contain"
              />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Stethoscope className="h-5 w-5 mr-2 text-primary" />
                AI Diagnosis
              </CardTitle>
              <CardDescription>Get instant health assessment</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => router.push('/diagnosis')}>Start Diagnosis</Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-primary" />
                Book Appointment
              </CardTitle>
              <CardDescription>Schedule with a doctor</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full bg-transparent" onClick={() => router.push('/appointments')}>
                Book Now
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <FileText className="h-5 w-5 mr-2 text-primary" />
                View Records
              </CardTitle>
              <CardDescription>Access medical history</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full bg-transparent" onClick={() => router.push('/records')}>
                View All
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Recent Appointments
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Dr. Sarah Johnson</p>
                  <p className="text-sm text-muted-foreground">General Medicine</p>
                  <p className="text-xs text-muted-foreground">Sept 25, 2025 - 10:00 AM</p>
                </div>
                <Badge variant="secondary">Upcoming</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Dr. Michael Chen</p>
                  <p className="text-sm text-muted-foreground">Internal Medicine</p>
                  <p className="text-xs text-muted-foreground">Sept 20, 2025 - 2:30 PM</p>
                </div>
                <Badge variant="outline">Completed</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Heart className="h-5 w-5 mr-2" />
                Health Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">Blood Pressure</span>
                <span className="text-sm font-medium">120/80 mmHg</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Temperature</span>
                <span className="text-sm font-medium">98.6°F</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Last Checkup</span>
                <span className="text-sm font-medium">Sept 20, 2025</span>
              </div>
              <div className="pt-2">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  <span className="text-sm text-amber-600">Follow-up recommended</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Prescriptions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Pill className="h-5 w-5 mr-2" />
              Active Prescriptions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Artemether-Lumefantrine</p>
                  <p className="text-sm text-muted-foreground">For Malaria - Take twice daily</p>
                </div>
                <Badge>Active</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Paracetamol</p>
                  <p className="text-sm text-muted-foreground">For fever - As needed</p>
                </div>
                <Badge variant="outline">As needed</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
