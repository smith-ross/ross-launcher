import { shell } from 'electron'
import fs from 'fs'
import path from 'path'
import { spawn } from 'child_process'
import AdmZip from 'adm-zip'
import { fetchLatestRelease, pickAsset, downloadAsset, compareVersions } from './github'
import { getManifestEntry, writeManifestEntry, removeManifestEntry, readManifest } from './manifest'
import { getInstallDir } from './settings'

export interface GameConfig {
  id: string
  repoOwner: string
  repoName: string
  assetPattern?: string
  executable?: string
}

export interface StatusResult {
  installed: boolean
  installedVersion?: string
}

export interface CheckUpdateResult {
  installed: boolean
  installedVersion?: string
  latestVersion: string
  updateAvailable: boolean
}

export interface DownloadResult {
  success: boolean
  version?: string
  executablePath?: string
  error?: string
}

export interface PlayResult {
  success: boolean
  error?: string
}

function gamesDir(): string {
  return getInstallDir()
}

function installDirFor(id: string): string {
  return path.join(gamesDir(), id)
}

export function getStatus(id: string): StatusResult {
  const entry = getManifestEntry(id)
  return entry ? { installed: true, installedVersion: entry.version } : { installed: false }
}

export async function checkForUpdate(config: GameConfig): Promise<CheckUpdateResult> {
  if (!config.repoOwner || !config.repoName) {
    throw new Error('No repository configured for this game')
  }

  const release = await fetchLatestRelease(config.repoOwner, config.repoName)
  const entry = getManifestEntry(config.id)
  const updateAvailable = !entry || compareVersions(release.tagName, entry.version) > 0

  return {
    installed: !!entry,
    installedVersion: entry?.version,
    latestVersion: release.tagName,
    updateAvailable
  }
}

// Walks the install dir looking for a runnable executable, skipping obvious
// uninstallers. Used when a zip release doesn't tell us exactly where the
// game binary lives.
function findExecutable(dir: string, preferredName?: string): string | undefined {
  if (preferredName) {
    const direct = path.join(dir, preferredName)
    if (fs.existsSync(direct)) return direct
  }

  const queue: string[] = [dir]
  while (queue.length > 0) {
    const current = queue.shift() as string
    const entries = fs.readdirSync(current, { withFileTypes: true })
    for (const entry of entries) {
      const full = path.join(current, entry.name)
      if (entry.isDirectory()) {
        queue.push(full)
      } else if (
        entry.name.toLowerCase().endsWith('.exe') &&
        !entry.name.toLowerCase().includes('uninstall')
      ) {
        return full
      }
    }
  }
  return undefined
}

export async function downloadGame(
  config: GameConfig,
  onProgress: (percent: number) => void
): Promise<DownloadResult> {
  if (!config.repoOwner || !config.repoName) {
    return { success: false, error: 'No repository configured for this game' }
  }

  try {
    const release = await fetchLatestRelease(config.repoOwner, config.repoName)
    const asset = pickAsset(release.assets, config.assetPattern)
    if (!asset) {
      return { success: false, error: 'The latest release has no downloadable assets' }
    }

    const installDir = installDirFor(config.id)
    fs.rmSync(installDir, { recursive: true, force: true })
    fs.mkdirSync(installDir, { recursive: true })

    const downloadsDir = path.join(gamesDir(), '.downloads')
    fs.mkdirSync(downloadsDir, { recursive: true })
    const tempPath = path.join(downloadsDir, `${config.id}-${asset.name}`)

    await downloadAsset(asset.browserDownloadUrl, tempPath, onProgress)

    let executablePath: string | undefined
    if (asset.name.toLowerCase().endsWith('.zip')) {
      const zip = new AdmZip(tempPath)
      zip.extractAllTo(installDir, true)
      fs.rmSync(tempPath, { force: true })
      executablePath = findExecutable(installDir, config.executable)
    } else {
      const destExe = path.join(installDir, asset.name)
      fs.renameSync(tempPath, destExe)
      executablePath = destExe
    }

    if (!executablePath) {
      return { success: false, error: 'Could not locate a game executable after installing' }
    }

    writeManifestEntry(config.id, {
      version: release.tagName,
      executablePath,
      assetName: asset.name
    })

    onProgress(100)
    return { success: true, version: release.tagName, executablePath }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) }
  }
}

export interface PruneResult {
  removed: string[]
}

export function pruneOrphanedInstalls(validIds: string[]): PruneResult {
  const manifest = readManifest()
  const validSet = new Set(validIds)
  const removed: string[] = []

  for (const id of Object.keys(manifest)) {
    if (validSet.has(id)) continue

    try {
      fs.rmSync(installDirFor(id), { recursive: true, force: true })
    } catch {
      // best-effort, still drop the manifest entry even if the folder is already gone or locked
    }
    removeManifestEntry(id)
    removed.push(id)
  }

  return { removed }
}

const SHELL_OPEN_EXTENSIONS = new Set(['.url', '.lnk'])

export async function playGame(id: string): Promise<PlayResult> {
  const entry = getManifestEntry(id)
  if (!entry) return { success: false, error: 'Game is not installed' }
  if (!fs.existsSync(entry.executablePath)) {
    return { success: false, error: 'Installed executable could not be found' }
  }

  if (SHELL_OPEN_EXTENSIONS.has(path.extname(entry.executablePath).toLowerCase())) {
    const error = await shell.openPath(entry.executablePath)
    return error ? { success: false, error } : { success: true }
  }

  try {
    const child = spawn(entry.executablePath, [], {
      cwd: path.dirname(entry.executablePath),
      detached: true,
      stdio: 'ignore'
    })
    child.unref()
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) }
  }
}
