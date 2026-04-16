'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface HotelFormData {
  name: string
  city: string
  state: string
  country: string
  slug: string
  currency: string
  plan: string
  pms_platform: string
  booking_engine_url: string
  check_frequency_mins: number
  is_active: boolean
}

interface HotelFormProps {
  hotel?: {
    id: string
    name: string
    city: string | null
    state: string | null
    country: string
    slug: string | null
    currency: string
    plan: string
    pms_platform: string | null
    booking_engine_url: string | null
    check_frequency_mins: number
    is_active: boolean
  }
}

export function HotelForm({ hotel }: HotelFormProps) {
  const router = useRouter()
  const isEdit = !!hotel

  const [form, setForm] = useState<HotelFormData>({
    name: hotel?.name || '',
    city: hotel?.city || '',
    state: hotel?.state || '',
    country: hotel?.country || 'US',
    slug: hotel?.slug || '',
    currency: hotel?.currency || 'USD',
    plan: hotel?.plan || 'starter',
    pms_platform: hotel?.pms_platform || '',
    booking_engine_url: hotel?.booking_engine_url || '',
    check_frequency_mins: hotel?.check_frequency_mins || 60,
    is_active: hotel?.is_active ?? true,
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function slugify(text: string) {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '').slice(0, 40)
  }

  function handleNameChange(name: string) {
    setForm(prev => ({
      ...prev,
      name,
      slug: !isEdit || !prev.slug ? slugify(name) : prev.slug,
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) { setError('Hotel name is required'); return }
    if (!form.slug.trim()) { setError('Slug is required'); return }

    setSaving(true)
    setError('')

    try {
      const url = isEdit ? `/api/admin/hotels/${hotel!.id}` : '/api/admin/hotels'
      const method = isEdit ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to save hotel')
        return
      }

      router.push(isEdit ? `/admin/hotels/${hotel!.id}` : '/admin')
      router.refresh()
    } catch {
      setError('Failed to save hotel')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6 space-y-6 max-w-2xl">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Hotel Name *</label>
          <input
            type="text"
            value={form.name}
            onChange={e => handleNameChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Royal Atlantic Beach Resort"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
          <input
            type="text"
            value={form.city}
            onChange={e => setForm(prev => ({ ...prev, city: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Daytona Beach"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
          <input
            type="text"
            value={form.state}
            onChange={e => setForm(prev => ({ ...prev, state: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="FL"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
          <input
            type="text"
            value={form.country}
            onChange={e => setForm(prev => ({ ...prev, country: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="US"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
          <select
            value={form.currency}
            onChange={e => setForm(prev => ({ ...prev, currency: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
            <option value="GBP">GBP</option>
            <option value="CAD">CAD</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">URL Slug *</label>
          <div className="flex items-center">
            <span className="text-sm text-gray-400 mr-1">/ratetracker/</span>
            <input
              type="text"
              value={form.slug}
              onChange={e => setForm(prev => ({ ...prev, slug: slugify(e.target.value) }))}
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="royalatlantic"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Plan</label>
          <select
            value={form.plan}
            onChange={e => setForm(prev => ({ ...prev, plan: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="free">Free</option>
            <option value="starter">Starter</option>
            <option value="pro">Pro</option>
            <option value="enterprise">Enterprise</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">PMS Platform</label>
          <input
            type="text"
            value={form.pms_platform}
            onChange={e => setForm(prev => ({ ...prev, pms_platform: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="cloudbeds"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Check Frequency (mins)</label>
          <input
            type="number"
            value={form.check_frequency_mins}
            onChange={e => setForm(prev => ({ ...prev, check_frequency_mins: parseInt(e.target.value) || 60 }))}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min={5}
            max={1440}
          />
        </div>

        <div className="col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">Booking Engine URL</label>
          <input
            type="url"
            value={form.booking_engine_url}
            onChange={e => setForm(prev => ({ ...prev, booking_engine_url: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="https://book.royalatlantic.com"
          />
        </div>

        <div className="col-span-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={e => setForm(prev => ({ ...prev, is_active: e.target.checked }))}
              className="rounded border-gray-300"
            />
            <span className="text-sm text-gray-700">Active</span>
          </label>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center justify-center font-medium rounded-lg transition-colors bg-blue-600 text-white hover:bg-blue-700 border border-blue-600 text-sm px-4 h-9 disabled:opacity-50"
        >
          {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Hotel'}
        </button>
        <Link
          href={isEdit ? `/admin/hotels/${hotel!.id}` : '/admin'}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Cancel
        </Link>
      </div>
    </form>
  )
}

