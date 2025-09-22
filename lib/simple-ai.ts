// Simple AI chatbot for medical diagnosis
export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface PatientData {
  age?: number
  gender?: 'male' | 'female' | 'other'
  weight?: number
  temperature?: number
  duration?: string
  symptoms: string[]
  additionalInfo?: string
}

export interface ChatSession {
  id: string
  messages: ChatMessage[]
  patientData: PatientData
  diagnosisState: 'collecting' | 'analyzing' | 'completed'
  createdAt: Date
  updatedAt: Date
}

class SimpleAI {
  private responses = {
    greeting: [
      "Hello! I'm your AI medical assistant. I'm here to help you with a preliminary assessment for Malaria and Typhoid symptoms. How are you feeling today?",
      "Hi there! I'm here to help assess your symptoms. Let's start by understanding what you're experiencing. How are you feeling?",
      "Welcome! I'm your AI medical assistant specializing in Malaria and Typhoid diagnosis. What symptoms are you experiencing today?"
    ],
    fever: [
      "I understand you have a fever. That's an important symptom. Can you tell me your current temperature if you've measured it? Also, how long have you had this fever?",
      "A fever can indicate various conditions. What's your temperature reading, and how long have you been experiencing this fever?",
      "Fever is a key symptom. Please share your temperature and how long you've had it so I can better assess your condition."
    ],
    headache: [
      "Headaches can be associated with many conditions. Can you describe the type of headache you're experiencing? Is it severe, throbbing, or constant?",
      "I see you have a headache. Can you tell me more about it? Is it a sharp pain, dull ache, or something else?",
      "Headaches are common symptoms. Can you describe the intensity and type of headache you're experiencing?"
    ],
    abdominal: [
      "Abdominal pain can be concerning. Can you describe where exactly the pain is located and its intensity? Is it constant or intermittent?",
      "I understand you have abdominal pain. Can you tell me more about the location and nature of the pain?",
      "Abdominal discomfort is important to assess. Where exactly is the pain located and how would you describe it?"
    ],
    nausea: [
      "Nausea and vomiting can be very uncomfortable. Have you been able to keep food down? Are you experiencing any diarrhea as well?",
      "I see you're feeling nauseous. Have you vomited, and are you able to eat normally?",
      "Nausea is a significant symptom. Can you tell me if you've vomited and whether you can keep food down?"
    ],
    fatigue: [
      "Fatigue is a common symptom. How long have you been feeling unusually tired, and does it affect your daily activities?",
      "I understand you're feeling fatigued. How long has this been going on, and is it impacting your normal routine?",
      "Fatigue can be indicative of several conditions. How long have you been experiencing this tiredness?"
    ],
    age: [
      "Thank you for that information. What's your age? This helps me understand your risk factors better.",
      "That's helpful. Can you tell me your age? This information is important for proper assessment.",
      "I'd like to know your age to better assess your condition. What's your age?"
    ],
    gender: [
      "Thank you. What's your gender? This helps me understand your risk factors better.",
      "That's useful information. What's your gender? This helps with proper assessment.",
      "Can you tell me your gender? This information helps me provide better guidance."
    ],
    temperature: [
      "That's important information. A high temperature can be significant. Can you tell me your current temperature if you've measured it?",
      "Temperature is crucial for assessment. What's your current temperature reading?",
      "A fever is a key symptom. What's your temperature if you've measured it?"
    ],
    duration: [
      "Thank you for that information. How long have you been experiencing these symptoms?",
      "That's helpful. How long have you had these symptoms?",
      "Can you tell me how long you've been experiencing these symptoms?"
    ],
    default: [
      "I understand. Let me ask you some specific questions to better assess your condition. Are you currently experiencing any fever, chills, or body aches?",
      "Thank you for that information. Let me gather more details. Do you have any fever, headache, or abdominal pain?",
      "I see. To better help you, can you tell me if you're experiencing fever, headache, or any abdominal discomfort?"
    ]
  }

  createSession(): ChatSession {
    return {
      id: `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      messages: [],
      patientData: { symptoms: [] },
      diagnosisState: 'collecting',
      createdAt: new Date(),
      updatedAt: new Date()
    }
  }

  addMessage(session: ChatSession, role: 'user' | 'assistant', content: string): ChatSession {
    const newMessage: ChatMessage = {
      role,
      content,
      timestamp: new Date()
    }
    
    return {
      ...session,
      messages: [...session.messages, newMessage],
      updatedAt: new Date()
    }
  }

  generateResponse(userMessage: string, session: ChatSession): string {
    const lowerMessage = userMessage.toLowerCase()
    
    // Check for specific keywords and return appropriate responses
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('start')) {
      return this.getRandomResponse('greeting')
    }
    
    if (lowerMessage.includes('fever') || lowerMessage.includes('temperature')) {
      return this.getRandomResponse('fever')
    }
    
    if (lowerMessage.includes('headache') || lowerMessage.includes('head pain')) {
      return this.getRandomResponse('headache')
    }
    
    if (lowerMessage.includes('abdominal') || lowerMessage.includes('stomach') || lowerMessage.includes('belly')) {
      return this.getRandomResponse('abdominal')
    }
    
    if (lowerMessage.includes('nausea') || lowerMessage.includes('nauseous') || lowerMessage.includes('vomit')) {
      return this.getRandomResponse('nausea')
    }
    
    if (lowerMessage.includes('fatigue') || lowerMessage.includes('tired') || lowerMessage.includes('weak')) {
      return this.getRandomResponse('fatigue')
    }
    
    if (lowerMessage.includes('age') || lowerMessage.includes('old') || lowerMessage.includes('years')) {
      return this.getRandomResponse('age')
    }
    
    if (lowerMessage.includes('gender') || lowerMessage.includes('male') || lowerMessage.includes('female')) {
      return this.getRandomResponse('gender')
    }
    
    if (lowerMessage.includes('how long') || lowerMessage.includes('duration') || lowerMessage.includes('days')) {
      return this.getRandomResponse('duration')
    }
    
    // Default response
    return this.getRandomResponse('default')
  }

  private getRandomResponse(category: keyof typeof this.responses): string {
    const responses = this.responses[category]
    return responses[Math.floor(Math.random() * responses.length)]
  }

  extractPatientData(messages: ChatMessage[]): Partial<PatientData> {
    const data: Partial<PatientData> = { symptoms: [] }
    const allText = messages.map(m => m.content).join(' ').toLowerCase()

    // Extract age
    const ageMatch = allText.match(/(\d+)\s*(?:years?|yrs?|old)/)
    if (ageMatch) {
      data.age = parseInt(ageMatch[1])
    }

    // Extract gender
    if (allText.includes('male') && !allText.includes('female')) {
      data.gender = 'male'
    } else if (allText.includes('female') && !allText.includes('male')) {
      data.gender = 'female'
    } else if (allText.includes('other')) {
      data.gender = 'other'
    }

    // Extract temperature
    const tempMatch = allText.match(/(\d+\.?\d*)\s*(?:°c|degrees?|celsius)/i)
    if (tempMatch) {
      data.temperature = parseFloat(tempMatch[1])
    }

    // Extract weight
    const weightMatch = allText.match(/(\d+\.?\d*)\s*(?:kg|kilograms?|pounds?|lbs?)/i)
    if (weightMatch) {
      data.weight = parseFloat(weightMatch[1])
    }

    // Extract symptoms
    const symptomKeywords = [
      'fever', 'headache', 'abdominal pain', 'vomiting', 'nausea', 'fatigue',
      'chills', 'sweating', 'rash', 'cough', 'sore throat', 'muscle pain',
      'back pain', 'chest pain', 'diarrhea', 'constipation', 'loss of appetite',
      'weakness', 'tiredness', 'stomach issues'
    ]

    data.symptoms = symptomKeywords.filter(keyword => 
      allText.includes(keyword.toLowerCase())
    )

    return data
  }

  // Simple diagnosis logic based on symptoms
  generateDiagnosis(patientData: PatientData): { diagnosis: string; confidence: number; recommendations: string[] } {
    const symptoms = patientData.symptoms || []
    const age = patientData.age || 0
    const temperature = patientData.temperature || 0

    let diagnosis = 'No specific diagnosis'
    let confidence = 0
    let recommendations: string[] = []

    // Simple rule-based diagnosis
    if (symptoms.includes('fever') && symptoms.includes('headache') && symptoms.includes('abdominal pain')) {
      if (temperature > 38.5) {
        diagnosis = 'Possible Typhoid Fever'
        confidence = 85
        recommendations = [
          'Seek immediate medical attention',
          'Get blood culture test',
          'Consider Widal test',
          'Monitor temperature regularly',
          'Stay hydrated'
        ]
      } else {
        diagnosis = 'Possible Malaria'
        confidence = 75
        recommendations = [
          'Get malaria blood test (RDT or microscopy)',
          'Monitor symptoms closely',
          'Seek medical consultation',
          'Rest and stay hydrated'
        ]
      }
    } else if (symptoms.includes('fever') && symptoms.includes('chills')) {
      diagnosis = 'Possible Malaria'
      confidence = 70
      recommendations = [
        'Get malaria blood test',
        'Monitor temperature',
        'Seek medical attention',
        'Rest adequately'
      ]
    } else if (symptoms.includes('fever') && symptoms.includes('abdominal pain')) {
      diagnosis = 'Possible Typhoid Fever'
      confidence = 65
      recommendations = [
        'Get blood culture test',
        'Consider Widal test',
        'Seek medical consultation',
        'Monitor symptoms'
      ]
    } else if (symptoms.includes('fever')) {
      diagnosis = 'Fever of unknown origin'
      confidence = 50
      recommendations = [
        'Monitor temperature regularly',
        'Seek medical consultation',
        'Rest and stay hydrated',
        'Note any additional symptoms'
      ]
    } else {
      diagnosis = 'Insufficient information for diagnosis'
      confidence = 30
      recommendations = [
        'Provide more symptom details',
        'Consider medical consultation',
        'Monitor for new symptoms'
      ]
    }

    return { diagnosis, confidence, recommendations }
  }
}

export const simpleAI = new SimpleAI()
