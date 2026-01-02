'use client'

import { useEffect } from 'react'
import { useTranslations } from '@/shared/components/providers/I18nProvider'
import { useNotifications } from '@/features/notifications/hooks/useNotifications'
import NotificationList from '@/features/notifications/components/NotificationList'
import EmptyNotifications from '@/features/notifications/components/EmptyNotifications'
import { Bell } from 'lucide-react'

export default function NotificationsPage() {
  const t = useTranslations()
  const {
    notifications,
    markAllNotificationsAsRead,
    removeNotification,
    markNotificationAsRead,
    clearAllNotifications,
  } = useNotifications()

  useEffect(() => {
    // Mark all notifications as read when visiting the notifications page
    if (notifications.some(n => !n.read)) {
      markAllNotificationsAsRead()
    }
  }, [notifications, markAllNotificationsAsRead])

  const handleClearAll = () => {
    if (window.confirm(t('notifications.clear_all_confirm'))) {
      clearAllNotifications()
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-accent/20">
            <Bell className="w-6 h-6 text-accent" />
          </div>
          <h1 className="text-2xl font-bold text-text-primary">
            {t('notifications.title')}
          </h1>
        </div>
        {notifications.length > 0 && (
          <button
            onClick={handleClearAll}
            className="text-sm text-text-tertiary hover:text-text-secondary transition-colors"
          >
            {t('notifications.clear_all')}
          </button>
        )}
      </div>

      {notifications.length === 0 ? (
        <EmptyNotifications />
      ) : (
        <NotificationList
          notifications={notifications}
          onRemoveNotification={removeNotification}
          onMarkAsRead={markNotificationAsRead}
        />
      )}
    </div>
  )
}
