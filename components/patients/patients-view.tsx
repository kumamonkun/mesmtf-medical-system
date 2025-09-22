"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DataTable, type Column } from "@/components/common/data-table"
import { AddPatientDialog } from "./add-patient-dialog"
import { PatientDetailDialog } from "./patient-detail-dialog"
import {
  Users,
  Search,
  Plus,
  Filter,
  Calendar,
  Phone,
  MapPin,
  Activity,
  AlertCircle,
  Eye,
  Edit,
  Trash2,
  User,
  Download,
  RefreshCw
} from "lucide-react"
import { toast } from "sonner"

interface Patient {
  id: string
  patient_id: string
  first_name: string
  last_name: string
  date_of_birth: string
  gender: 'male' | 'female' | 'other'
  phone: string
  email: string
  address: string
  emergency_contact_name: string
  emergency_contact_phone: string
  medical_history: string
  allergies: string
  created_at: string
  updated_at: string
}

interface PatientsViewProps {
  user: any
}

export function PatientsView({ user }: PatientsViewProps) {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [showDetailDialog, setShowDetailDialog] = useState(false)

  // Fetch patients from API
  const fetchPatients = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/patients')
      if (response.ok) {
        const data = await response.json()
        setPatients(data.patients || [])
      } else {
        toast.error('Failed to fetch patients')
      }
    } catch (error) {
      console.error('Error fetching patients:', error)
      toast.error('Failed to fetch patients')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPatients()
  }, [])

  const getSidebarItems = () => {
    const baseItems = [
      { icon: <Users className="h-4 w-4" />, label: "Patients", href: "/patients", active: true },
    ]

    if (user.role === "patient") {
      return [
        { icon: <User className="h-4 w-4" />, label: "My Profile", href: "/profile" },
        { icon: <Users className="h-4 w-4" />, label: "My Records", href: "/patients", active: true },
        { icon: <Calendar className="h-4 w-4" />, label: "Appointments", href: "/appointments" },
      ]
    }

    return [
      ...baseItems,
      { icon: <Plus className="h-4 w-4" />, label: "Add Patient", href: "/add-patient" },
      { icon: <Search className="h-4 w-4" />, label: "Search Records", href: "/search" },
      { icon: <Activity className="h-4 w-4" />, label: "Reports", href: "/reports" },
    ]
  }

  const filteredPatients = patients.filter(patient => {
    if (!patient) return false
    const searchLower = searchTerm.toLowerCase()
    return (
      patient.first_name?.toLowerCase().includes(searchLower) ||
      patient.last_name?.toLowerCase().includes(searchLower) ||
      patient.patient_id?.toLowerCase().includes(searchLower) ||
      patient.email?.toLowerCase().includes(searchLower) ||
      patient.phone?.includes(searchTerm)
    )
  })

  const getStatusBadge = (patient: Patient) => {
    if (!patient) return <Badge variant="destructive">Unknown</Badge>
    // Simple status logic based on recent activity
    const lastUpdate = new Date(patient.updated_at || patient.created_at)
    const daysSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24)
    
    if (daysSinceUpdate < 7) {
      return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>
    } else if (daysSinceUpdate < 30) {
      return <Badge variant="secondary">Inactive</Badge>
    } else {
      return <Badge variant="destructive">Critical</Badge>
    }
  }

  const columns: Column<Patient>[] = [
    {
      key: "patient_id",
      title: "Patient ID",
      sortable: true,
      render: (patient) => (
        <span className="font-mono text-sm">{patient?.patient_id || 'N/A'}</span>
      )
    },
    {
      key: "name",
      title: "Name",
      sortable: true,
      render: (patient) => (
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-4 w-4 text-primary" />
          </div>
          <div>
            <div className="font-medium">{patient?.first_name || 'Unknown'} {patient?.last_name || 'Patient'}</div>
            <div className="text-sm text-muted-foreground">{patient?.gender || 'N/A'}</div>
          </div>
        </div>
      )
    },
    {
      key: "contact",
      title: "Contact",
      render: (patient) => (
        <div className="space-y-1">
          <div className="flex items-center space-x-1 text-sm">
            <Phone className="h-3 w-3" />
            <span>{patient?.phone || 'N/A'}</span>
          </div>
          <div className="text-sm text-muted-foreground">{patient?.email || 'N/A'}</div>
        </div>
      )
    },
    {
      key: "age",
      title: "Age",
      sortable: true,
      render: (patient) => {
        if (!patient?.date_of_birth) return <span>N/A</span>
        const birthDate = new Date(patient.date_of_birth)
        const age = Math.floor((Date.now() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25))
        return <span>{age} years</span>
      }
    },
    {
      key: "status",
      title: "Status",
      render: (patient) => getStatusBadge(patient)
    },
    {
      key: "actions",
      title: "Actions",
      render: (patient) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedPatient(patient)
              setShowDetailDialog(true)
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ]

  const handlePatientAdded = () => {
    fetchPatients()
    setShowAddDialog(false)
    toast.success('Patient added successfully')
  }

  return (
    <DashboardLayout user={user} sidebarItems={getSidebarItems()}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-balance">Patient Management</h1>
            <p className="text-muted-foreground">
              Manage patient records and medical information
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={fetchPatients} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Patient
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Users className="h-4 w-4 mr-2 text-blue-500" />
                Total Patients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{patients.length}</div>
              <p className="text-xs text-muted-foreground">Registered patients</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Activity className="h-4 w-4 mr-2 text-green-500" />
                Active Patients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {patients.filter(p => {
                  const lastUpdate = new Date(p.updated_at)
                  const daysSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24)
                  return daysSinceUpdate < 7
                }).length}
              </div>
              <p className="text-xs text-muted-foreground">Recent activity</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <AlertCircle className="h-4 w-4 mr-2 text-orange-500" />
                Critical Cases
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {patients.filter(p => {
                  const lastUpdate = new Date(p.updated_at)
                  const daysSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24)
                  return daysSinceUpdate > 30
                }).length}
              </div>
              <p className="text-xs text-muted-foreground">Need attention</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-purple-500" />
                New This Month
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {patients.filter(p => {
                  const created = new Date(p.created_at)
                  const monthAgo = new Date()
                  monthAgo.setMonth(monthAgo.getMonth() - 1)
                  return created > monthAgo
                }).length}
              </div>
              <p className="text-xs text-muted-foreground">Recent registrations</p>
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
                  placeholder="Search patients by name, ID, email, or phone..."
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

        {/* Patients Table */}
        <Card>
          <CardHeader>
            <CardTitle>Patient Records</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              data={filteredPatients}
              columns={columns}
              loading={loading}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
            />
          </CardContent>
        </Card>

        {/* Dialogs */}
        <AddPatientDialog
          open={showAddDialog}
          onOpenChange={setShowAddDialog}
          onPatientAdded={handlePatientAdded}
        />

        {selectedPatient && (
          <PatientDetailDialog
            patient={selectedPatient}
            open={showDetailDialog}
            onOpenChange={setShowDetailDialog}
          />
        )}
      </div>
    </DashboardLayout>
  )
}
