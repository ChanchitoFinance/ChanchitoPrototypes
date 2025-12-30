import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { NotificationsState, Notification } from '@/core/types/notification'

const initialState: NotificationsState = {
  notifications: [],
  unreadCount: 0,
  userId: null,
}

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    setUserId: (state, action: PayloadAction<string | null>) => {
      state.userId = action.payload
      if (action.payload) {
        const stored = localStorage.getItem(`${action.payload}_notifications`)
        if (stored) {
          const parsed = JSON.parse(stored)
          if (Array.isArray(parsed)) {
            state.notifications = parsed
            state.unreadCount = parsed.filter(
              (n: Notification) => !n.read
            ).length
          }
        } else {
          state.notifications = []
          state.unreadCount = 0
        }
      } else {
        state.notifications = []
        state.unreadCount = 0
      }
    },
    setNotifications: (state, action: PayloadAction<Notification[]>) => {
      state.notifications = action.payload
      state.unreadCount = action.payload.filter(n => !n.read).length
      if (state.userId) {
        localStorage.setItem(
          `${state.userId}_notifications`,
          JSON.stringify(action.payload)
        )
      }
    },
    addNotification: (state, action: PayloadAction<Notification>) => {
      state.notifications.unshift(action.payload)
      if (!action.payload.read) {
        state.unreadCount += 1
      }
      if (state.userId) {
        localStorage.setItem(
          `${state.userId}_notifications`,
          JSON.stringify(state.notifications)
        )
      }
    },
    markAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(
        n => n.id === action.payload
      )
      if (notification && !notification.read) {
        notification.read = true
        state.unreadCount = Math.max(0, state.unreadCount - 1)
      }
      if (state.userId) {
        localStorage.setItem(
          `${state.userId}_notifications`,
          JSON.stringify(state.notifications)
        )
      }
    },
    markAllAsRead: state => {
      state.notifications.forEach(notification => {
        notification.read = true
      })
      state.unreadCount = 0
      if (state.userId) {
        localStorage.setItem(
          `${state.userId}_notifications`,
          JSON.stringify(state.notifications)
        )
      }
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      const notificationIndex = state.notifications.findIndex(
        n => n.id === action.payload
      )
      if (notificationIndex !== -1) {
        const wasUnread = !state.notifications[notificationIndex].read
        state.notifications.splice(notificationIndex, 1)
        if (wasUnread) {
          state.unreadCount = Math.max(0, state.unreadCount - 1)
        }
        if (state.userId) {
          localStorage.setItem(
            `${state.userId}_notifications`,
            JSON.stringify(state.notifications)
          )
        }
      }
    },
    clearAllNotifications: state => {
      state.notifications = []
      state.unreadCount = 0
      if (state.userId) {
        localStorage.setItem(
          `${state.userId}_notifications`,
          JSON.stringify(state.notifications)
        )
      }
    },
  },
})

export const {
  setUserId,
  setNotifications,
  addNotification,
  markAsRead,
  markAllAsRead,
  removeNotification,
  clearAllNotifications,
} = notificationsSlice.actions

export default notificationsSlice.reducer
