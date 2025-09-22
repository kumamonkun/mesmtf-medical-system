"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DataTable, type Column } from "@/components/common/data-table"
import {
  Database,
  Download,
  Upload,
  RefreshCw,
  Search,
  Filter,
  Trash2,
  Edit,
  Eye,
  FileText,
  Users,
  Calendar,
  Stethoscope,
  Pill,
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock
} from "lucide-react"
import { toast } from "sonner"

interface DataStats {
  totalUsers: number
  totalPatients: number
  totalAppointments: number
  totalDiagnoses: number
  totalPrescriptions: number
  totalDrugs: number
  totalReports: number
  recentActivity: any[]
}

interface DataViewProps {
  user: any
}

export function DataView({ user }: DataViewProps) {
  const [stats, setStats] = useState<DataStats>({
    totalUsers: 0,
    totalPatients: 0,
    totalAppointments: 0,
    totalDiagnoses: 0,
    totalPrescriptions: 0,
    totalDrugs: 0,
    totalReports: 0,
    recentActivity: []
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("overview")

  // Fetch data statistics
  const fetchDataStats = async () => {
    try {
      setLoading(true)
      
      // Fetch all statistics in parallel
      const [
        usersRes,
        patientsRes,
        appointmentsRes,
        diagnosesRes,
        prescriptionsRes,
        drugsRes,
        reportsRes
      ] = await Promise.all([
        fetch('/api/users/profiles'),
        fetch('/api/patients'),
        fetch('/api/appointments'),
        fetch('/api/diagnoses'),
        fetch('/api/prescriptions'),
        fetch('/api/drugs'),
        fetch('/api/medical-reports')
      ])

      const [usersData, patientsData, appointmentsData, diagnosesData, prescriptionsData, drugsData, reportsData] = await Promise.all([
        usersRes.json(),
        patientsRes.json(),
        appointmentsRes.json(),
        diagnosesRes.json(),
        prescriptionsRes.json(),
        drugsRes.json(),
        reportsRes.json()
      ])

      setStats({
        totalUsers: usersData.profiles?.length || 0,
        totalPatients: patientsData.patients?.length || 0,
        totalAppointments: appointmentsData.appointments?.length || 0,
        totalDiagnoses: diagnosesData.diagnoses?.length || 0,
        totalPrescriptions: prescriptionsData.prescriptions?.length || 0,
        totalDrugs: drugsData.drugs?.length || 0,
        totalReports: reportsData.reports?.length || 0,
        recentActivity: []
      })

    } catch (error) {
      console.error('Error fetching data stats:', error)
      toast.error('Failed to fetch data statistics')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDataStats()
  }, [])

  const getSidebarItems = () => {
    return [
      { icon: <Database className="h-4 w-4" />, label: "System Data", href: "/data", active: true },
      { icon: <Users className="h-4 w-4" />, label: "User Management", href: "/users" },
      { icon: <Activity className="h-4 w-4" />, label: "System Overview", href: "/overview" },
      { icon: <FileText className="h-4 w-4" />, label: "Settings", href: "/settings" },
    ]
  }

  const getDataHealth = () => {
    const totalRecords = stats.totalUsers + stats.totalPatients + stats.totalAppointments + stats.totalDiagnoses
    if (totalRecords > 1000) return { status: 'excellent', color: 'text-green-600', bg: 'bg-green-100' }
    if (totalRecords > 500) return { status: 'good', color: 'text-blue-600', bg: 'bg-blue-100' }
    if (totalRecords > 100) return { status: 'fair', color: 'text-yellow-600', bg: 'bg-yellow-100' }
    return { status: 'limited', color: 'text-red-600', bg: 'bg-red-100' }
  }

  const dataHealth = getDataHealth()

  const exportData = async (dataType: string) => {
    try {
      toast.info(`Exporting ${dataType} data...`)
      // Simulate export
      await new Promise(resolve => setTimeout(resolve, 2000))
      toast.success(`${dataType} data exported successfully`)
    } catch (error) {
      toast.error(`Failed to export ${dataType} data`)
    }
  }

  const clearData = async (dataType: string) => {
    if (!confirm(`Are you sure you want to clear all ${dataType} data? This action cannot be undone.`)) {
      return
    }
    
    try {
      toast.info(`Clearing ${dataType} data...`)
      // Simulate clear
      await new Promise(resolve => setTimeout(resolve, 1000))
      toast.success(`${dataType} data cleared successfully`)
      fetchDataStats() // Refresh stats
    } catch (error) {
      toast.error(`Failed to clear ${dataType} data`)
    }
  }

  return (
    <DashboardLayout user={user} sidebarItems={getSidebarItems()}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-balance">System Data Management</h1>
            <p className="text-muted-foreground">
              Manage and monitor system data across all modules
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={fetchDataStats} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Export All
            </Button>
          </div>
        </div>

        {/* Data Health Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Database className="h-5 w-5 mr-2" />
              Data Health Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-full ${dataHealth.bg}`}>
                  <Database className={`h-6 w-6 ${dataHealth.color}`} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold capitalize">{dataHealth.status} Data Health</h3>
                  <p className="text-sm text-muted-foreground">
                    {stats.totalUsers + stats.totalPatients + stats.totalAppointments + stats.totalDiagnoses} total records across all modules
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">{stats.totalUsers + stats.totalPatients + stats.totalAppointments + stats.totalDiagnoses}</div>
                <div className="text-sm text-muted-foreground">Total Records</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Users className="h-4 w-4 mr-2 text-blue-500" />
                Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">User accounts</p>
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
              <p className="text-xs text-muted-foreground">Scheduled visits</p>
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
              <p className="text-xs text-muted-foreground">Medical diagnoses</p>
            </CardContent>
          </Card>
        </div>

        {/* Additional Data Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Pill className="h-4 w-4 mr-2 text-pink-500" />
                Prescriptions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPrescriptions}</div>
              <p className="text-xs text-muted-foreground">Medication orders</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Pill className="h-4 w-4 mr-2 text-indigo-500" />
                Drugs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalDrugs}</div>
              <p className="text-xs text-muted-foreground">Drug inventory</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <FileText className="h-4 w-4 mr-2 text-teal-500" />
                Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalReports}</div>
              <p className="text-xs text-muted-foreground">Generated reports</p>
            </CardContent>
          </Card>
        </div>

        {/* Data Management Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="export">Export Data</TabsTrigger>
            <TabsTrigger value="import">Import Data</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Data Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Users</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full" 
                          style={{ width: `${(stats.totalUsers / Math.max(stats.totalUsers + stats.totalPatients + stats.totalAppointments + stats.totalDiagnoses, 1)) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-muted-foreground">{stats.totalUsers}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Patients</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${(stats.totalPatients / Math.max(stats.totalUsers + stats.totalPatients + stats.totalAppointments + stats.totalDiagnoses, 1)) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-muted-foreground">{stats.totalPatients}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Appointments</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-500 h-2 rounded-full" 
                          style={{ width: `${(stats.totalAppointments / Math.max(stats.totalUsers + stats.totalPatients + stats.totalAppointments + stats.totalDiagnoses, 1)) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-muted-foreground">{stats.totalAppointments}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Diagnoses</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-orange-500 h-2 rounded-full" 
                          style={{ width: `${(stats.totalDiagnoses / Math.max(stats.totalUsers + stats.totalPatients + stats.totalAppointments + stats.totalDiagnoses, 1)) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-muted-foreground">{stats.totalDiagnoses}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="export" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Export Data</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button onClick={() => exportData('Users')} className="justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Export Users ({stats.totalUsers})
                  </Button>
                  <Button onClick={() => exportData('Patients')} className="justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Export Patients ({stats.totalPatients})
                  </Button>
                  <Button onClick={() => exportData('Appointments')} className="justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Export Appointments ({stats.totalAppointments})
                  </Button>
                  <Button onClick={() => exportData('Diagnoses')} className="justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Export Diagnoses ({stats.totalDiagnoses})
                  </Button>
                  <Button onClick={() => exportData('Prescriptions')} className="justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Export Prescriptions ({stats.totalPrescriptions})
                  </Button>
                  <Button onClick={() => exportData('Drugs')} className="justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Export Drugs ({stats.totalDrugs})
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="import" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Import Data</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">Import Data Files</h3>
                    <p className="text-muted-foreground mb-4">
                      Upload CSV or JSON files to import data
                    </p>
                    <Button>
                      <Upload className="h-4 w-4 mr-2" />
                      Choose Files
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="maintenance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Data Maintenance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border border-amber-200 bg-amber-50 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-amber-800">Warning</h4>
                        <p className="text-sm text-amber-700 mt-1">
                          Data maintenance operations can affect system performance and data integrity. Use with caution.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button variant="outline" onClick={() => clearData('Users')} className="justify-start">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear Users Data
                    </Button>
                    <Button variant="outline" onClick={() => clearData('Patients')} className="justify-start">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear Patients Data
                    </Button>
                    <Button variant="outline" onClick={() => clearData('Appointments')} className="justify-start">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear Appointments Data
                    </Button>
                    <Button variant="outline" onClick={() => clearData('Diagnoses')} className="justify-start">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear Diagnoses Data
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
