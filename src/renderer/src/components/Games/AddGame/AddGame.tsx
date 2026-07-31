import { useCallback, useState } from 'react'
import Modal from '@renderer/components/Modal/Modal'
import { useAppDispatch } from '@renderer/store/hooks'
import { addGame } from '@renderer/store/slices/games-slice'
import GameForm, { GameFormValues } from '../GameForm/GameForm'
import './AddGame.scss'

const AddGame = () => {
  const dispatch = useAppDispatch()
  const [isOpen, setIsOpen] = useState(false)

  const close = useCallback(() => setIsOpen(false), [])

  const onSubmit = useCallback(
    async (values: GameFormValues) => {
      const result = await window.customGamesAPI.add({
        name: values.name,
        executablePath: values.executablePath,
        iconUri: values.iconUri,
        coverUri: values.coverUri || undefined
      })

      if (result.success && result.game) {
        dispatch(addGame({ ...result.game, status: 'up-to-date' }))
      }

      return result
    },
    [dispatch]
  )

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
          <GameForm submitLabel="Add game" savingLabel="Adding…" onSubmit={onSubmit} onSuccess={close} />
        </Modal>
      )}
    </>
  )
}

export default AddGame
