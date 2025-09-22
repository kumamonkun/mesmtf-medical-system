// Test environment variables in Next.js context
const { config } = require('dotenv');

// Try different ways to load the .env.local file
console.log('Testing different dotenv loading methods...\n');

// Method 1: Default loading
console.log('Method 1: Default dotenv loading');
config();
console.log('DEEPSEEK_API_KEY exists:', !!process.env.DEEPSEEK_API_KEY);
console.log('DEEPSEEK_API_KEY length:', process.env.DEEPSEEK_API_KEY?.length || 0);

// Method 2: Explicit .env.local path
console.log('\nMethod 2: Explicit .env.local path');
config({ path: '.env.local' });
console.log('DEEPSEEK_API_KEY exists:', !!process.env.DEEPSEEK_API_KEY);
console.log('DEEPSEEK_API_KEY length:', process.env.DEEPSEEK_API_KEY?.length || 0);

// Method 3: Check if file exists and read it manually
const fs = require('fs');
console.log('\nMethod 3: Manual file reading');
if (fs.existsSync('.env.local')) {
  const content = fs.readFileSync('.env.local', 'utf8');
  const lines = content.split('\n');
  const deepSeekLine = lines.find(line => line.startsWith('DEEPSEEK_API_KEY='));
  if (deepSeekLine) {
    const key = deepSeekLine.split('=')[1];
    console.log('Found DEEPSEEK_API_KEY in file:', key ? key.substring(0, 10) + '...' : 'empty');
    console.log('Key length:', key?.length || 0);
  } else {
    console.log('DEEPSEEK_API_KEY line not found in file');
  }
} else {
  console.log('.env.local file not found');
}

// Method 4: Check all environment variables
console.log('\nMethod 4: All environment variables starting with DEEPSEEK or SUPABASE');
Object.keys(process.env).forEach(key => {
  if (key.includes('DEEPSEEK') || key.includes('SUPABASE')) {
    console.log(`${key}: ${process.env[key] ? 'exists' : 'not set'}`);
  }
});
