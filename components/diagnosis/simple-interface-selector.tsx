"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MessageCircle, FileText } from "lucide-react"

interface SimpleInterfaceSelectorProps {
  onSelectInterface: (interfaceType: 'chatbot' | 'form') => void
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
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col items-center space-y-4 p-6 border rounded-lg hover:shadow-md transition-shadow">
          <MessageCircle className="h-12 w-12 text-blue-500" />
          <h3 className="text-xl font-semibold">AI Chat Assistant</h3>
          <p className="text-center text-muted-foreground text-sm">
            Engage in a natural conversation with our AI to describe your symptoms.
          </p>
          <Button onClick={() => onSelectInterface('chatbot')} className="w-full">
            Start Chat
          </Button>
        </div>
        <div className="flex flex-col items-center space-y-4 p-6 border rounded-lg hover:shadow-md transition-shadow">
          <FileText className="h-12 w-12 text-green-500" />
          <h3 className="text-xl font-semibold">Multi-Step Form</h3>
          <p className="text-center text-muted-foreground text-sm">
            Fill out a structured form to quickly input your patient and symptom details.
          </p>
          <Button onClick={() => onSelectInterface('form')} className="w-full">
            Use Form
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
