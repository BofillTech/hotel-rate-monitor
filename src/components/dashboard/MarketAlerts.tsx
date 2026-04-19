'use client'

import { AlertTriangle, Calendar, TrendingUp, Sparkles } from 'lucide-react'

// -- Placeholder alert data (RED = not real data yet) --------
const PLACEHOLDER_ALERTS = [
  {
    id: '1',
    type: 'holiday' as const,
    title: 'Memorial Day Weekend',
    description: 'May 24-26 — historically high demand in Montauk. Consider raising rates 15-25% above standard.',
    date: '2026-05-24',
    urgency: 'medium' as const,
  },
  {
    id: '2',
    type: 'event' as const,
    title: 'Montauk Music Festival',
    description: 'June 12-14 — local event driving 30%+ occupancy increase. Competitors typically raise rates.',
    date: '2026-06-12',
    urgency: 'low' as const,
  },
  {
    id: '3',
    type: 'trend' as const,
    title: 'Weekend Rate Gap Widening',
    description: 'Your weekend rates are 18% below market average. Competitors have raised weekend rates 2 of last 3 weeks.',
    date: null,
    urgency: 'high' as const,
  },
  {
    id: '4',
    type: 'holiday' as const,
    title: '4th of July Week',
    description: 'July 1-6 — peak Montauk season. Most competitors already showing $400+ rates for this window.',
    date: '2026-07-01',
    urgency: 'medium' as const,
  },
]

const ICON_MAP = {
  holiday: Calendar,
  event: Sparkles,
  trend: TrendingUp,
}

const URGENCY_STYLES = {
  high: 'border-l-red-500 bg-red-50/50',
  medium: 'border-l-amber-500 bg-amber-50/50',
  low: 'border-l-blue-500 bg-blue-50/50',
}

export default function MarketAlerts() {
  return (
    <div className="space-y-3">
      {/* Placeholder warning */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg">
        <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
        <p className="text-xs text-red-500 font-medium">
          Placeholder data — not connected to live sources yet
        </p>
      </div>

      {PLACEHOLDER_ALERTS.map((alert) => {
        const Icon = ICON_MAP[alert.type] || AlertTriangle
        return (
          <div
            key={alert.id}
            className={`border-l-4 rounded-r-lg p-3 ${URGENCY_STYLES[alert.urgency]}`}
          >
            <div className="flex items-start gap-2.5">
              <Icon className="w-4 h-4 text-gray-500 mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-red-700">
                    {alert.title}
                  </h4>
                  {alert.date && (
                    <span className="text-[10px] font-medium text-red-400 bg-red-50 px-1.5 py-0.5 rounded">
                      {alert.date}
                    </span>
                  )}
                </div>
                <p className="text-xs text-red-500 mt-0.5 leading-relaxed">
                  {alert.description}
                </p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
