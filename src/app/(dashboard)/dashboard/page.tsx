'use client'
import { useState } from 'react'
import { useHotel } from '@/hooks/useHotel'
import { useRates, fetchRoomTypes } from '@/hooks/useRates'
import { useRateTrends } from '@/hooks/useRateTrends'
import { useRateCalendar } from '@/hooks/useRateCalendar'
import { useAlerts, useDismissAlert } from '@/hooks/useAlerts'
import { KPICards } from '@/components/dashboard/KPICards'
import { AlertBanner } from '@/components/dashboard/AlertBanner'
import { RateTable } from '@/components/dashboard/RateTable'
import { MarketPositionBar } from '@/components/dashboard/MarketPositionBar'
import { RateTrendChart } from '@/components/dashboard/RateTrendChart'
import { RateCalendar } from '@/components/dashboard/RateCalendar'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { formatRelativeTime } from '@/lib/utils'

const COLORS = ['#378ADD','#639922','#E24B4A','#EF9F27','#7F77DD','#1D9E75']

export default function DashboardPage() {
  const [checkIn, setCheckIn] = useState<string | undefined>()
  const [activeView, setActiveView] = useState(0)
  const { data: hotel } = useHotel()
  const { data: rates = [], isLoading: ratesLoading, refetch } = useRates(hotel?.id, checkIn)
  const { data: alerts = [] } = useAlerts(hotel?.id)
  const { data: trendSeries = [], isLoading: trendsLoading } = useRateTrends(hotel?.id)
  const { data: calendarDays = [], isLoading: calendarLoading } = useRateCalendar(hotel?.id)
  const dismissAlert = useDismissAlert()

  const yourRate = rates.find(r => r.is_your_hotel)
  const compRates = rates.filter(r => !r.is_your_hotel)
  const compRateAmounts = compRates.map(r => r.rate_amount)
  const marketMin = compRateAmounts.length ? Math.min(...compRateAmounts) : 0
  const marketMax = compRateAmounts.length ? Math.max(...compRateAmounts) : 0
  const marketAvg = compRateAmounts.length
    ? Math.round(compRateAmounts.reduce((a, b) => a + b, 0) / compRateAmounts.length)
    : 0

  const sortedRates = [...compRates].sort((a, b) => a.rate_amount - b.rate_amount)
  const yourPosition = yourRate
    ? sortedRates.filter(r => r.rate_amount < yourRate.rate_amount).length + 1
    : null

  const unreadAlerts = alerts.filter(a => !a.dismissed_at)
  const lastUpdate = rates.length
    ? formatRelativeTime(new Date(Math.max(...rates.map(r => new Date(r.scraped_at).getTime()).filter(Boolean))).toISOString())
    : null

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">{hotel?.name || 'Your Hotel'}</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {lastUpdate ? `Updated ${lastUpdate}` : ratesLoading ? 'Loading...' : 'No rate data yet'}
            {hotel?.city && ` Â· ${hotel.city}, ${hotel.state}`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => window.location.href = '/alerts'}>
            {unreadAlerts.length > 0 && (
              <span className="w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center mr-1.5">
                {unreadAlerts.length}
              </span>
            )}
            Alerts
          </Button>
          <Button variant="primary" size="sm" onClick={() => refetch()}>Refresh now</Button>
        </div>
      </div>

      {/* Alert banners */}
      <AlertBanner
        alerts={unreadAlerts.slice(0, 2)}
        onDismiss={(id) => dismissAlert.mutate(id)}
      />

      {/* KPI cards */}
      <KPICards
        yourRate={yourRate?.rate_amount || null}
        marketAvg={marketAvg || null}
        marketMin={marketMin || null}
        marketMax={marketMax || null}
        position={yourPosition}
        total={rates.length}
        unreadAlerts={unreadAlerts.length}
        currency={hotel?.currency}
      />

      {/* Main content grid */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        {/* Rate table â 2/3 width */}
        <div className="col-span-2">
          <RateTable
            rates={rates}
            onExpandCompetitor={(id, date) => fetchRoomTypes(id, date)}
            onViewChange={(idx, date) => { setActiveView(idx); setCheckIn(date) }}
            loading={ratesLoading}
            activeView={activeView}
          />
        </div>

        {/* Right column â 1/3 width */}
        <div className="space-y-4">
          {/* Your rate sources */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50">
              <div className="text-sm font-medium text-gray-900">Your rate sources</div>
            </div>
            <div className="p-4 space-y-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs font-medium text-gray-700">
                  {hotel?.pms_platform ? hotel.pms_platform.charAt(0).toUpperCase() + hotel.pms_platform.slice(1) : 'PMS'} API
                </div>
                <div className="text-xs text-gray-400 mt-0.5">Backup Â· direct</div>
                <div className="text-lg font-semibold text-gray-900 mt-1">
                  {yourRate ? `$${yourRate.rate_amount}` : 'â'}
                </div>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  <span className="text-[10px] text-gray-400">Live</span>
                </div>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs font-medium text-gray-700">Booking engine</div>
                <div className="text-xs text-gray-400 mt-0.5">Primary Â· direct URL</div>
                <div className="text-lg font-semibold text-gray-900 mt-1">
                  {yourRate ? `$${yourRate.rate_amount}` : 'â'}
                </div>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  <span className="text-[10px] text-gray-400">Parity OK</span>
                </div>
              </div>
            </div>
          </div>

          {/* Market position */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50">
              <div className="text-sm font-medium text-gray-900">Market position</div>
            </div>
            <div className="p-4">
              {yourRate && marketMin && marketMax ? (
                <MarketPositionBar
                  yourRate={yourRate.rate_amount}
                  marketMin={marketMin}
                  marketMax={marketMax}
                  competitors={compRates.map((r, i) => ({
                    name: r.competitor_name,
                    rate: r.rate_amount,
                    color: COLORS[i % COLORS.length]
                  }))}
                />
              ) : (
                <div className="text-sm text-gray-400 py-4 text-center">No rate data yet</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Trend chart + Calendar â full width */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="col-span-2">
          <RateTrendChart
            series={trendSeries}
            loading={trendsLoading}
          />
        </div>
        <div>
          <RateCalendar
            days={calendarDays}
            loading={calendarLoading}
            currency={hotel?.currency}
          />
        </div>
      </div>
    </div>
  )
}
