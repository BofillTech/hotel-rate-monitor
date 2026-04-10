'use client'
import { useState } from 'react'
import { Alert } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'

interface AlertBannerProps {
  alerts: Alert[]
  onDismiss: (id: string) => void
}

const alertMessages: Record<string, (a: Alert) => string> = {
  price_drop:       a => `Competitor dropped rate to ${formatCurrency(a.new_rate || 0)} (was ${formatCurrency(a.old_rate || 0)}) for ${a.check_in_date}`,
  price_rise:       a => `Competitor raised rate to ${formatCurrency(a.new_rate || 0)} (was ${formatCurrency(a.old_rate || 0)}) for ${a.check_in_date}`,
  you_are_priciest: a => `You are now the highest priced in your comp set at ${formatCurrency(a.your_rate || 0)} for ${a.check_in_date}`,
  you_are_cheapest: a => `You are now the lowest priced in your comp set at ${formatCurrency(a.your_rate || 0)} for ${a.check_in_date}`,
  scrape_failure:   _a => `A competitor source stopped responding — data may be stale`,
  parity_issue:     _a => `Rate parity issue detected — OTA rate differs from your direct rate`,
}

const alertColors: Record<string, string> = {
  price_drop:       'bg-blue-50 border-blue-200 text-blue-800',
  price_rise:       'bg-amber-50 border-amber-200 text-amber-800',
  you_are_priciest: 'bg-red-50 border-red-200 text-red-800',
  you_are_cheapest: 'bg-green-50 border-green-200 text-green-800',
  scrape_failure:   'bg-gray-50 border-gray-200 text-gray-700',
  parity_issue:     'bg-purple-50 border-purple-200 text-purple-800',
}

export function AlertBanner({ alerts, onDismiss }: AlertBannerProps) {
  const [visible, setVisible] = useState(true)
  const unread = alerts.filter(a => !a.dismissed_at).slice(0, 3)
  if (!visible || unread.length === 0) return null

  return (
    <div className="space-y-2 mb-5">
      {unread.map(alert => (
        <div
          key={alert.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm ${alertColors[alert.alert_type] || alertColors.scrape_failure}`}
        >
          <div className="w-5 h-5 rounded-full bg-current opacity-20 flex-shrink-0" />
          <span className="flex-1">
            {alertMessages[alert.alert_type]?.(alert) || 'Rate alert triggered'}
          </span>
          <button
            onClick={() => onDismiss(alert.id)}
            className="text-xs opacity-60 hover:opacity-100 ml-2 flex-shrink-0"
          >
            Dismiss
          </button>
        </div>
      ))}
    </div>
  )
}
