"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, User, Stethoscope, CalendarPlus } from "lucide-react"

interface Doctor {
  id: string
  name: string
  specialty: string
  experience: string
  rating: number
  availability: string[]
  nextAvailable: string
}

interface BookAppointmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: any
}

export function BookAppointmentDialog({ open, onOpenChange, user }: BookAppointmentDialogProps) {
  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [formData, setFormData] = useState({
    patientName: user.role === "patient" ? user.username : "",
    patientPhone: "",
    patientId: "",
    appointmentType: "",
    reason: "",
    preferredDate: "",
    preferredTime: "",
    urgency: "Normal",
    notes: "",
  })

  // Mock doctor data
  const doctors: Doctor[] = [
    {
      id: "1",
      name: "Dr. Sarah Johnson",
      specialty: "General Medicine",
      experience: "15 years",
      rating: 4.8,
      availability: ["09:00", "10:30", "14:00", "15:30"],
      nextAvailable: "2025-09-25",
    },
    {
      id: "2",
      name: "Dr. Michael Chen",
      specialty: "Internal Medicine",
      experience: "12 years",
      rating: 4.9,
      availability: ["08:30", "11:00", "13:30", "16:00"],
      nextAvailable: "2025-09-25",
    },
    {
      id: "3",
      name: "Dr. Emily Rodriguez",
      specialty: "Pediatrics",
      experience: "10 years",
      rating: 4.7,
      availability: ["09:30", "11:30", "14:30"],
      nextAvailable: "2025-09-26",
    },
    {
      id: "4",
      name: "Dr. James Wilson",
      specialty: "Infectious Diseases",
      experience: "18 years",
      rating: 4.9,
      availability: ["10:00", "13:00", "15:00"],
      nextAvailable: "2025-09-25",
    },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Generate appointment ID
    const appointmentId = `APT-2025-${String(Math.floor(Math.random() * 1000)).padStart(3, "0")}`

    console.log("New appointment data:", {
      ...formData,
      appointmentId,
      doctorId: selectedDoctor?.id,
      doctorName: selectedDoctor?.name,
    })

    alert(`Appointment booked successfully! Appointment ID: ${appointmentId}`)
    setIsLoading(false)
    onOpenChange(false)

    // Reset form
    setStep(1)
    setSelectedDoctor(null)
    setFormData({
      patientName: user.role === "patient" ? user.username : "",
      patientPhone: "",
      patientId: "",
      appointmentType: "",
      reason: "",
      preferredDate: "",
      preferredTime: "",
      urgency: "Normal",
      notes: "",
    })
  }

  const handleNext = () => {
    if (step === 1 && formData.reason && formData.appointmentType) {
      setStep(2)
    } else if (step === 2 && selectedDoctor) {
      setStep(3)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  const getMinDate = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return tomorrow.toISOString().split("T")[0]
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <CalendarPlus className="h-5 w-5 mr-2" />
            Book New Appointment
          </DialogTitle>
          <DialogDescription>Schedule an appointment with one of our medical professionals.</DialogDescription>
        </DialogHeader>

        {/* Step Indicator */}
        <div className="flex items-center justify-center space-x-4 mb-6">
          {[1, 2, 3].map((stepNumber) => (
            <div key={stepNumber} className="flex items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                  step >= stepNumber ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                {stepNumber}
              </div>
              {stepNumber < 3 && <div className="w-12 h-0.5 bg-muted mx-2" />}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {/* Step 1: Appointment Details */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Appointment Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {user.role !== "patient" && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="patientName">Patient Name *</Label>
                        <Input
                          id="patientName"
                          value={formData.patientName}
                          onChange={(e) => setFormData((prev) => ({ ...prev, patientName: e.target.value }))}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="patientId">Patient ID</Label>
                        <Input
                          id="patientId"
                          placeholder="P-2025-XXX"
                          value={formData.patientId}
                          onChange={(e) => setFormData((prev) => ({ ...prev, patientId: e.target.value }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="patientPhone">Patient Phone *</Label>
                        <Input
                          id="patientPhone"
                          type="tel"
                          placeholder="+264 81 234 5678"
                          value={formData.patientPhone}
                          onChange={(e) => setFormData((prev) => ({ ...prev, patientPhone: e.target.value }))}
                          required
                        />
                      </div>
                    </>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="appointmentType">Appointment Type *</Label>
                    <Select
                      value={formData.appointmentType}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, appointmentType: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select appointment type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Consultation">New Consultation</SelectItem>
                        <SelectItem value="Follow-up">Follow-up Visit</SelectItem>
                        <SelectItem value="Check-up">Routine Check-up</SelectItem>
                        <SelectItem value="Emergency">Emergency</SelectItem>
                        <SelectItem value="Vaccination">Vaccination</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="urgency">Urgency Level</Label>
                    <Select
                      value={formData.urgency}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, urgency: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Low">Low Priority</SelectItem>
                        <SelectItem value="Normal">Normal</SelectItem>
                        <SelectItem value="High">High Priority</SelectItem>
                        <SelectItem value="Emergency">Emergency</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2 mt-4">
                  <Label htmlFor="reason">Reason for Visit *</Label>
                  <Textarea
                    id="reason"
                    placeholder="Please describe your symptoms or reason for the appointment"
                    value={formData.reason}
                    onChange={(e) => setFormData((prev) => ({ ...prev, reason: e.target.value }))}
                    required
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any additional information or special requests"
                    value={formData.notes}
                    onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                    rows={2}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Select Doctor */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Select Doctor</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {doctors.map((doctor) => (
                    <Card
                      key={doctor.id}
                      className={`cursor-pointer transition-all ${
                        selectedDoctor?.id === doctor.id ? "ring-2 ring-primary bg-primary/5" : "hover:shadow-md"
                      }`}
                      onClick={() => setSelectedDoctor(doctor)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                              <Stethoscope className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <CardTitle className="text-lg">{doctor.name}</CardTitle>
                              <CardDescription>{doctor.specialty}</CardDescription>
                            </div>
                          </div>
                          <Badge variant="secondary">★ {doctor.rating}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground">Experience: {doctor.experience}</p>
                          <p className="text-sm text-muted-foreground">
                            Next available: {new Date(doctor.nextAvailable).toLocaleDateString()}
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {doctor.availability.slice(0, 3).map((time) => (
                              <Badge key={time} variant="outline" className="text-xs">
                                {time}
                              </Badge>
                            ))}
                            {doctor.availability.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{doctor.availability.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Select Date & Time */}
          {step === 3 && selectedDoctor && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">Select Date & Time</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="preferredDate">Preferred Date *</Label>
                      <Input
                        id="preferredDate"
                        type="date"
                        min={getMinDate()}
                        value={formData.preferredDate}
                        onChange={(e) => setFormData((prev) => ({ ...prev, preferredDate: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Available Time Slots</Label>
                      <div className="grid grid-cols-2 gap-2">
                        {selectedDoctor.availability.map((time) => (
                          <Button
                            key={time}
                            type="button"
                            variant={formData.preferredTime === time ? "default" : "outline"}
                            size="sm"
                            onClick={() => setFormData((prev) => ({ ...prev, preferredTime: time }))}
                          >
                            <Clock className="h-4 w-4 mr-2" />
                            {time}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div>
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Appointment Summary</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{selectedDoctor.name}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Stethoscope className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{selectedDoctor.specialty}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {formData.preferredDate
                              ? new Date(formData.preferredDate).toLocaleDateString()
                              : "Select date"}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{formData.preferredTime || "Select time"}</span>
                        </div>
                        <div className="pt-2 border-t">
                          <p className="text-sm font-medium">Type: {formData.appointmentType}</p>
                          <p className="text-sm text-muted-foreground">Reason: {formData.reason}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-between pt-6">
            <Button type="button" variant="outline" onClick={step === 1 ? () => onOpenChange(false) : handleBack}>
              {step === 1 ? "Cancel" : "Back"}
            </Button>
            <div className="space-x-2">
              {step < 3 ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={
                    (step === 1 && (!formData.reason || !formData.appointmentType)) || (step === 2 && !selectedDoctor)
                  }
                >
                  Next
                </Button>
              ) : (
                <Button type="submit" disabled={isLoading || !formData.preferredDate || !formData.preferredTime}>
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                      <span>Booking...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <CalendarPlus className="h-4 w-4" />
                      <span>Book Appointment</span>
                    </div>
                  )}
                </Button>
              )}
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
