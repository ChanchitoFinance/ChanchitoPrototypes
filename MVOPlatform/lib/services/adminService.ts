import { supabase } from '@/lib/supabase'

export interface Tag {
  id: string
  name: string
}

export interface Badge {
  id: string
  code: string
  name: string
  description?: string
  icon_media_id?: string
}

export interface UserBadge {
  user_id: string
  badge_id: string
  awarded_at: string
  badge?: Badge
}

export interface MediaAsset {
  id: string
  type: 'image' | 'video' | 'link'
  url: string
  metadata?: any
  created_at: string
}

export interface IAdminService {
  createTag(name: string): Promise<Tag>
  getTags(): Promise<Tag[]>
  deleteTag(id: string): Promise<void>

  createBadge(badge: Omit<Badge, 'id'>): Promise<Badge>
  getBadges(): Promise<Badge[]>
  updateBadge(id: string, updates: Partial<Badge>): Promise<Badge>
  deleteBadge(id: string): Promise<void>

  awardBadge(userId: string, badgeId: string): Promise<UserBadge>
  getUserBadges(userId: string): Promise<UserBadge[]>
  revokeBadge(userId: string, badgeId: string): Promise<void>

  uploadMedia(
    type: MediaAsset['type'],
    url: string,
    metadata?: any
  ): Promise<MediaAsset>
  getMediaAssets(type?: MediaAsset['type']): Promise<MediaAsset[]>
  deleteMediaAsset(id: string): Promise<void>
}

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
}

export const adminService = new SupabaseAdminService()
