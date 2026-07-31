/// <reference types="vite/client" />
export {}

interface GameConfig {
  id: string
  repoOwner: string
  repoName: string
  assetPattern?: string
  executable?: string
}

interface GameStatusResult {
  installed: boolean
  installedVersion?: string
}

interface GameCheckUpdateResult {
  ok: boolean
  result?: {
    installed: boolean
    installedVersion?: string
    latestVersion: string
    updateAvailable: boolean
  }
  error?: string
}

interface GameDownloadResult {
  success: boolean
  version?: string
  executablePath?: string
  error?: string
}

interface GamePlayResult {
  success: boolean
  error?: string
}

interface LauncherCheckUpdateResult {
  ok: boolean
  result?: {
    currentVersion: string
    latestVersion: string
    updateAvailable: boolean
  }
  error?: string
}

interface LauncherInstallResult {
  success: boolean
  error?: string
}

interface ChooseInstallDirResult {
  installDir?: string
  error?: string
}

interface CustomGameDefinition {
  id: string
  name: string
  iconUri: string
  coverUri?: string
  isCustom: true
}

interface PickFileResult {
  path?: string
}

interface PickImageResult {
  dataUri?: string
  error?: string
}

interface AddCustomGameInput {
  name: string
  executablePath: string
  iconUri: string
  coverUri?: string
}

interface AddCustomGameResult {
  success: boolean
  game?: CustomGameDefinition
  error?: string
}

interface UpdateCustomGameInput {
  name: string
  executablePath: string
  iconUri: string
  coverUri?: string
}

interface UpdateCustomGameResult {
  success: boolean
  game?: CustomGameDefinition
  error?: string
}

interface RemoveCustomGameResult {
  success: boolean
}

interface PruneOrphanedResult {
  removed: string[]
}

type ThemePreference =
  | 'burgundy'
  | 'dark'
  | 'light'
  | 'midnight'
  | 'forest'
  | 'sunset'
  | 'cyberpunk'
  | 'bubblegum'
  | 'christmas'

declare global {
  interface Window {
    windowAPI: {
      close: () => void
      minimize: () => void
    }
    launcherAPI: {
      getVersion: () => Promise<string>
      checkForUpdate: () => Promise<LauncherCheckUpdateResult>
      installUpdate: () => Promise<LauncherInstallResult>
      onDownloadProgress: (callback: (percent: number) => void) => () => void
    }
    settingsAPI: {
      getInstallDir: () => Promise<string>
      chooseInstallDir: () => Promise<ChooseInstallDirResult>
      getGameOrder: () => Promise<string[]>
      setGameOrder: (order: string[]) => Promise<void>
      getTheme: () => Promise<ThemePreference>
      setTheme: (theme: ThemePreference) => Promise<void>
      getChristmasAvailable: () => Promise<boolean>
    }
    customGamesAPI: {
      list: () => Promise<CustomGameDefinition[]>
      getExecutablePath: (id: string) => Promise<string | undefined>
      pickExecutable: () => Promise<PickFileResult>
      pickImage: () => Promise<PickImageResult>
      add: (input: AddCustomGameInput) => Promise<AddCustomGameResult>
      update: (id: string, input: UpdateCustomGameInput) => Promise<UpdateCustomGameResult>
      remove: (id: string) => Promise<RemoveCustomGameResult>
    }
    gameAPI: {
      getStatus: (id: string) => Promise<GameStatusResult>
      checkForUpdate: (config: GameConfig) => Promise<GameCheckUpdateResult>
      download: (config: GameConfig) => Promise<GameDownloadResult>
      play: (id: string) => Promise<GamePlayResult>
      pruneOrphaned: (validIds: string[]) => Promise<PruneOrphanedResult>
      onDownloadProgress: (callback: (data: { id: string; percent: number }) => void) => () => void
    }
  }
}
