"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BookAppointmentDialog } from "./book-appointment-dialog"
import { AppointmentCalendar } from "./appointment-calendar"
import { Calendar, Clock, Plus, Search, User, Phone, MapPin, CheckCircle, XCircle, AlertCircle } from "lucide-react"

interface Appointment {
  id: string
  patientName: string
  patientId: string
  doctorName: string
  doctorSpecialty: string
  date: string
  time: string
  duration: number
  type: "Consultation" | "Follow-up" | "Emergency" | "Check-up"
  status: "Scheduled" | "Confirmed" | "In Progress" | "Completed" | "Cancelled" | "No Show"
  reason: string
  room?: string
  notes?: string
  phone?: string
}

interface AppointmentViewProps {
  user: any
}

export function AppointmentView({ user }: AppointmentViewProps) {
  const [showBookDialog, setShowBookDialog] = useState(false)
  const [activeTab, setActiveTab] = useState("upcoming")
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list")

  // Mock appointment data
  const [appointments] = useState<Appointment[]>([
    {
      id: "1",
      patientName: "John Doe",
      patientId: "P-2025-001",
      doctorName: "Dr. Sarah Johnson",
      doctorSpecialty: "General Medicine",
      date: "2025-09-25",
      time: "09:00",
      duration: 30,
      type: "Consultation",
      status: "Scheduled",
      reason: "Fever and headache symptoms",
      room: "Room 101",
      phone: "+264 81 234 5678",
    },
    {
      id: "2",
      patientName: "Mary Smith",
      patientId: "P-2025-015",
      doctorName: "Dr. Michael Chen",
      doctorSpecialty: "Internal Medicine",
      date: "2025-09-25",
      time: "10:30",
      duration: 45,
      type: "Follow-up",
      status: "Confirmed",
      reason: "Malaria treatment follow-up",
      room: "Room 102",
      phone: "+264 81 345 6789",
    },
    {
      id: "3",
      patientName: "Robert Johnson",
      patientId: "P-2025-032",
      doctorName: "Dr. Sarah Johnson",
      doctorSpecialty: "General Medicine",
      date: "2025-09-25",
      time: "14:00",
      duration: 30,
      type: "Check-up",
      status: "Scheduled",
      reason: "Routine diabetes check",
      room: "Room 101",
      phone: "+264 81 456 7890",
    },
    {
      id: "4",
      patientName: "Lisa Wilson",
      patientId: "P-2025-089",
      doctorName: "Dr. Emily Rodriguez",
      doctorSpecialty: "Pediatrics",
      date: "2025-09-24",
      time: "11:00",
      duration: 30,
      type: "Consultation",
      status: "Completed",
      reason: "Child vaccination",
      room: "Room 103",
      phone: "+264 81 567 8901",
    },
    {
      id: "5",
      patientName: "David Brown",
      patientId: "P-2025-045",
      doctorName: "Dr. Michael Chen",
      doctorSpecialty: "Internal Medicine",
      date: "2025-09-23",
      time: "15:30",
      duration: 30,
      type: "Follow-up",
      status: "No Show",
      reason: "Typhoid fever follow-up",
      room: "Room 102",
      phone: "+264 81 678 9012",
    },
  ])

  const getSidebarItems = () => {
    const baseItems = [
      { icon: <Calendar className="h-4 w-4" />, label: "Appointments", href: "/appointments", active: true },
    ]

    if (user.role === "patient") {
      return [
        { icon: <User className="h-4 w-4" />, label: "My Profile", href: "/profile" },
        { icon: <Calendar className="h-4 w-4" />, label: "My Appointments", href: "/appointments", active: true },
        { icon: <Plus className="h-4 w-4" />, label: "Book Appointment", href: "/book" },
      ]
    }

    return [
      ...baseItems,
      { icon: <Search className="h-4 w-4" />, label: "Search Appointments", href: "/search" },
      { icon: <Clock className="h-4 w-4" />, label: "Schedule Management", href: "/schedule" },
    ]
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Scheduled":
        return "bg-blue-100 text-blue-700"
      case "Confirmed":
        return "bg-green-100 text-green-700"
      case "In Progress":
        return "bg-yellow-100 text-yellow-700"
      case "Completed":
        return "bg-gray-100 text-gray-700"
      case "Cancelled":
        return "bg-red-100 text-red-700"
      case "No Show":
        return "bg-orange-100 text-orange-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Confirmed":
        return <CheckCircle className="h-4 w-4" />
      case "Cancelled":
      case "No Show":
        return <XCircle className="h-4 w-4" />
      case "In Progress":
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const filterAppointments = (status: string) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    switch (status) {
      case "upcoming":
        return appointments.filter((apt) => {
          const aptDate = new Date(apt.date)
          return (
            aptDate >= today && apt.status !== "Completed" && apt.status !== "Cancelled" && apt.status !== "No Show"
          )
        })
      case "today":
        return appointments.filter((apt) => {
          const aptDate = new Date(apt.date)
          return aptDate.toDateString() === today.toDateString()
        })
      case "completed":
        return appointments.filter((apt) => apt.status === "Completed")
      case "cancelled":
        return appointments.filter((apt) => apt.status === "Cancelled" || apt.status === "No Show")
      default:
        return appointments
    }
  }

  const filteredAppointments = filterAppointments(activeTab)

  return (
    <DashboardLayout user={user} sidebarItems={getSidebarItems()}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-balance">
              {user.role === "patient" ? "My Appointments" : "Appointment Management"}
            </h1>
            <p className="text-muted-foreground">
              {user.role === "patient"
                ? "View and manage your medical appointments"
                : "Manage patient appointments and schedules"}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={() => setViewMode(viewMode === "list" ? "calendar" : "list")}>
              {viewMode === "list" ? "Calendar View" : "List View"}
            </Button>
            <Button onClick={() => setShowBookDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Book Appointment
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{filterAppointments("upcoming").length}</div>
              <p className="text-xs text-muted-foreground">Scheduled appointments</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{filterAppointments("today").length}</div>
              <p className="text-xs text-muted-foreground">Appointments today</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">{filterAppointments("completed").length}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{filterAppointments("cancelled").length}</div>
              <p className="text-xs text-muted-foreground">This month</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        {viewMode === "calendar" ? (
          <AppointmentCalendar appointments={appointments} user={user} />
        ) : (
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="today">Today</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-4">
              {filteredAppointments.length === 0 ? (
                <Card>
                  <CardContent className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No appointments found</h3>
                      <p className="text-muted-foreground mb-4">
                        {activeTab === "upcoming"
                          ? "You have no upcoming appointments"
                          : `No ${activeTab} appointments to display`}
                      </p>
                      <Button onClick={() => setShowBookDialog(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Book New Appointment
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {filteredAppointments.map((appointment) => (
                    <Card key={appointment.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-start space-x-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                              {getStatusIcon(appointment.status)}
                            </div>
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <h3 className="text-lg font-semibold">
                                  {user.role === "patient" ? appointment.doctorName : appointment.patientName}
                                </h3>
                                <Badge className={getStatusColor(appointment.status)}>{appointment.status}</Badge>
                              </div>
                              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                <span className="flex items-center">
                                  <Calendar className="h-4 w-4 mr-1" />
                                  {new Date(appointment.date).toLocaleDateString()}
                                </span>
                                <span className="flex items-center">
                                  <Clock className="h-4 w-4 mr-1" />
                                  {appointment.time} ({appointment.duration} min)
                                </span>
                                {appointment.room && (
                                  <span className="flex items-center">
                                    <MapPin className="h-4 w-4 mr-1" />
                                    {appointment.room}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                <span>
                                  {user.role === "patient"
                                    ? `${appointment.doctorSpecialty}`
                                    : `Patient ID: ${appointment.patientId}`}
                                </span>
                                <span className="flex items-center">
                                  <Phone className="h-4 w-4 mr-1" />
                                  {appointment.phone}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                <strong>Reason:</strong> {appointment.reason}
                              </p>
                              {appointment.notes && (
                                <p className="text-sm text-muted-foreground">
                                  <strong>Notes:</strong> {appointment.notes}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {appointment.status === "Scheduled" && (
                              <>
                                <Button variant="outline" size="sm">
                                  Reschedule
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="text-destructive hover:text-destructive bg-transparent"
                                >
                                  Cancel
                                </Button>
                              </>
                            )}
                            {appointment.status === "Confirmed" && user.role !== "patient" && (
                              <Button size="sm">Start Consultation</Button>
                            )}
                            {appointment.status === "Completed" && (
                              <Button variant="outline" size="sm">
                                View Report
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        )}
      </div>

      <BookAppointmentDialog open={showBookDialog} onOpenChange={setShowBookDialog} user={user} />
    </DashboardLayout>
  )
}
