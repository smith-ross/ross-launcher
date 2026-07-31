import { app } from 'electron'
import fs from 'fs'
import path from 'path'
import { spawn } from 'child_process'
import { fetchLatestRelease, pickAsset, downloadAsset, compareVersions } from './github'

const LAUNCHER_REPO_OWNER = 'smith-ross'
const LAUNCHER_REPO_NAME = 'ross-launcher'

export interface LauncherUpdateCheck {
  currentVersion: string
  latestVersion: string
  updateAvailable: boolean
}

export interface LauncherUpdateResult {
  success: boolean
  error?: string
}

export async function checkForLauncherUpdate(): Promise<LauncherUpdateCheck> {
  const release = await fetchLatestRelease(LAUNCHER_REPO_OWNER, LAUNCHER_REPO_NAME)
  const currentVersion = app.getVersion()
  return {
    currentVersion,
    latestVersion: release.tagName,
    updateAvailable: compareVersions(release.tagName, currentVersion) > 0
  }
}

// Downloads the installer from the latest release, launches it, then quits
// so the installer can overwrite the running app. The installer itself
// relaunches the app once it's done.
export async function downloadAndInstallLauncherUpdate(
  onProgress: (percent: number) => void
): Promise<LauncherUpdateResult> {
  try {
    const release = await fetchLatestRelease(LAUNCHER_REPO_OWNER, LAUNCHER_REPO_NAME)
    const asset = pickAsset(release.assets)
    if (!asset) {
      return { success: false, error: 'The latest release has no installer asset' }
    }

    const downloadDir = path.join(app.getPath('temp'), 'ross-launcher-update')
    fs.mkdirSync(downloadDir, { recursive: true })
    const installerPath = path.join(downloadDir, asset.name)

    await downloadAsset(asset.browserDownloadUrl, installerPath, onProgress)
    onProgress(100)

    const installer = spawn(installerPath, [], { detached: true, stdio: 'ignore' })
    installer.unref()

    setTimeout(() => app.quit(), 500)
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : String(err) }
  }
}
