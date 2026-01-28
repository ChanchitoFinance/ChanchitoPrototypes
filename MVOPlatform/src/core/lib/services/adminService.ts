import { supabase } from '@/core/lib/supabase'
import { IAdminService } from '../../abstractions/IAdminService'
import { MediaAsset } from '@/core/types/mediaAsset'

class SupabaseAdminService implements IAdminService {
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
