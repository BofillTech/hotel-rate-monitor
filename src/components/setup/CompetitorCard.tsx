'use client'

import { useState } from 'react'
import { Competitor, ScrapeMethod } from '@/lib/types'
import { SCRAPE_METHODS } from '@/lib/constants'
import { formatRelativeTime } from '@/lib/utils'

interface CompetitorCardProps {
  competitor: Competitor
  isSelf: boolean
  onSave: (id: string, updates: Partial<Competitor>) => Promise<void>
  onDelete: (id: string) => Promise<void>
  saving: boolean
}

export default function CompetitorCard({
  competitor,
  isSelf,
  onSave,
  onDelete,
  saving,
}: CompetitorCardProps) {
  const [expanded, setExpanded] = useState(false)
  const [otaBookingUrl, setOtaBookingUrl] = useState(competitor.ota_booking_url || '')
  const [otaExpediaUrl, setOtaExpediaUrl] = useState(competitor.ota_expedia_url || '')
  const [bookingEngineUrl, setBookingEngineUrl] = useState(competitor.booking_engine_url || '')
  const [scrapeMethod, setScrapeMethod] = useState<ScrapeMethod>(competitor.scrape_method)
  const [dirty, setDirty] = useState(false)

  const statusColor =
    competitor.scrape_status === 'ok'
      ? 'bg-green-400'
      : competitor.scrape_status === 'error' || competitor.scrape_status === 'blocked'
        ? 'bg-red-400'
        : competitor.scrape_status === 'pending'
          ? 'bg-yellow-400'
          : 'bg-gray-400'

  const statusLabel =
    competitor.scrape_status === 'ok'
      ? 'Active'
      : competitor.scrape_status === 'error'
        ? 'Error'
        : competitor.scrape_status === 'blocked'
          ? 'Blocked'
          : competitor.scrape_status === 'pending'
            ? 'Pending'
            : 'Manual'

  function markDirty() {
    setDirty(true)
  }

  async function handleSave() {
    await onSave(competitor.id, {
      ota_booking_url: otaBookingUrl || null,
      ota_expedia_url: otaExpediaUrl || null,
      booking_engine_url: bookingEngineUrl || null,
      scrape_method: scrapeMethod,
    })
    setDirty(false)
  }

  return (
    <div className={`rounded-lg border ${isSelf ? 'border-blue-300 bg-blue-50/30' : 'border-gray-200 bg-white'} shadow-sm`}>
      {/* Header row - always visible */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className={`inline-block w-2.5 h-2.5 rounded-full flex-shrink-0 ${statusColor}`} />
          <div className="min-w-0">
            <span className="font-semibold text-gray-900 text-sm truncate block">
              {competitor.name}
              {isSelf && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                  Your Hotel
                </span>
              )}
            </span>
            <span className="text-xs text-gray-500 block mt-0.5">
              {statusLabel}
              {competitor.last_scraped_at && (
                <> {'\u00B7'} Last checked {formatRelativeTime(competitor.last_scraped_at)}</>
              )}
              {competitor.consecutive_failures > 0 && (
                <> {'\u00B7'} <span className="text-red-500">{competitor.consecutive_failures} failures</span></>
              )}
            </span>
          </div>
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expanded section */}
      {expanded && (
        <div className="px-5 pb-5 border-t border-gray-100 pt-4 space-y-4">
          {/* Booking.com URL */}
          <div>
            <label className="flex items-center gap-2 text-xs font-medium text-gray-700 mb-1.5">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-blue-600 text-white text-[10px] font-bold flex-shrink-0">B</span>
              Booking.com URL
              <span className="text-[10px] font-normal text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">BACKUP</span>
            </label>
            <input
              type="url"
              value={otaBookingUrl}
              onChange={(e) => { setOtaBookingUrl(e.target.value); markDirty() }}
              placeholder="https://www.booking.com/hotel/us/..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none placeholder:text-gray-400"
            />
          </div>

          {/* Expedia URL */}
          <div>
            <label className="flex items-center gap-2 text-xs font-medium text-gray-700 mb-1.5">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-yellow-500 text-white text-[10px] font-bold flex-shrink-0">E</span>
              Expedia URL
              <span className="text-[10px] font-normal text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">BACKUP</span>
            </label>
            <input
              type="url"
              value={otaExpediaUrl}
              onChange={(e) => { setOtaExpediaUrl(e.target.value); markDirty() }}
              placeholder="https://www.expedia.com/Hotel/..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none placeholder:text-gray-400"
            />
          </div>

          {/* Direct Booking Engine URL */}
          <div>
            <label className="flex items-center gap-2 text-xs font-medium text-gray-700 mb-1.5">
              <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-green-600 text-white text-[10px] font-bold flex-shrink-0">D</span>
              Direct Booking Engine URL
              <span className="text-[10px] font-normal text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">PRIMARY</span>
            </label>
            <input
              type="url"
              value={bookingEngineUrl}
              onChange={(e) => { setBookingEngineUrl(e.target.value); markDirty() }}
              placeholder="https://reservations.example.com/..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none placeholder:text-gray-400"
            />
            <p className="text-[11px] text-gray-500 mt-1">
              Primary rate source — checked first on every scrape cycle
            </p>
          </div>

          {/* Scrape Method Override */}
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">
              Scrape Method Override
            </label>
            <div className="flex flex-wrap gap-2">
              {SCRAPE_METHODS.filter(m => m.value !== 'pms_api' && m.value !== 'manual').map((method) => (
                <button
                  key={method.value}
                  type="button"
                  onClick={() => { setScrapeMethod(method.value as ScrapeMethod); markDirty() }}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                    scrapeMethod === method.value
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {method.label}
                </button>
              ))}
            </div>
          </div>

          {/* Scrape error message */}
          {competitor.scrape_error && (
            <div className="bg-red-50 border border-red-200 rounded-md px-3 py-2">
              <p className="text-xs text-red-700">
                <span className="font-medium">Last error:</span> {competitor.scrape_error}
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-between pt-2">
            <div>
              {!isSelf && (
                <button
                  type="button"
                  onClick={() => onDelete(competitor.id)}
                  className="text-xs text-red-500 hover:text-red-700 font-medium"
                >
                  Remove competitor
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={handleSave}
              disabled={!dirty || saving}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                dirty && !saving
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
