import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/users/roles - Get available roles
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get available roles
    const roles = [
      {
        value: 'admin',
        label: 'Administrator',
        description: 'Full system access and user management',
        permissions: [
          'manage_users',
          'manage_patients',
          'manage_appointments',
          'manage_diagnoses',
          'manage_treatments',
          'manage_pharmacy',
          'view_reports',
          'system_settings'
        ],
        color: 'red'
      },
      {
        value: 'doctor',
        label: 'Doctor',
        description: 'Medical diagnosis and treatment management',
        permissions: [
          'view_patients',
          'manage_patients',
          'view_appointments',
          'manage_appointments',
          'create_diagnoses',
          'manage_treatments',
          'view_prescriptions',
          'view_reports'
        ],
        color: 'blue'
      },
      {
        value: 'nurse',
        label: 'Nurse',
        description: 'Patient care and assistance',
        permissions: [
          'view_patients',
          'manage_patients',
          'view_appointments',
          'manage_appointments',
          'view_diagnoses',
          'manage_treatments',
          'view_prescriptions'
        ],
        color: 'green'
      },
      {
        value: 'receptionist',
        label: 'Receptionist',
        description: 'Appointment and patient management',
        permissions: [
          'view_patients',
          'manage_patients',
          'view_appointments',
          'manage_appointments',
          'view_doctors'
        ],
        color: 'yellow'
      },
      {
        value: 'pharmacist',
        label: 'Pharmacist',
        description: 'Pharmacy and prescription management',
        permissions: [
          'view_patients',
          'view_prescriptions',
          'manage_prescriptions',
          'manage_drugs',
          'view_drug_administration'
        ],
        color: 'purple'
      },
      {
        value: 'patient',
        label: 'Patient',
        description: 'Patient portal access',
        permissions: [
          'view_own_profile',
          'update_own_profile',
          'view_own_appointments',
          'view_own_diagnoses',
          'view_own_prescriptions'
        ],
        color: 'gray'
      }
    ];

    return NextResponse.json({
      roles,
      total: roles.length
    });

  } catch (error) {
    console.error('Error in GET /api/users/roles:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
