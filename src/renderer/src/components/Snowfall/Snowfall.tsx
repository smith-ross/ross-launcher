import { useMemo, CSSProperties } from 'react'
import './Snowfall.scss'

const FLAKE_COUNT = 40

interface Flake {
  left: number
  size: number
  drift: number
  duration: number
  delay: number
  opacity: number
}

const Snowfall = () => {
  const flakes = useMemo<Flake[]>(
    () =>
      Array.from({ length: FLAKE_COUNT }, () => ({
        left: Math.random() * 100,
        size: 3 + Math.random() * 6,
        drift: (Math.random() - 0.5) * 80,
        duration: 8 + Math.random() * 10,
        delay: Math.random() * 15,
        opacity: 0.4 + Math.random() * 0.5
      })),
    []
  )

  return (
    <div className="snowfall" aria-hidden="true">
      {flakes.map((flake, i) => (
        <span
          key={i}
          className="snowfall__flake"
          style={
            {
              left: `${flake.left}%`,
              width: `${flake.size}px`,
              height: `${flake.size}px`,
              opacity: flake.opacity,
              animationDuration: `${flake.duration}s`,
              animationDelay: `-${flake.delay}s`,
              '--drift': `${flake.drift}px`
            } as CSSProperties
          }
        />
      ))}
    </div>
  )
}

export default Snowfall
