#!/usr/bin/env node

/**
 * Script to load comprehensive sample data into MESMTF database
 * Run with: node scripts/load-sample-data.js
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Sample data
const sampleUsers = [
  {
    email: 'dr.smith@mesmtf.com',
    password: 'doctor123',
    profile: {
      email: 'dr.smith@mesmtf.com',
      username: 'dr_smith',
      first_name: 'Sarah',
      last_name: 'Smith',
      role: 'doctor',
      phone: '+1234567890',
      specialization: 'Internal Medicine',
      address: 'Medical Center, Room 101'
    }
  },
  {
    email: 'dr.jones@mesmtf.com',
    password: 'doctor123',
    profile: {
      email: 'dr.jones@mesmtf.com',
      username: 'dr_jones',
      first_name: 'Michael',
      last_name: 'Jones',
      role: 'doctor',
      phone: '+1234567891',
      specialization: 'Infectious Diseases',
      address: 'Medical Center, Room 102'
    }
  },
  {
    email: 'nurse.brown@mesmtf.com',
    password: 'nurse123',
    profile: {
      email: 'nurse.brown@mesmtf.com',
      username: 'nurse_brown',
      first_name: 'Lisa',
      last_name: 'Brown',
      role: 'nurse',
      phone: '+1234567892',
      address: 'Medical Center, Ward A'
    }
  },
  {
    email: 'pharmacist.garcia@mesmtf.com',
    password: 'pharmacist123',
    profile: {
      email: 'pharmacist.garcia@mesmtf.com',
      username: 'pharmacist_garcia',
      first_name: 'Maria',
      last_name: 'Garcia',
      role: 'pharmacist',
      phone: '+1234567893',
      address: 'Pharmacy Department'
    }
  },
  {
    email: 'receptionist.wilson@mesmtf.com',
    password: 'receptionist123',
    profile: {
      email: 'receptionist.wilson@mesmtf.com',
      username: 'receptionist_wilson',
      first_name: 'Emma',
      last_name: 'Wilson',
      role: 'receptionist',
      phone: '+1234567894',
      address: 'Reception Desk'
    }
  }
]

const samplePatients = [
  {
    patient_id: 'P-2025-001',
    first_name: 'John',
    last_name: 'Doe',
    date_of_birth: '1985-03-15',
    gender: 'male',
    phone: '+1234567895',
    email: 'john.doe@email.com',
    address: '123 Main St, City, State',
    emergency_contact_name: 'Jane Doe',
    emergency_contact_phone: '+1234567896',
    medical_history: 'Hypertension, Diabetes Type 2',
    allergies: 'Penicillin, Shellfish',
    blood_type: 'A+',
    chronic_conditions: 'Hypertension, Diabetes'
  },
  {
    patient_id: 'P-2025-002',
    first_name: 'Alice',
    last_name: 'Johnson',
    date_of_birth: '1990-07-22',
    gender: 'female',
    phone: '+1234567897',
    email: 'alice.johnson@email.com',
    address: '456 Oak Ave, City, State',
    emergency_contact_name: 'Bob Johnson',
    emergency_contact_phone: '+1234567898',
    medical_history: 'Asthma',
    allergies: 'None known',
    blood_type: 'O+',
    chronic_conditions: 'Asthma'
  },
  {
    patient_id: 'P-2025-003',
    first_name: 'Bob',
    last_name: 'Wilson',
    date_of_birth: '1978-11-08',
    gender: 'male',
    phone: '+1234567899',
    email: 'bob.wilson@email.com',
    address: '789 Pine St, City, State',
    emergency_contact_name: 'Mary Wilson',
    emergency_contact_phone: '+1234567900',
    medical_history: 'Previous malaria infection (2023)',
    allergies: 'Sulfa drugs',
    blood_type: 'B+',
    chronic_conditions: 'None'
  }
]

const sampleDrugs = [
  {
    name: 'Chloroquine',
    generic_name: 'Chloroquine Phosphate',
    dosage_form: 'Tablet',
    strength: '250mg',
    manufacturer: 'Generic Pharmaceuticals',
    description: 'Antimalarial drug for treatment and prevention of malaria',
    contraindications: 'Retinal or visual field changes, myopathy, known hypersensitivity to chloroquine',
    side_effects: 'Nausea, vomiting, headache, dizziness, blurred vision',
    is_prescription_required: true
  },
  {
    name: 'Artemether-Lumefantrine',
    generic_name: 'Coartem',
    dosage_form: 'Tablet',
    strength: '20mg/120mg',
    manufacturer: 'Novartis',
    description: 'Combination antimalarial therapy for uncomplicated malaria',
    contraindications: 'Known hypersensitivity to artemether, lumefantrine, or any component',
    side_effects: 'Headache, dizziness, weakness, fatigue, nausea, vomiting',
    is_prescription_required: true
  },
  {
    name: 'Ciprofloxacin',
    generic_name: 'Ciprofloxacin Hydrochloride',
    dosage_form: 'Tablet',
    strength: '500mg',
    manufacturer: 'Generic Pharmaceuticals',
    description: 'Antibiotic for typhoid fever treatment',
    contraindications: 'Known hypersensitivity to ciprofloxacin or other quinolones',
    side_effects: 'Nausea, diarrhea, headache, dizziness, insomnia',
    is_prescription_required: true
  },
  {
    name: 'Azithromycin',
    generic_name: 'Azithromycin Dihydrate',
    dosage_form: 'Tablet',
    strength: '500mg',
    manufacturer: 'Generic Pharmaceuticals',
    description: 'Macrolide antibiotic for typhoid fever',
    contraindications: 'Known hypersensitivity to azithromycin or other macrolides',
    side_effects: 'Nausea, vomiting, diarrhea, abdominal pain',
    is_prescription_required: true
  },
  {
    name: 'Paracetamol',
    generic_name: 'Acetaminophen',
    dosage_form: 'Tablet',
    strength: '500mg',
    manufacturer: 'Generic Pharmaceuticals',
    description: 'Pain reliever and fever reducer',
    contraindications: 'Severe liver disease, known hypersensitivity to acetaminophen',
    side_effects: 'Rare: skin rash, allergic reactions',
    is_prescription_required: false
  }
]

const sampleExpertRules = [
  {
    disease_name: 'Malaria',
    symptoms: ['abdominal pain', 'vomiting', 'sore throat'],
    severity_level: 'very_strong',
    diagnosis: 'Malaria',
    treatment_recommendation: 'Chloroquine + Chest X-ray required',
    requires_xray: true,
    confidence_score: 95
  },
  {
    disease_name: 'Malaria',
    symptoms: ['headache', 'fatigue', 'cough'],
    severity_level: 'strong',
    diagnosis: 'Malaria',
    treatment_recommendation: 'Artemether-Lumefantrine',
    requires_xray: false,
    confidence_score: 85
  },
  {
    disease_name: 'Typhoid Fever',
    symptoms: ['abdominal pain', 'stomach issues'],
    severity_level: 'very_strong',
    diagnosis: 'Typhoid Fever',
    treatment_recommendation: 'Ciprofloxacin + Chest X-ray required',
    requires_xray: true,
    confidence_score: 95
  },
  {
    disease_name: 'Typhoid Fever',
    symptoms: ['constipation', 'headache', 'persistent high fever'],
    severity_level: 'strong',
    diagnosis: 'Typhoid Fever',
    treatment_recommendation: 'Azithromycin',
    requires_xray: false,
    confidence_score: 85
  }
]

async function loadSampleData() {
  console.log('🚀 Loading MESMTF Sample Data...\n')

  try {
    // 1. Create sample users
    console.log('👥 Creating sample users...')
    for (const user of sampleUsers) {
      try {
        // Create auth user
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: user.email,
          password: user.password,
          email_confirm: true
        })

        if (authError && !authError.message.includes('already registered')) {
          console.log(`⚠️  Auth error for ${user.email}:`, authError.message)
          continue
        }

        if (authData?.user) {
          // Create user profile
          const { error: profileError } = await supabase
            .from('user_profiles')
            .insert({
              id: authData.user.id,
              ...user.profile,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })

          if (profileError && !profileError.message.includes('duplicate key')) {
            console.log(`⚠️  Profile error for ${user.email}:`, profileError.message)
          } else {
            console.log(`✅ Created user: ${user.profile.first_name} ${user.profile.last_name} (${user.profile.role})`)
          }
        }
      } catch (error) {
        console.log(`⚠️  Error creating user ${user.email}:`, error.message)
      }
    }

    // 2. Create sample patients
    console.log('\n🏥 Creating sample patients...')
    for (const patient of samplePatients) {
      try {
        const { error } = await supabase
          .from('patients')
          .insert({
            ...patient,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })

        if (error && !error.message.includes('duplicate key')) {
          console.log(`⚠️  Error creating patient ${patient.patient_id}:`, error.message)
        } else {
          console.log(`✅ Created patient: ${patient.first_name} ${patient.last_name} (${patient.patient_id})`)
        }
      } catch (error) {
        console.log(`⚠️  Error creating patient ${patient.patient_id}:`, error.message)
      }
    }

    // 3. Create sample drugs
    console.log('\n💊 Creating sample drugs...')
    for (const drug of sampleDrugs) {
      try {
        const { error } = await supabase
          .from('drugs')
          .insert({
            ...drug,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })

        if (error && !error.message.includes('duplicate key')) {
          console.log(`⚠️  Error creating drug ${drug.name}:`, error.message)
        } else {
          console.log(`✅ Created drug: ${drug.name}`)
        }
      } catch (error) {
        console.log(`⚠️  Error creating drug ${drug.name}:`, error.message)
      }
    }

    // 4. Create expert system rules
    console.log('\n🧠 Creating expert system rules...')
    for (const rule of sampleExpertRules) {
      try {
        const { error } = await supabase
          .from('expert_system_rules')
          .insert({
            ...rule,
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })

        if (error && !error.message.includes('duplicate key')) {
          console.log(`⚠️  Error creating rule for ${rule.disease_name}:`, error.message)
        } else {
          console.log(`✅ Created rule: ${rule.disease_name} (${rule.severity_level})`)
        }
      } catch (error) {
        console.log(`⚠️  Error creating rule for ${rule.disease_name}:`, error.message)
      }
    }

    console.log('\n🎉 Sample data loading completed!')
    console.log('\n📋 Summary:')
    console.log(`   - ${sampleUsers.length} sample users created`)
    console.log(`   - ${samplePatients.length} sample patients created`)
    console.log(`   - ${sampleDrugs.length} sample drugs created`)
    console.log(`   - ${sampleExpertRules.length} expert system rules created`)
    
    console.log('\n🔐 Test Login Credentials:')
    console.log('   Admin: admin@mesmtf.com / admin123456')
    console.log('   Doctor: dr.smith@mesmtf.com / doctor123')
    console.log('   Nurse: nurse.brown@mesmtf.com / nurse123')
    console.log('   Pharmacist: pharmacist.garcia@mesmtf.com / pharmacist123')
    console.log('   Receptionist: receptionist.wilson@mesmtf.com / receptionist123')

  } catch (error) {
    console.error('❌ Error loading sample data:', error.message)
  }
}

loadSampleData()
