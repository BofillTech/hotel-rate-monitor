'use client'
import { useHotel } from '@/hooks/useHotel'
import { useAlerts, useDismissAlert } from '@/hooks/useAlerts'
import { AlertFeed } from '@/components/alerts/AlertFeed'

export default function AlertsPage() {
  const { data: hotel } = useHotel()
  const { data: alerts = [], isLoading } = useAlerts(hotel?.id)
  const dismissAlert = useDismissAlert()

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-5">
        <h1 className="text-xl font-semibold text-gray-900">Alerts</h1>
        <p className="text-sm text-gray-400 mt-0.5">Rate changes and market position notifications</p>
      </div>
      <AlertFeed
        alerts={alerts}
        onDismiss={(id) => dismissAlert.mutate(id)}
        loading={isLoading}
      />
    </div>
  )
}
