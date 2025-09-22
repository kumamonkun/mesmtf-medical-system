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
  Activity,
  Heart,
  Thermometer,
  Gauge,
  Users,
  Search,
  Plus,
  Edit,
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus
} from "lucide-react"
import { toast } from "sonner"

interface VitalSigns {
  id: string
  patient_name: string
  patient_id: string
  temperature: number
  blood_pressure_systolic: number
  blood_pressure_diastolic: number
  heart_rate: number
  respiratory_rate: number
  oxygen_saturation: number
  weight: number
  height: number
  bmi: number
  recorded_at: string
  recorded_by: string
  notes: string
  status: 'normal' | 'elevated' | 'critical'
}

interface VitalsViewProps {
  user: any
}

export function VitalsView({ user }: VitalsViewProps) {
  const [vitals, setVitals] = useState<VitalSigns[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("recent")

  // Mock vital signs data
  const mockVitals: VitalSigns[] = [
    {
      id: '1',
      patient_name: 'John Doe',
      patient_id: 'P-2025-001',
      temperature: 38.5,
      blood_pressure_systolic: 140,
      blood_pressure_diastolic: 90,
      heart_rate: 95,
      respiratory_rate: 22,
      oxygen_saturation: 96,
      weight: 75,
      height: 175,
      bmi: 24.5,
      recorded_at: '2024-09-21T09:00:00Z',
      recorded_by: 'Nurse Mary Smith',
      notes: 'Patient showing signs of fever',
      status: 'elevated'
    },
    {
      id: '2',
      patient_name: 'Jane Smith',
      patient_id: 'P-2025-015',
      temperature: 36.8,
      blood_pressure_systolic: 120,
      blood_pressure_diastolic: 80,
      heart_rate: 72,
      respiratory_rate: 18,
      oxygen_saturation: 98,
      weight: 65,
      height: 165,
      bmi: 23.9,
      recorded_at: '2024-09-21T10:30:00Z',
      recorded_by: 'Nurse John Wilson',
      notes: 'Vitals within normal range',
      status: 'normal'
    },
    {
      id: '3',
      patient_name: 'Robert Johnson',
      patient_id: 'P-2025-032',
      temperature: 39.2,
      blood_pressure_systolic: 160,
      blood_pressure_diastolic: 100,
      heart_rate: 110,
      respiratory_rate: 28,
      oxygen_saturation: 92,
      weight: 80,
      height: 180,
      bmi: 24.7,
      recorded_at: '2024-09-21T14:00:00Z',
      recorded_by: 'Nurse Sarah Davis',
      notes: 'Critical vitals - immediate attention required',
      status: 'critical'
    },
    {
      id: '4',
      patient_name: 'Lisa Wilson',
      patient_id: 'P-2025-089',
      temperature: 37.1,
      blood_pressure_systolic: 130,
      blood_pressure_diastolic: 85,
      heart_rate: 78,
      respiratory_rate: 20,
      oxygen_saturation: 97,
      weight: 70,
      height: 170,
      bmi: 24.2,
      recorded_at: '2024-09-21T16:00:00Z',
      recorded_by: 'Nurse Mike Brown',
      notes: 'Slightly elevated blood pressure',
      status: 'elevated'
    }
  ]

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setVitals(mockVitals)
      setLoading(false)
    }, 1000)
  }, [])

  const getSidebarItems = () => {
    return [
      { icon: <Activity className="h-4 w-4" />, label: "Vital Signs", href: "/vitals", active: true },
      { icon: <Users className="h-4 w-4" />, label: "Patient Care", href: "/patients" },
      { icon: <Clock className="h-4 w-4" />, label: "Schedules", href: "/schedules" },
      { icon: <Activity className="h-4 w-4" />, label: "Patient Records", href: "/records" },
    ]
  }

  const filteredVitals = vitals.filter(vital => {
    const searchLower = searchTerm.toLowerCase()
    return (
      vital.patient_name.toLowerCase().includes(searchLower) ||
      vital.patient_id.toLowerCase().includes(searchLower) ||
      vital.recorded_by.toLowerCase().includes(searchLower) ||
      vital.notes.toLowerCase().includes(searchLower)
    )
  })

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      normal: { variant: "default" as const, icon: CheckCircle, text: "Normal", color: "text-green-600" },
      elevated: { variant: "secondary" as const, icon: AlertTriangle, text: "Elevated", color: "text-yellow-600" },
      critical: { variant: "destructive" as const, icon: AlertTriangle, text: "Critical", color: "text-red-600" }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.normal
    const Icon = config.icon
    
    return (
      <Badge variant={config.variant} className="flex items-center space-x-1">
        <Icon className="h-3 w-3" />
        <span>{config.text}</span>
      </Badge>
    )
  }

  const getVitalTrend = (current: number, normal: { min: number, max: number }) => {
    if (current < normal.min) return <TrendingDown className="h-4 w-4 text-blue-500" />
    if (current > normal.max) return <TrendingUp className="h-4 w-4 text-red-500" />
    return <Minus className="h-4 w-4 text-green-500" />
  }

  const columns: Column<VitalSigns>[] = [
    {
      key: "patient",
      title: "Patient",
      sortable: true,
      render: (vital) => (
        <div>
          <div className="font-medium">{vital.patient_name}</div>
          <div className="text-sm text-muted-foreground">{vital.patient_id}</div>
        </div>
      )
    },
    {
      key: "temperature",
      title: "Temperature",
      sortable: true,
      render: (vital) => (
        <div className="flex items-center space-x-2">
          <Thermometer className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{vital.temperature}°C</span>
          {getVitalTrend(vital.temperature, { min: 36.1, max: 37.2 })}
        </div>
      )
    },
    {
      key: "blood_pressure",
      title: "Blood Pressure",
      sortable: true,
      render: (vital) => (
        <div className="flex items-center space-x-2">
          <Gauge className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{vital.blood_pressure_systolic}/{vital.blood_pressure_diastolic}</span>
          {getVitalTrend(vital.blood_pressure_systolic, { min: 90, max: 120 })}
        </div>
      )
    },
    {
      key: "heart_rate",
      title: "Heart Rate",
      sortable: true,
      render: (vital) => (
        <div className="flex items-center space-x-2">
          <Heart className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{vital.heart_rate} bpm</span>
          {getVitalTrend(vital.heart_rate, { min: 60, max: 100 })}
        </div>
      )
    },
    {
      key: "oxygen_saturation",
      title: "O2 Saturation",
      sortable: true,
      render: (vital) => (
        <div className="flex items-center space-x-2">
          <Activity className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{vital.oxygen_saturation}%</span>
          {getVitalTrend(vital.oxygen_saturation, { min: 95, max: 100 })}
        </div>
      )
    },
    {
      key: "status",
      title: "Status",
      render: (vital) => getStatusBadge(vital.status)
    },
    {
      key: "recorded_at",
      title: "Recorded",
      sortable: true,
      render: (vital) => (
        <div className="text-sm">
          {new Date(vital.recorded_at).toLocaleString()}
        </div>
      )
    },
    {
      key: "actions",
      title: "Actions",
      render: (vital) => (
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm">
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ]

  const getTabVitals = (tab: string) => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000)

    switch (tab) {
      case 'recent':
        return filteredVitals.filter(v => {
          const recordedDate = new Date(v.recorded_at)
          return recordedDate >= yesterday
        })
      case 'critical':
        return filteredVitals.filter(v => v.status === 'critical')
      case 'elevated':
        return filteredVitals.filter(v => v.status === 'elevated')
      default:
        return filteredVitals
    }
  }

  const getVitalStats = () => {
    const recentVitals = getTabVitals('recent')
    return {
      total: recentVitals.length,
      normal: recentVitals.filter(v => v.status === 'normal').length,
      elevated: recentVitals.filter(v => v.status === 'elevated').length,
      critical: recentVitals.filter(v => v.status === 'critical').length
    }
  }

  const vitalStats = getVitalStats()

  return (
    <DashboardLayout user={user} sidebarItems={getSidebarItems()}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-balance">Vital Signs Monitoring</h1>
            <p className="text-muted-foreground">
              Track and monitor patient vital signs and health metrics
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={() => setVitals(mockVitals)} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Record Vitals
            </Button>
          </div>
        </div>

        {/* Vital Signs Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Activity className="h-4 w-4 mr-2 text-blue-500" />
                Total Records
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{vitalStats.total}</div>
              <p className="text-xs text-muted-foreground">Recent recordings</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                Normal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{vitalStats.normal}</div>
              <p className="text-xs text-muted-foreground">Within normal range</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2 text-yellow-500" />
                Elevated
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{vitalStats.elevated}</div>
              <p className="text-xs text-muted-foreground">Above normal range</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2 text-red-500" />
                Critical
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{vitalStats.critical}</div>
              <p className="text-xs text-muted-foreground">Requires immediate attention</p>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search vitals by patient, nurse, or notes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Vitals Table */}
        <Card>
          <CardHeader>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="recent">Recent</TabsTrigger>
                <TabsTrigger value="critical">Critical</TabsTrigger>
                <TabsTrigger value="elevated">Elevated</TabsTrigger>
                <TabsTrigger value="all">All Vitals</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            <DataTable
              data={getTabVitals(activeTab)}
              columns={columns}
              loading={loading}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
