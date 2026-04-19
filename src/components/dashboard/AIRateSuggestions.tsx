'use client'

import { AlertTriangle, ArrowUp, ArrowDown, Minus, Brain } from 'lucide-react'

// -- Placeholder AI suggestion data (RED = not real data yet) ----
const PLACEHOLDER_SUGGESTIONS = [
  {
    id: '1',
    period: 'Tonight',
    currentRate: 234,
    suggestedRate: 249,
    direction: 'up' as const,
    confidence: 'high' as const,
    reasoning: 'You are 18% below market average. Ocean Surf and Montauk Blue are priced significantly lower — raising to $249 keeps you competitive while improving RevPAR.',
  },
  {
    id: '2',
    period: 'This Weekend',
    currentRate: 234,
    suggestedRate: 289,
    direction: 'up' as const,
    confidence: 'medium' as const,
    reasoning: 'Weekend demand historically 35% higher. Competitors averaging $298 for Sat night. A move to $289 captures upside without pricing above Hero Beach Club.',
  },
  {
    id: '3',
    period: '+7 Days',
    currentRate: 234,
    suggestedRate: 234,
    direction: 'hold' as const,
    confidence: 'medium' as const,
    reasoning: 'Midweek rates are well-positioned. Market average is $228. Holding at current level maintains a slight premium positioning.',
  },
  {
    id: '4',
    period: '+30 Days',
    currentRate: 234,
    suggestedRate: 319,
    direction: 'up' as const,
    confidence: 'low' as const,
    reasoning: 'Memorial Day proximity. Limited data this far out but early competitor signals suggest $300-350 range. Consider gradual increases.',
  },
]

const DIRECTION_CONFIG = {
  up: { icon: ArrowUp, color: 'text-green-600', bg: 'bg-green-50', label: 'Increase' },
  down: { icon: ArrowDown, color: 'text-red-600', bg: 'bg-red-50', label: 'Decrease' },
  hold: { icon: Minus, color: 'text-blue-600', bg: 'bg-blue-50', label: 'Hold' },
}

const CONFIDENCE_DOTS = {
  high: [true, true, true],
  medium: [true, true, false],
  low: [true, false, false],
}

export default function AIRateSuggestions() {
  return (
    <div className="space-y-4">
      {/* Header with AI badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-purple-600" />
          <span className="text-xs font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">
            AI-Powered
          </span>
        </div>
        {/* Placeholder warning */}
        <div className="flex items-center gap-1.5">
          <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
          <span className="text-xs text-red-500 font-medium">Placeholder data</span>
        </div>
      </div>

      {/* Suggestion cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {PLACEHOLDER_SUGGESTIONS.map((sug) => {
          const dir = DIRECTION_CONFIG[sug.direction]
          const DirIcon = dir.icon
          const dots = CONFIDENCE_DOTS[sug.confidence]
          const diff = sug.suggestedRate - sug.currentRate

          return (
            <div
              key={sug.id}
              className="border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-shadow"
            >
              {/* Period + Direction */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-red-700 uppercase tracking-wide">
                  {sug.period}
                </span>
                <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${dir.bg} ${dir.color}`}>
                  <DirIcon className="w-3 h-3" />
                  {dir.label}
                </span>
              </div>

              {/* Rate comparison */}
              <div className="flex items-baseline gap-3 mb-2">
                <div>
                  <span className="text-xs text-red-400">Current</span>
                  <p className="text-lg font-bold text-red-600">${sug.currentRate}</p>
                </div>
                <span className="text-gray-300 text-lg">{'\u2192'}</span>
                <div>
                  <span className="text-xs text-red-400">Suggested</span>
                  <p className="text-lg font-bold text-red-600">${sug.suggestedRate}</p>
                </div>
                {diff !== 0 && (
                  <span className="text-sm font-medium text-red-400">
                    ({diff > 0 ? '+' : ''}{diff})
                  </span>
                )}
              </div>

              {/* Confidence indicator */}
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-[10px] text-red-400 uppercase">Confidence</span>
                <div className="flex gap-0.5">
                  {dots.map((filled, i) => (
                    <div
                      key={i}
                      className={`w-1.5 h-1.5 rounded-full ${filled ? 'bg-red-400' : 'bg-gray-200'}`}
                    />
                  ))}
                </div>
              </div>

              {/* Reasoning */}
              <p className="text-xs text-red-500 leading-relaxed">
                {sug.reasoning}
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
