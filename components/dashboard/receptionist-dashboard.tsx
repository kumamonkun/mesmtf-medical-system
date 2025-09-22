"use client"

import { DashboardLayout } from "./dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, Phone, FileText, Clock, UserPlus, CheckCircle } from "lucide-react"

interface User {
  username: string
  role: string
  loginTime: string
}

interface ReceptionistDashboardProps {
  user: User
}

export function ReceptionistDashboard({ user }: ReceptionistDashboardProps) {
  const sidebarItems = [
    { icon: <Calendar className="h-4 w-4" />, label: "Appointments", href: "/appointments", active: true },
    { icon: <UserPlus className="h-4 w-4" />, label: "Patient Registration", href: "/registration" },
    { icon: <Users className="h-4 w-4" />, label: "Patient Records", href: "/patients" },
    { icon: <Phone className="h-4 w-4" />, label: "Call Management", href: "/calls" },
    { icon: <FileText className="h-4 w-4" />, label: "Reports", href: "/reports" },
  ]

  return (
    <DashboardLayout user={user} sidebarItems={sidebarItems}>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold text-balance">Reception Desk</h1>
          <p className="text-muted-foreground">Welcome, {user.username} - Managing patient flow and appointments</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">8 completed, 16 pending</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Walk-in Patients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">7</div>
              <p className="text-xs text-muted-foreground">Waiting for consultation</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">New Registrations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
              <p className="text-xs text-muted-foreground">Today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pending Calls</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-muted-foreground">Appointment requests</p>
            </CardContent>
          </Card>
        </div>

        {/* Current Appointments & Walk-ins */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Current Appointments
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg bg-primary/5">
                <div>
                  <p className="font-medium">9:00 AM - John Doe</p>
                  <p className="text-sm text-muted-foreground">Dr. Sarah Johnson - Room 101</p>
                  <p className="text-xs text-muted-foreground">Patient ID: P-2025-001</p>
                </div>
                <Badge>In Progress</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">10:30 AM - Mary Smith</p>
                  <p className="text-sm text-muted-foreground">Dr. Michael Chen - Room 102</p>
                  <p className="text-xs text-muted-foreground">Patient ID: P-2025-015</p>
                </div>
                <Badge variant="outline">Waiting</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">11:00 AM - Robert Johnson</p>
                  <p className="text-sm text-muted-foreground">Dr. Sarah Johnson - Room 101</p>
                  <p className="text-xs text-muted-foreground">Patient ID: P-2025-032</p>
                </div>
                <Badge variant="outline">Scheduled</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Walk-in Queue
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg bg-amber-50">
                <div>
                  <p className="font-medium">Queue #1 - Lisa Wilson</p>
                  <p className="text-sm text-muted-foreground">Fever and headache symptoms</p>
                  <p className="text-xs text-muted-foreground">Waiting time: 45 minutes</p>
                </div>
                <Badge className="bg-amber-100 text-amber-700">Priority</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Queue #2 - David Brown</p>
                  <p className="text-sm text-muted-foreground">Follow-up consultation</p>
                  <p className="text-xs text-muted-foreground">Waiting time: 20 minutes</p>
                </div>
                <Badge variant="outline">Waiting</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Queue #3 - Emma Davis</p>
                  <p className="text-sm text-muted-foreground">General consultation</p>
                  <p className="text-xs text-muted-foreground">Waiting time: 10 minutes</p>
                </div>
                <Badge variant="outline">Waiting</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <UserPlus className="h-5 w-5 mr-2 text-primary" />
                Register Patient
              </CardTitle>
              <CardDescription>Add new patient to system</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">New Registration</Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-primary" />
                Book Appointment
              </CardTitle>
              <CardDescription>Schedule patient consultation</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full bg-transparent">
                Book Now
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Phone className="h-5 w-5 mr-2 text-primary" />
                Call Management
              </CardTitle>
              <CardDescription>Handle incoming calls</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full bg-transparent">
                View Calls
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Doctor Availability & Recent Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2" />
                Doctor Availability
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Dr. Sarah Johnson</p>
                    <p className="text-sm text-muted-foreground">General Medicine</p>
                  </div>
                  <Badge>Available</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Dr. Michael Chen</p>
                    <p className="text-sm text-muted-foreground">Internal Medicine</p>
                  </div>
                  <Badge className="bg-amber-100 text-amber-700">Busy</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">Dr. Emily Rodriguez</p>
                    <p className="text-sm text-muted-foreground">Pediatrics</p>
                  </div>
                  <Badge variant="outline">On Break</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                Recent Activities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="h-2 w-2 bg-green-500 rounded-full mt-2" />
                <div>
                  <p className="text-sm font-medium">Patient registered</p>
                  <p className="text-xs text-muted-foreground">Lisa Wilson - P-2025-089</p>
                  <p className="text-xs text-muted-foreground">5 minutes ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="h-2 w-2 bg-blue-500 rounded-full mt-2" />
                <div>
                  <p className="text-sm font-medium">Appointment scheduled</p>
                  <p className="text-xs text-muted-foreground">David Brown - Sept 26, 2:00 PM</p>
                  <p className="text-xs text-muted-foreground">10 minutes ago</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="h-2 w-2 bg-purple-500 rounded-full mt-2" />
                <div>
                  <p className="text-sm font-medium">Call handled</p>
                  <p className="text-xs text-muted-foreground">Appointment inquiry - Emma Davis</p>
                  <p className="text-xs text-muted-foreground">15 minutes ago</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
