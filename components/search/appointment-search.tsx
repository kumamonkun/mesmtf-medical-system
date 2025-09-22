"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Calendar, Eye, Edit, Clock, CheckCircle, XCircle } from "lucide-react"

interface Appointment {
  id: string
  patientName: string
  patientId: string
  doctorName: string
  date: string
  time: string
  type: string
  status: "scheduled" | "completed" | "cancelled" | "no-show"
  reason: string
}

const SAMPLE_APPOINTMENTS: Appointment[] = [
  {
    id: "A001",
    patientName: "John Doe",
    patientId: "P001",
    doctorName: "Dr. Smith",
    date: "2024-01-16",
    time: "09:00",
    type: "Follow-up",
    status: "scheduled",
    reason: "Malaria treatment follow-up",
  },
  {
    id: "A002",
    patientName: "Jane Smith",
    patientId: "P002",
    doctorName: "Dr. Johnson",
    date: "2024-01-15",
    time: "14:30",
    type: "Consultation",
    status: "completed",
    reason: "Typhoid fever consultation",
  },
  {
    id: "A003",
    patientName: "Bob Wilson",
    patientId: "P003",
    doctorName: "Dr. Brown",
    date: "2024-01-14",
    time: "11:00",
    type: "Check-up",
    status: "completed",
    reason: "Post-treatment check-up",
  },
]

interface AppointmentSearchProps {
  searchTerm: string
}

export function AppointmentSearch({ searchTerm }: AppointmentSearchProps) {
  const [appointments] = useState<Appointment[]>(SAMPLE_APPOINTMENTS)

  const filteredAppointments = appointments.filter(
    (appointment) =>
      appointment.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.type.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "scheduled":
        return <Clock className="h-4 w-4" />
      case "completed":
        return <CheckCircle className="h-4 w-4" />
      case "cancelled":
      case "no-show":
        return <XCircle className="h-4 w-4" />
      default:
        return <Calendar className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "default"
      case "completed":
        return "default"
      case "cancelled":
      case "no-show":
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
            <Calendar className="h-5 w-5 mr-2" />
            Appointment Search Results
          </CardTitle>
          <CardDescription>
            {filteredAppointments.length} appointment(s) found
            {searchTerm && ` for "${searchTerm}"`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Appointment ID</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Doctor</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAppointments.map((appointment) => (
                <TableRow key={appointment.id}>
                  <TableCell className="font-medium">{appointment.id}</TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{appointment.patientName}</div>
                      <div className="text-sm text-muted-foreground">{appointment.patientId}</div>
                    </div>
                  </TableCell>
                  <TableCell>{appointment.doctorName}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{appointment.date}</div>
                      <div className="text-muted-foreground">{appointment.time}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{appointment.type}</Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{appointment.reason}</TableCell>
                  <TableCell>
                    <Badge
                      variant={getStatusColor(appointment.status) as any}
                      className="flex items-center gap-1 w-fit"
                    >
                      {getStatusIcon(appointment.status)}
                      {appointment.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      {appointment.status === "scheduled" && (
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
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
