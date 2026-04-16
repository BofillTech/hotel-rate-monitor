import { NextResponse, NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

// PUT /api/admin/competitors/[id]
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const body = await req.json()
    const supabase = createServiceClient()

    const { data, error } = await supabase
      .from('competitors')
      .update({
        name: body.name?.trim(),
        scrape_method: body.scrape_method || 'auto',
        ota_booking_url: body.ota_booking_url || null,
        ota_expedia_url: body.ota_expedia_url || null,
        booking_engine_url: body.booking_engine_url || null,
        is_active: body.is_active ?? true,
        sort_order: body.sort_order ?? 0,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Admin competitor PUT error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('Admin competitor PUT unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/admin/competitors/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const supabase = createServiceClient()
    const { error } = await supabase.from('competitors').delete().eq('id', id)

    if (error) {
      console.error('Admin competitor DELETE error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Admin competitor DELETE unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
