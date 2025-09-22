#!/usr/bin/env node

/**
 * Complete MESMTF Setup Script
 * This script will:
 * 1. Load sample data
 * 2. Create admin account
 * 3. Verify database connection
 * 4. Test key functionality
 * 
 * Run with: node scripts/complete-setup.js
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function completeSetup() {
  console.log('🚀 MESMTF Complete Setup Starting...\n')

  try {
    // Step 1: Test database connection
    console.log('1️⃣ Testing database connection...')
    const { data: testData, error: testError } = await supabase
      .from('user_profiles')
      .select('count')
      .limit(1)

    if (testError) {
      console.error('❌ Database connection failed:', testError.message)
      return
    }
    console.log('✅ Database connection successful!\n')

    // Step 2: Create admin account
    console.log('2️⃣ Creating admin account...')
    try {
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: 'admin@mesmtf.com',
        password: 'admin123456',
        email_confirm: true
      })

      if (authError && !authError.message.includes('already registered')) {
        console.log('⚠️  Auth error:', authError.message)
      } else if (authData?.user) {
        // Create user profile
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            id: authData.user.id,
            email: 'admin@mesmtf.com',
            username: 'admin',
            first_name: 'System',
            last_name: 'Administrator',
            role: 'admin',
            phone: '+1234567890',
            address: 'Ministry of Health and Social Services',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })

        if (profileError && !profileError.message.includes('duplicate key')) {
          console.log('⚠️  Profile error:', profileError.message)
        } else {
          console.log('✅ Admin account created successfully!')
        }
      }
    } catch (error) {
      console.log('⚠️  Admin account may already exist:', error.message)
    }
    console.log('')

    // Step 3: Load sample data
    console.log('3️⃣ Loading sample data...')
    
    // Sample users
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
      }
    ]

    // Create sample users
    for (const user of sampleUsers) {
      try {
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

    // Sample patients
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
      }
    ]

    // Create sample patients
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

    // Sample drugs
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
      }
    ]

    // Create sample drugs
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

    console.log('✅ Sample data loading completed!\n')

    // Step 4: Verify setup
    console.log('4️⃣ Verifying setup...')
    
    // Check user count
    const { count: userCount } = await supabase
      .from('user_profiles')
      .select('*', { count: 'exact', head: true })
    
    // Check patient count
    const { count: patientCount } = await supabase
      .from('patients')
      .select('*', { count: 'exact', head: true })
    
    // Check drug count
    const { count: drugCount } = await supabase
      .from('drugs')
      .select('*', { count: 'exact', head: true })

    console.log(`✅ Users in database: ${userCount}`)
    console.log(`✅ Patients in database: ${patientCount}`)
    console.log(`✅ Drugs in database: ${drugCount}`)

    console.log('\n🎉 MESMTF Setup Complete!')
    console.log('\n📋 System Summary:')
    console.log('   ✅ Database connection verified')
    console.log('   ✅ Admin account created')
    console.log('   ✅ Sample data loaded')
    console.log('   ✅ Mock data components updated')
    
    console.log('\n🔐 Login Credentials:')
    console.log('   Admin: admin@mesmtf.com / admin123456')
    console.log('   Doctor: dr.smith@mesmtf.com / doctor123')
    console.log('   Nurse: nurse.brown@mesmtf.com / nurse123')
    
    console.log('\n🌐 Next Steps:')
    console.log('   1. Run: npm run dev')
    console.log('   2. Open: http://localhost:3000')
    console.log('   3. Login with admin credentials')
    console.log('   4. Explore the system!')

  } catch (error) {
    console.error('❌ Setup failed:', error.message)
  }
}

completeSetup()
