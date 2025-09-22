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
  ShoppingCart,
  Search,
  Plus,
  Edit,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Package,
  User,
  Calendar,
  Filter,
  Pill,
  Activity
} from "lucide-react"
import { toast } from "sonner"

interface DispensingRecord {
  id: string
  prescription_id: string
  patient_name: string
  patient_id: string
  drug_name: string
  dosage: string
  quantity: number
  dispensed_quantity: number
  dispensed_at: string
  dispensed_by: string
  status: 'pending' | 'dispensed' | 'cancelled' | 'partial'
  notes: string
  total_cost: number
}

interface DispensingViewProps {
  user: any
}

export function DispensingView({ user }: DispensingViewProps) {
  const [dispensingRecords, setDispensingRecords] = useState<DispensingRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("pending")

  // Mock dispensing data
  const mockDispensingRecords: DispensingRecord[] = [
    {
      id: '1',
      prescription_id: 'RX001',
      patient_name: 'John Doe',
      patient_id: 'P-2025-001',
      drug_name: 'Artemether-Lumefantrine',
      dosage: '20mg/120mg',
      quantity: 30,
      dispensed_quantity: 30,
      dispensed_at: '2024-09-21T09:00:00Z',
      dispensed_by: 'Pharmacist Sarah Johnson',
      status: 'dispensed',
      notes: 'Full prescription dispensed',
      total_cost: 25.50
    },
    {
      id: '2',
      prescription_id: 'RX002',
      patient_name: 'Jane Smith',
      patient_id: 'P-2025-015',
      drug_name: 'Ciprofloxacin',
      dosage: '500mg',
      quantity: 20,
      dispensed_quantity: 15,
      dispensed_at: '2024-09-21T10:30:00Z',
      dispensed_by: 'Pharmacist Mike Wilson',
      status: 'partial',
      notes: 'Partial dispense - restocking needed',
      total_cost: 15.75
    },
    {
      id: '3',
      prescription_id: 'RX003',
      patient_name: 'Robert Johnson',
      patient_id: 'P-2025-032',
      drug_name: 'Paracetamol',
      dosage: '500mg',
      quantity: 50,
      dispensed_quantity: 0,
      dispensed_at: '',
      dispensed_by: '',
      status: 'pending',
      notes: 'Awaiting patient pickup',
      total_cost: 5.25
    },
    {
      id: '4',
      prescription_id: 'RX004',
      patient_name: 'Lisa Wilson',
      patient_id: 'P-2025-089',
      drug_name: 'Azithromycin',
      dosage: '250mg',
      quantity: 10,
      dispensed_quantity: 0,
      dispensed_at: '',
      dispensed_by: '',
      status: 'cancelled',
      notes: 'Prescription cancelled by doctor',
      total_cost: 35.00
    }
  ]

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setDispensingRecords(mockDispensingRecords)
      setLoading(false)
    }, 1000)
  }, [])

  const getSidebarItems = () => {
    return [
      { icon: <ShoppingCart className="h-4 w-4" />, label: "Drug Dispensing", href: "/dispensing", active: true },
      { icon: <Package className="h-4 w-4" />, label: "Drug Inventory", href: "/inventory" },
      { icon: <Package className="h-4 w-4" />, label: "Prescriptions", href: "/prescriptions" },
      { icon: <Package className="h-4 w-4" />, label: "Reports", href: "/reports" },
    ]
  }

  const filteredRecords = dispensingRecords.filter(record => {
    const searchLower = searchTerm.toLowerCase()
    return (
      record.patient_name.toLowerCase().includes(searchLower) ||
      record.patient_id.toLowerCase().includes(searchLower) ||
      record.drug_name.toLowerCase().includes(searchLower) ||
      record.prescription_id.toLowerCase().includes(searchLower) ||
      record.dispensed_by.toLowerCase().includes(searchLower)
    )
  })

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: "secondary" as const, icon: Clock, text: "Pending", color: "text-yellow-600" },
      dispensed: { variant: "default" as const, icon: CheckCircle, text: "Dispensed", color: "text-green-600" },
      cancelled: { variant: "destructive" as const, icon: XCircle, text: "Cancelled", color: "text-red-600" },
      partial: { variant: "secondary" as const, icon: AlertTriangle, text: "Partial", color: "text-orange-600" }
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

  const columns: Column<DispensingRecord>[] = [
    {
      key: "prescription",
      title: "Prescription",
      sortable: true,
      render: (record) => (
        <div>
          <div className="font-medium">{record?.prescription_id || 'N/A'}</div>
          <div className="text-sm text-muted-foreground">{record?.drug_name || 'Unknown Drug'}</div>
        </div>
      )
    },
    {
      key: "patient",
      title: "Patient",
      sortable: true,
      render: (record) => (
        <div>
          <div className="font-medium">{record?.patient_name || 'Unknown Patient'}</div>
          <div className="text-sm text-muted-foreground">{record?.patient_id || 'N/A'}</div>
        </div>
      )
    },
    {
      key: "medication",
      title: "Medication",
      render: (record) => (
        <div>
          <div className="font-medium">{record?.drug_name || 'Unknown Drug'}</div>
          <div className="text-sm text-muted-foreground">{record?.dosage || 'N/A'}</div>
        </div>
      )
    },
    {
      key: "quantity",
      title: "Quantity",
      render: (record) => (
        <div>
          <div className="font-medium">
            {record?.dispensed_quantity || 0} / {record?.quantity || 0}
          </div>
          <div className="text-sm text-muted-foreground">
            {record?.status === 'partial' ? 'Partial dispense' : 'Full dispense'}
          </div>
        </div>
      )
    },
    {
      key: "cost",
      title: "Cost",
      sortable: true,
      render: (record) => (
        <div className="font-medium">${record?.total_cost ? record.total_cost.toFixed(2) : '0.00'}</div>
      )
    },
    {
      key: "status",
      title: "Status",
      render: (record) => getStatusBadge(record?.status)
    },
    {
      key: "dispensed_at",
      title: "Dispensed",
      sortable: true,
      render: (record) => (
        <div className="text-sm">
          {record?.dispensed_at ? new Date(record.dispensed_at).toLocaleString() : 'Not dispensed'}
        </div>
      )
    },
    {
      key: "actions",
      title: "Actions",
      render: (record) => (
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm">
            <Eye className="h-4 w-4" />
          </Button>
          {record?.status === 'pending' && (
            <Button variant="ghost" size="sm">
              <CheckCircle className="h-4 w-4" />
            </Button>
          )}
        </div>
      )
    }
  ]

  const getTabRecords = (tab: string) => {
    switch (tab) {
      case 'pending':
        return filteredRecords.filter(r => r.status === 'pending')
      case 'dispensed':
        return filteredRecords.filter(r => r.status === 'dispensed')
      case 'partial':
        return filteredRecords.filter(r => r.status === 'partial')
      case 'cancelled':
        return filteredRecords.filter(r => r.status === 'cancelled')
      default:
        return filteredRecords
    }
  }

  const getDispensingStats = () => {
    return {
      total: dispensingRecords.length,
      pending: dispensingRecords.filter(r => r.status === 'pending').length,
      dispensed: dispensingRecords.filter(r => r.status === 'dispensed').length,
      partial: dispensingRecords.filter(r => r.status === 'partial').length,
      cancelled: dispensingRecords.filter(r => r.status === 'cancelled').length,
      totalRevenue: dispensingRecords
        .filter(r => r.status === 'dispensed' || r.status === 'partial')
        .reduce((sum, r) => sum + r.total_cost, 0)
    }
  }

  const dispensingStats = getDispensingStats()

  const handleDispense = (recordId: string) => {
    setDispensingRecords(prev => 
      prev.map(record => 
        record.id === recordId 
          ? { 
              ...record, 
              status: 'dispensed' as const,
              dispensed_quantity: record.quantity,
              dispensed_at: new Date().toISOString(),
              dispensed_by: user.username
            }
          : record
      )
    )
    toast.success('Prescription dispensed successfully')
  }

  return (
    <DashboardLayout user={user} sidebarItems={getSidebarItems()}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-balance">Drug Dispensing</h1>
            <p className="text-muted-foreground">
              Manage prescription dispensing and medication distribution
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={() => setDispensingRecords(mockDispensingRecords)} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Dispense
            </Button>
          </div>
        </div>

        {/* Dispensing Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <ShoppingCart className="h-4 w-4 mr-2 text-blue-500" />
                Total Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dispensingStats.total}</div>
              <p className="text-xs text-muted-foreground">All prescriptions</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Clock className="h-4 w-4 mr-2 text-yellow-500" />
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dispensingStats.pending}</div>
              <p className="text-xs text-muted-foreground">Awaiting dispense</p>
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
              <div className="text-2xl font-bold">{dispensingStats.dispensed}</div>
              <p className="text-xs text-muted-foreground">Completed</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2 text-orange-500" />
                Partial
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dispensingStats.partial}</div>
              <p className="text-xs text-muted-foreground">Partial dispense</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Package className="h-4 w-4 mr-2 text-purple-500" />
                Revenue
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${dispensingStats.totalRevenue.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">Total revenue</p>
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
                  placeholder="Search dispensing records..."
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

        {/* Dispensing Table */}
        <Card>
          <CardHeader>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="dispensed">Dispensed</TabsTrigger>
                <TabsTrigger value="partial">Partial</TabsTrigger>
                <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
                <TabsTrigger value="all">All Records</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            <DataTable
              data={getTabRecords(activeTab)}
              columns={columns}
              loading={loading}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
            />
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full justify-start" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Process New Prescription
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Package className="h-4 w-4 mr-2" />
                Check Inventory
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Activity className="h-4 w-4 mr-2" />
                View Reports
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Artemether-Lumefantrine</span>
                  <span className="text-green-600">Dispensed</span>
                </div>
                <div className="flex justify-between">
                  <span>Ciprofloxacin</span>
                  <span className="text-orange-600">Partial</span>
                </div>
                <div className="flex justify-between">
                  <span>Paracetamol</span>
                  <span className="text-yellow-600">Pending</span>
                </div>
                <div className="flex justify-between">
                  <span>Azithromycin</span>
                  <span className="text-red-600">Cancelled</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
