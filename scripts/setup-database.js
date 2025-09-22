// Quick setup script for MESMTF database
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
  console.log('🚀 MESMTF Database Setup Assistant\n');
  
  // Check if .env.local exists
  const envPath = path.join(__dirname, '.env.local');
  if (!fs.existsSync(envPath)) {
    console.log('❌ .env.local file not found!');
    console.log('\n📝 Creating .env.local template...');
    
    const envTemplate = `# MESMTF Environment Variables
# Replace these with your actual Supabase credentials

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Application Configuration
NEXT_PUBLIC_APP_NAME=MESMTF
NEXT_PUBLIC_VERSION=1.0.0
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database Configuration
DATABASE_URL=your_supabase_database_url

# Security
JWT_SECRET=your_jwt_secret_here
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000

# File Upload Configuration
MAX_FILE_SIZE=10485760
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,application/pdf,text/plain

# Notification Configuration
NOTIFICATION_EMAIL_FROM=noreply@mesmtf.com
NOTIFICATION_SMS_PROVIDER=twilio

# Development
NODE_ENV=development`;

    fs.writeFileSync(envPath, envTemplate);
    console.log('✅ .env.local template created!');
    console.log('\n📋 Next steps:');
    console.log('1. Go to https://supabase.com and create a new project');
    console.log('2. Get your Project URL and Anon Key from Settings → API');
    console.log('3. Replace the placeholder values in .env.local');
    console.log('4. Run: node test-complete-setup.js');
    return;
  }
  
  // Check if environment variables are set
  require('dotenv').config({ path: '.env.local' });
  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey || 
      supabaseUrl === 'your_supabase_project_url' || 
      supabaseKey === 'your_supabase_anon_key') {
    console.log('❌ Environment variables not configured!');
    console.log('\n📋 Please update .env.local with your Supabase credentials:');
    console.log('1. Go to https://supabase.com and create a new project');
    console.log('2. Get your Project URL and Anon Key from Settings → API');
    console.log('3. Replace the placeholder values in .env.local');
    console.log('4. Run: node test-complete-setup.js');
    return;
  }
  
  console.log('✅ Environment variables found!');
  console.log('🔗 Testing database connection...');
  
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.log('❌ Database connection failed:', error.message);
      return;
    }
    
    console.log('✅ Database connection successful!');
    console.log('\n🎉 Your MESMTF system is ready!');
    console.log('\n📋 Final steps:');
    console.log('1. Run: node test-complete-setup.js (to verify everything)');
    console.log('2. Run: npm run dev (to start the application)');
    console.log('3. Open http://localhost:3000 in your browser');
    
  } catch (error) {
    console.log('❌ Setup failed:', error.message);
  }
}

setupDatabase().catch(console.error);
