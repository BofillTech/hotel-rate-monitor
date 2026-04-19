'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
  Cell,
  LabelList,
} from 'recharts'
import { formatCurrency } from '@/lib/utils'

interface MarketPositionBarProps {
  yourRate: number
  marketMin: number
  marketMax: number
  competitors: Array<{ name: string; rate: number; color: string }>
}

export function MarketPositionBar({
  yourRate,
  marketMin,
  marketMax,
  competitors,
}: MarketPositionBarProps) {
  // Build data: your hotel + all competitors, sorted by rate
  const allEntries = [
    { name: 'You', rate: yourRate, isSelf: true },
    ...competitors.map((c) => ({ name: c.name, rate: c.rate, isSelf: false })),
  ].sort((a, b) => a.rate - b.rate)

  const yourPosition = allEntries.findIndex((e) => e.isSelf) + 1
  const totalCount = allEntries.length

  // Market average (competitors only)
  const compRates = competitors.map((c) => c.rate)
  const marketAvg = compRates.length
    ? Math.round(compRates.reduce((a, b) => a + b, 0) / compRates.length)
    : yourRate

  // Truncate long names
  const truncate = (s: string, max = 14) =>
    s.length > max ? s.slice(0, max - 1) + '\u2026' : s

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.[0]) return null
    const d = payload[0].payload
    const diff = d.rate - yourRate
    return (
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-2.5 text-xs">
        <p className="font-semibold text-gray-900">{d.name}</p>
        <p className="text-gray-600 mt-0.5">
          {formatCurrency(d.rate)}{' '}
          {!d.isSelf && (
            <span className={diff < 0 ? 'text-green-600' : diff > 0 ? 'text-red-500' : 'text-gray-400'}>
              ({diff > 0 ? '+' : ''}
              {formatCurrency(diff)} vs you)
            </span>
          )}
        </p>
      </div>
    )
  }

  return (
    <div>
      {/* Position callout */}
      <div className="flex items-center justify-between mb-3">
        <div className="text-xs text-gray-500">
          You are{' '}
          <span className="font-semibold text-gray-900">
            #{yourPosition}
          </span>{' '}
          of {totalCount}
        </div>
        <div className="text-xs text-gray-400">
          Avg {formatCurrency(marketAvg)}
        </div>
      </div>

      {/* Horizontal bar chart */}
      <div style={{ width: '100%', height: Math.max(180, allEntries.length * 36 + 30) }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={allEntries}
            layout="vertical"
            margin={{ top: 0, right: 40, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" horizontal={false} />
            <XAxis
              type="number"
              stroke="#9ca3af"
              style={{ fontSize: '10px' }}
              tickFormatter={(v) => formatCurrency(v)}
              domain={['auto', 'auto']}
            />
            <YAxis
              type="category"
              dataKey="name"
              stroke="#9ca3af"
              style={{ fontSize: '11px' }}
              width={100}
              tickFormatter={(v) => truncate(v)}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f9fafb' }} />
            <ReferenceLine
              x={marketAvg}
              stroke="#9ca3af"
              strokeDasharray="4 4"
              label={{
                value: 'Avg',
                position: 'top',
                style: { fontSize: '10px', fill: '#9ca3af' },
              }}
            />
            <Bar dataKey="rate" radius={[0, 4, 4, 0]} barSize={20}>
              {allEntries.map((entry, idx) => (
                <Cell
                  key={idx}
                  fill={entry.isSelf ? '#2563eb' : '#e5e7eb'}
                  stroke={entry.isSelf ? '#1d4ed8' : '#d1d5db'}
                  strokeWidth={entry.isSelf ? 1.5 : 0.5}
                />
              ))}
              <LabelList
                dataKey="rate"
                position="right"
                style={{ fontSize: '10px', fill: '#6b7280' }}
                formatter={(v: any) => formatCurrency(Number(v))}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Footer stats */}
      <div className="grid grid-cols-2 gap-2 mt-3">
        <div className="bg-gray-50 rounded-lg p-2.5">
          <div className="text-[10px] text-gray-400 uppercase tracking-wide">Lowest comp</div>
          <div className="text-base font-semibold text-green-700 mt-0.5">
            {formatCurrency(marketMin)}
          </div>
        </div>
        <div className="bg-gray-50 rounded-lg p-2.5">
          <div className="text-[10px] text-gray-400 uppercase tracking-wide">Highest comp</div>
          <div className="text-base font-semibold text-red-600 mt-0.5">
            {formatCurrency(marketMax)}
          </div>
        </div>
      </div>
    </div>
  )
}

