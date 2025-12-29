import { Badge } from './badge'

export interface UserBadge {
  user_id: string
  badge_id: string
  awarded_at: string
  badge?: Badge
}
