#!/usr/bin/env node

/**
 * Script to create an admin account directly in the database
 * Run with: node create-admin-account.js
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

async function createAdminAccount() {
  try {
    console.log('🔐 Creating admin account...')
    
    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'admin@mesmtf.com',
      password: 'admin123456',
      email_confirm: true
    })

    if (authError) {
      console.error('❌ Auth error:', authError.message)
      return
    }

    console.log('✅ Auth user created:', authData.user.id)

    // Create user profile
    const { data: profileData, error: profileError } = await supabase
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
      .select()
      .single()

    if (profileError) {
      console.error('❌ Profile error:', profileError.message)
      return
    }

    console.log('✅ Admin profile created:', profileData.id)
    console.log('')
    console.log('🎉 ADMIN ACCOUNT CREATED SUCCESSFULLY!')
    console.log('')
    console.log('📋 Login Credentials:')
    console.log('   Email: admin@mesmtf.com')
    console.log('   Password: admin123456')
    console.log('   Role: Administrator')
    console.log('')
    console.log('🌐 Login at: http://localhost:3001')
    console.log('')

  } catch (error) {
    console.error('❌ Error creating admin account:', error.message)
  }
}

createAdminAccount()
