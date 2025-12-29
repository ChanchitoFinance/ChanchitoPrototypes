import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { ideaService } from '@/core/lib/services/ideaService'
import { Idea } from '@/core/types/idea'

interface UserVotes {
  use: boolean
  dislike: boolean
  pay: boolean
}

interface IdeaState {
  currentIdea: Idea | null
  userVotes: UserVotes
  isVoting: boolean
  error: string | null
}

const initialState: IdeaState = {
  currentIdea: null,
  userVotes: {
    use: false,
    dislike: false,
    pay: false,
  },
  isVoting: false,
  error: null,
}

export const toggleVote = createAsyncThunk(
  'ideas/toggleVote',
  async (
    {
      ideaId,
      voteType,
    }: { ideaId: string; voteType: 'use' | 'dislike' | 'pay' },
    { rejectWithValue }
  ) => {
    try {
      const updatedIdea = await ideaService.toggleVote(ideaId, voteType)
      return updatedIdea
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message)
      }
      return rejectWithValue('Unknown error')
    }
  }
)

export const fetchUserVotes = createAsyncThunk(
  'ideas/fetchUserVotes',
  async (ideaId: string, { rejectWithValue }) => {
    try {
      const votes = await ideaService.getUserVotes(ideaId)
      return votes
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message)
      }
      return rejectWithValue('Unknown error')
    }
  }
)

const ideasSlice = createSlice({
  name: 'ideas',
  initialState,
  reducers: {
    clearError: state => {
      state.error = null
    },
    setCurrentIdea: (state, action: PayloadAction<Idea>) => {
      state.currentIdea = action.payload
    },
    updateUserVotes: (state, action: PayloadAction<UserVotes>) => {
      state.userVotes = action.payload
    },
  },
  extraReducers: builder => {
    builder
      .addCase(toggleVote.pending, state => {
        state.isVoting = true
        state.error = null
      })
      .addCase(toggleVote.fulfilled, (state, action) => {
        state.isVoting = false
        state.currentIdea = action.payload

        const voteType = action.meta.arg.voteType
        if (voteType === 'use' || voteType === 'dislike') {
          state.userVotes = {
            ...state.userVotes,
            use: voteType === 'use' ? !state.userVotes.use : false,
            dislike: voteType === 'dislike' ? !state.userVotes.dislike : false,
            pay: state.userVotes.pay,
          }
        } else if (voteType === 'pay') {
          state.userVotes = {
            ...state.userVotes,
            pay: !state.userVotes.pay,
          }
        }
      })
      .addCase(toggleVote.rejected, (state, action) => {
        state.isVoting = false
        state.error = action.payload as string
      })
      .addCase(fetchUserVotes.fulfilled, (state, action) => {
        state.userVotes = action.payload
      })
      .addCase(fetchUserVotes.rejected, (state, action) => {
        state.error = action.payload as string
      })
  },
})

export const { clearError, setCurrentIdea, updateUserVotes } =
  ideasSlice.actions
export default ideasSlice.reducer
