import { Listing } from '@/types'
import { formatPrice, timeAgo } from '@/utils/format'
import clsx from 'clsx'

interface Props { listing: Listing }

export function PropertyCard({ listing }: Props) {
  return (
    <div className={clsx('property-card p-5', listing.isNew && 'is-new')}>
      <div className="flex items-start justify-between mb-3">
        <span className="font-mono text-xs text-muted">{listing.type}</span>
        <div className="flex items-center gap-2">
          {listing.isNew && <span className="badge-new">JUST LISTED</span>}
          <span className="price-drop-badge">{listing.dropPercent}%</span>
        </div>
      </div>
      <p className="font-display font-semibold text-white text-sm leading-snug mb-3">
        {listing.address}
      </p>
      <div className="flex items-baseline gap-3 mb-4">
        <span className="font-mono font-medium text-white text-xl">
          {formatPrice(listing.price, listing.priceType)}
        </span>
        <span className="font-mono text-sm line-through text-muted">
          {formatPrice(listing.oldPrice, listing.priceType)}
        </span>
      </div>
      <div className="flex items-center justify-between font-mono text-xs text-muted">
        <div className="flex gap-4">
          <span>{listing.beds} beds</span>
          <span>{listing.baths} baths</span>
          <span>{listing.parking} parking</span>
        </div>
        <span>{timeAgo(listing.timestamp)}</span>
      </div>
    </div>
  )
}
