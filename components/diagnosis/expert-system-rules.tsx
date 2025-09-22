"use client"

export interface Symptom {
  id: string
  name: string
  category: "very_strong" | "strong" | "weak" | "very_weak"
  diseases: ("malaria" | "typhoid" | "both")[]
}

export interface DiagnosisRule {
  id: string
  condition: string[]
  conclusion: {
    disease: "malaria" | "typhoid" | "both" | "none"
    confidence: number
    requiresXray: boolean
    treatment: string[]
  }
}

export const SYMPTOMS: Symptom[] = [
  // Very Strong Signs (VSs)
  { id: "abdominal_pain", name: "Abdominal pain", category: "very_strong", diseases: ["malaria", "typhoid"] },
  { id: "vomiting", name: "Vomiting", category: "very_strong", diseases: ["malaria"] },
  { id: "sore_throat", name: "Sore throat", category: "very_strong", diseases: ["malaria"] },
  { id: "stomach_issues", name: "Stomach issues", category: "very_strong", diseases: ["typhoid"] },

  // Strong signs (Ss)
  { id: "headache", name: "Headache", category: "strong", diseases: ["malaria", "typhoid"] },
  { id: "fatigue", name: "Fatigue", category: "strong", diseases: ["malaria"] },
  { id: "cough", name: "Cough", category: "strong", diseases: ["malaria"] },
  { id: "constipation", name: "Constipation", category: "strong", diseases: ["malaria"] },
  { id: "persistent_high_fever", name: "Persistent high fever", category: "strong", diseases: ["typhoid"] },

  // Weak signs (Ws)
  { id: "chest_pain", name: "Chest pain", category: "weak", diseases: ["malaria"] },
  { id: "back_pain", name: "Back pain", category: "weak", diseases: ["malaria"] },
  { id: "muscle_pain", name: "Muscle pain", category: "weak", diseases: ["malaria"] },
  { id: "weakness", name: "Weakness", category: "weak", diseases: ["typhoid"] },
  { id: "tiredness", name: "Tiredness", category: "weak", diseases: ["typhoid"] },

  // Very Weak Signs (VWs)
  { id: "diarrhea", name: "Diarrhea", category: "very_weak", diseases: ["malaria"] },
  { id: "sweating", name: "Sweating", category: "very_weak", diseases: ["malaria"] },
  { id: "rash", name: "Rash", category: "very_weak", diseases: ["malaria", "typhoid"] },
  { id: "loss_of_appetite", name: "Loss of appetite", category: "very_weak", diseases: ["malaria", "typhoid"] },
]

export const DIAGNOSIS_RULES: DiagnosisRule[] = [
  // Malaria rules
  {
    id: "malaria_very_strong",
    condition: ["abdominal_pain", "vomiting", "sore_throat"],
    conclusion: {
      disease: "malaria",
      confidence: 95,
      requiresXray: true,
      treatment: ["Artemether-Lumefantrine", "Artesunate", "Quinine"],
    },
  },
  {
    id: "malaria_strong",
    condition: ["headache", "fatigue", "cough"],
    conclusion: {
      disease: "malaria",
      confidence: 80,
      requiresXray: false,
      treatment: ["Artemether-Lumefantrine", "Chloroquine"],
    },
  },

  // Typhoid rules
  {
    id: "typhoid_very_strong",
    condition: ["abdominal_pain", "stomach_issues"],
    conclusion: {
      disease: "typhoid",
      confidence: 95,
      requiresXray: true,
      treatment: ["Ciprofloxacin", "Azithromycin", "Ceftriaxone"],
    },
  },
  {
    id: "typhoid_strong",
    condition: ["headache", "persistent_high_fever"],
    conclusion: {
      disease: "typhoid",
      confidence: 80,
      requiresXray: false,
      treatment: ["Ciprofloxacin", "Chloramphenicol"],
    },
  },

  // Combined conditions
  {
    id: "both_diseases",
    condition: ["abdominal_pain", "headache", "rash", "loss_of_appetite"],
    conclusion: {
      disease: "both",
      confidence: 85,
      requiresXray: true,
      treatment: ["Artemether-Lumefantrine", "Ciprofloxacin", "Supportive care"],
    },
  },
]

export function diagnoseSymptoms(selectedSymptoms: string[]): DiagnosisRule["conclusion"] | null {
  // Score-based diagnosis
  let malariaScore = 0
  let typhoidScore = 0

  selectedSymptoms.forEach((symptomId) => {
    const symptom = SYMPTOMS.find((s) => s.id === symptomId)
    if (!symptom) return

    const weight = {
      very_strong: 4,
      strong: 3,
      weak: 2,
      very_weak: 1,
    }[symptom.category]

    if (symptom.diseases.includes("malaria")) {
      malariaScore += weight
    }
    if (symptom.diseases.includes("typhoid")) {
      typhoidScore += weight
    }
  })

  // Check for specific rule matches first
  for (const rule of DIAGNOSIS_RULES) {
    const matchedSymptoms = rule.condition.filter((symptom) => selectedSymptoms.includes(symptom))

    if (matchedSymptoms.length >= Math.ceil(rule.condition.length * 0.7)) {
      return rule.conclusion
    }
  }

  // Fallback to score-based diagnosis
  if (malariaScore > typhoidScore && malariaScore >= 6) {
    return {
      disease: "malaria",
      confidence: Math.min(90, malariaScore * 10),
      requiresXray: malariaScore >= 8,
      treatment: ["Artemether-Lumefantrine", "Supportive care"],
    }
  } else if (typhoidScore > malariaScore && typhoidScore >= 6) {
    return {
      disease: "typhoid",
      confidence: Math.min(90, typhoidScore * 10),
      requiresXray: typhoidScore >= 8,
      treatment: ["Ciprofloxacin", "Supportive care"],
    }
  } else if (malariaScore >= 6 && typhoidScore >= 6) {
    return {
      disease: "both",
      confidence: Math.min(90, (malariaScore + typhoidScore) * 5),
      requiresXray: true,
      treatment: ["Artemether-Lumefantrine", "Ciprofloxacin", "Supportive care"],
    }
  }

  return null
}

export function getSymptomsByCategory() {
  return {
    very_strong: SYMPTOMS.filter((s) => s.category === "very_strong"),
    strong: SYMPTOMS.filter((s) => s.category === "strong"),
    weak: SYMPTOMS.filter((s) => s.category === "weak"),
    very_weak: SYMPTOMS.filter((s) => s.category === "very_weak"),
  }
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Brain, Settings, Eye, Edit } from "lucide-react"

interface ExpertSystemRulesProps {
  user: any
}

export function ExpertSystemRules({ user }: ExpertSystemRulesProps) {
  const symptomsByCategory = getSymptomsByCategory()

  return (
    <div className="space-y-6">
      {/* Rules Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rules</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{DIAGNOSIS_RULES.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Symptoms</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{SYMPTOMS.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Diseases</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">Malaria & Typhoid</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accuracy</CardTitle>
            <Brain className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">94.2%</div>
          </CardContent>
        </Card>
      </div>

      {/* Symptoms by Category */}
      <Card>
        <CardHeader>
          <CardTitle>Symptom Categories</CardTitle>
          <CardDescription>Symptoms organized by diagnostic strength</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {Object.entries(symptomsByCategory).map(([category, symptoms]) => (
            <div key={category}>
              <h3 className="font-semibold mb-3 capitalize">
                {category.replace("_", " ")} Signs ({symptoms.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {symptoms.map((symptom) => (
                  <Badge key={symptom.id} variant="outline" className="text-sm">
                    {symptom.name}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Diagnosis Rules */}
      <Card>
        <CardHeader>
          <CardTitle>Expert System Rules</CardTitle>
          <CardDescription>Rule-based logic for disease diagnosis</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rule ID</TableHead>
                <TableHead>Disease</TableHead>
                <TableHead>Conditions</TableHead>
                <TableHead>Confidence</TableHead>
                <TableHead>X-ray Required</TableHead>
                <TableHead>Treatment</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {DIAGNOSIS_RULES.map((rule) => (
                <TableRow key={rule.id}>
                  <TableCell className="font-medium">{rule.id}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{rule.conclusion.disease}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {rule.condition.map((condition, index) => (
                        <div key={index}>{SYMPTOMS.find((s) => s.id === condition)?.name || condition}</div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{rule.conclusion.confidence}%</TableCell>
                  <TableCell>
                    <Badge variant={rule.conclusion.requiresXray ? "destructive" : "secondary"}>
                      {rule.conclusion.requiresXray ? "Yes" : "No"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {rule.conclusion.treatment.map((treatment, index) => (
                        <div key={index}>{treatment}</div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      {user.role === "admin" && (
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
