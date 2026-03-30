// ── Auth ──────────────────────────────────────────────────────────────────
export interface OTPRequestPayload  { phone: string }
export interface OTPVerifyPayload   { phone: string; code: string }
export interface AuthResponse       { token: string }

// ── Property / Listing ────────────────────────────────────────────────────
export type ListingType    = 'rent' | 'buy'
export type PropertyType   = 'Apartment' | 'House' | 'Townhouse' | 'Unit'
export type AlertPriority  = 'high' | 'low'

export interface Listing {
  listingId:   string
  suburb:      string
  address:     string
  price:       number        // weekly rent OR purchase price
  priceType:   ListingType
  oldPrice:    number
  dropPercent: number
  beds:        number
  baths:       number
  parking:     number
  type:        PropertyType
  region:      string
  isNew:       boolean
  timestamp:   string        // ISO 8601
}

// ── Subscription ──────────────────────────────────────────────────────────
export interface Subscription {
  subscriptionId: string
  suburb:         string
  propertyType:   PropertyType
  listingType:    ListingType
  maxPrice:       number
  minBeds:        number
  minBaths:       number
  priority:       AlertPriority
  active:         boolean
  createdAt:      string
  alertCount:     number
}

export type NewSubscription = Omit<Subscription, 'subscriptionId' | 'createdAt' | 'alertCount'>

// ── Reports ───────────────────────────────────────────────────────────────
export type ReportFormat = 'pdf' | 'csv'
export type ReportStatus = 'processing' | 'ready' | 'error'

export interface Report {
  reportId:    string
  type:        string
  format:      ReportFormat
  dateFrom:    string
  dateTo:      string
  status:      ReportStatus
  filename:    string
  size?:       string
  downloadUrl?: string
  createdAt:   string
}

// ── WebSocket message shapes ──────────────────────────────────────────────
export type WSMessageType = 'listing_alert' | 'report_ready' | 'pong'

export interface WSMessage {
  type:    WSMessageType
  payload: Listing | Report | { timestamp: string }
}
