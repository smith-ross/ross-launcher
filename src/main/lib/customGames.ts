import { app, dialog, BrowserWindow } from 'electron'
import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import { writeManifestEntry, removeManifestEntry } from './manifest'

export interface CustomGameDefinition {
  id: string
  name: string
  iconUri: string
  coverUri?: string
  isCustom: true
}

function storePath(): string {
  return path.join(app.getPath('userData'), 'custom-games.json')
}

function readStore(): CustomGameDefinition[] {
  try {
    const raw = fs.readFileSync(storePath(), 'utf-8')
    return JSON.parse(raw) as CustomGameDefinition[]
  } catch {
    return []
  }
}

function writeStore(games: CustomGameDefinition[]): void {
  fs.mkdirSync(path.dirname(storePath()), { recursive: true })
  fs.writeFileSync(storePath(), JSON.stringify(games, null, 2))
}

export function listCustomGames(): CustomGameDefinition[] {
  return readStore()
}

export interface PickFileResult {
  path?: string
}

// Accepts a real .exe, or a shortcut (.url — e.g. a Steam "Internet
// Shortcut" pointing at steam://rungameid/X — or a native .lnk) that Play
// hands off to the OS shell to resolve, so games launched through Steam (or
// any other protocol-handled launcher) work too.
export async function pickExecutable(win: BrowserWindow): Promise<PickFileResult> {
  const result = await dialog.showOpenDialog(win, {
    title: 'Choose the game executable or shortcut',
    filters: [
      { name: 'Executable or shortcut', extensions: ['exe', 'url', 'lnk'] },
      { name: 'Executable', extensions: ['exe'] },
      { name: 'Internet Shortcut', extensions: ['url'] },
      { name: 'Shortcut', extensions: ['lnk'] }
    ],
    properties: ['openFile']
  })
  if (result.canceled || result.filePaths.length === 0) return {}
  return { path: result.filePaths[0] }
}

const IMAGE_MIME_TYPES: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.bmp': 'image/bmp',
  '.ico': 'image/x-icon'
}

export interface PickImageResult {
  dataUri?: string
  error?: string
}

export async function pickImage(win: BrowserWindow): Promise<PickImageResult> {
  const result = await dialog.showOpenDialog(win, {
    title: 'Choose an image',
    filters: [
      { name: 'Images', extensions: Object.keys(IMAGE_MIME_TYPES).map((ext) => ext.slice(1)) }
    ],
    properties: ['openFile']
  })
  if (result.canceled || result.filePaths.length === 0) return {}

  const filePath = result.filePaths[0]
  const mime = IMAGE_MIME_TYPES[path.extname(filePath).toLowerCase()]
  if (!mime) return { error: 'Unsupported image type' }

  try {
    const buffer = fs.readFileSync(filePath)
    return { dataUri: `data:${mime};base64,${buffer.toString('base64')}` }
  } catch (err) {
    return { error: err instanceof Error ? err.message : String(err) }
  }
}

export interface AddCustomGameInput {
  name: string
  executablePath: string
  iconUri: string
  coverUri?: string
}

export interface AddCustomGameResult {
  success: boolean
  game?: CustomGameDefinition
  error?: string
}

export function addCustomGame(input: AddCustomGameInput): AddCustomGameResult {
  const name = input.name.trim()
  if (!name) return { success: false, error: 'Name is required' }
  if (!input.executablePath || !fs.existsSync(input.executablePath)) {
    return { success: false, error: 'Choose a valid executable or shortcut' }
  }

  const id = `custom-${crypto.randomUUID()}`

  // Custom games skip the whole download/version flow — just point Play
  // straight at the chosen executable via the same manifest presets use.
  writeManifestEntry(id, {
    version: 'local',
    executablePath: input.executablePath,
    assetName: path.basename(input.executablePath)
  })

  const game: CustomGameDefinition = {
    id,
    name,
    iconUri: input.iconUri,
    coverUri: input.coverUri,
    isCustom: true
  }

  const store = readStore()
  store.push(game)
  writeStore(store)

  return { success: true, game }
}

export interface RemoveCustomGameResult {
  success: boolean
}

export function removeCustomGame(id: string): RemoveCustomGameResult {
  const store = readStore()
  const next = store.filter((game) => game.id !== id)
  if (next.length === store.length) return { success: false }

  writeStore(next)
  removeManifestEntry(id)
  return { success: true }
}
