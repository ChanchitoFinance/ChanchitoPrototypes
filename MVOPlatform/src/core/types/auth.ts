import { User } from '@supabase/supabase-js'

export interface UserProfile {
  id: string
  username: string
  full_name: string
  email: string
  role: 'user' | 'admin'
  profile_media_id?: string
  media_assets?: {
    url: string
  }
  terms_and_conditions_accepted: boolean
  nda_accepted?: boolean
  onboarding_questions?: Record<string, any> | null
  created_at: string
  updated_at: string
}

export interface AuthState {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  error: string | null
  isAuthenticated: boolean
  initialized: boolean
}
