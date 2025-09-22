"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pill, Eye, Package, AlertTriangle } from "lucide-react"

interface Medication {
  id: string
  name: string
  category: string
  stock: number
  minStock: number
  price: number
  indication: string[]
  supplier: string
  expiryDate: string
}

const SAMPLE_MEDICATIONS: Medication[] = [
  {
    id: "M001",
    name: "Artemether-Lumefantrine",
    category: "Antimalarial",
    stock: 150,
    minStock: 50,
    price: 25.5,
    indication: ["Malaria", "P. falciparum"],
    supplier: "PharmaCorp Ltd",
    expiryDate: "2025-12-31",
  },
  {
    id: "M002",
    name: "Ciprofloxacin",
    category: "Antibiotic",
    stock: 25,
    minStock: 30,
    price: 15.75,
    indication: ["Typhoid", "Bacterial infections"],
    supplier: "MediSupply Inc",
    expiryDate: "2025-08-15",
  },
  {
    id: "M003",
    name: "Paracetamol",
    category: "Analgesic",
    stock: 200,
    minStock: 100,
    price: 5.25,
    indication: ["Fever", "Pain relief"],
    supplier: "HealthMeds Co",
    expiryDate: "2026-03-20",
  },
]

interface MedicationSearchProps {
  searchTerm: string
}

export function MedicationSearch({ searchTerm }: MedicationSearchProps) {
  const [medications] = useState<Medication[]>(SAMPLE_MEDICATIONS)

  const filteredMedications = medications.filter(
    (medication) =>
      medication.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medication.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      medication.indication.some((ind) => ind.toLowerCase().includes(searchTerm.toLowerCase())) ||
      medication.supplier.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Pill className="h-5 w-5 mr-2" />
            Medication Search Results
          </CardTitle>
          <CardDescription>
            {filteredMedications.length} medication(s) found
            {searchTerm && ` for "${searchTerm}"`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Medication ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Stock Status</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Indications</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Expiry</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMedications.map((medication) => (
                <TableRow key={medication.id}>
                  <TableCell className="font-medium">{medication.id}</TableCell>
                  <TableCell className="font-medium">{medication.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{medication.category}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <span>{medication.stock} units</span>
                      {medication.stock <= medication.minStock && <AlertTriangle className="h-4 w-4 text-orange-500" />}
                    </div>
                    <Badge variant={medication.stock <= medication.minStock ? "destructive" : "default"}>
                      {medication.stock <= medication.minStock ? "Low Stock" : "In Stock"}
                    </Badge>
                  </TableCell>
                  <TableCell>${medication.price}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {medication.indication.map((indication, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {indication}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{medication.supplier}</TableCell>
                  <TableCell className="text-sm">{medication.expiryDate}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Package className="h-4 w-4" />
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
