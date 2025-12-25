import { Tag } from '@/lib/types/tag'
import { Badge } from '@/lib/types/badge'
import { UserBadge } from '@/lib/types/userBadge'
import { MediaAsset } from '@/lib/types/mediaAsset'

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

  getTopics(): Promise<Array<{ id: string; name: string; description?: string }>>
}
