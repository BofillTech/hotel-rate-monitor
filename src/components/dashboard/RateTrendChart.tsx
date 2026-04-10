'use client'
import { useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { RateTrend } from '@/lib/types'
import { formatCurrency } from '@/lib/utils'

const COLORS = ['#378ADD','#639922','#E24B4A','#EF9F27','#7F77DD','#1D9E75']

interface RateTrendChartProps {
  trends: Array<{ competitorId: string; competitorName: string; data: RateTrend[] }>
  loading?: boolean
}

export function RateTrendChart({ trends, loading }: RateTrendChartProps) {
  const [hidden, setHidden] = useState<Set<string>>(new Set())

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50">
          <div className="text-sm font-medium text-gray-900">Rate trends — last 30 days</div>
        </div>
        <div className="h-56 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  // Merge all data by date
  const dateMap: Record<string, Record<string, number>> = {}
  trends.forEach(t => {
    t.data.forEach(d => {
      if (!dateMap[d.scraped_date]) dateMap[d.scraped_date] = {}
      dateMap[d.scraped_date][t.competitorId] = Math.round(d.avg_rate)
    })
  })
  const chartData = Object.entries(dateMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, vals]) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      ...vals
    }))

  function toggleLine(id: string) {
    setHidden(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-gray-50">
        <div>
          <div className="text-sm font-medium text-gray-900">Rate trends — last 30 days</div>
          <div className="text-xs text-gray-400 mt-0.5">Click legend to show/hide competitors</div>
        </div>
      </div>
      <div className="px-5 pt-4 pb-2">
        <div className="flex flex-wrap gap-3 mb-4">
          {trends.map((t, i) => (
            <button
              key={t.competitorId}
              onClick={() => toggleLine(t.competitorId)}
              className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-900 transition-colors"
              style={{ opacity: hidden.has(t.competitorId) ? 0.35 : 1 }}
            >
              <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
              {t.competitorName}
            </button>
          ))}
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9ca3af' }} tickLine={false} axisLine={false} />
            <YAxis
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={v => `$${v}`}
              width={40}
            />
            <Tooltip
              formatter={(value: any) => formatCurrency(value as number)}
              contentStyle={{ fontSize: 12, border: '1px solid #e5e7eb', borderRadius: 8 }}
            />
            {trends.map((t, i) => (
              <Line
                key={t.competitorId}
                type="monotone"
                dataKey={t.competitorId}
                stroke={COLORS[i % COLORS.length]}
                strokeWidth={i === 0 ? 2.5 : 1.5}
                dot={false}
                hide={hidden.has(t.competitorId)}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
