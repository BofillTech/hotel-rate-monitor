import { createServiceClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const supabase = createServiceClient()
  const { searchParams } = new URL(req.url)
  const hotelId = searchParams.get('hotel_id')

  if (!hotelId) {
    return NextResponse.json({ error: 'hotel_id required' }, { status: 400 })
  }

  // Get all competitor IDs for this hotel
  const { data: competitors, error: compError } = await supabase
    .from('competitors')
    .select('id, name')
    .eq('hotel_id', hotelId)
    .eq('is_active', true)

  if (compError) return NextResponse.json({ error: compError.message }, { status: 500 })
  if (!competitors?.length) return NextResponse.json([])

  const competitorIds = competitors.map((c: { id: string; name: string }) => c.id)

  // Get the hotel name to identify self
  const { data: hotel } = await supabase
    .from('hotels')
    .select('name')
    .eq('id', hotelId)
    .single()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const hotelName = ((hotel as any)?.name || '').toLowerCase().trim()

  // Get 30 days of rate snapshots (BAR only) for all competitors
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const since = thirtyDaysAgo.toISOString().split('T')[0]

  const { data: snapshots, error: snapError } = await supabase
    .from('rate_snapshots')
    .select('competitor_id, check_in_date, rate_amount, scraped_at')
    .in('competitor_id', competitorIds)
    .eq('is_bar', true)
    .gte('scraped_at', since)
    .order('scraped_at', { ascending: true })

  if (snapError) return NextResponse.json({ error: snapError.message }, { status: 500 })

  // Build trend series: latest BAR rate per competitor per scraped day
  const trendMap = new Map<string, Map<string, number>>()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const snap of (snapshots || []) as any[]) {
    const day = (snap.scraped_at as string).split('T')[0]
    const cid = snap.competitor_id as string
    if (!trendMap.has(cid)) trendMap.set(cid, new Map())
    // Keep latest value per day (overwrite as scraped_at is ordered ascending)
    trendMap.get(cid)!.set(day, snap.rate_amount)
  }

  // Build response
  const series = competitors.map((c: { id: string; name: string }) => {
    const isSelf = c.name.toLowerCase().trim() === hotelName
    const dayRates = trendMap.get(c.id) || new Map()
    const data = Array.from(dayRates.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, rate]) => ({ date, rate }))
    return { competitorId: c.id, competitorName: c.name, isSelf, data }
  })

  return NextResponse.json(series)
}
