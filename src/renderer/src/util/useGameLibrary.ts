import { useCallback } from 'react'
import { useAppDispatch } from '@renderer/store/hooks'
import { Game, updateGame } from '@renderer/store/slices/games-slice'

// Centralizes the install/update/play flow so GameTile-level "auto-check on
// load" and SelectedGame's buttons stay in sync via the same Redux state.
const useGameLibrary = () => {
  const dispatch = useAppDispatch()

  const checkGame = useCallback(
    async (game: Game) => {
      const { id, repoOwner, repoName, assetPattern, executable } = game
      dispatch(updateGame({ id, changes: { status: 'checking', error: undefined } }))

      const status = await window.gameAPI.getStatus(id)
      dispatch(
        updateGame({
          id,
          changes: {
            installedVersion: status.installedVersion,
            status: status.installed ? 'up-to-date' : 'not-installed'
          }
        })
      )

      const check = await window.gameAPI.checkForUpdate({ id, repoOwner, repoName, assetPattern, executable })
      if (!check.ok || !check.result) {
        dispatch(
          updateGame({ id, changes: { status: 'error', error: check.error ?? 'Failed to check for updates' } })
        )
        return
      }

      dispatch(
        updateGame({
          id,
          changes: {
            latestVersion: check.result.latestVersion,
            installedVersion: check.result.installedVersion,
            status: !check.result.installed
              ? 'not-installed'
              : check.result.updateAvailable
                ? 'update-available'
                : 'up-to-date'
          }
        })
      )
    },
    [dispatch]
  )

  const downloadGame = useCallback(
    async (game: Game) => {
      const { id, repoOwner, repoName, assetPattern, executable } = game
      dispatch(updateGame({ id, changes: { status: 'downloading', downloadProgress: 0, error: undefined } }))

      const result = await window.gameAPI.download({ id, repoOwner, repoName, assetPattern, executable })
      if (result.success) {
        dispatch(
          updateGame({
            id,
            changes: {
              status: 'up-to-date',
              installedVersion: result.version,
              latestVersion: result.version,
              downloadProgress: undefined
            }
          })
        )
      } else {
        dispatch(
          updateGame({ id, changes: { status: 'error', error: result.error, downloadProgress: undefined } })
        )
      }
    },
    [dispatch]
  )

  const playGame = useCallback(
    async (game: Game) => {
      const result = await window.gameAPI.play(game.id)
      if (!result.success) {
        dispatch(updateGame({ id: game.id, changes: { status: 'error', error: result.error } }))
      }
    },
    [dispatch]
  )

  return { checkGame, downloadGame, playGame }
}

export default useGameLibrary
