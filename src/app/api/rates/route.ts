import { createServiceClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const supabase = createServiceClient()
  const { searchParams } = new URL(req.url)
  const hotelId = searchParams.get('hotel_id')
  const checkIn = searchParams.get('check_in') || new Date().toISOString().split('T')[0]
  const expanded = searchParams.get('expanded') // competitor_id for room type drill-down

  if (!hotelId) {
    return NextResponse.json({ error: 'hotel_id required' }, { status: 400 })
  }

  if (expanded) {
    // Return all room types for one competitor
    const { data, error } = await supabase
      .rpc('get_room_types', {
        p_competitor_id: expanded,
        p_check_in_date: checkIn
      })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  // Return BAR comparison table
  const { data, error } = await supabase
    .rpc('get_dashboard_rates', {
      p_hotel_id: hotelId,
      p_check_in_date: checkIn
    })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
import { createServerClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const supabase = createServerClient()
  const { searchParams } = new URL(req.url)
  const hotelId = searchParams.get('hotel_id')
  const checkIn = searchParams.get('check_in') || new Date().toISOString().split('T')[0]
  const expanded = searchParams.get('expanded') // competitor_id for room type drill-down

  if (!hotelId) {
    return NextResponse.json({ error: 'hotel_id required' }, { status: 400 })
  }

  if (expanded) {
    // Return all room types for one competitor
    const { data, error } = await supabase
      // @ts-expect-error -- Supabase generic type inference
      .rpc('get_room_types', {
        p_competitor_id: expanded,
        p_check_in_date: checkIn
      })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  // Return BAR comparison table
  const { data, error } = await supabase
    // @ts-expect-error -- Supabase generic type inference
    .rpc('get_dashboard_rates', {
      p_hotel_id: hotelId,
      p_check_in_date: checkIn
    })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
