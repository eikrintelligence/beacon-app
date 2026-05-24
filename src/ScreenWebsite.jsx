import React, { useState, useEffect } from 'react'
import { Icon, Donut } from './shared'

const BASE = 'https://sja.eikr.ee/api'

const DEMO = {
  sessions: 48200, users: 34100, bounce_rate: 58.3, conversions: 1284,
  traffic_by_source: [
    { source: 'Paid Social', sessions: 18400, users: 13200, conversions: 512 },
    { source: 'Organic Search', sessions: 12100, users: 9800, conversions: 280 },
    { source: 'Direct', sessions: 8900, users: 6200, conversions: 198 },
    { source: 'Email', sessions: 5200, users: 3900, conversions: 184 },
    { source: 'Paid Search', sessions: 3600, users: 1000, conversions: 110 },
  ],
  demo: true
}

const SOURCE_COLORS = ['var(--accent)', 'var(--accent-2)', 'var(--accent-3)', 'var(--accent-4)', '#888']

function KpiCard({ label, value, sub, color }) {
  return (
    <div className="card" style={{ padding: '20px 24px' }}>
      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', color: 'var(--ink-3)', textTransform: 'uppercase', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 36, fontWeight: 800, color: color || 'var(--ink)', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 4 }}>{sub}</div>}
    </div>
  )
}

export function ScreenWebsite({ token, workspaceId }) {
  const [data, setData] = useState(DEMO)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token || !workspaceId) { setLoading(false); return }
    fetch(`${BASE}/ga4/metrics?workspace_id=${workspaceId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(d => { if (!d.error) setData(d) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [token, workspaceId])

  const fmt = n => n >= 1000 ? `${(n/1000).toFixed(1)}k` : String(n)
  const totalSessions = data.traffic_by_source?.reduce((s, r) => s + r.sessions, 0) || data.sessions || 1
  const cvr = data.sessions > 0 ? ((data.conversions / data.sessions) * 100).toFixed(2) : '0.00'

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Website</h1>
          <div className="sub">Google Analytics 4{data.demo ? ' · demo data' : ''}</div>
        </div>
      </div>

      {loading && <div className="muted">Loading...</div>}

      <div className="grid-2" style={{ gap: 12 }}>
        <KpiCard label="Sessions" value={fmt(data.sessions)} sub="Last 30 days"/>
        <KpiCard label="Unique visitors" value={fmt(data.users)} sub="Last 30 days"/>
        <KpiCard label="Bounce rate" value={`${data.bounce_rate}%`} sub={data.bounce_rate < 60 ? '✓ Healthy' : '↑ Elevated'} color={data.bounce_rate < 60 ? 'var(--up)' : 'var(--dn)'}/>
        <KpiCard label="CVR" value={`${cvr}%`} sub={`${data.conversions?.toLocaleString()} conversions`} color={parseFloat(cvr) >= 1 ? 'var(--up)' : 'var(--dn)'}/>
      </div>

      {/* Traffic by source */}
      <div className="card">
        <h3 style={{ marginBottom: 16 }}>Traffic by source</h3>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <div style={{ flexShrink: 0 }}>
            <Donut
              value={0.6}
              label={fmt(data.sessions)}
              size={120}
              color="var(--accent)"
            />
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {(data.traffic_by_source || []).map((row, i) => {
              const pct = Math.round((row.sessions / totalSessions) * 100)
              const color = SOURCE_COLORS[i] || '#888'
              return (
                <div key={row.source} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 3, background: color, flexShrink: 0 }}/>
                  <div style={{ width: 130, fontSize: 13 }}>{row.source}</div>
                  <div style={{ flex: 1, height: 8, background: 'var(--surface-2)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 4 }}/>
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, width: 48, textAlign: 'right' }}>{fmt(row.sessions)}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-3)', width: 36, textAlign: 'right' }}>{pct}%</div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Conversions by source */}
      <div className="card">
        <h3 style={{ marginBottom: 16 }}>Conversions by source</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 80px 80px 80px', gap: '8px 16px', alignItems: 'center' }}>
          {['Source', 'Sessions', 'Conv.', 'CVR'].map(h => (
            <div key={h} style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: h !== 'Source' ? 'right' : 'left' }}>{h}</div>
          ))}
          {(data.traffic_by_source || []).map((row, i) => {
            const rowCvr = row.sessions > 0 ? ((row.conversions / row.sessions) * 100).toFixed(1) : '0.0'
            return (
              <React.Fragment key={row.source}>
                <div style={{ fontSize: 14 }}>{row.source}</div>
                <div style={{ fontSize: 13, textAlign: 'right' }}>{fmt(row.sessions)}</div>
                <div style={{ fontSize: 13, fontWeight: 600, textAlign: 'right' }}>{row.conversions}</div>
                <div style={{ fontSize: 13, textAlign: 'right', color: parseFloat(rowCvr) >= 1 ? 'var(--up)' : 'var(--ink-2)' }}>{rowCvr}%</div>
              </React.Fragment>
            )
          })}
        </div>
      </div>
    </div>
  )
}
