"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MessageCircle, FileText, Brain, Zap } from "lucide-react"

interface SimpleInterfaceSelectorProps {
  onSelectInterface: (interfaceType: 'simple-chatbot' | 'advanced-chatbot' | 'form') => void
  user: any
}

export function SimpleInterfaceSelector({ onSelectInterface, user }: SimpleInterfaceSelectorProps) {
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Choose Your Diagnosis Method</CardTitle>
        <CardDescription>
          Select how you'd like to interact with our AI diagnosis system.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex flex-col items-center space-y-4 p-6 border rounded-lg hover:shadow-md transition-shadow">
          <MessageCircle className="h-12 w-12 text-blue-500" />
          <h3 className="text-xl font-semibold">Simple AI Chat</h3>
          <p className="text-center text-muted-foreground text-sm">
            Basic AI conversation for quick symptom assessment.
          </p>
          <Button onClick={() => onSelectInterface('simple-chatbot')} className="w-full">
            Start Simple Chat
          </Button>
        </div>
        <div className="flex flex-col items-center space-y-4 p-6 border rounded-lg hover:shadow-md transition-shadow bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200">
          <div className="relative">
            <Brain className="h-12 w-12 text-purple-500" />
            <Zap className="h-4 w-4 text-yellow-500 absolute -top-1 -right-1" />
          </div>
          <h3 className="text-xl font-semibold">Advanced AI (GPT-4.1)</h3>
          <p className="text-center text-muted-foreground text-sm">
            Advanced AI with comprehensive medical analysis and detailed diagnosis.
          </p>
          <Button 
            onClick={() => onSelectInterface('advanced-chatbot')} 
            className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
          >
            Start Advanced AI
          </Button>
        </div>
        <div className="flex flex-col items-center space-y-4 p-6 border rounded-lg hover:shadow-md transition-shadow">
          <FileText className="h-12 w-12 text-green-500" />
          <h3 className="text-xl font-semibold">Multi-Step Form</h3>
          <p className="text-center text-muted-foreground text-sm">
            Structured form for comprehensive symptom analysis.
          </p>
          <Button onClick={() => onSelectInterface('form')} className="w-full">
            Use Form
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
