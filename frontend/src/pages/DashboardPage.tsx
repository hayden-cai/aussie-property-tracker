import { useEffect, useRef, useState } from 'react'
import { Listing, Subscription } from '@/types'
import { MOCK_LISTINGS, MOCK_SUBSCRIPTIONS, NEW_LISTING_POOL } from '@/utils/mockData'
import { formatPrice, timeAgo } from '@/utils/format'

// ── INITIAL DATA ────────────────────────────────────────────────────────────

interface WSEvent {
  color: string
  msg: string
  timestamp: string
}

const INITIAL_EVENTS: WSEvent[] = [
  { color: '#10b981', msg: 'WS session opened · user: +61412345678', timestamp: '09:00:01' },
  { color: '#f59e0b', msg: 'ALERT: Richmond 2B matched subscription', timestamp: '09:00:00' },
  { color: '#10b981', msg: 'EventBridge rule fired · Lambda invoked', timestamp: '08:55:00' },
  { color: '#10b981', msg: 'mock-listings: 1 match found', timestamp: '08:55:01' },
  { color: '#4b7060', msg: 'Heartbeat ping acknowledged', timestamp: '08:50:00' },
]

interface MockReport {
  name: string
  size: string
  date: string
  ext: string
}

const INITIAL_REPORTS: MockReport[] = [
  { name: 'weekly_suburb_2026-03-29.pdf', size: '284 KB', date: '7 days ago', ext: 'PDF' },
  { name: 'alert_history_2026-03-22.csv', size: '38 KB', date: '14 days ago', ext: 'CSV' },
]

// ── COMPONENT ───────────────────────────────────────────────────────────────

export function DashboardPage() {
  const [activeTab, setActiveTab] = useState<'feed' | 'subs' | 'reports'>('feed')
  const [listings, setListings] = useState<Listing[]>(MOCK_LISTINGS)
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(MOCK_SUBSCRIPTIONS)
  const [region, setRegion] = useState('all')
  const [priority, setPriority] = useState<'high' | 'low'>('high')
  const [events, setEvents] = useState<WSEvent[]>(INITIAL_EVENTS)
  const [invokeCount, setInvokeCount] = useState(124)
  const [avgMs, setAvgMs] = useState(210)
  const [newListingIndex, setNewListingIndex] = useState(0)
  const [format, setFormat] = useState<'pdf' | 'csv' | 'json'>('pdf')
  const [reportProgress, setReportProgress] = useState(0)
  const [progressLabel, setProgressLabel] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [reportDone, setReportDone] = useState(false)
  const [mockReports, setMockReports] = useState<MockReport[]>(INITIAL_REPORTS)
  const [wsStatus, setWsStatus] = useState<'live' | 'reconnecting'>('live')
  const autoEventIndex = useRef(0)

  // ── WS status simulation ────────────────────────────────────────────────
  useEffect(() => {
    const t1 = setTimeout(() => setWsStatus('reconnecting'), 8000)
    const t2 = setTimeout(() => setWsStatus('live'), 10200)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [])

  // ── Auto WS events ──────────────────────────────────────────────────────
  const addEvent = (event: { color: string; msg: string }) => {
    const now = new Date()
    const ts = [now.getHours(), now.getMinutes(), now.getSeconds()]
      .map((n) => n.toString().padStart(2, '0'))
      .join(':')
    setEvents((prev) => [{ ...event, timestamp: ts }, ...prev].slice(0, 20))
  }

  useEffect(() => {
    const id = setInterval(() => {
      const count = invokeCount
      const messages = [
        { color: '#4b7060', msg: 'EventBridge rule fired · mock-listings Lambda' },
        { color: '#4b7060', msg: '0 new matches this cycle' },
        { color: '#4b7060', msg: 'Heartbeat ping sent' },
        {
          color: '#10b981',
          msg: `Lambda #${count} executed · ~${210 + Math.round(Math.random() * 80)}ms`,
        },
      ]
      addEvent(messages[autoEventIndex.current % messages.length])
      autoEventIndex.current += 1
      setInvokeCount((n) => n + 1)
      setAvgMs(Math.round(180 + Math.random() * 120))
    }, 5000)
    return () => clearInterval(id)
  }, [invokeCount])

  // ── Simulate new listing ─────────────────────────────────────────────────
  const simulateNewListing = () => {
    const next = NEW_LISTING_POOL[newListingIndex % NEW_LISTING_POOL.length]
    const newListing: Listing = {
      ...next,
      listingId: `new-${Date.now()}`,
      timestamp: new Date().toISOString(),
      isNew: true,
    }
    setListings((prev) => [newListing, ...prev])
    setNewListingIndex((i) => i + 1)
    addEvent({ color: '#10b981', msg: `NEW: ${newListing.address} matched your alert` })
    setInvokeCount((n) => n + 1)
    setTimeout(() => {
      setListings((prev) =>
        prev.map((l) => (l.listingId === newListing.listingId ? { ...l, isNew: false } : l))
      )
    }, 6000)
  }

  // ── Report generation ────────────────────────────────────────────────────
  const startReportGeneration = () => {
    setReportProgress(0)
    setReportDone(false)
    setIsGenerating(true)
    let progress = 0
    const id = setInterval(() => {
      progress += Math.round(5 + Math.random() * 15)
      if (progress >= 100) progress = 100
      setReportProgress(progress)
      if (progress < 30) setProgressLabel('Lambda invoked...')
      else if (progress < 60) setProgressLabel('Building report...')
      else if (progress < 90) setProgressLabel('Uploading to S3...')
      else setProgressLabel('Sending WS notification...')
      if (progress >= 100) {
        clearInterval(id)
        setReportDone(true)
        setIsGenerating(false)
        setMockReports((prev) => [
          {
            name: `report_${Date.now()}.${format}`,
            size: '–',
            date: 'just now',
            ext: format.toUpperCase(),
          },
          ...prev,
        ])
        addEvent({ color: '#10b981', msg: 'S3 upload complete → WS toast sent' })
      }
    }, 300)
  }

  // ── Region filter ────────────────────────────────────────────────────────
  const filtered =
    region === 'all'
      ? listings
      : listings.filter(
          (l) =>
            l.region.toLowerCase() === region.toLowerCase() ||
            l.suburb.toLowerCase().includes(region.toLowerCase())
        )

  // ── RENDER ───────────────────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-16px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      <div className="flex flex-col min-h-screen bg-surface-900">
        {/* ── TOP NAV ──────────────────────────────────────────────────────── */}
        <header
          className="h-14 flex items-center justify-between px-5 flex-shrink-0"
          style={{
            background: 'rgba(10,26,20,0.9)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(16,185,129,0.1)',
          }}
        >
          {/* Left: logo + tabs */}
          <div className="flex items-center gap-4">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div
                className="flex items-center justify-center rounded-lg flex-shrink-0"
                style={{
                  width: 32,
                  height: 32,
                  background: 'rgba(16,185,129,0.15)',
                  border: '1px solid rgba(16,185,129,0.25)',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <circle cx="8" cy="8" r="6" stroke="#10b981" strokeWidth="1.2" />
                  <polyline
                    points="8,5 8,8 10.5,9.5"
                    stroke="#10b981"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span className="font-display font-bold text-white text-sm">Aussie Property</span>
              <span className="font-mono text-xs text-muted ml-1">LIVE</span>
            </div>

            {/* Tabs */}
            <nav className="flex gap-1 ml-4">
              {(
                [
                  ['feed', 'Price Drop Feed'],
                  ['subs', 'Subscriptions'],
                  ['reports', 'Reports'],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className="rounded-lg px-4 py-2 font-display font-semibold text-xs tracking-wide transition-all"
                  style={
                    activeTab === key
                      ? {
                          background: 'rgba(16,185,129,0.12)',
                          color: '#10b981',
                          border: '1px solid rgba(16,185,129,0.2)',
                        }
                      : {
                          color: '#4b7060',
                          border: '1px solid transparent',
                        }
                  }
                  onMouseEnter={(e) => {
                    if (activeTab !== key)
                      (e.currentTarget as HTMLButtonElement).style.color = '#fff'
                  }}
                  onMouseLeave={(e) => {
                    if (activeTab !== key)
                      (e.currentTarget as HTMLButtonElement).style.color = '#4b7060'
                  }}
                >
                  {label}
                </button>
              ))}
            </nav>
          </div>

          {/* Right: region, WS, bell, avatar */}
          <div className="flex items-center gap-4">
            <select
              className="field font-mono text-xs"
              style={{
                width: 'auto',
                paddingTop: '6px',
                paddingBottom: '6px',
                paddingLeft: '10px',
                paddingRight: '10px',
              }}
              value={region}
              onChange={(e) => setRegion(e.target.value)}
            >
              <option value="all">All Regions</option>
              <option value="melbourne">Melbourne</option>
              <option value="sydney">Sydney</option>
              <option value="brisbane">Brisbane</option>
              <option value="perth">Perth</option>
            </select>

            {/* WS status pill */}
            <div
              className="flex items-center gap-2 rounded-full px-3 py-1.5"
              style={{
                background: 'rgba(15,36,25,0.65)',
                border: '1px solid rgba(16,185,129,0.12)',
              }}
            >
              <span
                className="rounded-full flex-shrink-0"
                style={{
                  width: 8,
                  height: 8,
                  background: wsStatus === 'live' ? '#10b981' : '#f59e0b',
                  animation: 'pulseBrand 1.5s ease-in-out infinite',
                }}
              />
              <span
                className="font-mono text-xs"
                style={{ color: wsStatus === 'live' ? '#10b981' : '#f59e0b' }}
              >
                {wsStatus === 'live' ? 'WS Live' : 'Reconnecting'}
              </span>
            </div>

            {/* Bell */}
            <button
              type="button"
              className="relative"
              onClick={() => addEvent({ color: '#f59e0b', msg: 'Manual alert triggered via bell' })}
            >
              <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
                <path
                  d="M11 2a7 7 0 0 1 7 7v3l1.5 3H3.5L5 12V9a7 7 0 0 1 7-7z"
                  stroke="#10b981"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M9 18a2 2 0 0 0 4 0"
                  stroke="#10b981"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span
                className="absolute rounded-full"
                style={{
                  width: 8,
                  height: 8,
                  background: '#10b981',
                  top: 0,
                  right: 0,
                  border: '1.5px solid #060e0b',
                }}
              />
            </button>

            {/* Avatar */}
            <div
              className="flex items-center justify-center rounded-full font-medium text-sm text-brand cursor-pointer"
              style={{
                width: 34,
                height: 34,
                background: 'rgba(16,185,129,0.15)',
                border: '1px solid rgba(16,185,129,0.3)',
              }}
            >
              A
            </div>
          </div>
        </header>

        {/* ── MAIN AREA ──────────────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-row overflow-hidden">
          {/* ── LEFT SIDEBAR ─────────────────────────────────────────────────── */}
          <aside
            className="w-64 flex-shrink-0 overflow-y-auto p-4"
            style={{
              background: '#0a1a14',
              borderRight: '1px solid rgba(16,185,129,0.1)',
            }}
          >
            {/* System status */}
            <div
              className="rounded-xl p-3 mb-5"
              style={{
                background: 'rgba(15,36,25,0.65)',
                border: '1px solid rgba(16,185,129,0.12)',
              }}
            >
              <div className="flex items-center gap-2">
                <span className="ws-dot" />
                <span className="font-display font-semibold text-sm text-white">System Status</span>
              </div>
              <p className="font-mono text-xs text-brand mt-1">Active · Live · EventBridge ✓</p>
            </div>

            {/* Navigation */}
            <p
              className="font-mono text-xs text-muted tracking-widest mb-2 px-2"
              style={{ opacity: 0.5 }}
            >
              NAVIGATION
            </p>
            {(
              [
                [
                  'Dashboard',
                  <>
                    <rect x="3" y="3" width="7" height="7" rx="1" />
                    <rect x="3" y="12" width="7" height="7" rx="1" />
                    <rect x="12" y="3" width="7" height="7" rx="1" />
                    <rect x="12" y="12" width="7" height="7" rx="1" />
                  </>,
                ],
                [
                  'Properties',
                  <>
                    <rect x="2" y="4" width="20" height="14" rx="1.5" />
                    <rect x="6" y="8" width="4" height="6" />
                    <rect x="14" y="8" width="4" height="6" />
                  </>,
                ],
                [
                  'Profile',
                  <>
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                  </>,
                ],
                [
                  'Settings',
                  <>
                    <circle cx="12" cy="12" r="3" />
                    <line x1="12" y1="2" x2="12" y2="6" />
                    <line x1="12" y1="18" x2="12" y2="22" />
                    <line x1="2" y1="12" x2="6" y2="12" />
                    <line x1="18" y1="12" x2="22" y2="12" />
                  </>,
                ],
              ] as [string, React.ReactNode][]
            ).map(([label, icon], i) => (
              <div key={label} className={`nav-item${i === 1 ? ' active' : ''}`}>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  {icon}
                </svg>
                {label}
              </div>
            ))}

            {/* My Alerts */}
            <div className="mt-5">
              <div className="flex items-center justify-between mb-2 px-1">
                <span
                  className="font-mono text-xs text-muted tracking-widest"
                  style={{ opacity: 0.5 }}
                >
                  MY ALERTS
                </span>
                <button type="button" className="font-mono text-xs text-brand">
                  + add
                </button>
              </div>
              {subscriptions.map((sub, i) => (
                <div
                  key={sub.subscriptionId}
                  className="rounded-xl p-3 cursor-pointer mb-2 transition-all"
                  style={{
                    background: i === 0 ? 'rgba(16,185,129,0.1)' : 'rgba(10,26,20,0.5)',
                    border:
                      i === 0 ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(16,185,129,0.1)',
                    borderLeft: i === 0 ? '2px solid #10b981' : undefined,
                  }}
                >
                  <p className="font-display font-semibold text-sm text-white">{sub.suburb}</p>
                  <p className="font-mono text-xs text-muted mt-0.5">
                    {sub.minBeds}B · {sub.minBaths}B · &lt;$
                    {sub.maxPrice >= 10000
                      ? (sub.maxPrice / 1000000).toFixed(1) + 'M'
                      : sub.maxPrice + '/pw'}{' '}
                    · {sub.listingType}
                  </p>
                  <div className="mt-1.5 flex items-center gap-2">
                    {sub.alertCount > 0 && <span className="badge-new">{sub.alertCount} new</span>}
                    <span
                      className="font-mono text-xs"
                      style={{ color: sub.priority === 'high' ? '#10b981' : '#f59e0b' }}
                    >
                      {sub.priority} priority
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Alert level */}
            <div className="mt-5 pt-5" style={{ borderTop: '1px solid rgba(16,185,129,0.1)' }}>
              <p
                className="font-mono text-xs text-muted tracking-widest mb-2"
                style={{ opacity: 0.5 }}
              >
                ALERT LEVEL
              </p>
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setPriority('high')}
                  className="flex-1 rounded-lg py-2 text-xs font-display tracking-wide transition-all"
                  style={
                    priority === 'high'
                      ? {
                          background: '#10b981',
                          color: '#060e0b',
                          fontWeight: 600,
                          border: 'none',
                        }
                      : {
                          background: 'transparent',
                          border: '1px solid rgba(16,185,129,0.2)',
                          color: '#4b7060',
                        }
                  }
                >
                  HIGH
                  <br />
                  <span style={{ fontSize: 9 }} className="font-mono">
                    WS + SMS
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setPriority('low')}
                  className="flex-1 rounded-lg py-2 text-xs font-display tracking-wide transition-all"
                  style={
                    priority === 'low'
                      ? {
                          background: 'rgba(245,158,11,0.15)',
                          color: '#f59e0b',
                          border: '1px solid #f59e0b',
                          fontWeight: 600,
                        }
                      : {
                          background: 'transparent',
                          border: '1px solid rgba(16,185,129,0.2)',
                          color: '#4b7060',
                        }
                  }
                >
                  LOW
                  <br />
                  <span style={{ fontSize: 9 }} className="font-mono">
                    WS only
                  </span>
                </button>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-5 grid grid-cols-2 gap-2">
              <div className="stat-card">
                <p className="font-mono text-2xl font-medium text-white">7</p>
                <p className="font-mono text-xs text-muted mt-1">alerts today</p>
              </div>
              <div className="stat-card">
                <p className="font-mono text-2xl font-medium text-brand">3</p>
                <p className="font-mono text-xs text-muted mt-1">SMS sent</p>
              </div>
            </div>
          </aside>

          {/* ── CENTRE PANEL ─────────────────────────────────────────────────── */}
          <main className="flex-1 overflow-y-auto p-6">
            {/* ── CENTRE: FEED TAB ─────────────────────────────────────────── */}
            {activeTab === 'feed' && (
              <>
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h1 className="font-display font-bold text-2xl text-white">Price Drop Feed</h1>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="ws-dot" />
                      <span className="font-body text-sm text-muted">
                        Real-time updates · mock data · EventBridge every 5min
                      </span>
                    </div>
                  </div>
                  <button type="button" className="btn-ghost text-xs" onClick={simulateNewListing}>
                    + Simulate new listing
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {filtered.map((listing) => (
                    <div
                      key={listing.listingId}
                      className={`property-card p-5${listing.isNew ? ' is-new' : ''}`}
                      style={
                        listing.isNew
                          ? {
                              animation: 'slideIn 0.5s cubic-bezier(0.16,1,0.3,1) forwards',
                            }
                          : undefined
                      }
                    >
                      {/* Row 1 */}
                      <div className="flex justify-between items-start mb-3">
                        <span className="font-mono text-xs text-muted flex items-center gap-1.5">
                          <svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            aria-hidden="true"
                          >
                            <path d="M12 21s-7-6.75-7-12a7 7 0 0 1 14 0c0 5.25-7 12-7 12z" />
                            <circle cx="12" cy="9" r="2.5" />
                          </svg>
                          {listing.type}
                        </span>
                        <div className="flex items-center gap-2">
                          {listing.isNew && <span className="badge-new">JUST LISTED</span>}
                          <span className="price-drop-badge">
                            <svg
                              width="10"
                              height="10"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              aria-hidden="true"
                            >
                              <line x1="12" y1="5" x2="12" y2="19" />
                              <polyline points="19 12 12 19 5 12" />
                            </svg>
                            {Math.abs(listing.dropPercent)}%
                          </span>
                        </div>
                      </div>
                      {/* Row 2 */}
                      <p className="font-display font-semibold text-white text-sm leading-snug mb-3">
                        {listing.address}
                      </p>
                      {/* Row 3 */}
                      <div className="flex items-baseline gap-3 mb-4">
                        <span className="font-mono font-medium text-white text-xl">
                          {formatPrice(listing.price, listing.priceType)}
                        </span>
                        <span className="font-mono text-sm line-through text-muted">
                          {formatPrice(listing.oldPrice, listing.priceType)}
                        </span>
                      </div>
                      {/* Row 4 */}
                      <div className="flex justify-between font-mono text-xs text-muted">
                        <div className="flex gap-4">
                          <span>{listing.beds} beds</span>
                          <span>{listing.baths} baths</span>
                          <span>{listing.parking} parking</span>
                        </div>
                        <span>{timeAgo(listing.timestamp)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* ── CENTRE: SUBS TAB ─────────────────────────────────────────── */}
            {activeTab === 'subs' && (
              <>
                <div className="flex justify-between items-center mb-6">
                  <h1 className="font-display font-bold text-2xl text-white">My Subscriptions</h1>
                  <button
                    type="button"
                    className="btn-primary"
                    style={{ width: 'auto', padding: '8px 20px', fontSize: 13 }}
                    onClick={() => alert('Coming soon — will open add modal')}
                  >
                    ＋ New Alert
                  </button>
                </div>

                <div className="flex flex-col gap-3">
                  {subscriptions.map((sub) => (
                    <div
                      key={sub.subscriptionId}
                      className="flex items-center gap-4 rounded-xl p-4"
                      style={{
                        background: 'rgba(15,36,25,0.65)',
                        border: '1px solid rgba(16,185,129,0.12)',
                      }}
                    >
                      {/* Status dot */}
                      <span
                        className="rounded-full flex-shrink-0"
                        style={{
                          width: 10,
                          height: 10,
                          background: sub.active ? '#10b981' : '#4b7060',
                        }}
                      />
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-display font-semibold text-white">
                            {sub.suburb}
                          </span>
                          <span
                            className="font-mono text-xs px-2 py-0.5 rounded-full"
                            style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}
                          >
                            {sub.listingType}
                          </span>
                          {sub.alertCount > 0 && (
                            <span className="badge-new">{sub.alertCount} new</span>
                          )}
                        </div>
                        <p className="font-mono text-xs text-muted mt-1">
                          {sub.propertyType} · {sub.minBeds}B·{sub.minBaths}B · max $
                          {sub.maxPrice >= 10000
                            ? sub.maxPrice.toLocaleString('en-AU')
                            : `${sub.maxPrice}/pw`}
                        </p>
                      </div>
                      {/* Priority */}
                      <span
                        className="font-mono text-xs px-3 py-1 rounded-full flex-shrink-0"
                        style={
                          sub.priority === 'high'
                            ? {
                                background: 'rgba(16,185,129,0.12)',
                                color: '#10b981',
                                border: '1px solid rgba(16,185,129,0.25)',
                              }
                            : {
                                background: 'rgba(245,158,11,0.1)',
                                color: '#f59e0b',
                                border: '1px solid rgba(245,158,11,0.25)',
                              }
                        }
                      >
                        {sub.priority.toUpperCase()}
                      </span>
                      {/* Status */}
                      <span className="font-mono text-xs text-muted flex-shrink-0">
                        {sub.active ? 'active' : 'paused'}
                      </span>
                      {/* Remove */}
                      <button
                        type="button"
                        className="btn-ghost flex-shrink-0"
                        style={{ padding: '4px 12px', fontSize: 12 }}
                        onClick={() =>
                          setSubscriptions((prev) =>
                            prev.filter((s) => s.subscriptionId !== sub.subscriptionId)
                          )
                        }
                      >
                        remove
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* ── CENTRE: REPORTS TAB ──────────────────────────────────────── */}
            {activeTab === 'reports' && (
              <div className="grid grid-cols-2 gap-6">
                {/* Generator */}
                <div className="glass-strong rounded-2xl p-6">
                  <h2 className="font-display font-semibold text-lg text-white mb-5">
                    Generate report
                  </h2>

                  <select className="field" defaultValue="weekly">
                    <option value="weekly">Weekly suburb analysis</option>
                    <option value="pricedrop">Price drop summary</option>
                    <option value="history">My alert history</option>
                  </select>

                  <div className="grid grid-cols-2 gap-3 mt-3">
                    <input type="date" className="field" defaultValue="2026-03-01" />
                    <input type="date" className="field" defaultValue="2026-03-30" />
                  </div>

                  {/* Format toggle */}
                  <div className="flex gap-2 mt-3">
                    {(['pdf', 'csv', 'json'] as const).map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setFormat(f)}
                        className="flex-1 rounded-lg py-2 text-xs font-display font-semibold transition-all"
                        style={
                          format === f
                            ? {
                                background: '#10b981',
                                color: '#060e0b',
                                border: 'none',
                              }
                            : {
                                background: 'transparent',
                                border: '1px solid rgba(16,185,129,0.2)',
                                color: '#4b7060',
                              }
                        }
                      >
                        {f.toUpperCase()}
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    className="btn-primary mt-4"
                    onClick={startReportGeneration}
                    disabled={isGenerating}
                  >
                    Export → Upload to S3
                  </button>

                  {/* Progress */}
                  {isGenerating && (
                    <div className="mt-3">
                      <div className="h-1 rounded" style={{ background: 'rgba(16,185,129,0.1)' }}>
                        <div
                          className="h-full rounded transition-all"
                          style={{ width: `${reportProgress}%`, background: '#10b981' }}
                        />
                      </div>
                      <p className="font-mono text-xs text-muted mt-1">{progressLabel}</p>
                    </div>
                  )}

                  {/* Success */}
                  {reportDone && (
                    <div
                      className="rounded-xl p-3 flex items-center gap-3 mt-3"
                      style={{
                        background: 'rgba(16,185,129,0.08)',
                        border: '1px solid rgba(16,185,129,0.3)',
                      }}
                    >
                      <span className="ws-dot" />
                      <span className="font-mono text-xs text-muted">Report ready —</span>
                      <a href="#" className="text-brand font-semibold text-sm underline">
                        Download {format.toUpperCase()}
                      </a>
                    </div>
                  )}

                  <p
                    className="font-mono text-center mt-3"
                    style={{ fontSize: 10, color: 'rgba(75,112,96,0.5)' }}
                  >
                    Lambda → S3 PutObject → S3 Event → push-lambda → WS toast
                  </p>
                </div>

                {/* S3 file list */}
                <div>
                  <p className="font-mono text-xs mb-3" style={{ color: 'rgba(75,112,96,0.5)' }}>
                    S3 BUCKET · reports/2026/03/
                  </p>
                  {mockReports.map((report, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3 rounded-xl mb-2 transition-all"
                      style={{
                        background: 'rgba(16,185,129,0.03)',
                        border: '1px solid rgba(16,185,129,0.1)',
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.borderColor = 'rgba(16,185,129,0.3)')
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.borderColor = 'rgba(16,185,129,0.1)')
                      }
                    >
                      <div
                        className="flex items-center justify-center rounded-lg font-mono text-xs text-brand flex-shrink-0"
                        style={{
                          width: 28,
                          height: 28,
                          background: 'rgba(16,185,129,0.1)',
                          border: '1px solid rgba(16,185,129,0.2)',
                        }}
                      >
                        {report.ext}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-mono text-xs text-white truncate">{report.name}</p>
                        <p className="font-mono text-xs text-muted mt-0.5">
                          {report.size} · {report.date}
                        </p>
                      </div>
                      <button
                        type="button"
                        className="btn-ghost flex-shrink-0"
                        style={{ padding: '4px 12px', fontSize: 12 }}
                      >
                        ↓
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </main>

          {/* ── RIGHT PANEL ──────────────────────────────────────────────────── */}
          <aside
            className="w-64 flex-shrink-0 flex flex-col p-4 overflow-hidden"
            style={{
              background: '#0a1a14',
              borderLeft: '1px solid rgba(16,185,129,0.1)',
            }}
          >
            <p
              className="font-mono text-xs tracking-widest mb-3"
              style={{ color: 'rgba(75,112,96,0.5)' }}
            >
              WS EVENT STREAM
            </p>

            {/* Event feed */}
            <div className="flex-1 overflow-y-auto flex flex-col gap-2">
              {events.map((event, i) => (
                <div key={i} className="flex items-start gap-2 animate-fade-up">
                  <span
                    className="rounded-full flex-shrink-0 mt-1"
                    style={{ width: 7, height: 7, background: event.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className="font-mono text-xs leading-relaxed"
                      style={{ color: 'rgba(16,185,129,0.7)' }}
                    >
                      {event.msg}
                    </p>
                    <p
                      className="font-mono text-muted mt-0.5"
                      style={{ fontSize: 10, color: 'rgba(75,112,96,0.5)' }}
                    >
                      {event.timestamp}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Lambda metrics */}
            <div
              className="flex-shrink-0 pt-4 mt-4"
              style={{ borderTop: '1px solid rgba(16,185,129,0.1)' }}
            >
              <p
                className="font-mono text-xs mb-2 tracking-widest"
                style={{ color: 'rgba(75,112,96,0.5)' }}
              >
                LAMBDA METRICS
              </p>
              <div className="grid grid-cols-2 gap-2">
                <div className="stat-card">
                  <p className="font-mono text-xl font-medium text-white">{invokeCount}</p>
                  <p className="font-mono text-muted mt-0.5" style={{ fontSize: 10 }}>
                    invocations
                  </p>
                </div>
                <div className="stat-card">
                  <p className="font-mono text-xl font-medium text-brand">~{avgMs}ms</p>
                  <p className="font-mono text-muted mt-0.5" style={{ fontSize: 10 }}>
                    avg duration
                  </p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  )
}
