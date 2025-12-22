import { createApi, fakeBaseQuery } from '@reduxjs/toolkit/query/react'
import { Idea } from '@/lib/types/idea'
import { supabase } from '@/lib/supabase'
import { ContentBlock } from '@/lib/types/content'

// Types for cursor-based pagination
interface IdeasPage {
  ideas: Idea[]
  nextCursor: string | null
}

interface GetIdeasArgs {
  limit?: number
  statusFilter?: 'new' | 'trending' | 'forYou' | 'explore'
}

interface ToggleVoteArgs {
  ideaId: string
  voteType: 'use' | 'dislike' | 'pay'
}

interface UserVotes {
  use: boolean
  dislike: boolean
  pay: boolean
}

/**
 * Maps database idea to frontend Idea type
 */
function mapDbIdeaToIdea(dbIdea: any): Idea {
  const votes = dbIdea.idea_votes || []
  const voteCounts = {
    dislike: votes.filter((v: any) => v.vote_type === 'dislike').length,
    use: votes.filter((v: any) => v.vote_type === 'use').length,
    pay: votes.filter((v: any) => v.vote_type === 'pay').length,
  }
  const totalVotes = voteCounts.dislike + voteCounts.use + voteCounts.pay
  const score = voteCounts.pay * 3 + voteCounts.use * 2 - voteCounts.dislike

  const tags = dbIdea.idea_tags?.map((it: any) => it.tags.name) || []
  const author = dbIdea.users?.username || dbIdea.users?.full_name || 'Anonymous'
  const content = dbIdea.content as ContentBlock[] | undefined

  const video = content?.find(block => block.type === 'video')?.src || content
      ?.find(block => block.type === 'carousel')
      ?.slides?.find(slide => slide.video)?.video

  const commentCount = dbIdea.comments?.length || 0

  return {
    id: dbIdea.id,
    title: dbIdea.title,
    description: content?.find(block => block.type === 'text')?.content || '',
    author,
    score,
    votes: totalVotes,
    votesByType: voteCounts,
    commentCount,
    tags,
    createdAt: dbIdea.created_at,
    video,
    content,
    status_flag: dbIdea.status_flag,
  }
}

/**
 * Common select query for ideas with all relations
 */
const IDEA_SELECT_QUERY = `
  id,
  title,
  status_flag,
  content,
  created_at,
  users!ideas_creator_id_fkey (
    username,
    full_name
  ),
  idea_votes (
    vote_type
  ),
  idea_tags (
    tags (
      name
    )
  ),
  comments!left (
    id
  )
`

export const ideasApi = createApi({
  reducerPath: 'ideasApi',
  baseQuery: fakeBaseQuery(),
  tagTypes: ['Ideas', 'Idea', 'UserVotes'],
  endpoints: builder => ({
    /**
     * Infinite scroll query for ideas with cursor-based pagination
     */
    getIdeas: builder.infiniteQuery<IdeasPage, GetIdeasArgs, string | null>({
      infiniteQueryOptions: {
        initialPageParam: null,
        getNextPageParam: lastPage => lastPage.nextCursor,
      },
      async queryFn(args, _api) {
        // Extract queryArg and pageParam from the combined args
        const queryArg = args.queryArg as GetIdeasArgs
        const cursor = args.pageParam as string | null
        const limit = queryArg.limit ?? 12
        const statusFilter = queryArg.statusFilter

        try {
          let query = supabase
            .from('ideas')
            .select(IDEA_SELECT_QUERY)
            .order('created_at', { ascending: false })
            .limit(limit + 1) // Fetch one extra to check for more

          // Apply cursor filter for pagination
          if (cursor) {
            query = query.lt('created_at', cursor)
          }

          // Apply status filter
          if (statusFilter === 'new') {
            query = query.eq('status_flag', 'new')
          } else if (statusFilter === 'trending') {
            query = query.eq('status_flag', 'trending')
          } else if (statusFilter === 'forYou' || statusFilter === 'explore') {
            query = query.neq('status_flag', 'validated')
          }

          const { data, error } = await query

          if (error) {
            return { error: { message: error.message } }
          }

          const hasMore = data && data.length > limit
          const ideas = (hasMore ? data.slice(0, limit) : data || []).map(
            mapDbIdeaToIdea
          )
          const nextCursor =
            hasMore && ideas.length > 0
              ? ideas[ideas.length - 1].createdAt
              : null

          return {
            data: { ideas, nextCursor },
          }
        } catch (error) {
          return {
            error: { message: (error as Error).message },
          }
        }
      },
      providesTags: result =>
        result
          ? [
              ...result.pages.flatMap(page =>
                page.ideas.map(idea => ({ type: 'Idea' as const, id: idea.id }))
              ),
              { type: 'Ideas', id: 'LIST' },
            ]
          : [{ type: 'Ideas', id: 'LIST' }],
    }),

    /**
     * Get a single idea by ID
     * Uses cache if available from list queries
     */
    getIdeaById: builder.query<Idea, string>({
      async queryFn(ideaId) {
        try {
          const { data, error } = await supabase
            .from('ideas')
            .select(IDEA_SELECT_QUERY)
            .eq('id', ideaId)
            .single()

          if (error) {
            return { error: { message: error.message } }
          }

          return { data: mapDbIdeaToIdea(data) }
        } catch (error) {
          return { error: { message: (error as Error).message } }
        }
      },
      providesTags: (result, error, ideaId) => [{ type: 'Idea', id: ideaId }],
    }),

    /**
     * Get user votes for a single idea
     */
    getUserVotes: builder.query<UserVotes, string>({
      async queryFn(ideaId) {
        try {
          const {
            data: { user },
          } = await supabase.auth.getUser()

          if (!user) {
            return { data: { use: false, dislike: false, pay: false } }
          }

          const { data, error } = await supabase
            .from('idea_votes')
            .select('vote_type')
            .eq('idea_id', ideaId)
            .eq('voter_id', user.id)

          if (error) {
            return { error: { message: error.message } }
          }

          const votes = data || []
          return {
            data: {
              use: votes.some(v => v.vote_type === 'use'),
              dislike: votes.some(v => v.vote_type === 'dislike'),
              pay: votes.some(v => v.vote_type === 'pay'),
            },
          }
        } catch (error) {
          return { error: { message: (error as Error).message } }
        }
      },
      providesTags: (result, error, ideaId) => [
        { type: 'UserVotes', id: ideaId },
      ],
    }),

    /**
     * Get user votes for multiple ideas (batch)
     */
    getUserVotesForIdeas: builder.query<Record<string, UserVotes>, string[]>({
      async queryFn(ideaIds) {
        try {
          const {
            data: { user },
          } = await supabase.auth.getUser()

          if (!user) {
            const result: Record<string, UserVotes> = {}
            ideaIds.forEach(id => {
              result[id] = { use: false, dislike: false, pay: false }
            })
            return { data: result }
          }

          const { data, error } = await supabase
            .from('idea_votes')
            .select('idea_id, vote_type')
            .in('idea_id', ideaIds)
            .eq('voter_id', user.id)

          if (error) {
            return { error: { message: error.message } }
          }

          const result: Record<string, UserVotes> = {}
          ideaIds.forEach(ideaId => {
            result[ideaId] = { use: false, dislike: false, pay: false }
          })

          const votes = data || []
          votes.forEach(vote => {
            if (result[vote.idea_id]) {
              result[vote.idea_id][
                vote.vote_type as 'use' | 'dislike' | 'pay'
              ] = true
            }
          })

          return { data: result }
        } catch (error) {
          return { error: { message: (error as Error).message } }
        }
      },
      providesTags: (result, error, ideaIds) =>
        ideaIds.map(id => ({ type: 'UserVotes', id })),
    }),

    /**
     * Toggle a vote for an idea with optimistic updates
     */
    toggleVote: builder.mutation<Idea, ToggleVoteArgs>({
      async queryFn({ ideaId, voteType }) {
        try {
          const {
            data: { user },
          } = await supabase.auth.getUser()

          if (!user) {
            return { error: { message: 'User not authenticated' } }
          }

          // Handle different vote types
          if (voteType === 'use' || voteType === 'dislike') {
            // Check if user has this specific vote type
            const { data: existingVote } = await supabase
              .from('idea_votes')
              .select('vote_type')
              .eq('idea_id', ideaId)
              .eq('voter_id', user.id)
              .eq('vote_type', voteType)
              .maybeSingle()

            // Remove any existing use/dislike vote
            await supabase
              .from('idea_votes')
              .delete()
              .eq('idea_id', ideaId)
              .eq('voter_id', user.id)
              .in('vote_type', ['use', 'dislike'])

            // If clicking different vote type or no vote existed, insert
            if (!existingVote) {
              await supabase.from('idea_votes').insert({
                idea_id: ideaId,
                voter_id: user.id,
                vote_type: voteType,
              })
            }
          } else if (voteType === 'pay') {
            // Check for existing pay vote
            const { data: existingPayVote } = await supabase
              .from('idea_votes')
              .select('vote_type')
              .eq('idea_id', ideaId)
              .eq('voter_id', user.id)
              .eq('vote_type', 'pay')
              .maybeSingle()

            if (existingPayVote) {
              await supabase
                .from('idea_votes')
                .delete()
                .eq('idea_id', ideaId)
                .eq('voter_id', user.id)
                .eq('vote_type', 'pay')
            } else {
              await supabase.from('idea_votes').insert({
                idea_id: ideaId,
                voter_id: user.id,
                vote_type: 'pay',
              })
            }
          }

          // Fetch and return updated idea
          const { data, error } = await supabase
            .from('ideas')
            .select(IDEA_SELECT_QUERY)
            .eq('id', ideaId)
            .single()

          if (error) {
            return { error: { message: error.message } }
          }

          return { data: mapDbIdeaToIdea(data) }
        } catch (error) {
          return { error: { message: (error as Error).message } }
        }
      },
      // Optimistic update for immediate UI feedback
      async onQueryStarted({ ideaId, voteType }, { dispatch, queryFulfilled }) {
        // Update the single idea cache optimistically
        const patchResult = dispatch(
          ideasApi.util.updateQueryData('getIdeaById', ideaId, draft => {
            // Toggle the vote counts optimistically
            const currentVotes = draft.votesByType
            const wasVoted =
              voteType === 'use'
                ? currentVotes.use > 0
                : voteType === 'dislike'
                  ? currentVotes.dislike > 0
                  : currentVotes.pay > 0

            if (voteType === 'use' || voteType === 'dislike') {
              // Reset both use and dislike, then apply new vote
              draft.votesByType.use = 0
              draft.votesByType.dislike = 0
              if (!wasVoted) {
                draft.votesByType[voteType] = 1
              }
            } else if (voteType === 'pay') {
              draft.votesByType.pay = wasVoted ? 0 : 1
            }

            // Recalculate score
            draft.score =
              draft.votesByType.pay * 3 +
              draft.votesByType.use * 2 -
              draft.votesByType.dislike
          })
        )

        try {
          await queryFulfilled
        } catch {
          patchResult.undo()
        }
      },
      invalidatesTags: (result, error, { ideaId }) => [
        { type: 'Idea', id: ideaId },
        { type: 'UserVotes', id: ideaId },
      ],
    }),

    /**
     * Get new ideas (status_flag: 'new')
     */
    getNewIdeas: builder.query<Idea[], number>({
      async queryFn(limit = 2) {
        try {
          const { data, error } = await supabase
            .from('ideas')
            .select(IDEA_SELECT_QUERY)
            .eq('status_flag', 'new')
            .order('created_at', { ascending: false })
            .limit(limit)

          if (error) {
            return { error: { message: error.message } }
          }

          return { data: (data || []).map(mapDbIdeaToIdea) }
        } catch (error) {
          return { error: { message: (error as Error).message } }
        }
      },
      providesTags: result =>
        result
          ? [
              ...result.map(idea => ({ type: 'Idea' as const, id: idea.id })),
              { type: 'Ideas', id: 'NEW' },
            ]
          : [{ type: 'Ideas', id: 'NEW' }],
    }),

    /**
     * Get trending ideas (status_flag: 'trending')
     */
    getTrendingIdeas: builder.query<Idea[], number>({
      async queryFn(limit = 5) {
        try {
          const { data, error } = await supabase
            .from('ideas')
            .select(IDEA_SELECT_QUERY)
            .eq('status_flag', 'trending')
            .order('created_at', { ascending: false })
            .limit(limit)

          if (error) {
            return { error: { message: error.message } }
          }

          return { data: (data || []).map(mapDbIdeaToIdea) }
        } catch (error) {
          return { error: { message: (error as Error).message } }
        }
      },
      providesTags: result =>
        result
          ? [
              ...result.map(idea => ({ type: 'Idea' as const, id: idea.id })),
              { type: 'Ideas', id: 'TRENDING' },
            ]
          : [{ type: 'Ideas', id: 'TRENDING' }],
    }),
  }),
})

// Export hooks for use in components
export const {
  useGetIdeasInfiniteQuery,
  useGetIdeaByIdQuery,
  useGetUserVotesQuery,
  useGetUserVotesForIdeasQuery,
  useToggleVoteMutation,
  useGetNewIdeasQuery,
  useGetTrendingIdeasQuery,
} = ideasApi
