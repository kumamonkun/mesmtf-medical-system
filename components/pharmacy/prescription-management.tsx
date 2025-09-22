"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileText, Clock, CheckCircle, XCircle, Eye, Edit, RefreshCw } from "lucide-react"
import { toast } from "sonner"

interface Prescription {
  id: string
  treatment_id: string
  drug_id: string
  dosage: string
  frequency: string
  duration_days: number
  instructions?: string
  quantity: number
  created_at: string
  updated_at: string
  drug?: {
    id: string
    name: string
    generic_name?: string
    dosage_form?: string
    strength?: string
    manufacturer?: string
    is_prescription_required?: boolean
  }
  treatment?: {
    id: string
    treatment_plan: string
    duration_days: number
    status: string
  }
}

interface PrescriptionManagementProps {
  searchTerm: string
}

export function PrescriptionManagement({ searchTerm }: PrescriptionManagementProps) {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [fulfilling, setFulfilling] = useState<string | null>(null)

  // Fetch prescriptions from API
  const fetchPrescriptions = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/prescriptions')
      if (response.ok) {
        const data = await response.json()
        setPrescriptions(data.prescriptions || [])
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch prescriptions')
      }
    } catch (err) {
      console.error('Error fetching prescriptions:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
      toast.error('Failed to fetch prescriptions')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPrescriptions()
  }, [])

  // Fulfill prescription
  const fulfillPrescription = async (prescriptionId: string) => {
    try {
      setFulfilling(prescriptionId)
      const response = await fetch(`/api/prescriptions/${prescriptionId}/fulfill`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        toast.success('Prescription fulfilled successfully')
        // Refresh prescriptions list
        await fetchPrescriptions()
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fulfill prescription')
      }
    } catch (err) {
      console.error('Error fulfilling prescription:', err)
      toast.error(err instanceof Error ? err.message : 'Failed to fulfill prescription')
    } finally {
      setFulfilling(null)
    }
  }

  const filteredPrescriptions = prescriptions.filter(
    (prescription) =>
      prescription.drug?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prescription.drug?.generic_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prescription.treatment?.treatment_plan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prescription.dosage.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prescription.frequency.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <Clock className="h-4 w-4" />
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      case "cancelled":
        return <XCircle className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "default"
      case "completed":
        return "default"
      case "cancelled":
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
          <span>Loading prescriptions...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-destructive">Error Loading Prescriptions</h3>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={fetchPrescriptions} className="mt-4">
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
          <h2 className="text-2xl font-bold">Prescription Management</h2>
          <p className="text-muted-foreground">Manage and track prescription orders</p>
        </div>
        <Button onClick={fetchPrescriptions} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Prescription Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {prescriptions.filter((p) => p.treatment?.status === "active").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {prescriptions.filter((p) => p.treatment?.status === "completed").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{prescriptions.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Prescriptions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Prescription Management</CardTitle>
          <CardDescription>Review and manage prescription orders</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Drug</TableHead>
                <TableHead>Dosage & Frequency</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Treatment Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPrescriptions.map((prescription) => (
                <TableRow key={prescription.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{prescription.drug?.name || 'Unknown Drug'}</div>
                      {prescription.drug?.generic_name && (
                        <div className="text-sm text-muted-foreground">{prescription.drug.generic_name}</div>
                      )}
                      {prescription.drug?.dosage_form && (
                        <div className="text-sm text-muted-foreground">{prescription.drug.dosage_form}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{prescription.dosage}</div>
                      <div className="text-sm text-muted-foreground">{prescription.frequency}</div>
                    </div>
                  </TableCell>
                  <TableCell>{prescription.quantity}</TableCell>
                  <TableCell>{prescription.duration_days} days</TableCell>
                  <TableCell>
                    <Badge variant="outline">{prescription.treatment?.treatment_plan || 'N/A'}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={getStatusColor(prescription.treatment?.status || 'unknown') as any}
                      className="flex items-center gap-1 w-fit"
                    >
                      {getStatusIcon(prescription.treatment?.status || 'unknown')}
                      {prescription.treatment?.status || 'Unknown'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      {prescription.treatment?.status === "active" && (
                        <Button 
                          variant="default" 
                          size="sm"
                          onClick={() => fulfillPrescription(prescription.id)}
                          disabled={fulfilling === prescription.id}
                        >
                          {fulfilling === prescription.id ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <CheckCircle className="h-4 w-4" />
                          )}
                          {fulfilling === prescription.id ? 'Fulfilling...' : 'Fulfill'}
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
