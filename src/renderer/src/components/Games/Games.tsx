import './Games.scss'
import GameTile from './GameTile/GameTile'
import { useAppDispatch, useAppSelector } from '@renderer/store/hooks'
import SelectedGame from './SelectedGame/SelectedGame'
import { useEffect } from 'react'
import { updateGame } from '@renderer/store/slices/games-slice'
import useGameLibrary from '@renderer/util/useGameLibrary'

const Games = () => {
  const dispatch = useAppDispatch()
  const gamesList = useAppSelector((state) => state.games.list)
  const { checkGame } = useGameLibrary()

  // Auto-check every game for updates as soon as the library loads, so
  // outdated/not-installed games are flagged without the user having to
  // select them first.
  useEffect(() => {
    gamesList.forEach((game) => checkGame(game))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const unsubscribe = window.gameAPI.onDownloadProgress(({ id, percent }) => {
      dispatch(updateGame({ id, changes: { downloadProgress: percent } }))
    })
    return unsubscribe
  }, [dispatch])

  return (
    <div className="games">
      <div className="games-select">
        <span className="games-select__title">lebron games</span>
        <div className="games-select__list">
          {gamesList.map((game, i) => (
            <GameTile key={game.id} isEven={i % 2 === 0} schema={game} />
          ))}
        </div>
      </div>
      <div className="selected-game">
        <SelectedGame />
      </div>
    </div>
  )
}

export default Games
