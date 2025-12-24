import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { supabase } from '@/lib/supabase'
import { AuthState, UserProfile } from '@/types/auth'

const initialState: AuthState = {
  user: null,
  profile: null,
  loading: true,
  error: null,
  isAuthenticated: false,
  initialized: false,
}

const waitForProfile = async (
  userId: string,
  maxAttempts = 10
): Promise<UserProfile | null> => {
  for (let i = 0; i < maxAttempts; i++) {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    if (data) {
      return data as UserProfile
    }

    if (error) {
      console.error('Error fetching profile:', error)
    }

    if (i < maxAttempts - 1) {
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }
  return null
}

export const signInWithGoogle = createAsyncThunk(
  'auth/signInWithGoogle',
  async (_, { rejectWithValue }) => {
    try {
      // Get the current locale from the URL using regex to match any locale
      const pathname = window.location.pathname
      const localeMatch = pathname.match(/^\/([a-z]{2})/)
      const locale = localeMatch ? localeMatch[1] : 'en'

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/${locale}/auth/callback`,
        },
      })

      if (error) throw error

      return data
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message)
      }
      return rejectWithValue('Unknown error')
    }
  }
)

export const signOut = createAsyncThunk(
  'auth/signOut',
  async (_, { rejectWithValue }) => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error: unknown) {
      if (error instanceof Error) {
        return rejectWithValue(error.message)
      }
      return rejectWithValue('Unknown error')
    }
  }
)

export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async (_, { rejectWithValue }) => {
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession()

      if (sessionError) throw sessionError

      if (session?.user) {
        const profile = await waitForProfile(session.user.id)

        if (!profile) {
          console.warn('Profile not found for authenticated user')
          await supabase.auth.signOut()
          return { user: null, profile: null }
        }

        return { user: session.user, profile }
      }

      return { user: null, profile: null }
    } catch (error: unknown) {
      console.error('CheckAuth error:', error)
      if (error instanceof Error) {
        return rejectWithValue(error.message)
      }
      return rejectWithValue('Unknown error')
    }
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: state => {
      state.error = null
    },
    updateProfile: (state, action: PayloadAction<UserProfile>) => {
      state.profile = action.payload
    },
  },
  extraReducers: builder => {
    builder
      .addCase(signInWithGoogle.pending, state => {
        state.loading = true
        state.error = null
      })
      .addCase(signInWithGoogle.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
      })
      .addCase(signOut.fulfilled, state => {
        state.user = null
        state.profile = null
        state.isAuthenticated = false
        state.loading = false
        state.initialized = true
      })
      .addCase(checkAuth.pending, state => {
        state.loading = true
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.profile = action.payload.profile
        state.isAuthenticated =
          !!action.payload.user && !!action.payload.profile
        state.initialized = true
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload as string
        state.isAuthenticated = false
        state.initialized = true
      })
  },
})

export const { clearError, updateProfile } = authSlice.actions
export default authSlice.reducer
