import { app, dialog, BrowserWindow } from 'electron'
import fs from 'fs'
import path from 'path'

interface StoredSettings {
  installDir?: string
  gameOrder?: string[]
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
