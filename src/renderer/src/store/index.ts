import { configureStore } from '@reduxjs/toolkit'
import gamesReducer from './slices/games-slice'
import themeReducer from './slices/theme-slice'

export const store = configureStore({
  reducer: {
    games: gamesReducer,
    theme: themeReducer
  }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
