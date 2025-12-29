import { supabase } from '@/core/lib/supabase'
import { IAdminService } from '../../abstractions/IAdminService'
import { Tag } from '@/core/types/tag'
import { Badge } from '@/core/types/badge'
import { UserBadge } from '@/core/types/userBadge'
import { MediaAsset } from '@/core/types/mediaAsset'

class SupabaseAdminService implements IAdminService {
  async createTag(name: string): Promise<Tag> {
    const { data, error } = await supabase
      .from('tags')
      .insert({ name })
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getTags(): Promise<Tag[]> {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .order('name')

    if (error) throw error
    return data || []
  }

  async deleteTag(id: string): Promise<void> {
    const { error } = await supabase.from('tags').delete().eq('id', id)

    if (error) throw error
  }

  async createBadge(badge: Omit<Badge, 'id'>): Promise<Badge> {
    const { data, error } = await supabase
      .from('badges')
      .insert(badge)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getBadges(): Promise<Badge[]> {
    const { data, error } = await supabase
      .from('badges')
      .select('*')
      .order('name')

    if (error) throw error
    return data || []
  }

  async updateBadge(id: string, updates: Partial<Badge>): Promise<Badge> {
    const { data, error } = await supabase
      .from('badges')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async deleteBadge(id: string): Promise<void> {
    const { error } = await supabase.from('badges').delete().eq('id', id)

    if (error) throw error
  }

  async awardBadge(userId: string, badgeId: string): Promise<UserBadge> {
    const { data, error } = await supabase
      .from('user_badges')
      .insert({
        user_id: userId,
        badge_id: badgeId,
      })
      .select(
        `
        *,
        badges (*)
      `
      )
      .single()

    if (error) throw error
    return data
  }

  async getUserBadges(userId: string): Promise<UserBadge[]> {
    const { data, error } = await supabase
      .from('user_badges')
      .select(
        `
        *,
        badges (*)
      `
      )
      .eq('user_id', userId)
      .order('awarded_at', { ascending: false })

    if (error) throw error
    return data || []
  }

  async revokeBadge(userId: string, badgeId: string): Promise<void> {
    const { error } = await supabase
      .from('user_badges')
      .delete()
      .eq('user_id', userId)
      .eq('badge_id', badgeId)

    if (error) throw error
  }

  async uploadMedia(
    type: MediaAsset['type'],
    url: string,
    metadata?: any
  ): Promise<MediaAsset> {
    const { data, error } = await supabase
      .from('media_assets')
      .insert({
        type,
        url,
        metadata,
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getMediaAssets(type?: MediaAsset['type']): Promise<MediaAsset[]> {
    let query = supabase
      .from('media_assets')
      .select('*')
      .order('created_at', { ascending: false })

    if (type) {
      query = query.eq('type', type)
    }

    const { data, error } = await query
    if (error) throw error
    return data || []
  }

  async deleteMediaAsset(id: string): Promise<void> {
    const { error } = await supabase.from('media_assets').delete().eq('id', id)

    if (error) throw error
  }

  async getTopics(): Promise<
    Array<{ id: string; name: string; description?: string }>
  > {
    const { data, error } = await supabase
      .from('topics')
      .select('id, name, description')
      .order('name')

    if (error) throw error
    return data || []
  }
}

export const adminService = new SupabaseAdminService()
