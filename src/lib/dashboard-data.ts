/**
 * Shared dashboard data assembly logic.
 *
 * Both /[slug]/page.tsx and /dashboard/[token]/page.tsx import from here
 * so room-type normalisation, categorisation, filtering, and data shaping
 * live in exactly ONE place.
 */

/* ------------------------------------------------------------------ */
/*  Types                                                              */
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

export interface TrendPoint { date: string; rate: number }

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
/*  Room type name normalisation                                       */
/* ------------------------------------------------------------------ */

const OTA_NAMES = new Set([
  'Official Site','Google Hotels','Priceline','Orbitz',
  'Travelocity','KAYAK','Trivago','Hotwire','Wego',
  'eDreams','Snaptravel','Prestigia','Decolar','Skyscanner',
  'HotelsCombined','Qantas Hotels','Room','Agoda',
  'Super','CheapTickets','Hotels','Expedia',
])

function normalizeRoomType(name: string | null | undefined): string {
  if (!name || name.trim() === '') return 'Standard Room'
  if (name.includes('.') && !name.includes(' ') && name.length < 30) return 'Standard Room'
  if (OTA_NAMES.has(name)) return 'Standard Room'
  if (/^(Free cancellation|Pay at the|Book now|Price dropped|Member price|Price match|\d+% off)/i.test(name)) return 'Standard Room'
  return name
}

/** Returns true if the raw DB room_type_name is a real room name (not a placeholder). */
function hasRealRoomName(name: string | null | undefined): boolean {
  return normalizeRoomType(name) !== 'Standard Room'
}

/* ------------------------------------------------------------------ */
/*  Room type categorisation                                           */
/* ------------------------------------------------------------------ */

function categorizeRoom(name: string): string {
  const lower = name.toLowerCase()
  if (lower.includes('penthouse')) return 'penthouse'
  if (lower.includes('villa') || lower.includes('cottage') || lower.includes('bungalow') || lower.includes('casita')) return 'villa'
  if (lower.includes('suite')) return 'suite'
  if (lower.includes('studio')) return 'studio'
  if (lower.includes('ocean') || lower.includes('sea') || lower.includes('beach') || lower.includes('waterfront') || lower.includes('oceanfront')) return 'oceanfront'
  if (lower.includes('pool')) return 'pool_view'
  if (lower.includes('garden')) return 'garden_view'
  if (lower.includes('deluxe') || lower.includes('premier') || lower.includes('superior')) return 'deluxe'
  return 'standard'
}

const CATEGORY_LABELS: Record<string, string> = {
  standard: 'Standard Room',
  deluxe: 'Deluxe Room',
  suite: 'Suite',
  penthouse: 'Penthouse',
  villa: 'Villa / Cottage',
  studio: 'Studio',
  oceanfront: 'Oceanfront',
  pool_view: 'Pool View',
  garden_view: 'Garden View',
}

type RoomTypeEntry = {
  room_type_name: string | null
  room_type_category: string | null
  rate_amount: number
  is_bar: boolean
  source: string
  scraped_at: string
}

/** Group room types by category, keep only the BAR (lowest rate) per category. */
function groupRoomTypesByCategory(roomTypes: RoomTypeEntry[]): RoomTypeEntry[] {
  if (roomTypes.length <= 1) return roomTypes

  const groups = new Map<string, RoomTypeEntry[]>()
  for (const rt of roomTypes) {
    const cat = categorizeRoom(rt.room_type_name || 'Standard Room')
    if (!groups.has(cat)) groups.set(cat, [])
    groups.get(cat)!.push(rt)
  }

  const result: RoomTypeEntry[] = []
  const catOrder = ['standard', 'deluxe', 'studio', 'oceanfront', 'pool_view', 'garden_view', 'suite', 'villa', 'penthouse']
  const sortedCats = Array.from(groups.keys()).sort((a, b) => {
    const ai = catOrder.indexOf(a)
    const bi = catOrder.indexOf(b)
    return (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi)
  })

  for (const cat of sortedCats) {
    const items = groups.get(cat)!
    items.sort((a, b) => a.rate_amount - b.rate_amount)
    const best = items[0]
    const count = items.length
    result.push({
      ...best,
      room_type_name: count > 1
        ? `${CATEGORY_LABELS[cat] || cat} (from $${best.rate_amount.toLocaleString()})`
        : best.room_type_name,
      room_type_category: cat,
    })
  }

  return result
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const fmt = (d: Date) => d.toISOString().split('T')[0]

const addDays = (d: Date, n: number) => {
  const r = new Date(d)
  r.setDate(r.getDate() + n)
  return r
}

/* ------------------------------------------------------------------ */
/*  Main: build dashboard data from a hotel record + supabase client   */
/* ------------------------------------------------------------------ */

/**
 * Given a hotel row (already fetched) and a Supabase service client,
 * fetch competitors, rate snapshots, and trend data, then return the
 * fully assembled DashboardData object.
 */
export async function buildDashboardData(
  hotel: {
    id: string
    name: string
    city: string | null
    state: string | null
    currency: string
    pms_platform: string | null
    booking_engine_url: string | null
    check_frequency_mins: number
  },
  supabase: any,
): Promise<DashboardData> {

  /* 1. Get competitors */
  const { data: competitors } = await supabase
    .from('competitors')
    .select('id, hotel_id, name, is_active, scrape_status, scrape_method, last_scraped_at, consecutive_failures, scrape_error')
    .eq('hotel_id', hotel.id)
    .eq('is_active', true)
    .order('sort_order')

  const comps = competitors || []

  /* 2. Date options */
  const today = new Date()
  const dayOfWeek = today.getDay()
  const daysUntilSat = dayOfWeek === 6 ? 0 : (6 - dayOfWeek)
  const dateOptions = [
    { label: 'Tonight', value: fmt(today) },
    { label: 'Weekend', value: fmt(addDays(today, daysUntilSat)) },
    { label: '+7 Days', value: fmt(addDays(today, 7)) },
    { label: '+30 Days', value: fmt(addDays(today, 30)) },
  ]
  const checkInDates = dateOptions.map(d => d.value)

  /* 3. Get rate snapshots for all check-in dates */
  const competitorIds = comps.map((c: any) => c.id)
  const { data: snapshots } = await supabase
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
      // Filter out entries with no real room name (null, OTA source names, etc.)
      // then normalize the remaining real names
      const rawRoomTypes = dateSnaps
        .filter((s: any) => hasRealRoomName(s.room_type_name))
        .map((s: any) => ({
          room_type_name: normalizeRoomType(s.room_type_name),
          room_type_category: s.room_type_category,
          rate_amount: s.rate_amount,
          is_bar: s.is_bar,
          source: s.source,
          scraped_at: s.scraped_at,
        }))
      // Group by category to collapse 40+ entries into ~5 categories
      const roomTypes = groupRoomTypesByCategory(rawRoomTypes)
      const barSnap = dateSnaps.find((s: any) => s.is_bar) || (dateSnaps.length === 1 ? dateSnaps[0] : null)

      // Fallback: if we have a BAR rate but no real room type names were found
      // (common with google_hotels which returns null room_type_name),
      // inject the BAR as a room type entry so the UI always has something to show.
      if (roomTypes.length === 0 && barSnap) {
        const barName = normalizeRoomType(barSnap.room_type_name)
        const barCat = categorizeRoom(barName)
        roomTypes.push({
          room_type_name: barName,
          room_type_category: barCat,
          rate_amount: barSnap.rate_amount,
          is_bar: true,
          source: barSnap.source,
          scraped_at: barSnap.scraped_at,
        })
      }

      // Second fallback: if we have rate snapshots but neither a BAR nor real room names,
      // use the lowest-priced snapshot so the property still shows an expandable row.
      if (roomTypes.length === 0 && dateSnaps.length > 0) {
        const sorted = [...dateSnaps].sort((a: any, b: any) => a.rate_amount - b.rate_amount)
        const lowest = sorted[0]
        const lowName = normalizeRoomType(lowest.room_type_name)
        const lowCat = categorizeRoom(lowName)
        roomTypes.push({
          room_type_name: lowName,
          room_type_category: lowCat,
          rate_amount: lowest.rate_amount,
          is_bar: false,
          source: lowest.source,
          scraped_at: lowest.scraped_at,
        })
      }

      ratesByDate[dateOpt.value] = {
        bar: barSnap ? {
          rate_amount: barSnap.rate_amount,
          room_type_name: normalizeRoomType(barSnap.room_type_name),
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

  /* 4. Get 30-day trend data */
  const thirtyDaysAgo = fmt(addDays(today, -30))

  const { data: trendSnaps } = await supabase
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

  /* 5. Assemble dashboard data */
  return {
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
}
