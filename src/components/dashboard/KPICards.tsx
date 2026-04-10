import { formatCurrency } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface KPICardsProps {
  yourRate: number | null
  marketAvg: number | null
  marketMin: number | null
  marketMax: number | null
  position: number | null
  total: number | null
  unreadAlerts: number
  currency?: string
}

interface KPICardProps {
  label: string
  value: string
  sub: string
  subColor?: string
  accent: string
}

function KPICard({ label, value, sub, subColor = 'text-gray-400', accent }: KPICardProps) {
  return (
    <div className={cn('bg-gray-50 rounded-xl p-4 border-l-4', accent)}>
      <div className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-2">{label}</div>
      <div className="text-2xl font-semibold text-gray-900">{value}</div>
      <div className={cn('text-xs mt-1', subColor)}>{sub}</div>
    </div>
  )
}

export function KPICards({
  yourRate, marketAvg, marketMin, marketMax,
  position, total, unreadAlerts, currency = 'USD'
}: KPICardsProps) {
  const fmt = (n: number | null) => n ? formatCurrency(n, currency) : '—'
  const diff = yourRate && marketAvg ? yourRate - marketAvg : null
  const diffStr = diff ? `${diff > 0 ? '+' : ''}${formatCurrency(diff, currency)} vs avg` : 'vs market avg'
  const diffColor = diff === null ? 'text-gray-400' : diff > 0 ? 'text-red-500' : 'text-green-600'

  const posLabel = position && total
    ? `${position}${['st','nd','rd'][position-1] || 'th'} of ${total} properties`
    : '— of — properties'

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
      <KPICard
        label="Your rate · tonight"
        value={fmt(yourRate)}
        sub="Standard room · direct"
        accent="border-blue-500"
      />
      <KPICard
        label="Market average"
        value={fmt(marketAvg)}
        sub={diffStr}
        subColor={diffColor}
        accent="border-green-500"
      />
      <KPICard
        label="Your position"
        value={position ? `${position} of ${total}` : '—'}
        sub={posLabel}
        accent="border-amber-500"
      />
      <KPICard
        label="Alerts this week"
        value={String(unreadAlerts)}
        sub={unreadAlerts > 0 ? `${unreadAlerts} unread` : 'All clear'}
        subColor={unreadAlerts > 0 ? 'text-red-500' : 'text-green-600'}
        accent="border-red-400"
      />
    </div>
  )
}
