import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Provide a safe fallback client when env vars are missing to avoid runtime crashes
let supabase
if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
} else {
  console.warn('[Supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Supabase features disabled.')
  supabase = {
    auth: {
      async getSession() {
        return { data: { session: null } }
      },
      onAuthStateChange() {
        return { data: { subscription: { unsubscribe: () => {} } } }
      },
      async signInWithOAuth() {
        return { data: null, error: new Error('Supabase not configured') }
      },
      async signOut() {
        return { error: null }
      }
    }
  }
}

export { supabase } 