import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

// Validation schema for symptom validation request
const validateSymptomsSchema = z.object({
  symptoms: z.array(z.string()).min(1, 'At least one symptom is required'),
  patient_age: z.number().min(0).max(150, 'Invalid age'),
  patient_gender: z.enum(['male', 'female', 'other']),
  additional_info: z.string().max(1000, 'Additional info must be less than 1000 characters').optional()
});

// POST /api/diagnoses/validate-symptoms - Validate symptoms and get preliminary analysis
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has permission to validate symptoms
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
    const validatedData = validateSymptomsSchema.parse(body);

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

    // Validate symptoms against expert system rules
    const validationResult = await validateSymptomsAgainstRules(
      validatedData.symptoms,
      validatedData.patient_age,
      validatedData.patient_gender,
      rules || []
    );

    return NextResponse.json({
      symptoms: validatedData.symptoms,
      validation: validationResult,
      recommendations: generateSymptomRecommendations(validationResult),
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Validation error', 
        details: error.errors 
      }, { status: 400 });
    }
    
    console.error('Error in POST /api/diagnoses/validate-symptoms:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Validate symptoms against expert system rules
async function validateSymptomsAgainstRules(
  symptoms: string[],
  age: number,
  gender: string,
  rules: any[]
) {
  // Convert symptoms to lowercase for matching
  const normalizedSymptoms = symptoms.map(s => s.toLowerCase());
  
  // Initialize validation results
  const validationResults = {
    validSymptoms: [] as string[],
    invalidSymptoms: [] as string[],
    potentialDiagnoses: [] as any[],
    severity: 'mild' as string,
    requiresImmediateAttention: false,
    confidence: 0
  };
  
  // Check each symptom against known symptoms in rules
  for (const symptom of normalizedSymptoms) {
    const isKnownSymptom = rules.some(rule => 
      (rule.symptoms || []).some((ruleSymptom: string) => 
        ruleSymptom.toLowerCase().includes(symptom) || symptom.includes(ruleSymptom.toLowerCase())
      )
    );
    
    if (isKnownSymptom) {
      validationResults.validSymptoms.push(symptom);
    } else {
      validationResults.invalidSymptoms.push(symptom);
    }
  }
  
  // Find potential diagnoses
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
    
    // Calculate overall match score
    if (matchPercentage >= 30 && ageMatch && ageMaxMatch && genderMatch) {
      const score = matchPercentage * (rule.weight || 1);
      
      validationResults.potentialDiagnoses.push({
        disease: rule.disease,
        description: rule.description,
        confidence: Math.round(score),
        matchedSymptoms: matchingSymptoms,
        severity: rule.severity || 'mild',
        requires_xray: rule.requires_xray || false,
        requires_lab_tests: rule.requires_lab_tests || false,
        treatment: rule.treatment
      });
    }
  }
  
  // Sort potential diagnoses by confidence
  validationResults.potentialDiagnoses.sort((a, b) => b.confidence - a.confidence);
  
  // Determine overall severity
  const hasSevereSymptoms = normalizedSymptoms.some(s => 
    ['severe', 'critical', 'emergency', 'unconscious', 'bleeding', 'chest pain', 'difficulty breathing'].some(severe => s.includes(severe))
  );
  
  if (hasSevereSymptoms) {
    validationResults.severity = 'critical';
    validationResults.requiresImmediateAttention = true;
  } else if (validationResults.potentialDiagnoses.length > 0) {
    validationResults.severity = validationResults.potentialDiagnoses[0].severity;
  }
  
  // Calculate overall confidence
  if (validationResults.potentialDiagnoses.length > 0) {
    validationResults.confidence = validationResults.potentialDiagnoses[0].confidence;
  }
  
  return validationResults;
}

// Generate recommendations based on symptom validation
function generateSymptomRecommendations(validationResult: any) {
  const recommendations = [];
  
  // Recommendations for invalid symptoms
  if (validationResult.invalidSymptoms.length > 0) {
    recommendations.push({
      type: 'warning',
      message: `The following symptoms may not be recognized: ${validationResult.invalidSymptoms.join(', ')}. Please provide more specific descriptions.`
    });
  }
  
  // Recommendations for severe symptoms
  if (validationResult.requiresImmediateAttention) {
    recommendations.push({
      type: 'urgent',
      message: 'These symptoms require immediate medical attention. Please visit the emergency department or call emergency services.'
    });
  }
  
  // Recommendations for potential diagnoses
  if (validationResult.potentialDiagnoses.length > 0) {
    const topDiagnosis = validationResult.potentialDiagnoses[0];
    
    if (topDiagnosis.confidence >= 70) {
      recommendations.push({
        type: 'high_confidence',
        message: `High confidence in ${topDiagnosis.disease}. Consider immediate treatment.`
      });
    } else if (topDiagnosis.confidence >= 50) {
      recommendations.push({
        type: 'moderate_confidence',
        message: `Moderate confidence in ${topDiagnosis.disease}. Further investigation recommended.`
      });
    } else {
      recommendations.push({
        type: 'low_confidence',
        message: 'Low confidence in diagnosis. Additional symptoms or tests may be needed.'
      });
    }
    
    // Specific recommendations based on diagnosis
    if (topDiagnosis.requires_xray) {
      recommendations.push({
        type: 'test',
        message: 'X-ray examination recommended for confirmation.'
      });
    }
    
    if (topDiagnosis.requires_lab_tests) {
      recommendations.push({
        type: 'test',
        message: 'Laboratory tests required for accurate diagnosis.'
      });
    }
  }
  
  // General recommendations
  if (validationResult.validSymptoms.length === 0) {
    recommendations.push({
      type: 'info',
      message: 'No recognized symptoms found. Please provide more detailed symptom descriptions.'
    });
  }
  
  return recommendations;
}
