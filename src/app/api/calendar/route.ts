import { createServiceClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const supabase = createServiceClient()
  const { searchParams } = new URL(req.url)
  const hotelId = searchParams.get('hotel_id')

  if (!hotelId) {
    return NextResponse.json({ error: 'hotel_id required' }, { status: 400 })
  }

  // Get competitors
  const { data: competitors } = await supabase
    .from('competitors')
    .select('id, name')
    .eq('hotel_id', hotelId)
    .eq('is_active', true)

  if (!competitors?.length) return NextResponse.json([])

  const competitorIds = competitors.map((c: { id: string; name: string }) => c.id)

  // Get hotel name for self identification
  const { data: hotel } = await supabase
    .from('hotels')
    .select('name')
    .eq('id', hotelId)
    .single()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const hotelName = ((hotel as any)?.name || '').toLowerCase().trim()

  // Get BAR rates for 30 days forward from today
  const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' })
  const endDate = new Date()
  endDate.setDate(endDate.getDate() + 30)
  const end = endDate.toLocaleDateString('en-CA', { timeZone: 'America/New_York' })

  // Query rate_snapshots for BAR rates grouped by check_in_date and competitor
  const { data: snapshots, error } = await supabase
    .from('rate_snapshots')
    .select('competitor_id, check_in_date, rate_amount, room_type_name, source')
    .in('competitor_id', competitorIds)
    .eq('is_bar', true)
    .gte('check_in_date', today)
    .lte('check_in_date', end)
    .order('check_in_date', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Build calendar data: per date, show your rate + competitor rates
  const dateMap = new Map<string, Array<{
    competitorId: string
    competitorName: string
    isSelf: boolean
    rate: number
    source: string
  }>>()

  const compNameMap = new Map(competitors.map((c: { id: string; name: string }) => [c.id, c.name] as [string, string]))

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const snap of (snapshots || []) as any[]) {
    const date = snap.check_in_date as string
    if (!dateMap.has(date)) dateMap.set(date, [])
    const name = (compNameMap.get(snap.competitor_id) || 'Unknown') as string
    const isSelf = name.toLowerCase().trim() === hotelName

    // Only keep one rate per competitor per date (prefer direct over OTA)
    const existing = dateMap.get(date)!.find(r => r.competitorId === snap.competitor_id)
    if (!existing || (snap.source === 'direct' || snap.source === 'pms_api')) {
      if (existing) {
        Object.assign(existing, { rate: snap.rate_amount, source: snap.source })
      } else {
        dateMap.get(date)!.push({
          competitorId: snap.competitor_id as string,
          competitorName: name,
          isSelf,
          rate: snap.rate_amount,
          source: snap.source
        })
      }
    }
  }

  // Format response
  const calendar = Array.from(dateMap.entries()).map(([date, rates]) => {
    const yourRate = rates.find(r => r.isSelf)?.rate || null
    const compRates = rates.filter(r => !r.isSelf)
    const allCompRates = compRates.map(r => r.rate)
    const marketMin = allCompRates.length ? Math.min(...allCompRates) : null
    const marketMax = allCompRates.length ? Math.max(...allCompRates) : null
    const marketAvg = allCompRates.length
      ? Math.round(allCompRates.reduce((a, b) => a + b, 0) / allCompRates.length)
      : null

    return {
      date,
      yourRate,
      marketMin,
      marketMax,
      marketAvg,
      competitors: compRates.map(r => ({
        name: r.competitorName,
        rate: r.rate,
      }))
    }
  })

  return NextResponse.json(calendar)
}
