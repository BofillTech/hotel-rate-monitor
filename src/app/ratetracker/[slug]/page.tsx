export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/server'
import { PublicDashboardClient } from '@/app/dashboard/[token]/PublicDashboardClient'
import type { CompetitorWithRates, TrendSeries, TrendPoint, DashboardData } from '@/app/dashboard/[token]/page'

/* ------------------------------------------------------------------ */
/*  Server component — resolves slug instead of token                  */
/* ------------------------------------------------------------------ */

export default async function RateTrackerDashboard({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = createServiceClient()

  /* 1. Resolve slug → hotel */
  const { data: hotel } = await (supabase as any)
    .from('hotels')
    .select('id, name, city, state, currency, pms_platform, booking_engine_url, check_frequency_mins')
    .eq('slug', slug)
    .single()

  if (!hotel) notFound()
  const hotelId = hotel.id

  /* 2. Get competitors */
  const { data: competitors } = await (supabase as any)
    .from('competitors')
    .select('id, hotel_id, name, is_active, scrape_status, scrape_method, last_scraped_at, consecutive_failures, scrape_error')
    .eq('hotel_id', hotelId)
    .eq('is_active', true)
    .order('sort_order')

  const comps = competitors || []

  /* 3. Date options */
  const today = new Date()
  const fmt = (d: Date) => d.toISOString().split('T')[0]
  const addDays = (d: Date, n: number) => {
    const r = new Date(d); r.setDate(r.getDate() + n); return r
  }
  const dayOfWeek = today.getDay()
  const daysUntilSat = dayOfWeek === 6 ? 0 : (6 - dayOfWeek)
  const dateOptions = [
    { label: 'Tonight', value: fmt(today) },
    { label: 'Weekend', value: fmt(addDays(today, daysUntilSat)) },
    { label: '+7 Days', value: fmt(addDays(today, 7)) },
    { label: '+30 Days', value: fmt(addDays(today, 30)) },
  ]
  const checkInDates = dateOptions.map(d => d.value)

  /* 4. Get rate snapshots for all check-in dates */
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

  /* Detect self-competitor */
  const hotelNameNorm = hotel.name.toLowerCase().trim()

  /* Build competitor data with rates_by_date */
  const competitorsWithRates: CompetitorWithRates[] = comps.map((c: any) => {
    const isSelf = c.name.toLowerCase().trim() === hotelNameNorm

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

  /* 5. Get 30-day trend data */
  const thirtyDaysAgo = fmt(addDays(today, -30))

  /* Query: for each of the last 30 days, find the BAR (lowest) rate
     where check_in_date == scraped_at date (i.e. "tonight" rate on that day).
     This gives a clean apples-to-apples trend across competitors.
     Fallback: also include rates where check_in_date is within 1 day of
     scraped_at to catch scrapes that ran slightly before/after midnight. */
  const { data: trendSnaps } = await (supabase as any)
    .from('rate_snapshots')
    .select('competitor_id, check_in_date, rate_amount, scraped_at, is_bar')
    .in('competitor_id', competitorIds)
    .gte('scraped_at', thirtyDaysAgo)
    .order('scraped_at', { ascending: true })
    .limit(5000)

  const allTrends = trendSnaps || []

  /* Build trend series — use only "tonight" rates (check_in == scrape day)
     and prefer BAR-flagged rates. For each competitor per scrape-day,
     keep the lowest rate to represent their market position that day. */
  const trendMap = new Map<string, Map<string, number>>()
  for (const snap of allTrends) {
    const scrapeDay = (snap as any).scraped_at.split('T')[0]
    const checkIn = (snap as any).check_in_date
    const cid = (snap as any).competitor_id
    const rate = (snap as any).rate_amount

    // Only include rates where check_in_date matches the scrape day
    // (±1 day to handle overnight scrapes)
    const scrapeDayMs = new Date(scrapeDay).getTime()
    const checkInMs = new Date(checkIn).getTime()
    const dayDiff = Math.abs(checkInMs - scrapeDayMs) / (1000 * 60 * 60 * 24)
    if (dayDiff > 1) continue

    if (!trendMap.has(cid)) trendMap.set(cid, new Map())
    const existing = trendMap.get(cid)!.get(scrapeDay)
    // Keep the lowest rate per competitor per day (BAR behavior)
    if (existing === undefined || rate < existing) {
      trendMap.get(cid)!.set(scrapeDay, rate)
    }
  }

  const trendSeries: TrendSeries[] = comps.map((c: any) => {
    const isSelf = c.name.toLowerCase().trim() === hotelNameNorm
    const dayRates = trendMap.get(c.id) || new Map()
    const data: TrendPoint[] = Array.from(dayRates.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, rate]) => ({ date, rate }))
    return { competitorId: c.id, competitorName: c.name, isSelf, data }
  })

  /* 6. Assemble dashboard data */
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
