import { useCallback, useState } from 'react'
import Modal from '@renderer/components/Modal/Modal'
import Button from '@renderer/components/Button/Button'
import { useAppDispatch } from '@renderer/store/hooks'
import { addGame } from '@renderer/store/slices/games-slice'
import './AddGame.scss'

const AddGame = () => {
  const dispatch = useAppDispatch()
  const [isOpen, setIsOpen] = useState(false)
  const [name, setName] = useState('')
  const [executablePath, setExecutablePath] = useState('')
  const [iconUri, setIconUri] = useState('')
  const [coverUri, setCoverUri] = useState('')
  const [error, setError] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const close = useCallback(() => {
    setIsOpen(false)
    setName('')
    setExecutablePath('')
    setIconUri('')
    setCoverUri('')
    setError('')
  }, [])

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

  const onSubmit = useCallback(async () => {
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
    const result = await window.customGamesAPI.add({
      name,
      executablePath,
      iconUri,
      coverUri: coverUri || undefined
    })
    setIsSaving(false)

    if (!result.success || !result.game) {
      setError(result.error ?? 'Failed to add game')
      return
    }

    dispatch(addGame({ ...result.game, status: 'up-to-date' }))
    close()
  }, [name, executablePath, iconUri, coverUri, dispatch, close])

  return (
    <>
      <button
        className="add-game-trigger"
        onClick={() => setIsOpen(true)}
        title="Add a game"
        type="button"
      >
        &#43;
      </button>

      {isOpen && (
        <Modal title="Add a game" onClose={close}>
          <div className="add-game-form">
            <label className="add-game-field">
              <span className="add-game-field__label">Name</span>
              <input
                className="add-game-field__input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Game"
                type="text"
              />
            </label>

            <div className="add-game-field">
              <span className="add-game-field__label">Executable or shortcut</span>
              <div className="add-game-field__row">
                <span className="add-game-field__path" title={executablePath}>
                  {executablePath || 'No file chosen'}
                </span>
                <button className="add-game-field__browse" onClick={onPickExecutable} type="button">
                  Browse…
                </button>
              </div>
              <span className="add-game-field__hint">
                Pick a .exe, or a Steam/Internet shortcut (.url) to launch through Steam.
              </span>
            </div>

            <div className="add-game-field">
              <span className="add-game-field__label">Icon</span>
              <div className="add-game-field__row">
                <div
                  className="add-game-field__preview"
                  style={iconUri ? { backgroundImage: `url(${iconUri})` } : undefined}
                />
                <button className="add-game-field__browse" onClick={onPickIcon} type="button">
                  Browse…
                </button>
              </div>
            </div>

            <div className="add-game-field">
              <span className="add-game-field__label">Cover</span>
              <div className="add-game-field__row">
                <div
                  className="add-game-field__preview add-game-field__preview--wide"
                  style={coverUri ? { backgroundImage: `url(${coverUri})` } : undefined}
                />
                <button className="add-game-field__browse" onClick={onPickCover} type="button">
                  Browse…
                </button>
              </div>
            </div>

            {error && <span className="add-game-error">{error}</span>}

            <Button
              className="add-game-submit"
              text={isSaving ? 'Adding…' : 'Add game'}
              disabled={isSaving}
              onClick={onSubmit}
            />
          </div>
        </Modal>
      )}
    </>
  )
}

export default AddGame
