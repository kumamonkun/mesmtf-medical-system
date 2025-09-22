"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DataTable, type Column } from "@/components/common/data-table"
import { SymptomChecker } from "./symptom-checker"
import { DiagnosisHistory } from "./diagnosis-history"
import { ExpertSystemRules } from "./expert-system-rules"
import { InterfaceSelector } from "./interface-selector"
import { AIDiagnosisChatbot } from "./ai-diagnosis-chatbot"
import { useMedicalRecords } from "@/hooks/use-api"
import { Brain, Stethoscope, History, Settings, AlertTriangle, CheckCircle, Clock, MessageCircle, FileText } from "lucide-react"
import { type MedicalRecord } from "@/lib/types/api"

interface DiagnosisViewProps {
  user: any
}

export function DiagnosisView({ user }: DiagnosisViewProps) {
  const [activeTab, setActiveTab] = useState("checker")
  const [selectedInterface, setSelectedInterface] = useState<'chatbot' | 'form' | null>(null)
  const [diagnosisResult, setDiagnosisResult] = useState<any>(null)

  // Use the new API hook for medical records
  const { data: medicalRecordsData, loading, error, execute: fetchRecords } = useMedicalRecords()

  // Define columns for the medical records table
  const medicalRecordColumns: Column<MedicalRecord>[] = [
    {
      key: 'title',
      label: 'Title',
      sortable: true,
      render: (value, row) => (
        <div className="font-medium">{value}</div>
      )
    },
    {
      key: 'patient.first_name',
      label: 'Patient',
      sortable: true,
      render: (value, row) => (
        <div>
          {row.patient ? `${row.patient.first_name} ${row.patient.last_name}` : 'N/A'}
        </div>
      )
    },
    {
      key: 'record_type',
      label: 'Type',
      sortable: true,
      render: (value) => (
        <span className="capitalize bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
          {value.replace('_', ' ')}
        </span>
      )
    },
    {
      key: 'visit_date',
      label: 'Visit Date',
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString()
    },
    {
      key: 'priority',
      label: 'Priority',
      sortable: true,
      render: (value) => {
        const colors = {
          low: 'bg-green-100 text-green-800',
          medium: 'bg-yellow-100 text-yellow-800',
          high: 'bg-orange-100 text-orange-800',
          urgent: 'bg-red-100 text-red-800'
        }
        return value ? (
          <span className={`px-2 py-1 rounded text-xs ${colors[value as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
            {value}
          </span>
        ) : '-'
      }
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (value) => {
        const colors = {
          draft: 'bg-gray-100 text-gray-800',
          active: 'bg-green-100 text-green-800',
          archived: 'bg-blue-100 text-blue-800',
          deleted: 'bg-red-100 text-red-800'
        }
        return (
          <span className={`px-2 py-1 rounded text-xs ${colors[value as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
            {value}
          </span>
        )
      }
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (value, row) => (
        <div className="flex space-x-2">
          <Button size="sm" variant="outline">
            View
          </Button>
          <Button size="sm" variant="outline">
            Edit
          </Button>
        </div>
      )
    }
  ]

  const handleInterfaceSelect = (interfaceType: 'chatbot' | 'form') => {
    setSelectedInterface(interfaceType)
  }

  const handleDiagnosisComplete = (result: any) => {
    setDiagnosisResult(result)
    // Refresh medical records after new diagnosis
    fetchRecords()
  }

  const resetInterface = () => {
    setSelectedInterface(null)
    setDiagnosisResult(null)
  }

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">AI Diagnosis System</h1>
            <p className="text-muted-foreground">
              Advanced medical diagnosis powered by AI and expert systems
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Interface Selection */}
        {!selectedInterface ? (
          <InterfaceSelector onSelectInterface={handleInterfaceSelect} user={user} />
        ) : (
          <div className="space-y-6">
            {/* Interface Header */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {selectedInterface === 'chatbot' ? (
                      <>
                        <div className="p-2 bg-blue-100 rounded-full">
                          <MessageCircle className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">AI Chat Assistant</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            Powered by DeepSeek AI - Natural conversation for diagnosis
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="p-2 bg-green-100 rounded-full">
                          <FileText className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">Multi-Step Form</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            Structured form for comprehensive symptom analysis
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={resetInterface}>
                      Switch Method
                    </Button>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Interface Content */}
            {selectedInterface === 'chatbot' ? (
              <AIDiagnosisChatbot
                user={user}
                onDiagnosisComplete={handleDiagnosisComplete}
              />
            ) : (
              <SymptomChecker user={user} />
            )}

            {/* Diagnosis Result */}
            {diagnosisResult && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <span>Diagnosis Result</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-lg">{diagnosisResult.diagnosis}</h4>
                      <p className="text-muted-foreground">{diagnosisResult.description}</p>
                    </div>
                    {diagnosisResult.confidence && (
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">Confidence:</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${diagnosisResult.confidence}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground">{diagnosisResult.confidence}%</span>
                      </div>
                    )}
                    {diagnosisResult.recommendations && (
                      <div>
                        <h5 className="font-semibold mb-2">Recommendations:</h5>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          {diagnosisResult.recommendations.map((rec: string, index: number) => (
                            <li key={index}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="checker" className="flex items-center space-x-2">
              <Stethoscope className="h-4 w-4" />
              <span>Symptom Checker</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center space-x-2">
              <History className="h-4 w-4" />
              <span>History</span>
            </TabsTrigger>
            <TabsTrigger value="rules" className="flex items-center space-x-2">
              <Brain className="h-4 w-4" />
              <span>Expert Rules</span>
            </TabsTrigger>
            <TabsTrigger value="records" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Medical Records</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="checker">
            <SymptomChecker user={user} />
          </TabsContent>

          <TabsContent value="history">
            <DiagnosisHistory user={user} />
          </TabsContent>

          <TabsContent value="rules">
            <ExpertSystemRules />
          </TabsContent>

          <TabsContent value="records">
            <DataTable
              data={medicalRecordsData?.data?.medicalRecords || []}
              columns={medicalRecordColumns}
              loading={loading}
              searchable
              filterable
              pagination={medicalRecordsData?.data?.pagination ? {
                page: medicalRecordsData.data.pagination.page,
                limit: medicalRecordsData.data.pagination.limit,
                total: medicalRecordsData.data.pagination.total,
                totalPages: medicalRecordsData.data.pagination.totalPages,
                onPageChange: (page) => fetchRecords({ page }),
                onLimitChange: (limit) => fetchRecords({ limit })
              } : undefined}
              onRefresh={() => fetchRecords()}
              searchPlaceholder="Search medical records..."
              emptyMessage="No medical records found"
            />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
