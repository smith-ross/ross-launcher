import { MouseEventHandler } from 'react'
import './Button.scss'

interface ButtonProps {
  text: string
  onClick?: MouseEventHandler
  className?: string
  disabled?: boolean
  title?: string
}

const Button = ({ text, className = '', onClick = () => {}, disabled = false, title }: ButtonProps) => {
  return (
    <button
      className={`ross-btn ${className} ${disabled ? 'ross-btn--disabled' : ''}`}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      title={title}
      type="button"
    >
      {text}
    </button>
  )
}

export default Button
