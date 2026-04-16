export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/server'
import { HotelActions } from './HotelActions'

export default async function AdminHotelsPage() {
  const supabase = createServiceClient()

  const { data: hotels, error } = await supabase
    .from('hotels')
    .select('id, name, city, state, slug, currency, plan, is_active, check_frequency_mins, created_at')
    .order('created_at', { ascending: true })

  if (error) {
    return <div className="text-red-600">Error loading hotels: {error.message}</div>
  }

  const hotelList = (hotels || []) as Array<{
    id: string; name: string; city: string | null; state: string | null;
    slug: string | null; currency: string; plan: string; is_active: boolean;
    check_frequency_mins: number; created_at: string
  }>

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hotels</h1>
          <p className="text-sm text-gray-500 mt-1">{hotelList.length} client{hotelList.length !== 1 ? 's' : ''} configured</p>
        </div>
        <Link
          href="/admin/hotels/new"
          className="inline-flex items-center justify-center font-medium rounded-lg transition-colors bg-blue-600 text-white hover:bg-blue-700 border border-blue-600 text-sm px-4 h-9"
        >
          + Add Hotel
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hotel</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {hotelList.map((hotel) => (
              <tr key={hotel.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <Link href={`/admin/hotels/${hotel.id}`} className="text-sm font-medium text-blue-600 hover:text-blue-800">
                    {hotel.name}
                  </Link>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {[hotel.city, hotel.state].filter(Boolean).join(', ') || 'â'}
                </td>
                <td className="px-6 py-4">
                  {hotel.slug ? (
                    <a href={`/ratetracker/${hotel.slug}`} target="_blank" rel="noopener noreferrer" className="text-xs bg-gray-100 px-2 py-0.5 rounded text-blue-600 hover:text-blue-800 hover:bg-blue-50 font-mono transition-colors">
                      /ratetracker/{hotel.slug}
                    </a>
                  ) : (
                    <span className="text-xs text-gray-400">Not set</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {hotel.plan}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                    hotel.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {hotel.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <HotelActions hotelId={hotel.id} hotelName={hotel.name} />
                </td>
              </tr>
            ))}
            {hotelList.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                  No hotels yet. Click &quot;Add Hotel&quot; to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
