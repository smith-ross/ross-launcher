import { ReactNode } from 'react'
import './Modal.scss'

interface ModalProps {
  title: string
  onClose: () => void
  children: ReactNode
}

const Modal = ({ title, onClose, children }: ModalProps) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal__header">
          <span className="modal__title">{title}</span>
          <button className="modal__close" onClick={onClose} title="Close" type="button">
            &#10005;
          </button>
        </div>
        <div className="modal__body">{children}</div>
      </div>
    </div>
  )
}

export default Modal
