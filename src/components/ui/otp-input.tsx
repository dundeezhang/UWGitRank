'use client'

import { useRef, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'

interface OtpInputProps {
  length?: number
  value: string
  onChange: (value: string) => void
  disabled?: boolean
  error?: boolean
  autoFocus?: boolean
}

export function OtpInput({
  length = 6,
  value,
  onChange,
  disabled = false,
  error = false,
  autoFocus = true,
}: OtpInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }
  }, [autoFocus])

  const focusInput = useCallback((index: number) => {
    const clamped = Math.max(0, Math.min(index, length - 1))
    inputRefs.current[clamped]?.focus()
  }, [length])

  const updateValue = useCallback(
    (newValue: string) => {
      onChange(newValue.slice(0, length))
    },
    [onChange, length]
  )

  const handleChange = useCallback(
    (index: number, digit: string) => {
      if (!/^\d$/.test(digit)) return

      const chars = value.split('')
      // Pad with empty strings if needed
      while (chars.length < length) chars.push('')
      chars[index] = digit
      updateValue(chars.join(''))

      if (index < length - 1) {
        focusInput(index + 1)
      }
    },
    [value, length, updateValue, focusInput]
  )

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace') {
        e.preventDefault()
        const chars = value.split('')
        if (chars[index]) {
          chars[index] = ''
          updateValue(chars.join(''))
        } else if (index > 0) {
          chars[index - 1] = ''
          updateValue(chars.join(''))
          focusInput(index - 1)
        }
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        focusInput(index - 1)
      } else if (e.key === 'ArrowRight') {
        e.preventDefault()
        focusInput(index + 1)
      }
    },
    [value, updateValue, focusInput]
  )

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      e.preventDefault()
      const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
      if (pasted.length === 0) return
      updateValue(pasted)
      focusInput(Math.min(pasted.length, length - 1))
    },
    [length, updateValue, focusInput]
  )

  const handleInput = useCallback(
    (index: number, e: React.FormEvent<HTMLInputElement>) => {
      const target = e.target as HTMLInputElement
      const digit = target.value.slice(-1)
      target.value = ''
      if (/^\d$/.test(digit)) {
        handleChange(index, digit)
      }
    },
    [handleChange]
  )

  return (
    <div className="flex items-center justify-center gap-2" onPaste={handlePaste}>
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => { inputRefs.current[index] = el }}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          maxLength={1}
          aria-label={`Digit ${index + 1} of ${length}`}
          value={value[index] ?? ''}
          onInput={(e) => handleInput(index, e)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onFocus={(e) => e.target.select()}
          disabled={disabled}
          className={cn(
            'w-12 h-14 text-center text-2xl font-semibold rounded-lg border bg-white outline-none transition-all',
            'focus:border-[#FFD54F] focus:ring-2 focus:ring-[#FFD54F]/30',
            error
              ? 'border-destructive'
              : 'border-zinc-300',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        />
      ))}
    </div>
  )
}
