export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/server'
import { PublicDashboardClient } from '@/app/dashboard/[token]/PublicDashboardClient'
import { buildDashboardData } from '@/lib/dashboard-data'
import type { CompetitorWithRates, TrendSeries, TrendPoint, DashboardData } from '@/lib/dashboard-data'

// Re-export types so any existing imports from this file still work
export type { CompetitorWithRates, TrendSeries, TrendPoint, DashboardData }

/* ------------------------------------------------------------------ */
/*  Server component — resolves slug instead of token                  */
/* ------------------------------------------------------------------ */

export default async function RateTrackerDashboard({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = createServiceClient()

  /* 1. Resolve slug → hotel */
  const { data: hotel } = await (supabase as any)
    .from('hotels')
    .select('id, name, city, state, currency, pms_platform, booking_engine_url, check_frequency_mins')
    .eq('slug', slug)
    .single()

  if (!hotel) notFound()

  /* 2. Build all dashboard data from shared utility */
  const dashboardData = await buildDashboardData(hotel, supabase as any)

  return <PublicDashboardClient data={dashboardData} />
}
