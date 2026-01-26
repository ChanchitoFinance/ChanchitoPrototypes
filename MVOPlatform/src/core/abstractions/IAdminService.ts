import { MediaAsset } from '../types/mediaAsset'

export interface IAdminService {
  uploadMedia(
    type: MediaAsset['type'],
    url: string,
    metadata?: any
  ): Promise<MediaAsset>
  getMediaAssets(type?: MediaAsset['type']): Promise<MediaAsset[]>
  deleteMediaAsset(id: string): Promise<void>
}
