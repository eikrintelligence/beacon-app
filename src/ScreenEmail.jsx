import React, { useState, useEffect } from 'react'
import { Icon } from './shared'

const BASE = 'https://sja.eikr.ee/api'

const DEMO = {
  list_size: 12840,
  lists: [{ name: 'DTN Newsletter', size: 8200 }, { name: 'SMS Subscribers', size: 2900 }, { name: 'VIP Customers', size: 1740 }],
  open_rate: 31.4, click_rate: 4.8, revenue_attributed: 18600, unsubscribe_rate: 0.4,
  flow_performance: [
    { name: 'Welcome Series', revenue: 8400, emails_sent: 4200, open_rate: 48.2 },
    { name: 'Abandoned Cart', revenue: 6200, emails_sent: 2100, open_rate: 41.7 },
    { name: 'Post-Purchase', revenue: 4000, emails_sent: 3800, open_rate: 38.9 },
  ],
  campaigns: [
    { name: 'May Flash Sale', sent_at: '2026-05-20', status: 'sent' },
    { name: 'TAILWAG10 Welcome', sent_at: '2026-05-25', status: 'sent' },
  ],
  demo: true
}

function KpiCard({ label, value, sub, color }) {
  return (
    <div className="card" style={{ padding: '20px 24px' }}>
      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', color: 'var(--ink-3)', textTransform: 'uppercase', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 36, fontWeight: 800, color: color || 'var(--ink)', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 4 }}>{sub}</div>}
    </div>
  )
}

export function ScreenEmail({ token, workspaceId }) {
  const [data, setData] = useState(DEMO)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token || !workspaceId) { setLoading(false); return }
    fetch(`${BASE}/klaviyo/metrics?workspace_id=${workspaceId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(d => { if (!d.error) setData(d) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [token, workspaceId])

  const fmt = n => n >= 1000000 ? `$${(n/1000000).toFixed(1)}M` : n >= 1000 ? `$${(n/1000).toFixed(0)}k` : `$${n}`

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Email & SMS</h1>
          <div className="sub">Klaviyo · {data.list_size?.toLocaleString()} subscribers{data.demo ? ' · demo data' : ''}</div>
        </div>
      </div>

      {loading && <div className="muted">Loading...</div>}

      <div className="grid-2" style={{ gap: 12 }}>
        <KpiCard label="List size" value={data.list_size?.toLocaleString()} sub={`${data.lists?.length || 0} lists`}/>
        <KpiCard label="Open rate" value={`${data.open_rate}%`} sub={data.open_rate >= 25 ? '✓ Above benchmark' : '↓ Below 25% benchmark'} color={data.open_rate >= 25 ? 'var(--up)' : 'var(--dn)'}/>
        <KpiCard label="Click rate" value={`${data.click_rate}%`} sub="Last 30 days"/>
        <KpiCard label="Revenue attributed" value={fmt(data.revenue_attributed)} sub="From email/SMS flows + campaigns"/>
      </div>

      {/* Lists breakdown */}
      <div className="card">
        <h3 style={{ marginBottom: 16 }}>Subscriber lists</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {(data.lists || []).map(l => {
            const pct = data.list_size > 0 ? Math.round(l.size / data.list_size * 100) : 0
            return (
              <div key={l.name} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 160, fontSize: 13, fontWeight: 500 }}>{l.name}</div>
                <div style={{ flex: 1, height: 8, background: 'var(--surface-2)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: 'var(--accent)', borderRadius: 4 }}/>
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, width: 60, textAlign: 'right' }}>{l.size?.toLocaleString()}</div>
                <div style={{ fontSize: 11, color: 'var(--ink-3)', width: 36, textAlign: 'right' }}>{pct}%</div>
              </div>
            )
          })}
        </div>
        <div style={{ marginTop: 12, padding: '10px 14px', background: 'var(--surface-2)', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>Unsubscribe rate</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: data.unsubscribe_rate < 0.5 ? 'var(--up)' : 'var(--dn)' }}>{data.unsubscribe_rate}%</span>
        </div>
      </div>

      {/* Flow performance */}
      {data.flow_performance && (
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>Flow performance</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 100px 100px', gap: '8px 16px', alignItems: 'center' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Flow</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'right' }}>Revenue</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'right' }}>Sent</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'right' }}>Open %</div>
            {data.flow_performance.map(f => (
              <React.Fragment key={f.name}>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{f.name}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent)', textAlign: 'right' }}>{fmt(f.revenue)}</div>
                <div style={{ fontSize: 13, color: 'var(--ink-2)', textAlign: 'right' }}>{f.emails_sent?.toLocaleString()}</div>
                <div style={{ fontSize: 13, color: f.open_rate >= 30 ? 'var(--up)' : 'var(--ink-2)', textAlign: 'right' }}>{f.open_rate}%</div>
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* Recent campaigns */}
      {data.campaigns && data.campaigns.length > 0 && (
        <div className="card">
          <h3 style={{ marginBottom: 16 }}>Recent campaigns</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {data.campaigns.map((c, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--surface-2)', borderRadius: 8 }}>
                <div style={{ fontSize: 14, fontWeight: 500 }}>{c.name}</div>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  {c.sent_at && <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>{new Date(c.sent_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>}
                  <span className="chip" style={{ textTransform: 'capitalize' }}>{c.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
