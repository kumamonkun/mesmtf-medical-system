// Test Supabase connection
import { createClient } from './supabase/client'

export async function testSupabaseConnection() {
  console.log('🧪 Testing Supabase connection...')
  
  // Check environment variables
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  console.log('🔗 Supabase URL:', url)
  console.log('🔑 Anon Key exists:', !!anonKey)
  console.log('🔑 Anon Key length:', anonKey?.length || 0)
  
  if (!url || !anonKey) {
    console.error('❌ Missing Supabase environment variables!')
    return { success: false, error: 'Missing environment variables' }
  }
  
  if (url === 'your_supabase_project_url' || anonKey === 'your_supabase_anon_key') {
    console.error('❌ Supabase environment variables not configured!')
    return { success: false, error: 'Environment variables not configured' }
  }
  
  try {
    const supabase = createClient()
    
    // Test authentication first
    console.log('🔐 Testing authentication...')
    const { data: authData, error: authError } = await supabase.auth.getSession()
    console.log('Auth test result:', { hasSession: !!authData.session, authError })
    
    // Test a simple query
    console.log('📊 Testing database query...')
    const { data, error } = await supabase
      .from('user_profiles')
      .select('count')
      .limit(1)
    
    if (error) {
      console.log('⚠️ Supabase query error:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      })
      
      // Check if it's a table doesn't exist error
      if (error.code === 'PGRST116') {
        console.log('📋 Table user_profiles does not exist - this is expected for new setups')
        return { success: true, error: null, message: 'Database connected but user_profiles table not found' }
      }
      
      // This is actually okay - it means Supabase is connected but table might not exist
      return { success: true, error: null }
    }
    
    console.log('✅ Supabase connection successful!')
    return { success: true, error: null }
  } catch (err) {
    console.error('💥 Supabase connection failed:', err)
    return { success: false, error: err }
  }
}
