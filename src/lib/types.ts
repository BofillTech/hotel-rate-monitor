export type Json = string | number | boolean | null |
  { [key: string]: Json | undefined } | Json[]

export type HotelPlan = 'free' | 'starter' | 'pro' | 'enterprise' | 'suspended'
export type ScrapeMethod = 'auto' | 'pms_api' | 'ota_booking' | 'ota_expedia' | 'direct' | 'manual'
export type ScrapeStatus = 'pending' | 'ok' | 'error' | 'blocked' | 'manual'
export type AlertType = 'price_drop' | 'price_rise' | 'you_are_priciest' |
  'you_are_cheapest' | 'availability_change' | 'scrape_failure' | 'parity_issue'
export type RateSource = 'pms_api' | 'booking_com' | 'expedia' | 'direct' | 'manual' | 'unknown'
export type RoomTypeCategory = 'standard' | 'ocean_view' | 'suite' | 'pool_view' | 'other'

export interface Hotel {
  id: string
  org_id: string
  name: string
  city: string | null
  state: string | null
  country: string
  timezone: string
  currency: string
  pms_api_url: string | null
  pms_platform: string | null
  booking_engine_url: string | null
  plan: HotelPlan
  max_competitors: number
  check_frequency_mins: number
  settings: HotelSettings
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface HotelSettings {
  alert_threshold_pct: number
  alert_threshold_abs: number
  notify_email: boolean
  notify_sms: boolean
  notify_webhook: boolean
  webhook_url: string | null
  default_nights: number
}

export interface Competitor {
  id: string
  hotel_id: string
  name: string
  pms_api_url: string | null
  ota_booking_url: string | null
  ota_expedia_url: string | null
  booking_engine_url: string | null
  scrape_method: ScrapeMethod
  is_active: boolean
  sort_order: number
  last_scraped_at: string | null
  scrape_status: ScrapeStatus
  scrape_error: string | null
  consecutive_failures: number
  created_at: string
  updated_at: string
}

export interface RateSnapshot {
  id: number
  competitor_id: string
  hotel_id: string
  check_in_date: string
  nights: number
  rate_amount: number
  currency: string
  room_type_name: string | null
  room_type_category: RoomTypeCategory | null
  is_bar: boolean
  availability: boolean
  rooms_left: number | null
  source: RateSource
  source_url: string | null
  scraped_at: string
}

export interface Alert {
  id: string
  hotel_id: string
  competitor_id: string | null
  alert_type: AlertType
  check_in_date: string | null
  old_rate: number | null
  new_rate: number | null
  your_rate: number | null
  change_pct: number | null
  room_type_name: string | null
  notification_sent: boolean
  dismissed_at: string | null
  snoozed_until: string | null
  created_at: string
}

// Dashboard query result types
export interface DashboardRate {
  competitor_id: string
  competitor_name: string
  rate_amount: number
  currency: string
  room_type_name: string | null
  source: RateSource
  scraped_at: string
  availability: boolean
  is_your_hotel: boolean
}

export interface RoomTypeRate {
  room_type_name: string | null
  room_type_category: RoomTypeCategory | null
  rate_amount: number
  is_bar: boolean
  scraped_at: string
}

export interface MarketSummary {
  hotel_id: string
  check_in_date: string
  market_min: number
  market_max: number
  market_avg: number
  competitor_count: number
  last_updated: string
}

export interface RateTrend {
  competitor_id: string
  scraped_date: string
  min_rate: number
  max_rate: number
  avg_rate: number
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRecord = Record<string, any>

export type Database = {
  public: {
    Tables: {
      organizations: { Row: AnyRecord; Insert: AnyRecord; Update: AnyRecord }
      hotels: { Row: Hotel; Insert: AnyRecord; Update: AnyRecord }
      users: { Row: AnyRecord; Insert: AnyRecord; Update: AnyRecord }
      competitors: { Row: Competitor; Insert: AnyRecord; Update: AnyRecord }
      rate_snapshots: { Row: RateSnapshot; Insert: AnyRecord; Update: AnyRecord }
      alerts: { Row: Alert; Insert: AnyRecord; Update: AnyRecord }
      scrape_jobs: { Row: AnyRecord; Insert: AnyRecord; Update: AnyRecord }
    }
    Views: AnyRecord
    Functions: {
      get_dashboard_rates: {
        Args: { p_hotel_id: string; p_check_in_date: string }
        Returns: DashboardRate[]
      }
      get_room_types: {
        Args: { p_competitor_id: string; p_check_in_date: string }
        Returns: RoomTypeRate[]
      }
    }
  }
}
