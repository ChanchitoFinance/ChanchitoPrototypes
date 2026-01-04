import { useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '@/core/lib/hooks'
import { supabase } from '@/core/lib/supabase'
import {
  setUserId,
  setNotifications,
  addNotification as addNotificationAction,
  markAsRead,
  markAllAsRead,
} from '@/core/lib/slices/notificationsSlice'
import { Notification } from '@/core/types/notification'

export const useNotifications = () => {
  const dispatch = useAppDispatch()
  const { notifications, userId } = useAppSelector(state => state.notifications)
  const { user, profile } = useAppSelector(state => state.auth)

  const getStorageKey = (key: string) => {
    return `${userId}_${key}`
  }

  useEffect(() => {
    if (user?.id) {
      dispatch(setUserId(user.id))
    } else {
      dispatch(setUserId(null))
    }
  }, [user?.id, dispatch])

  useEffect(() => {
    console.log('=== TESTING REALTIME CONNECTION ===')
    const testChannel = supabase
      .channel('realtime-test')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'idea_votes',
        },
        payload => {
          console.log('🔥 TEST: Vote detected globally:', payload)
        }
      )
      .subscribe((status, err) => {
        console.log('TEST channel status:', status)
        if (err) console.error('TEST channel error:', err)
      })

    return () => {
      supabase.removeChannel(testChannel)
    }
  }, [])

  useEffect(() => {
    if (!userId || !profile) {
      console.log(
        'useNotifications: Skipping setup - userId:',
        userId,
        'profile:',
        !!profile
      )
      return
    }

    console.log('useNotifications: Setting up subscriptions for user:', userId)

    const fetchUserIdeas = async () => {
      const { data: userIdeas, error } = await supabase
        .from('ideas')
        .select('id, title')
        .eq('creator_id', userId)

      if (error) {
        console.error('useNotifications: Error fetching user ideas:', error)
        return []
      }
      console.log(
        'useNotifications: User ideas fetched:',
        userIdeas?.length || 0
      )
      return userIdeas || []
    }

    let userIdeasMap = new Map<string, string>()

    fetchUserIdeas().then(ideas => {
      ideas.forEach(idea => {
        userIdeasMap.set(idea.id, idea.title)
      })
      console.log('useNotifications: Ideas cached in Map:', userIdeasMap.size)
    })

    const ideasChannel = supabase
      .channel(`ideas-updates-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ideas',
          filter: `creator_id=eq.${userId}`,
        },
        payload => {
          console.log('useNotifications: Ideas event received:', payload)

          if (payload.eventType === 'INSERT') {
            const newNotification: Notification = {
              id: Date.now().toString(),
              type: 'idea_created',
              title: 'New Idea Created',
              message: `Your idea "${payload.new?.title || 'Untitled'}" has been created successfully!`,
              timestamp: new Date().toISOString(),
              read: false,
              ideaId: payload.new?.id,
              ideaTitle: payload.new?.title,
            }
            dispatch(addNotificationAction(newNotification))
          } else if (payload.eventType === 'UPDATE') {
            const newNotification: Notification = {
              id: Date.now().toString(),
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
        }
      )
      .subscribe(status => {
        console.log('useNotifications: Ideas channel status:', status)
      })

    const votesChannel = supabase
      .channel(`all-votes-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'idea_votes',
        },
        async payload => {
          console.log('useNotifications: Vote event received:', {
            voter_id: payload.new?.voter_id,
            idea_id: payload.new?.idea_id,
            vote_type: payload.new?.vote_type,
            current_user: userId,
          })

          if (!payload.new?.voter_id || !payload.new?.idea_id) {
            console.log('useNotifications: Invalid vote payload, skipping')
            return
          }

          if (payload.new.voter_id === userId) {
            console.log('useNotifications: Self-vote detected, skipping')
            return
          }

          if (userIdeasMap.size === 0) {
            console.log('useNotifications: Cache empty, fetching ideas...')
            const ideas = await fetchUserIdeas()
            userIdeasMap.clear()
            ideas.forEach(idea => {
              userIdeasMap.set(idea.id, idea.title)
            })
            console.log('useNotifications: Cache refreshed:', userIdeasMap.size)
          }

          const ideaTitle = userIdeasMap.get(payload.new.idea_id)

          if (!ideaTitle) {
            console.log('useNotifications: Vote not for user idea, skipping', {
              idea_id: payload.new.idea_id,
              cached_ideas: Array.from(userIdeasMap.keys()),
            })
            return
          }

          console.log('useNotifications: Vote IS for user idea:', ideaTitle)

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
            message: `${message}: "${ideaTitle}"`,
            timestamp: new Date().toISOString(),
            read: false,
            ideaId: payload.new.idea_id,
            ideaTitle: ideaTitle,
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
      .channel(`all-comments-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'comments',
        },
        async payload => {
          console.log('useNotifications: Comment event received:', {
            user_id: payload.new?.user_id,
            idea_id: payload.new?.idea_id,
            current_user: userId,
          })

          if (!payload.new?.user_id || !payload.new?.idea_id) {
            console.log('useNotifications: Invalid comment payload, skipping')
            return
          }

          if (payload.new.user_id === userId) {
            console.log('useNotifications: Self-comment detected, skipping')
            return
          }

          if (userIdeasMap.size === 0) {
            console.log('useNotifications: Cache empty, fetching ideas...')
            const ideas = await fetchUserIdeas()
            userIdeasMap.clear()
            ideas.forEach(idea => {
              userIdeasMap.set(idea.id, idea.title)
            })
            console.log('useNotifications: Cache refreshed:', userIdeasMap.size)
          }

          const ideaTitle = userIdeasMap.get(payload.new.idea_id)

          if (!ideaTitle) {
            console.log('useNotifications: Comment not for user idea, skipping')
            return
          }

          console.log('useNotifications: Comment IS for user idea:', ideaTitle)

          const newNotification: Notification = {
            id: Date.now().toString() + Math.random().toString(36).substring(2),
            type: 'comment',
            title: 'New Comment',
            message: `Someone commented on your idea "${ideaTitle}": "${payload.new.content || ''}"`,
            timestamp: new Date().toISOString(),
            read: false,
            ideaId: payload.new.idea_id,
            ideaTitle: ideaTitle,
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
