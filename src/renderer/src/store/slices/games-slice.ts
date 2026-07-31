import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import gameDefinitions from '@renderer/games.json'

export type GameStatus =
  | 'checking'
  | 'not-installed'
  | 'update-available'
  | 'up-to-date'
  | 'downloading'
  | 'error'

// The static, per-game config read from games.json. Fill in repoOwner/
// repoName with the real GitHub repo for each game to enable update checks,
// downloads, and Play.
export interface GameDefinition {
  id: string
  name: string
  iconUri: string
  coverUri?: string
  /** GitHub owner/repo hosting this game's releases, e.g. "ross-smith" / "my-game". */
  repoOwner: string
  repoName: string
  /** Substring used to pick the right release asset when a release has more than one. */
  assetPattern?: string
  /** Relative path (inside the extracted install) to the game's executable, if known. */
  executable?: string
}

// Adds the runtime-only fields tracked while the app is running.
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
    }
  }
})

export const { setGames, addGame, setPlaying, selectGame, updateGame } = gamesSlice.actions
export default gamesSlice.reducer
