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
  Package,
  Search,
  Plus,
  Edit,
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  Download,
  Upload,
  TrendingUp,
  TrendingDown,
  Minus,
  Filter,
  Calendar,
  DollarSign
} from "lucide-react"
import { toast } from "sonner"

interface Drug {
  id: string
  name: string
  generic_name?: string
  dosage_form?: string
  strength?: string
  manufacturer?: string
  description?: string
  contraindications?: string
  side_effects?: string
  is_prescription_required?: boolean
  created_at: string
  updated_at: string
}

interface InventoryViewProps {
  user: any
}

export function InventoryView({ user }: InventoryViewProps) {
  const [drugs, setDrugs] = useState<Drug[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")

  // Fetch drugs from API
  const fetchDrugs = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/drugs')
      if (response.ok) {
        const data = await response.json()
        setDrugs(data.drugs || [])
      } else {
        toast.error('Failed to fetch drug inventory')
      }
    } catch (error) {
      console.error('Error fetching drugs:', error)
      toast.error('Failed to fetch drug inventory')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDrugs()
  }, [])

  const getSidebarItems = () => {
    return [
      { icon: <Package className="h-4 w-4" />, label: "Drug Inventory", href: "/inventory", active: true },
      { icon: <Package className="h-4 w-4" />, label: "Prescriptions", href: "/prescriptions" },
      { icon: <Package className="h-4 w-4" />, label: "Drug Dispensing", href: "/dispensing" },
      { icon: <Package className="h-4 w-4" />, label: "Reports", href: "/reports" },
    ]
  }

  const filteredDrugs = drugs.filter(drug => {
    const searchLower = searchTerm.toLowerCase()
    return (
      drug.name.toLowerCase().includes(searchLower) ||
      drug.generic_name?.toLowerCase().includes(searchLower) ||
      drug.manufacturer?.toLowerCase().includes(searchLower) ||
      drug.dosage_form?.toLowerCase().includes(searchLower) ||
      drug.strength?.toLowerCase().includes(searchLower)
    )
  })

  const getPrescriptionBadge = (isRequired?: boolean) => {
    const requiresPrescription = isRequired ?? true // Default to true if undefined
    return (
      <Badge variant={requiresPrescription ? "destructive" : "default"} className="flex items-center space-x-1">
        {requiresPrescription ? <AlertTriangle className="h-3 w-3" /> : <CheckCircle className="h-3 w-3" />}
        <span>{requiresPrescription ? 'Prescription Required' : 'Over-the-Counter'}</span>
      </Badge>
    )
  }

  const getDrugStatus = (drug: Drug) => {
    // Mock status based on drug properties
    if (drug.contraindications && drug.contraindications.length > 50) {
      return { status: 'restricted', color: 'text-red-600', bg: 'bg-red-100' }
    }
    if (drug.side_effects && drug.side_effects.length > 30) {
      return { status: 'caution', color: 'text-yellow-600', bg: 'bg-yellow-100' }
    }
    return { status: 'normal', color: 'text-green-600', bg: 'bg-green-100' }
  }

  const columns: Column<Drug>[] = [
    {
      key: "name",
      title: "Drug Name",
      sortable: true,
      render: (drug) => (
        <div>
          <div className="font-medium">{drug?.name || 'Unknown Drug'}</div>
          {drug?.generic_name && (
            <div className="text-sm text-muted-foreground">{drug.generic_name}</div>
          )}
        </div>
      )
    },
    {
      key: "dosage",
      title: "Dosage Form",
      sortable: true,
      render: (drug) => (
        <div>
          <div className="font-medium">{drug?.dosage_form || 'N/A'}</div>
          {drug?.strength && (
            <div className="text-sm text-muted-foreground">{drug.strength}</div>
          )}
        </div>
      )
    },
    {
      key: "manufacturer",
      title: "Manufacturer",
      sortable: true,
      render: (drug) => (
        <div className="text-sm">{drug?.manufacturer || 'Unknown'}</div>
      )
    },
    {
      key: "prescription",
      title: "Prescription",
      render: (drug) => getPrescriptionBadge(drug?.is_prescription_required)
    },
    {
      key: "status",
      title: "Status",
      render: (drug) => {
        if (!drug) return <Badge>Unknown</Badge>
        const status = getDrugStatus(drug)
        return (
          <Badge className={status.bg}>
            <span className={status.color}>{status.status.toUpperCase()}</span>
          </Badge>
        )
      }
    },
    {
      key: "created",
      title: "Added",
      sortable: true,
      render: (drug) => (
        <div className="text-sm">
          {drug?.created_at ? new Date(drug.created_at).toLocaleDateString() : 'N/A'}
        </div>
      )
    },
    {
      key: "actions",
      title: "Actions",
      render: (drug) => (
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

  const getTabDrugs = (tab: string) => {
    switch (tab) {
      case 'prescription':
        return filteredDrugs.filter(d => d.is_prescription_required === true)
      case 'otc':
        return filteredDrugs.filter(d => d.is_prescription_required === false)
      case 'restricted':
        return filteredDrugs.filter(d => getDrugStatus(d).status === 'restricted')
      default:
        return filteredDrugs
    }
  }

  const getInventoryStats = () => {
    return {
      total: drugs.length,
      prescription: drugs.filter(d => d.is_prescription_required === true).length,
      otc: drugs.filter(d => d.is_prescription_required === false).length,
      restricted: drugs.filter(d => getDrugStatus(d).status === 'restricted').length
    }
  }

  const inventoryStats = getInventoryStats()

  const exportInventory = async () => {
    try {
      toast.info('Exporting inventory data...')
      // Simulate export
      await new Promise(resolve => setTimeout(resolve, 2000))
      toast.success('Inventory data exported successfully')
    } catch (error) {
      toast.error('Failed to export inventory data')
    }
  }

  return (
    <DashboardLayout user={user} sidebarItems={getSidebarItems()}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-balance">Drug Inventory Management</h1>
            <p className="text-muted-foreground">
              Manage pharmaceutical inventory and drug information
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={fetchDrugs} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" onClick={exportInventory}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Drug
            </Button>
          </div>
        </div>

        {/* Inventory Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <Package className="h-4 w-4 mr-2 text-blue-500" />
                Total Drugs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inventoryStats.total}</div>
              <p className="text-xs text-muted-foreground">In inventory</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2 text-red-500" />
                Prescription Drugs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inventoryStats.prescription}</div>
              <p className="text-xs text-muted-foreground">Require prescription</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                Over-the-Counter
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inventoryStats.otc}</div>
              <p className="text-xs text-muted-foreground">Available OTC</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center">
                <AlertTriangle className="h-4 w-4 mr-2 text-yellow-500" />
                Restricted
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inventoryStats.restricted}</div>
              <p className="text-xs text-muted-foreground">Restricted access</p>
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
                  placeholder="Search drugs by name, manufacturer, or dosage..."
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

        {/* Inventory Table */}
        <Card>
          <CardHeader>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="all">All Drugs</TabsTrigger>
                <TabsTrigger value="prescription">Prescription</TabsTrigger>
                <TabsTrigger value="otc">Over-the-Counter</TabsTrigger>
                <TabsTrigger value="restricted">Restricted</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            <DataTable
              data={getTabDrugs(activeTab)}
              columns={columns}
              loading={loading}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
            />
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full justify-start" variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Add New Drug
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Import Inventory
              </Button>
              <Button className="w-full justify-start" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export Inventory
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Inventory Alerts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center space-x-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>All drugs in stock</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span>No expiring drugs</span>
                </div>
                <div className="flex items-center space-x-2 text-sm">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  <span>2 drugs need restocking</span>
                </div>
              </div>
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
                  <span className="text-muted-foreground">Added</span>
                </div>
                <div className="flex justify-between">
                  <span>Ciprofloxacin</span>
                  <span className="text-muted-foreground">Updated</span>
                </div>
                <div className="flex justify-between">
                  <span>Paracetamol</span>
                  <span className="text-muted-foreground">Stocked</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
