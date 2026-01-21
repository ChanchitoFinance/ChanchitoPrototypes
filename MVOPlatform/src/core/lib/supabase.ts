import { createClient } from '@supabase/supabase-js'
import { clientEnv } from '../../../env-validation/config/env'

/**
 * Supabase client configuration optimized for performance
 * - Connection pooling for faster queries
 * - Realtime subscriptions enabled
 * - Auto-refresh token handling
 */

export const supabase = createClient(
  clientEnv.supabaseUrl,
  clientEnv.supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
    },
    // Enable realtime for live updates
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  }
)

/**
 * Subscribe to idea updates (votes, comments)
 * Returns unsubscribe function
 */
export const subscribeToIdea = (
  ideaId: string,
  callbacks: {
    onVote?: (payload: any) => void
    onComment?: (payload: any) => void
  }
) => {
  const channel = supabase
    .channel(`idea-${ideaId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'idea_votes',
        filter: `idea_id=eq.${ideaId}`,
      },
      callbacks.onVote
    )
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'comments',
        filter: `idea_id=eq.${ideaId}`,
      },
      callbacks.onComment
    )
    .subscribe()

  return () => supabase.removeChannel(channel)
}

/**
 * Batch fetch multiple ideas efficiently
 */
export const batchFetchIdeas = async (ideaIds: string[]) => {
  const { data, error } = await supabase
    .from('ideas')
    .select(
      `
      id,
      title,
      status_flag,
      content,
      created_at,
      anonymous,
      creator_id,
      users!ideas_creator_id_fkey (
        username,
        full_name
      ),
      idea_votes (
        vote_type
      ),
      comments!left (
        id
      )
    `
    )
    .in('id', ideaIds)

  if (error) throw error
  return data
}

/**
 * Call RPC function for optimized vote toggle
 * Note: Function uses auth.uid() internally for user ID
 */
export const toggleVoteRPC = async (
  ideaId: string,
  voteType: 'dislike' | 'use' | 'pay'
) => {
  const { data, error } = await supabase.rpc('toggle_idea_vote', {
    p_idea_id: ideaId,
    p_vote_type: voteType,
  })

  if (error) throw error
  return data
}

/**
 * Batch fetch user votes for multiple ideas
 * Note: Function uses auth.uid() internally for user ID
 */
export const getUserVotesForIdeasRPC = async (ideaIds: string[]) => {
  const { data, error } = await supabase.rpc('get_user_votes_for_ideas', {
    p_idea_ids: ideaIds,
  })

  if (error) throw error
  return data || {}
}

/**
 * Call RPC function for optimized comment vote toggle
 * Note: Function uses auth.uid() internally for user ID
 */
export const toggleCommentVoteRPC = async (
  commentId: string,
  reactionType: 'upvote' | 'downvote'
) => {
  const { data, error } = await supabase.rpc('toggle_comment_vote', {
    p_comment_id: commentId,
    p_reaction_type: reactionType,
  })

  if (error) throw error
  return data
}
