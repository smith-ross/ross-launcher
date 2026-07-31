import './Topbar.scss'
import { useCallback, useEffect, useState } from 'react'
import { useAppSelector } from '@renderer/store/hooks'

type UpdateStatus =
  'idle' | 'checking' | 'up-to-date' | 'update-available' | 'downloading' | 'error'

const Topbar = () => {
  const isChristmas = useAppSelector((state) => state.theme.preference === 'christmas')
  const [version, setVersion] = useState('')
  const [status, setStatus] = useState<UpdateStatus>('idle')
  const [latestVersion, setLatestVersion] = useState('')
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')

  const checkForUpdate = useCallback(async () => {
    setStatus('checking')
    setError('')
    const check = await window.launcherAPI.checkForUpdate()
    if (!check.ok || !check.result) {
      setStatus('error')
      setError(check.error ?? 'Failed to check for updates')
      return
    }
    setLatestVersion(check.result.latestVersion)
    setStatus(check.result.updateAvailable ? 'update-available' : 'up-to-date')
  }, [])

  const installUpdate = useCallback(async () => {
    setStatus('downloading')
    setProgress(0)
    setError('')
    const result = await window.launcherAPI.installUpdate()
    if (!result.success) {
      setStatus('error')
      setError(result.error ?? 'Failed to install update')
    }
    // on success the app quits itself to hand off to the installer
  }, [])

  useEffect(() => {
    window.launcherAPI.getVersion().then(setVersion)
    checkForUpdate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const unsubscribe = window.launcherAPI.onDownloadProgress(setProgress)
    return unsubscribe
  }, [])

  const isBusy = status === 'checking' || status === 'downloading'
  const onUpdateClick = status === 'update-available' ? installUpdate : checkForUpdate

  const label =
    status === 'checking'
      ? 'Checking…'
      : status === 'downloading'
        ? `Updating… ${progress}%`
        : status === 'update-available'
          ? `Update to ${latestVersion}`
          : status === 'up-to-date'
            ? 'Up to date'
            : status === 'error'
              ? 'Error - Retry check'
              : 'Check for updates'

  return (
    <div className="topbar">
      <div className="topbar__drag">
        <span className="topbar__title">{isChristmas ? '🎄 Ross Launcher' : 'Ross Launcher'}</span>
        {version && <span className="topbar__version">v{version}</span>}
      </div>

      <div className="topbar__controls">
        <button
          className={`topbar__update ${status === 'update-available' ? 'topbar__update--available' : ''}`}
          onClick={onUpdateClick}
          disabled={isBusy}
          title={error || undefined}
          type="button"
        >
          {label}
        </button>
        <button
          className="topbar__btn topbar__btn--minimize"
          onClick={() => window.windowAPI.minimize()}
        >
          &#8211;
        </button>
        <button className="topbar__btn topbar__btn--close" onClick={() => window.windowAPI.close()}>
          &#10005;
        </button>
      </div>
    </div>
  )
}

export default Topbar
