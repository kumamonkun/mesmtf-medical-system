"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertTriangle, Package, Eye, Edit, Trash2, RefreshCw } from "lucide-react"
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

interface DrugInventoryProps {
  searchTerm: string
}

export function DrugInventory({ searchTerm }: DrugInventoryProps) {
  const [drugs, setDrugs] = useState<Drug[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch drugs from API
  const fetchDrugs = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/drugs')
      if (response.ok) {
        const data = await response.json()
        setDrugs(data.drugs || [])
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to fetch drugs')
      }
    } catch (err) {
      console.error('Error fetching drugs:', err)
      setError(err instanceof Error ? err.message : 'Unknown error')
      toast.error('Failed to fetch drug inventory')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDrugs()
  }, [])

  const filteredDrugs = drugs.filter(
    (drug) =>
      drug.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      drug.generic_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      drug.manufacturer?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      drug.dosage_form?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      drug.strength?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const prescriptionDrugs = drugs.filter((drug) => drug.is_prescription_required === true)
  const otcDrugs = drugs.filter((drug) => drug.is_prescription_required === false)

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>Loading drug inventory...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-destructive">Error Loading Inventory</h3>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={fetchDrugs} className="mt-4">
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
          <h2 className="text-2xl font-bold">Drug Inventory</h2>
          <p className="text-muted-foreground">Manage your pharmaceutical inventory</p>
        </div>
        <Button onClick={fetchDrugs} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Inventory Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Drugs</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{drugs.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prescription Drugs</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{prescriptionDrugs.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Over-the-Counter</CardTitle>
            <Package className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{otcDrugs.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Manufacturers</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(drugs.map((d) => d.manufacturer).filter(Boolean)).size}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Drug Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle>Drug Inventory</CardTitle>
          <CardDescription>Manage your pharmaceutical inventory and drug information</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Drug Name</TableHead>
                <TableHead>Dosage Form</TableHead>
                <TableHead>Manufacturer</TableHead>
                <TableHead>Prescription</TableHead>
                <TableHead>Added Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDrugs.map((drug) => (
                <TableRow key={drug.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{drug.name}</div>
                      {drug.generic_name && (
                        <div className="text-sm text-muted-foreground">{drug.generic_name}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{drug.dosage_form || 'N/A'}</div>
                      {drug.strength && (
                        <div className="text-sm text-muted-foreground">{drug.strength}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>{drug.manufacturer || 'Unknown'}</TableCell>
                  <TableCell>
                    <Badge variant={drug.is_prescription_required ? "destructive" : "default"}>
                      {drug.is_prescription_required ? "Prescription Required" : "Over-the-Counter"}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(drug.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
