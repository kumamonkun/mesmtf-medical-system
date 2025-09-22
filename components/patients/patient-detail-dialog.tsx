"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Heart, 
  AlertTriangle, 
  FileText,
  Edit,
  Trash2
} from "lucide-react"

interface Patient {
  id: string
  patient_id: string
  first_name: string
  last_name: string
  date_of_birth: string
  gender: 'male' | 'female' | 'other'
  phone: string
  email: string
  address: string
  emergency_contact_name: string
  emergency_contact_phone: string
  medical_history: string
  allergies: string
  blood_type?: string
  chronic_conditions?: string
  created_at: string
  updated_at: string
}

interface PatientDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  patient: Patient | null
  onEdit?: (patient: Patient) => void
  onDelete?: (patient: Patient) => void
}

export function PatientDetailDialog({ 
  open, 
  onOpenChange, 
  patient, 
  onEdit, 
  onDelete 
}: PatientDetailDialogProps) {
  if (!patient) return null

  const calculateAge = (dateOfBirth: string) => {
    const birthDate = new Date(dateOfBirth)
    const age = Math.floor((Date.now() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25))
    return age
  }

  const getStatusBadge = (patient: Patient) => {
    const lastUpdate = new Date(patient.updated_at || patient.created_at)
    const daysSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24)
    
    if (daysSinceUpdate < 7) {
      return <Badge variant="default" className="bg-green-100 text-green-800">Active</Badge>
    } else if (daysSinceUpdate < 30) {
      return <Badge variant="secondary">Inactive</Badge>
    } else {
      return <Badge variant="destructive">Critical</Badge>
    }
  }

  const allergies = patient.allergies ? patient.allergies.split(',').map(a => a.trim()).filter(Boolean) : []
  const chronicConditions = patient.chronic_conditions ? patient.chronic_conditions.split(',').map(c => c.trim()).filter(Boolean) : []

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Patient Details
              </DialogTitle>
              <DialogDescription>
                Complete information for {patient.first_name} {patient.last_name}
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              {getStatusBadge(patient)}
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit?.(patient)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete?.(patient)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Patient ID</label>
                  <p className="font-mono text-sm">{patient.patient_id}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Full Name</label>
                  <p className="font-medium">{patient.first_name} {patient.last_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Date of Birth</label>
                  <p className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(patient.date_of_birth).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Age</label>
                  <p>{calculateAge(patient.date_of_birth)} years old</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Gender</label>
                  <p className="capitalize">{patient.gender}</p>
                </div>
                {patient.blood_type && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Blood Type</label>
                    <p className="flex items-center gap-1">
                      <Heart className="h-3 w-3" />
                      {patient.blood_type}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Phone</label>
                  <p className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {patient.phone}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {patient.email || 'Not provided'}
                  </p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Address</label>
                <p className="flex items-start gap-1">
                  <MapPin className="h-3 w-3 mt-0.5" />
                  {patient.address}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Emergency Contact
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Emergency Contact Name</label>
                  <p>{patient.emergency_contact_name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Emergency Contact Phone</label>
                  <p className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {patient.emergency_contact_phone}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Medical Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Medical Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {patient.medical_history && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Medical History</label>
                  <p className="mt-1 text-sm">{patient.medical_history}</p>
                </div>
              )}

              {allergies.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Allergies</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {allergies.map((allergy, index) => (
                      <Badge key={index} variant="destructive" className="bg-red-100 text-red-800">
                        {allergy}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {chronicConditions.length > 0 && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Chronic Conditions</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {chronicConditions.map((condition, index) => (
                      <Badge key={index} variant="outline" className="border-orange-200 text-orange-800">
                        {condition}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* System Information */}
          <Card>
            <CardHeader>
              <CardTitle>System Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Created</label>
                  <p>{new Date(patient.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                  <p>{new Date(patient.updated_at).toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator />

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={() => onEdit?.(patient)}>
            Edit Patient
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
