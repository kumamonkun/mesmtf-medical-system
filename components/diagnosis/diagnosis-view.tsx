"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SymptomChecker } from "./symptom-checker"
import { SimpleInterfaceSelector } from "./simple-interface-selector"
import { SimpleChatbot } from "./simple-chatbot"
import { Brain, Stethoscope, History, Settings, AlertTriangle, CheckCircle, FileText, MessageCircle } from "lucide-react"

interface DiagnosisViewProps {
  user: any
}

export function DiagnosisView({ user }: DiagnosisViewProps) {
  const [selectedInterface, setSelectedInterface] = useState<'chatbot' | 'form' | null>(null)
  const [diagnosisResult, setDiagnosisResult] = useState<any>(null)

  const getSidebarItems = () => {
    const baseItems = [{ icon: <Brain className="h-4 w-4" />, label: "AI Diagnosis", href: "/diagnosis", active: true }]

    if (user.role === "patient") {
      return [
        { icon: <Stethoscope className="h-4 w-4" />, label: "Symptom Checker", href: "/diagnosis", active: true },
        { icon: <History className="h-4 w-4" />, label: "My Diagnoses", href: "/diagnosis-history" },
      ]
    }

    return [
      ...baseItems,
      { icon: <History className="h-4 w-4" />, label: "Diagnosis History", href: "/diagnosis-history" },
      { icon: <Settings className="h-4 w-4" />, label: "Expert System Rules", href: "/expert-rules" },
    ]
  }

  const handleInterfaceSelect = (interfaceType: 'chatbot' | 'form') => {
    setSelectedInterface(interfaceType)
    setDiagnosisResult(null) // Reset any previous results
  }

  const handleDiagnosisComplete = (result: any) => {
    setDiagnosisResult(result)
    // You can add additional logic here, like saving to database
  }

  const resetInterface = () => {
    setSelectedInterface(null)
    setDiagnosisResult(null)
  }

  return (
    <DashboardLayout user={user} sidebarItems={getSidebarItems()}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-balance">AI Medical Diagnosis System</h1>
          <p className="text-muted-foreground">
            Expert system for Malaria and Typhoid Fever diagnosis using rule-based artificial intelligence
          </p>
        </div>


        {/* Important Notice */}
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <h3 className="font-semibold text-amber-800">Medical Disclaimer</h3>
                <p className="text-sm text-amber-700 mt-1">
                  This AI diagnosis system is designed to assist healthcare professionals and provide preliminary
                  assessments. It should not replace professional medical consultation. Always consult with a qualified
                  healthcare provider for proper diagnosis and treatment.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        {!selectedInterface ? (
          <SimpleInterfaceSelector onSelectInterface={handleInterfaceSelect} user={user} />
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
                          <CardTitle className="text-lg">The Diagnosis Machine</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            Chat with AI for health guidance and symptom analysis
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
              <SimpleChatbot user={user} />
            ) : (
              <SymptomChecker user={user} />
            )}

            {/* Diagnosis Result Display */}
            {diagnosisResult && (
              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="flex items-center text-green-800">
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Diagnosis Complete
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p><strong>Result:</strong> {diagnosisResult.primaryDiagnosis}</p>
                    <p><strong>Confidence:</strong> {diagnosisResult.confidence}%</p>
                    {diagnosisResult.recommendations && (
                      <div>
                        <strong>Recommendations:</strong>
                        <ul className="list-disc list-inside mt-1">
                          {diagnosisResult.recommendations.map((rec: string, index: number) => (
                            <li key={index} className="text-sm">{rec}</li>
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

      </div>
    </DashboardLayout>
  )
}
