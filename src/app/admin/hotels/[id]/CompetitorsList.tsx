'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Competitor {
  id: string
  name: string
  scrape_method: string
  scrape_status: string
  last_scraped_at: string | null
  is_active: boolean
  sort_order: number
  ota_booking_url: string | null
  ota_expedia_url: string | null
  booking_engine_url: string | null
  consecutive_failures: number
  scrape_error: string | null
}

interface CompetitorsListProps {
  hotelId: string
  competitors: Competitor[]
}

const emptyCompetitor = {
  name: '',
  scrape_method: 'auto',
  ota_booking_url: '',
  ota_expedia_url: '',
  booking_engine_url: '',
  is_active: true,
  sort_order: 0,
}

export function CompetitorsList({ hotelId, competitors }: CompetitorsListProps) {
  const router = useRouter()
  const [showAdd, setShowAdd] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyCompetitor)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function startAdd() {
    setEditId(null)
    setForm({ ...emptyCompetitor, sort_order: competitors.length })
    setShowAdd(true)
    setError('')
  }

  function startEdit(c: Competitor) {
    setShowAdd(false)
    setEditId(c.id)
    setForm({
      name: c.name,
      scrape_method: c.scrape_method,
      ota_booking_url: c.ota_booking_url || '',
      ota_expedia_url: c.ota_expedia_url || '',
      booking_engine_url: c.booking_engine_url || '',
      is_active: c.is_active,
      sort_order: c.sort_order,
    })
    setError('')
  }

  function cancel() {
    setShowAdd(false)
    setEditId(null)
    setError('')
  }

  async function handleSave() {
    if (!form.name.trim()) { setError('Competitor name is required'); return }
    setSaving(true)
    setError('')

    try {
      const isNew = !editId
      const url = isNew ? '/api/admin/competitors' : `/api/admin/competitors/${editId}`
      const method = isNew ? 'POST' : 'PUT'
      const body = isNew ? { ...form, hotel_id: hotelId } : form

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to save competitor')
        return
      }

      setShowAdd(false)
      setEditId(null)
      router.refresh()
    } catch {
      setError('Failed to save competitor')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete competitor "${name}"?`)) return
    try {
      const res = await fetch(`/api/admin/competitors/${id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        alert(data.error || 'Failed to delete')
        return
      }
      router.refresh()
    } catch {
      alert('Failed to delete competitor')
    }
  }

  const formRow = (
    <tr className="bg-blue-50">
      <td className="px-4 py-2">
        <input
          type="text"
          value={form.name}
          onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
          className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Competitor name"
          autoFocus
        />
      </td>
      <td className="px-4 py-2">
        <select
          value={form.scrape_method}
          onChange={e => setForm(prev => ({ ...prev, scrape_method: e.target.value }))}
          className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="auto">auto</option>
          <option value="pms_api">pms_api</option>
          <option value="ota_booking">ota_booking</option>
          <option value="ota_expedia">ota_expedia</option>
          <option value="direct">direct</option>
          <option value="manual">manual</option>
        </select>
      </td>
      <td className="px-4 py-2">
        <input
          type="text"
          value={form.ota_booking_url}
          onChange={e => setForm(prev => ({ ...prev, ota_booking_url: e.target.value }))}
          className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Booking.com URL"
        />
      </td>
      <td className="px-4 py-2">
        <input
          type="number"
          value={form.sort_order}
          onChange={e => setForm(prev => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
          className="w-16 px-2 py-1.5 border border-gray-200 rounded text-sm text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </td>
      <td className="px-4 py-2">
        <input
          type="checkbox"
          checked={form.is_active}
          onChange={e => setForm(prev => ({ ...prev, is_active: e.target.checked }))}
          className="rounded border-gray-300"
        />
      </td>
      <td className="px-4 py-2 text-sm text-gray-400">â</td>
      <td className="px-4 py-2">
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="text-xs font-medium text-blue-600 hover:text-blue-800 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
          <button onClick={cancel} className="text-xs text-gray-400 hover:text-gray-600">
            Cancel
          </button>
        </div>
      </td>
    </tr>
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Competitors <span className="text-sm font-normal text-gray-400">({competitors.length})</span>
        </h2>
        <button
          onClick={startAdd}
          disabled={showAdd}
          className="inline-flex items-center justify-center font-medium rounded-lg transition-colors bg-blue-600 text-white hover:bg-blue-700 border border-blue-600 text-xs px-3 h-7 disabled:opacity-50"
        >
          + Add Competitor
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm mb-4">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Booking URL</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-16">Order</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-16">Active</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {showAdd && formRow}
            {competitors.map((c) => (
              editId === c.id ? formRow : (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{c.name}</td>
                  <td className="px-4 py-3">
                    <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">{c.scrape_method}</code>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500 max-w-[200px] truncate">
                    {c.ota_booking_url || 'â'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 text-center">{c.sort_order}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex w-2 h-2 rounded-full ${c.is_active ? 'bg-green-500' : 'bg-gray-300'}`} />
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                      c.scrape_status === 'ok' ? 'bg-green-100 text-green-800' :
                      c.scrape_status === 'error' ? 'bg-red-100 text-red-800' :
                      c.scrape_status === 'blocked' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {c.scrape_status}
                    </span>
                    {c.consecutive_failures > 0 && (
                      <span className="text-xs text-red-400 ml-1" title={c.scrape_error || ''}>
                        ({c.consecutive_failures} fails)
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => startEdit(c)} className="text-xs text-gray-500 hover:text-blue-600">
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(c.id, c.name)}
                        className="text-xs text-gray-400 hover:text-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              )
            ))}
            {competitors.length === 0 && !showAdd && (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-gray-400 text-sm">
                  No competitors yet. Click &quot;Add Competitor&quot; to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
