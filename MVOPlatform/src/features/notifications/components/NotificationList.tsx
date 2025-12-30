import NotificationItem from './NotificationItem'
import { Notification } from '@/core/types/notification'

interface NotificationListProps {
  notifications: Notification[]
  onRemoveNotification: (id: string) => void
  onMarkAsRead: (id: string) => void
}

export default function NotificationList({
  notifications,
  onRemoveNotification,
  onMarkAsRead,
}: NotificationListProps) {
  if (notifications.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-text-secondary">No notifications found</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {notifications.map(notification => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRemove={onRemoveNotification}
          onMarkAsRead={onMarkAsRead}
        />
      ))}
    </div>
  )
}
