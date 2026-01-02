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

  // Initialize user ID when auth state changes
  useEffect(() => {
    if (user?.id) {
      dispatch(setUserId(user.id))
    } else {
      dispatch(setUserId(null))
    }
  }, [user?.id, dispatch])

  // Set up real-time notifications for idea changes
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
    console.log('useNotifications: Profile:', profile)

    // First, fetch the user's ideas to know which ones to monitor
    const fetchUserIdeas = async () => {
      const { data: userIdeas, error } = await supabase
        .from('ideas')
        .select('id, title')
        .eq('creator_id', userId)

      if (error) {
        console.error('Error fetching user ideas:', error)
        return []
      }
      console.log(
        'useNotifications: Fetched user ideas:',
        userIdeas?.length || 0
      )
      return userIdeas || []
    }

    // Cache the user's ideas to avoid repeated fetching
    let userIdeasCache: { id: string; title: string }[] = []

    // Fetch and cache user ideas initially
    fetchUserIdeas().then(ideas => {
      userIdeasCache = ideas
    })

    // Subscribe to idea changes
    const ideasChannel = supabase
      .channel(`ideas-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ideas',
          filter: `creator_id=eq.${userId}`,
        },
        payload => {
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
      .subscribe()

    // Subscribe to ALL votes, then filter client-side
    const votesChannel = supabase
      .channel(`votes-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'idea_votes',
        },
        async payload => {
          console.log('useNotifications: Vote received:', payload.new)
          // Check if this vote is on one of the user's ideas
          const userIdeas = await fetchUserIdeas()
          const isUserIdea = userIdeas.some(
            idea => idea.id === payload.new?.idea_id
          )

          console.log(
            'useNotifications: Vote check - isUserIdea:',
            isUserIdea,
            'voter_id:',
            payload.new?.voter_id,
            'userId:',
            userId,
            'userIdeas:',
            userIdeas
          )

          if (isUserIdea && payload.new?.voter_id !== userId) {
            console.log('useNotifications: Creating notification for vote')
            const voteType = payload.new?.vote_type || 'use'
            let notificationType: 'vote_up' | 'vote_down' | 'vote_pay' =
              'vote_up'
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

            // Get the idea title
            const idea = userIdeas.find(
              idea => idea.id === payload.new?.idea_id
            )

            const newNotification: Notification = {
              id:
                Date.now().toString() + Math.random().toString(36).substring(2),
              type: notificationType,
              title,
              message: `${message}: "${idea?.title || payload.new?.idea_title || 'Untitled'}"`,
              timestamp: new Date().toISOString(),
              read: false,
              ideaId: payload.new?.idea_id,
              ideaTitle: idea?.title || payload.new?.idea_title,
              userId: payload.new?.voter_id,
            }
            console.log(
              'useNotifications: Dispatching notification:',
              newNotification
            )
            dispatch(addNotificationAction(newNotification))
          }
        }
      )
      .subscribe()

    console.log('useNotifications: Votes subscription set up')

    // Subscribe to ALL comments, then filter client-side
    const commentsChannel = supabase
      .channel(`comments-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'comments',
        },
        async payload => {
          // Check if this comment is on one of the user's ideas
          const userIdeas = await fetchUserIdeas()
          const isUserIdea = userIdeas.some(
            idea => idea.id === payload.new?.idea_id
          )

          if (isUserIdea && payload.new?.user_id !== userId) {
            // Don't notify for self-comments
            // Get the idea title
            const idea = userIdeas.find(
              idea => idea.id === payload.new?.idea_id
            )

            const newNotification: Notification = {
              id:
                Date.now().toString() + Math.random().toString(36).substring(2),
              type: 'comment',
              title: 'New Comment',
              message: `Someone commented on your idea "${idea?.title || payload.new?.idea_title || 'Untitled'}": "${payload.new?.content || ''}"`,
              timestamp: new Date().toISOString(),
              read: false,
              ideaId: payload.new?.idea_id,
              ideaTitle: idea?.title || payload.new?.idea_title,
              userId: payload.new?.user_id,
              userName: payload.new?.user_name,
            }
            dispatch(addNotificationAction(newNotification))
          }
        }
      )
      .subscribe()

    return () => {
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
