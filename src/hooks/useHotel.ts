import { useQuery } from '@tanstack/react-query'
import { Hotel } from '@/lib/types'

export function useHotel() {
  return useQuery<Hotel>({
    queryKey: ['hotel'],
    queryFn: async () => {
      const res = await fetch('/api/hotels')
      if (!res.ok) throw new Error('Failed to fetch hotel')
      return res.json()
    },
  })
}
