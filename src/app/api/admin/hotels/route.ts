import { NextResponse, NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

// GET /api/admin/hotels â list all hotels
export async function GET() {
  try {
    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('hotels')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json(data)
  } catch (err) {
    console.error('Admin hotels GET error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/admin/hotels â create a new hotel
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const supabase = createServiceClient()

    // Check slug uniqueness
    if (body.slug) {
      const { data: existing } = await supabase
        .from('hotels')
        .select('id')
        .eq('slug', body.slug)
        .maybeSingle()

      if (existing) {
        return NextResponse.json({ error: `Slug "${body.slug}" is already taken` }, { status: 409 })
      }
    }

    const { data, error } = await supabase
      .from('hotels')
      .insert({
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
      })
      .select()
      .single()

    if (error) {
      console.error('Admin hotels POST error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (err) {
    console.error('Admin hotels POST unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
