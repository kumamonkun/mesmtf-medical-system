import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Validation schema for AI diagnosis request
const aiDiagnosisSchema = z.object({
  patient_id: z.string().uuid('Invalid patient ID format'),
  symptoms: z.array(z.string()).min(1, 'At least one symptom is required'),
  patient_age: z.number().min(0).max(150, 'Invalid age'),
  patient_gender: z.enum(['male', 'female', 'other']),
  additional_info: z.string().max(1000, 'Additional info must be less than 1000 characters').optional()
});

// POST /api/diagnoses/ai-diagnosis - Run AI diagnosis
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has permission to run AI diagnosis
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['admin', 'doctor', 'nurse'].includes(profile.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    
    // Validate input data
    const validatedData = aiDiagnosisSchema.parse(body);

    // Check if patient exists
    const { data: patient } = await supabase
      .from('patients')
      .select('id, first_name, last_name, medical_history, allergies, chronic_conditions')
      .eq('id', validatedData.patient_id)
      .single();

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 400 });
    }

    // Get expert system rules
    const { data: rules, error: rulesError } = await supabase
      .from('expert_system_rules')
      .select('*')
      .eq('is_active', true)
      .order('priority', { ascending: true });

    if (rulesError) {
      console.error('Error fetching expert system rules:', rulesError);
      return NextResponse.json({ error: 'Failed to fetch expert system rules' }, { status: 500 });
    }

    // Run AI diagnosis
    const diagnosisResult = await runExpertSystemDiagnosis(
      validatedData.symptoms,
      validatedData.patient_age,
      validatedData.patient_gender,
      patient,
      rules || []
    );

    // Store the AI diagnosis result
    const { data: aiDiagnosis, error: storeError } = await supabase
      .from('diagnoses')
      .insert({
        patient_id: validatedData.patient_id,
        doctor_id: user.id, // Current user as the doctor
        symptoms: validatedData.symptoms,
        diagnosis: diagnosisResult.primaryDiagnosis,
        confidence_level: diagnosisResult.confidence,
        expert_system_result: JSON.stringify(diagnosisResult),
        requires_xray: diagnosisResult.requiresXray,
        requires_lab_tests: diagnosisResult.requiresLabTests,
        doctor_notes: `AI-generated diagnosis based on symptoms: ${validatedData.symptoms.join(', ')}`,
        status: 'pending',
        severity: diagnosisResult.severity,
        follow_up_required: diagnosisResult.followUpRequired,
        created_by: user.id
      })
      .select(`
        *,
        patient:patients!diagnoses_patient_id_fkey(
          id,
          patient_id,
          first_name,
          last_name
        )
      `)
      .single();

    if (storeError) {
      console.error('Error storing AI diagnosis:', storeError);
      return NextResponse.json({ error: 'Failed to store AI diagnosis' }, { status: 500 });
    }

    return NextResponse.json({
      diagnosis: aiDiagnosis,
      aiResult: diagnosisResult,
      message: 'AI diagnosis completed successfully'
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.errors 
      }, { status: 400 });
    }
    
    console.error('Error in POST /api/diagnoses/ai-diagnosis:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Expert System Diagnosis Logic
async function runExpertSystemDiagnosis(
  symptoms: string[],
  age: number,
  gender: string,
  patient: any,
  rules: any[]
) {
  // Convert symptoms to lowercase for matching
  const normalizedSymptoms = symptoms.map(s => s.toLowerCase());
  
  // Initialize diagnosis scores
  const diagnosisScores: { [key: string]: number } = {};
  const diagnosisDetails: { [key: string]: any } = {};
  
  // Process each rule
  for (const rule of rules) {
    const ruleSymptoms = rule.symptoms || [];
    const ruleConditions = rule.conditions || {};
    
    // Check if patient symptoms match rule symptoms
    const matchingSymptoms = ruleSymptoms.filter((symptom: string) => 
      normalizedSymptoms.some(ns => ns.includes(symptom.toLowerCase()))
    );
    
    // Calculate match percentage
    const matchPercentage = (matchingSymptoms.length / ruleSymptoms.length) * 100;
    
    // Check age conditions
    const ageMatch = !ruleConditions.min_age || age >= ruleConditions.min_age;
    const ageMaxMatch = !ruleConditions.max_age || age <= ruleConditions.max_age;
    
    // Check gender conditions
    const genderMatch = !ruleConditions.gender || ruleConditions.gender === gender;
    
    // Check medical history conditions
    const medicalHistoryMatch = !ruleConditions.medical_history || 
      (patient.medical_history && patient.medical_history.toLowerCase().includes(ruleConditions.medical_history.toLowerCase()));
    
    // Check allergy conditions
    const allergyMatch = !ruleConditions.allergies || 
      (patient.allergies && patient.allergies.toLowerCase().includes(ruleConditions.allergies.toLowerCase()));
    
    // Calculate overall match score
    if (matchPercentage >= 50 && ageMatch && ageMaxMatch && genderMatch && medicalHistoryMatch && allergyMatch) {
      const score = matchPercentage * (rule.weight || 1);
      
      if (!diagnosisScores[rule.disease]) {
        diagnosisScores[rule.disease] = 0;
        diagnosisDetails[rule.disease] = {
          disease: rule.disease,
          description: rule.description,
          symptoms: ruleSymptoms,
          treatment: rule.treatment,
          severity: rule.severity,
          requires_xray: rule.requires_xray || false,
          requires_lab_tests: rule.requires_lab_tests || false,
          follow_up_required: rule.follow_up_required || false
        };
      }
      
      diagnosisScores[rule.disease] += score;
    }
  }
  
  // Find the highest scoring diagnosis
  const sortedDiagnoses = Object.entries(diagnosisScores)
    .sort(([,a], [,b]) => b - a);
  
  const primaryDiagnosis = sortedDiagnoses[0]?.[0] || 'Unknown condition';
  const confidence = Math.min(sortedDiagnoses[0]?.[1] || 0, 100);
  
  // Determine severity based on symptoms and confidence
  let severity = 'mild';
  if (confidence >= 80) {
    severity = normalizedSymptoms.some(s => 
      ['severe', 'critical', 'emergency', 'unconscious', 'bleeding'].some(severe => s.includes(severe))
    ) ? 'critical' : 'moderate';
  }
  
  // Check if X-ray is required
  const requiresXray = normalizedSymptoms.some(s => 
    ['chest pain', 'breathing', 'cough', 'chest', 'lung', 'heart'].some(xray => s.includes(xray))
  );
  
  // Check if lab tests are required
  const requiresLabTests = normalizedSymptoms.some(s => 
    ['fever', 'infection', 'blood', 'urine', 'stool'].some(lab => s.includes(lab))
  );
  
  // Determine if follow-up is required
  const followUpRequired = confidence >= 70 || severity === 'moderate' || severity === 'critical';
  
  return {
    primaryDiagnosis,
    confidence: Math.round(confidence),
    severity,
    requiresXray,
    requiresLabTests,
    followUpRequired,
    alternativeDiagnoses: sortedDiagnoses.slice(1, 4).map(([disease, score]) => ({
      disease,
      confidence: Math.round(score),
      details: diagnosisDetails[disease]
    })),
    matchedSymptoms: normalizedSymptoms,
    recommendations: generateRecommendations(primaryDiagnosis, severity, requiresXray, requiresLabTests),
    details: diagnosisDetails[primaryDiagnosis] || {}
  };
}

// Generate recommendations based on diagnosis
function generateRecommendations(diagnosis: string, severity: string, requiresXray: boolean, requiresLabTests: boolean) {
  const recommendations = [];
  
  if (requiresXray) {
    recommendations.push('Immediate X-ray examination recommended');
  }
  
  if (requiresLabTests) {
    recommendations.push('Laboratory tests required for confirmation');
  }
  
  if (severity === 'critical') {
    recommendations.push('Immediate medical attention required');
    recommendations.push('Consider emergency department visit');
  } else if (severity === 'moderate') {
    recommendations.push('Schedule follow-up appointment within 24-48 hours');
  }
  
  if (diagnosis.toLowerCase().includes('malaria')) {
    recommendations.push('Blood smear test for malaria parasites');
    recommendations.push('Monitor temperature and symptoms closely');
  }
  
  if (diagnosis.toLowerCase().includes('typhoid')) {
    recommendations.push('Blood culture and Widal test recommended');
    recommendations.push('Monitor for complications');
  }
  
  return recommendations;
}
