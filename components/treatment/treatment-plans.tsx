"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Stethoscope, Clock, CheckCircle, AlertTriangle, Eye, Edit, FileText } from "lucide-react"

interface TreatmentPlan {
  id: string
  patientName: string
  patientId: string
  diagnosis: string
  doctorName: string
  startDate: string
  endDate: string
  status: "active" | "completed" | "on-hold"
  treatments: {
    type: string
    description: string
    frequency: string
    duration: string
  }[]
  medications: string[]
  requiresXray: boolean
  notes: string
}

const SAMPLE_TREATMENT_PLANS: TreatmentPlan[] = [
  {
    id: "TP001",
    patientName: "John Doe",
    patientId: "P001",
    diagnosis: "Malaria (P. falciparum)",
    doctorName: "Dr. Smith",
    startDate: "2024-01-15",
    endDate: "2024-01-22",
    status: "active",
    requiresXray: true,
    treatments: [
      {
        type: "Medication",
        description: "Antimalarial therapy",
        frequency: "As prescribed",
        duration: "3 days",
      },
      {
        type: "Monitoring",
        description: "Temperature and symptom monitoring",
        frequency: "Every 4 hours",
        duration: "7 days",
      },
      {
        type: "Diagnostic",
        description: "Chest X-ray",
        frequency: "Once",
        duration: "1 day",
      },
    ],
    medications: ["Artemether-Lumefantrine", "Paracetamol"],
    notes: "Patient showing good response to treatment. Monitor for complications.",
  },
  {
    id: "TP002",
    patientName: "Jane Smith",
    patientId: "P002",
    diagnosis: "Typhoid Fever",
    doctorName: "Dr. Johnson",
    startDate: "2024-01-14",
    endDate: "2024-01-28",
    status: "active",
    requiresXray: false,
    treatments: [
      {
        type: "Medication",
        description: "Antibiotic therapy",
        frequency: "Twice daily",
        duration: "14 days",
      },
      {
        type: "Supportive Care",
        description: "Fluid replacement and rest",
        frequency: "Continuous",
        duration: "14 days",
      },
    ],
    medications: ["Ciprofloxacin"],
    notes: "Patient stable. Continue current treatment regimen.",
  },
]

interface TreatmentPlansProps {
  searchTerm: string
}

export function TreatmentPlans({ searchTerm }: TreatmentPlansProps) {
  const [treatmentPlans] = useState<TreatmentPlan[]>(SAMPLE_TREATMENT_PLANS)

  const filteredPlans = treatmentPlans.filter(
    (plan) =>
      plan.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.doctorName.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <Clock className="h-4 w-4" />
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      case "on-hold":
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <Stethoscope className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "default"
      case "completed":
        return "default"
      case "on-hold":
        return "destructive"
      default:
        return "secondary"
    }
  }

  return (
    <div className="space-y-6">
      {/* Treatment Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Plans</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {treatmentPlans.filter((p) => p.status === "active").length}
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
              {treatmentPlans.filter((p) => p.status === "completed").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Plans</CardTitle>
            <Stethoscope className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{treatmentPlans.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Treatment Plans Table */}
      <Card>
        <CardHeader>
          <CardTitle>Active Treatment Plans</CardTitle>
          <CardDescription>Manage ongoing patient treatment plans and interventions</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Diagnosis</TableHead>
                <TableHead>Doctor</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>X-ray Required</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPlans.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{plan.patientName}</div>
                      <div className="text-sm text-muted-foreground">{plan.patientId}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{plan.diagnosis}</Badge>
                  </TableCell>
                  <TableCell>{plan.doctorName}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{plan.startDate}</div>
                      <div className="text-muted-foreground">to {plan.endDate}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={plan.requiresXray ? "destructive" : "secondary"}>
                      {plan.requiresXray ? "Yes" : "No"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(plan.status) as any} className="flex items-center gap-1 w-fit">
                      {getStatusIcon(plan.status)}
                      {plan.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <FileText className="h-4 w-4" />
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
