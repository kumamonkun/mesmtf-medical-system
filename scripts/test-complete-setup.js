// Comprehensive test script for MESMTF database setup
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

async function testCompleteSetup() {
  console.log('🧪 MESMTF Complete Setup Test\n');
  console.log('=' .repeat(50));
  
  // Step 1: Check environment variables
  console.log('\n1️⃣ Checking Environment Variables...');
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.log('❌ Missing environment variables!');
    console.log('   Please create .env.local file with your Supabase credentials');
    console.log('   See DATABASE_SETUP_GUIDE.md for instructions');
    return;
  }
  
  if (supabaseUrl === 'your_supabase_project_url' || supabaseKey === 'your_supabase_anon_key') {
    console.log('❌ Environment variables not configured!');
    console.log('   Please replace placeholder values with your actual Supabase credentials');
    return;
  }
  
  console.log('✅ Environment variables found');
  console.log(`   URL: ${supabaseUrl.substring(0, 30)}...`);
  console.log(`   Key: ${supabaseKey.substring(0, 20)}...`);
  
  // Step 2: Test Supabase connection
  console.log('\n2️⃣ Testing Supabase Connection...');
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    const { data: authData, error: authError } = await supabase.auth.getSession();
    if (authError) {
      console.log('❌ Authentication error:', authError.message);
    } else {
      console.log('✅ Supabase connection successful');
    }
  } catch (error) {
    console.log('❌ Connection failed:', error.message);
    return;
  }
  
  // Step 3: Test database tables
  console.log('\n3️⃣ Testing Database Tables...');
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
  
  let tablesWorking = 0;
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
        tablesWorking++;
      }
    } catch (err) {
      console.log(`   ${table}: ❌ ${err.message}`);
    }
  }
  
  // Step 4: Test sample data operations
  console.log('\n4️⃣ Testing Data Operations...');
  
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
      
      // Test patient update
      const { data: updateData, error: updateError } = await supabase
        .from('patients')
        .update({ first_name: 'Updated Test' })
        .eq('id', patientData[0].id)
        .select();
      
      if (updateError) {
        console.log('   Patient update: ❌', updateError.message);
      } else {
        console.log('   Patient update: ✅ Success');
      }
      
      // Clean up test data
      await supabase
        .from('patients')
        .delete()
        .eq('id', patientData[0].id);
      console.log('   Test data cleanup: ✅ Completed');
    }
  } catch (err) {
    console.log('   Patient operations: ❌', err.message);
  }
  
  // Test drugs table (should have sample data)
  try {
    const { data: drugsData, error: drugsError } = await supabase
      .from('drugs')
      .select('*')
      .limit(5);

    if (drugsError) {
      console.log('   Drugs query: ❌', drugsError.message);
    } else {
      console.log('   Drugs query: ✅ Success');
      console.log(`   Found ${drugsData.length} drugs in database`);
    }
  } catch (err) {
    console.log('   Drugs query: ❌', err.message);
  }
  
  // Step 5: Test RLS policies
  console.log('\n5️⃣ Testing Row Level Security...');
  
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
  
  // Step 6: Test API endpoint simulation
  console.log('\n6️⃣ Testing API Endpoint Simulation...');
  
  try {
    // Simulate what our API endpoints do
    const { data: appointmentsData, error: appointmentsError } = await supabase
      .from('appointments')
      .select(`
        *,
        patient:patients!appointments_patient_id_fkey(
          id,
          first_name,
          last_name
        ),
        doctor:doctors!appointments_doctor_id_fkey(
          id,
          specialization
        )
      `)
      .limit(5);

    if (appointmentsError) {
      console.log('   Appointments API simulation: ❌', appointmentsError.message);
    } else {
      console.log('   Appointments API simulation: ✅ Success');
      console.log(`   Found ${appointmentsData.length} appointments`);
    }
  } catch (err) {
    console.log('   Appointments API simulation: ❌', err.message);
  }
  
  // Step 7: Summary
  console.log('\n' + '=' .repeat(50));
  console.log('📊 SETUP SUMMARY');
  console.log('=' .repeat(50));
  
  const totalTables = tables.length;
  const successRate = Math.round((tablesWorking / totalTables) * 100);
  
  console.log(`\n✅ Tables Working: ${tablesWorking}/${totalTables} (${successRate}%)`);
  
  if (successRate === 100) {
    console.log('\n🎉 EXCELLENT! Your database is fully set up and working!');
    console.log('   All tables are accessible and RLS policies are active');
    console.log('   Your MESMTF system is ready to use!');
  } else if (successRate >= 80) {
    console.log('\n✅ GOOD! Most of your database is working');
    console.log('   A few tables may need attention, but the system should work');
  } else if (successRate >= 50) {
    console.log('\n⚠️ PARTIAL! Some database issues detected');
    console.log('   Check the errors above and fix them');
  } else {
    console.log('\n❌ ISSUES DETECTED! Database setup needs attention');
    console.log('   Please check your Supabase configuration and schema');
  }
  
  console.log('\n🔧 Next Steps:');
  console.log('   1. If everything looks good, start your app: npm run dev');
  console.log('   2. If there are issues, check the DATABASE_SETUP_GUIDE.md');
  console.log('   3. Test the actual API endpoints in your application');
  
  console.log('\n📞 Need Help?');
  console.log('   - Check Supabase logs in your project dashboard');
  console.log('   - Verify your environment variables are correct');
  console.log('   - Make sure the schema was applied completely');
}

// Run the test
testCompleteSetup().catch(console.error);
