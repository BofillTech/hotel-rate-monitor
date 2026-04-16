export const dynamic = 'force-dynamic'

import { createServiceClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { HotelForm } from '../HotelForm'
import { CompetitorsList } from './CompetitorsList'

export default async function EditHotelPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = createServiceClient()

  const { data: hotel, error } = await supabase
    .from('hotels')
    .select('id, name, city, state, country, slug, currency, plan, pms_platform, booking_engine_url, check_frequency_mins, is_active')
    .eq('id', id)
    .single()

  if (error || !hotel) notFound()

  const { data: competitors } = await supabase
    .from('competitors')
    .select('id, name, scrape_method, scrape_status, last_scraped_at, is_active, sort_order, ota_booking_url, ota_expedia_url, booking_engine_url, consecutive_failures, scrape_error')
    .eq('hotel_id', id)
    .order('sort_order', { ascending: true })

  return (
    <div>
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/admin" className="hover:text-blue-600">Hotels</Link>
        <span>/</span>
        <span className="text-gray-900">{(hotel as any).name}</span>
      </div>

      <div className="space-y-8">
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Hotel Details</h2>
          <HotelForm hotel={hotel as any} />
        </section>

        <section>
          <CompetitorsList hotelId={id} competitors={(competitors || []) as any[]} />
        </section>
      </div>
    </div>
  )
}

