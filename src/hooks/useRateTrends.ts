import { useQuery } from '@tanstack/react-query'

interface TrendPoint {
  date: string
  rate: number
}

export interface TrendSeries {
  competitorId: string
  competitorName: string
  isSelf?: boolean
  data: TrendPoint[]
}

export function useRateTrends(hotelId?: string) {
  return useQuery<TrendSeries[]>({
    queryKey: ['rateTrends', hotelId],
    queryFn: async () => {
      const res = await fetch(`/api/trends?hotel_id=${hotelId}`)
      if (!res.ok) throw new Error('Failed to fetch trends')
      return res.json()
    },
    enabled: !!hotelId,
    refetchInterval: 10 * 60 * 1000, // refetch every 10 min
  })
}
