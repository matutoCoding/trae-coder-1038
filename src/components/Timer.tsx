import { useEffect, useState } from 'react'

interface TimerProps {
  startTime: number
  isDanger?: boolean
}

export default function Timer({ startTime, isDanger }: TimerProps) {
  const [elapsed, setElapsed] = useState(() => Date.now() - startTime)

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed(Date.now() - startTime)
    }, 1000)
    return () => clearInterval(timer)
  }, [startTime])

  const totalSeconds = Math.floor(elapsed / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  const formatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`

  return (
    <span
      className={`text-2xl font-mono font-bold ${
        isDanger ? 'text-danger-500 animate-pulse' : 'text-gray-900'
      }`}
    >
      {formatted}
    </span>
  )
}
