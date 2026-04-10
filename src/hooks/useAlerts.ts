import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Alert } from '@/lib/types'

export function useAlerts(hotelId?: string) {
  return useQuery<Alert[]>({
    queryKey: ['alerts', hotelId],
    queryFn: async () => {
      const res = await fetch(`/api/alerts?hotel_id=${hotelId}`)
      if (!res.ok) throw new Error('Failed to fetch alerts')
      return res.json()
    },
    enabled: !!hotelId,
    refetchInterval: 60 * 1000,
  })
}

export function useDismissAlert() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (alertId: string) => {
      const res = await fetch('/api/alerts', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alert_id: alertId, action: 'dismiss' }),
      })
      if (!res.ok) throw new Error('Failed to dismiss alert')
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['alerts'] }),
  })
}
