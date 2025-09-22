// Test script to verify database connectivity and API functionality
const { createClient } = require('@supabase/supabase-js');

// You'll need to replace these with your actual Supabase credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'your_supabase_project_url';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your_supabase_anon_key';

async function testDatabaseConnection() {
  console.log('🧪 Testing MESMTF Database Connection...\n');
  
  // Check if environment variables are set
  if (supabaseUrl === 'your_supabase_project_url' || supabaseKey === 'your_supabase_anon_key') {
    console.log('❌ ERROR: Supabase environment variables not configured!');
    console.log('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY');
    console.log('You can get these from your Supabase project dashboard.\n');
    return;
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Test 1: Basic connection
    console.log('1️⃣ Testing basic Supabase connection...');
    const { data: authData, error: authError } = await supabase.auth.getSession();
    console.log('   Auth status:', authError ? '❌ Failed' : '✅ Connected');
    if (authError) console.log('   Error:', authError.message);

    // Test 2: Check if tables exist
    console.log('\n2️⃣ Testing database tables...');
    
    const tables = [
      'user_profiles',
      'patients', 
      'doctors',
      'appointments',
      'diagnoses',
      'treatments',
      'drugs',
      'prescriptions',
      'drug_administration',
      'medical_reports',
      'expert_system_rules'
    ];

    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('count')
          .limit(1);
        
        if (error) {
          console.log(`   ${table}: ❌ ${error.message}`);
        } else {
          console.log(`   ${table}: ✅ Exists`);
        }
      } catch (err) {
        console.log(`   ${table}: ❌ ${err.message}`);
      }
    }

    // Test 3: Test sample data insertion
    console.log('\n3️⃣ Testing data operations...');
    
    // Test patient creation
    try {
      const testPatient = {
        patient_id: 'TEST_' + Date.now(),
        first_name: 'Test',
        last_name: 'Patient',
        date_of_birth: '1990-01-01',
        gender: 'male',
        phone: '1234567890',
        email: 'test@example.com',
        address: 'Test Address'
      };

      const { data: patientData, error: patientError } = await supabase
        .from('patients')
        .insert(testPatient)
        .select();

      if (patientError) {
        console.log('   Patient creation: ❌', patientError.message);
      } else {
        console.log('   Patient creation: ✅ Success');
        
        // Clean up test data
        await supabase
          .from('patients')
          .delete()
          .eq('id', patientData[0].id);
        console.log('   Test data cleanup: ✅ Completed');
      }
    } catch (err) {
      console.log('   Patient creation: ❌', err.message);
    }

    // Test 4: Test RLS policies
    console.log('\n4️⃣ Testing Row Level Security...');
    
    try {
      // This should fail for anonymous users due to RLS
      const { data: rlsData, error: rlsError } = await supabase
        .from('patients')
        .select('*')
        .limit(1);

      if (rlsError && rlsError.code === 'PGRST301') {
        console.log('   RLS policies: ✅ Active (access denied as expected)');
      } else if (rlsError) {
        console.log('   RLS policies: ⚠️', rlsError.message);
      } else {
        console.log('   RLS policies: ⚠️ May not be properly configured');
      }
    } catch (err) {
      console.log('   RLS policies: ❌', err.message);
    }

    // Test 5: Test API endpoint simulation
    console.log('\n5️⃣ Testing API endpoint simulation...');
    
    try {
      // Simulate what our API endpoints do
      const { data: drugsData, error: drugsError } = await supabase
        .from('drugs')
        .select('*')
        .limit(5);

      if (drugsError) {
        console.log('   Drugs API simulation: ❌', drugsError.message);
      } else {
        console.log('   Drugs API simulation: ✅ Success');
        console.log(`   Found ${drugsData.length} drugs in database`);
      }
    } catch (err) {
      console.log('   Drugs API simulation: ❌', err.message);
    }

    console.log('\n🎉 Database connection test completed!');
    console.log('\n📋 Summary:');
    console.log('   - If you see ✅ marks, your database is working correctly');
    console.log('   - If you see ❌ marks, there are configuration issues');
    console.log('   - If you see ⚠️ marks, there may be minor issues to address');
    
    console.log('\n🔧 Next steps:');
    console.log('   1. Make sure your Supabase project is set up');
    console.log('   2. Run the supabase-schema.sql file in your Supabase SQL editor');
    console.log('   3. Set up your environment variables');
    console.log('   4. Test the actual API endpoints in your application');

  } catch (error) {
    console.error('💥 Test failed:', error);
  }
}

// Run the test
testDatabaseConnection();
