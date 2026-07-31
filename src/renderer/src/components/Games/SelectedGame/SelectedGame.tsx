import { useCallback, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@renderer/store/hooks'
import './SelectedGame.scss'
import Button from '@renderer/components/Button/Button'
import useGameLibrary from '@renderer/util/useGameLibrary'
import { removeGame } from '@renderer/store/slices/games-slice'

const SelectedGame = () => {
  const dispatch = useAppDispatch()
  const selectedGame = useAppSelector((state) =>
    state.games.list.find((item) => item.id === state.games.selectedId)
  )
  const { downloadGame, playGame } = useGameLibrary()
  const [confirmingRemoveId, setConfirmingRemoveId] = useState<string | null>(null)
  const [isRemoving, setIsRemoving] = useState(false)

  const onRemove = useCallback(async () => {
    if (!selectedGame) return
    setIsRemoving(true)
    const result = await window.customGamesAPI.remove(selectedGame.id)
    setIsRemoving(false)
    if (result.success) {
      dispatch(removeGame(selectedGame.id))
    }
    setConfirmingRemoveId(null)
  }, [selectedGame, dispatch])

  if (!selectedGame) {
    return (
      <div className="selected-game__inner selected-game__inner--empty">
        <span>Select a game</span>
      </div>
    )
  }

  const { status, downloadProgress, error, installedVersion, latestVersion } = selectedGame
  const isConfirmingRemove = confirmingRemoveId === selectedGame.id

  const isPlayable = status === 'up-to-date'
  const isDownloading = status === 'downloading'
  const showInstallButton = status !== 'up-to-date' && status !== 'checking'
  const isUpdate = Boolean(installedVersion)
  const installLabel = isDownloading
    ? `${isUpdate ? 'Updating' : 'Downloading'}… ${downloadProgress ?? 0}%`
    : isUpdate
      ? 'Update'
      : 'Download'

  return (
    <div className="selected-game__inner">
      <div
        className="game-banner"
        style={
          selectedGame.coverUri ? { backgroundImage: `url(${selectedGame.coverUri})` } : undefined
        }
      />

      <div className="game-content">
        <div className="game-header">
          <div
            className="game-icon"
            style={
              selectedGame.iconUri ? { backgroundImage: `url(${selectedGame.iconUri})` } : undefined
            }
          />
          <h1 className="game-title">{selectedGame.name}</h1>
        </div>

        <div className="game-actions">
          <Button
            className="play-btn"
            text="Play"
            disabled={!isPlayable}
            title={
              status === 'update-available' ? 'Update the game before you can play' : undefined
            }
            onClick={() => playGame(selectedGame)}
          />
          {showInstallButton && (
            <Button
              className="download-btn"
              text={installLabel}
              disabled={isDownloading}
              onClick={() => downloadGame(selectedGame)}
            />
          )}
        </div>

        {isDownloading && (
          <div className="game-progress">
            <div className="game-progress__fill" style={{ width: `${downloadProgress ?? 0}%` }} />
          </div>
        )}

        <div className="game-meta">
          {status === 'checking' && <span className="game-status">Checking for updates…</span>}
          {installedVersion && <span className="game-version">Installed: {installedVersion}</span>}
          {latestVersion && status === 'update-available' && (
            <span className="game-version">Latest: {latestVersion}</span>
          )}
          {status === 'error' && error && <span className="game-error">{error}</span>}
        </div>

        {selectedGame.isCustom && (
          <div className="game-remove">
            {isConfirmingRemove ? (
              <>
                <span className="game-remove__prompt">Remove this game from your library?</span>
                <button
                  className="game-remove__confirm"
                  onClick={onRemove}
                  disabled={isRemoving}
                  type="button"
                >
                  {isRemoving ? 'Removing…' : 'Remove'}
                </button>
                <button
                  className="game-remove__cancel"
                  onClick={() => setConfirmingRemoveId(null)}
                  type="button"
                >
                  Cancel
                </button>
              </>
            ) : (
              <button
                className="game-remove__trigger"
                onClick={() => setConfirmingRemoveId(selectedGame.id)}
                type="button"
              >
                Remove from library
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default SelectedGame
