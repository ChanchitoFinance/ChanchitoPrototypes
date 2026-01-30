import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { supabase } from '@/core/lib/supabase'

interface CreditsState {
  coinsBalance: number
  loading: boolean
  loaded: boolean
  error: string | null
}

const initialState: CreditsState = {
  coinsBalance: 0,
  loading: false,
  loaded: false,
  error: null,
}

// Async thunk to load user coins from database
export const loadUserCredits = createAsyncThunk(
  'credits/loadUserCredits',
  async (userId: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('coins_balance')
      .eq('id', userId)
      .single()

    if (error) throw error

    const coinsBalance = Math.max(0, Number(data?.coins_balance) ?? 0)
    return { coinsBalance }
  }
)

// Async thunk to deduct coins
export const deductCredits = createAsyncThunk(
  'credits/deductCredits',
  async (
    { userId, amount }: { userId: string; amount: number },
    { getState }
  ) => {
    const state = getState() as { credits: CreditsState }
    if (state.credits.coinsBalance < amount) {
      throw new Error('Insufficient coins')
    }

    const newBalance = state.credits.coinsBalance - amount

    const { error } = await supabase
      .from('users')
      .update({ coins_balance: newBalance })
      .eq('id', userId)

    if (error) throw error

    return { newBalance }
  }
)

// Add coins (e.g. after purchase) – API does this; client just reloads
export const addCoins = createAsyncThunk(
  'credits/addCoins',
  async (
    { userId, amount }: { userId: string; amount: number },
    { getState }
  ) => {
    const state = getState() as { credits: CreditsState }
    const currentBalance = state.credits.coinsBalance
    const newBalance = currentBalance + amount

    const { error } = await supabase
      .from('users')
      .update({ coins_balance: newBalance })
      .eq('id', userId)

    if (error) throw error

    return { newBalance }
  }
)

const creditsSlice = createSlice({
  name: 'credits',
  initialState,
  reducers: {
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
    setCoinsBalance: (state, action: PayloadAction<number>) => {
      state.coinsBalance = action.payload
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
        state.loaded = true
        state.coinsBalance = action.payload.coinsBalance
      })
      .addCase(loadUserCredits.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to load credits'
      })
      .addCase(deductCredits.fulfilled, (state, action) => {
        if (action.payload.newBalance !== undefined) {
          state.coinsBalance = action.payload.newBalance
        }
      })
      .addCase(addCoins.fulfilled, (state, action) => {
        if (action.payload.newBalance !== undefined) {
          state.coinsBalance = action.payload.newBalance
        }
      })
  },
})

export const { setError, setCoinsBalance } = creditsSlice.actions
export default creditsSlice.reducer
