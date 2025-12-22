import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import { ideasApi } from './api/ideasApi'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [ideasApi.reducerPath]: ideasApi.reducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware().concat(ideasApi.middleware),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
