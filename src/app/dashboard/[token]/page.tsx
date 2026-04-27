export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/server'
import { PublicDashboardClient } from './PublicDashboardClient'
import { buildDashboardData } from '@/lib/dashboard-data'
import type { DashboardData } from '@/lib/dashboard-data'

// Re-export types so any existing imports from this file still work
export type { CompetitorWithRates, TrendSeries, TrendPoint, DashboardData } from '@/lib/dashboard-data'

/* ------------------------------------------------------------------ */
/*  Server component                                                   */
/* ------------------------------------------------------------------ */

export default async function PublicDashboardPage({
  params,
}: {
  params: Promise<{ token: string }>
}) {
  const { token } = await params
  const supabase = createServiceClient()

  /* 1. Validate token */
  const { data: link } = await (supabase as any)
    .from('dashboard_links')
    .select('hotel_id, is_active')
    .eq('token', token)
    .single()

  if (!link || !link.is_active) notFound()

  /* 2. Get hotel */
  const { data: hotel } = await (supabase as any)
    .from('hotels')
    .select('id, name, city, state, currency, pms_platform, booking_engine_url, check_frequency_mins')
    .eq('id', link.hotel_id)
    .single()

  if (!hotel) notFound()

  /* 3. Build all dashboard data from shared utility */
  const dashboardData = await buildDashboardData(hotel, supabase as any)

  return <PublicDashboardClient data={dashboardData} />
}
