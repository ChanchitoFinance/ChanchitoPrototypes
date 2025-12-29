import { createClient } from '@supabase/supabase-js'
import { clientEnv } from '../../../env-validation/config/env'

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
