import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { mongodbService } from '../lib/mongodb'

const AuthContext = createContext({})

export const useAuth = () => {
  return useContext(AuthContext)
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authType, setAuthType] = useState(null) // 'supabase' or 'mongodb'
  const [authChecked, setAuthChecked] = useState(false) // Track if auth check is complete

  useEffect(() => {
    // Check for existing authentication
    const checkAuth = async () => {
      setLoading(true)
      console.log('Starting authentication check...')
      
      try {
        // First check Supabase (Google Sign-In)
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          // For Supabase users, add role information (assume patient by default)
          const userWithRole = {
            ...session.user,
            role: 'patient' // Google sign-in users are treated as patients by default
          }
          console.log('Supabase user found:', userWithRole);
          setUser(userWithRole)
          setAuthType('supabase')
          setAuthChecked(true)
          setLoading(false)
          return
        }

        // Then check MongoDB (email/password)
        const token = localStorage.getItem('mongodb_token')
        if (token) {
          console.log('MongoDB token found, fetching user data...')
          
          // Try to get user data from API
          try {
            const mongodbUser = await mongodbService.getUser()
            if (mongodbUser) {
              console.log('MongoDB user found:', mongodbUser);
              setUser(mongodbUser)
              setAuthType('mongodb')
              setAuthChecked(true)
              setLoading(false)
              return
            } else {
              console.log('MongoDB token exists but user data fetch failed, clearing token')
              localStorage.removeItem('mongodb_token')
            }
          } catch (error) {
            console.error('Error fetching MongoDB user:', error)
            localStorage.removeItem('mongodb_token')
          }
        }

        // No valid authentication found
        console.log('No valid authentication found')
        setUser(null)
        setAuthType(null)
        setAuthChecked(true)
        setLoading(false)
      } catch (error) {
        console.error('Authentication check error:', error)
        setUser(null)
        setAuthType(null)
        setAuthChecked(true)
        setLoading(false)
      }
    }

    checkAuth()

    // Listen for Supabase auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Supabase auth state change:', event, session);
        
        if (session?.user) {
          // For Supabase users, add role information (assume patient by default)
          const userWithRole = {
            ...session.user,
            role: 'patient' // Google sign-in users are treated as patients by default
          }
          console.log('Setting Supabase user with role:', userWithRole);
          setUser(userWithRole)
          setAuthType('supabase')
          setAuthChecked(true)
          
          // If this is a sign-in event, redirect to dashboard
          if (event === 'SIGNED_IN') {
            console.log('User signed in via Google, redirecting to dashboard');
            // The redirectTo option in signInWithGoogle should handle this
          }
        } else {
          // Check if we have MongoDB user
          const token = localStorage.getItem('mongodb_token')
          if (token) {
            try {
              const mongodbUser = await mongodbService.getUser()
              if (mongodbUser) {
                console.log('Setting MongoDB user:', mongodbUser);
                setUser(mongodbUser)
                setAuthType('mongodb')
                setAuthChecked(true)
              } else {
                console.log('No MongoDB user found, setting to null');
                setUser(null)
                setAuthType(null)
                setAuthChecked(true)
              }
            } catch (error) {
              console.error('Error fetching MongoDB user on auth state change:', error)
              setUser(null)
              setAuthType(null)
              setAuthChecked(true)
            }
          } else {
            console.log('No user found, setting to null');
            setUser(null)
            setAuthType(null)
            setAuthChecked(true)
          }
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // Google Sign-In with Supabase
  const signInWithGoogle = async () => {
    try {
      console.log('Starting Google sign-in...');
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`, // Redirect directly to dashboard for patients
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      })
      
      console.log('Google sign-in response:', { data, error });
      
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.log('Google sign-in error:', error);
      return { data: null, error }
    }
  }

  // Email/Password Sign-In with MongoDB
  const signIn = async (email, password) => {
    try {
      const { data, error } = await mongodbService.login(email, password)
      
      if (error) throw error
      
      if (data) {
        console.log('Setting MongoDB user in AuthContext:', data);
        console.log('User role in AuthContext:', data.role);
        console.log('User role type:', typeof data.role);
        console.log('Full user object:', JSON.stringify(data, null, 2));
        setUser(data)
        setAuthType('mongodb')
        setAuthChecked(true)
      }
      
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  // Email/Password Registration with MongoDB
  const signUp = async (email, password, userData = {}) => {
    try {
      console.log('AuthContext signUp - called with:', { email, password, userData });
      
      const registrationData = {
        email,
        password,
        ...userData
      };
      
      console.log('AuthContext signUp - sending to MongoDB:', registrationData);
      
      const { data, error } = await mongodbService.register(registrationData)
      
      console.log('AuthContext signUp - MongoDB response:', { data, error });
      
      if (error) throw error
      
      if (data) {
        setUser(data)
        setAuthType('mongodb')
        setAuthChecked(true)
      }
      
      return { data, error: null }
    } catch (error) {
      console.log('AuthContext signUp - error:', error);
      return { data: null, error }
    }
  }

  // Sign Out (handles both Supabase and MongoDB)
  const signOut = async () => {
    try {
      // Sign out from Supabase if authenticated via Supabase
      if (authType === 'supabase') {
        const { error } = await supabase.auth.signOut()
        if (error) throw error
      }
      
      // Sign out from MongoDB if authenticated via MongoDB
      if (authType === 'mongodb') {
        await mongodbService.logout()
      }
      
      setUser(null)
      setAuthType(null)
      setAuthChecked(true)
      
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const value = {
    user,
    loading,
    authType,
    authChecked, // Add this to track if auth check is complete
    signUp,
    signIn,
    signInWithGoogle,
    signOut
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}