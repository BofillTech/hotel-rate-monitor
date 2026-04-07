import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) redirect('/login')

  const { data: hotel } = await supabase
    .from('hotels')
    .select('*')
    .eq('org_id', session.user.id)
    .single()

  return (
    <main className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">
          {hotel?.name || 'Your Hotel'}
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Rate Monitor Dashboard
        </p>
      </div>
      <p className="text-gray-500 text-sm">
        Dashboard components load here. Connect RateTable, KPICards,
        and RateTrendChart components once data is flowing from N8n.
      </p>
    </main>
  )
}
