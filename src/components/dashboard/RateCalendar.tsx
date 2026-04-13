'use client'
import { useState } from 'react'
import { CalendarDay } from '@/hooks/useRateCalendar'
import { formatCurrency } from '@/lib/utils'

interface RateCalendarProps {
  days: CalendarDay[]
  loading?: boolean
  currency?: string
}

function getHeatColor(rate: number, min: number, max: number): string {
  if (max === min) return '#e5e7eb'
  const t = (rate - min) / (max - min) // 0 = cheapest (green), 1 = most expensive (red)
  // Green â Yellow â Red
  if (t < 0.5) {
    const g = Math.round(180 + (220 - 180) * (t * 2))
    const r = Math.round(34 + (234 - 34) * (t * 2))
    return `rgb(${r}, ${g}, 60)`
  } else {
    const r = Math.round(234 + (220 - 234) * ((t - 0.5) * 2))
    const g = Math.round(220 - (220 - 80) * ((t - 0.5) * 2))
    return `rgb(${r}, ${g}, 50)`
  }
}

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function RateCalendar({ days, loading, currency = 'USD' }: RateCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50">
          <div className="text-sm font-medium text-gray-900">Rate calendar -- next 30 days</div>
        </div>
        <div className="h-56 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (!days.length) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50">
          <div className="text-sm font-medium text-gray-900">Rate calendar -- next 30 days</div>
        </div>
        <div className="py-8 text-center text-sm text-gray-400">No rate data available</div>
      </div>
    )
  }

  // Calculate global min/max for heatmap
  const allRates = days.flatMap(d => [d.yourRate, d.marketMin, d.marketMax].filter(Boolean) as number[])
  const globalMin = Math.min(...allRates)
  const globalMax = Math.max(...allRates)

  // Build calendar grid
  const dayMap = new Map(days.map(d => [d.date, d]))
  const firstDate = new Date(days[0].date + 'T12:00:00')
  const startDow = firstDate.getDay()

  // Selected day detail
  const selected = selectedDate ? dayMap.get(selectedDate) : null

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-gray-50">
        <div>
          <div className="text-sm font-medium text-gray-900">Rate calendar -- next 30 days</div>
          <div className="text-xs text-gray-400 mt-0.5">Your BAR by date - click any date to compare</div>
        </div>
        <div className="flex items-center gap-3 text-[10px] text-gray-400">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded" style={{ background: getHeatColor(globalMin, globalMin, globalMax) }} />
            <span>{formatCurrency(globalMin, currency)}</span>
          </div>
          <div className="w-12 h-2 rounded-full" style={{
            background: `linear-gradient(to right, ${getHeatColor(globalMin, globalMin, globalMax)}, ${getHeatColor((globalMin + globalMax) / 2, globalMin, globalMax)}, ${getHeatColor(globalMax, globalMin, globalMax)})`
          }} />
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded" style={{ background: getHeatColor(globalMax, globalMin, globalMax) }} />
            <span>{formatCurrency(globalMax, currency)}</span>
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* Day-of-week headers */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {DAY_NAMES.map(d => (
            <div key={d} className="text-center text-[10px] font-medium text-gray-400 py-1">{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells before first day */}
          {Array.from({ length: startDow }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}

          {days.map(day => {
            const dt = new Date(day.date + 'T12:00:00')
            const dayNum = dt.getDate()
            const isToday = day.date === new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' })
            const isSelected = day.date === selectedDate
            const isWeekend = dt.getDay() === 0 || dt.getDay() === 6
            const rate = day.yourRate

            return (
              <button
                key={day.date}
                onClick={() => setSelectedDate(isSelected ? null : day.date)}
                className={`aspect-square rounded-lg flex flex-col items-center justify-center transition-all relative ${
                  isSelected
                    ? 'ring-2 ring-blue-500 ring-offset-1'
                    : 'hover:ring-1 hover:ring-gray-300'
                }`}
                style={{
                  background: rate ? getHeatColor(rate, globalMin, globalMax) : '#f9fafb',
                  opacity: rate ? 1 : 0.4,
                }}
              >
                <span className={`text-[10px] font-medium ${
                  rate ? 'text-white' : 'text-gray-400'
                } ${isToday ? 'underline' : ''}`}
                  style={{ textShadow: rate ? '0 1px 2px rgba(0,0,0,0.3)' : 'none' }}
                >
                  {dayNum}
                </span>
                {rate && (
                  <span className="text-[9px] text-white font-medium"
                    style={{ textShadow: '0 1px 2px rgba(0,0,0,0.3)' }}>
                    ${Math.round(rate)}
                  </span>
                )}
                {isWeekend && (
                  <div className="absolute top-0.5 right-0.5 w-1 h-1 bg-white/50 rounded-full" />
                )}
              </button>
            )
          })}
        </div>

        {/* Selected date detail panel */}
        {selected && (
          <div className="mt-4 border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm font-medium text-gray-900">
                {new Date(selected.date + 'T12:00:00').toLocaleDateString('en-US', {
                  weekday: 'long', month: 'long', day: 'numeric'
                })}
              </div>
              <button
                onClick={() => setSelectedDate(null)}
                className="text-xs text-gray-400 hover:text-gray-600"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-4 gap-3 mb-3">
              <div className="bg-white rounded-lg p-2.5 border border-gray-100">
                <div className="text-[10px] text-gray-400 uppercase tracking-wide">Your rate</div>
                <div className="text-lg font-semibold text-gray-900 mt-0.5">
                  {selected.yourRate ? formatCurrency(selected.yourRate, currency) : 'â'}
                </div>
              </div>
              <div className="bg-white rounded-lg p-2.5 border border-gray-100">
                <div className="text-[10px] text-gray-400 uppercase tracking-wide">Market avg</div>
                <div className="text-lg font-semibold text-gray-900 mt-0.5">
                  {selected.marketAvg ? formatCurrency(selected.marketAvg, currency) : 'â'}
                </div>
              </div>
              <div className="bg-white rounded-lg p-2.5 border border-gray-100">
                <div className="text-[10px] text-gray-400 uppercase tracking-wide">Mkt low</div>
                <div className="text-lg font-semibold text-green-600 mt-0.5">
                  {selected.marketMin ? formatCurrency(selected.marketMin, currency) : 'â'}
                </div>
              </div>
              <div className="bg-white rounded-lg p-2.5 border border-gray-100">
                <div className="text-[10px] text-gray-400 uppercase tracking-wide">Mkt high</div>
                <div className="text-lg font-semibold text-red-500 mt-0.5">
                  {selected.marketMax ? formatCurrency(selected.marketMax, currency) : 'â'}
                </div>
              </div>
            </div>

            {/* Competitor breakdown */}
            <div className="space-y-1.5">
              {selected.competitors.map((comp, i) => {
                const diff = selected.yourRate ? comp.rate - selected.yourRate : null
                return (
                  <div key={i} className="flex items-center justify-between py-1.5 px-2.5 bg-white rounded border border-gray-100">
                    <span className="text-xs text-gray-600">{comp.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-medium text-gray-900">{formatCurrency(comp.rate, currency)}</span>
                      {diff !== null && (
                        <span className={`text-[10px] font-medium ${diff < 0 ? 'text-green-600' : diff > 0 ? 'text-red-500' : 'text-gray-400'}`}>
                          {diff > 0 ? '+' : ''}{formatCurrency(diff, currency)}
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
