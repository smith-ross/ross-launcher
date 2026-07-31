import { useCallback, useEffect, useState } from 'react'
import './Settings.scss'

const Settings = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [installDir, setInstallDir] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    window.settingsAPI.getInstallDir().then(setInstallDir)
  }, [])

  const onChangeLocation = useCallback(async () => {
    setError('')
    const result = await window.settingsAPI.chooseInstallDir()
    if (result.error) {
      setError(result.error)
      return
    }
    if (result.installDir) {
      setInstallDir(result.installDir)
    }
  }, [])

  return (
    <>
      <button
        className="settings-trigger"
        onClick={() => setIsOpen(true)}
        title="Settings"
        type="button"
      >
        &#9881; Settings
      </button>

      {isOpen && (
        <div className="settings-overlay" onClick={() => setIsOpen(false)}>
          <div className="settings-modal" onClick={(e) => e.stopPropagation()}>
            <div className="settings-modal__header">
              <span className="settings-modal__title">Settings</span>
              <button
                className="settings-modal__close"
                onClick={() => setIsOpen(false)}
                title="Close"
                type="button"
              >
                &#10005;
              </button>
            </div>

            <div className="settings-modal__row">
              <span className="settings-modal__label">Install location</span>
              <span className="settings-modal__value" title={installDir}>
                {installDir}
              </span>
              <button className="settings-modal__change" onClick={onChangeLocation} type="button">
                Change…
              </button>
            </div>

            {error && <span className="settings-modal__error">{error}</span>}
          </div>
        </div>
      )}
    </>
  )
}

export default Settings
