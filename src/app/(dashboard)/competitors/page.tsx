'use client'
import { useHotel } from '@/hooks/useHotel'
import { useCompetitors, useSaveCompetitor, useDeleteCompetitor } from '@/hooks/useCompetitors'
import { SetupForm } from '@/components/setup/SetupForm'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

export default function CompetitorsPage() {
  const { data: hotel, isLoading: hotelLoading } = useHotel()
  const { data: competitors = [], isLoading: compsLoading } = useCompetitors(hotel?.id)
  const saveCompetitor = useSaveCompetitor()
  const deleteCompetitor = useDeleteCompetitor()

  if (hotelLoading || compsLoading) return <LoadingSpinner />

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-5">
        <h1 className="text-xl font-semibold text-gray-900">Competitors</h1>
        <p className="text-sm text-gray-400 mt-0.5">Manage your property and competitor rate sources</p>
      </div>
      {hotel && (
        <SetupForm
          hotel={hotel}
          competitors={competitors}
          onSaveHotel={async (updates) => {
            await fetch('/api/hotels', {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ id: hotel.id, ...updates }),
            })
          }}
          onSaveCompetitor={(comp) => saveCompetitor.mutateAsync(comp)}
          onDeleteCompetitor={(id) => deleteCompetitor.mutateAsync(id)}
        />
      )}
    </div>
  )
}
