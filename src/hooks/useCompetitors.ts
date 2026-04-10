import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Competitor } from '@/lib/types'

export function useCompetitors(hotelId?: string) {
  return useQuery<Competitor[]>({
    queryKey: ['competitors', hotelId],
    queryFn: async () => {
      const res = await fetch(`/api/competitors?hotel_id=${hotelId}`)
      if (!res.ok) throw new Error('Failed to fetch competitors')
      return res.json()
    },
    enabled: !!hotelId,
  })
}

export function useSaveCompetitor() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data: Partial<Competitor>) => {
      const method = data.id ? 'PATCH' : 'POST'
      const res = await fetch('/api/competitors', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error('Failed to save competitor')
      return res.json()
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['competitors'] }),
  })
}

export function useDeleteCompetitor() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/competitors?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Failed to delete competitor')
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['competitors'] }),
  })
}
