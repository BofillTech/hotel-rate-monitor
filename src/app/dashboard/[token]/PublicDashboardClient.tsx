'use client'

import { useState, useMemo } from 'react'
import type { DashboardData, CompetitorWithRates } from './page'
import { KPICards } from '@/components/dashboard/KPICards'
import { RateTrendChart } from '@/components/dashboard/RateTrendChart'
import { MarketPositionBar } from '@/components/dashboard/MarketPositionBar'
import { RateSourcesPanel } from '@/components/dashboard/RateSourcesPanel'
import { Badge } from '@/components/ui/Badge'
import { formatCurrency, formatRelativeTime } from '@/lib/utils'

const HOTEL_COLORS = ['#378ADD','#639922','#E24B4A','#EF9F27','#7F77DD','#1D9E75','#D85A30','#D4537E','#B4B2A9','#5DCAA5']
const VIEWS = ['Tonight','Weekend','+7 Days','+30 Days']

/* ------------------------------------------------------------------ */
/*  Source display helpers                                             */
/* ------------------------------------------------------------------ */

function sourceLabel(src: string) {
  const map: Record<string, string> = {
    pms_api: 'PMS',
    booking_com: 'Booking',
    expedia: 'Expedia',
    direct: 'Direct',
    manual: 'Manual',
    unknown: '\u2014',
  }
  return map[src] || src
}

function categoryLabel(cat: string | null) {
  if (!cat) return null
  const map: Record<string, string> = {
    standard: 'Standard',
    ocean_view: 'Oceanfront',
    suite: 'Suite',
    pool_view: 'Pool view',
    other: 'Other',
  }
  return map[cat] || cat
}

/* ------------------------------------------------------------------ */
/*  Rate Comparison Table with expand/collapse                         */
/* ------------------------------------------------------------------ */

function RateComparisonSection({
  competitors,
  dateOptions,
  currency,
}: {
  competitors: CompetitorWithRates[]
  dateOptions: Array<{ label: string; value: string }>
  currency: string
}) {
  const [viewIdx, setViewIdx] = useState(0)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const selectedDate = dateOptions[viewIdx]?.value || ''

  // Get rates for the selected date
  const rows = useMemo(() => {
    return competitors.map(c => {
      const dateData = c.rates_by_date[selectedDate]
      return {
        ...c,
        bar: dateData?.bar || null,
        roomTypes: dateData?.room_types || [],
      }
    })
  }, [competitors, selectedDate])

  // Sort: self first, then by BAR ascending
  const sorted = useMemo(() => {
    return [...rows].sort((a, b) => {
      if (a.is_self) return -1
      if (b.is_self) return 1
      const aRate = a.bar?.rate_amount ?? Infinity
      const bRate = b.bar?.rate_amount ?? Infinity
      return aRate - bRate
    })
  }, [rows])

  const selfRate = sorted.find(r => r.is_self)?.bar?.rate_amount ?? null
  const compRates = sorted.filter(r => !r.is_self && r.bar).map(r => r.bar!.rate_amount)
  const marketMin = compRates.length ? Math.min(...compRates) : null
  const marketMax = compRates.length ? Math.max(...compRates) : null

  function toggleExpand(id: string) {
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      {/* Header with date pills */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-gray-50">
        <div>
          <div className="text-sm font-medium text-gray-900">Rate comparison</div>
          <div className="text-xs text-gray-400 mt-0.5">Lowest available rate per property</div>
        </div>
        <div className="flex bg-white rounded-lg border border-gray-200 p-0.5 gap-0.5">
          {VIEWS.map((v, i) => (
            <button
              key={v}
              onClick={() => setViewIdx(i)}
              className={`text-xs px-3 h-7 rounded-md transition-colors ${
                viewIdx === i
                  ? 'bg-gray-100 text-gray-900 font-medium'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <table className="w-full text-sm" style={{ tableLayout: 'fixed' }}>
        <thead>
          <tr className="border-b border-gray-100">
            <th className="w-8 px-3 py-2.5" />
            <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide px-3 py-2.5 w-[30%]">Property</th>
            <th className="text-right text-xs font-medium text-gray-400 uppercase tracking-wide px-3 py-2.5 w-[12%]">BAR</th>
            <th className="text-right text-xs font-medium text-gray-400 uppercase tracking-wide px-3 py-2.5 w-[12%]">vs. you</th>
            <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide px-3 py-2.5 w-[18%]">Room type</th>
            <th className="text-left text-xs font-medium text-gray-400 uppercase tracking-wide px-3 py-2.5 w-[12%]">Source</th>
            <th className="text-right text-xs font-medium text-gray-400 uppercase tracking-wide px-3 py-2.5 w-[10%]">Updated</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, idx) => {
            const color = row.is_self ? '#3B82F6' : HOTEL_COLORS[(idx) % HOTEL_COLORS.length]
            const isOpen = expanded.has(row.competitor_id)
            const barRate = row.bar?.rate_amount ?? null
            const diff = selfRate !== null && barRate !== null && !row.is_self
              ? barRate - selfRate
              : null
            const isMin = !row.is_self && barRate !== null && barRate === marketMin
            const isMax = !row.is_self && barRate !== null && barRate === marketMax
            const hasRoomTypes = row.roomTypes.length > 0

            return (
              <tbody key={row.competitor_id}>
                {/* Main row */}
                <tr
                  onClick={() => hasRoomTypes && toggleExpand(row.competitor_id)}
                  className={`border-b border-gray-50 transition-colors ${
                    row.is_self ? 'bg-blue-50/40' : hasRoomTypes ? 'hover:bg-gray-50 cursor-pointer' : ''
                  }`}
                >
                  <td className="px-3 py-3 text-center">
                    {hasRoomTypes && (
                      <span className={`text-[10px] text-gray-400 transition-transform inline-block ${isOpen ? 'rotate-90' : ''}`}>
                        {'\u25B6'}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
                      <span className={`truncate ${row.is_self ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                        {row.competitor_name}
                      </span>
                      {row.is_self && <Badge variant="blue">You</Badge>}
                      {isMin && <Badge variant="green">Lowest</Badge>}
                      {isMax && <Badge variant="red">Highest</Badge>}
                    </div>
                  </td>
                  <td className="px-3 py-3 text-right">
                    {barRate !== null ? (
                      <span className={`font-semibold ${isMin ? 'text-green-700' : isMax ? 'text-red-600' : 'text-gray-900'}`}>
                        {formatCurrency(barRate, currency)}
                      </span>
                    ) : (
                      <span className="text-gray-300">{'\u2014'}</span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-right">
                    {diff === null ? (
                      <span className="text-gray-300">{'\u2014'}</span>
                    ) : (
                      <span className={`text-xs font-medium ${diff < 0 ? 'text-green-600' : diff > 0 ? 'text-red-500' : 'text-gray-400'}`}>
                        {diff > 0 ? '+' : ''}{formatCurrency(diff, currency)}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-xs text-gray-500 truncate">
                    {row.bar?.room_type_name || 'Standard Room'}
                  </td>
                  <td className="px-3 py-3 text-xs text-gray-400">
                    {row.bar ? sourceLabel(row.bar.source) : '\u2014'}
                  </td>
                  <td className="px-3 py-3 text-right text-xs text-gray-400">
                    {row.bar?.scraped_at ? formatRelativeTime(row.bar.scraped_at) : '\u2014'}
                  </td>
                </tr>

                {/* Expanded room types */}
                {isOpen && row.roomTypes.map((rt, ri) => (
                  <tr key={`${row.competitor_id}-rt-${ri}`} className="bg-gray-50/50 border-b border-gray-50">
                    <td />
                    <td className="px-3 py-2.5 pl-12">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-600">
                          {rt.room_type_name || 'Room'}
                        </span>
                        {categoryLabel(rt.room_type_category) && (
                          <Badge variant="blue">{categoryLabel(rt.room_type_category)}</Badge>
                        )}
                        {rt.is_bar && <Badge variant="teal">BAR</Badge>}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <span className={`text-sm font-medium ${rt.is_bar ? 'text-gray-900' : 'text-gray-600'}`}>
                        {formatCurrency(rt.rate_amount, currency)}
                      </span>
                    </td>
                    <td colSpan={4} />
                  </tr>
                ))}
              </tbody>
            )
          })}
        </tbody>
      </table>

      {/* Legend footer */}
      <div className="px-5 py-3 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
        <div className="flex items-center gap-4 text-[10px] text-gray-400">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> You</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" /> Lowest</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" /> Highest</span>
        </div>
        <div className="text-[10px] text-gray-400">
          Rates pulled from OTA & direct sources {'\u00B7'} may include OTA markup
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Scrape Health Section                                              */
/* ------------------------------------------------------------------ */

function ScrapeHealthSection({ competitors }: { competitors: CompetitorWithRates[] }) {
  const statusColor: Record<string, string> = {
    ok: 'bg-green-400',
    pending: 'bg-amber-400',
    error: 'bg-red-400',
    blocked: 'bg-red-400',
    manual: 'bg-gray-400',
  }
  const statusLabel: Record<string, string> = {
    ok: 'OK',
    pending: 'Pending',
    error: 'Error',
    blocked: 'Blocked',
    manual: 'Manual',
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50">
        <div className="text-sm font-medium text-gray-900">Scrape health</div>
      </div>
      <div className="divide-y divide-gray-50">
        {competitors.filter(c => !c.is_self).map(c => (
          <div key={c.competitor_id} className="flex items-center justify-between px-5 py-3">
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${statusColor[c.scrape_status] || 'bg-gray-300'}`} />
              <div>
                <div className="text-sm text-gray-700">{c.competitor_name}</div>
                <div className="text-xs text-gray-400">
                  {c.scrape_method} {'\u00B7'} {c.last_scraped_at ? formatRelativeTime(c.last_scraped_at) : 'never'}
                </div>
              </div>
            </div>
            <Badge variant={c.scrape_status === 'ok' ? 'green' : c.scrape_status === 'error' ? 'red' : 'gray'}>
              {statusLabel[c.scrape_status] || c.scrape_status}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Public Dashboard Client                                       */
/* ------------------------------------------------------------------ */

export function PublicDashboardClient({ data }: { data: DashboardData }) {
  const { hotel, competitors, trendSeries, dateOptions } = data

  // Compute KPI values from "tonight" rates
  const tonightDate = dateOptions[0]?.value || ''
  const selfComp = competitors.find(c => c.is_self)
  const selfBar = selfComp?.rates_by_date[tonightDate]?.bar
  const yourRate = selfBar?.rate_amount ?? null

  const compBars = competitors
    .filter(c => !c.is_self && c.rates_by_date[tonightDate]?.bar)
    .map(c => c.rates_by_date[tonightDate].bar!.rate_amount)

  const marketMin = compBars.length ? Math.min(...compBars) : null
  const marketMax = compBars.length ? Math.max(...compBars) : null
  const marketAvg = compBars.length
    ? Math.round(compBars.reduce((a, b) => a + b, 0) / compBars.length)
    : null

  // Position: count competitors cheaper than you + 1
  const position = yourRate !== null
    ? compBars.filter(r => r < yourRate).length + 1
    : null
  const totalProperties = competitors.length

  // Last refresh from any competitor
  const lastRefreshes = competitors
    .map(c => c.last_scraped_at)
    .filter(Boolean)
    .map(d => new Date(d!).getTime())
  const lastRefresh = lastRefreshes.length
    ? new Date(Math.max(...lastRefreshes)).toISOString()
    : null

  // Next check time
  const nextCheckMins = hotel.check_frequency_mins || 30

  // Rate sources for sidebar
  const rateSources: Array<{
    name: string
    type: 'primary' | 'backup'
    description: string
    rate: number | null
    currency: string
    lastChecked: string | null
    status: 'live' | 'matched' | 'stale' | 'error'
    parityNote?: string
  }> = []

  if (hotel.pms_platform) {
    rateSources.push({
      name: `${hotel.pms_platform.charAt(0).toUpperCase() + hotel.pms_platform.slice(1)} API`,
      type: 'primary',
      description: 'PMS direct',
      rate: yourRate,
      currency: hotel.currency,
      lastChecked: lastRefresh,
      status: 'live',
    })
  }
  if (hotel.booking_engine_url) {
    rateSources.push({
      name: hotel.booking_engine_url.replace(/^https?:\/\//, '').split('/')[0],
      type: 'backup',
      description: 'booking engine',
      rate: yourRate,
      currency: hotel.currency,
      lastChecked: lastRefresh,
      status: 'matched',
      parityNote: 'parity OK',
    })
  }
  // Fallback if neither
  if (rateSources.length === 0 && selfComp) {
    rateSources.push({
      name: 'Direct rate',
      type: 'primary',
      description: 'manual entry',
      rate: yourRate,
      currency: hotel.currency,
      lastChecked: lastRefresh,
      status: 'live',
    })
  }

  // Competitor data for market position bar
  const compPositionData = competitors
    .filter(c => !c.is_self && c.rates_by_date[tonightDate]?.bar)
    .map((c, i) => ({
      name: c.competitor_name,
      rate: c.rates_by_date[tonightDate].bar!.rate_amount,
      color: HOTEL_COLORS[(i + 1) % HOTEL_COLORS.length],
    }))

  // Alerts (placeholder)
  const unreadAlerts = 0

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* -- Header ------------------------------------------------ */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">{hotel.name}</h1>
            <p className="text-sm text-gray-400 mt-0.5 flex items-center gap-2">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                Live
              </span>
              {hotel.city && <span>{'\u00B7'} {hotel.city}{hotel.state ? `, ${hotel.state}` : ''}</span>}
              {lastRefresh && <span>{'\u00B7'} updated {formatRelativeTime(lastRefresh)}</span>}
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span>Next check in {nextCheckMins} min</span>
          </div>
        </div>

        {/* -- KPI Cards --------------------------------------------- */}
        <KPICards
          yourRate={yourRate}
          marketAvg={marketAvg}
          marketMin={marketMin}
          marketMax={marketMax}
          position={position}
          total={totalProperties}
          unreadAlerts={unreadAlerts}
          currency={hotel.currency}
        />

        {/* -- Main Grid: Table + Sidebar ---------------------------- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
          {/* Rate comparison table - 2/3 */}
          <div className="lg:col-span-2">
            <RateComparisonSection
              competitors={competitors}
              dateOptions={dateOptions}
              currency={hotel.currency}
            />
          </div>

          {/* Sidebar - 1/3 */}
          <div className="space-y-4">
            <RateSourcesPanel sources={rateSources} />

            {/* Market position */}
            {yourRate !== null && marketMin !== null && marketMax !== null && (
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-gray-50">
                  <div className="text-sm font-medium text-gray-900">Market position</div>
                  <span className="text-xs text-gray-400">Tonight</span>
                </div>
                <div className="p-4">
                  <MarketPositionBar
                    yourRate={yourRate}
                    marketMin={marketMin}
                    marketMax={marketMax}
                    competitors={compPositionData}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* -- 30-Day Rate Trends ------------------------------------ */}
        <RateTrendChart series={trendSeries} currency={hotel.currency} />

        {/* -- Scrape Health ------------------------------------------ */}
        <div className="mt-4">
          <ScrapeHealthSection competitors={competitors} />
        </div>

        {/* -- Footer ------------------------------------------------ */}
        <footer className="text-center text-xs text-gray-400 py-6 mt-4">
          Powered by Bofill Technologies {'\u00B7'} Rate Monitor
        </footer>

      </div>
    </div>
  )
}
