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

export const useNotifications = () => {
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
            title: 'New Idea Created',
            message: `Your idea "${payload.new?.title || 'Untitled'}" has been created successfully!`,
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
            title: 'Idea Updated',
            message: `Your idea "${payload.new?.title || 'Untitled'}" has been updated.`,
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
          console.log('useNotifications: Vote event received:', payload.new)

          if (!payload.new?.voter_id || !payload.new?.idea_id) {
            return
          }

          if (payload.new.voter_id === userId) {
            console.log('useNotifications: Self-vote, skipping')
            return
          }

          if (!userIdeasSetRef.current.has(payload.new.idea_id)) {
            console.log('useNotifications: Vote not for user idea, skipping')
            return
          }

          console.log('useNotifications: Vote IS for user idea!')

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
          let title = 'New Upvote'
          let message = 'Someone upvoted your idea'

          if (voteType === 'dislike') {
            notificationType = 'vote_down'
            title = 'New Downvote'
            message = 'Someone downvoted your idea'
          } else if (voteType === 'pay') {
            notificationType = 'vote_pay'
            title = 'New Payment'
            message = 'Someone paid for your idea'
          }

          const newNotification: Notification = {
            id: Date.now().toString() + Math.random().toString(36).substring(2),
            type: notificationType,
            title,
            message: `${message}: "${idea.title}"`,
            timestamp: new Date().toISOString(),
            read: false,
            ideaId: payload.new.idea_id,
            ideaTitle: idea.title,
            userId: payload.new.voter_id,
          }

          console.log(
            'useNotifications: Dispatching vote notification:',
            newNotification
          )
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
            title: 'New Comment',
            message: `Someone commented on your idea "${idea.title}": "${payload.new.content || ''}"`,
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
        return 'New Upvote'
      case 'vote_down':
        return 'New Downvote'
      case 'vote_pay':
        return 'New Payment'
      case 'comment':
        return 'New Comment'
      case 'idea_created':
        return 'Idea Created'
      case 'idea_updated':
        return 'Idea Updated'
      default:
        return 'Notification'
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
