import { Game, selectGame } from '@renderer/store/slices/games-slice'
import './GameTile.scss'
import { useAppDispatch, useAppSelector } from '@renderer/store/hooks'
import { useCallback, DragEvent } from 'react'

interface GameTileProps {
  schema: Game
  isEven?: boolean
  isDragging?: boolean
  isDragOver?: boolean
  onDragStart?: () => void
  onDragEnter?: () => void
  onDragEnd?: () => void
  onDrop?: () => void
}

const GameTile = ({
  schema,
  isEven = false,
  isDragging = false,
  isDragOver = false,
  onDragStart,
  onDragEnter,
  onDragEnd,
  onDrop
}: GameTileProps) => {
  const dispatch = useAppDispatch()
  const selectedId = useAppSelector((state) => state.games.selectedId)
  const isSelected = selectedId === schema.id

  const onClick = useCallback(() => {
    dispatch(selectGame(schema.id))
  }, [dispatch, schema])

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault()
  }, [])

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault()
      onDrop?.()
    },
    [onDrop]
  )

  const classes = [
    'game-tile',
    isEven ? 'even' : 'odd',
    isSelected ? 'game-selected' : '',
    isDragging ? 'dragging' : '',
    isDragOver ? 'drag-over' : ''
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      className={classes}
      onClick={onClick}
      draggable
      onDragStart={onDragStart}
      onDragEnter={onDragEnter}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onDragEnd={onDragEnd}
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
