import { useCallback, useEffect, useMemo, useState } from 'react'
import Modal from '@renderer/components/Modal/Modal'
import { useAppDispatch, useAppSelector } from '@renderer/store/hooks'
import { setThemePreference, ThemePreference } from '@renderer/store/slices/theme-slice'
import './Settings.scss'

const BASE_THEME_OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: 'burgundy', label: 'Burgundy' },
  { value: 'dark', label: 'Dark' },
  { value: 'light', label: 'Light' },
  { value: 'bubblegum', label: 'Bubblegum' },
  { value: 'midnight', label: 'Midnight' },
  { value: 'forest', label: 'Forest' },
  { value: 'sunset', label: 'Sunset' },
  { value: 'cyberpunk', label: 'Cyberpunk' }
]

const CHRISTMAS_OPTION: { value: ThemePreference; label: string } = {
  value: 'christmas',
  label: '🎄 Christmas'
}

const Settings = () => {
  const dispatch = useAppDispatch()
  const theme = useAppSelector((state) => state.theme.preference)
  const [isOpen, setIsOpen] = useState(false)
  const [installDir, setInstallDir] = useState('')
  const [christmasAvailable, setChristmasAvailable] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    window.settingsAPI.getInstallDir().then(setInstallDir)
    window.settingsAPI.getChristmasAvailable().then(setChristmasAvailable)
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

  const themeOptions = useMemo(
    () => (christmasAvailable ? [...BASE_THEME_OPTIONS, CHRISTMAS_OPTION] : BASE_THEME_OPTIONS),
    [christmasAvailable]
  )

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
            <span className="settings-row__label">Theme</span>
            <div className="settings-theme">
              {themeOptions.map((option) => (
                <button
                  key={option.value}
                  className={`settings-theme__option ${theme === option.value ? 'settings-theme__option--active' : ''}`}
                  onClick={() => dispatch(setThemePreference(option.value))}
                  type="button"
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

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
