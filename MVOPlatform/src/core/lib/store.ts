import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import ideasReducer from './slices/ideasSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    ideas: ideasReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
