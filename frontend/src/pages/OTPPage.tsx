import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { verifyOTP } from '@/api/auth'
import { useAuthStore } from '@/hooks/useAuthStore'

const OTP_LENGTH = 6
const EXPIRY_SECONDS = 299

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function OTPPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const phone = (location.state?.phone as string) ?? ''
  const { setAuth } = useAuthStore()
  const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''))
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [secondsLeft, setSecondsLeft] = useState(EXPIRY_SECONDS)
  const [isShaking] = useState(false)

  const inputs = useRef<(HTMLInputElement | null)[]>([])

  // Countdown timer
  useEffect(() => {
    if (secondsLeft <= 0) return
    const id = setInterval(() => setSecondsLeft((s) => s - 1), 1000)
    return () => clearInterval(id)
  }, [secondsLeft])

  const focusInput = useCallback((index: number) => {
    inputs.current[index]?.focus()
  }, [])

  const handleChange = useCallback(
    (index: number, value: string) => {
      const digit = value.replace(/\D/g, '').slice(-1)
      setOtp((prev) => {
        const next = [...prev]
        next[index] = digit
        return next
      })
      setError('')
      if (digit && index < OTP_LENGTH - 1) {
        focusInput(index + 1)
      }
    },
    [focusInput]
  )

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace') {
        if (otp[index]) {
          setOtp((prev) => {
            const next = [...prev]
            next[index] = ''
            return next
          })
        } else if (index > 0) {
          focusInput(index - 1)
        }
      }
    },
    [otp, focusInput]
  )

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      e.preventDefault()
      const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH)
      if (!digits) return
      setOtp((prev) => {
        const next = [...prev]
        digits.split('').forEach((d, i) => {
          next[i] = d
        })
        return next
      })
      focusInput(Math.min(digits.length, OTP_LENGTH - 1))
    },
    [focusInput]
  )

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      if (otp.some((d) => !d) || isLoading) return

      setIsLoading(true)
      setError('')

      try {
        const { token } = await verifyOTP(phone, otp.join(''))
        setAuth(token, phone)
        navigate('/verified')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Verification failed')
      } finally {
        setIsLoading(false)
      }
    },
    [otp, isLoading, navigate, phone, setAuth]
  )

  const allFilled = otp.every((d) => d !== '')

  return (
    <>
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          15%       { transform: translateX(-6px); }
          30%       { transform: translateX(6px); }
          45%       { transform: translateX(-5px); }
          60%       { transform: translateX(5px); }
          75%       { transform: translateX(-3px); }
          90%       { transform: translateX(3px); }
        }
        .shake { animation: shake 0.6s ease-in-out; }
      `}</style>

      <div className="relative min-h-screen bg-surface-900 flex items-center justify-center overflow-hidden">
        {/* Ambient glow */}
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 500,
            height: 500,
            background: 'radial-gradient(circle, rgba(16,185,129,0.05) 0%, transparent 70%)',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />

        <div className="relative z-10 w-full max-w-md mx-4 animate-slide-in">
          <div className="glass-strong rounded-2xl p-10">
            {/* Back button */}
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="font-mono text-xs text-muted hover:text-white transition-colors mb-8 flex items-center gap-1"
            >
              ← back
            </button>

            {/* Title */}
            <h1 className="font-display font-bold text-2xl text-white mb-2">Check your phone.</h1>

            {/* Subtitle */}
            <p className="font-body text-sm text-muted mb-1">
              Sent to <span className="font-mono text-brand">{phone}</span>
            </p>

            {/* Timer row */}
            <div className="flex items-center gap-2 mb-8">
              <span className="ws-dot" />
              <span className="font-mono text-xs text-muted">
                Lambda → SNS → SMS delivered · expires in{' '}
                <span className={secondsLeft <= 30 ? 'text-red-400' : 'text-brand'}>
                  {formatTime(secondsLeft)}
                </span>
              </span>
            </div>

            {/* OTP circles */}
            <form onSubmit={handleSubmit} noValidate>
              <div
                className={`flex justify-between gap-2 mb-6 ${isShaking ? 'shake' : ''}`}
                onPaste={handlePaste}
              >
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => {
                      inputs.current[i] = el
                    }}
                    type="tel"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    disabled={isLoading}
                    className="w-12 h-12 rounded-full text-center font-mono text-lg font-bold text-white outline-none transition-all"
                    style={{
                      background: 'rgba(16,185,129,0.06)',
                      border: digit
                        ? '1.5px solid rgba(16,185,129,0.8)'
                        : '1.5px solid rgba(16,185,129,0.2)',
                      boxShadow: digit ? '0 0 0 3px rgba(16,185,129,0.08)' : 'none',
                    }}
                  />
                ))}
              </div>

              {/* Error message */}
              {error && (
                <div
                  className="rounded-lg px-4 py-2.5 mb-4 font-body text-sm animate-fade-up"
                  style={{
                    background: 'rgba(239,68,68,0.08)',
                    border: '1px solid rgba(239,68,68,0.25)',
                    color: '#fca5a5',
                  }}
                >
                  {error}
                </div>
              )}

              {/* Submit button */}
              <button type="submit" className="btn-primary" disabled={!allFilled || isLoading}>
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin"
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      aria-hidden="true"
                    >
                      <circle
                        cx="8"
                        cy="8"
                        r="6"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeOpacity="0.3"
                      />
                      <path
                        d="M14 8a6 6 0 0 0-6-6"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                    Verifying...
                  </span>
                ) : (
                  'Verify & Enter →'
                )}
              </button>
            </form>

            {/* Footer note */}
            <p className="font-mono text-xs text-muted text-center mt-6">
              Hash stored in DynamoDB · bcrypt · TTL auto-purge
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
