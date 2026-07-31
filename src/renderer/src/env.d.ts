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
    }
    gameAPI: {
      getStatus: (id: string) => Promise<GameStatusResult>
      checkForUpdate: (config: GameConfig) => Promise<GameCheckUpdateResult>
      download: (config: GameConfig) => Promise<GameDownloadResult>
      play: (id: string) => Promise<GamePlayResult>
      onDownloadProgress: (callback: (data: { id: string; percent: number }) => void) => () => void
    }
  }
}
