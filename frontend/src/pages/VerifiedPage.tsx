import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/hooks/useAuthStore'

export function VerifiedPage() {
  const navigate = useNavigate()
  const { phone } = useAuthStore()

  const [wsText, setWsText] = useState('WebSocket session opening...')
  const [wsConnected, setWsConnected] = useState(false)

  useEffect(() => {
    const wsTimer = setTimeout(() => {
      const sessionId = Math.random().toString(16).slice(2, 8)
      setWsText(`WS connected · session ID: ws-${sessionId}`)
      setWsConnected(true)
    }, 1200)

    const redirectTimer = setTimeout(() => {
      navigate('/')
    }, 3500)

    return () => {
      clearTimeout(wsTimer)
      clearTimeout(redirectTimer)
    }
  }, [navigate])

  return (
    <>
      <style>{`
        @keyframes popIn {
          0%   { transform: scale(0);   opacity: 0; }
          60%  { transform: scale(1.2); opacity: 1; }
          100% { transform: scale(1);   opacity: 1; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
      `}</style>

      <div className="relative min-h-screen bg-surface-900 flex flex-col items-center justify-center overflow-hidden">
        {/* Melbourne skyline */}
        <svg
          className="absolute bottom-0 left-0 w-full pointer-events-none select-none"
          viewBox="0 0 1440 320"
          preserveAspectRatio="xMidYMax meet"
          aria-hidden="true"
          style={{ opacity: 0.12 }}
        >
          <g fill="#10b981">
            <rect x="200" y="60" width="28" height="260" />
            <rect x="206" y="40" width="16" height="24" />
            <rect x="212" y="20" width="4" height="22" />
            <rect x="260" y="100" width="36" height="220" />
            <rect x="266" y="82" width="24" height="20" />
            <rect x="320" y="80" width="30" height="240" />
            <rect x="330" y="60" width="10" height="22" />
            <rect x="370" y="110" width="34" height="210" />
            <rect x="420" y="140" width="42" height="180" />
            <rect x="476" y="160" width="36" height="160" />
            <rect x="526" y="130" width="28" height="190" />
            <rect x="566" y="150" width="48" height="170" />
            <rect x="628" y="170" width="32" height="150" />
            <rect x="672" y="145" width="40" height="175" />
            <rect x="724" y="160" width="30" height="160" />
            <rect x="766" y="180" width="44" height="140" />
            <rect x="822" y="165" width="26" height="155" />
            <rect x="860" y="185" width="36" height="135" />
            <rect x="908" y="155" width="30" height="165" />
            <rect x="950" y="175" width="40" height="145" />
            <rect x="1002" y="200" width="28" height="120" />
            <rect x="1042" y="185" width="34" height="135" />
            <rect x="1088" y="210" width="26" height="110" />
            <rect x="1126" y="195" width="38" height="125" />
            <rect x="1176" y="220" width="30" height="100" />
            <rect x="1218" y="200" width="44" height="120" />
            <rect x="0" y="240" width="1440" height="80" />
          </g>
        </svg>

        {/* Ambient glow */}
        <div
          className="absolute pointer-events-none"
          style={{
            width: 500,
            height: 350,
            background: 'radial-gradient(ellipse, rgba(16,185,129,0.07) 0%, transparent 70%)',
            top: '40%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 0,
          }}
        />

        {/* Card */}
        <div className="relative z-10 w-full max-w-sm mx-4">
          <div className="glass-strong rounded-2xl p-12 flex flex-col items-center text-center">
            {/* Checkmark circle */}
            <div
              style={{
                opacity: 0,
                animation: 'popIn 0.5s cubic-bezier(0.16,1,0.3,1) forwards',
                animationDelay: '0.1s',
                width: 64,
                height: 64,
                borderRadius: '50%',
                background: 'rgba(16,185,129,0.15)',
                border: '1.5px solid #10b981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.5rem',
              }}
            >
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
                <path
                  d="M6 14l6 6 10-12"
                  stroke="#10b981"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {/* Title */}
            <h1
              className="font-display font-bold text-2xl text-white mb-2"
              style={{
                opacity: 0,
                animation: 'fadeUp 0.4s ease forwards',
                animationDelay: '0.3s',
              }}
            >
              Identity verified.
            </h1>

            {/* Phone */}
            <p
              className="font-mono text-sm text-brand mb-3"
              style={{
                opacity: 0,
                animation: 'fadeUp 0.4s ease forwards',
                animationDelay: '0.5s',
              }}
            >
              {phone}
            </p>

            {/* WS status */}
            <div
              className="flex items-center justify-center gap-2"
              style={{
                opacity: 0,
                animation: 'fadeUp 0.4s ease forwards',
                animationDelay: '0.7s',
              }}
            >
              <span
                className="ws-dot"
                style={wsConnected ? { animationPlayState: 'paused' } : undefined}
              />
              <span className="font-mono text-xs text-muted">{wsText}</span>
            </div>

            {/* Divider */}
            <div
              className="w-full my-6"
              style={{
                height: 1,
                background: 'rgba(16,185,129,0.15)',
                opacity: 0,
                animation: 'fadeUp 0.4s ease forwards',
                animationDelay: '0.9s',
              }}
            />

            {/* AWS pills */}
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {(['Lambda ✓', 'DynamoDB ✓', 'JWT issued ✓'] as const).map((label, i) => (
                <span
                  key={label}
                  className="font-mono text-xs text-brand rounded-full px-3 py-1"
                  style={{
                    background: 'rgba(16,185,129,0.1)',
                    border: '1px solid rgba(16,185,129,0.25)',
                    opacity: 0,
                    animation: 'fadeUp 0.4s ease forwards',
                    animationDelay: `${1.0 + i * 0.2}s`,
                  }}
                >
                  {label}
                </span>
              ))}
            </div>

            {/* Enter button */}
            <div
              className="w-full"
              style={{
                opacity: 0,
                animation: 'fadeUp 0.4s ease forwards',
                animationDelay: '1.6s',
              }}
            >
              <button type="button" className="btn-primary" onClick={() => navigate('/')}>
                Enter Dashboard →
              </button>
            </div>
          </div>

          {/* Bottom note */}
          <p
            className="font-mono text-xs text-muted text-center mt-4"
            style={{
              opacity: 0,
              animation: 'fadeUp 0.4s ease forwards',
              animationDelay: '1.8s',
            }}
          >
            Session secured · JWT · 30 day expiry
          </p>
        </div>
      </div>
    </>
  )
}
