import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Drug interaction database (in real system, this would be a comprehensive database)
const DRUG_INTERACTIONS = {
  'Chloroquine': {
    'Ciprofloxacin': {
      severity: 'moderate',
      description: 'May increase risk of QT prolongation',
      recommendation: 'Monitor ECG if co-administered'
    },
    'Azithromycin': {
      severity: 'moderate',
      description: 'May increase risk of QT prolongation',
      recommendation: 'Monitor ECG if co-administered'
    }
  },
  'Ciprofloxacin': {
    'Chloroquine': {
      severity: 'moderate',
      description: 'May increase risk of QT prolongation',
      recommendation: 'Monitor ECG if co-administered'
    },
    'Azithromycin': {
      severity: 'moderate',
      description: 'May increase risk of QT prolongation',
      recommendation: 'Monitor ECG if co-administered'
    }
  },
  'Azithromycin': {
    'Chloroquine': {
      severity: 'moderate',
      description: 'May increase risk of QT prolongation',
      recommendation: 'Monitor ECG if co-administered'
    },
    'Ciprofloxacin': {
      severity: 'moderate',
      description: 'May increase risk of QT prolongation',
      recommendation: 'Monitor ECG if co-administered'
    }
  },
  'Artemether-Lumefantrine': {
    'Ciprofloxacin': {
      severity: 'minor',
      description: 'May decrease effectiveness of artemether',
      recommendation: 'Monitor treatment response'
    }
  }
};

// GET /api/drugs/interactions - Check drug interactions
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user has permission to check drug interactions
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['admin', 'pharmacist', 'doctor', 'nurse'].includes(profile.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const drugNames = searchParams.get('drugs')?.split(',') || [];

    if (drugNames.length < 2) {
      return NextResponse.json({ 
        error: 'At least 2 drugs are required to check interactions' 
      }, { status: 400 });
    }

    // Check for interactions
    const interactions = [];
    const checkedPairs = new Set();

    for (let i = 0; i < drugNames.length; i++) {
      for (let j = i + 1; j < drugNames.length; j++) {
        const drug1 = drugNames[i].trim();
        const drug2 = drugNames[j].trim();
        const pairKey = `${drug1}-${drug2}`;
        const reversePairKey = `${drug2}-${drug1}`;

        // Avoid checking the same pair twice
        if (checkedPairs.has(pairKey) || checkedPairs.has(reversePairKey)) {
          continue;
        }

        checkedPairs.add(pairKey);

        // Check both directions
        const interaction = DRUG_INTERACTIONS[drug1]?.[drug2] || DRUG_INTERACTIONS[drug2]?.[drug1];
        
        if (interaction) {
          interactions.push({
            drug1,
            drug2,
            severity: interaction.severity,
            description: interaction.description,
            recommendation: interaction.recommendation
          });
        }
      }
    }

    // Calculate risk level
    const hasCritical = interactions.some(i => i.severity === 'critical');
    const hasModerate = interactions.some(i => i.severity === 'moderate');
    const hasMinor = interactions.some(i => i.severity === 'minor');

    let riskLevel = 'none';
    if (hasCritical) riskLevel = 'critical';
    else if (hasModerate) riskLevel = 'moderate';
    else if (hasMinor) riskLevel = 'minor';

    return NextResponse.json({
      drugs_checked: drugNames,
      interactions,
      risk_level: riskLevel,
      summary: {
        total_interactions: interactions.length,
        critical_count: interactions.filter(i => i.severity === 'critical').length,
        moderate_count: interactions.filter(i => i.severity === 'moderate').length,
        minor_count: interactions.filter(i => i.severity === 'minor').length
      }
    });

  } catch (error) {
    console.error('Error in GET /api/drugs/interactions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/drugs/interactions - Check interactions for a prescription
export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { prescription_ids } = body;

    if (!prescription_ids || !Array.isArray(prescription_ids)) {
      return NextResponse.json({ 
        error: 'prescription_ids array is required' 
      }, { status: 400 });
    }

    // Get prescriptions with drug information
    const { data: prescriptions, error: prescriptionsError } = await supabase
      .from('prescriptions')
      .select(`
        id,
        drug:drugs!prescriptions_drug_id_fkey(
          id,
          name,
          generic_name
        )
      `)
      .in('id', prescription_ids);

    if (prescriptionsError) {
      console.error('Error fetching prescriptions:', prescriptionsError);
      return NextResponse.json({ error: 'Failed to fetch prescriptions' }, { status: 500 });
    }

    // Extract drug names
    const drugNames = prescriptions
      .map(p => p.drug?.name)
      .filter(Boolean);

    if (drugNames.length < 2) {
      return NextResponse.json({
        drugs_checked: drugNames,
        interactions: [],
        risk_level: 'none',
        summary: {
          total_interactions: 0,
          critical_count: 0,
          moderate_count: 0,
          minor_count: 0
        }
      });
    }

    // Check interactions using the same logic as GET
    const interactions = [];
    const checkedPairs = new Set();

    for (let i = 0; i < drugNames.length; i++) {
      for (let j = i + 1; j < drugNames.length; j++) {
        const drug1 = drugNames[i];
        const drug2 = drugNames[j];
        const pairKey = `${drug1}-${drug2}`;

        if (checkedPairs.has(pairKey)) continue;
        checkedPairs.add(pairKey);

        const interaction = DRUG_INTERACTIONS[drug1]?.[drug2] || DRUG_INTERACTIONS[drug2]?.[drug1];
        
        if (interaction) {
          interactions.push({
            drug1,
            drug2,
            severity: interaction.severity,
            description: interaction.description,
            recommendation: interaction.recommendation
          });
        }
      }
    }

    const hasCritical = interactions.some(i => i.severity === 'critical');
    const hasModerate = interactions.some(i => i.severity === 'moderate');
    const hasMinor = interactions.some(i => i.severity === 'minor');

    let riskLevel = 'none';
    if (hasCritical) riskLevel = 'critical';
    else if (hasModerate) riskLevel = 'moderate';
    else if (hasMinor) riskLevel = 'minor';

    return NextResponse.json({
      drugs_checked: drugNames,
      interactions,
      risk_level: riskLevel,
      summary: {
        total_interactions: interactions.length,
        critical_count: interactions.filter(i => i.severity === 'critical').length,
        moderate_count: interactions.filter(i => i.severity === 'moderate').length,
        minor_count: interactions.filter(i => i.severity === 'minor').length
      }
    });

  } catch (error) {
    console.error('Error in POST /api/drugs/interactions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
