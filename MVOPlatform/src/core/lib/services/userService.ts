import { IUserService } from '@/core/abstractions/IUserProfile'
import { supabase } from '@/core/lib/supabase'
import { UserProfile } from '@/core/types/auth'

class SupabaseUserService implements IUserService {
  async getCurrentUser(): Promise<UserProfile | null> {
    const { data: user } = await supabase.auth.getUser()
    if (!user.user) return null

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.user.id)
      .single()

    if (error) return null
    return data
  }

  async updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    const { data: user } = await supabase.auth.getUser()
    if (!user.user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.user.id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getUserById(id: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single()

    if (error) return null
    return data
  }

  async getUsers(limit = 50, offset = 0): Promise<UserProfile[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) throw error
    return data || []
  }
}

export const userService = new SupabaseUserService()
