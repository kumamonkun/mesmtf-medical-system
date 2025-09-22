"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pill, Clock, CheckCircle, AlertTriangle, Eye, Plus, RefreshCw } from "lucide-react"
import { toast } from "sonner"

interface DrugAdministrationRecord {
  id: string
  prescription_id?: string
  administered_by?: string
  administered_at: string
  quantity_administered: number
  notes?: string
  created_at: string
  prescription?: {
    id: string
    dosage: string
    frequency: string
    instructions?: string
    drug?: {
      name: string
      generic_name?: string
      dosage_form?: string
    }
    treatment?: {
      treatment_plan: string
      status: string
    }
  }
  administered_by_user?: {
    first_name: string
    last_name: string
    role: string
  }
}

interface DrugAdministrationProps {
  searchTerm: string
}

export function DrugAdministration({ searchTerm }: DrugAdministrationProps) {
  const [administrations, setAdministrations] = useState<DrugAdministrationRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch drug administration records from API
  const fetchAdministrations = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/drug-administration')
      if (response.ok) {
        const data = await response.json()
        setAdministrations(data.administrations || [])
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch drug administration records')
      }
    } catch (err) {
      console.error('Error fetching drug administration records:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
      toast.error('Failed to fetch drug administration records')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAdministrations()
  }, [])

  const filteredAdministrations = administrations.filter(
    (admin) =>
      admin.prescription?.drug?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.prescription?.drug?.generic_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.prescription?.dosage.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.prescription?.frequency.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.administered_by_user?.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.administered_by_user?.last_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <Clock className="h-4 w-4" />
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      case "discontinued":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <Pill className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "default"
      case "completed":
        return "default"
      case "discontinued":
        return "destructive"
      default:
        return "secondary"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>Loading drug administration records...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-destructive">Error Loading Records</h3>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={fetchAdministrations} className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with refresh button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Drug Administration Records</h2>
          <p className="text-muted-foreground">Track medication administration and patient compliance</p>
        </div>
        <Button onClick={fetchAdministrations} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Administration Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Records</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {administrations.filter((a) => {
                const today = new Date().toDateString()
                const adminDate = new Date(a.administered_at).toDateString()
                return adminDate === today
              }).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {administrations.filter((a) => {
                const weekAgo = new Date()
                weekAgo.setDate(weekAgo.getDate() - 7)
                return new Date(a.administered_at) >= weekAgo
              }).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Quantity</CardTitle>
            <Pill className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {administrations.reduce((sum, a) => sum + a.quantity_administered, 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <Pill className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{administrations.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Drug Administration Table */}
      <Card>
        <CardHeader>
          <CardTitle>Drug Administration Records</CardTitle>
          <CardDescription>Track medication administration and patient compliance</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredAdministrations.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Medication</TableHead>
                  <TableHead>Dosage & Frequency</TableHead>
                  <TableHead>Quantity Administered</TableHead>
                  <TableHead>Administered At</TableHead>
                  <TableHead>Administered By</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAdministrations.map((admin) => (
                  <TableRow key={admin.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{admin.prescription?.drug?.name || 'Unknown Drug'}</div>
                        {admin.prescription?.drug?.generic_name && (
                          <div className="text-sm text-muted-foreground">{admin.prescription.drug.generic_name}</div>
                        )}
                        {admin.prescription?.drug?.dosage_form && (
                          <div className="text-sm text-muted-foreground">{admin.prescription.drug.dosage_form}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{admin.prescription?.dosage || 'N/A'}</div>
                        <div className="text-sm text-muted-foreground">{admin.prescription?.frequency || 'N/A'}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{admin.quantity_administered} units</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(admin.administered_at).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(admin.administered_at).toLocaleTimeString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {admin.administered_by_user ? 
                            `${admin.administered_by_user.first_name} ${admin.administered_by_user.last_name}` : 
                            'Unknown'
                          }
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {admin.administered_by_user?.role || 'Unknown Role'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm max-w-xs truncate">
                        {admin.notes || 'No notes'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Pill className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">No Administration Records</h3>
              <p>No drug administration records found. Records will appear here when medications are administered.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
