import { createSlice, PayloadAction } from '@reduxjs/toolkit'

type ThemeState = {
  theme: 'dark' | 'light'
  language: 'en' | 'es'
}

const initialState: ThemeState = {
  theme: 'dark',
  language: 'en',
}

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    setTheme: (state, action: PayloadAction<'dark' | 'light'>) => {
      state.theme = action.payload
    },
    setLanguage: (state, action: PayloadAction<'en' | 'es'>) => {
      state.language = action.payload
    },
    toggleTheme: state => {
      state.theme = state.theme === 'dark' ? 'light' : 'dark'
    },
    loadPreferences: (state, action: PayloadAction<{ userEmail?: string }>) => {
      if (typeof window !== 'undefined') {
        const { userEmail } = action.payload
        const prefix = userEmail ? `${userEmail}_` : ''

        const savedTheme = localStorage.getItem(`${prefix}theme`) as
          | 'dark'
          | 'light'
          | null
        const savedLanguage = localStorage.getItem(`${prefix}language`) as
          | 'en'
          | 'es'
          | null

        if (savedTheme) {
          state.theme = savedTheme
        }

        if (savedLanguage) {
          state.language = savedLanguage
        }
      }
    },
    savePreferences: (state, action: PayloadAction<{ userEmail?: string }>) => {
      if (typeof window !== 'undefined') {
        const { userEmail } = action.payload
        const prefix = userEmail ? `${userEmail}_` : ''

        localStorage.setItem(`${prefix}theme`, state.theme)
        localStorage.setItem(`${prefix}language`, state.language)
      }
    },
  },
})

export const {
  setTheme,
  setLanguage,
  toggleTheme,
  loadPreferences,
  savePreferences,
} = themeSlice.actions

export default themeSlice.reducer
