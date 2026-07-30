import { Game, selectGame } from '@renderer/store/slices/games-slice'
import './GameTile.scss'
import { useAppDispatch, useAppSelector } from '@renderer/store/hooks'
import { useCallback } from 'react'

interface GameTileProps {
  schema: Game
  isEven?: boolean
}

const GameTile = ({ schema, isEven = false }: GameTileProps) => {
  const dispatch = useAppDispatch()
  const selectedId = useAppSelector((state) => state.games.selectedId)
  const isSelected = selectedId === schema.id

  const onClick = useCallback(() => {
    dispatch(selectGame(schema.id))
  }, [dispatch, schema])

  return (
    <div
      className={`game-tile ${isEven ? 'even' : 'odd'} ${isSelected ? 'game-selected' : ''}`}
      onClick={onClick}
    >
      <div
        className="game-tile__icon"
        style={schema.iconUri ? { backgroundImage: `url(${schema.iconUri})` } : undefined}
      />
      <span className="game-tile__title">{schema.name}</span>
      {schema.status === 'update-available' && (
        <span className="game-tile__badge game-tile__badge--update" title="Update available">
          !
        </span>
      )}
      {schema.status === 'not-installed' && (
        <span className="game-tile__badge game-tile__badge--missing" title="Not installed">
          &#8595;
        </span>
      )}
    </div>
  )
}

export default GameTile
