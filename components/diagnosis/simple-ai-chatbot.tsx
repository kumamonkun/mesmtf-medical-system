"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
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
  Clock
} from "lucide-react"
import { toast } from "sonner"
import { simpleAI, ChatMessage, PatientData, ChatSession } from "@/lib/simple-ai"

interface SimpleAIChatbotProps {
  user: any
  onDiagnosisComplete?: (result: any) => void
}

export function SimpleAIChatbot({ user, onDiagnosisComplete }: SimpleAIChatbotProps) {
  const [session, setSession] = useState<ChatSession | null>(null)
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showQuickReplies, setShowQuickReplies] = useState(true)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Quick reply options
  const quickReplies = [
    "I have a fever",
    "I have a headache", 
    "I have abdominal pain",
    "I feel nauseous",
    "I have muscle pain",
    "I feel weak",
    "I have a cough",
    "I have a rash"
  ]

  // Initialize session
  useEffect(() => {
    if (!session) {
      const newSession = simpleAI.createSession()
      setSession(newSession)
      
      // Add greeting message
      const greetingMessage: ChatMessage = {
        role: 'assistant',
        content: "Hello! I'm your AI medical assistant. I'm here to help you with a preliminary assessment for Malaria and Typhoid symptoms. How are you feeling today?",
        timestamp: new Date()
      }
      
      const updatedSession = simpleAI.addMessage(newSession, 'assistant', greetingMessage.content)
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

  const sendMessage = async (message: string) => {
    if (!message.trim() || isLoading || !session) return

    // Add user message
    const updatedSession = simpleAI.addMessage(session, 'user', message.trim())
    setSession(updatedSession)
    setInputMessage("")
    setIsLoading(true)
    setShowQuickReplies(false)

    // Simulate AI thinking time
    setTimeout(() => {
      // Generate AI response
      const aiResponse = simpleAI.generateResponse(message.trim(), updatedSession)
      const finalSession = simpleAI.addMessage(updatedSession, 'assistant', aiResponse)
      
      // Extract patient data
      const extractedData = simpleAI.extractPatientData(finalSession.messages)
      finalSession.patientData = { ...finalSession.patientData, ...extractedData }
      
      setSession(finalSession)
      setIsLoading(false)

      // Check if we have enough information for diagnosis
      if (finalSession.patientData.symptoms.length >= 3) {
        const diagnosis = simpleAI.generateDiagnosis(finalSession.patientData)
        if (diagnosis.confidence > 60) {
          finalSession.diagnosisState = 'completed'
          setSession({ ...finalSession })
          
          if (onDiagnosisComplete) {
            onDiagnosisComplete({
              primaryDiagnosis: diagnosis.diagnosis,
              confidence: diagnosis.confidence,
              recommendations: diagnosis.recommendations,
              patientData: finalSession.patientData
            })
          }
        }
      }
    }, 1000) // 1 second delay to simulate AI thinking
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
    const newSession = simpleAI.createSession()
    setSession(newSession)
    setInputMessage("")
    setShowQuickReplies(true)
    
    // Add greeting message
    const greetingMessage: ChatMessage = {
      role: 'assistant',
      content: "Hello! I'm your AI medical assistant. I'm here to help you with a preliminary assessment for Malaria and Typhoid symptoms. How are you feeling today?",
      timestamp: new Date()
    }
    
    const updatedSession = simpleAI.addMessage(newSession, 'assistant', greetingMessage.content)
    setSession(updatedSession)
  }

  const exportChat = () => {
    if (!session) return

    const chatData = {
      sessionId: session.id,
      patientData: session.patientData,
      messages: session.messages.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp.toISOString()
      })),
      exportedAt: new Date().toISOString()
    }

    const blob = new Blob([JSON.stringify(chatData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `diagnosis-chat-${session.id}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast.success('Chat exported successfully')
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
        return 'Analyzing Symptoms'
      case 'completed':
        return 'Diagnosis Complete'
      default:
        return 'Ready'
    }
  }

  if (!session) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-4">
      {/* Chat Header */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <Bot className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg">AI Medical Assistant</CardTitle>
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  {getStateIcon()}
                  <span>{getStateText()}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={restartChat}
                disabled={isLoading}
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

      {/* Chat Messages */}
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
                    className={`flex items-start space-x-2 max-w-[80%] ${
                      message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {message.role === 'user' ? (
                        <User className="h-4 w-4" />
                      ) : (
                        <Bot className="h-4 w-4" />
                      )}
                    </div>
                    <div
                      className={`rounded-lg px-3 py-2 ${
                        message.role === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-start space-x-2 max-w-[80%]">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center bg-muted text-muted-foreground">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="rounded-lg px-3 py-2 bg-muted">
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
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

      {/* Quick Replies */}
      {showQuickReplies && session.messages.length <= 2 && (
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm text-muted-foreground mb-3">Quick replies:</p>
            <div className="flex flex-wrap gap-2">
              {quickReplies.map((reply, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickReply(reply)}
                  disabled={isLoading}
                >
                  {reply}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Patient Data Summary */}
      {Object.keys(session.patientData).length > 1 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Collected Information</CardTitle>
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
                <Badge variant="secondary">Temp: {session.patientData.temperature}°C</Badge>
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

      {/* Input Area */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex space-x-2">
            <Input
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message here..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button
              onClick={() => sendMessage(inputMessage)}
              disabled={!inputMessage.trim() || isLoading}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Press Enter to send, Shift+Enter for new line
          </p>
        </CardContent>
      </Card>

      {/* Medical Disclaimer */}
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="pt-4">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />
            <p className="text-xs text-amber-700">
              This AI assistant provides preliminary assessments only. Always consult with a qualified 
              healthcare professional for proper medical diagnosis and treatment.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
