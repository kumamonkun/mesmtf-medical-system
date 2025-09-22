import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { deepSeekAPI, DeepSeekMessage, ChatSession } from '@/lib/deepseek-api';
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

    // Get or create chat session
    let session: ChatSession;
    if (validatedData.sessionId) {
      // Try to retrieve existing session from database
      const { data: sessionData } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('id', validatedData.sessionId)
        .eq('user_id', user.id)
        .single();

      if (sessionData) {
        session = {
          id: sessionData.id,
          messages: sessionData.messages || [],
          patientData: sessionData.patient_data || { symptoms: [] },
          diagnosisState: sessionData.diagnosis_state || 'collecting',
          createdAt: new Date(sessionData.created_at),
          updatedAt: new Date(sessionData.updated_at)
        };
      } else {
        // Create new session if not found
        session = deepSeekAPI.createSession();
      }
    } else {
      // Create new session
      session = deepSeekAPI.createSession();
    }

    // Add user message to session
    session = deepSeekAPI.addMessage(session, 'user', validatedData.message);

    // Update patient data if provided
    if (validatedData.patientData) {
      session.patientData = {
        ...session.patientData,
        ...validatedData.patientData,
        symptoms: [...(session.patientData.symptoms || []), ...(validatedData.patientData.symptoms || [])]
      };
    }

    // Send message to DeepSeek API
    const response = await deepSeekAPI.sendMessage(session.messages);

    if ('choices' in response) {
      // Add AI response to session
      const aiMessage = response.choices[0]?.message;
      if (aiMessage) {
        session = deepSeekAPI.addMessage(session, 'assistant', aiMessage.content);
      }

      // Extract updated patient data from conversation
      const extractedData = deepSeekAPI.extractPatientData(session.messages);
      session.patientData = { ...session.patientData, ...extractedData };

      // Save session to database
      const { error: saveError } = await supabase
        .from('chat_sessions')
        .upsert({
          id: session.id,
          user_id: user.id,
          messages: session.messages,
          patient_data: session.patientData,
          diagnosis_state: session.diagnosisState,
          created_at: session.createdAt.toISOString(),
          updated_at: session.updatedAt.toISOString()
        });

      if (saveError) {
        console.error('Error saving chat session:', saveError);
      }

      return NextResponse.json({
        sessionId: session.id,
        message: aiMessage?.content || 'I apologize, but I encountered an error processing your message.',
        patientData: session.patientData,
        diagnosisState: session.diagnosisState,
        usage: response.usage
      });
    }

    return NextResponse.json({ error: 'Invalid response from AI service' }, { status: 500 });

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

// GET /api/diagnoses/chat - Get chat session
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    // Get chat session from database
    const { data: sessionData, error } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', user.id)
      .single();

    if (error || !sessionData) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const session: ChatSession = {
      id: sessionData.id,
      messages: sessionData.messages || [],
      patientData: sessionData.patient_data || { symptoms: [] },
      diagnosisState: sessionData.diagnosis_state || 'collecting',
      createdAt: new Date(sessionData.created_at),
      updatedAt: new Date(sessionData.updated_at)
    };

    return NextResponse.json({ session });

  } catch (error) {
    console.error('Error in GET /api/diagnoses/chat:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/diagnoses/chat - Delete chat session
export async function DELETE(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    // Delete chat session from database
    const { error } = await supabase
      .from('chat_sessions')
      .delete()
      .eq('id', sessionId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting chat session:', error);
      return NextResponse.json({ error: 'Failed to delete session' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Session deleted successfully' });

  } catch (error) {
    console.error('Error in DELETE /api/diagnoses/chat:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
