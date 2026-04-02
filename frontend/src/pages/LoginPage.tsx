import { MelbourneSkyline } from '@/components/login/MelbourneSkyline'
import { PhoneForm } from '@/components/login/PhoneForm'

export function LoginPage() {
  return (
    <div className="relative min-h-screen bg-surface-900 flex items-center justify-center overflow-hidden">
      <MelbourneSkyline />

      {/* Ambient glow behind card */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 600,
          height: 600,
          background: 'radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      />

      {/* Card */}
      <div className="relative z-10 w-full max-w-md mx-4 animate-slide-in">
        <div className="glass-strong rounded-2xl p-10">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: 'rgba(16,185,129,0.15)',
                border: '1px solid rgba(16,185,129,0.3)',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <circle cx="10" cy="10" r="7" stroke="#10b981" strokeWidth="1.5" />
                <polyline
                  points="10,6 10,10 13,12"
                  stroke="#10b981"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div>
              <div className="font-display font-bold text-brand-faint text-base leading-tight">
                Aussie Property
              </div>
              <div className="font-mono text-brand text-xs tracking-widest mt-0.5">
                LIVE TRACKER
              </div>
            </div>
          </div>

          {/* Headline */}
          <h1 className="font-display font-bold text-3xl text-white mb-2">Get instant alerts.</h1>
          <p className="text-sm text-muted mb-8">
            Melbourne properties go fast. Be first — always.
          </p>

          <PhoneForm />

          {/* Footer note */}
          <p className="text-center font-body text-xs text-muted mt-6">
            No password. No email. Just your phone.
          </p>
        </div>
      </div>
    </div>
  )
}
