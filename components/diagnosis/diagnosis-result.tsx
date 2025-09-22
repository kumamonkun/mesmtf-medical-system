"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Brain, AlertTriangle, CheckCircle, Pill, FileText, Download, Calendar, RotateCcw } from "lucide-react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

interface DiagnosisResultProps {
  result: any
  onReset: () => void
  user: any
}

export function DiagnosisResult({ result, onReset, user }: DiagnosisResultProps) {
  const [showFullReport, setShowFullReport] = useState(false)
  const router = useRouter()

  const getDiagnosisColor = (diagnosis: string) => {
    if (diagnosis.includes("Malaria")) return "bg-red-100 text-red-700 border-red-200"
    if (diagnosis.includes("Typhoid")) return "bg-orange-100 text-orange-700 border-orange-200"
    if (diagnosis.includes("Co-infection")) return "bg-purple-100 text-purple-700 border-purple-200"
    return "bg-gray-100 text-gray-700 border-gray-200"
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "text-green-600"
    if (confidence >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const handleBookAppointment = () => {
    // Navigate to appointment booking page
    router.push('/appointments')
    toast.success('Redirecting to appointment booking...')
  }

  const handleSaveReport = async () => {
    try {
      // Save diagnosis report to medical records
      const reportData = {
        ...result,
        savedAt: new Date().toISOString(),
        savedBy: user.username,
      }
      
      const response = await fetch('/api/medical-reports', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          patient_id: null, // Self-diagnosis
          report_type: 'diagnosis',
          title: `AI Diagnosis Report - ${result.primaryDiagnosis}`,
          content: JSON.stringify(reportData),
          generated_by: user.id
        })
      })

      if (response.ok) {
        toast.success('Diagnosis report saved to medical records')
      } else {
        toast.error('Failed to save report')
      }
    } catch (error) {
      console.error('Error saving report:', error)
      toast.error('Failed to save report')
    }
  }

  return (
    <div className="space-y-6">
      {/* Main Diagnosis Result */}
      <Card className={`border-2 ${getDiagnosisColor(result.primaryDiagnosis)}`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center text-xl">
              <Brain className="h-6 w-6 mr-2" />
              AI Diagnosis Result
            </CardTitle>
            <Badge variant="secondary" className="text-sm">
              {new Date(result.timestamp).toLocaleString()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold">{result.primaryDiagnosis}</h2>
            <div className="flex items-center justify-center space-x-2">
              <span className="text-sm text-muted-foreground">Confidence Level:</span>
              <span className={`text-lg font-semibold ${getConfidenceColor(result.confidence)}`}>
                {result.confidence}%
              </span>
            </div>
            <Progress value={result.confidence} className="w-full max-w-md mx-auto" />
          </div>

          {result.confidence < 70 && (
            <Card className="border-amber-200 bg-amber-50">
              <CardContent className="pt-4">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-amber-800">Low Confidence Warning</h4>
                    <p className="text-sm text-amber-700">
                      The AI system has low confidence in this diagnosis. Please consult with a healthcare professional
                      for proper evaluation.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Diagnostic Scores */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <div className="h-4 w-4 bg-red-500 rounded-full mr-2" />
              Malaria Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{result.malariaScore}</div>
            <Progress value={(result.malariaScore / 50) * 100} className="mt-2" />
            <p className="text-sm text-muted-foreground mt-2">Based on symptom analysis</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <div className="h-4 w-4 bg-orange-500 rounded-full mr-2" />
              Typhoid Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{result.typhoidScore}</div>
            <Progress value={(result.typhoidScore / 50) * 100} className="mt-2" />
            <p className="text-sm text-muted-foreground mt-2">Based on symptom analysis</p>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
            Medical Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {result.requiresXray && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-4">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-red-800">Chest X-ray Required</h4>
                    <p className="text-sm text-red-700">
                      Very strong signs detected. Chest X-ray is recommended in addition to drug administration.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-2">
            <h4 className="font-semibold">Treatment Recommendations:</h4>
            <ul className="space-y-2">
              {result.recommendations.map((rec: string, index: number) => (
                <li key={index} className="flex items-start space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Medications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Pill className="h-5 w-5 mr-2 text-blue-600" />
            Recommended Medications
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {result.medications.map((medication: string, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Pill className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">{medication}</span>
                </div>
                <Badge variant="outline">As prescribed</Badge>
              </div>
            ))}
          </div>
          <Card className="mt-4 border-amber-200 bg-amber-50">
            <CardContent className="pt-4">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-amber-800">Medication Disclaimer</h4>
                  <p className="text-sm text-amber-700">
                    These are AI-generated recommendations. Always consult with a qualified healthcare provider before
                    taking any medication. Dosage and administration should be determined by a medical professional.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* Detailed Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              Detailed Analysis
            </span>
            <Button variant="outline" size="sm" onClick={() => setShowFullReport(!showFullReport)}>
              {showFullReport ? "Hide Details" : "Show Details"}
            </Button>
          </CardTitle>
        </CardHeader>
        {showFullReport && (
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">Patient Information</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Age:</span> {result.patientInfo.age} years
                </div>
                <div>
                  <span className="text-muted-foreground">Gender:</span> {result.patientInfo.gender}
                </div>
                <div>
                  <span className="text-muted-foreground">Temperature:</span> {result.patientInfo.temperature}°C
                </div>
                <div>
                  <span className="text-muted-foreground">Duration:</span> {result.patientInfo.duration}
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-semibold mb-2">Analyzed Symptoms</h4>
              <div className="space-y-2">
                {result.selectedSymptoms.map((symptom: any) => (
                  <div key={symptom.id} className="flex items-center justify-between p-2 border rounded">
                    <span className="text-sm">{symptom.name}</span>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        Weight: {symptom.weight}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {symptom.category}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {result.patientInfo.additionalInfo && (
              <>
                <Separator />
                <div>
                  <h4 className="font-semibold mb-2">Additional Information</h4>
                  <p className="text-sm text-muted-foreground">{result.patientInfo.additionalInfo}</p>
                </div>
              </>
            )}
          </CardContent>
        )}
      </Card>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 justify-center">
        <Button onClick={handleBookAppointment} className="flex items-center space-x-2">
          <Calendar className="h-4 w-4" />
          <span>Book Appointment</span>
        </Button>
        {user.role !== "patient" && (
          <Button onClick={handleSaveReport} variant="outline" className="flex items-center space-x-2 bg-transparent">
            <FileText className="h-4 w-4" />
            <span>Save to Records</span>
          </Button>
        )}
        <Button variant="outline" className="flex items-center space-x-2 bg-transparent">
          <Download className="h-4 w-4" />
          <span>Download Report</span>
        </Button>
        <Button onClick={onReset} variant="outline" className="flex items-center space-x-2 bg-transparent">
          <RotateCcw className="h-4 w-4" />
          <span>New Diagnosis</span>
        </Button>
      </div>
    </div>
  )
}
