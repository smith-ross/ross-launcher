import { useCallback, useState } from 'react'
import Modal from '@renderer/components/Modal/Modal'
import { useAppDispatch } from '@renderer/store/hooks'
import { Game, updateGame } from '@renderer/store/slices/games-slice'
import GameForm, { GameFormValues } from '../GameForm/GameForm'

interface EditGameProps {
  game: Game
}

const EditGame = ({ game }: EditGameProps) => {
  const dispatch = useAppDispatch()
  const [isOpen, setIsOpen] = useState(false)
  const [executablePath, setExecutablePath] = useState<string | null>(null)

  const open = useCallback(async () => {
    const path = await window.customGamesAPI.getExecutablePath(game.id)
    setExecutablePath(path ?? '')
    setIsOpen(true)
  }, [game.id])

  const close = useCallback(() => {
    setIsOpen(false)
    setExecutablePath(null)
  }, [])

  const onSubmit = useCallback(
    async (values: GameFormValues) => {
      const result = await window.customGamesAPI.update(game.id, {
        name: values.name,
        executablePath: values.executablePath,
        iconUri: values.iconUri,
        coverUri: values.coverUri || undefined
      })

      if (result.success && result.game) {
        dispatch(updateGame({ id: game.id, changes: result.game }))
      }

      return result
    },
    [dispatch, game.id]
  )

  return (
    <>
      <button className="game-remove__trigger" onClick={open} title="Edit this game" type="button">
        Edit game
      </button>

      {isOpen && executablePath !== null && (
        <Modal title="Edit game" onClose={close}>
          <GameForm
            initialValues={{
              name: game.name,
              executablePath,
              iconUri: game.iconUri,
              coverUri: game.coverUri ?? ''
            }}
            submitLabel="Save changes"
            savingLabel="Saving…"
            onSubmit={onSubmit}
            onSuccess={close}
          />
        </Modal>
      )}
    </>
  )
}

export default EditGame
