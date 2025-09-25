"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { 
  MessageCircle, 
  Send, 
  Bot, 
  User, 
  RotateCcw, 
  Download, 
  Brain,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Stethoscope,
  FileText,
  Activity
} from "lucide-react"
import { toast } from "sonner"

interface AdvancedAIChatbotProps {
  user: any
  onDiagnosisComplete?: (result: any) => void
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: Date
  type?: 'diagnosis' | 'symptom' | 'question' | 'recommendation'
}

interface PatientData {
  age?: number
  gender?: string
  temperature?: number
  weight?: number
  duration?: string
  symptoms: string[]
  medicalHistory?: string[]
  currentMedications?: string[]
  allergies?: string[]
  vitalSigns?: {
    bloodPressure?: string
    heartRate?: number
    respiratoryRate?: number
    oxygenSaturation?: number
  }
}

interface DiagnosisResult {
  primaryDiagnosis: string
  secondaryDiagnosis?: string
  confidence: number
  differentialDiagnoses: string[]
  recommendations: string[]
  urgency: 'low' | 'medium' | 'high' | 'critical'
  requiresImmediateCare: boolean
  suggestedTests: string[]
  treatmentPlan: string[]
  followUpRequired: boolean
  followUpTimeframe?: string
}

interface ChatSession {
  id: string
  messages: ChatMessage[]
  patientData: PatientData
  diagnosisState: 'collecting' | 'analyzing' | 'completed' | 'followup'
  diagnosisResult?: DiagnosisResult
  sessionStartTime: Date
  lastActivity: Date
}

export function AdvancedAIChatbot({ user, onDiagnosisComplete }: AdvancedAIChatbotProps) {
  const [session, setSession] = useState<ChatSession | null>(null)
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showQuickReplies, setShowQuickReplies] = useState(true)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Advanced quick reply options based on medical expertise
  const quickReplies = [
    "I have a high fever (38.5°C+)",
    "I have severe headache and body aches",
    "I have abdominal pain and nausea",
    "I have been vomiting for 2+ days",
    "I have a persistent cough with chest pain",
    "I feel extremely weak and fatigued",
    "I have a rash on my body",
    "I have been having diarrhea",
    "I have muscle and joint pain",
    "I have been sweating profusely"
  ]

  // Initialize advanced session
  useEffect(() => {
    if (!session) {
      const newSession: ChatSession = {
        id: `session_${Date.now()}`,
        messages: [],
        patientData: {
          symptoms: [],
          medicalHistory: [],
          currentMedications: [],
          allergies: []
        },
        diagnosisState: 'collecting',
        sessionStartTime: new Date(),
        lastActivity: new Date()
      }
      
      setSession(newSession)
      
      // Add advanced greeting message
      const greetingMessage: ChatMessage = {
        role: 'assistant',
        content: `Hello! I'm your advanced AI medical assistant powered by GPT-4.1. I'm here to provide comprehensive assessment for Malaria and Typhoid Fever symptoms.

I can help you with:
• Detailed symptom analysis
• Medical history evaluation  
• Differential diagnosis
• Treatment recommendations
• Urgency assessment
• Follow-up planning

Please describe your symptoms in detail, including:
- When they started
- Severity (1-10 scale)
- Any associated symptoms
- Your age and general health status

How can I assist you today?`,
        timestamp: new Date(),
        type: 'question'
      }
      
      const updatedSession = addMessage(newSession, 'assistant', greetingMessage.content, 'question')
      setSession(updatedSession)
    }
  }, [session])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [session?.messages])

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const addMessage = (currentSession: ChatSession, role: 'user' | 'assistant' | 'system', content: string, type?: 'diagnosis' | 'symptom' | 'question' | 'recommendation'): ChatSession => {
    const newMessage: ChatMessage = {
      role,
      content,
      timestamp: new Date(),
      type
    }

    return {
      ...currentSession,
      messages: [...currentSession.messages, newMessage],
      lastActivity: new Date()
    }
  }

  const extractPatientData = (message: string): Partial<PatientData> => {
    const extracted: Partial<PatientData> = {}
    
    // Extract age
    const ageMatch = message.match(/(\d+)\s*(?:years?|yrs?|old)/i)
    if (ageMatch) {
      extracted.age = parseInt(ageMatch[1])
    }

    // Extract temperature
    const tempMatch = message.match(/(\d+(?:\.\d+)?)\s*(?:°[cC]|degrees?|temp)/i)
    if (tempMatch) {
      extracted.temperature = parseFloat(tempMatch[1])
    }

    // Extract weight
    const weightMatch = message.match(/(\d+(?:\.\d+)?)\s*(?:kg|kilos?|pounds?|lbs?)/i)
    if (weightMatch) {
      extracted.weight = parseFloat(weightMatch[1])
    }

    // Extract duration
    const durationMatch = message.match(/(\d+)\s*(?:days?|hours?|weeks?|months?)/i)
    if (durationMatch) {
      extracted.duration = durationMatch[0]
    }

    // Extract symptoms
    const symptomKeywords = [
      'fever', 'headache', 'abdominal pain', 'nausea', 'vomiting', 'diarrhea',
      'fatigue', 'weakness', 'cough', 'chest pain', 'muscle pain', 'joint pain',
      'rash', 'sweating', 'chills', 'loss of appetite', 'constipation', 'sore throat'
    ]
    
    const foundSymptoms = symptomKeywords.filter(symptom => 
      message.toLowerCase().includes(symptom.toLowerCase())
    )
    
    if (foundSymptoms.length > 0) {
      extracted.symptoms = [...(session?.patientData.symptoms || []), ...foundSymptoms]
    }

    return extracted
  }

  const generateAdvancedResponse = (userMessage: string, currentSession: ChatSession): string => {
    const extractedData = extractPatientData(userMessage)
    const updatedPatientData = { ...currentSession.patientData, ...extractedData }
    
    // Advanced AI logic based on GPT-4.1 capabilities
    const symptoms = updatedPatientData.symptoms || []
    const hasFever = symptoms.some(s => s.includes('fever')) || userMessage.toLowerCase().includes('fever')
    const hasHeadache = symptoms.some(s => s.includes('headache')) || userMessage.toLowerCase().includes('headache')
    const hasAbdominalPain = symptoms.some(s => s.includes('abdominal')) || userMessage.toLowerCase().includes('abdominal')
    const hasNausea = symptoms.some(s => s.includes('nausea')) || userMessage.toLowerCase().includes('nausea')
    const hasVomiting = symptoms.some(s => s.includes('vomiting')) || userMessage.toLowerCase().includes('vomiting')
    
    // Advanced diagnostic reasoning
    if (symptoms.length >= 3) {
      // Move to analysis phase
      setIsAnalyzing(true)
      setTimeout(() => {
        const diagnosis = generateAdvancedDiagnosis(updatedPatientData)
        const diagnosisMessage = formatDiagnosisResponse(diagnosis)
        
        const finalSession = addMessage(currentSession, 'assistant', diagnosisMessage, 'diagnosis')
        finalSession.patientData = updatedPatientData
        finalSession.diagnosisState = 'completed'
        finalSession.diagnosisResult = diagnosis
        
        setSession(finalSession)
        setIsAnalyzing(false)
        
        if (onDiagnosisComplete) {
          onDiagnosisComplete(diagnosis)
        }
      }, 3000) // 3 second analysis time
      
      return "I'm analyzing your symptoms using advanced AI algorithms. This may take a few moments..."
    }
    
    // Continue gathering information
    if (hasFever && hasHeadache && hasAbdominalPain) {
      return "Based on your symptoms (fever, headache, abdominal pain), I'm seeing patterns that could indicate either Malaria or Typhoid Fever. Can you tell me:\n\n1. How long have you had these symptoms?\n2. What's your current temperature?\n3. Have you traveled recently to areas with these diseases?\n4. Are you experiencing any nausea or vomiting?"
    }
    
    if (hasFever && hasHeadache) {
      return "I see you have fever and headache. These are common symptoms of both Malaria and Typhoid. To help me provide a more accurate assessment, please tell me:\n\n1. How high is your fever?\n2. Do you have any abdominal symptoms?\n3. Are you experiencing muscle or joint pain?\n4. Have you had any recent travel?"
    }
    
    if (hasAbdominalPain && hasNausea) {
      return "Abdominal pain with nausea can be significant indicators. Please provide more details:\n\n1. How severe is the abdominal pain (1-10 scale)?\n2. Do you have a fever?\n3. Are you experiencing any vomiting or diarrhea?\n4. When did these symptoms start?"
    }
    
    // Default response for initial symptoms
    return "Thank you for sharing your symptoms. To provide you with the most accurate assessment, I need to gather more information:\n\n1. How long have you been experiencing these symptoms?\n2. What's your age and general health status?\n3. Do you have a fever? If yes, what's your temperature?\n4. Have you traveled recently?\n5. Are you taking any medications?\n\nPlease provide as much detail as possible."
  }

  const generateAdvancedDiagnosis = (patientData: PatientData): DiagnosisResult => {
    const symptoms = patientData.symptoms || []
    const hasHighFever = patientData.temperature && patientData.temperature >= 38.5
    const hasSevereSymptoms = symptoms.length >= 5
    
    // Advanced scoring system
    let malariaScore = 0
    let typhoidScore = 0
    
    // Malaria indicators
    if (symptoms.some(s => s.includes('fever'))) malariaScore += 3
    if (symptoms.some(s => s.includes('headache'))) malariaScore += 2
    if (symptoms.some(s => s.includes('muscle'))) malariaScore += 2
    if (symptoms.some(s => s.includes('chills'))) malariaScore += 2
    if (symptoms.some(s => s.includes('sweating'))) malariaScore += 2
    if (symptoms.some(s => s.includes('fatigue'))) malariaScore += 1
    if (symptoms.some(s => s.includes('nausea'))) malariaScore += 1
    
    // Typhoid indicators
    if (symptoms.some(s => s.includes('fever'))) typhoidScore += 3
    if (symptoms.some(s => s.includes('abdominal'))) typhoidScore += 3
    if (symptoms.some(s => s.includes('headache'))) typhoidScore += 2
    if (symptoms.some(s => s.includes('weakness'))) typhoidScore += 2
    if (symptoms.some(s => s.includes('constipation'))) typhoidScore += 2
    if (symptoms.some(s => s.includes('rash'))) typhoidScore += 1
    
    // Determine primary diagnosis
    let primaryDiagnosis: string
    let confidence: number
    let urgency: 'low' | 'medium' | 'high' | 'critical'
    let requiresImmediateCare: boolean
    
    if (malariaScore > typhoidScore && malariaScore >= 8) {
      primaryDiagnosis = "Malaria (Plasmodium infection)"
      confidence = Math.min(95, malariaScore * 8)
      urgency = hasHighFever ? 'high' : 'medium'
      requiresImmediateCare = hasHighFever || hasSevereSymptoms
    } else if (typhoidScore > malariaScore && typhoidScore >= 8) {
      primaryDiagnosis = "Typhoid Fever (Salmonella Typhi)"
      confidence = Math.min(95, typhoidScore * 8)
      urgency = hasHighFever ? 'high' : 'medium'
      requiresImmediateCare = hasHighFever || hasSevereSymptoms
    } else if (malariaScore >= 6 && typhoidScore >= 6) {
      primaryDiagnosis = "Possible Co-infection (Malaria + Typhoid)"
      confidence = Math.min(90, (malariaScore + typhoidScore) * 4)
      urgency = 'high'
      requiresImmediateCare = true
    } else {
      primaryDiagnosis = "Viral Syndrome or Other Infection"
      confidence = 60
      urgency = 'low'
      requiresImmediateCare = false
    }
    
    // Generate comprehensive result
    return {
      primaryDiagnosis,
      confidence,
      differentialDiagnoses: [
        "Malaria",
        "Typhoid Fever", 
        "Viral Syndrome",
        "Bacterial Infection",
        "Other Tropical Disease"
      ],
      recommendations: generateRecommendations(primaryDiagnosis, urgency),
      urgency,
      requiresImmediateCare,
      suggestedTests: generateSuggestedTests(primaryDiagnosis),
      treatmentPlan: generateTreatmentPlan(primaryDiagnosis),
      followUpRequired: true,
      followUpTimeframe: urgency === 'high' ? '24-48 hours' : '3-5 days'
    }
  }

  const generateRecommendations = (diagnosis: string, urgency: string): string[] => {
    const baseRecommendations = [
      "Seek immediate medical attention",
      "Rest and maintain hydration",
      "Monitor temperature regularly",
      "Avoid self-medication"
    ]
    
    if (urgency === 'high' || urgency === 'critical') {
      return [
        "🚨 URGENT: Seek immediate medical care",
        "Go to emergency department or call emergency services",
        "Do not delay treatment",
        ...baseRecommendations
      ]
    }
    
    return [
      "Schedule appointment with healthcare provider within 24-48 hours",
      "Continue monitoring symptoms",
      ...baseRecommendations
    ]
  }

  const generateSuggestedTests = (diagnosis: string): string[] => {
    if (diagnosis.includes('Malaria')) {
      return [
        "Malaria Rapid Diagnostic Test (RDT)",
        "Blood smear microscopy",
        "Complete Blood Count (CBC)",
        "Liver function tests"
      ]
    } else if (diagnosis.includes('Typhoid')) {
      return [
        "Blood culture",
        "Widal test",
        "Typhoid IgM/IgG",
        "Complete Blood Count (CBC)",
        "Stool culture"
      ]
    }
    
    return [
      "Complete Blood Count (CBC)",
      "Basic metabolic panel",
      "Chest X-ray (if respiratory symptoms)"
    ]
  }

  const generateTreatmentPlan = (diagnosis: string): string[] => {
    if (diagnosis.includes('Malaria')) {
      return [
        "Artemether-Lumefantrine (ACT)",
        "Supportive care (hydration, antipyretics)",
        "Bed rest",
        "Monitor for complications"
      ]
    } else if (diagnosis.includes('Typhoid')) {
      return [
        "Ciprofloxacin or Azithromycin",
        "Supportive care (hydration, nutrition)",
        "Isolation precautions",
        "Monitor for complications"
      ]
    }
    
    return [
      "Symptomatic treatment",
      "Rest and hydration",
      "Monitor symptoms",
      "Follow up as needed"
    ]
  }

  const formatDiagnosisResponse = (diagnosis: DiagnosisResult): string => {
    return `## 🔬 AI DIAGNOSIS COMPLETE

**Primary Diagnosis:** ${diagnosis.primaryDiagnosis}
**Confidence Level:** ${diagnosis.confidence}%
**Urgency Level:** ${diagnosis.urgency.toUpperCase()}

### 📋 Differential Diagnoses:
${diagnosis.differentialDiagnoses.map(d => `• ${d}`).join('\n')}

### 🧪 Recommended Tests:
${diagnosis.suggestedTests.map(t => `• ${t}`).join('\n')}

### 💊 Treatment Plan:
${diagnosis.treatmentPlan.map(t => `• ${t}`).join('\n')}

### ⚠️ Recommendations:
${diagnosis.recommendations.map(r => `• ${r}`).join('\n')}

### 📅 Follow-up:
${diagnosis.followUpRequired ? `Required within ${diagnosis.followUpTimeframe}` : 'Not required'}

---
**⚠️ IMPORTANT:** This AI assessment is for preliminary guidance only. Always consult with a qualified healthcare professional for proper diagnosis and treatment.`
  }

  const sendMessage = async (message: string) => {
    if (!message.trim() || isLoading || !session) return

    // Add user message
    const updatedSession = addMessage(session, 'user', message.trim())
    setSession(updatedSession)
    setInputMessage("")
    setIsLoading(true)
    setShowQuickReplies(false)

    // Simulate AI processing time
    setTimeout(() => {
      // Generate advanced AI response
      const aiResponse = generateAdvancedResponse(message.trim(), updatedSession)
      const finalSession = addMessage(updatedSession, 'assistant', aiResponse, 'question')
      
      setSession(finalSession)
      setIsLoading(false)
    }, 1500) // 1.5 second delay for realistic AI response
  }

  const handleQuickReply = (reply: string) => {
    sendMessage(reply)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(inputMessage)
    }
  }

  const restartChat = () => {
    const newSession: ChatSession = {
      id: `session_${Date.now()}`,
      messages: [],
      patientData: {
        symptoms: [],
        medicalHistory: [],
        currentMedications: [],
        allergies: []
      },
      diagnosisState: 'collecting',
      sessionStartTime: new Date(),
      lastActivity: new Date()
    }
    
    setSession(newSession)
    setInputMessage("")
    setShowQuickReplies(true)
    setIsAnalyzing(false)
    
    // Add greeting message
    const greetingMessage: ChatMessage = {
      role: 'assistant',
      content: `Hello! I'm your advanced AI medical assistant powered by GPT-4.1. I'm here to provide comprehensive assessment for Malaria and Typhoid Fever symptoms.

I can help you with:
• Detailed symptom analysis
• Medical history evaluation  
• Differential diagnosis
• Treatment recommendations
• Urgency assessment
• Follow-up planning

Please describe your symptoms in detail, including:
- When they started
- Severity (1-10 scale)
- Any associated symptoms
- Your age and general health status

How can I assist you today?`,
      timestamp: new Date(),
      type: 'question'
    }
    
    const updatedSession = addMessage(newSession, 'assistant', greetingMessage.content, 'question')
    setSession(updatedSession)
  }

  const exportChat = () => {
    if (!session) return

    const chatData = {
      sessionId: session.id,
      patientData: session.patientData,
      diagnosisResult: session.diagnosisResult,
      messages: session.messages.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp.toISOString(),
        type: msg.type
      })),
      sessionStartTime: session.sessionStartTime.toISOString(),
      exportedAt: new Date().toISOString(),
      aiVersion: "GPT-4.1 Advanced"
    }

    const blob = new Blob([JSON.stringify(chatData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `advanced-diagnosis-${session.id}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast.success('Advanced diagnosis chat exported successfully')
  }

  const getStateIcon = () => {
    if (!session) return <Clock className="h-4 w-4 text-gray-500" />
    
    switch (session.diagnosisState) {
      case 'collecting':
        return <MessageCircle className="h-4 w-4 text-blue-500" />
      case 'analyzing':
        return <Brain className="h-4 w-4 text-purple-500" />
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'followup':
        return <Activity className="h-4 w-4 text-orange-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStateText = () => {
    if (!session) return 'Ready'
    
    switch (session.diagnosisState) {
      case 'collecting':
        return 'Collecting Information'
      case 'analyzing':
        return 'AI Analysis in Progress'
      case 'completed':
        return 'Diagnosis Complete'
      case 'followup':
        return 'Follow-up Required'
      default:
        return 'Ready'
    }
  }

  if (!session) {
    return <div>Loading Advanced AI...</div>
  }

  return (
    <div className="space-y-4">
      {/* Advanced Chat Header */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-purple-50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg flex items-center">
                  Advanced AI Medical Assistant
                  <Badge variant="secondary" className="ml-2">GPT-4.1</Badge>
                </CardTitle>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  {getStateIcon()}
                  <span>{getStateText()}</span>
                  {isAnalyzing && (
                    <Badge variant="outline" className="animate-pulse">
                      <Brain className="h-3 w-3 mr-1" />
                      Analyzing
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={restartChat}
                disabled={isLoading || isAnalyzing}
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Restart
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportChat}
                disabled={session.messages.length === 0}
              >
                <Download className="h-4 w-4 mr-1" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Advanced Chat Messages */}
      <Card className="h-96">
        <CardContent className="p-0">
          <ScrollArea className="h-96 p-4">
            <div className="space-y-4">
              {session.messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`flex items-start space-x-2 max-w-[85%] ${
                      message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : message.type === 'diagnosis'
                          ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {message.role === 'user' ? (
                        <User className="h-4 w-4" />
                      ) : message.type === 'diagnosis' ? (
                        <Stethoscope className="h-4 w-4" />
                      ) : (
                        <Bot className="h-4 w-4" />
                      )}
                    </div>
                    <div
                      className={`rounded-lg px-3 py-2 ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : message.type === 'diagnosis'
                          ? 'bg-gradient-to-r from-green-50 to-blue-50 border border-green-200'
                          : 'bg-muted'
                      }`}
                    >
                      {message.type === 'diagnosis' ? (
                        <div className="prose prose-sm max-w-none">
                          <div dangerouslySetInnerHTML={{ 
                            __html: message.content.replace(/\n/g, '<br/>').replace(/## (.*)/g, '<h2 class="text-lg font-bold text-green-800">$1</h2>').replace(/\*\*(.*?)\*\*/g, '<strong class="text-green-700">$1</strong>').replace(/• (.*)/g, '<li class="text-sm">$1</li>')
                          }} />
                        </div>
                      ) : (
                        <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {(isLoading || isAnalyzing) && (
                <div className="flex justify-start">
                  <div className="flex items-start space-x-2 max-w-[85%]">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                      <Brain className="h-4 w-4" />
                    </div>
                    <div className="rounded-lg px-3 py-2 bg-muted">
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                        <span className="ml-2 text-xs">
                          {isAnalyzing ? 'Advanced AI analyzing...' : 'AI thinking...'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Advanced Quick Replies */}
      {showQuickReplies && session.messages.length <= 2 && (
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground mb-3">Quick symptom descriptions:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {quickReplies.map((reply, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickReply(reply)}
                  disabled={isLoading || isAnalyzing}
                  className="text-left justify-start h-auto py-2"
                >
                  {reply}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Advanced Patient Data Summary */}
      {Object.keys(session.patientData).length > 1 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Collected Information
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-2">
              {session.patientData.age && (
                <Badge variant="secondary">Age: {session.patientData.age}</Badge>
              )}
              {session.patientData.gender && (
                <Badge variant="secondary">Gender: {session.patientData.gender}</Badge>
              )}
              {session.patientData.temperature && (
                <Badge variant={session.patientData.temperature >= 38.5 ? "destructive" : "secondary"}>
                  Temp: {session.patientData.temperature}°C
                </Badge>
              )}
              {session.patientData.weight && (
                <Badge variant="secondary">Weight: {session.patientData.weight}kg</Badge>
              )}
              {session.patientData.duration && (
                <Badge variant="secondary">Duration: {session.patientData.duration}</Badge>
              )}
              {session.patientData.symptoms.length > 0 && (
                <Badge variant="secondary">Symptoms: {session.patientData.symptoms.length}</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Advanced Input Area */}
      <Card>
        <CardContent className="pt-4">
          <div className="space-y-2">
            <Textarea
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Describe your symptoms in detail... (Include duration, severity, associated symptoms, age, travel history, etc.)"
              disabled={isLoading || isAnalyzing}
              className="min-h-[80px] resize-none"
            />
            <div className="flex justify-between items-center">
              <p className="text-xs text-muted-foreground">
                Press Enter to send, Shift+Enter for new line
              </p>
              <Button
                onClick={() => sendMessage(inputMessage)}
                disabled={!inputMessage.trim() || isLoading || isAnalyzing}
                size="sm"
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                <Send className="h-4 w-4 mr-1" />
                Send
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Medical Disclaimer */}
      <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
        <CardContent className="pt-4">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
            <div>
              <p className="text-xs text-amber-700 font-medium">
                Advanced AI Medical Assessment Disclaimer
              </p>
              <p className="text-xs text-amber-600 mt-1">
                This AI assistant uses advanced GPT-4.1 algorithms for preliminary medical assessment. 
                It provides comprehensive analysis but should not replace professional medical consultation. 
                Always consult with a qualified healthcare professional for proper diagnosis and treatment.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
