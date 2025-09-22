"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CheckCircle, FileText, Calendar, Eye, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface TreatmentHistoryRecord {
  id: string
  patientName: string
  patientId: string
  diagnosis: string
  doctorName: string
  treatmentDate: string
  outcome: "successful" | "partial" | "unsuccessful"
  duration: string
  medications: string[]
  notes: string
}

interface TreatmentHistoryProps {
  searchTerm: string
}

export function TreatmentHistory({ searchTerm }: TreatmentHistoryProps) {
  const [treatmentHistory, setTreatmentHistory] = useState<TreatmentHistoryRecord[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchTreatmentHistory()
  }, [])

  const fetchTreatmentHistory = async () => {
    try {
      setLoading(true)
      
      // Fetch treatment records with patient and doctor information
      const { data: treatments, error } = await supabase
        .from('treatments')
        .select(`
          id,
          patient_id,
          diagnosis_id,
          doctor_id,
          treatment_date,
          outcome,
          duration_days,
          notes,
          patients!inner(
            patient_id,
            first_name,
            last_name
          ),
          diagnoses!inner(
            diagnosis_name
          ),
          user_profiles!treatments_doctor_id_fkey(
            first_name,
            last_name
          )
        `)
        .order('treatment_date', { ascending: false })

      if (error) {
        console.error('Error fetching treatment history:', error)
        return
      }

      // Transform the data to match our interface
      const transformedData: TreatmentHistoryRecord[] = treatments?.map(treatment => ({
        id: treatment.id,
        patientName: `${treatment.patients.first_name} ${treatment.patients.last_name}`,
        patientId: treatment.patients.patient_id,
        diagnosis: treatment.diagnoses.diagnosis_name,
        doctorName: `Dr. ${treatment.user_profiles.first_name} ${treatment.user_profiles.last_name}`,
        treatmentDate: new Date(treatment.treatment_date).toLocaleDateString(),
        outcome: treatment.outcome as "successful" | "partial" | "unsuccessful",
        duration: `${treatment.duration_days} days`,
        medications: [], // This would need to be fetched from prescriptions table
        notes: treatment.notes || ''
      })) || []

      setTreatmentHistory(transformedData)
    } catch (error) {
      console.error('Error fetching treatment history:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredHistory = treatmentHistory.filter(
    (record) =>
      record.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.doctorName.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case "successful":
        return "default"
      case "partial":
        return "secondary"
      case "unsuccessful":
        return "destructive"
      default:
        return "secondary"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading treatment history...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* History Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Successful</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {treatmentHistory.filter((h) => h.outcome === "successful").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{treatmentHistory.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {treatmentHistory.length > 0 ? Math.round(
                (treatmentHistory.filter((h) => h.outcome === "successful").length / treatmentHistory.length) * 100,
              ) : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Treatment History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Treatment History</CardTitle>
          <CardDescription>Review completed treatment records and outcomes</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredHistory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No treatment records found.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Patient</TableHead>
                  <TableHead>Diagnosis</TableHead>
                  <TableHead>Doctor</TableHead>
                  <TableHead>Treatment Date</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Outcome</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredHistory.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{record.patientName}</div>
                        <div className="text-sm text-muted-foreground">{record.patientId}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{record.diagnosis}</Badge>
                    </TableCell>
                    <TableCell>{record.doctorName}</TableCell>
                    <TableCell>{record.treatmentDate}</TableCell>
                    <TableCell>{record.duration}</TableCell>
                    <TableCell>
                      <Badge variant={getOutcomeColor(record.outcome) as any}>{record.outcome}</Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
