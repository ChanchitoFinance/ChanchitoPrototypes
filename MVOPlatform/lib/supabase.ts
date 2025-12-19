import { createClient } from '@supabase/supabase-js'
import { clientEnv } from '@/config/env'

export const supabase = createClient(
  clientEnv.supabaseUrl,
  clientEnv.supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
  }
)
