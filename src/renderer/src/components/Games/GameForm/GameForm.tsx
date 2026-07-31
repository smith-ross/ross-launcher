import { useCallback, useState } from 'react'
import Button from '@renderer/components/Button/Button'
import './GameForm.scss'

export interface GameFormValues {
  name: string
  executablePath: string
  iconUri: string
  coverUri: string
}

export interface GameFormSubmitResult {
  success: boolean
  error?: string
}

interface GameFormProps {
  initialValues?: Partial<GameFormValues>
  submitLabel: string
  savingLabel: string
  onSubmit: (values: GameFormValues) => Promise<GameFormSubmitResult>
  onSuccess: () => void
}

const GameForm = ({ initialValues, submitLabel, savingLabel, onSubmit, onSuccess }: GameFormProps) => {
  const [name, setName] = useState(initialValues?.name ?? '')
  const [executablePath, setExecutablePath] = useState(initialValues?.executablePath ?? '')
  const [iconUri, setIconUri] = useState(initialValues?.iconUri ?? '')
  const [coverUri, setCoverUri] = useState(initialValues?.coverUri ?? '')
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const onPickExecutable = useCallback(async () => {
    const result = await window.customGamesAPI.pickExecutable()
    if (result.path) setExecutablePath(result.path)
  }, [])

  const onPickIcon = useCallback(async () => {
    const result = await window.customGamesAPI.pickImage()
    if (result.dataUri) setIconUri(result.dataUri)
    else if (result.error) setError(result.error)
  }, [])

  const onPickCover = useCallback(async () => {
    const result = await window.customGamesAPI.pickImage()
    if (result.dataUri) setCoverUri(result.dataUri)
    else if (result.error) setError(result.error)
  }, [])

  const onFormSubmit = useCallback(async () => {
    setError('')
    if (!name.trim()) {
      setError('Give the game a name')
      return
    }
    if (!executablePath) {
      setError('Choose the game executable or shortcut')
      return
    }

    setIsSaving(true)
    const result = await onSubmit({ name, executablePath, iconUri, coverUri })
    setIsSaving(false)

    if (!result.success) {
      setError(result.error ?? 'Something went wrong')
      return
    }

    onSuccess()
  }, [name, executablePath, iconUri, coverUri, onSubmit, onSuccess])

  return (
    <div className="game-form">
      <label className="game-form-field">
        <span className="game-form-field__label">Name</span>
        <input
          className="game-form-field__input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="My Game"
          type="text"
        />
      </label>

      <div className="game-form-field">
        <span className="game-form-field__label">Executable or shortcut</span>
        <div className="game-form-field__row">
          <span className="game-form-field__path" title={executablePath}>
            {executablePath || 'No file chosen'}
          </span>
          <button className="game-form-field__browse" onClick={onPickExecutable} type="button">
            Browse…
          </button>
        </div>
        <span className="game-form-field__hint">
          Pick a .exe, or a Steam/Internet shortcut (.url) to launch through Steam.
        </span>
      </div>

      <div className="game-form-field">
        <span className="game-form-field__label">Icon</span>
        <div className="game-form-field__row">
          <div
            className="game-form-field__preview"
            style={iconUri ? { backgroundImage: `url(${iconUri})` } : undefined}
          />
          <button className="game-form-field__browse" onClick={onPickIcon} type="button">
            Browse…
          </button>
        </div>
      </div>

      <div className="game-form-field">
        <span className="game-form-field__label">Cover</span>
        <div className="game-form-field__row">
          <div
            className="game-form-field__preview game-form-field__preview--wide"
            style={coverUri ? { backgroundImage: `url(${coverUri})` } : undefined}
          />
          <button className="game-form-field__browse" onClick={onPickCover} type="button">
            Browse…
          </button>
        </div>
      </div>

      {error && <span className="game-form-error">{error}</span>}

      <Button
        className="game-form-submit"
        text={isSaving ? savingLabel : submitLabel}
        disabled={isSaving}
        onClick={onFormSubmit}
      />
    </div>
  )
}

export default GameForm
