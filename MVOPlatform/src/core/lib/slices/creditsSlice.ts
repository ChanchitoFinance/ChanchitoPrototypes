import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { supabase } from '@/core/lib/supabase'

interface CreditsState {
  plan: 'free' | 'pro' | 'premium' | 'innovator'
  dailyCredits: number
  usedCredits: number
  lastReset: string // ISO date string
  loading: boolean
  error: string | null
}

const initialState: CreditsState = {
  plan: 'free',
  dailyCredits: 3,
  usedCredits: 0,
  lastReset: new Date().toISOString().split('T')[0],
  loading: false,
  error: null,
}

const planCredits = {
  free: 3,
  pro: 50,
  premium: 250,
  innovator: -1, // Infinite
}

// Async thunk to load user credits from database
export const loadUserCredits = createAsyncThunk(
  'credits/loadUserCredits',
  async (userId: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('plan, daily_credits_used, last_credits_reset')
      .eq('id', userId)
      .single()

    if (error) throw error

    const plan = data.plan as keyof typeof planCredits
    const dailyCredits = planCredits[plan]
    const usedCredits = data.daily_credits_used || 0
    const lastReset =
      data.last_credits_reset || new Date().toISOString().split('T')[0]

    // Check if we need to reset credits (new day)
    const today = new Date().toISOString().split('T')[0]
    const needsReset = lastReset < today

    if (needsReset) {
      // Reset credits in database
      await supabase
        .from('users')
        .update({
          daily_credits_used: 0,
          last_credits_reset: today,
        })
        .eq('id', userId)

      return {
        plan,
        dailyCredits,
        usedCredits: 0,
        lastReset: today,
      }
    }

    return {
      plan,
      dailyCredits,
      usedCredits,
      lastReset,
    }
  }
)

// Async thunk to deduct credits
export const deductCredits = createAsyncThunk(
  'credits/deductCredits',
  async (
    { userId, amount }: { userId: string; amount: number },
    { getState }
  ) => {
    const state = getState() as { credits: CreditsState }

    if (state.credits.plan === 'innovator') {
      // Innovator have infinite credits
      return { success: true }
    }

    const remainingCredits =
      state.credits.dailyCredits - state.credits.usedCredits
    if (remainingCredits < amount) {
      throw new Error('Insufficient credits')
    }

    const newUsedCredits = state.credits.usedCredits + amount

    // Update database
    const { error } = await supabase
      .from('users')
      .update({ daily_credits_used: newUsedCredits })
      .eq('id', userId)

    if (error) throw error

    return { newUsedCredits }
  }
)

// Async thunk to update plan
export const updateUserPlan = createAsyncThunk(
  'credits/updateUserPlan',
  async ({
    userId,
    plan,
  }: {
    userId: string
    plan: keyof typeof planCredits
  }) => {
    const { error } = await supabase
      .from('users')
      .update({ plan })
      .eq('id', userId)

    if (error) throw error

    return { plan, dailyCredits: planCredits[plan] }
  }
)

const creditsSlice = createSlice({
  name: 'credits',
  initialState,
  reducers: {
    resetCredits: state => {
      state.usedCredits = 0
      state.lastReset = new Date().toISOString().split('T')[0]
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
  },
  extraReducers: builder => {
    builder
      .addCase(loadUserCredits.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(loadUserCredits.fulfilled, (state, action) => {
        state.loading = false
        state.plan = action.payload.plan
        state.dailyCredits = action.payload.dailyCredits
        state.usedCredits = action.payload.usedCredits
        state.lastReset = action.payload.lastReset
      })
      .addCase(loadUserCredits.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to load credits'
      })
      .addCase(deductCredits.fulfilled, (state, action) => {
        if (action.payload.newUsedCredits !== undefined) {
          state.usedCredits = action.payload.newUsedCredits
        }
      })
      .addCase(updateUserPlan.fulfilled, (state, action) => {
        state.plan = action.payload.plan
        state.dailyCredits = action.payload.dailyCredits
        // Reset used credits when plan changes
        state.usedCredits = 0
      })
  },
})

export const { resetCredits, setError } = creditsSlice.actions
export default creditsSlice.reducer
