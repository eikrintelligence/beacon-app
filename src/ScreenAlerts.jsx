import React, { useState } from 'react'

const DEMO_ALERTS = [
  { id: 'd1', type: 'low_roas_meta', severity: 'critical', message: 'Meta ROAS at 1.3x — below 1.5x threshold. Pause or reduce spend immediately.', created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), seen: false },
  { id: 'd2', type: 'tailwag10_no_redemptions', severity: 'warning', message: 'TAILWAG10 welcome code has 0 redemptions in 48h. Check that it\'s active and visible at checkout.', created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), seen: false },
  { id: 'd3', type: 'pace_below_85', severity: 'warning', message: 'Revenue pace at 79% of weekly target ($9,200 vs $11,700 needed). Adjust budget allocation.', created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), seen: false },
  { id: 'd4', type: 'low_conversion_rate', severity: 'critical', message: 'Site conversion rate at 0.7% — below 1% for 48h. Check landing pages and checkout flow.', created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), seen: true },
  { id: 'd5', type: 'low_email_open_rate', severity: 'warning', message: 'Klaviyo email open rate at 21.3% — below 25% target. Review subject lines and send times.', created_at: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(), seen: true },
]

const ALERT_TYPES = [
  {
    key: 'roas_min', label: 'Min ROAS (any channel)', suffix: 'x', default: '1.5',
    desc: 'Critical alert when any ad platform ROAS drops below this',
    severity: 'critical', example: 'Meta, Google, TikTok',
  },
  {
    key: 'spend_over_pct', label: 'Daily overspend warning', suffix: '%', default: '20',
    desc: 'Alert when daily spend exceeds budget by X% (Meta & Google)',
    severity: 'critical', example: 'e.g. 20% = spend $1,200 on $1,000 budget',
  },
  {
    key: 'conv_rate_min', label: 'Min site conversion rate', suffix: '%', default: '1',
    desc: 'Alert when GA4 CVR drops below this for 48+ hours',
    severity: 'critical', example: 'From GA4 sessions vs transactions',
  },
  {
    key: 'cpa_aov_pct', label: 'Max CPA / AOV ratio', suffix: '%', default: '70',
    desc: 'Alert when CPA exceeds X% of average Shopify order value',
    severity: 'warning', example: 'CPA $42 on AOV $58 = 72% → fires',
  },
  {
    key: 'tailwag_window', label: 'TAILWAG10 watch window', suffix: 'h', default: '48',
    desc: 'Alert if welcome code has zero redemptions in X hours',
    severity: 'warning', example: 'Checks Shopify discount code API',
  },
  {
    key: 'email_open_min', label: 'Min email open rate', suffix: '%', default: '25',
    desc: 'Alert when Klaviyo open rate drops below this threshold',
    severity: 'warning', example: 'From Klaviyo campaign analytics',
  },
  {
    key: 'pace_warn_pct', label: 'Revenue pace warning', suffix: '%', default: '85',
    desc: 'Alert when weekly revenue pace drops below X% of goal target',
    severity: 'warning', example: 'Compares actual/week vs target/week',
  },
  {
    key: 'churn_wow_max', label: 'Max subscription churn', suffix: '%', default: '10',
    desc: 'Critical alert when WoW subscription churn exceeds this rate',
    severity: 'critical', example: 'From Shopify recurring orders data',
  },
  {
    key: 'cart_abandon_max', label: 'Cart abandonment max', suffix: '%', default: '80',
    desc: 'Alert when cart abandonment rate exceeds this for 3+ days',
    severity: 'warning', example: 'From GA4 — triggers checkout flow review',
  },
]

function severityStyle(severity) {
  if (severity === 'critical')
    return { bg: 'color-mix(in oklab, var(--dn) 10%, var(--surface))', border: 'color-mix(in oklab, var(--dn) 25%, var(--surface))', icon: '🚨' }
  return { bg: 'color-mix(in oklab, #f59e0b 10%, var(--surface))', border: 'color-mix(in oklab, #f59e0b 28%, var(--surface))', icon: '⚠️' }
}

export function ScreenAlerts({ workspaceData, token }) {
  const initial = workspaceData?.alerts?.length > 0 ? workspaceData.alerts : DEMO_ALERTS
  const [alerts, setAlerts] = useState(initial)
  const [dismissing, setDismissing] = useState(null)
  const [saved, setSaved] = useState(false)
  const [thresholds, setThresholds] = useState(() =>
    Object.fromEntries(ALERT_TYPES.map(t => [t.key, t.default]))
  )

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
        <div style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 20 }}>
          Faro monitors these 9 conditions for Dog Treat Naturals and fires once per breach until dismissed
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
          {ALERT_TYPES.map(t => (
            <div key={t.key} style={{ padding: '14px 16px', background: 'var(--surface-2)', borderRadius: 12, border: `1px solid color-mix(in oklab, ${t.severity === 'critical' ? 'var(--dn)' : '#f59e0b'} 15%, var(--border))` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                <span style={{ fontSize: 13 }}>{t.severity === 'critical' ? '🚨' : '⚠️'}</span>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', color: 'var(--ink-3)', textTransform: 'uppercase', lineHeight: 1.2 }}>{t.label}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 8 }}>
                <input
                  type="number"
                  value={thresholds[t.key]}
                  onChange={e => setThresholds(prev => ({ ...prev, [t.key]: e.target.value }))}
                  style={{ width: 68, padding: '5px 8px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', fontSize: 20, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--ink)', outline: 'none' }}
                />
                <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>{t.suffix}</span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--ink-3)', lineHeight: 1.4 }}>{t.desc}</div>
              <div style={{ fontSize: 10, color: 'var(--ink-3)', marginTop: 4, fontFamily: 'var(--font-mono)', opacity: 0.7 }}>{t.example}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
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
