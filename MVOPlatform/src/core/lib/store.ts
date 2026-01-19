import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import ideasReducer from './slices/ideasSlice'
import notificationsReducer from './slices/notificationsSlice'
import themeReducer from './slices/themeSlice'
import creditsReducer from './slices/creditsSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ideas: ideasReducer,
    notifications: notificationsReducer,
    theme: themeReducer,
    credits: creditsReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
