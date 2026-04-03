'use client'

import { useState } from 'react'

const MIN_READY_LENGTH = 100

interface UseLogInputOptions {
  maxLength: number
  onLogReady: (log: string, duration?: number) => void
}

interface UseLogInputReturn {
  logText: string
  fightDuration: number | undefined
  error: string | undefined
  isReady: boolean
  handleLogChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  handleDurationChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  handleClear: () => void
  handleSubmit: () => void
}

export function useLogInput({ maxLength, onLogReady }: UseLogInputOptions): UseLogInputReturn {
  const [logText, setLogText] = useState('')
  const [fightDuration, setFightDuration] = useState<number | undefined>(undefined)
  const [error, setError] = useState<string | undefined>(undefined)

  const isReady = logText.length >= MIN_READY_LENGTH && error === undefined

  const handleLogChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    if (value.length > maxLength) {
      setError(`Log is too long. Max ${maxLength.toLocaleString()} characters.`)
    } else {
      setError(undefined)
    }
    setLogText(value)
  }

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    if (raw === '') {
      setFightDuration(undefined)
      return
    }
    const parsed = parseInt(raw, 10)
    if (!isNaN(parsed) && parsed > 0) {
      setFightDuration(parsed)
    }
  }

  const handleClear = () => {
    setLogText('')
    setFightDuration(undefined)
    setError(undefined)
  }

  const handleSubmit = () => {
    if (!isReady) return
    onLogReady(logText, fightDuration)
  }

  return {
    logText,
    fightDuration,
    error,
    isReady,
    handleLogChange,
    handleDurationChange,
    handleClear,
    handleSubmit,
  }
}
