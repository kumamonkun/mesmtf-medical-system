import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Validation schema for chat messages
const chatMessageSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty'),
  sessionId: z.string().optional(),
  patientData: z.object({
    age: z.number().optional(),
    gender: z.enum(['male', 'female', 'other']).optional(),
    weight: z.number().optional(),
    temperature: z.number().optional(),
    duration: z.string().optional(),
    symptoms: z.array(z.string()).default([]),
    additionalInfo: z.string().optional()
  }).optional()
});

// Simple fallback responses for testing
const getFallbackResponse = (userMessage: string) => {
  const lowerMessage = userMessage.toLowerCase();
  
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
    return "Hello! I'm your AI medical assistant. I'm here to help you with a preliminary assessment for Malaria and Typhoid symptoms. How are you feeling today?";
  }
  
  if (lowerMessage.includes('fever') || lowerMessage.includes('temperature')) {
    return "I understand you're experiencing a fever. That's an important symptom. Can you tell me your current temperature if you've measured it? Also, how long have you had this fever?";
  }
  
  if (lowerMessage.includes('headache')) {
    return "Headaches can be associated with various conditions. Can you describe the type of headache you're experiencing? Is it severe, throbbing, or constant?";
  }
  
  if (lowerMessage.includes('pain') || lowerMessage.includes('ache')) {
    return "I understand you're experiencing pain. Can you tell me more about the location and type of pain? Is it sharp, dull, or cramping?";
  }
  
  if (lowerMessage.includes('nausea') || lowerMessage.includes('vomit')) {
    return "Nausea and vomiting are important symptoms. Have you been able to keep food down? Are you experiencing any abdominal discomfort?";
  }
  
  if (lowerMessage.includes('age') || lowerMessage.includes('old')) {
    return "Thank you for that information. What's your age? This helps me understand your risk factors better.";
  }
  
  if (lowerMessage.includes('gender') || lowerMessage.includes('male') || lowerMessage.includes('female')) {
    return "Thank you. What's your gender? This helps me understand your risk factors better.";
  }
  
  if (lowerMessage.includes('weight')) {
    return "That's helpful. What's your approximate weight? This helps with medication considerations.";
  }
  
  if (lowerMessage.includes('how long') || lowerMessage.includes('duration') || lowerMessage.includes('days')) {
    return "Thank you for that information. How long have you been experiencing these symptoms?";
  }
  
  return "I understand. Let me ask you some specific questions to better assess your condition. Are you currently experiencing any fever, chills, or body aches?";
};

// POST /api/diagnoses/chat - Send message to AI chatbot
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = chatMessageSchema.parse(body);

    // Generate a simple response using fallback logic
    const aiResponse = getFallbackResponse(validatedData.message);
    
    // Create a simple session ID
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    // Extract basic patient data from the message
    const extractedData = {
      symptoms: [],
      additionalInfo: validatedData.message
    };
    
    // Simple symptom extraction
    const lowerMessage = validatedData.message.toLowerCase();
    const symptoms = [];
    if (lowerMessage.includes('fever')) symptoms.push('fever');
    if (lowerMessage.includes('headache')) symptoms.push('headache');
    if (lowerMessage.includes('pain')) symptoms.push('pain');
    if (lowerMessage.includes('nausea')) symptoms.push('nausea');
    if (lowerMessage.includes('vomit')) symptoms.push('vomiting');
    if (lowerMessage.includes('cough')) symptoms.push('cough');
    if (lowerMessage.includes('chills')) symptoms.push('chills');
    
    extractedData.symptoms = symptoms;

    return NextResponse.json({
      sessionId: sessionId,
      message: aiResponse,
      patientData: extractedData,
      diagnosisState: 'collecting'
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.errors 
      }, { status: 400 });
    }
    
    console.error('Error in POST /api/diagnoses/chat:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
