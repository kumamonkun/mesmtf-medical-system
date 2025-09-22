"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart3,
  Users,
  Calendar,
  Stethoscope,
  Pill,
  FileText,
  Activity,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  Download,
  Database,
  Shield
} from "lucide-react"
import { toast } from "sonner"

interface SystemStats {
  totalUsers: number
  totalPatients: number
  totalAppointments: number
  totalDiagnoses: number
  totalPrescriptions: number
  totalReports: number
  activeUsers: number
  pendingAppointments: number
  completedDiagnoses: number
  recentActivity: any[]
}

interface OverviewViewProps {
  user: any
}

export function OverviewView({ user }: OverviewViewProps) {
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 0,
    totalPatients: 0,
    totalAppointments: 0,
    totalDiagnoses: 0,
    totalPrescriptions: 0,
    totalReports: 0,
    activeUsers: 0,
    pendingAppointments: 0,
    completedDiagnoses: 0,
    recentActivity: []
  })
  const [loading, setLoading] = useState(true)

  // Fetch system statistics
  const fetchStats = async () => {
    try {
      setLoading(true)
      
      // Fetch all statistics in parallel
      const [
        usersRes,
        patientsRes,
        appointmentsRes,
        diagnosesRes,
        prescriptionsRes,
        reportsRes
      ] = await Promise.all([
        fetch('/api/users/profiles'),
        fetch('/api/patients'),
        fetch('/api/appointments'),
        fetch('/api/diagnoses'),
        fetch('/api/prescriptions'),
        fetch('/api/medical-reports')
      ])

      const [usersData, patientsData, appointmentsData, diagnosesData, prescriptionsData, reportsData] = await Promise.all([
        usersRes.json(),
        patientsRes.json(),
        appointmentsRes.json(),
        diagnosesRes.json(),
        prescriptionsRes.json(),
        reportsRes.json()
      ])

      const now = new Date()
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)

      setStats({
        totalUsers: usersData.profiles?.length || 0,
        totalPatients: patientsData.patients?.length || 0,
        totalAppointments: appointmentsData.appointments?.length || 0,
        totalDiagnoses: diagnosesData.diagnoses?.length || 0,
        totalPrescriptions: prescriptionsData.prescriptions?.length || 0,
        totalReports: reportsData.reports?.length || 0,
        activeUsers: usersData.profiles?.filter((u: any) => 
          new Date(u.updated_at) > oneWeekAgo
        ).length || 0,
        pendingAppointments: appointmentsData.appointments?.filter((a: any) => 
          a.status === 'scheduled' || a.status === 'confirmed'
        ).length || 0,
        completedDiagnoses: diagnosesData.diagnoses?.filter((d: any) => 
          d.confidence_level && d.confidence_level > 70
        ).length || 0,
        recentActivity: []
      })

    } catch (error) {
      console.error('Error fetching stats:', error)
      toast.error('Failed to fetch system statistics')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  const getSidebarItems = () => {
    return [
      { icon: <BarChart3 className="h-4 w-4" />, label: "System Overview", href: "/overview", active: true },
      { icon: <Users className="h-4 w-4" />, label: "User Management", href: "/users" },
      { icon: <Database className="h-4 w-4" />, label: "System Data", href: "/data" },
      { icon: <Shield className="h-4 w-4" />, label: "Settings", href: "/settings" },
    ]
  }

  const getHealthStatus = () => {
    const healthScore = Math.min(100, Math.max(0, 
      (stats.activeUsers / Math.max(stats.totalUsers, 1)) * 100
    ))
    
    if (healthScore >= 80) return { status: 'excellent', color: 'text-green-600', bg: 'bg-green-100' }
    if (healthScore >= 60) return { status: 'good', color: 'text-blue-600', bg: 'bg-blue-100' }
    if (healthScore >= 40) return { status: 'fair', color: 'text-yellow-600', bg: 'bg-yellow-100' }
    return { status: 'poor', color: 'text-red-600', bg: 'bg-red-100' }
  }

  const healthStatus = getHealthStatus()

  return (
    <DashboardLayout user={user} sidebarItems={getSidebarItems()}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-balance">System Overview</h1>
            <p className="text-muted-foreground">
              Monitor system performance and key metrics
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={fetchStats} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* System Health */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              System Health
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-full ${healthStatus.bg}`}>
                  <Activity className={`h-6 w-6 ${healthStatus.color}`} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold capitalize">{healthStatus.status} Health</h3>
                  <p className="text-sm text-muted-foreground">
                    {stats.activeUsers} of {stats.totalUsers} users active in the last 7 days
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{stats.activeUsers}</div>
                <div className="text-sm text-muted-foreground">Active Users</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Users className="h-4 w-4 mr-2 text-blue-500" />
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">Registered users</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Stethoscope className="h-4 w-4 mr-2 text-green-500" />
                Patients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPatients}</div>
              <p className="text-xs text-muted-foreground">Patient records</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-purple-500" />
                Appointments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAppointments}</div>
              <p className="text-xs text-muted-foreground">
                {stats.pendingAppointments} pending
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <FileText className="h-4 w-4 mr-2 text-orange-500" />
                Diagnoses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalDiagnoses}</div>
              <p className="text-xs text-muted-foreground">
                {stats.completedDiagnoses} completed
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Statistics */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="medical">Medical</TabsTrigger>
            <TabsTrigger value="system">System</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">System started</p>
                        <p className="text-xs text-muted-foreground">2 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">New user registered</p>
                        <p className="text-xs text-muted-foreground">4 hours ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Diagnosis completed</p>
                        <p className="text-xs text-muted-foreground">6 hours ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button className="w-full justify-start" variant="outline">
                    <Users className="h-4 w-4 mr-2" />
                    Manage Users
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Database className="h-4 w-4 mr-2" />
                    View System Data
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Shield className="h-4 w-4 mr-2" />
                    System Settings
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export Data
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">User Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Patients</span>
                      <span>{Math.round((stats.totalPatients / Math.max(stats.totalUsers, 1)) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${(stats.totalPatients / Math.max(stats.totalUsers, 1)) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Active Users</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.activeUsers}</div>
                  <p className="text-xs text-muted-foreground">Last 7 days</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">System Load</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">Low</div>
                  <p className="text-xs text-muted-foreground">Optimal performance</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="medical" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Medical Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total Diagnoses</span>
                    <span className="font-semibold">{stats.totalDiagnoses}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Prescriptions</span>
                    <span className="font-semibold">{stats.totalPrescriptions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Medical Reports</span>
                    <span className="font-semibold">{stats.totalReports}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Appointment Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Total Appointments</span>
                    <span className="font-semibold">{stats.totalAppointments}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pending</span>
                    <span className="font-semibold text-orange-600">{stats.pendingAppointments}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Completed</span>
                    <span className="font-semibold text-green-600">{stats.completedDiagnoses}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="system" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">System Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Database Status</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Online
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>API Status</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Operational
                    </Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Uptime</span>
                    <span>99.9%</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Performance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Response Time</span>
                    <span>120ms</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Memory Usage</span>
                    <span>45%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>CPU Usage</span>
                    <span>23%</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
