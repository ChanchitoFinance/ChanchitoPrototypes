import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { setTheme, loadPreferences } from '../lib/slices/themeSlice'
import { RootState } from '../lib/store'

export const useThemeInitializer = () => {
  const dispatch = useDispatch()
  const theme = useSelector((state: RootState) => state.theme.theme)
  const userEmail = useSelector((state: RootState) => state.auth.profile?.email)

  useEffect(() => {
    // Load preferences with user email prefix
    if (userEmail) {
      dispatch(loadPreferences({ userEmail }))
    } else {
      // If no user email, load default preferences
      dispatch(loadPreferences({}))
    }
  }, [dispatch, userEmail])

  useEffect(() => {
    // Apply theme to document
    if (theme === 'light') {
      document.documentElement.classList.remove('dark')
      document.documentElement.classList.add('light')

      // Apply light theme CSS variables
      document.documentElement.style.setProperty('--background', '#FFFFFF')
      document.documentElement.style.setProperty('--text-primary', '#000000')
      document.documentElement.style.setProperty('--text-secondary', '#666666')
      document.documentElement.style.setProperty('--border-color', '#E5E5E5')
      document.documentElement.style.setProperty('--gray-50', '#F5F5F5')
      document.documentElement.style.setProperty('--gray-100', '#FFFFFF')
      document.documentElement.style.setProperty('--gray-200', '#F0F0F0')
    } else {
      document.documentElement.classList.remove('light')
      document.documentElement.classList.add('dark')

      // Apply dark theme CSS variables
      document.documentElement.style.setProperty('--background', '#000000')
      document.documentElement.style.setProperty('--text-primary', '#FFFFFF')
      document.documentElement.style.setProperty('--text-secondary', '#A0A0A0')
      document.documentElement.style.setProperty('--border-color', '#1F1F1F')
      document.documentElement.style.setProperty('--gray-50', '#1A1A1A')
      document.documentElement.style.setProperty('--gray-100', '#1F1F1F')
      document.documentElement.style.setProperty('--gray-200', '#2A2A2A')
    }

    // Save theme preference to local storage
    localStorage.setItem('theme', theme)
  }, [theme])

  return theme
}
