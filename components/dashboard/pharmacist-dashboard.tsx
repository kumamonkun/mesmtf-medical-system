"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "./dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Pill, Package, FileText, AlertTriangle, Clock, TrendingUp, ShoppingCart, RefreshCw } from "lucide-react"
import { toast } from "sonner"

interface User {
  username: string
  role: string
  loginTime: string
}

interface PharmacistStats {
  totalPrescriptions: number
  activePrescriptions: number
  completedPrescriptions: number
  totalDrugs: number
  prescriptionDrugs: number
  otcDrugs: number
  lowStockDrugs: number
  todayDispensed: number
  drugInteractions: number
}

interface Prescription {
  id: string
  drug?: {
    name: string
    generic_name?: string
    dosage_form?: string
  }
  dosage: string
  frequency: string
  quantity: number
  treatment?: {
    treatment_plan: string
    status: string
  }
  created_at: string
}

interface Drug {
  id: string
  name: string
  generic_name?: string
  dosage_form?: string
  strength?: string
  manufacturer?: string
  is_prescription_required?: boolean
  created_at: string
}

interface PharmacistDashboardProps {
  user: User
}

export function PharmacistDashboard({ user }: PharmacistDashboardProps) {
  const [stats, setStats] = useState<PharmacistStats | null>(null)
  const [recentPrescriptions, setRecentPrescriptions] = useState<Prescription[]>([])
  const [lowStockDrugs, setLowStockDrugs] = useState<Drug[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch pharmacist dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch prescriptions
      const prescriptionsResponse = await fetch('/api/prescriptions')
      const prescriptionsData = await prescriptionsResponse.json()
      const prescriptions = prescriptionsData.prescriptions || []

      // Fetch drugs
      const drugsResponse = await fetch('/api/drugs')
      const drugsData = await drugsResponse.json()
      const drugs = drugsData.drugs || []

      // Calculate stats
      const activePrescriptions = prescriptions.filter(p => p.treatment?.status === 'active').length
      const completedPrescriptions = prescriptions.filter(p => p.treatment?.status === 'completed').length
      const prescriptionDrugs = drugs.filter(d => d.is_prescription_required === true).length
      const otcDrugs = drugs.filter(d => d.is_prescription_required === false).length

      // Mock low stock calculation (in real system, this would be based on actual stock levels)
      const lowStockDrugs = drugs.slice(0, 3) // Mock: first 3 drugs as low stock

      // Mock drug interactions count (in real system, this would check actual interactions)
      const drugInteractions = Math.floor(Math.random() * 5) // Mock: 0-4 interactions

      const dashboardStats: PharmacistStats = {
        totalPrescriptions: prescriptions.length,
        activePrescriptions,
        completedPrescriptions,
        totalDrugs: drugs.length,
        prescriptionDrugs,
        otcDrugs,
        lowStockDrugs: lowStockDrugs.length,
        todayDispensed: Math.floor(Math.random() * 20) + 10, // Mock data
        drugInteractions
      }

      setStats(dashboardStats)
      setRecentPrescriptions(prescriptions.slice(0, 3)) // Show 3 most recent
      setLowStockDrugs(lowStockDrugs)

    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
      toast.error('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])
  const sidebarItems = [
    { icon: <Pill className="h-4 w-4" />, label: "Prescriptions", href: "/prescriptions", active: true },
    { icon: <Package className="h-4 w-4" />, label: "Inventory", href: "/inventory" },
    { icon: <ShoppingCart className="h-4 w-4" />, label: "Drug Dispensing", href: "/dispensing" },
    { icon: <FileText className="h-4 w-4" />, label: "Reports", href: "/reports" },
    { icon: <AlertTriangle className="h-4 w-4" />, label: "Drug Interactions", href: "/pharmacy?tab=interactions" },
  ]

  if (loading) {
    return (
      <DashboardLayout user={user} sidebarItems={sidebarItems}>
        <div className="flex items-center justify-center p-8">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span>Loading dashboard...</span>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout user={user} sidebarItems={sidebarItems}>
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-destructive">Error Loading Dashboard</h3>
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={fetchDashboardData} className="mt-4">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry
            </Button>
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
            <h1 className="text-3xl font-bold text-balance">Pharmacy Dashboard</h1>
            <p className="text-muted-foreground">Welcome, Pharmacist {user.username}</p>
          </div>
          <Button onClick={fetchDashboardData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Prescriptions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.activePrescriptions || 0}</div>
              <p className="text-xs text-muted-foreground">Awaiting fulfillment</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">{stats?.lowStockDrugs || 0}</div>
              <p className="text-xs text-muted-foreground">Need reordering</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Drugs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalDrugs || 0}</div>
              <div className="flex items-center text-xs text-green-600">
                <TrendingUp className="h-3 w-3 mr-1" />
                {stats?.prescriptionDrugs || 0} prescription, {stats?.otcDrugs || 0} OTC
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Drug Interactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{stats?.drugInteractions || 0}</div>
              <p className="text-xs text-muted-foreground">Require review</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Prescriptions & Inventory Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Recent Prescriptions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {recentPrescriptions.length > 0 ? (
                recentPrescriptions.map((prescription, index) => (
                  <div key={prescription.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Prescription #{prescription.id.slice(-8)}</p>
                      <p className="text-sm text-muted-foreground">
                        {prescription.drug?.name || 'Unknown Drug'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {prescription.dosage} - {prescription.frequency}
                      </p>
                    </div>
                    <Badge variant={prescription.treatment?.status === 'active' ? 'default' : 'outline'}>
                      {prescription.treatment?.status || 'Unknown'}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No recent prescriptions found
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-amber-500" />
                Low Stock Alerts
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {lowStockDrugs.length > 0 ? (
                lowStockDrugs.map((drug, index) => (
                  <div key={drug.id} className={`p-3 border rounded-lg ${
                    index === 0 ? 'border-destructive/20 bg-destructive/5' : 'border-amber-200 bg-amber-50'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <p className={`font-medium ${
                          index === 0 ? 'text-destructive' : 'text-amber-700'
                        }`}>
                          {drug.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {drug.dosage_form || 'Unknown form'} - {drug.strength || 'Unknown strength'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Stock: {Math.floor(Math.random() * 10) + 1} units remaining
                        </p>
                      </div>
                      <Badge variant={index === 0 ? 'destructive' : 'outline'}>
                        {index === 0 ? 'Critical' : 'Low'}
                      </Badge>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No low stock alerts
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
                <Pill className="h-5 w-5 mr-2 text-primary" />
                Dispense Medication
              </CardTitle>
              <CardDescription>Process prescription fulfillment</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">Dispense Now</Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Package className="h-5 w-5 mr-2 text-primary" />
                Manage Inventory
              </CardTitle>
              <CardDescription>Update stock levels and orders</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full bg-transparent">
                View Inventory
              </Button>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-primary" />
                Check Interactions
              </CardTitle>
              <CardDescription>Verify drug compatibility</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full bg-transparent">
                Check Now
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Drug Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Pill className="h-5 w-5 mr-2" />
              Current Drug Inventory
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-semibold text-primary">Prescription Drugs</h4>
                <div className="space-y-2">
                  {lowStockDrugs.filter(drug => drug.is_prescription_required === true).map((drug) => (
                    <div key={drug.id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <p className="font-medium text-sm">{drug.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {drug.dosage_form || 'Unknown form'} - {drug.strength || 'Unknown strength'}
                        </p>
                      </div>
                      <Badge variant="outline">
                        {drug.is_prescription_required ? 'Rx Required' : 'OTC'}
                      </Badge>
                    </div>
                  ))}
                  {lowStockDrugs.filter(drug => drug.is_prescription_required === true).length === 0 && (
                    <div className="text-center py-2 text-muted-foreground text-sm">
                      No prescription drugs in low stock
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-primary">Over-the-Counter Drugs</h4>
                <div className="space-y-2">
                  {lowStockDrugs.filter(drug => drug.is_prescription_required === false).map((drug) => (
                    <div key={drug.id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <p className="font-medium text-sm">{drug.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {drug.dosage_form || 'Unknown form'} - {drug.strength || 'Unknown strength'}
                        </p>
                      </div>
                      <Badge variant="outline">
                        {drug.is_prescription_required ? 'Rx Required' : 'OTC'}
                      </Badge>
                    </div>
                  ))}
                  {lowStockDrugs.filter(drug => drug.is_prescription_required === false).length === 0 && (
                    <div className="text-center py-2 text-muted-foreground text-sm">
                      No OTC drugs in low stock
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
