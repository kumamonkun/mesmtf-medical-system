"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PatientRecordDetail } from "./patient-record-detail"
import { AddPatientDialog } from "./add-patient-dialog"
import {
  FileText,
  Search,
  Plus,
  Filter,
  Calendar,
  Phone,
  MapPin,
  Activity,
  AlertCircle,
  Eye,
  Edit,
  Trash2,
} from "lucide-react"
import { User } from "lucide-react" // Import User icon

interface Patient {
  id: string
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: string
  phone: string
  email: string
  address: string
  emergencyContact: string
  bloodType: string
  allergies: string[]
  chronicConditions: string[]
  lastVisit: string
  status: "Active" | "Inactive" | "Critical"
  patientId: string
}

interface MedicalRecordsViewProps {
  user: any
}

export function MedicalRecordsView({ user }: MedicalRecordsViewProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPatient, setSelectedPatient] = useState<any | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [activeTab, setActiveTab] = useState("all")

  // Mock patient data
  const [patients] = useState<any[]>([
    {
      id: "1",
      patientId: "P-2025-001",
      firstName: "John",
      lastName: "Doe",
      dateOfBirth: "1985-03-15",
      gender: "Male",
      phone: "+264 81 234 5678",
      email: "john.doe@email.com",
      address: "123 Main Street, Windhoek, Namibia",
      emergencyContact: "Jane Doe - +264 81 234 5679",
      bloodType: "O+",
      allergies: ["Penicillin", "Shellfish"],
      chronicConditions: ["Hypertension"],
      lastVisit: "2025-09-20",
      status: "Active",
    },
    {
      id: "2",
      patientId: "P-2025-015",
      firstName: "Mary",
      lastName: "Smith",
      dateOfBirth: "1992-07-22",
      gender: "Female",
      phone: "+264 81 345 6789",
      email: "mary.smith@email.com",
      address: "456 Oak Avenue, Windhoek, Namibia",
      emergencyContact: "Robert Smith - +264 81 345 6790",
      bloodType: "A+",
      allergies: [],
      chronicConditions: [],
      lastVisit: "2025-09-18",
      status: "Active",
    },
    {
      id: "3",
      patientId: "P-2025-032",
      firstName: "Robert",
      lastName: "Johnson",
      dateOfBirth: "1978-11-08",
      gender: "Male",
      phone: "+264 81 456 7890",
      email: "robert.johnson@email.com",
      address: "789 Pine Road, Windhoek, Namibia",
      emergencyContact: "Lisa Johnson - +264 81 456 7891",
      bloodType: "B+",
      allergies: ["Aspirin"],
      chronicConditions: ["Diabetes Type 2"],
      lastVisit: "2025-09-19",
      status: "Critical",
    },
    {
      id: "4",
      patientId: "P-2025-089",
      firstName: "Lisa",
      lastName: "Wilson",
      dateOfBirth: "1990-05-12",
      gender: "Female",
      phone: "+264 81 567 8901",
      email: "lisa.wilson@email.com",
      address: "321 Cedar Lane, Windhoek, Namibia",
      emergencyContact: "Mark Wilson - +264 81 567 8902",
      bloodType: "AB+",
      allergies: [],
      chronicConditions: [],
      lastVisit: "2025-09-21",
      status: "Active",
    },
  ])

  const getSidebarItems = () => {
    const baseItems = [
      { icon: <FileText className="h-4 w-4" />, label: "Medical Records", href: "/records", active: true },
    ]

    if (user.role === "patient") {
      return [
        { icon: <User className="h-4 w-4" />, label: "My Profile", href: "/profile" },
        { icon: <FileText className="h-4 w-4" />, label: "My Records", href: "/records", active: true },
        { icon: <Calendar className="h-4 w-4" />, label: "Appointments", href: "/appointments" },
      ]
    }

    return [
      ...baseItems,
      { icon: <Plus className="h-4 w-4" />, label: "Add Patient", href: "/add-patient" },
      { icon: <Search className="h-4 w-4" />, label: "Search Records", href: "/search" },
      { icon: <Activity className="h-4 w-4" />, label: "Reports", href: "/reports" },
    ]
  }

  const filteredPatients = patients.filter((patient) => {
    const matchesSearch =
      patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone.includes(searchTerm)

    if (activeTab === "all") return matchesSearch
    if (activeTab === "active") return matchesSearch && patient.status === "Active"
    if (activeTab === "critical") return matchesSearch && patient.status === "Critical"
    if (activeTab === "inactive") return matchesSearch && patient.status === "Inactive"

    return matchesSearch
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-700"
      case "Critical":
        return "bg-red-100 text-red-700"
      case "Inactive":
        return "bg-gray-100 text-gray-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  if (selectedPatient) {
    return (
      <PatientRecordDetail
        patient={selectedPatient}
        user={user}
        onBack={() => setSelectedPatient(null)}
        sidebarItems={getSidebarItems()}
      />
    )
  }

  return (
    <DashboardLayout user={user} sidebarItems={getSidebarItems()}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-balance">Medical Records</h1>
            <p className="text-muted-foreground">
              {user.role === "patient" ? "View your medical history" : "Manage patient medical records"}
            </p>
          </div>
          {user.role !== "patient" && (
            <Button onClick={() => setShowAddDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Patient
            </Button>
          )}
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="h-5 w-5 mr-2" />
              Search Patients
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <Input
                  placeholder="Search by name, patient ID, or phone number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="all">All Patients</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="critical">Critical</TabsTrigger>
                <TabsTrigger value="inactive">Inactive</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardContent>
        </Card>

        {/* Patient List */}
        <div className="grid gap-4">
          {filteredPatients.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No patients found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm ? "Try adjusting your search criteria" : "No patients match the current filter"}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredPatients.map((patient) => (
              <Card key={patient.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <Phone className="h-6 w-6 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-lg font-semibold">
                            {patient.firstName} {patient.lastName}
                          </h3>
                          <Badge className={getStatusColor(patient.status)}>{patient.status}</Badge>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span className="flex items-center">
                            <Phone className="h-4 w-4 mr-1" />
                            {patient.patientId}
                          </span>
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            Age {calculateAge(patient.dateOfBirth)}
                          </span>
                          <span className="flex items-center">
                            <Phone className="h-4 w-4 mr-1" />
                            {patient.phone}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          <span className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {patient.address.split(",")[0]}
                          </span>
                          <span>Last visit: {new Date(patient.lastVisit).toLocaleDateString()}</span>
                        </div>
                        {patient.allergies.length > 0 && (
                          <div className="flex items-center space-x-2">
                            <AlertCircle className="h-4 w-4 text-amber-500" />
                            <span className="text-sm text-amber-600">Allergies: {patient.allergies.join(", ")}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm" onClick={() => setSelectedPatient(patient)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      {user.role !== "patient" && (
                        <>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          {(user.role === "admin" || user.role === "doctor") && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-destructive hover:text-destructive bg-transparent"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Statistics */}
        {user.role !== "patient" && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{patients.length}</div>
                <p className="text-xs text-muted-foreground">Registered patients</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active Patients</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {patients.filter((p) => p.status === "Active").length}
                </div>
                <p className="text-xs text-muted-foreground">Currently active</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Critical Cases</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {patients.filter((p) => p.status === "Critical").length}
                </div>
                <p className="text-xs text-muted-foreground">Require attention</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Recent Visits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {
                    patients.filter((p) => {
                      const lastVisit = new Date(p.lastVisit)
                      const today = new Date()
                      const diffTime = Math.abs(today.getTime() - lastVisit.getTime())
                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                      return diffDays <= 7
                    }).length
                  }
                </div>
                <p className="text-xs text-muted-foreground">Last 7 days</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <AddPatientDialog open={showAddDialog} onOpenChange={setShowAddDialog} />
    </DashboardLayout>
  )
}
