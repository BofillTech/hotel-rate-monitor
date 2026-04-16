import { NextResponse, NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

// POST /api/admin/competitors â create a new competitor
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const supabase = createServiceClient()

    if (!body.hotel_id) {
      return NextResponse.json({ error: 'hotel_id is required' }, { status: 400 })
    }
    if (!body.name?.trim()) {
      return NextResponse.json({ error: 'Competitor name is required' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('competitors')
      .insert({
        hotel_id: body.hotel_id,
        name: body.name.trim(),
        scrape_method: body.scrape_method || 'auto',
        ota_booking_url: body.ota_booking_url || null,
        ota_expedia_url: body.ota_expedia_url || null,
        booking_engine_url: body.booking_engine_url || null,
        is_active: body.is_active ?? true,
        sort_order: body.sort_order ?? 0,
        scrape_status: 'pending',
      })
      .select()
      .single()

    if (error) {
      console.error('Admin competitors POST error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    console.error('Admin competitors POST unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
