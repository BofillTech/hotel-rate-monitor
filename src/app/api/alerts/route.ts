import { createServerClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const supabase = createServerClient()
  const { searchParams } = new URL(req.url)
  const hotelId = searchParams.get('hotel_id')
  const unreadOnly = searchParams.get('unread') === 'true'

  if (!hotelId) {
    return NextResponse.json({ error: 'hotel_id required' }, { status: 400 })
  }

  let query = supabase
    .from('alerts')
    .select('*, competitors(name)')
    .eq('hotel_id', hotelId)
    .order('created_at', { ascending: false })
    .limit(50)

  if (unreadOnly) query = query.is('dismissed_at', null)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PATCH(req: NextRequest) {
  const supabase = createServerClient()
  const { alert_id, action } = await req.json()

  if (action === 'dismiss') {
    const { error } = await supabase
      .from('alerts')
      .update({ dismissed_at: new Date().toISOString() })
      .eq('id', alert_id)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
