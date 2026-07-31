import { app, dialog, BrowserWindow } from 'electron'
import fs from 'fs'
import path from 'path'
import { CHRISTMAS_THEME_ENABLED } from './featureFlags'

export type ThemePreference =
  | 'burgundy'
  | 'dark'
  | 'light'
  | 'midnight'
  | 'forest'
  | 'sunset'
  | 'cyberpunk'
  | 'bubblegum'
  | 'christmas'

interface StoredSettings {
  installDir?: string
  gameOrder?: string[]
  theme?: ThemePreference
}

function settingsPath(): string {
  return path.join(app.getPath('userData'), 'settings.json')
}

function readSettings(): StoredSettings {
  try {
    const raw = fs.readFileSync(settingsPath(), 'utf-8')
    return JSON.parse(raw) as StoredSettings
  } catch {
    return {}
  }
}

function writeSettings(settings: StoredSettings): void {
  fs.mkdirSync(path.dirname(settingsPath()), { recursive: true })
  fs.writeFileSync(settingsPath(), JSON.stringify(settings, null, 2))
}

export function defaultInstallDir(): string {
  return path.join(app.getPath('userData'), 'games')
}

export function getInstallDir(): string {
  return readSettings().installDir || defaultInstallDir()
}

export interface ChooseInstallDirResult {
  installDir?: string
  error?: string
}

// Only affects where future downloads/updates land — games already
// installed under the old location are left in place and keep working,
// since their manifest entries store an absolute executable path.
export async function chooseInstallDir(win: BrowserWindow): Promise<ChooseInstallDirResult> {
  const result = await dialog.showOpenDialog(win, {
    title: 'Choose where games are installed',
    defaultPath: getInstallDir(),
    properties: ['openDirectory', 'createDirectory']
  })

  if (result.canceled || result.filePaths.length === 0) {
    return {}
  }

  const chosen = result.filePaths[0]
  try {
    fs.mkdirSync(chosen, { recursive: true })
    fs.accessSync(chosen, fs.constants.W_OK)
  } catch (err) {
    return {
      error: `That folder isn't writable: ${err instanceof Error ? err.message : String(err)}`
    }
  }

  writeSettings({ ...readSettings(), installDir: chosen })
  return { installDir: chosen }
}

export function getGameOrder(): string[] {
  return readSettings().gameOrder ?? []
}

export function setGameOrder(order: string[]): void {
  writeSettings({ ...readSettings(), gameOrder: order })
}

// Enforced here, at the read, rather than only where the theme gets set —
// so the invariant holds no matter how a persisted "christmas" ended up on
// disk (e.g. a build from a season where it was enabled).
export function getTheme(): ThemePreference {
  const theme = readSettings().theme ?? 'burgundy'
  if (theme === 'christmas' && !CHRISTMAS_THEME_ENABLED) {
    return 'burgundy'
  }
  return theme
}

export function setTheme(theme: ThemePreference): void {
  writeSettings({ ...readSettings(), theme })
}

export function getChristmasAvailable(): boolean {
  return CHRISTMAS_THEME_ENABLED
}
