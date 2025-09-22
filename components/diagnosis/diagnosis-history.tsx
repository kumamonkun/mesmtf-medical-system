"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { History, Search, Calendar, Brain, FileText, Eye } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { Skeleton } from "@/components/ui/skeleton"

interface DiagnosisHistoryProps {
  user: any
}

export function DiagnosisHistory({ user }: DiagnosisHistoryProps) {
  const { profile } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [diagnosisHistory, setDiagnosisHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch diagnosis history from database
  useEffect(() => {
    const fetchDiagnosisHistory = async () => {
      try {
        setLoading(true)
        const response = await fetch('/api/diagnoses')
        
        if (!response.ok) {
          throw new Error('Failed to fetch diagnosis history')
        }
        
        const data = await response.json()
        setDiagnosisHistory(data)
      } catch (err) {
        console.error('Error fetching diagnosis history:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch data')
      } finally {
        setLoading(false)
      }
    }

    fetchDiagnosisHistory()
  }, [])

  // Mock diagnosis history data (fallback)
  const mockDiagnosisHistory = [
    {
      id: "1",
      patientName: user.role === "patient" ? user.username : "John Doe",
      patientId: "P-2025-001",
      date: "2025-09-20",
      time: "14:30",
      diagnosis: "Malaria (P. falciparum)",
      confidence: 92,
      symptoms: ["High fever", "Chills", "Headache", "Nausea"],
      status: "Confirmed",
      treatedBy: "Dr. Sarah Johnson",
    },
    {
      id: "2",
      patientName: user.role === "patient" ? user.username : "Mary Smith",
      patientId: "P-2025-015",
      date: "2025-09-18",
      time: "10:15",
      diagnosis: "Typhoid Fever",
      confidence: 88,
      symptoms: ["Persistent fever", "Abdominal pain", "Headache"],
      status: "Under Treatment",
      treatedBy: "Dr. Michael Chen",
    },
    {
      id: "3",
      patientName: user.role === "patient" ? user.username : "Robert Johnson",
      patientId: "P-2025-032",
      date: "2025-09-15",
      time: "16:45",
      diagnosis: "Inconclusive",
      confidence: 45,
      symptoms: ["Mild fever", "Fatigue"],
      status: "Referred",
      treatedBy: "Dr. Emily Rodriguez",
    },
    {
      id: "4",
      patientName: user.role === "patient" ? user.username : "Lisa Wilson",
      patientId: "P-2025-089",
      date: "2025-09-12",
      time: "09:20",
      diagnosis: "Possible Co-infection (Malaria + Typhoid)",
      confidence: 85,
      symptoms: ["High fever", "Abdominal pain", "Chills", "Vomiting"],
      status: "Recovered",
      treatedBy: "Dr. James Wilson",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Confirmed":
        return "bg-green-100 text-green-700"
      case "Under Treatment":
        return "bg-blue-100 text-blue-700"
      case "Recovered":
        return "bg-gray-100 text-gray-700"
      case "Referred":
        return "bg-yellow-100 text-yellow-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const getDiagnosisColor = (diagnosis: string) => {
    if (diagnosis.includes("Malaria")) return "bg-red-100 text-red-700"
    if (diagnosis.includes("Typhoid")) return "bg-orange-100 text-orange-700"
    if (diagnosis.includes("Co-infection")) return "bg-purple-100 text-purple-700"
    return "bg-gray-100 text-gray-700"
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "text-green-600"
    if (confidence >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  // Process diagnosis data for display
  const processedHistory = diagnosisHistory.map((record) => {
    const expertResult = record.expert_system_result ? JSON.parse(record.expert_system_result) : {}
    return {
      id: record.id,
      patientName: record.patients?.first_name && record.patients?.last_name 
        ? `${record.patients.first_name} ${record.patients.last_name}` 
        : 'Unknown Patient',
      patientId: record.patients?.patient_id || 'N/A',
      date: new Date(record.created_at).toISOString().split('T')[0],
      time: new Date(record.created_at).toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      diagnosis: record.diagnosis || 'Pending',
      confidence: record.confidence_level || 0,
      symptoms: record.symptoms || [],
      status: record.diagnosis ? 'Confirmed' : 'Pending',
      treatedBy: record.doctors?.first_name && record.doctors?.last_name
        ? `Dr. ${record.doctors.first_name} ${record.doctors.last_name}`
        : 'AI System',
      expertResult
    }
  })

  const filteredHistory = processedHistory.filter((record) => {
    const matchesSearch =
      record.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.patientId.toLowerCase().includes(searchTerm.toLowerCase())

    if (filterStatus === "all") return matchesSearch
    return matchesSearch && record.status === filterStatus
  })

  if (loading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-8 mb-2" />
                <Skeleton className="h-3 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <History className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Diagnosis History</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <History className="h-5 w-5 mr-2" />
            {user.role === "patient" ? "My Diagnosis History" : "Patient Diagnosis History"}
          </CardTitle>
          <CardDescription>
            {user.role === "patient"
              ? "View your previous AI diagnosis results"
              : "Review AI diagnosis history for all patients"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={
                    user.role === "patient" ? "Search your diagnoses..." : "Search by patient name, ID, or diagnosis..."
                  }
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Confirmed">Confirmed</SelectItem>
                <SelectItem value="Under Treatment">Under Treatment</SelectItem>
                <SelectItem value="Recovered">Recovered</SelectItem>
                <SelectItem value="Referred">Referred</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Diagnoses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{processedHistory.length}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Malaria Cases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {processedHistory.filter((d) => d.diagnosis.includes("Malaria")).length}
            </div>
            <p className="text-xs text-muted-foreground">Diagnosed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Typhoid Cases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {processedHistory.filter((d) => d.diagnosis.includes("Typhoid")).length}
            </div>
            <p className="text-xs text-muted-foreground">Diagnosed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Confidence</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {processedHistory.length > 0 
                ? Math.round(processedHistory.reduce((acc, d) => acc + d.confidence, 0) / processedHistory.length)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">AI accuracy</p>
          </CardContent>
        </Card>
      </div>

      {/* Diagnosis History List */}
      <div className="space-y-4">
        {filteredHistory.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <div className="text-center">
                <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No diagnosis history found</h3>
                <p className="text-muted-foreground">
                  {searchTerm ? "Try adjusting your search criteria" : "No diagnoses have been recorded yet"}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredHistory.map((record) => (
            <Card key={record.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <Brain className="h-6 w-6 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg font-semibold">
                          {user.role === "patient" ? "My Diagnosis" : record.patientName}
                        </h3>
                        <Badge className={getStatusColor(record.status)}>{record.status}</Badge>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(record.date).toLocaleDateString()} at {record.time}
                        </span>
                        {user.role !== "patient" && (
                          <span className="flex items-center">
                            <FileText className="h-4 w-4 mr-1" />
                            {record.patientId}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getDiagnosisColor(record.diagnosis)}>{record.diagnosis}</Badge>
                        <span className={`text-sm font-medium ${getConfidenceColor(record.confidence)}`}>
                          {record.confidence}% confidence
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {record.symptoms.slice(0, 3).map((symptom, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {symptom}
                          </Badge>
                        ))}
                        {record.symptoms.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{record.symptoms.length - 3} more
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">Treated by: {record.treatedBy}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                    {user.role !== "patient" && (
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
