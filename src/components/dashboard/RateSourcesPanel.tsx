'use client'
import { formatCurrency, formatRelativeTime } from '@/lib/utils'

interface RateSource {
  name: string
  type: 'primary' | 'backup'
  description: string
  rate: number | null
  currency: string
  lastChecked: string | null
  status: 'live' | 'matched' | 'stale' | 'error'
  parityNote?: string
}

interface RateSourcesPanelProps {
  sources: RateSource[]
}

const statusConfig: Record<string, { dot: string; label: string }> = {
  live:    { dot: 'bg-green-400', label: 'Live' },
  matched: { dot: 'bg-green-400', label: 'Matched' },
  stale:   { dot: 'bg-amber-400', label: 'Stale' },
  error:   { dot: 'bg-red-400',   label: 'Error' },
}

export function RateSourcesPanel({ sources }: RateSourcesPanelProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50">
        <div className="text-sm font-medium text-gray-900">Your rate sources</div>
      </div>
      <div className="p-4 space-y-3">
        {sources.map((src, i) => {
          const cfg = statusConfig[src.status] || statusConfig.live
          return (
            <div key={i} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
              <div className="text-xs font-medium text-gray-700">{src.name}</div>
              <div className="text-xs text-gray-400 mt-0.5">
                {src.type === 'primary' ? 'Primary' : 'Backup'} Â· {src.description}
              </div>
              <div className="text-lg font-semibold text-gray-900 mt-1">
                {src.rate !== null ? formatCurrency(src.rate, src.currency) : 'â'}
              </div>
              <div className="flex items-center gap-2 mt-1.5">
                <div className="flex items-center gap-1.5">
                  <div className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                  <span className="text-[10px] text-green-700 font-medium">{cfg.label}</span>
                </div>
                {src.lastChecked && (
                  <span className="text-[10px] text-gray-400">{formatRelativeTime(src.lastChecked)}</span>
                )}
                {src.parityNote && (
                  <span className="text-[10px] text-gray-400">{src.parityNote}</span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

