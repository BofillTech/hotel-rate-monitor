import { NextResponse, NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

// GET /api/admin/hotels/[id]
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('hotels')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Hotel not found' }, { status: 404 })
    }
    return NextResponse.json(data)
  } catch (err) {
    console.error('Admin hotel GET error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/admin/hotels/[id]
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const body = await req.json()
    const supabase = createServiceClient()

    // Check slug uniqueness if changing
    if (body.slug) {
      const { data: existing } = await supabase
        .from('hotels')
        .select('id')
        .eq('slug', body.slug)
        .neq('id', id)
        .maybeSingle()

      if (existing) {
        return NextResponse.json({ error: `Slug "${body.slug}" is already taken` }, { status: 409 })
      }
    }

    const { data, error } = await supabase
      .from('hotels')
      .update({
        name: body.name,
        city: body.city || null,
        state: body.state || null,
        country: body.country || 'US',
        slug: body.slug || null,
        currency: body.currency || 'USD',
        plan: body.plan || 'starter',
        pms_platform: body.pms_platform || null,
        booking_engine_url: body.booking_engine_url || null,
        check_frequency_mins: body.check_frequency_mins || 60,
        is_active: body.is_active ?? true,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Admin hotel PUT error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('Admin hotel PUT unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/admin/hotels/[id]
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const supabase = createServiceClient()

    // Delete competitors first (cascade)
    await supabase.from('competitors').delete().eq('hotel_id', id)

    // Delete the hotel
    const { error } = await supabase.from('hotels').delete().eq('id', id)

    if (error) {
      console.error('Admin hotel DELETE error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Admin hotel DELETE unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
