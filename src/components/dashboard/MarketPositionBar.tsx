import { formatCurrency } from '@/lib/utils'

interface MarketPositionBarProps {
  yourRate: number
  marketMin: number
  marketMax: number
  competitors: Array<{ name: string; rate: number; color: string }>
}

export function MarketPositionBar({ yourRate, marketMin, marketMax, competitors }: MarketPositionBarProps) {
  const range = marketMax - marketMin || 1
  const pct = (rate: number) => Math.max(0, Math.min(100, ((rate - marketMin) / range) * 100))

  return (
    <div>
      <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
        <span>Market range tonight</span>
        <span className="font-medium text-gray-900">{formatCurrency(yourRate)} · your rate</span>
      </div>
      <div className="relative h-2 bg-gray-100 rounded-full border border-gray-200">
        {competitors.map((c, i) => (
          <div
            key={i}
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full border-2 border-white"
            style={{ left: `${pct(c.rate)}%`, background: c.color, transform: 'translate(-50%, -50%)' }}
            title={`${c.name}: ${formatCurrency(c.rate)}`}
          />
        ))}
        <div
          className="absolute top-1/2 w-4 h-4 rounded-full bg-blue-600 border-2 border-white z-10"
          style={{ left: `${pct(yourRate)}%`, transform: 'translate(-50%, -50%)' }}
          title={`You: ${formatCurrency(yourRate)}`}
        />
      </div>
      <div className="flex justify-between mt-1.5">
        <span className="text-[10px] text-gray-400">{formatCurrency(marketMin)} cheapest</span>
        <span className="text-[10px] text-gray-400">{formatCurrency(marketMax)} priciest</span>
      </div>
      <div className="grid grid-cols-2 gap-2 mt-3">
        <div className="bg-gray-50 rounded-lg p-2.5">
          <div className="text-[10px] text-gray-400 uppercase tracking-wide">Lowest comp</div>
          <div className="text-base font-semibold text-green-700 mt-0.5">{formatCurrency(marketMin)}</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-2.5">
          <div className="text-[10px] text-gray-400 uppercase tracking-wide">Highest comp</div>
          <div className="text-base font-semibold text-red-600 mt-0.5">{formatCurrency(marketMax)}</div>
        </div>
      </div>
    </div>
  )
}
