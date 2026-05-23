import React, { useState } from 'react'

const DEMO_ALERTS = [
  { id: 'd1', severity: 'critical', message: 'Meta ROAS dropped to 1.8x — below your 2.5x threshold', created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), seen: false },
  { id: 'd2', severity: 'warning', message: 'Revenue pace at 82% of target — need $14.2k/week to close gap', created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), seen: false },
  { id: 'd3', severity: 'warning', message: 'Repurchase rate 11% — below your 15% target', created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), seen: true },
]

function severityStyle(severity) {
  if (severity === 'critical') return { bg: 'color-mix(in oklab, var(--dn) 10%, var(--surface))', border: 'color-mix(in oklab, var(--dn) 25%, var(--surface))', icon: '🚨' }
  return { bg: 'color-mix(in oklab, #f59e0b 10%, var(--surface))', border: 'color-mix(in oklab, #f59e0b 28%, var(--surface))', icon: '⚠️' }
}

export function ScreenAlerts({ workspaceData, token }) {
  const initial = workspaceData?.alerts?.length > 0 ? workspaceData.alerts : DEMO_ALERTS
  const [alerts, setAlerts] = useState(initial)
  const [dismissing, setDismissing] = useState(null)
  const [saved, setSaved] = useState(false)
  const [thresholds, setThresholds] = useState({
    roas_min: '2.5',
    pace_warn_pct: '90',
    repurchase_min: '15',
  })

  async function dismiss(alertId) {
    setDismissing(alertId)
    try {
      await fetch(`https://sja.eikr.ee/api/alerts/${alertId}/dismiss`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      })
    } catch {}
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, seen: true } : a))
    setDismissing(null)
  }

  const active = alerts.filter(a => !a.seen)
  const resolved = alerts.filter(a => a.seen)

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Alerts</h1>
          <div className="sub">{active.length} active · {resolved.length} resolved</div>
        </div>
      </div>

      <div className="stack" style={{ gap: 10 }}>
        <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', color: 'var(--ink-3)', fontFamily: 'var(--font-mono)' }}>ACTIVE</div>
        {active.length === 0 && (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--ink-3)', fontSize: 14, background: 'var(--surface-2)', borderRadius: 12 }}>
            ✓ No active alerts — you're all clear
          </div>
        )}
        {active.map(alert => {
          const s = severityStyle(alert.severity)
          return (
            <div key={alert.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '14px 16px', borderRadius: 12, background: s.bg, border: `1px solid ${s.border}` }}>
              <span style={{ fontSize: 20, flexShrink: 0 }}>{s.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)', lineHeight: 1.4 }}>{alert.message}</div>
                <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 4 }}>{new Date(alert.created_at).toLocaleString()}</div>
              </div>
              <button className="btn sm ghost" onClick={() => dismiss(alert.id)} disabled={dismissing === alert.id} style={{ flexShrink: 0, marginTop: 2 }}>
                {dismissing === alert.id ? '...' : 'Dismiss'}
              </button>
            </div>
          )
        })}
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 4 }}>Alert thresholds</h3>
        <div style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 16 }}>Sjá triggers an alert when these limits are breached</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {[
            { key: 'roas_min', label: 'Min blended ROAS', suffix: 'x', desc: 'Alert when any channel drops below' },
            { key: 'pace_warn_pct', label: 'Pace warning', suffix: '%', desc: 'Alert when revenue pace drops below X% of target' },
            { key: 'repurchase_min', label: 'Min repurchase rate', suffix: '%', desc: 'Alert when repeat buyer rate falls below' },
          ].map(t => (
            <div key={t.key} style={{ padding: '14px', background: 'var(--surface-2)', borderRadius: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.06em', color: 'var(--ink-3)', textTransform: 'uppercase', marginBottom: 8 }}>{t.label}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <input
                  type="number"
                  value={thresholds[t.key]}
                  onChange={e => setThresholds(prev => ({ ...prev, [t.key]: e.target.value }))}
                  style={{ width: 72, padding: '6px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', fontSize: 22, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--ink)', outline: 'none' }}
                />
                <span style={{ fontSize: 14, color: 'var(--ink-3)' }}>{t.suffix}</span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 6, lineHeight: 1.4 }}>{t.desc}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn primary" onClick={() => { setSaved(true); setTimeout(() => setSaved(false), 2000) }}>
            Save thresholds
          </button>
          {saved && <span style={{ fontSize: 13, color: 'var(--up)', fontWeight: 600 }}>✓ Saved</span>}
        </div>
      </div>

      {resolved.length > 0 && (
        <div className="stack" style={{ gap: 8 }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', color: 'var(--ink-3)', fontFamily: 'var(--font-mono)' }}>RESOLVED</div>
          {resolved.map(alert => (
            <div key={alert.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10, background: 'var(--surface-2)', opacity: 0.6 }}>
              <span style={{ fontSize: 14, color: 'var(--up)' }}>✓</span>
              <div style={{ flex: 1, fontSize: 13, color: 'var(--ink-2)' }}>{alert.message}</div>
              <div style={{ fontSize: 11, color: 'var(--ink-3)', flexShrink: 0 }}>{new Date(alert.created_at).toLocaleDateString()}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
