"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { DiagnosisResult } from "./diagnosis-result"
import { Brain, Search, AlertTriangle, Thermometer, Activity, Zap } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"

interface Symptom {
  id: string
  name: string
  category: "VSs" | "Ss" | "Ws" | "VWs" // Very Strong, Strong, Weak, Very Weak
  weight: number
  diseases: ("malaria" | "typhoid" | "both")[]
}

interface PatientInfo {
  age: string
  gender: string
  weight: string
  temperature: string
  duration: string
  additionalInfo: string
}

interface SymptomCheckerProps {
  user: any
}

export function SymptomChecker({ user }: SymptomCheckerProps) {
  const { profile } = useAuth()
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([])
  const [patientInfo, setPatientInfo] = useState<PatientInfo>({
    age: "",
    gender: "",
    weight: "",
    temperature: "",
    duration: "",
    additionalInfo: "",
  })
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [diagnosisResult, setDiagnosisResult] = useState<any>(null)
  const [currentStep, setCurrentStep] = useState(1)

  // Symptom database based on the requirements
  const symptoms: Symptom[] = [
    // Very Strong Signs (VSs) - Malaria
    { id: "abdominal_pain_m", name: "Abdominal pain", category: "VSs", weight: 10, diseases: ["malaria"] },
    { id: "vomiting_m", name: "Vomiting", category: "VSs", weight: 10, diseases: ["malaria"] },
    { id: "sore_throat_m", name: "Sore throat", category: "VSs", weight: 10, diseases: ["malaria"] },

    // Very Strong Signs (VSs) - Typhoid
    { id: "abdominal_pain_t", name: "Abdominal pain", category: "VSs", weight: 10, diseases: ["typhoid"] },
    { id: "stomach_issues", name: "Stomach issues", category: "VSs", weight: 10, diseases: ["typhoid"] },

    // Strong Signs (Ss) - Malaria
    { id: "headache_m", name: "Headache", category: "Ss", weight: 8, diseases: ["malaria"] },
    { id: "fatigue_m", name: "Fatigue", category: "Ss", weight: 8, diseases: ["malaria"] },
    { id: "cough_m", name: "Cough", category: "Ss", weight: 8, diseases: ["malaria"] },
    { id: "constipation_m", name: "Constipation", category: "Ss", weight: 8, diseases: ["malaria"] },

    // Strong Signs (Ss) - Typhoid
    { id: "headache_t", name: "Headache", category: "Ss", weight: 8, diseases: ["typhoid"] },
    { id: "persistent_fever", name: "Persistent high fever", category: "Ss", weight: 8, diseases: ["typhoid"] },

    // Weak Signs (Ws) - Malaria
    { id: "chest_pain_m", name: "Chest pain", category: "Ws", weight: 5, diseases: ["malaria"] },
    { id: "back_pain_m", name: "Back pain", category: "Ws", weight: 5, diseases: ["malaria"] },
    { id: "muscle_pain_m", name: "Muscle pain", category: "Ws", weight: 5, diseases: ["malaria"] },

    // Weak Signs (Ws) - Typhoid
    { id: "weakness_t", name: "Weakness", category: "Ws", weight: 5, diseases: ["typhoid"] },
    { id: "tiredness_t", name: "Tiredness", category: "Ws", weight: 5, diseases: ["typhoid"] },

    // Very Weak Signs (VWs) - Malaria
    { id: "diarrhea_m", name: "Diarrhea", category: "VWs", weight: 3, diseases: ["malaria"] },
    { id: "sweating_m", name: "Sweating", category: "VWs", weight: 3, diseases: ["malaria"] },
    { id: "rash_m", name: "Rash", category: "VWs", weight: 3, diseases: ["malaria"] },
    { id: "loss_appetite_m", name: "Loss of appetite", category: "VWs", weight: 3, diseases: ["malaria"] },

    // Very Weak Signs (VWs) - Typhoid
    { id: "rash_t", name: "Rash", category: "VWs", weight: 3, diseases: ["typhoid"] },
    { id: "loss_appetite_t", name: "Loss of appetite", category: "VWs", weight: 3, diseases: ["typhoid"] },

    // Common symptoms
    { id: "high_fever", name: "High fever (>38.5°C)", category: "Ss", weight: 9, diseases: ["both"] },
    { id: "chills", name: "Chills", category: "Ss", weight: 7, diseases: ["both"] },
    { id: "nausea", name: "Nausea", category: "Ws", weight: 6, diseases: ["both"] },
  ]

  const handleSymptomToggle = (symptomId: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptomId) ? prev.filter((id) => id !== symptomId) : [...prev, symptomId],
    )
  }

  const runDiagnosis = async () => {
    setIsAnalyzing(true)

    // Simulate AI processing
    await new Promise((resolve) => setTimeout(resolve, 3000))

    // Expert system logic
    const selectedSymptomData = symptoms.filter((s) => selectedSymptoms.includes(s.id))

    let malariaScore = 0
    let typhoidScore = 0
    let requiresXray = false

    selectedSymptomData.forEach((symptom) => {
      if (symptom.diseases.includes("malaria") || symptom.diseases.includes("both")) {
        malariaScore += symptom.weight
      }
      if (symptom.diseases.includes("typhoid") || symptom.diseases.includes("both")) {
        typhoidScore += symptom.weight
      }

      // Check if Very Strong Signs require X-ray
      if (symptom.category === "VSs") {
        requiresXray = true
      }
    })

    // Temperature factor
    const temp = Number.parseFloat(patientInfo.temperature)
    if (temp > 38.5) {
      malariaScore += 5
      typhoidScore += 5
    }
    if (temp > 40) {
      malariaScore += 8
      typhoidScore += 8
    }

    // Determine diagnosis
    let primaryDiagnosis = "Inconclusive"
    let confidence = 0
    let recommendations: string[] = []
    let medications: string[] = []

    if (malariaScore > typhoidScore && malariaScore >= 15) {
      primaryDiagnosis = "Malaria"
      confidence = Math.min(95, (malariaScore / 30) * 100)
      recommendations = [
        "Immediate antimalarial treatment recommended",
        "Monitor temperature and fluid intake",
        "Rest and avoid strenuous activities",
      ]
      medications = ["Artemether-Lumefantrine 20mg/120mg", "Paracetamol 500mg for fever"]

      if (requiresXray) {
        recommendations.unshift("Chest X-ray required due to severe symptoms")
      }
    } else if (typhoidScore > malariaScore && typhoidScore >= 15) {
      primaryDiagnosis = "Typhoid Fever"
      confidence = Math.min(95, (typhoidScore / 30) * 100)
      recommendations = [
        "Antibiotic treatment required",
        "Maintain proper hydration",
        "Strict hygiene measures",
        "Monitor for complications",
      ]
      medications = ["Ciprofloxacin 500mg", "ORS for hydration", "Paracetamol 500mg for fever"]

      if (requiresXray) {
        recommendations.unshift("Chest X-ray required due to severe symptoms")
      }
    } else if (malariaScore >= 10 && typhoidScore >= 10) {
      primaryDiagnosis = "Possible Co-infection (Malaria + Typhoid)"
      confidence = Math.min(90, ((malariaScore + typhoidScore) / 50) * 100)
      recommendations = [
        "Immediate medical attention required",
        "Laboratory tests for confirmation",
        "Combined treatment may be necessary",
        "Close monitoring essential",
      ]
      medications = [
        "Artemether-Lumefantrine (for malaria)",
        "Ciprofloxacin (for typhoid)",
        "Supportive care medications",
      ]
      requiresXray = true
    } else {
      recommendations = [
        "Symptoms are not conclusive for malaria or typhoid",
        "Consider other differential diagnoses",
        "Symptomatic treatment and monitoring",
        "Consult healthcare provider if symptoms persist",
      ]
      medications = ["Paracetamol for fever and pain", "ORS for hydration"]
    }

    const result = {
      primaryDiagnosis,
      confidence: Math.round(confidence),
      malariaScore,
      typhoidScore,
      requiresXray,
      recommendations,
      medications,
      selectedSymptoms: selectedSymptomData,
      patientInfo,
      timestamp: new Date().toISOString(),
    }

    setDiagnosisResult(result)
    setIsAnalyzing(false)

    // Save diagnosis to database if user is authenticated
    if (profile?.id) {
      try {
        const response = await fetch('/api/diagnoses', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            patient_id: null, // This is a self-diagnosis, no specific patient
            doctor_id: profile.role === 'doctor' ? profile.id : null,
            appointment_id: null,
            symptoms: selectedSymptomData.map(s => s.name),
            diagnosis: result.primaryDiagnosis,
            confidence_level: result.confidence,
            expert_system_result: JSON.stringify({
              malariaScore: result.malariaScore,
              typhoidScore: result.typhoidScore,
              requiresXray: result.requiresXray,
              recommendations: result.recommendations,
              medications: result.medications
            }),
            doctor_notes: `AI Diagnosis: ${result.primaryDiagnosis} (${result.confidence}% confidence). Patient info: Age ${patientInfo.age}, Gender ${patientInfo.gender}, Temperature ${patientInfo.temperature}°C, Duration: ${patientInfo.duration}. Additional info: ${patientInfo.additionalInfo}`,
            requires_xray: result.requiresXray
          })
        })

        if (response.ok) {
          toast.success('Diagnosis saved to medical records')
        } else {
          console.error('Failed to save diagnosis:', await response.text())
        }
      } catch (error) {
        console.error('Error saving diagnosis:', error)
        toast.error('Failed to save diagnosis to database')
      }
    }
  }

  const resetDiagnosis = () => {
    setDiagnosisResult(null)
    setSelectedSymptoms([])
    setPatientInfo({
      age: "",
      gender: "",
      weight: "",
      temperature: "",
      duration: "",
      additionalInfo: "",
    })
    setCurrentStep(1)
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "VSs":
        return "bg-red-100 text-red-700"
      case "Ss":
        return "bg-orange-100 text-orange-700"
      case "Ws":
        return "bg-yellow-100 text-yellow-700"
      case "VWs":
        return "bg-blue-100 text-blue-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "VSs":
        return "Very Strong"
      case "Ss":
        return "Strong"
      case "Ws":
        return "Weak"
      case "VWs":
        return "Very Weak"
      default:
        return category
    }
  }

  if (diagnosisResult) {
    return <DiagnosisResult result={diagnosisResult} onReset={resetDiagnosis} user={user} />
  }

  return (
    <div className="space-y-6">
      {/* Progress Indicator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="h-5 w-5 mr-2" />
            AI Symptom Analysis
          </CardTitle>
          <CardDescription>Step {currentStep} of 3: Comprehensive symptom evaluation</CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={(currentStep / 3) * 100} className="w-full" />
        </CardContent>
      </Card>

      {/* Step 1: Patient Information */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Patient Information
            </CardTitle>
            <CardDescription>Basic patient details for accurate diagnosis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="Enter age"
                  value={patientInfo.age}
                  onChange={(e) => setPatientInfo((prev) => ({ ...prev, age: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={patientInfo.gender}
                  onValueChange={(value) => setPatientInfo((prev) => ({ ...prev, gender: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  placeholder="Enter weight"
                  value={patientInfo.weight}
                  onChange={(e) => setPatientInfo((prev) => ({ ...prev, weight: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="temperature">Current Temperature (°C)</Label>
                <Input
                  id="temperature"
                  type="number"
                  step="0.1"
                  placeholder="e.g., 38.5"
                  value={patientInfo.temperature}
                  onChange={(e) => setPatientInfo((prev) => ({ ...prev, temperature: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration">Symptom Duration</Label>
                <Select
                  value={patientInfo.duration}
                  onValueChange={(value) => setPatientInfo((prev) => ({ ...prev, duration: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="How long have symptoms persisted?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1-2 days">1-2 days</SelectItem>
                    <SelectItem value="3-5 days">3-5 days</SelectItem>
                    <SelectItem value="1 week">1 week</SelectItem>
                    <SelectItem value="2 weeks">2 weeks</SelectItem>
                    <SelectItem value="more than 2 weeks">More than 2 weeks</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="additionalInfo">Additional Information</Label>
              <Textarea
                id="additionalInfo"
                placeholder="Any additional symptoms, medical history, or relevant information"
                value={patientInfo.additionalInfo}
                onChange={(e) => setPatientInfo((prev) => ({ ...prev, additionalInfo: e.target.value }))}
                rows={3}
              />
            </div>
            <Button
              onClick={() => setCurrentStep(2)}
              disabled={!patientInfo.age || !patientInfo.gender || !patientInfo.temperature}
              className="w-full"
            >
              Continue to Symptom Selection
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Symptom Selection */}
      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Search className="h-5 w-5 mr-2" />
              Symptom Selection
            </CardTitle>
            <CardDescription>
              Select all symptoms currently experienced. Symptoms are categorized by diagnostic strength.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Symptom Categories */}
            {["VSs", "Ss", "Ws", "VWs"].map((category) => {
              const categorySymptoms = symptoms.filter((s) => s.category === category)
              return (
                <div key={category} className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Badge className={getCategoryColor(category)}>{getCategoryLabel(category)} Signs</Badge>
                    <span className="text-sm text-muted-foreground">
                      {category === "VSs" && "Highly indicative symptoms (may require X-ray)"}
                      {category === "Ss" && "Strong diagnostic indicators"}
                      {category === "Ws" && "Moderate diagnostic value"}
                      {category === "VWs" && "Supporting symptoms"}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {categorySymptoms.map((symptom) => (
                      <div key={symptom.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={symptom.id}
                          checked={selectedSymptoms.includes(symptom.id)}
                          onCheckedChange={() => handleSymptomToggle(symptom.id)}
                        />
                        <Label htmlFor={symptom.id} className="text-sm cursor-pointer">
                          {symptom.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}

            <div className="flex items-center justify-between pt-4">
              <Button variant="outline" onClick={() => setCurrentStep(1)}>
                Back
              </Button>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-muted-foreground">{selectedSymptoms.length} symptoms selected</span>
                <Button onClick={() => setCurrentStep(3)} disabled={selectedSymptoms.length === 0}>
                  Continue to Analysis
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Review and Analyze */}
      {currentStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Thermometer className="h-5 w-5 mr-2" />
              Review and Analyze
            </CardTitle>
            <CardDescription>Review your information before running the AI diagnosis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Patient Summary */}
            <div>
              <h4 className="font-semibold mb-2">Patient Information</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Age:</span> {patientInfo.age} years
                </div>
                <div>
                  <span className="text-muted-foreground">Gender:</span> {patientInfo.gender}
                </div>
                <div>
                  <span className="text-muted-foreground">Temperature:</span> {patientInfo.temperature}°C
                </div>
                <div>
                  <span className="text-muted-foreground">Duration:</span> {patientInfo.duration}
                </div>
              </div>
            </div>

            {/* Selected Symptoms Summary */}
            <div>
              <h4 className="font-semibold mb-2">Selected Symptoms ({selectedSymptoms.length})</h4>
              <div className="flex flex-wrap gap-2">
                {symptoms
                  .filter((s) => selectedSymptoms.includes(s.id))
                  .map((symptom) => (
                    <Badge key={symptom.id} className={getCategoryColor(symptom.category)}>
                      {symptom.name}
                    </Badge>
                  ))}
              </div>
            </div>

            {/* Warning for Very Strong Signs */}
            {symptoms.filter((s) => selectedSymptoms.includes(s.id) && s.category === "VSs").length > 0 && (
              <Card className="border-amber-200 bg-amber-50">
                <CardContent className="pt-4">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-amber-800">Very Strong Signs Detected</h4>
                      <p className="text-sm text-amber-700">
                        The presence of very strong signs may require chest X-ray in addition to drug administration.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="flex items-center justify-between pt-4">
              <Button variant="outline" onClick={() => setCurrentStep(2)}>
                Back to Symptoms
              </Button>
              <Button onClick={runDiagnosis} disabled={isAnalyzing} className="min-w-[200px]">
                {isAnalyzing ? (
                  <div className="flex items-center space-x-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                    <span>Analyzing...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Zap className="h-4 w-4" />
                    <span>Run AI Diagnosis</span>
                  </div>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
