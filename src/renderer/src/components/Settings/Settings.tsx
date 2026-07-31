import { useCallback, useEffect, useState } from 'react'
import Modal from '@renderer/components/Modal/Modal'
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
        <Modal title="Settings" onClose={() => setIsOpen(false)}>
          <div className="settings-row">
            <span className="settings-row__label">Install location</span>
            <span className="settings-row__value" title={installDir}>
              {installDir}
            </span>
            <button className="settings-row__change" onClick={onChangeLocation} type="button">
              Change…
            </button>
          </div>

          <p className="settings-hint">
            Applies to new downloads and updates. Games already installed stay where they are.
          </p>

          {error && <span className="settings-error">{error}</span>}
        </Modal>
      )}
    </>
  )
}

export default Settings
