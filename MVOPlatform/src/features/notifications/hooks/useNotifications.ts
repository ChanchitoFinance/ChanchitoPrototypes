import { useEffect, useRef } from 'react'
import { useAppSelector, useAppDispatch } from '@/core/lib/hooks'
import { supabase } from '@/core/lib/supabase'
import {
  setUserId,
  addNotification as addNotificationAction,
  markAsRead,
  markAllAsRead,
} from '@/core/lib/slices/notificationsSlice'
import { Notification } from '@/core/types/notification'
import { useTranslations } from '@/shared/components/providers/I18nProvider'

export const useNotifications = () => {
  const t = useTranslations()
  const dispatch = useAppDispatch()
  const { notifications, userId } = useAppSelector(state => state.notifications)
  const { user, profile } = useAppSelector(state => state.auth)

  const userIdeasSetRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (user?.id) {
      dispatch(setUserId(user.id))
    } else {
      dispatch(setUserId(null))
    }
  }, [user?.id, dispatch])

  useEffect(() => {
    if (!userId || !profile) {
      return
    }

    const fetchUserIdeas = async () => {
      const { data: userIdeas, error } = await supabase
        .from('ideas')
        .select('id')
        .eq('creator_id', userId)

      if (error) {
        console.error('useNotifications: Error fetching user ideas:', error)
        return
      }

      userIdeasSetRef.current.clear()
      userIdeas?.forEach(idea => {
        userIdeasSetRef.current.add(idea.id)
      })

      console.log(
        'useNotifications: User ideas loaded:',
        userIdeasSetRef.current.size
      )
    }

    fetchUserIdeas()

    const ideasChannel = supabase
      .channel(`ideas-updates-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ideas',
          filter: `creator_id=eq.${userId}`,
        },
        payload => {
          if (payload.new?.id) {
            userIdeasSetRef.current.add(payload.new.id)
          }

          const newNotification: Notification = {
            id: Date.now().toString() + Math.random().toString(36).substring(2),
            type: 'idea_created',
            title: t('notifications.idea_created'),
            message: t('notifications.idea_created_message').replace(
              '{title}',
              payload.new?.title || 'Untitled'
            ),
            timestamp: new Date().toISOString(),
            read: false,
            ideaId: payload.new?.id,
            ideaTitle: payload.new?.title,
          }
          dispatch(addNotificationAction(newNotification))
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'ideas',
          filter: `creator_id=eq.${userId}`,
        },
        payload => {
          const newNotification: Notification = {
            id: Date.now().toString() + Math.random().toString(36).substring(2),
            type: 'idea_updated',
            title: t('notifications.idea_updated'),
            message: t('notifications.idea_updated_message').replace(
              '{title}',
              payload.new?.title || 'Untitled'
            ),
            timestamp: new Date().toISOString(),
            read: false,
            ideaId: payload.new?.id,
            ideaTitle: payload.new?.title,
          }
          dispatch(addNotificationAction(newNotification))
        }
      )
      .subscribe(status => {
        console.log('useNotifications: Ideas channel status:', status)
      })

    const votesChannel = supabase
      .channel('global-votes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'idea_votes',
        },
        async payload => {
          if (!payload.new?.voter_id || !payload.new?.idea_id) {
            return
          }

          if (payload.new.voter_id === userId) {
            return
          }

          if (!userIdeasSetRef.current.has(payload.new.idea_id)) {
            return
          }

          const { data: idea } = await supabase
            .from('ideas')
            .select('title')
            .eq('id', payload.new.idea_id)
            .single()

          if (!idea) {
            console.error('useNotifications: Could not fetch idea title')
            return
          }

          const voteType = payload.new.vote_type || 'use'
          let notificationType: 'vote_up' | 'vote_down' | 'vote_pay' = 'vote_up'
          let title = t('notifications.vote_up')
          let message = t('notifications.vote_up_message')

          if (voteType === 'dislike') {
            notificationType = 'vote_down'
            title = t('notifications.vote_down')
            message = t('notifications.vote_down_message')
          } else if (voteType === 'pay') {
            notificationType = 'vote_pay'
            title = t('notifications.vote_pay')
            message = t('notifications.vote_pay_message')
          }

          const newNotification: Notification = {
            id: Date.now().toString() + Math.random().toString(36).substring(2),
            type: notificationType,
            title,
            message: message.replace('{title}', idea.title),
            timestamp: new Date().toISOString(),
            read: false,
            ideaId: payload.new.idea_id,
            ideaTitle: idea.title,
            userId: payload.new.voter_id,
          }
          dispatch(addNotificationAction(newNotification))
        }
      )
      .subscribe(status => {
        console.log('useNotifications: Votes channel status:', status)
      })

    const commentsChannel = supabase
      .channel('global-comments')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'comments',
        },
        async payload => {
          console.log('useNotifications: Comment event received:', payload.new)

          if (!payload.new?.user_id || !payload.new?.idea_id) {
            return
          }

          if (payload.new.user_id === userId) {
            console.log('useNotifications: Self-comment, skipping')
            return
          }

          if (!userIdeasSetRef.current.has(payload.new.idea_id)) {
            console.log('useNotifications: Comment not for user idea, skipping')
            return
          }

          console.log('useNotifications: Comment IS for user idea!')

          const { data: idea } = await supabase
            .from('ideas')
            .select('title')
            .eq('id', payload.new.idea_id)
            .single()

          if (!idea) {
            console.error('useNotifications: Could not fetch idea title')
            return
          }

          const newNotification: Notification = {
            id: Date.now().toString() + Math.random().toString(36).substring(2),
            type: 'comment',
            title: t('notifications.comment'),
            message: t('notifications.comment_message')
              .replace('{title}', idea.title)
              .replace('{content}', payload.new.content || ''),
            timestamp: new Date().toISOString(),
            read: false,
            ideaId: payload.new.idea_id,
            ideaTitle: idea.title,
            userId: payload.new.user_id,
          }

          console.log(
            'useNotifications: Dispatching comment notification:',
            newNotification
          )
          dispatch(addNotificationAction(newNotification))
        }
      )
      .subscribe(status => {
        console.log('useNotifications: Comments channel status:', status)
      })

    return () => {
      console.log('useNotifications: Cleaning up channels')
      supabase.removeChannel(ideasChannel)
      supabase.removeChannel(votesChannel)
      supabase.removeChannel(commentsChannel)
    }
  }, [userId, profile, dispatch])

  const addNotification = (
    type: Notification['type'],
    message: string,
    title?: string,
    ideaId?: string,
    ideaTitle?: string
  ) => {
    const newNotification: Notification = {
      id: Date.now().toString() + Math.random().toString(36).substring(2),
      type,
      title: title || getDefaultTitle(type),
      message,
      timestamp: new Date().toISOString(),
      read: false,
      ideaId,
      ideaTitle,
    }
    dispatch(addNotificationAction(newNotification))
  }

  const getDefaultTitle = (type: Notification['type']): string => {
    switch (type) {
      case 'vote_up':
        return t('notifications.vote_up')
      case 'vote_down':
        return t('notifications.vote_down')
      case 'vote_pay':
        return t('notifications.vote_pay')
      case 'comment':
        return t('notifications.comment')
      case 'idea_created':
        return t('notifications.idea_created')
      case 'idea_updated':
        return t('notifications.idea_updated')
      default:
        return t('notifications.title')
    }
  }

  const markNotificationAsRead = (notificationId: string) => {
    dispatch(markAsRead(notificationId))
  }

  const markAllNotificationsAsRead = () => {
    dispatch(markAllAsRead())
  }

  const removeNotification = (notificationId: string) => {
    dispatch({
      type: 'notifications/removeNotification',
      payload: notificationId,
    })
  }

  const clearAllNotifications = () => {
    dispatch({ type: 'notifications/clearAllNotifications' })
  }

  const getUnreadCount = () => {
    return notifications.filter(n => !n.read).length
  }

  return {
    notifications,
    addNotification,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    removeNotification,
    clearAllNotifications,
    getUnreadCount,
  }
}
