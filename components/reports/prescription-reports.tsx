"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileText, Download, Eye, Pill, Calendar, TrendingUp } from "lucide-react"

interface PrescriptionReport {
  id: string
  patientName: string
  patientId: string
  doctorName: string
  date: string
  medications: {
    name: string
    quantity: number
    cost: number
  }[]
  totalCost: number
  status: "dispensed" | "pending" | "cancelled"
}

const SAMPLE_PRESCRIPTION_REPORTS: PrescriptionReport[] = [
  {
    id: "PR001",
    patientName: "John Doe",
    patientId: "P001",
    doctorName: "Dr. Smith",
    date: "2024-01-15",
    medications: [
      { name: "Artemether-Lumefantrine", quantity: 12, cost: 25.5 },
      { name: "Paracetamol", quantity: 20, cost: 5.25 },
    ],
    totalCost: 30.75,
    status: "dispensed",
  },
  {
    id: "PR002",
    patientName: "Jane Smith",
    patientId: "P002",
    doctorName: "Dr. Johnson",
    date: "2024-01-14",
    medications: [{ name: "Ciprofloxacin", quantity: 14, cost: 15.75 }],
    totalCost: 15.75,
    status: "dispensed",
  },
  {
    id: "PR003",
    patientName: "Bob Wilson",
    patientId: "P003",
    doctorName: "Dr. Brown",
    date: "2024-01-13",
    medications: [
      { name: "Artemether-Lumefantrine", quantity: 12, cost: 25.5 },
      { name: "Paracetamol", quantity: 10, cost: 2.63 },
    ],
    totalCost: 28.13,
    status: "pending",
  },
]

interface PrescriptionReportsProps {
  searchTerm: string
}

export function PrescriptionReports({ searchTerm }: PrescriptionReportsProps) {
  const [prescriptionReports] = useState<PrescriptionReport[]>(SAMPLE_PRESCRIPTION_REPORTS)

  const filteredReports = prescriptionReports.filter(
    (report) =>
      report.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.medications.some((med) => med.name.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "dispensed":
        return "default"
      case "pending":
        return "secondary"
      case "cancelled":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const totalRevenue = prescriptionReports
    .filter((r) => r.status === "dispensed")
    .reduce((sum, report) => sum + report.totalCost, 0)

  const mostPrescribedMeds = prescriptionReports
    .flatMap((r) => r.medications)
    .reduce(
      (acc, med) => {
        acc[med.name] = (acc[med.name] || 0) + med.quantity
        return acc
      },
      {} as Record<string, number>,
    )

  const topMedications = Object.entries(mostPrescribedMeds)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)

  return (
    <div className="space-y-6">
      {/* Prescription Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Prescriptions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{prescriptionReports.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dispensed</CardTitle>
            <Pill className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {prescriptionReports.filter((r) => r.status === "dispensed").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">${totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{prescriptionReports.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Top Medications */}
      <Card>
        <CardHeader>
          <CardTitle>Most Prescribed Medications</CardTitle>
          <CardDescription>Top medications by quantity prescribed</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topMedications.map(([medication, quantity], index) => (
              <div key={medication} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline">#{index + 1}</Badge>
                  <span className="font-medium">{medication}</span>
                </div>
                <span className="text-sm text-muted-foreground">{quantity} units prescribed</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Prescription Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle>Prescription Reports</CardTitle>
          <CardDescription>Detailed prescription records and medication dispensing</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Prescription ID</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Doctor</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Medications</TableHead>
                <TableHead>Total Cost</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell className="font-medium">{report.id}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{report.patientName}</div>
                      <div className="text-sm text-muted-foreground">{report.patientId}</div>
                    </div>
                  </TableCell>
                  <TableCell>{report.doctorName}</TableCell>
                  <TableCell>{report.date}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {report.medications.map((med, index) => (
                        <div key={index} className="text-sm">
                          {med.name} ({med.quantity})
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">${report.totalCost.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(report.status) as any}>{report.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
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
