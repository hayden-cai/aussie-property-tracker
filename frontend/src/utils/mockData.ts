import { Listing, Subscription, Report } from '@/types'

export const MOCK_LISTINGS: Listing[] = [
  { listingId:'m1', suburb:'Richmond',    address:'15 Chapel Street, Richmond VIC 3121',       price:572,     priceType:'rent', oldPrice:610,    dropPercent:-6.2, beds:2, baths:1, parking:1, type:'Apartment', region:'Melbourne', isNew:false, timestamp:'2026-03-30T09:02:00Z' },
  { listingId:'m2', suburb:'Fitzroy',     address:'88 Smith Street, Fitzroy VIC 3065',          price:595,     priceType:'rent', oldPrice:640,    dropPercent:-7.0, beds:2, baths:1, parking:0, type:'Apartment', region:'Melbourne', isNew:false, timestamp:'2026-03-30T08:48:00Z' },
  { listingId:'m3', suburb:'Box Hill',    address:'3 Station Street, Box Hill VIC 3128',        price:1180000, priceType:'buy',  oldPrice:1250000,dropPercent:-5.6, beds:3, baths:2, parking:2, type:'House',     region:'Melbourne', isNew:false, timestamp:'2026-03-30T08:30:00Z' },
  { listingId:'m4', suburb:'South Yarra', address:'44 Domain Road, South Yarra VIC 3141',       price:720,     priceType:'rent', oldPrice:760,    dropPercent:-5.3, beds:2, baths:2, parking:1, type:'Apartment', region:'Melbourne', isNew:false, timestamp:'2026-03-30T07:55:00Z' },
  { listingId:'m5', suburb:'Collingwood', address:'7 Johnston Street, Collingwood VIC 3066',    price:1420000, priceType:'buy',  oldPrice:1500000,dropPercent:-5.3, beds:4, baths:2, parking:2, type:'House',     region:'Melbourne', isNew:false, timestamp:'2026-03-30T07:20:00Z' },
  { listingId:'m6', suburb:'Carlton',     address:'204 Lygon Street, Carlton VIC 3053',         price:490,     priceType:'rent', oldPrice:520,    dropPercent:-5.8, beds:1, baths:1, parking:0, type:'Unit',      region:'Melbourne', isNew:false, timestamp:'2026-03-30T06:50:00Z' },
]

export const MOCK_SUBSCRIPTIONS: Subscription[] = [
  { subscriptionId:'s1', suburb:'Richmond',    propertyType:'Apartment', listingType:'rent', maxPrice:600,  minBeds:2, minBaths:1, priority:'high', active:true,  createdAt:'2026-03-01T00:00:00Z', alertCount:3 },
  { subscriptionId:'s2', suburb:'Box Hill',    propertyType:'House',     listingType:'buy',  maxPrice:1300000, minBeds:3, minBaths:2, priority:'low', active:true, createdAt:'2026-03-05T00:00:00Z', alertCount:1 },
  { subscriptionId:'s3', suburb:'Fitzroy',     propertyType:'Apartment', listingType:'rent', maxPrice:650,  minBeds:2, minBaths:1, priority:'high', active:true,  createdAt:'2026-03-10T00:00:00Z', alertCount:0 },
  { subscriptionId:'s4', suburb:'South Yarra', propertyType:'Apartment', listingType:'rent', maxPrice:800,  minBeds:2, minBaths:1, priority:'low',  active:false, createdAt:'2026-03-15T00:00:00Z', alertCount:0 },
]

export const MOCK_REPORTS: Report[] = [
  { reportId:'r1', type:'Weekly suburb analysis', format:'pdf', dateFrom:'2026-03-23', dateTo:'2026-03-29', status:'ready', filename:'weekly_suburb_2026-03-29.pdf', size:'284 KB', createdAt:'2026-03-29T18:00:00Z' },
  { reportId:'r2', type:'My alert history',        format:'csv', dateFrom:'2026-03-01', dateTo:'2026-03-29', status:'ready', filename:'alert_history_2026-03-29.csv', size:'38 KB',  createdAt:'2026-03-29T12:00:00Z' },
]

// New listings injected by simulated WebSocket push
export const NEW_LISTING_POOL: Listing[] = [
  { listingId:'n1', suburb:'Richmond',    address:'12 Swan Street, Richmond VIC 3121',     price:558, priceType:'rent', oldPrice:600, dropPercent:-7.0, beds:2, baths:1, parking:1, type:'Apartment', region:'Melbourne', isNew:true, timestamp:'' },
  { listingId:'n2', suburb:'Fitzroy',     address:'33 Brunswick Street, Fitzroy VIC 3065', price:580, priceType:'rent', oldPrice:620, dropPercent:-6.5, beds:2, baths:1, parking:0, type:'Apartment', region:'Melbourne', isNew:true, timestamp:'' },
  { listingId:'n3', suburb:'Carlton',     address:'99 Elgin Street, Carlton VIC 3053',     price:510, priceType:'rent', oldPrice:545, dropPercent:-6.4, beds:2, baths:1, parking:0, type:'Unit',      region:'Melbourne', isNew:true, timestamp:'' },
]
