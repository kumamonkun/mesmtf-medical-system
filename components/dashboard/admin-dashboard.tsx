"use client"

import { DashboardLayout } from "./dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, UserPlus, Settings, Database, BarChart3, Shield, Activity, AlertCircle, TrendingUp } from "lucide-react"
import { useAdminStats, useUsers } from "@/hooks/use-admin-data"
import { PWAStatus, PWAFeatures } from "@/components/pwa/pwa-status"

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
  const { users, loading: usersLoading, approveUser, rejectUser } = useUsers()

  const sidebarItems = [
    { icon: <BarChart3 className="h-4 w-4" />, label: "Overview", href: "/overview", active: true },
    { icon: <Users className="h-4 w-4" />, label: "User Management", href: "/users" },
    { icon: <Database className="h-4 w-4" />, label: "System Data", href: "/data" },
    { icon: <Settings className="h-4 w-4" />, label: "System Settings", href: "/settings" },
    { icon: <Shield className="h-4 w-4" />, label: "Security", href: "/security" },
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
        <div>
          <h1 className="text-3xl font-bold text-balance">System Administration</h1>
          <p className="text-muted-foreground">Monitor and manage the MESMTF system</p>
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

        {/* System Alerts & User Management */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertCircle className="h-5 w-5 mr-2 text-amber-500" />
                System Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 border border-amber-200 rounded-lg bg-amber-50">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-amber-700">Database Backup</p>
                    <p className="text-sm text-muted-foreground">Scheduled backup completed successfully</p>
                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                  </div>
                  <Badge className="bg-amber-100 text-amber-700">Info</Badge>
                </div>
              </div>
              <div className="p-3 border border-blue-200 rounded-lg bg-blue-50">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium text-blue-700">System Update</p>
                    <p className="text-sm text-muted-foreground">New security patches available</p>
                    <p className="text-xs text-muted-foreground">1 day ago</p>
                  </div>
                  <Badge className="bg-blue-100 text-blue-700">Update</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <UserPlus className="h-5 w-5 mr-2" />
                Recent User Registrations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {usersLoading ? (
                <div className="flex items-center justify-center p-4">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              ) : stats?.recentUsers && stats.recentUsers.length > 0 ? (
                stats.recentUsers.slice(0, 3).map((user, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        {user.specialization && ` - ${user.specialization}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Registered: {new Date(user.registeredAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => rejectUser(user.id)}
                      >
                        Reject
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => approveUser(user.id)}
                      >
                        Approve
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center p-4 text-muted-foreground">
                  No recent user registrations
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Users className="h-5 w-5 mr-2 text-primary" />
                Manage Users
              </CardTitle>
              <CardDescription>Add, edit, or remove system users</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                className="w-full"
                onClick={() => window.location.href = '/users'}
              >
                User Management
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Database className="h-5 w-5 mr-2 text-primary" />
                System Data
              </CardTitle>
              <CardDescription>View and manage system data</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                className="w-full bg-transparent"
                onClick={() => window.location.href = '/data'}
              >
                View Data
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

        {/* User Statistics and PWA Status */}
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
          
          <div className="space-y-4">
            <PWAStatus />
            <PWAFeatures />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
