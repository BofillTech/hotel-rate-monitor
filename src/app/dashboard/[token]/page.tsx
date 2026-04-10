export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/server'
import { PublicDashboardClient } from './PublicDashboardClient'

/* ------------------------------------------------------------------ */
/*  Types for data we pass to the client                              */
/* ------------------------------------------------------------------ */

export interface CompetitorWithRates {
  competitor_id: string
  competitor_name: string
  is_self: boolean
  scrape_status: string
  scrape_method: string
  last_scraped_at: string | null
  consecutive_failures: number
  scrape_error: string | null
  rates_by_date: Record<string, {
    bar: {
      rate_amount: number
      room_type_name: string | null
      room_type_category: string | null
      source: string
      scraped_at: string
      availability: boolean
    } | null
    room_types: Array<{
      room_type_name: string | null
      room_type_category: string | null
      rate_amount: number
      is_bar: boolean
      source: string
      scraped_at: string
    }>
  }>
}

export interface TrendPoint {
  date: string
  rate: number
}

export interface TrendSeries {
  competitorId: string
  competitorName: string
  isSelf: boolean
  data: TrendPoint[]
}

export interface DashboardData {
  hotel: {
    id: string
    name: string
    city: string | null
    state: string | null
    currency: string
    pms_platform: string | null
    booking_engine_url: string | null
    check_frequency_mins: number
  }
  competitors: CompetitorWithRates[]
  trendSeries: TrendSeries[]
  dateOptions: Array<{ label: string; value: string }>
}

/* ------------------------------------------------------------------ */
/*  Server component                                                  */
/* ------------------------------------------------------------------ */

export default async function PublicDashboardPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const supabase = createServiceClient()

  /* 1. Validate token */
  const { data: link } = await (supabase as any)
    .from('dashboard_links')
    .select('hotel_id, is_active')
    .eq('token', token)
    .single()

  if (!link || !link.is_active) notFound()

  const hotelId = link.hotel_id

  /* 2. Get hotel */
  const { data: hotel } = await (supabase as any)
    .from('hotels')
    .select('id, name, city, state, currency, pms_platform, booking_engine_url, check_frequency_mins')
    .eq('id', hotelId)
    .single()

  if (!hotel) notFound()

  /* 3. Get competitors */
  const { data: competitors } = await (supabase as any)
    .from('competitors')
    .select('id, hotel_id, name, is_active, scrape_status, scrape_method, last_scraped_at, consecutive_failures, scrape_error')
    .eq('hotel_id', hotelId)
    .eq('is_active', true)
    .order('sort_order')

  const comps = competitors || []

  /* 4. Date options */
  const today = new Date()
  const fmt = (d: Date) => d.toISOString().split('T')[0]
  const addDays = (d: Date, n: number) => { const r = new Date(d); r.setDate(r.getDate() + n); return r }
  const dayOfWeek = today.getDay()
  const daysUntilSat = dayOfWeek === 6 ? 0 : (6 - dayOfWeek)

  const dateOptions = [
    { label: 'Tonight',  value: fmt(today) },
    { label: 'Weekend',  value: fmt(addDays(today, daysUntilSat)) },
    { label: '+7 Days',  value: fmt(addDays(today, 7)) },
    { label: '+30 Days', value: fmt(addDays(today, 30)) },
  ]

  const checkInDates = dateOptions.map(d => d.value)

  /* 5. Get rate snapshots for all check-in dates */
  const competitorIds = comps.map((c: any) => c.id)
  const { data: snapshots } = await (supabase as any)
    .from('rate_snapshots')
    .select('competitor_id, check_in_date, rate_amount, room_type_name, room_type_category, is_bar, availability, source, scraped_at')
    .in('competitor_id', competitorIds)
    .in('check_in_date', checkInDates)
    .order('scraped_at', { ascending: false })

  const allSnaps = snapshots || []

  /* Deduplicate: latest per competitor|date|room_type */
  const seen = new Map<string, boolean>()
  const deduped = allSnaps.filter((s: any) => {
    const key = `${s.competitor_id}|${s.check_in_date}|${s.room_type_name || '_null_'}`
    if (seen.has(key)) return false
    seen.set(key, true)
    return true
  })

  /* Build competitor data with rates_by_date */
  const competitorsWithRates: CompetitorWithRates[] = comps.map((c: any) => {
    const isSelf = c.name.toLowerCase().trim() === hotel.name.toLowerCase().trim()
    const ratesByDate: CompetitorWithRates['rates_by_date'] = {}

    for (const dateOpt of dateOptions) {
      const dateSnaps = deduped.filter(
        (s: any) => s.competitor_id === c.id && s.check_in_date === dateOpt.value
      )
      const roomTypes = dateSnaps.map((s: any) => ({
        room_type_name: s.room_type_name,
        room_type_category: s.room_type_category,
        rate_amount: s.rate_amount,
        is_bar: s.is_bar,
        source: s.source,
        scraped_at: s.scraped_at,
      }))
      const barSnap = dateSnaps.find((s: any) => s.is_bar) || (dateSnaps.length === 1 ? dateSnaps[0] : null)

      ratesByDate[dateOpt.value] = {
        bar: barSnap ? {
          rate_amount: barSnap.rate_amount,
          room_type_name: barSnap.room_type_name,
          room_type_category: barSnap.room_type_category,
          source: barSnap.source,
          scraped_at: barSnap.scraped_at,
          availability: barSnap.availability,
        } : null,
        room_types: roomTypes,
      }
    }

    return {
      competitor_id: c.id,
      competitor_name: c.name,
      is_self: isSelf,
      scrape_status: c.scrape_status || 'pending',
      scrape_method: c.scrape_method || 'auto',
      last_scraped_at: c.last_scraped_at,
      consecutive_failures: c.consecutive_failures || 0,
      scrape_error: c.scrape_error,
      rates_by_date: ratesByDate,
    }
  })

  /* 6. Get 30-day trend data */
  const thirtyDaysAgo = fmt(addDays(today, -30))
  const { data: trendSnaps } = await (supabase as any)
    .from('rate_snapshots')
    .select('competitor_id, check_in_date, rate_amount, scraped_at')
    .in('competitor_id', competitorIds)
    .gte('scraped_at', thirtyDaysAgo)
    .order('scraped_at', { ascending: true })

  const allTrends = trendSnaps || []

  /* Build trend series: latest rate per competitor per day */
  const trendMap = new Map<string, Map<string, number>>()
  for (const snap of allTrends) {
    const day = (snap as any).scraped_at.split('T')[0]
    const cid = (snap as any).competitor_id
    if (!trendMap.has(cid)) trendMap.set(cid, new Map())
    trendMap.get(cid)!.set(day, (snap as any).rate_amount)
  }

  const trendSeries: TrendSeries[] = comps.map((c: any) => {
    const isSelf = c.name.toLowerCase().trim() === hotel.name.toLowerCase().trim()
    const dayRates = trendMap.get(c.id) || new Map()
    const data: TrendPoint[] = Array.from(dayRates.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, rate]) => ({ date, rate }))
    return {
      competitorId: c.id,
      competitorName: c.name,
      isSelf,
      data,
    }
  })

  /* 7. Assemble dashboard data */
  const dashboardData: DashboardData = {
    hotel: {
      id: hotel.id,
      name: hotel.name,
      city: hotel.city,
      state: hotel.state,
      currency: hotel.currency,
      pms_platform: hotel.pms_platform,
      booking_engine_url: hotel.booking_engine_url,
      check_frequency_mins: hotel.check_frequency_mins || 30,
    },
    competitors: competitorsWithRates,
    trendSeries,
    dateOptions,
  }

  return <PublicDashboardClient data={dashboardData} />
}
