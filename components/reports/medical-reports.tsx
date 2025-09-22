"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileText, Download, Eye, Calendar, Stethoscope } from "lucide-react"

interface MedicalReport {
  id: string
  type: "diagnosis" | "treatment" | "prescription" | "lab_result"
  patientName: string
  patientId: string
  doctorName: string
  date: string
  title: string
  status: "completed" | "pending" | "draft"
  description: string
}

const SAMPLE_MEDICAL_REPORTS: MedicalReport[] = [
  {
    id: "MR001",
    type: "diagnosis",
    patientName: "John Doe",
    patientId: "P001",
    doctorName: "Dr. Smith",
    date: "2024-01-15",
    title: "Malaria Diagnosis Report",
    status: "completed",
    description: "AI-assisted diagnosis confirmed malaria with high confidence. Treatment initiated.",
  },
  {
    id: "MR002",
    type: "treatment",
    patientName: "Jane Smith",
    patientId: "P002",
    doctorName: "Dr. Johnson",
    date: "2024-01-14",
    title: "Typhoid Treatment Plan",
    status: "completed",
    description: "Comprehensive treatment plan for typhoid fever with antibiotic therapy.",
  },
  {
    id: "MR003",
    type: "prescription",
    patientName: "Bob Wilson",
    patientId: "P003",
    doctorName: "Dr. Brown",
    date: "2024-01-13",
    title: "Antimalarial Prescription",
    status: "completed",
    description: "Prescription for Artemether-Lumefantrine and supportive medications.",
  },
  {
    id: "MR004",
    type: "lab_result",
    patientName: "Alice Johnson",
    patientId: "P004",
    doctorName: "Dr. Davis",
    date: "2024-01-12",
    title: "Blood Test Results",
    status: "pending",
    description: "Complete blood count and malaria parasite test results.",
  },
]

interface MedicalReportsProps {
  searchTerm: string
}

export function MedicalReports({ searchTerm }: MedicalReportsProps) {
  const [reports] = useState<MedicalReport[]>(SAMPLE_MEDICAL_REPORTS)

  const filteredReports = reports.filter(
    (report) =>
      report.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.doctorName.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "diagnosis":
        return <Stethoscope className="h-4 w-4" />
      case "treatment":
        return <FileText className="h-4 w-4" />
      case "prescription":
        return <FileText className="h-4 w-4" />
      case "lab_result":
        return <FileText className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "default"
      case "pending":
        return "secondary"
      case "draft":
        return "outline"
      default:
        return "secondary"
    }
  }

  return (
    <div className="space-y-6">
      {/* Reports Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reports.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <FileText className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {reports.filter((r) => r.status === "completed").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <FileText className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {reports.filter((r) => r.status === "pending").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reports.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Medical Reports Table */}
      <Card>
        <CardHeader>
          <CardTitle>Medical Reports</CardTitle>
          <CardDescription>View and manage patient medical reports and documentation</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Report Type</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Doctor</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReports.map((report) => (
                <TableRow key={report.id}>
                  <TableCell>
                    <Badge variant="outline" className="flex items-center gap-1 w-fit">
                      {getTypeIcon(report.type)}
                      {report.type.replace("_", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{report.patientName}</div>
                      <div className="text-sm text-muted-foreground">{report.patientId}</div>
                    </div>
                  </TableCell>
                  <TableCell>{report.doctorName}</TableCell>
                  <TableCell className="font-medium">{report.title}</TableCell>
                  <TableCell>{report.date}</TableCell>
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
