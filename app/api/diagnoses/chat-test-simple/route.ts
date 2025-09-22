import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const message = body.message || '';

    // Simple fallback responses
    const getResponse = (userMessage: string) => {
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
      
      return "I understand. Let me ask you some specific questions to better assess your condition. Are you currently experiencing any fever, chills, or body aches?";
    };

    const response = getResponse(message);
    
    return NextResponse.json({
      sessionId: `test_${Date.now()}`,
      message: response,
      patientData: { symptoms: [] },
      diagnosisState: 'collecting'
    });

  } catch (error) {
    console.error('Error in chat test:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
