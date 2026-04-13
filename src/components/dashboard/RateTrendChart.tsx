'use client'
import { useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'
import { formatCurrency } from '@/lib/utils'

const COLORS = ['#378ADD','#639922','#E24B4A','#EF9F27','#7F77DD','#1D9E75','#D85A30','#D4537E']

interface TrendSeries {
  competitorId: string
  competitorName: string
  isSelf?: boolean
  data: Array<{ date: string; rate: number }>
}

interface RateTrendChartProps {
  series: TrendSeries[]
  currency?: string
  loading?: boolean
}

export function RateTrendChart({ series, currency = 'USD', loading }: RateTrendChartProps) {
  const [hidden, setHidden] = useState<Set<string>>(new Set())
  const [compsVisible, setCompsVisible] = useState(true)

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

  // Sort: self first, then competitors
  const sorted = [...series].sort((a, b) => (a.isSelf ? -1 : b.isSelf ? 1 : 0))

  // Merge all data by date
  const dateMap: Record<string, Record<string, number>> = {}
  sorted.forEach(s => {
    s.data.forEach(d => {
      if (!dateMap[d.date]) dateMap[d.date] = {}
      dateMap[d.date][s.competitorId] = d.rate
    })
  })
  const chartData = Object.entries(dateMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, vals]) => ({
      date: new Date(date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      ...vals,
    }))

  function toggleLine(id: string) {
    setHidden(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleAllComps() {
    if (compsVisible) {
      const compIds = sorted.filter(s => !s.isSelf).map(s => s.competitorId)
      setHidden(new Set(compIds))
    } else {
      setHidden(new Set())
    }
    setCompsVisible(!compsVisible)
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-gray-50">
        <div>
          <div className="text-sm font-medium text-gray-900">Rate trends — last 30 days</div>
          <div className="text-xs text-gray-400 mt-0.5">Nightly rate for standard room · hover to compare</div>
        </div>
        <button
          onClick={toggleAllComps}
          className="text-xs text-gray-500 hover:text-gray-900 border border-gray-200 rounded-lg px-3 py-1.5 bg-white transition-colors"
        >
          {compsVisible ? 'Hide all comps' : 'Show all comps'}
        </button>
      </div>
      <div className="px-5 pt-4 pb-2">
        {/* Legend */}
        <div className="flex flex-wrap gap-4 mb-4">
          {sorted.map((s, i) => (
            <button
              key={s.competitorId}
              onClick={() => toggleLine(s.competitorId)}
              className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-900 transition-colors"
              style={{ opacity: hidden.has(s.competitorId) ? 0.35 : 1 }}
            >
              <span
                className="inline-block w-4 border-t-2"
                style={{
                  borderColor: COLORS[i % COLORS.length],
                  borderStyle: s.isSelf ? 'solid' : 'dashed',
                }}
              />
              <span className={s.isSelf ? 'font-medium' : ''}>
                {s.competitorName}{s.isSelf ? ' (you)' : ''}
              </span>
            </button>
          ))}
        </div>

        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={v => `$${v}`}
              width={45}
            />
            <Tooltip
              formatter={((value: any, name: string) => {
                const match = sorted.find(s => s.competitorId === name)
                return [
                  formatCurrency(Number(value), currency),
                  match ? `${match.competitorName}${match.isSelf ? ' (you)' : ''}` : name,
                ]
              }) as any}
              contentStyle={{ fontSize: 12, border: '1px solid #e5e7eb', borderRadius: 8 }}
            />
            {sorted.map((s, i) => (
              <Line
                key={s.competitorId}
                type="monotone"
                dataKey={s.competitorId}
                stroke={COLORS[i % COLORS.length]}
                strokeWidth={s.isSelf ? 3 : 1.5}
                strokeDasharray={s.isSelf ? undefined : '6 3'}
                dot={false}
                connectNulls
                hide={hidden.has(s.competitorId)}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
'use client'
import { useState } from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts'
import { formatCurrency } from '@/lib/utils'

const COLORS = ['#378ADD','#639922','#E24B4A','#EF9F27','#7F77DD','#1D9E75','#D85A30','#D4537E']

interface TrendSeries {
  competitorId: string
  competitorName: string
  isSelf?: boolean
  data: Array<{ date: string; rate: number }>
}

interface RateTrendChartProps {
  series: TrendSeries[]
  currency?: string
  loading?: boolean
}

export function RateTrendChart({ series, currency = 'USD', loading }: RateTrendChartProps) {
  const [hidden, setHidden] = useState<Set<string>>(new Set())
  const [compsVisible, setCompsVisible] = useState(true)

  if (loading) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50">
          <div className="text-sm font-medium text-gray-900">Rate trends â last 30 days</div>
        </div>
        <div className="h-56 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  // Sort: self first, then competitors
  const sorted = [...series].sort((a, b) => (a.isSelf ? -1 : b.isSelf ? 1 : 0))

  // Merge all data by date
  const dateMap: Record<string, Record<string, number>> = {}
  sorted.forEach(s => {
    s.data.forEach(d => {
      if (!dateMap[d.date]) dateMap[d.date] = {}
      dateMap[d.date][s.competitorId] = d.rate
    })
  })
  const chartData = Object.entries(dateMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, vals]) => ({
      date: new Date(date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      ...vals,
    }))

  function toggleLine(id: string) {
    setHidden(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleAllComps() {
    if (compsVisible) {
      const compIds = sorted.filter(s => !s.isSelf).map(s => s.competitorId)
      setHidden(new Set(compIds))
    } else {
      setHidden(new Set())
    }
    setCompsVisible(!compsVisible)
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-gray-50">
        <div>
          <div className="text-sm font-medium text-gray-900">Rate trends â last 30 days</div>
          <div className="text-xs text-gray-400 mt-0.5">Nightly rate for standard room Â· hover to compare</div>
        </div>
        <button
          onClick={toggleAllComps}
          className="text-xs text-gray-500 hover:text-gray-900 border border-gray-200 rounded-lg px-3 py-1.5 bg-white transition-colors"
        >
          {compsVisible ? 'Hide all comps' : 'Show all comps'}
        </button>
      </div>
      <div className="px-5 pt-4 pb-2">
        {/* Legend */}
        <div className="flex flex-wrap gap-4 mb-4">
          {sorted.map((s, i) => (
            <button
              key={s.competitorId}
              onClick={() => toggleLine(s.competitorId)}
              className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-900 transition-colors"
              style={{ opacity: hidden.has(s.competitorId) ? 0.35 : 1 }}
            >
              <span
                className="inline-block w-4 border-t-2"
                style={{
                  borderColor: COLORS[i % COLORS.length],
                  borderStyle: s.isSelf ? 'solid' : 'dashed',
                }}
              />
              <span className={s.isSelf ? 'font-medium' : ''}>
                {s.competitorName}{s.isSelf ? ' (you)' : ''}
              </span>
            </button>
          ))}
        </div>

        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={v => `$${v}`}
              width={45}
            />
            <Tooltip
              formatter={((value: any, name: string) => {
                const match = sorted.find(s => s.competitorId === name)
                return [
                  formatCurrency(Number(value), currency),
                  match ? `${match.competitorName}${match.isSelf ? ' (you)' : ''}` : name,
                ]
              }) as any}
              contentStyle={{ fontSize: 12, border: '1px solid #e5e7eb', borderRadius: 8 }}
            />
            {sorted.map((s, i) => (
              <Line
                key={s.competitorId}
                type="monotone"
                dataKey={s.competitorId}
                stroke={COLORS[i % COLORS.length]}
                strokeWidth={s.isSelf ? 3 : 1.5}
                strokeDasharray={s.isSelf ? undefined : '6 3'}
                dot={false}
                connectNulls
                hide={hidden.has(s.competitorId)}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
