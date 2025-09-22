"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'

interface UserProfile {
  id: string
  email: string
  username: string
  first_name: string
  last_name: string
  phone: string
  role: 'patient' | 'doctor' | 'nurse' | 'pharmacist' | 'receptionist' | 'admin'
  specialization?: string
  address?: string
  created_at: string
  updated_at: string
}

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  isAnonymous: boolean
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signUp: (email: string, password: string, profile: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>) => Promise<{ error: any }>
  signInAnonymously: () => Promise<{ error: any }>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error: any }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [isAnonymous, setIsAnonymous] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      
      if (session?.user) {
        // Check if user is anonymous
        const isAnon = session.user.is_anonymous
        setIsAnonymous(isAnon)
        
        if (!isAnon) {
          await fetchUserProfile(session.user.id)
        } else {
          // Create a temporary profile for anonymous users
          setProfile({
            id: session.user.id,
            email: 'anonymous@guest.com',
            username: 'guest_user',
            first_name: 'Guest',
            last_name: 'User',
            phone: '',
            role: 'patient' as const,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
        }
      }
      
      setLoading(false)
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state change:', { event, hasSession: !!session, userId: session?.user?.id })
      
      setUser(session?.user ?? null)
      
      if (session?.user) {
        // Check if user is anonymous
        const isAnon = session.user.is_anonymous
        setIsAnonymous(isAnon)
        
        if (!isAnon) {
          console.log('👤 Regular user detected, fetching profile...')
          // Add a small delay to ensure the user is fully authenticated
          setTimeout(async () => {
            await fetchUserProfile(session.user.id)
          }, 100)
        } else {
          console.log('👻 Anonymous user detected, creating temporary profile...')
          // Create a temporary profile for anonymous users
          setProfile({
            id: session.user.id,
            email: 'anonymous@guest.com',
            username: 'guest_user',
            first_name: 'Guest',
            last_name: 'User',
            phone: '',
            role: 'patient' as const,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
        }
      } else {
        console.log('🚪 No session, clearing profile...')
        setProfile(null)
        setIsAnonymous(false)
      }
      
      console.log('✅ Auth state change complete, setting loading to false')
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('🔍 Fetching user profile for ID:', userId)
      
      // Check if user is authenticated first
      const { data: { session } } = await supabase.auth.getSession()
      if (!session || !session.user) {
        console.log('❌ No active session, cannot fetch profile')
        return
      }
      
      console.log('✅ User is authenticated, proceeding with profile fetch')
      
      // Add timeout to prevent infinite loading
      const profilePromise = supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single()

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile fetch timeout')), 5000)
      )

      const { data, error } = await Promise.race([profilePromise, timeoutPromise]) as any

      console.log('📊 Profile fetch result:', { data, error })

      if (error) {
        console.error('❌ Error fetching user profile:', error)
        console.error('Error details:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        })
        
        // If profile doesn't exist, create a default one
        if (error.code === 'PGRST116') {
          console.log('🆕 User profile not found, creating default profile...')
          const defaultProfile = {
            id: userId,
            email: 'user@example.com',
            username: 'user_' + userId.slice(0, 8),
            first_name: 'User',
            last_name: 'Name',
            phone: '',
            role: 'patient' as const,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
          setProfile(defaultProfile)
          return
        }
        
        // For any other error, create a default profile to prevent infinite loading
        console.log('🆕 Creating default profile due to error...')
        const defaultProfile = {
          id: userId,
          email: 'user@example.com',
          username: 'user_' + userId.slice(0, 8),
          first_name: 'User',
          last_name: 'Name',
          phone: '',
          role: 'patient' as const,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        setProfile(defaultProfile)
        return
      }

      console.log('✅ User profile fetched successfully:', data)
      setProfile(data)
    } catch (error) {
      console.error('💥 Exception fetching user profile:', error)
      
      // Create a default profile to prevent infinite loading
      console.log('🆕 Creating default profile due to exception...')
      const defaultProfile = {
        id: userId,
        email: 'user@example.com',
        username: 'user_' + userId.slice(0, 8),
        first_name: 'User',
        last_name: 'Name',
        phone: '',
        role: 'patient' as const,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
      setProfile(defaultProfile)
    }
  }

  const signIn = async (email: string, password: string) => {
    console.log('🔐 Attempting to sign in with:', email)
    console.log('🔗 Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log('🔑 Supabase Anon Key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    
    try {
      console.log('🔄 Calling supabase.auth.signInWithPassword...')
      
      // Add a timeout to catch hanging requests
      const authPromise = supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Authentication timeout - check redirect URLs in Supabase')), 8000)
      )
      
      const { data, error } = await Promise.race([authPromise, timeoutPromise]) as any
      
      console.log('📊 Sign in result received:', { 
        hasData: !!data, 
        hasError: !!error,
        dataKeys: data ? Object.keys(data) : [],
        errorMessage: error?.message,
        errorCode: error?.status
      })
      
      if (error) {
        console.error('❌ Sign in error details:', {
          message: error.message,
          status: error.status,
          statusText: error.statusText
        })
      } else {
        console.log('✅ Sign in successful, user:', data?.user?.id)
      }
      
      return { error }
    } catch (err) {
      console.error('💥 Sign in exception:', err)
      return { error: err }
    }
  }

  const signUp = async (email: string, password: string, profileData: Omit<UserProfile, 'id' | 'created_at' | 'updated_at'>) => {
    console.log('📝 Attempting to sign up with:', email)
    console.log('🔗 Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log('🔑 Supabase Anon Key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      console.log('📊 Sign up result:', { data: !!data, error: !!error, user: !!data?.user })
      if (error) {
        console.error('❌ Sign up error:', error)
        return { error }
      }

      if (data.user) {
        console.log('👤 Creating user profile for:', data.user.id)
        // Create user profile
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            id: data.user.id,
            email,
            ...profileData,
          })

        if (profileError) {
          console.error('❌ Error creating user profile:', profileError)
          return { error: profileError }
        } else {
          console.log('✅ User profile created successfully')
        }
      }

      return { error: null }
    } catch (err) {
      console.error('💥 Sign up exception:', err)
      return { error: err }
    }
  }

  const signInAnonymously = async () => {
    const { data, error } = await supabase.auth.signInAnonymously()
    return { error }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return { error: new Error('No user logged in') }

    const { error } = await supabase
      .from('user_profiles')
      .update(updates)
      .eq('id', user.id)

    if (!error) {
      setProfile(prev => prev ? { ...prev, ...updates } : null)
    }

    return { error }
  }

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      loading,
      isAnonymous,
      signIn,
      signUp,
      signInAnonymously,
      signOut,
      updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
