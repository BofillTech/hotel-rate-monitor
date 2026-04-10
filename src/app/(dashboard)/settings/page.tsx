'use client'
import { useState } from 'react'
import { useHotel } from '@/hooks/useHotel'
import { Button } from '@/components/ui/Button'
import { CHECK_FREQUENCIES } from '@/lib/constants'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

export default function SettingsPage() {
  const { data: hotel, isLoading } = useHotel()
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [settings, setSettings] = useState({
    alert_threshold_pct: 5,
    alert_threshold_abs: 15,
    notify_email: true,
    notify_sms: false,
    check_frequency_mins: 60,
  })

  if (isLoading) return <LoadingSpinner />

  async function handleSave() {
    setSaving(true)
    await fetch('/api/hotels', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: hotel?.id,
        check_frequency_mins: settings.check_frequency_mins,
        settings: {
          ...hotel?.settings,
          alert_threshold_pct: settings.alert_threshold_pct,
          alert_threshold_abs: settings.alert_threshold_abs,
          notify_email: settings.notify_email,
          notify_sms: settings.notify_sms,
        }
      }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-5">
        <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-400 mt-0.5">Alert preferences and check frequency</p>
      </div>

      <div className="space-y-4">
        {/* Check frequency */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="text-sm font-medium text-gray-900 mb-4">Check frequency</h2>
          <div className="flex gap-2 flex-wrap">
            {CHECK_FREQUENCIES.map(f => (
              <button
                key={f.value}
                onClick={() => setSettings(p => ({ ...p, check_frequency_mins: f.value }))}
                className={`px-4 h-9 rounded-lg text-sm border transition-colors ${
                  settings.check_frequency_mins === f.value
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Alert thresholds */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="text-sm font-medium text-gray-900 mb-4">Alert thresholds</h2>
          <p className="text-xs text-gray-400 mb-4">Only alert on changes greater than both:</p>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={settings.alert_threshold_pct}
                onChange={e => setSettings(p => ({ ...p, alert_threshold_pct: +e.target.value }))}
                className="w-16 h-9 px-3 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:border-blue-400"
              />
              <span className="text-sm text-gray-500">% change</span>
            </div>
            <span className="text-gray-300">or</span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">$</span>
              <input
                type="number"
                value={settings.alert_threshold_abs}
                onChange={e => setSettings(p => ({ ...p, alert_threshold_abs: +e.target.value }))}
                className="w-16 h-9 px-3 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:border-blue-400"
              />
              <span className="text-sm text-gray-500">absolute</span>
            </div>
          </div>
        </div>

        {/* Notification channels */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="text-sm font-medium text-gray-900 mb-4">Notification channels</h2>
          <div className="space-y-3">
            {[
              { key: 'notify_email', label: 'Email alerts', sub: 'All plans · via SendGrid', plan: null },
              { key: 'notify_sms', label: 'SMS alerts', sub: 'Pro plan only · via Twilio', plan: 'pro' },
            ].map(item => (
              <div key={item.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="text-sm text-gray-700">{item.label}</div>
                  <div className="text-xs text-gray-400">{item.sub}</div>
                </div>
                <button
                  onClick={() => setSettings(p => ({ ...p, [item.key]: !p[item.key as keyof typeof p] }))}
                  className={`w-10 h-6 rounded-full transition-colors relative ${
                    settings[item.key as keyof typeof settings] ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${
                    settings[item.key as keyof typeof settings] ? 'translate-x-4' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <Button variant="primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : saved ? '✓ Saved' : 'Save settings'}
          </Button>
        </div>
      </div>
    </div>
  )
}
