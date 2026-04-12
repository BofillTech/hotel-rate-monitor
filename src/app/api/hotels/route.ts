import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = createServiceClient()

    // For now, return the first active hotel (single-hotel setup)
    const { data, error } = await supabase
      .from('hotels')
      .select('*')
      .eq('is_active', true)
      .limit(1)
      .single()

    if (error) {
      console.error('Hotels API error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch hotel' },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { error: 'No hotel found' },
        { status: 404 }
      )
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('Hotels API unexpected error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
