import { useQuery } from '@tanstack/react-query'

export interface CalendarDay {
  date: string
  yourRate: number | null
  marketMin: number | null
  marketMax: number | null
  marketAvg: number | null
  competitors: Array<{ name: string; rate: number }>
}

export function useRateCalendar(hotelId?: string) {
  return useQuery<CalendarDay[]>({
    queryKey: ['rateCalendar', hotelId],
    queryFn: async () => {
      const res = await fetch(`/api/calendar?hotel_id=${hotelId}`)
      if (!res.ok) throw new Error('Failed to fetch calendar')
      return res.json()
    },
    enabled: !!hotelId,
    refetchInterval: 10 * 60 * 1000,
  })
}
