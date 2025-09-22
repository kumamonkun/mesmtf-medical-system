"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { User, Eye, Calendar, FileText } from "lucide-react"

interface Patient {
  id: string
  name: string
  age: number
  gender: string
  phone: string
  email: string
  lastVisit: string
  status: "active" | "inactive"
  conditions: string[]
}

const SAMPLE_PATIENTS: Patient[] = [
  {
    id: "P001",
    name: "John Doe",
    age: 35,
    gender: "Male",
    phone: "+1234567890",
    email: "john.doe@email.com",
    lastVisit: "2024-01-15",
    status: "active",
    conditions: ["Malaria"],
  },
  {
    id: "P002",
    name: "Jane Smith",
    age: 28,
    gender: "Female",
    phone: "+1234567891",
    email: "jane.smith@email.com",
    lastVisit: "2024-01-14",
    status: "active",
    conditions: ["Typhoid Fever"],
  },
  {
    id: "P003",
    name: "Bob Wilson",
    age: 42,
    gender: "Male",
    phone: "+1234567892",
    email: "bob.wilson@email.com",
    lastVisit: "2024-01-10",
    status: "inactive",
    conditions: ["Malaria", "Recovered"],
  },
]

interface PatientSearchProps {
  searchTerm: string
}

export function PatientSearch({ searchTerm }: PatientSearchProps) {
  const [patients] = useState<Patient[]>(SAMPLE_PATIENTS)

  const filteredPatients = patients.filter(
    (patient) =>
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.conditions.some((condition) => condition.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="h-5 w-5 mr-2" />
            Patient Search Results
          </CardTitle>
          <CardDescription>
            {filteredPatients.length} patient(s) found
            {searchTerm && ` for "${searchTerm}"`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Age/Gender</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Last Visit</TableHead>
                <TableHead>Conditions</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPatients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell className="font-medium">{patient.id}</TableCell>
                  <TableCell className="font-medium">{patient.name}</TableCell>
                  <TableCell>
                    {patient.age} years, {patient.gender}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{patient.phone}</div>
                      <div className="text-muted-foreground">{patient.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>{patient.lastVisit}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {patient.conditions.map((condition, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {condition}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={patient.status === "active" ? "default" : "secondary"}>{patient.status}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Calendar className="h-4 w-4" />
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
