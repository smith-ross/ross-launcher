import { contextBridge, ipcRenderer } from 'electron'

export interface GameConfig {
  id: string
  repoOwner: string
  repoName: string
  assetPattern?: string
  executable?: string
}

contextBridge.exposeInMainWorld('windowAPI', {
  close: () => ipcRenderer.send('window-close'),
  minimize: () => ipcRenderer.send('window-minimize')
})

contextBridge.exposeInMainWorld('launcherAPI', {
  getVersion: () => ipcRenderer.invoke('launcher:get-version'),
  checkForUpdate: () => ipcRenderer.invoke('launcher:check-update'),
  installUpdate: () => ipcRenderer.invoke('launcher:install-update'),
  onDownloadProgress: (callback: (percent: number) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, percent: number) => callback(percent)
    ipcRenderer.on('launcher:download-progress', listener)
    return () => ipcRenderer.removeListener('launcher:download-progress', listener)
  }
})

contextBridge.exposeInMainWorld('gameAPI', {
  getStatus: (id: string) => ipcRenderer.invoke('games:get-status', id),
  checkForUpdate: (config: GameConfig) => ipcRenderer.invoke('games:check-update', config),
  download: (config: GameConfig) => ipcRenderer.invoke('games:download', config),
  play: (id: string) => ipcRenderer.invoke('games:play', id),
  onDownloadProgress: (callback: (data: { id: string; percent: number }) => void) => {
    const listener = (_event: Electron.IpcRendererEvent, data: { id: string; percent: number }) =>
      callback(data)
    ipcRenderer.on('games:download-progress', listener)
    return () => ipcRenderer.removeListener('games:download-progress', listener)
  }
})
