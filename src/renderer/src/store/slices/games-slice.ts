import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import gameDefinitions from '@renderer/games.json'

export type GameStatus =
  'checking' | 'not-installed' | 'update-available' | 'up-to-date' | 'downloading' | 'error'

export interface GameDefinition {
  id: string
  name: string
  iconUri: string
  coverUri?: string
  repoOwner?: string
  repoName?: string
  assetPattern?: string
  /** Relative path (inside the extracted install) to the game's executable, if known. */
  executable?: string
  isCustom?: boolean
}

export interface Game extends GameDefinition {
  isPlaying?: boolean
  status: GameStatus
  installedVersion?: string
  latestVersion?: string
  downloadProgress?: number
  error?: string
}

export interface GamesState {
  list: Game[]
  selectedId: string | null
}

const initialState: GamesState = {
  list: (gameDefinitions as GameDefinition[]).map((game) => ({ ...game, status: 'checking' })),
  selectedId: null
}

const gamesSlice = createSlice({
  name: 'games',
  initialState,
  reducers: {
    setGames: (state, action: PayloadAction<Game[]>) => {
      state.list = action.payload
    },
    addGame: (state, action: PayloadAction<Game>) => {
      state.list.push(action.payload)
    },
    addGames: (state, action: PayloadAction<Game[]>) => {
      state.list.push(...action.payload)
    },
    setPlaying: (state, action: PayloadAction<{ id: string; isPlaying: boolean }>) => {
      const game = state.list.find((g) => g.id === action.payload.id)
      if (game) game.isPlaying = action.payload.isPlaying
    },
    selectGame: (state, action: PayloadAction<string>) => {
      state.selectedId = action.payload
    },
    updateGame: (state, action: PayloadAction<{ id: string; changes: Partial<Game> }>) => {
      const game = state.list.find((g) => g.id === action.payload.id)
      if (game) Object.assign(game, action.payload.changes)
    },
    removeGame: (state, action: PayloadAction<string>) => {
      state.list = state.list.filter((g) => g.id !== action.payload)
      if (state.selectedId === action.payload) state.selectedId = null
    },
    reorderGames: (state, action: PayloadAction<string[]>) => {
      const byId = new Map(state.list.map((g) => [g.id, g]))
      const ordered: typeof state.list = []
      for (const id of action.payload) {
        const game = byId.get(id)
        if (game) {
          ordered.push(game)
          byId.delete(id)
        }
      }
      ordered.push(...byId.values())
      state.list = ordered
    }
  }
})

export const {
  setGames,
  addGame,
  addGames,
  setPlaying,
  selectGame,
  updateGame,
  removeGame,
  reorderGames
} = gamesSlice.actions
export default gamesSlice.reducer
