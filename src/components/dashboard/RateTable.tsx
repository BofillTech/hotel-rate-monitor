'use client'
import { useState } from 'react'
import { DashboardRate, RoomTypeRate } from '@/lib/types'
import { formatCurrency, formatRelativeTime } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'

const HOTEL_COLORS = ['#378ADD','#639922','#E24B4A','#EF9F27','#7F77DD','#1D9E75','#D85A30','#D4537E','#B4B2A9','#5DCAA5']
const VIEWS = ['Tonight','Weekend','+7 days','+30 days']

interface RateTableProps {
  rates: DashboardRate[]
  onExpandCompetitor: (id: string, date: string) => Promise<RoomTypeRate[]>
  loading?: boolean
}

export function RateTable({ rates, onExpandCompetitor, loading }: RateTableProps) {
  const [view, setView] = useState(0)
  const [expanded, setExpanded] = useState<Record<string, RoomTypeRate[]>>({})
  const [expanding, setExpanding] = useState<string | null>(null)

  const allRates = rates.filter(r => !r.is_your_hotel).map(r => r.rate_amount)
  const marketMin = allRates.length ? Math.min(...allRates) : 0
  const marketMax = allRates.length ? Math.max(...allRates) : 0

  async function toggleExpand(competitorId: string) {
    if (expanded[competitorId]) {
      const next = { ...expanded }
      delete next[competitorId]
      setExpanded(next)
      return
    }
    setExpanding(competitorId)
    const rooms = await onExpandCompetitor(competitorId, new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' }))
    setExpanded(prev => ({ ...prev, [competitorId]: rooms }))
    setExpanding(null)
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-gray-50">
        <div>
          <div className="text-sm font-medium text-gray-900">Rate comparison</div>
          <div className="text-xs text-gray-400 mt-0.5">BAR shown — click any row to expand room types</div>
        </div>
        <div className="flex bg-white rounded-lg border border-gray-200 p-0.5 gap-0.5">
          {VIEWS.map((v, i) => (
            <button
              key={v}
              onClick={() => setView(i)}
              className={`text-xs px-3 h-7 rounded-md transition-colors ${
                view === i
                  ? 'bg-gray-100 text-gray-900 font-medium'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      <table className="w-full text-sm" style={{ tableLayout: 'fixed' }}>
        <thead>
          <tr className="border-b border-gray-100">
            <th className="w-8 px-3 py-2.5" />
            <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide px-3 py-2.5 w-[32%]">Property</th>
            <th className="text-right text-xs font-medium text-gray-400 uppercase tracking-wide px-3 py-2.5 w-[13%]">BAR</th>
            <th className="text-right text-xs font-medium text-gray-400 uppercase tracking-wide px-3 py-2.5 w-[13%]">vs. you</th>
            <th className="text-right text-xs font-medium text-gray-400 uppercase tracking-wide px-3 py-2.5 w-[20%]">Room type</th>
            <th className="text-right text-xs font-medium text-gray-400 uppercase tracking-wide px-3 py-2.5 w-[13%]">Source</th>
            <th className="text-right text-xs font-medium text-gray-400 uppercase tracking-wide px-3 py-2.5 w-[9%]">Updated</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <tr key={i} className="border-b border-gray-50 animate-pulse">
                <td className="px-3 py-3" />
                <td className="px-3 py-3"><div className="h-4 bg-gray-100 rounded w-3/4" /></td>
                <td className="px-3 py-3"><div className="h-4 bg-gray-100 rounded w-12 ml-auto" /></td>
                <td className="px-3 py-3"><div className="h-4 bg-gray-100 rounded w-10 ml-auto" /></td>
                <td className="px-3 py-3"><div className="h-4 bg-gray-100 rounded w-20 ml-auto" /></td>
                <td className="px-3 py-3"><div className="h-4 bg-gray-100 rounded w-14 ml-auto" /></td>
                <td className="px-3 py-3"><div className="h-4 bg-gray-100 rounded w-8 ml-auto" /></td>
              </tr>
            ))
          ) : (
            [...rates].sort((a, b) => a.rate_amount - b.rate_amount).map((rate, idx) => {
              const color = HOTEL_COLORS[idx % HOTEL_COLORS.length]
              const isMin = !rate.is_your_hotel && rate.rate_amount === marketMin
              const isMax = !rate.is_your_hotel && rate.rate_amount === marketMax
              const yourRate = rates.find(r => r.is_your_hotel)?.rate_amount || 0
              const diff = rate.is_your_hotel ? null : rate.rate_amount - yourRate
              const isOpen = expanded[rate.competitor_id]
              const isLoading = expanding === rate.competitor_id

              return (
                <>
                  <tr
                    key={rate.competitor_id}
                    onClick={() => toggleExpand(rate.competitor_id)}
                    className={`border-b border-gray-50 transition-colors cursor-pointer ${
                      rate.is_your_hotel
                        ? 'bg-blue-50/50 hover:bg-blue-50/70'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <td className="px-3 py-3 text-center">
                      <span className={`text-[10px] text-gray-400 transition-transform inline-block ${isOpen ? 'rotate-90' : ''}`}>
                        ▶
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                        <span className={`truncate ${rate.is_your_hotel ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
                          {rate.competitor_name}
                        </span>
                        {rate.is_your_hotel && <Badge variant="blue">You</Badge>}
                        {isMin && <Badge variant="green">Lowest</Badge>}
                        {isMax && <Badge variant="red">Highest</Badge>}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-right">
                      <span className={`font-semibold ${isMin ? 'text-green-700' : isMax ? 'text-red-600' : 'text-gray-900'}`}>
                        {formatCurrency(rate.rate_amount)}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-right">
                      {diff === null ? (
                        <span className="text-gray-300">—</span>
                      ) : (
                        <span className={`text-xs font-medium ${diff < 0 ? 'text-green-600' : 'text-red-500'}`}>
                          {diff > 0 ? '+' : ''}{formatCurrency(diff)}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-right text-xs text-gray-400 truncate">
                      {rate.room_type_name || '—'}
                    </td>
                    <td className="px-3 py-3 text-right text-xs text-gray-300">{rate.source}</td>
                    <td className="px-3 py-3 text-right text-xs text-gray-300">
                      {formatRelativeTime(rate.scraped_at)}
                    </td>
                  </tr>
                  {isLoading && (
                    <tr key={`${rate.competitor_id}-loading`} className="bg-gray-50">
                      <td colSpan={7} className="px-8 py-3">
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <div className="w-3 h-3 border border-gray-300 border-t-blue-500 rounded-full animate-spin" />
                          Loading room types...
                        </div>
                      </td>
                    </tr>
                  )}
                  {isOpen && expanded[rate.competitor_id]?.map((room, ri) => (
                    <tr key={`${rate.competitor_id}-room-${ri}`} className="bg-white border-b border-gray-50">
                      <td />
                      <td className="px-3 py-2.5 pl-10">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-600">{room.room_type_name || 'Room type'}</span>
                          {room.is_bar && <Badge variant="teal">BAR</Badge>}
                        </div>
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <span className={`text-sm font-medium ${room.is_bar ? 'text-green-700' : 'text-gray-700'}`}>
                          {formatCurrency(room.rate_amount)}
                        </span>
                      </td>
                      <td />
                      <td />
                      <td className="px-3 py-2.5 text-right">
                        {room.source && (
                          <span className="text-xs text-gray-400">{room.source === 'direct' ? 'Direct' : room.source === 'booking_com' ? 'Booking' : room.source}</span>
                        )}
                      </td>
                      <td />
                    </tr>
                  ))}
                </>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}
