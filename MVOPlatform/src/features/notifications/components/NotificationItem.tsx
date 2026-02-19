import {
  Bell,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  DollarSign,
  FileText,
  Edit,
} from 'lucide-react'
import { Notification } from '@/core/types/notification'

interface NotificationItemProps {
  notification: Notification
  onRemove: (id: string) => void
  onMarkAsRead: (id: string) => void
}

export default function NotificationItem({
  notification,
  onRemove,
  onMarkAsRead,
}: NotificationItemProps) {
  const getIcon = () => {
    switch (notification.type) {
      case 'vote_up':
        return <ThumbsUp className="w-5 h-5 text-success" />
      case 'vote_down':
        return <ThumbsDown className="w-5 h-5 text-error" />
      case 'vote_pay':
        return <DollarSign className="w-5 h-5 text-warning" />
      case 'comment':
        return <MessageSquare className="w-5 h-5 text-blue-500" />
      case 'idea_created':
        return <FileText className="w-5 h-5 text-purple-500" />
      case 'idea_updated':
        return <Edit className="w-5 h-5 text-orange-500" />
      default:
        return <Bell className="w-5 h-5 text-gray-500" />
    }
  }

  const getTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (seconds < 60) return `${seconds}s ago`
    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes}m ago`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    const days = Math.floor(hours / 24)
    return `${days}d ago`
  }

  return (
    <div
      className={`p-4 rounded-lg border border-border-color ${
        notification.read ? 'bg-background' : 'bg-accent/10'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-1">{getIcon()}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-medium text-text-primary truncate">
              {notification.title}
            </h3>
            {!notification.read && (
              <span className="text-xs bg-accent text-text-primary px-2 py-0.5 rounded-full ml-2">
                New
              </span>
            )}
          </div>
          <p className="text-sm text-text-secondary mb-2 line-clamp-2">
            {notification.message}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-tertiary">
              {getTimeAgo(notification.timestamp)}
            </span>
            <div className="flex gap-2">
              {!notification.read && (
                <button
                  onClick={() => onMarkAsRead(notification.id)}
                  className="text-xs text-accent hover:underline"
                >
                  Mark as read
                </button>
              )}
              <button
                onClick={() => onRemove(notification.id)}
                className="text-xs text-text-tertiary hover:text-text-secondary"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
