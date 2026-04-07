export const SCRAPE_METHODS = [
  { value: 'auto',        label: 'Auto (recommended)' },
  { value: 'ota_booking', label: 'Booking.com' },
  { value: 'ota_expedia', label: 'Expedia' },
  { value: 'direct',      label: 'Direct booking engine' },
  { value: 'pms_api',     label: 'PMS API' },
  { value: 'manual',      label: 'Manual entry' },
]

export const RATE_VIEWS = [
  { value: 'tonight',  label: 'Tonight' },
  { value: 'weekend',  label: 'Weekend' },
  { value: '7d',       label: '+7 days' },
  { value: '30d',      label: '+30 days avg' },
]

export const CHECK_FREQUENCIES = [
  { value: 30,  label: 'Every 30 minutes' },
  { value: 60,  label: 'Every 60 minutes' },
  { value: 120, label: 'Every 2 hours' },
  { value: 240, label: 'Every 4 hours' },
]

export const PMS_PLATFORMS = [
  { value: 'cloudbeds',    label: 'Cloudbeds' },
  { value: 'mews',         label: 'Mews' },
  { value: 'synxis',       label: 'SynXis (Sabre)' },
  { value: 'opera',        label: 'Opera Cloud' },
  { value: 'little_hotel', label: 'Little Hotelier' },
  { value: 'webrezpro',    label: 'WebRezPro' },
  { value: 'other',        label: 'Other' },
]

export const ALERT_TYPES = {
  price_drop:       { label: 'Competitor price drops',   color: 'blue' },
  price_rise:       { label: 'Competitor price rises',   color: 'amber' },
  you_are_priciest: { label: 'You become highest priced', color: 'red' },
  you_are_cheapest: { label: 'You become lowest priced',  color: 'green' },
  scrape_failure:   { label: 'Scrape failure',            color: 'gray' },
  parity_issue:     { label: 'Rate parity issue',         color: 'purple' },
}

export const ROOM_CATEGORIES = [
  { value: 'standard',   label: 'Standard' },
  { value: 'ocean_view', label: 'Ocean view' },
  { value: 'suite',      label: 'Suite' },
  { value: 'pool_view',  label: 'Pool view' },
  { value: 'other',      label: 'Other' },
]
