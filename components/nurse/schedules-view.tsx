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
  Calendar,
  Clock,
  Users,
  Stethoscope,
  Search,
  Filter,
  Plus,
  Edit,
  Eye,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Download,
  Activity
} from "lucide-react"
import { toast } from "sonner"

interface ScheduleItem {
  id: string
  patient_name: string
  patient_id: string
  appointment_time: string
  duration: number
  type: 'checkup' | 'follow_up' | 'emergency' | 'routine'
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled'
  notes: string
  room: string
  assigned_nurse: string
}

interface SchedulesViewProps {
  user: any
}

export function SchedulesView({ user }: SchedulesViewProps) {
  const [schedules, setSchedules] = useState<ScheduleItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("today")

  // Mock schedule data
  const mockSchedules: ScheduleItem[] = [
    {
      id: '1',
      patient_name: 'John Doe',
      patient_id: 'P-2025-001',
      appointment_time: '2024-09-21T09:00:00Z',
      duration: 30,
      type: 'checkup',
      status: 'scheduled',
      notes: 'Regular checkup for malaria treatment follow-up',
      room: 'Room 101',
      assigned_nurse: 'Nurse Mary Smith'
    },
    {
      id: '2',
      patient_name: 'Jane Smith',
      patient_id: 'P-2025-015',
      appointment_time: '2024-09-21T10:30:00Z',
      duration: 45,
      type: 'follow_up',
      status: 'in_progress',
      notes: 'Post-treatment follow-up for typhoid',
      room: 'Room 102',
      assigned_nurse: 'Nurse John Wilson'
    },
    {
      id: '3',
      patient_name: 'Robert Johnson',
      patient_id: 'P-2025-032',
      appointment_time: '2024-09-21T14:00:00Z',
      duration: 60,
      type: 'emergency',
      status: 'scheduled',
      notes: 'Emergency consultation for severe symptoms',
      room: 'Emergency Room',
      assigned_nurse: 'Nurse Sarah Davis'
    },
    {
      id: '4',
      patient_name: 'Lisa Wilson',
      patient_id: 'P-2025-089',
      appointment_time: '2024-09-21T16:00:00Z',
      duration: 30,
      type: 'routine',
      status: 'completed',
      notes: 'Routine blood pressure check',
      room: 'Room 103',
      assigned_nurse: 'Nurse Mike Brown'
    }
  ]

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setSchedules(mockSchedules)
      setLoading(false)
    }, 1000)
  }, [])

  const getSidebarItems = () => {
    return [
      { icon: <Calendar className="h-4 w-4" />, label: "Schedules", href: "/schedules", active: true },
      { icon: <Users className="h-4 w-4" />, label: "Patient Care", href: "/patients" },
      { icon: <Stethoscope className="h-4 w-4" />, label: "Vital Signs", href: "/vitals" },
      { icon: <Activity className="h-4 w-4" />, label: "Patient Records", href: "/records" },
    ]
  }

  const filteredSchedules = schedules.filter(schedule => {
    const searchLower = searchTerm.toLowerCase()
    return (
      schedule.patient_name.toLowerCase().includes(searchLower) ||
      schedule.patient_id.toLowerCase().includes(searchLower) ||
      schedule.room.toLowerCase().includes(searchLower) ||
      schedule.assigned_nurse.toLowerCase().includes(searchLower) ||
      schedule.notes.toLowerCase().includes(searchLower)
    )
  })

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      scheduled: { variant: "secondary" as const, icon: Clock, text: "Scheduled" },
      in_progress: { variant: "default" as const, icon: Activity, text: "In Progress" },
      completed: { variant: "default" as const, icon: CheckCircle, text: "Completed" },
      cancelled: { variant: "destructive" as const, icon: XCircle, text: "Cancelled" }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.scheduled
    const Icon = config.icon
    
    return (
      <Badge variant={config.variant} className="flex items-center space-x-1">
        <Icon className="h-3 w-3" />
        <span>{config.text}</span>
      </Badge>
    )
  }

  const getTypeBadge = (type: string) => {
    const typeColors = {
      checkup: "bg-blue-100 text-blue-800",
      follow_up: "bg-green-100 text-green-800",
      emergency: "bg-red-100 text-red-800",
      routine: "bg-gray-100 text-gray-800"
    }
    
    return (
      <Badge className={typeColors[type as keyof typeof typeColors] || "bg-gray-100 text-gray-800"}>
        {type.replace('_', ' ').toUpperCase()}
      </Badge>
    )
  }

  const columns: Column<ScheduleItem>[] = [
    {
      key: "patient",
      title: "Patient",
      sortable: true,
      render: (schedule) => (
        <div>
          <div className="font-medium">{schedule.patient_name}</div>
          <div className="text-sm text-muted-foreground">{schedule.patient_id}</div>
        </div>
      )
    },
    {
      key: "time",
      title: "Time",
      sortable: true,
      render: (schedule) => (
        <div>
          <div className="font-medium">
            {new Date(schedule.appointment_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
          <div className="text-sm text-muted-foreground">
            {schedule.duration} min
          </div>
        </div>
      )
    },
    {
      key: "type",
      title: "Type",
      render: (schedule) => getTypeBadge(schedule.type)
    },
    {
      key: "room",
      title: "Room",
      render: (schedule) => (
        <div className="font-medium">{schedule.room}</div>
      )
    },
    {
      key: "nurse",
      title: "Assigned Nurse",
      render: (schedule) => (
        <div className="text-sm">{schedule.assigned_nurse}</div>
      )
    },
    {
      key: "status",
      title: "Status",
      render: (schedule) => getStatusBadge(schedule.status)
    },
    {
      key: "actions",
      title: "Actions",
      render: (schedule) => (
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

  const getTabSchedules = (tab: string) => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)
    const nextWeek = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)

    switch (tab) {
      case 'today':
        return filteredSchedules.filter(s => {
          const scheduleDate = new Date(s.appointment_time)
          return scheduleDate >= today && scheduleDate < tomorrow
        })
      case 'tomorrow':
        return filteredSchedules.filter(s => {
          const scheduleDate = new Date(s.appointment_time)
          return scheduleDate >= tomorrow && scheduleDate < new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000)
        })
      case 'week':
        return filteredSchedules.filter(s => {
          const scheduleDate = new Date(s.appointment_time)
          return scheduleDate >= today && scheduleDate < nextWeek
        })
      default:
        return filteredSchedules
    }
  }

  const getTodayStats = () => {
    const todaySchedules = getTabSchedules('today')
    return {
      total: todaySchedules.length,
      completed: todaySchedules.filter(s => s.status === 'completed').length,
      inProgress: todaySchedules.filter(s => s.status === 'in_progress').length,
      scheduled: todaySchedules.filter(s => s.status === 'scheduled').length
    }
  }

  const todayStats = getTodayStats()

  return (
    <DashboardLayout user={user} sidebarItems={getSidebarItems()}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-balance">Nurse Schedules</h1>
            <p className="text-muted-foreground">
              Manage patient schedules and care assignments
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={() => setSchedules(mockSchedules)} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Schedule
            </Button>
          </div>
        </div>

        {/* Today's Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                Today's Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayStats.total}</div>
              <p className="text-xs text-muted-foreground">Scheduled appointments</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayStats.completed}</div>
              <p className="text-xs text-muted-foreground">Finished today</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Activity className="h-4 w-4 mr-2 text-orange-500" />
                In Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayStats.inProgress}</div>
              <p className="text-xs text-muted-foreground">Currently active</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Clock className="h-4 w-4 mr-2 text-purple-500" />
                Scheduled
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{todayStats.scheduled}</div>
              <p className="text-xs text-muted-foreground">Upcoming</p>
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
                  placeholder="Search schedules by patient, room, or nurse..."
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

        {/* Schedules Table */}
        <Card>
          <CardHeader>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="today">Today</TabsTrigger>
                <TabsTrigger value="tomorrow">Tomorrow</TabsTrigger>
                <TabsTrigger value="week">This Week</TabsTrigger>
                <TabsTrigger value="all">All Schedules</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            <DataTable
              data={getTabSchedules(activeTab)}
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
