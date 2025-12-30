import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import ideasReducer from './slices/ideasSlice'
import notificationsReducer from './slices/notificationsSlice'
import themeReducer from './slices/themeSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ideas: ideasReducer,
    notifications: notificationsReducer,
    theme: themeReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
