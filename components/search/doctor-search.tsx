"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Stethoscope, Eye, Calendar, Phone } from "lucide-react"

interface Doctor {
  id: string
  name: string
  specialization: string
  department: string
  phone: string
  email: string
  availability: "available" | "busy" | "offline"
  experience: number
  patients: number
}

const SAMPLE_DOCTORS: Doctor[] = [
  {
    id: "D001",
    name: "Dr. Smith",
    specialization: "Infectious Diseases",
    department: "Internal Medicine",
    phone: "+1234567800",
    email: "dr.smith@hospital.com",
    availability: "available",
    experience: 15,
    patients: 45,
  },
  {
    id: "D002",
    name: "Dr. Johnson",
    specialization: "Tropical Medicine",
    department: "Internal Medicine",
    phone: "+1234567801",
    email: "dr.johnson@hospital.com",
    availability: "busy",
    experience: 12,
    patients: 38,
  },
  {
    id: "D003",
    name: "Dr. Brown",
    specialization: "General Practice",
    department: "Family Medicine",
    phone: "+1234567802",
    email: "dr.brown@hospital.com",
    availability: "available",
    experience: 8,
    patients: 52,
  },
]

interface DoctorSearchProps {
  searchTerm: string
}

export function DoctorSearch({ searchTerm }: DoctorSearchProps) {
  const [doctors] = useState<Doctor[]>(SAMPLE_DOCTORS)

  const filteredDoctors = doctors.filter(
    (doctor) =>
      doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case "available":
        return "default"
      case "busy":
        return "secondary"
      case "offline":
        return "destructive"
      default:
        return "secondary"
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Stethoscope className="h-5 w-5 mr-2" />
            Doctor Search Results
          </CardTitle>
          <CardDescription>
            {filteredDoctors.length} doctor(s) found
            {searchTerm && ` for "${searchTerm}"`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Doctor ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Specialization</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Patients</TableHead>
                <TableHead>Availability</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDoctors.map((doctor) => (
                <TableRow key={doctor.id}>
                  <TableCell className="font-medium">{doctor.id}</TableCell>
                  <TableCell className="font-medium">{doctor.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{doctor.specialization}</Badge>
                  </TableCell>
                  <TableCell>{doctor.department}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{doctor.phone}</div>
                      <div className="text-muted-foreground">{doctor.email}</div>
                    </div>
                  </TableCell>
                  <TableCell>{doctor.experience} years</TableCell>
                  <TableCell>{doctor.patients}</TableCell>
                  <TableCell>
                    <Badge variant={getAvailabilityColor(doctor.availability) as any}>{doctor.availability}</Badge>
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
                        <Phone className="h-4 w-4" />
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
