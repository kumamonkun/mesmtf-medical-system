"use client"

import type React from "react"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  UserIcon,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Heart,
  AlertTriangle,
  FileText,
  Pill,
  Activity,
  Edit,
  Download,
  Plus,
} from "lucide-react"

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

interface User {
  username: string
  role: string
  loginTime: string
}

interface PatientRecordDetailProps {
  patient: Patient
  user: User
  onBack: () => void
  sidebarItems: Array<{
    icon: React.ReactNode
    label: string
    href: string
    active?: boolean
  }>
}

interface MedicalHistory {
  id: string
  date: string
  diagnosis: string
  doctor: string
  symptoms: string[]
  treatment: string
  medications: string[]
  notes: string
  followUp?: string
}

interface VitalSigns {
  id: string
  date: string
  bloodPressure: string
  temperature: string
  heartRate: string
  weight: string
  height: string
  recordedBy: string
}

export function PatientRecordDetail({ patient, user, onBack, sidebarItems }: PatientRecordDetailProps) {
  const [activeTab, setActiveTab] = useState("overview")

  // Mock medical history data
  const medicalHistory: MedicalHistory[] = [
    {
      id: "1",
      date: "2025-09-20",
      diagnosis: "Malaria (P. falciparum)",
      doctor: "Dr. Sarah Johnson",
      symptoms: ["High fever", "Chills", "Headache", "Nausea"],
      treatment: "Antimalarial therapy",
      medications: ["Artemether-Lumefantrine 20mg/120mg", "Paracetamol 500mg"],
      notes: "Patient responded well to treatment. Fever subsided after 48 hours.",
      followUp: "2025-09-27",
    },
    {
      id: "2",
      date: "2025-08-15",
      diagnosis: "Typhoid Fever",
      doctor: "Dr. Michael Chen",
      symptoms: ["Persistent fever", "Abdominal pain", "Headache", "Weakness"],
      treatment: "Antibiotic therapy",
      medications: ["Ciprofloxacin 500mg", "ORS sachets"],
      notes: "Complete recovery after 10-day antibiotic course.",
    },
    {
      id: "3",
      date: "2025-07-10",
      diagnosis: "Routine Check-up",
      doctor: "Dr. Sarah Johnson",
      symptoms: [],
      treatment: "Preventive care",
      medications: [],
      notes: "Annual health screening. All parameters normal.",
    },
  ]

  // Mock vital signs data
  const vitalSigns: VitalSigns[] = [
    {
      id: "1",
      date: "2025-09-20",
      bloodPressure: "120/80",
      temperature: "98.6°F",
      heartRate: "72 bpm",
      weight: "70 kg",
      height: "175 cm",
      recordedBy: "Nurse Mary Adams",
    },
    {
      id: "2",
      date: "2025-09-18",
      bloodPressure: "125/85",
      temperature: "101.2°F",
      heartRate: "85 bpm",
      weight: "69 kg",
      height: "175 cm",
      recordedBy: "Nurse John Smith",
    },
    {
      id: "3",
      date: "2025-08-15",
      bloodPressure: "118/78",
      temperature: "102.5°F",
      heartRate: "90 bpm",
      weight: "68 kg",
      height: "175 cm",
      recordedBy: "Nurse Mary Adams",
    },
  ]

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

  return (
    <DashboardLayout user={user} sidebarItems={sidebarItems}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-balance">
                {patient.firstName} {patient.lastName}
              </h1>
              <p className="text-muted-foreground">Patient ID: {patient.patientId}</p>
            </div>
            <Badge className={getStatusColor(patient.status)}>{patient.status}</Badge>
          </div>
          <div className="flex items-center space-x-2">
            {user.role !== "patient" && (
              <>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Patient Overview Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <UserIcon className="h-5 w-5 mr-2" />
              Patient Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground">Personal Details</h4>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        Age {calculateAge(patient.dateOfBirth)} ({new Date(patient.dateOfBirth).toLocaleDateString()})
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <UserIcon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{patient.gender}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Heart className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Blood Type: {patient.bloodType}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground">Contact Information</h4>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{patient.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{patient.email}</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <span className="text-sm">{patient.address}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-sm text-muted-foreground">Medical Alerts</h4>
                  <div className="mt-2 space-y-2">
                    {patient.allergies.length > 0 && (
                      <div className="flex items-start space-x-2">
                        <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-red-700">Allergies</p>
                          <p className="text-xs text-red-600">{patient.allergies.join(", ")}</p>
                        </div>
                      </div>
                    )}
                    {patient.chronicConditions.length > 0 && (
                      <div className="flex items-start space-x-2">
                        <Activity className="h-4 w-4 text-amber-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-amber-700">Chronic Conditions</p>
                          <p className="text-xs text-amber-600">{patient.chronicConditions.join(", ")}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Emergency Contact</p>
                        <p className="text-xs text-muted-foreground">{patient.emergencyContact}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detailed Records Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="history">Medical History</TabsTrigger>
            <TabsTrigger value="vitals">Vital Signs</TabsTrigger>
            <TabsTrigger value="medications">Medications</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Recent Medical History
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {medicalHistory.slice(0, 3).map((record) => (
                    <div key={record.id} className="p-3 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{record.diagnosis}</p>
                          <p className="text-sm text-muted-foreground">Dr. {record.doctor}</p>
                          <p className="text-xs text-muted-foreground">{new Date(record.date).toLocaleDateString()}</p>
                        </div>
                        <Badge variant="outline">{record.diagnosis.includes("Malaria") ? "Malaria" : "Other"}</Badge>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Activity className="h-5 w-5 mr-2" />
                    Latest Vital Signs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {vitalSigns.length > 0 && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm font-medium">Blood Pressure</p>
                          <p className="text-lg">{vitalSigns[0].bloodPressure} mmHg</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Temperature</p>
                          <p className="text-lg">{vitalSigns[0].temperature}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Heart Rate</p>
                          <p className="text-lg">{vitalSigns[0].heartRate}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Weight</p>
                          <p className="text-lg">{vitalSigns[0].weight}</p>
                        </div>
                      </div>
                      <Separator />
                      <p className="text-xs text-muted-foreground">
                        Recorded on {new Date(vitalSigns[0].date).toLocaleDateString()} by {vitalSigns[0].recordedBy}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="history" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Complete Medical History</h3>
              {user.role !== "patient" && (
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Record
                </Button>
              )}
            </div>
            <div className="space-y-4">
              {medicalHistory.map((record) => (
                <Card key={record.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{record.diagnosis}</CardTitle>
                        <CardDescription>
                          {new Date(record.date).toLocaleDateString()} - {record.doctor}
                        </CardDescription>
                      </div>
                      <Badge variant="outline">
                        {record.diagnosis.includes("Malaria")
                          ? "Malaria"
                          : record.diagnosis.includes("Typhoid")
                            ? "Typhoid"
                            : "Other"}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {record.symptoms.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-sm mb-2">Symptoms</h4>
                        <div className="flex flex-wrap gap-2">
                          {record.symptoms.map((symptom, index) => (
                            <Badge key={index} variant="secondary">
                              {symptom}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Treatment</h4>
                      <p className="text-sm text-muted-foreground">{record.treatment}</p>
                    </div>
                    {record.medications.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-sm mb-2">Medications</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {record.medications.map((medication, index) => (
                            <li key={index} className="flex items-center">
                              <Pill className="h-3 w-3 mr-2" />
                              {medication}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <div>
                      <h4 className="font-semibold text-sm mb-2">Notes</h4>
                      <p className="text-sm text-muted-foreground">{record.notes}</p>
                    </div>
                    {record.followUp && (
                      <div>
                        <h4 className="font-semibold text-sm mb-2">Follow-up</h4>
                        <p className="text-sm text-muted-foreground">
                          Scheduled for {new Date(record.followUp).toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="vitals" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Vital Signs History</h3>
              {user.role !== "patient" && (
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Record Vitals
                </Button>
              )}
            </div>
            <div className="space-y-4">
              {vitalSigns.map((vital) => (
                <Card key={vital.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{new Date(vital.date).toLocaleDateString()}</CardTitle>
                      <Badge variant="outline">Recorded by {vital.recordedBy}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Blood Pressure</p>
                        <p className="text-lg font-semibold">{vital.bloodPressure}</p>
                        <p className="text-xs text-muted-foreground">mmHg</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Temperature</p>
                        <p className="text-lg font-semibold">{vital.temperature}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Heart Rate</p>
                        <p className="text-lg font-semibold">{vital.heartRate}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Weight</p>
                        <p className="text-lg font-semibold">{vital.weight}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Height</p>
                        <p className="text-lg font-semibold">{vital.height}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="medications" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Medication History</h3>
              {user.role !== "patient" && (
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Prescribe Medication
                </Button>
              )}
            </div>
            <div className="space-y-4">
              {medicalHistory
                .filter((record) => record.medications.length > 0)
                .map((record) => (
                  <Card key={record.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-lg">{record.diagnosis}</CardTitle>
                          <CardDescription>
                            Prescribed on {new Date(record.date).toLocaleDateString()} by {record.doctor}
                          </CardDescription>
                        </div>
                        <Badge variant="outline">
                          {record.diagnosis.includes("Malaria") ? "Malaria Treatment" : "Other Treatment"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {record.medications.map((medication, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex items-center space-x-3">
                              <Pill className="h-5 w-5 text-primary" />
                              <div>
                                <p className="font-medium">{medication}</p>
                                <p className="text-sm text-muted-foreground">
                                  {medication.includes("Artemether") ? "Take twice daily with food" : "As prescribed"}
                                </p>
                              </div>
                            </div>
                            <Badge variant="secondary">Completed</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
