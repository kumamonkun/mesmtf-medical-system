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
  Pill,
  Search,
  Filter,
  Eye,
  Download,
  RefreshCw,
  Calendar,
  User,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle
} from "lucide-react"
import { toast } from "sonner"

interface Prescription {
  id: string
  treatment_id: string
  drug_id: string
  dosage: string
  frequency: string
  duration_days: number
  instructions: string
  quantity: number
  created_at: string
  updated_at: string
  drug_name?: string
  patient_name?: string
  doctor_name?: string
  status?: 'pending' | 'dispensed' | 'cancelled'
}

interface PrescriptionsViewProps {
  user: any
}

export function PrescriptionsView({ user }: PrescriptionsViewProps) {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  // Fetch prescriptions from API
  const fetchPrescriptions = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/prescriptions')
      if (response.ok) {
        const data = await response.json()
        setPrescriptions(data.prescriptions || [])
      } else {
        toast.error('Failed to fetch prescriptions')
      }
    } catch (error) {
      console.error('Error fetching prescriptions:', error)
      toast.error('Failed to fetch prescriptions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPrescriptions()
  }, [])

  const getSidebarItems = () => {
    if (user.role === "patient") {
      return [
        { icon: <Pill className="h-4 w-4" />, label: "My Prescriptions", href: "/prescriptions", active: true },
        { icon: <User className="h-4 w-4" />, label: "My Profile", href: "/profile" },
        { icon: <Calendar className="h-4 w-4" />, label: "Appointments", href: "/appointments" },
        { icon: <FileText className="h-4 w-4" />, label: "Medical Records", href: "/records" },
      ]
    }

    return [
      { icon: <Pill className="h-4 w-4" />, label: "Prescriptions", href: "/prescriptions", active: true },
      { icon: <User className="h-4 w-4" />, label: "Patients", href: "/patients" },
      { icon: <Calendar className="h-4 w-4" />, label: "Appointments", href: "/appointments" },
    ]
  }

  const filteredPrescriptions = prescriptions.filter(prescription => {
    const searchLower = searchTerm.toLowerCase()
    return (
      prescription.drug_name?.toLowerCase().includes(searchLower) ||
      prescription.patient_name?.toLowerCase().includes(searchLower) ||
      prescription.doctor_name?.toLowerCase().includes(searchLower) ||
      prescription.dosage.toLowerCase().includes(searchLower) ||
      prescription.instructions.toLowerCase().includes(searchLower)
    )
  })

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: "secondary" as const, icon: Clock, text: "Pending" },
      dispensed: { variant: "default" as const, icon: CheckCircle, text: "Dispensed" },
      cancelled: { variant: "destructive" as const, icon: XCircle, text: "Cancelled" }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    const Icon = config.icon
    
    return (
      <Badge variant={config.variant} className="flex items-center space-x-1">
        <Icon className="h-3 w-3" />
        <span>{config.text}</span>
      </Badge>
    )
  }

  const columns: Column<Prescription>[] = [
    {
      key: "prescription_id",
      title: "Prescription ID",
      sortable: true,
      render: (prescription) => (
        <span className="font-mono text-sm">#{prescription.id.slice(-8)}</span>
      )
    },
    {
      key: "patient",
      title: "Patient",
      sortable: true,
      render: (prescription) => (
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-4 w-4 text-primary" />
          </div>
          <div>
            <div className="font-medium">{prescription.patient_name || 'Unknown Patient'}</div>
            <div className="text-sm text-muted-foreground">ID: {prescription.treatment_id.slice(-8)}</div>
          </div>
        </div>
      )
    },
    {
      key: "drug",
      title: "Medication",
      sortable: true,
      render: (prescription) => (
        <div>
          <div className="font-medium">{prescription.drug_name || 'Unknown Drug'}</div>
          <div className="text-sm text-muted-foreground">
            {prescription.dosage} - {prescription.frequency}
          </div>
        </div>
      )
    },
    {
      key: "duration",
      title: "Duration",
      render: (prescription) => (
        <div>
          <div className="font-medium">{prescription.duration_days} days</div>
          <div className="text-sm text-muted-foreground">
            Qty: {prescription.quantity}
          </div>
        </div>
      )
    },
    {
      key: "status",
      title: "Status",
      render: (prescription) => getStatusBadge(prescription.status || 'pending')
    },
    {
      key: "created",
      title: "Created",
      sortable: true,
      render: (prescription) => (
        <div className="text-sm">
          {new Date(prescription.created_at).toLocaleDateString()}
        </div>
      )
    },
    {
      key: "actions",
      title: "Actions",
      render: (prescription) => (
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm">
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ]

  const getTabPrescriptions = (tab: string) => {
    switch (tab) {
      case 'pending':
        return filteredPrescriptions.filter(p => p.status === 'pending')
      case 'dispensed':
        return filteredPrescriptions.filter(p => p.status === 'dispensed')
      case 'cancelled':
        return filteredPrescriptions.filter(p => p.status === 'cancelled')
      default:
        return filteredPrescriptions
    }
  }

  return (
    <DashboardLayout user={user} sidebarItems={getSidebarItems()}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-balance">
              {user.role === 'patient' ? 'My Prescriptions' : 'Prescription Management'}
            </h1>
            <p className="text-muted-foreground">
              {user.role === 'patient' 
                ? 'View and manage your medication prescriptions'
                : 'Manage patient prescriptions and medication dispensing'
              }
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={fetchPrescriptions} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            {user.role !== 'patient' && (
              <Button>
                <Pill className="h-4 w-4 mr-2" />
                New Prescription
              </Button>
            )}
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Pill className="h-4 w-4 mr-2 text-blue-500" />
                Total Prescriptions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{prescriptions.length}</div>
              <p className="text-xs text-muted-foreground">All prescriptions</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Clock className="h-4 w-4 mr-2 text-orange-500" />
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {prescriptions.filter(p => p.status === 'pending').length}
              </div>
              <p className="text-xs text-muted-foreground">Awaiting dispensing</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                Dispensed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {prescriptions.filter(p => p.status === 'dispensed').length}
              </div>
              <p className="text-xs text-muted-foreground">Completed</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2 text-red-500" />
                Cancelled
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {prescriptions.filter(p => p.status === 'cancelled').length}
              </div>
              <p className="text-xs text-muted-foreground">Cancelled</p>
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
                  placeholder="Search prescriptions by drug, patient, or doctor..."
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

        {/* Prescriptions Table */}
        <Card>
          <CardHeader>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="all">All Prescriptions</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="dispensed">Dispensed</TabsTrigger>
                <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            <DataTable
              data={getTabPrescriptions(activeTab)}
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
