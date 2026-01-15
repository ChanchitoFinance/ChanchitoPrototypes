import { MediaAsset } from '../types/mediaAsset'
import { Tag } from '../types/tag'

export interface IAdminService {
  createTag(name: string): Promise<Tag>
  getTags(): Promise<Tag[]>
  deleteTag(id: string): Promise<void>

  uploadMedia(
    type: MediaAsset['type'],
    url: string,
    metadata?: any
  ): Promise<MediaAsset>
  getMediaAssets(type?: MediaAsset['type']): Promise<MediaAsset[]>
  deleteMediaAsset(id: string): Promise<void>
}
