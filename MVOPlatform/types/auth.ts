import { User } from '@supabase/supabase-js'

export interface UserProfile {
  id: string
  email: string
  full_name: string
  role: 'user' | 'admin'
  profile_media_id?: string
  media_assets?: {
    url: string
  }
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
