import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import { checkForUpdate, downloadGame, playGame, getStatus, GameConfig } from './lib/gameManager'
import { checkForLauncherUpdate, downloadAndInstallLauncherUpdate } from './lib/selfUpdater'
import { getInstallDir, chooseInstallDir } from './lib/settings'

let win: BrowserWindow

function createWindow() {
  win = new BrowserWindow({
    width: 1100,
    height: 700,
    title: 'Ross Launcher',
    frame: false, // removes native title bar/border
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  if (process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    win.loadFile(path.join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(createWindow)
app.on('window-all-closed', () => app.quit())

// Window control handlers
ipcMain.on('window-close', () => win.close())
ipcMain.on('window-minimize', () => win.minimize())

// Game install/update/launch handlers — see src/main/lib/gameManager.ts
ipcMain.handle('games:get-status', (_event, id: string) => getStatus(id))

ipcMain.handle('games:check-update', async (_event, config: GameConfig) => {
  try {
    return { ok: true as const, result: await checkForUpdate(config) }
  } catch (err) {
    return { ok: false as const, error: err instanceof Error ? err.message : String(err) }
  }
})

ipcMain.handle('games:download', async (event, config: GameConfig) => {
  return downloadGame(config, (percent) => {
    event.sender.send('games:download-progress', { id: config.id, percent })
  })
})

ipcMain.handle('games:play', (_event, id: string) => playGame(id))

// Launcher self-update handlers — see src/main/lib/selfUpdater.ts
ipcMain.handle('launcher:get-version', () => app.getVersion())

ipcMain.handle('launcher:check-update', async () => {
  try {
    return { ok: true as const, result: await checkForLauncherUpdate() }
  } catch (err) {
    return { ok: false as const, error: err instanceof Error ? err.message : String(err) }
  }
})

ipcMain.handle('launcher:install-update', async (event) => {
  return downloadAndInstallLauncherUpdate((percent) => {
    event.sender.send('launcher:download-progress', percent)
  })
})

// Settings handlers — see src/main/lib/settings.ts
ipcMain.handle('settings:get-install-dir', () => getInstallDir())
ipcMain.handle('settings:choose-install-dir', () => chooseInstallDir(win))
