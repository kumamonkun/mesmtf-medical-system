// Test the DeepSeek API key specifically
require('dotenv').config({ path: '.env.local' });

const key = process.env.DEEPSEEK_API_KEY;
console.log('Raw key length:', key?.length);
console.log('Key starts with:', key?.substring(0, 10));
console.log('Key ends with:', key?.substring(key.length - 10));
console.log('Key contains spaces:', key?.includes(' '));
console.log('Key contains newlines:', key?.includes('\n'));
console.log('Key contains carriage returns:', key?.includes('\r'));
console.log('Key trimmed length:', key?.trim().length);
console.log('Trimmed key:', key?.trim());
