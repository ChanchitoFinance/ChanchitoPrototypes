export interface Notification {
  id: string
  type:
    | 'vote_up'
    | 'vote_down'
    | 'vote_pay'
    | 'comment'
    | 'idea_created'
    | 'idea_updated'
  title: string
  message: string
  timestamp: string
  read: boolean
  ideaId?: string
  ideaTitle?: string
  userId?: string
  userName?: string
}

export interface NotificationsState {
  notifications: Notification[]
  unreadCount: number
  userId: string | null
}
