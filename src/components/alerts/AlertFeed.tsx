'use client'
import { useState } from 'react'
import { Alert } from '@/lib/types'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatCurrency, formatRelativeTime } from '@/lib/utils'

interface AlertFeedProps {
  alerts: Alert[]
  onDismiss: (id: string) => void
  loading?: boolean
}

const alertConfig: Record<string, { label: string; badge: 'blue'|'amber'|'red'|'green'|'gray'|'purple' }> = {
  price_drop:       { label: 'Price drop',    badge: 'blue' },
  price_rise:       { label: 'Price rise',    badge: 'amber' },
  you_are_priciest: { label: 'Highest priced', badge: 'red' },
  you_are_cheapest: { label: 'Lowest priced', badge: 'green' },
  scrape_failure:   { label: 'Scrape error',  badge: 'gray' },
  parity_issue:     { label: 'Parity issue',  badge: 'purple' },
}

export function AlertFeed({ alerts, onDismiss, loading }: AlertFeedProps) {
  const [filter, setFilter] = useState<'all' | 'unread'>('unread')
  const filtered = filter === 'unread'
    ? alerts.filter(a => !a.dismissed_at)
    : alerts

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-gray-50">
        <div>
          <div className="text-sm font-medium text-gray-900">Alerts</div>
          <div className="text-xs text-gray-400 mt-0.5">{alerts.filter(a => !a.dismissed_at).length} unread</div>
        </div>
        <div className="flex bg-white rounded-lg border border-gray-200 p-0.5 gap-0.5">
          {(['unread', 'all'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs px-3 h-7 rounded-md transition-colors capitalize ${
                filter === f ? 'bg-gray-100 text-gray-900 font-medium' : 'text-gray-500'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="divide-y divide-gray-50">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="px-5 py-4 animate-pulse">
              <div className="flex items-center gap-3">
                <div className="h-5 w-16 bg-gray-100 rounded-full" />
                <div className="h-4 bg-gray-100 rounded flex-1" />
                <div className="h-4 w-12 bg-gray-100 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="px-5 py-12 text-center">
          <div className="text-gray-300 text-3xl mb-2">✓</div>
          <div className="text-sm text-gray-400">
            {filter === 'unread' ? 'No unread alerts' : 'No alerts yet'}
          </div>
        </div>
      ) : (
        <div className="divide-y divide-gray-50">
          {filtered.map(alert => {
            const config = alertConfig[alert.alert_type] || alertConfig.scrape_failure
            const isDismissed = !!alert.dismissed_at

            return (
              <div
                key={alert.id}
                className={`px-5 py-4 flex items-start gap-3 transition-colors ${isDismissed ? 'opacity-50' : 'hover:bg-gray-50'}`}
              >
                <Badge variant={config.badge} className="mt-0.5 flex-shrink-0">{config.label}</Badge>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-gray-700">
                    {alert.alert_type === 'price_drop' && (
                      <span>Rate dropped from <strong>{formatCurrency(alert.old_rate || 0)}</strong> to <strong className="text-green-700">{formatCurrency(alert.new_rate || 0)}</strong>{alert.check_in_date && ` for ${alert.check_in_date}`}</span>
                    )}
                    {alert.alert_type === 'price_rise' && (
                      <span>Rate raised from <strong>{formatCurrency(alert.old_rate || 0)}</strong> to <strong className="text-red-600">{formatCurrency(alert.new_rate || 0)}</strong>{alert.check_in_date && ` for ${alert.check_in_date}`}</span>
                    )}
                    {alert.alert_type === 'you_are_priciest' && (
                      <span>Your rate of <strong className="text-red-600">{formatCurrency(alert.your_rate || 0)}</strong> is now the highest in your comp set{alert.check_in_date && ` for ${alert.check_in_date}`}</span>
                    )}
                    {alert.alert_type === 'you_are_cheapest' && (
                      <span>Your rate of <strong className="text-green-700">{formatCurrency(alert.your_rate || 0)}</strong> is now the lowest in your comp set{alert.check_in_date && ` for ${alert.check_in_date}`}</span>
                    )}
                    {alert.alert_type === 'scrape_failure' && (
                      <span>Competitor data unavailable — scrape failed</span>
                    )}
                    {alert.alert_type === 'parity_issue' && (
                      <span>Rate parity issue detected across distribution channels</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">{formatRelativeTime(alert.created_at)}</div>
                </div>
                {!isDismissed && (
                  <Button size="sm" variant="ghost" onClick={() => onDismiss(alert.id)}>
                    Dismiss
                  </Button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
