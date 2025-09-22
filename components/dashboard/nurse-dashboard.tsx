"use client"

import { DashboardLayout } from "./dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Calendar, Pill, FileText, Activity, Clock, AlertTriangle, Heart } from "lucide-react"

interface User {
  username: string
  role: string
  loginTime: string
}

interface NurseDashboardProps {
  user: User
}

export function NurseDashboard({ user }: NurseDashboardProps) {
  const sidebarItems = [
    { icon: <Users className="h-4 w-4" />, label: "Patient Care", href: "/patients", active: true },
    { icon: <Calendar className="h-4 w-4" />, label: "Schedules", href: "/schedules" },
    { icon: <Pill className="h-4 w-4" />, label: "Drug Administration", href: "/medications" },
    { icon: <Activity className="h-4 w-4" />, label: "Vital Signs", href: "/vitals" },
    { icon: <FileText className="h-4 w-4" />, label: "Patient Records", href: "/records" },
  ]

  return (
    <DashboardLayout user={user} sidebarItems={sidebarItems}>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div>
          <h1 className="text-3xl font-bold text-balance">Welcome, Nurse {user.username}</h1>
          <p className="text-muted-foreground">You have 12 patients under your care today</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Patients Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">Under your care</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Medications Due</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
              <p className="text-xs text-muted-foreground">Next 2 hours</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Vital Signs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">Pending checks</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">1</div>
              <p className="text-xs text-muted-foreground">Requires attention</p>
            </CardContent>
          </Card>
        </div>

        {/* Patient Care & Medication Schedule */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-destructive" />
                Priority Patients
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 border border-destructive/20 rounded-lg bg-destructive/5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-destructive">Room 205 - Maria Santos</p>
                    <p className="text-sm text-muted-foreground">High fever (103°F) - Malaria treatment</p>
                    <p className="text-xs text-muted-foreground">Last check: 30 minutes ago</p>
                  </div>
                  <Badge variant="destructive">Critical</Badge>
                </div>
              </div>
              <div className="p-3 border border-amber-200 rounded-lg bg-amber-50">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-amber-700">Room 103 - John Wilson</p>
                    <p className="text-sm text-muted-foreground">Post-treatment monitoring - Typhoid</p>
                    <p className="text-xs text-muted-foreground">Next check: In 1 hour</p>
                  </div>
                  <Badge className="bg-amber-100 text-amber-700">Monitor</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Medication Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg bg-primary/5">
                <div>
                  <p className="font-medium">Room 205 - Artemether</p>
                  <p className="text-sm text-muted-foreground">Maria Santos - 2 tablets</p>
                  <p className="text-xs text-muted-foreground">Due: Now</p>
                </div>
                <Badge>Due Now</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Room 108 - Ciprofloxacin</p>
                  <p className="text-sm text-muted-foreground">David Brown - 1 tablet</p>
                  <p className="text-xs text-muted-foreground">Due: 2:00 PM</p>
                </div>
                <Badge variant="outline">Scheduled</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Room 112 - Paracetamol</p>
                  <p className="text-sm text-muted-foreground">Lisa Johnson - 2 tablets</p>
                  <p className="text-xs text-muted-foreground">Due: 3:30 PM</p>
                </div>
                <Badge variant="outline">Scheduled</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Heart className="h-5 w-5 mr-2 text-primary" />
                Record Vitals
              </CardTitle>
              <CardDescription>Update patient vital signs</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Record Vitals</Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Pill className="h-5 w-5 mr-2 text-primary" />
                Administer Medication
              </CardTitle>
              <CardDescription>Log medication administration</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full bg-transparent">
                Log Medication
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <FileText className="h-5 w-5 mr-2 text-primary" />
                Patient Notes
              </CardTitle>
              <CardDescription>Add nursing observations</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full bg-transparent">
                Add Notes
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Patient List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Today's Patient List
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Room 205 - Maria Santos</p>
                  <p className="text-sm text-muted-foreground">Malaria treatment - Day 2</p>
                  <p className="text-xs text-muted-foreground">Last vitals: BP 130/85, Temp 101°F</p>
                </div>
                <Badge variant="destructive">Critical</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Room 108 - David Brown</p>
                  <p className="text-sm text-muted-foreground">Typhoid fever - Day 5</p>
                  <p className="text-xs text-muted-foreground">Last vitals: BP 120/80, Temp 99°F</p>
                </div>
                <Badge>Stable</Badge>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">Room 112 - Lisa Johnson</p>
                  <p className="text-sm text-muted-foreground">Recovery - Malaria</p>
                  <p className="text-xs text-muted-foreground">Last vitals: BP 115/75, Temp 98.6°F</p>
                </div>
                <Badge variant="outline">Recovering</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
