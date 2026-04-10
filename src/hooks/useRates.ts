import { useQuery } from '@tanstack/react-query'
import { DashboardRate, RoomTypeRate } from '@/lib/types'

export function useRates(hotelId?: string, checkIn?: string) {
  const date = checkIn || new Date().toISOString().split('T')[0]
  return useQuery<DashboardRate[]>({
    queryKey: ['rates', hotelId, date],
    queryFn: async () => {
      const res = await fetch(`/api/rates?hotel_id=${hotelId}&check_in=${date}`)
      if (!res.ok) throw new Error('Failed to fetch rates')
      return res.json()
    },
    enabled: !!hotelId,
    refetchInterval: 5 * 60 * 1000, // refetch every 5 min
  })
}

export async function fetchRoomTypes(competitorId: string, checkIn: string): Promise<RoomTypeRate[]> {
  const res = await fetch(`/api/rates?hotel_id=_&check_in=${checkIn}&expanded=${competitorId}`)
  if (!res.ok) throw new Error('Failed to fetch room types')
  return res.json()
}
