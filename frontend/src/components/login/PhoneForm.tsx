import { usePhoneForm } from '@/hooks/usePhoneForm'

export function PhoneForm() {
  const { phone, loading, error, setPhone, handleSubmit } = usePhoneForm()

  return (
    <form onSubmit={handleSubmit} noValidate>
      <label className="block font-mono text-xs text-muted tracking-widest mb-2">
        MOBILE NUMBER
      </label>

      <div className="flex gap-2 mb-2">
        <div
          className="flex items-center justify-center px-4 rounded-lg font-mono text-sm font-medium flex-shrink-0"
          style={{
            background: 'rgba(16,185,129,0.08)',
            border: '1px solid rgba(16,185,129,0.25)',
            color: '#10b981',
            minWidth: '60px',
          }}
        >
          +61
        </div>
        <input
          type="tel"
          className="field flex-1"
          placeholder="0412 345 678"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          autoComplete="tel-national"
          inputMode="tel"
          required
          disabled={loading}
        />
      </div>

      <div className="flex items-center gap-1.5 mb-6" style={{ minHeight: '20px' }}>
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          aria-hidden="true"
          className="flex-shrink-0"
        >
          <rect x="1" y="3" width="12" height="9" rx="1.5" stroke="#4b7060" strokeWidth="1.2" />
          <path d="M1 5.5l6 4 6-4" stroke="#4b7060" strokeWidth="1.2" />
        </svg>
        <span className="font-mono text-xs" style={{ color: '#4b7060' }}>
          OTP sent via <span style={{ color: '#10b981' }}>AWS</span>{' '}
          <span style={{ color: '#10b981' }}>SNS</span>
          {' · Lambda · DynamoDB TTL 5min'}
        </span>
      </div>

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

      <button type="submit" className="btn-primary" disabled={loading || phone.trim() === ''}>
        {loading ? (
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
            Sending OTP…
          </span>
        ) : (
          'Get Access →'
        )}
      </button>
    </form>
  )
}
