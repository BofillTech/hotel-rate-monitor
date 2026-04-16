import { createServiceClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function CompetitorsPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = createServiceClient()

  const { data: hotel } = await supabase
    .from('hotels')
    .select('id, name')
    .eq('slug', slug)
    .single()

  if (!hotel) notFound()
  const hotelId = (hotel as any).id

  const { data: competitors } = await supabase
    .from('competitors')
    .select('id, name, scrape_method, scrape_status, last_scraped_at, is_active')
    .eq('hotel_id', hotelId)
    .order('sort_order', { ascending: true })

  const compList = (competitors || []) as Array<{
    id: string; name: string; scrape_method: string;
    scrape_status: string; last_scraped_at: string | null; is_active: boolean
  }>

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Competitors</h1>
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Scraped</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Active</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {compList.map((c) => (
              <tr key={c.id}>
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{c.name}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{c.scrape_method}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                    c.scrape_status === 'ok' ? 'bg-green-100 text-green-800' :
                    c.scrape_status === 'error' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {c.scrape_status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {c.last_scraped_at ? new Date(c.last_scraped_at).toLocaleString() : '—'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{c.is_active ? 'Yes' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
