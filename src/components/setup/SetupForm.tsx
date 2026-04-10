'use client'
import { useState } from 'react'
import { Hotel, Competitor } from '@/lib/types'
import { Button } from '@/components/ui/Button'
import { PMS_PLATFORMS, SCRAPE_METHODS } from '@/lib/constants'

interface SetupFormProps {
  hotel: Hotel
  competitors: Competitor[]
  onSaveHotel: (updates: Partial<Hotel>) => Promise<void>
  onSaveCompetitor: (comp: Partial<Competitor>) => Promise<void>
  onDeleteCompetitor: (id: string) => Promise<void>
}

export function SetupForm({ hotel, competitors, onSaveHotel, onSaveCompetitor, onDeleteCompetitor }: SetupFormProps) {
  const [hotelForm, setHotelForm] = useState({
    name: hotel.name,
    pms_api_url: hotel.pms_api_url || '',
    pms_platform: hotel.pms_platform || 'cloudbeds',
    booking_engine_url: hotel.booking_engine_url || '',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSaveHotel() {
    setSaving(true)
    await onSaveHotel(hotelForm)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Your property */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
          <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center text-xs font-semibold text-blue-700">H</div>
          <div>
            <div className="text-sm font-medium text-gray-900">Your property</div>
            <div className="text-xs text-gray-400">How we pull your own live rates</div>
          </div>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Property name</label>
              <input
                type="text"
                value={hotelForm.name}
                onChange={e => setHotelForm(p => ({ ...p, name: e.target.value }))}
                className="w-full h-9 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">PMS platform</label>
              <select
                value={hotelForm.pms_platform}
                onChange={e => setHotelForm(p => ({ ...p, pms_platform: e.target.value }))}
                className="w-full h-9 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 bg-white"
              >
                {PMS_PLATFORMS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
              PMS / Booking engine API URL <span className="normal-case text-blue-600 font-normal ml-1">Primary</span>
            </label>
            <input
              type="url"
              value={hotelForm.pms_api_url}
              onChange={e => setHotelForm(p => ({ ...p, pms_api_url: e.target.value }))}
              placeholder="https://api.cloudbeds.com/api/v1.1/rates/..."
              className="w-full h-9 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
              Direct booking engine URL <span className="normal-case text-gray-400 font-normal ml-1">Backup</span>
            </label>
            <input
              type="url"
              value={hotelForm.booking_engine_url}
              onChange={e => setHotelForm(p => ({ ...p, booking_engine_url: e.target.value }))}
              placeholder="https://book.yourhotel.com/reservations"
              className="w-full h-9 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 font-mono"
            />
            <p className="text-xs text-gray-400 mt-1">Used automatically if the API is unreachable</p>
          </div>
          <div className="flex justify-end">
            <Button variant="primary" onClick={handleSaveHotel} disabled={saving}>
              {saving ? 'Saving...' : saved ? '✓ Saved' : 'Save property'}
            </Button>
          </div>
        </div>
      </div>

      {/* Competitors */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50 flex items-center gap-3">
          <div className="w-7 h-7 bg-teal-100 rounded-lg flex items-center justify-center text-xs font-semibold text-teal-700">C</div>
          <div>
            <div className="text-sm font-medium text-gray-900">
              Competitors <span className="text-gray-400 font-normal">({competitors.length} / 10)</span>
            </div>
            <div className="text-xs text-gray-400">We try Booking.com first, then Expedia, then direct</div>
          </div>
        </div>
        <div className="p-5 space-y-3">
          {competitors.map((comp, i) => (
            <CompetitorCard
              key={comp.id}
              index={i}
              competitor={comp}
              onSave={onSaveCompetitor}
              onDelete={onDeleteCompetitor}
            />
          ))}
          {competitors.length < 10 && (
            <button
              onClick={() => onSaveCompetitor({ hotel_id: hotel.id, name: '', scrape_method: 'auto', sort_order: competitors.length })}
              className="w-full py-3 border border-dashed border-gray-300 rounded-xl text-sm text-gray-400 hover:border-gray-400 hover:text-gray-600 transition-colors"
            >
              + Add competitor
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function CompetitorCard({
  index, competitor, onSave, onDelete
}: {
  index: number
  competitor: Competitor
  onSave: (c: Partial<Competitor>) => Promise<void>
  onDelete: (id: string) => Promise<void>
}) {
  const [open, setOpen] = useState(!competitor.name)
  const [form, setForm] = useState({
    name: competitor.name,
    ota_booking_url: competitor.ota_booking_url || '',
    ota_expedia_url: competitor.ota_expedia_url || '',
    booking_engine_url: competitor.booking_engine_url || '',
    scrape_method: competitor.scrape_method,
  })
  const [saving, setSaving] = useState(false)

  const statusColor = { ok: 'bg-green-400', error: 'bg-red-400', blocked: 'bg-red-400', pending: 'bg-gray-300', manual: 'bg-gray-300' }

  async function handleSave() {
    setSaving(true)
    await onSave({ id: competitor.id, ...form })
    setSaving(false)
    setOpen(false)
  }

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <div
        className="flex items-center gap-3 px-4 py-3 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
        onClick={() => setOpen(o => !o)}
      >
        <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold flex items-center justify-center flex-shrink-0">
          {index + 1}
        </div>
        <span className="flex-1 text-sm font-medium text-gray-700 truncate">
          {form.name || <span className="text-gray-400 font-normal">New competitor</span>}
        </span>
        <div className="flex items-center gap-1.5">
          <div className={`w-1.5 h-1.5 rounded-full ${statusColor[competitor.scrape_status] || 'bg-gray-300'}`} />
          <span className="text-xs text-gray-400">{competitor.scrape_status}</span>
        </div>
        <span className="text-[10px] text-gray-400">{open ? '▲' : '▼'}</span>
      </div>
      {open && (
        <div className="p-4 space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Competitor name</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              placeholder="Hotel name..."
              className="w-full h-9 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
              Booking.com page <span className="normal-case text-blue-600 font-normal">Primary</span>
            </label>
            <input
              type="url"
              value={form.ota_booking_url}
              onChange={e => setForm(p => ({ ...p, ota_booking_url: e.target.value }))}
              placeholder="https://www.booking.com/hotel/us/..."
              className="w-full h-9 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
              Expedia page <span className="normal-case text-blue-600 font-normal">Primary</span>
            </label>
            <input
              type="url"
              value={form.ota_expedia_url}
              onChange={e => setForm(p => ({ ...p, ota_expedia_url: e.target.value }))}
              placeholder="https://www.expedia.com/..."
              className="w-full h-9 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">
              Direct booking engine <span className="normal-case text-gray-400 font-normal">Backup</span>
            </label>
            <input
              type="url"
              value={form.booking_engine_url}
              onChange={e => setForm(p => ({ ...p, booking_engine_url: e.target.value }))}
              placeholder="https://..."
              className="w-full h-9 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1.5">Scrape method</label>
            <select
              value={form.scrape_method}
              onChange={e => setForm(p => ({ ...p, scrape_method: e.target.value as any }))}
              className="w-full h-9 px-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-400 bg-white"
            >
              {SCRAPE_METHODS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>
          <div className="flex justify-between pt-1">
            <Button variant="danger" size="sm" onClick={() => onDelete(competitor.id)}>Remove</Button>
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
              <Button variant="primary" size="sm" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
