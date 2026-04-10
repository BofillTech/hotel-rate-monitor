'use client'

import { useEffect, useState, useCallback } from 'react'
import CompetitorCard from '@/components/setup/CompetitorCard'
import { Competitor } from '@/lib/types'

const HOTEL_ID = 'd1f989bf-242b-4afa-bc7a-7abe66ba57ca'

export default function CompetitorsPage() {
  const [competitors, setCompetitors] = useState<Competitor[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [adding, setAdding] = useState(false)

  // Determine which competitor is "self" (name matches hotel name)
  // For this hotel, the self-competitor is "Marram Montauk" with id ceaf432f...
  const selfCompetitorId = 'ceaf432f-1dc3-475e-b637-4c421ac9617e'

  const fetchCompetitors = useCallback(async () => {
    try {
      const res = await fetch(`/api/competitors?hotel_id=${HOTEL_ID}`)
      if (!res.ok) throw new Error('Failed to load competitors')
      const data = await res.json()
      setCompetitors(data)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load competitors')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCompetitors()
  }, [fetchCompetitors])

  function flash(msg: string) {
    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(null), 3000)
  }

  async function handleSave(id: string, updates: Partial<Competitor>) {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/competitors', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save')
      }
      const updated = await res.json()
      setCompetitors((prev) =>
        prev.map((c) => (c.id === id ? { ...c, ...updated } : c))
      )
      flash('Changes saved')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Remove this competitor? This will stop tracking their rates.')) return
    setError(null)
    try {
      const res = await fetch(`/api/competitors?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to remove competitor')
      setCompetitors((prev) => prev.filter((c) => c.id !== id))
      flash('Competitor removed')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Delete failed')
    }
  }

  async function handleAdd() {
    if (!newName.trim()) return
    setAdding(true)
    setError(null)
    try {
      const res = await fetch('/api/competitors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hotel_id: HOTEL_ID,
          name: newName.trim(),
          scrape_method: 'auto',
          is_active: true,
          sort_order: competitors.length + 1,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to add competitor')
      }
      const created = await res.json()
      setCompetitors((prev) => [...prev, created])
      setNewName('')
      setShowAddForm(false)
      flash('Competitor added')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Add failed')
    } finally {
      setAdding(false)
    }
  }

  // Sort: self-competitor first, then by sort_order
  const sorted = [...competitors].sort((a, b) => {
    if (a.id === selfCompetitorId) return -1
    if (b.id === selfCompetitorId) return 1
    return (a.sort_order ?? 0) - (b.sort_order ?? 0)
  })

  return (
    <main className="p-6 max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Competitor Management</h1>
        <p className="text-sm text-gray-500 mt-1">
          Configure rate source URLs and scrape settings for each competitor.
        </p>
      </div>

      {/* Success banner */}
      {successMsg && (
        <div className="mb-4 px-4 py-2.5 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 font-medium">
          {successMsg}
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className="mb-4 px-4 py-2.5 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map((competitor) => (
            <CompetitorCard
              key={competitor.id}
              competitor={competitor}
              isSelf={competitor.id === selfCompetitorId}
              onSave={handleSave}
              onDelete={handleDelete}
              saving={saving}
            />
          ))}

          {/* Add competitor */}
          {showAddForm ? (
            <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 p-5">
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                Competitor Name
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. The Surf Lodge"
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleAdd}
                  disabled={adding || !newName.trim()}
                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {adding ? 'Adding...' : 'Add'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowAddForm(false); setNewName('') }}
                  className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
              </div>
              <p className="text-[11px] text-gray-500 mt-2">
                After adding, expand the card to configure URLs and scrape settings.
              </p>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowAddForm(true)}
              className="w-full py-3 rounded-lg border-2 border-dashed border-gray-300 text-sm font-medium text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors"
            >
              + Add Competitor
            </button>
          )}
        </div>
      )}

      {/* Info panel */}
      {!loading && competitors.length > 0 && (
        <div className="mt-8 bg-gray-50 rounded-lg border border-gray-200 px-5 py-4">
          <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-2">How rate sources work</h3>
          <div className="text-xs text-gray-600 space-y-1.5">
            <p><span className="font-medium text-blue-600">Primary sources</span> (Booking.com, Expedia) are checked first on every scrape cycle.</p>
            <p><span className="font-medium text-green-600">Backup source</span> (Direct Booking Engine) is used automatically when OTA sources fail or are blocked.</p>
            <p><span className="font-medium text-gray-700">Scrape Method Override</span> forces the system to always use a specific source, bypassing the automatic fallback logic.</p>
          </div>
        </div>
      )}
    </main>
  )
}
