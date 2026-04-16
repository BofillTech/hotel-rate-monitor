import { createServiceClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = createServiceClient()
  const { data: hotel } = await (supabase as any)
    .from('hotels')
    .select('name')
    .eq('slug', slug)
    .single()

  const hotelName = hotel?.name || 'Rate Tracker'

  return {
    title: `${hotelName} | Rate Tracker`,
    description: `Rate monitoring dashboard for ${hotelName}`,
  }
}

export default async function RateTrackerLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = createServiceClient()

  // Validate slug exists
  const { data: hotel } = await (supabase as any)
    .from('hotels')
    .select('id')
    .eq('slug', slug)
    .single()

  if (!hotel) notFound()

  return <>{children}</>
}
