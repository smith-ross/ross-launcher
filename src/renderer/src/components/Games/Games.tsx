import './Games.scss'
import GameTile from './GameTile/GameTile'
import { useAppDispatch, useAppSelector } from '@renderer/store/hooks'
import SelectedGame from './SelectedGame/SelectedGame'
import { useCallback, useEffect, useState } from 'react'
import { addGames, Game, reorderGames, updateGame } from '@renderer/store/slices/games-slice'
import useGameLibrary from '@renderer/util/useGameLibrary'
import Settings from '@renderer/components/Settings/Settings'
import AddGame from './AddGame/AddGame'
import presetDefinitions from '@renderer/games.json'

const Games = () => {
  const dispatch = useAppDispatch()
  const gamesList = useAppSelector((state) => state.games.list)
  const gameOrderKey = useAppSelector((state) => state.games.list.map((g) => g.id).join('|'))
  const { checkGame } = useGameLibrary()
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)
  const [isOrderReady, setIsOrderReady] = useState(false)

  useEffect(() => {
    gamesList.forEach((game) => checkGame(game))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    Promise.all([window.customGamesAPI.list(), window.settingsAPI.getGameOrder()]).then(
      ([customGames, order]) => {
        if (customGames.length > 0) {
          const games: Game[] = customGames.map((game) => ({ ...game, status: 'checking' }))
          dispatch(addGames(games))
          games.forEach((game) => checkGame(game))
        }
        if (order.length > 0) {
          dispatch(reorderGames(order))
        }
        setIsOrderReady(true)

        const validIds = [
          ...(presetDefinitions as { id: string }[]).map((g) => g.id),
          ...customGames.map((g) => g.id)
        ]
        window.gameAPI.pruneOrphaned(validIds)
      }
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!isOrderReady || !gameOrderKey) return
    window.settingsAPI.setGameOrder(gameOrderKey.split('|'))
  }, [isOrderReady, gameOrderKey])

  useEffect(() => {
    const unsubscribe = window.gameAPI.onDownloadProgress(({ id, percent }) => {
      dispatch(updateGame({ id, changes: { downloadProgress: percent } }))
    })
    return unsubscribe
  }, [dispatch])

  const clearDrag = useCallback(() => {
    setDraggedId(null)
    setDragOverId(null)
  }, [])

  const onDropOn = useCallback(
    (targetId: string) => {
      if (draggedId && draggedId !== targetId) {
        const ids = gamesList.map((g) => g.id)
        const fromIndex = ids.indexOf(draggedId)
        const toIndex = ids.indexOf(targetId)
        if (fromIndex !== -1 && toIndex !== -1) {
          ids.splice(fromIndex, 1)
          ids.splice(toIndex, 0, draggedId)
          dispatch(reorderGames(ids))
        }
      }
      clearDrag()
    },
    [draggedId, gamesList, dispatch, clearDrag]
  )

  return (
    <div className="games">
      <div className="games-select">
        <div className="games-select__header">
          <span className="games-select__title">lebron games</span>
          <AddGame />
        </div>
        <div className="games-select__list">
          {gamesList.map((game, i) => (
            <GameTile
              key={game.id}
              isEven={i % 2 === 0}
              schema={game}
              isDragging={draggedId === game.id}
              isDragOver={dragOverId === game.id && draggedId !== null && draggedId !== game.id}
              onDragStart={() => setDraggedId(game.id)}
              onDragEnter={() => setDragOverId(game.id)}
              onDragEnd={clearDrag}
              onDrop={() => onDropOn(game.id)}
            />
          ))}
        </div>
        <Settings />
      </div>
      <div className="selected-game">
        <SelectedGame />
      </div>
    </div>
  )
}

export default Games
