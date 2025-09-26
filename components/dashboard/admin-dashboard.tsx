"use client"

import { DashboardLayout } from "./dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Settings, BarChart3, Activity, AlertCircle, TrendingUp } from "lucide-react"
import { useAdminStats } from "@/hooks/use-admin-data"
import Image from "next/image"

interface User {
  username: string
  role: string
  loginTime: string
}

interface AdminDashboardProps {
  user: User
}

export function AdminDashboard({ user }: AdminDashboardProps) {
  const { stats, loading: statsLoading, error: statsError } = useAdminStats()

  const sidebarItems = [
    { icon: <BarChart3 className="h-4 w-4" />, label: "Overview", href: "/overview", active: true },
    { icon: <Users className="h-4 w-4" />, label: "User Management", href: "/users" },
    { icon: <Settings className="h-4 w-4" />, label: "System Settings", href: "/settings" },
    { icon: <Activity className="h-4 w-4" />, label: "System Logs", href: "/logs" },
  ]

  if (statsLoading) {
    return (
      <DashboardLayout user={user} sidebarItems={sidebarItems}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span className="text-lg">Loading admin dashboard...</span>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (statsError) {
    return (
      <DashboardLayout user={user} sidebarItems={sidebarItems}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-destructive">Error Loading Dashboard</h1>
            <p className="text-muted-foreground">{statsError}</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout user={user} sidebarItems={sidebarItems}>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-balance">System Administration</h1>
            <p className="text-muted-foreground">Monitor and manage the MESMTF system</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-white shadow-sm border">
              <Image
                src="/logo-48706.jpg"
                alt="MESMTF Logo"
                width={48}
                height={48}
                className="rounded-md object-contain"
              />
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white shadow-sm border">
              <Image
                src="/logo-ministry.jpg"
                alt="Ministry Logo"
                width={32}
                height={32}
                className="rounded-md object-contain"
              />
            </div>
          </div>
        </div>

        {/* System Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
              <div className="flex items-center text-xs text-green-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                +{stats?.userGrowth || 0}% from last month
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.activeSessions || 0}</div>
              <div className="flex items-center text-xs text-green-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                +{stats?.sessionGrowth || 0}% from yesterday
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.systemUptime || 0}%</div>
              <p className="text-xs text-muted-foreground">Last 30 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">{stats?.pendingApprovals || 0}</div>
              <p className="text-xs text-muted-foreground">User registrations</p>
            </CardContent>
          </Card>
        </div>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertCircle className="h-5 w-5 mr-2 text-green-500" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 border border-green-200 rounded-lg bg-green-50">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-green-700">System Status</p>
                  <p className="text-sm text-muted-foreground">All systems operational</p>
                  <p className="text-xs text-muted-foreground">Uptime: {stats?.systemUptime || 99.9}%</p>
                </div>
                <Badge className="bg-green-100 text-green-700">Healthy</Badge>
              </div>
            </div>
            
            <div className="p-3 border border-blue-200 rounded-lg bg-blue-50">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-blue-700">Active Sessions</p>
                  <p className="text-sm text-muted-foreground">{stats?.activeSessions || 0} users currently online</p>
                  <p className="text-xs text-muted-foreground">Real-time monitoring</p>
                </div>
                <Badge className="bg-blue-100 text-blue-700">Info</Badge>
              </div>
            </div>
            
            {stats?.totalUsers > 0 && (
              <div className="p-3 border border-purple-200 rounded-lg bg-purple-50">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-purple-700">User Growth</p>
                    <p className="text-sm text-muted-foreground">+{stats.userGrowth}% growth this month</p>
                    <p className="text-xs text-muted-foreground">Total: {stats.totalUsers} users</p>
                  </div>
                  <Badge className="bg-purple-100 text-purple-700">Growth</Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Users className="h-5 w-5 mr-2 text-primary" />
                User Management
              </CardTitle>
              <CardDescription>View and manage system users</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full"
                onClick={() => window.location.href = '/users'}
              >
                Manage Users
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-primary" />
                System Reports
              </CardTitle>
              <CardDescription>Generate comprehensive reports</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                className="w-full bg-transparent"
                onClick={() => window.location.href = '/reports'}
              >
                View Reports
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* User Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="h-5 w-5 mr-2" />
                  User Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{stats?.roleCounts.patients || 0}</div>
                    <p className="text-sm text-muted-foreground">Patients</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{stats?.roleCounts.doctors || 0}</div>
                    <p className="text-sm text-muted-foreground">Doctors</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{stats?.roleCounts.nurses || 0}</div>
                    <p className="text-sm text-muted-foreground">Nurses</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{stats?.roleCounts.pharmacists || 0}</div>
                    <p className="text-sm text-muted-foreground">Pharmacists</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-teal-600">{stats?.roleCounts.receptionists || 0}</div>
                    <p className="text-sm text-muted-foreground">Receptionists</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{stats?.roleCounts.admins || 0}</div>
                    <p className="text-sm text-muted-foreground">Administrators</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
        </div>
      </div>
    </DashboardLayout>
  )
}
