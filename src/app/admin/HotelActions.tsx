'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function HotelActions({ hotelId, hotelName }: { hotelId: string; hotelName: string }) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  async function handleDelete() {
    if (!confirm(`Delete "${hotelName}"? This will also remove all its competitors and rate data. This cannot be undone.`)) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/admin/hotels/${hotelId}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json()
        alert(data.error || 'Failed to delete hotel')
        return
      }
      router.refresh()
    } catch {
      alert('Failed to delete hotel')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <Link
        href={`/admin/hotels/${hotelId}`}
        className="text-xs text-gray-500 hover:text-blue-600"
      >
        Edit
      </Link>
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="text-xs text-gray-400 hover:text-red-600 disabled:opacity-50"
      >
        {deleting ? 'Deleting...' : 'Delete'}
      </button>
    </div>
  )
}

