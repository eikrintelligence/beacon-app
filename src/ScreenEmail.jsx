import React, { useState, useEffect } from 'react'

const BASE = 'https://sja.eikr.ee/api'

function KpiCard({ label, value, sub, color }) {
  return (
    <div className="card" style={{ padding: '20px 24px' }}>
      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', color: 'var(--ink-3)', textTransform: 'uppercase', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 36, fontWeight: 800, color: color || 'var(--ink)', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 4 }}>{sub}</div>}
    </div>
  )
}

export function ScreenEmail({ token, workspaceId, onNavigate }) {
  const [data, setData] = useState(null)
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
          <h1>Email &amp; SMS</h1>
          <div className="sub">Klaviyo email &amp; SMS</div>
        </div>
      </div>

      {loading && <div className="muted">Loading...</div>}

      {!data && !loading && (
        <div className="card" style={{ padding: '48px 36px', textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🔌</div>
          <h3 style={{ marginBottom: 8 }}>Connect Klaviyo to see email data</h3>
          <p style={{ color: 'var(--ink-3)', marginBottom: 24, maxWidth: 400, margin: '0 auto 24px' }}>
            Link your Klaviyo account to see list size, open rates, flow performance and attributed revenue.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 28 }}>
            <div style={{ padding: '12px 16px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--surface)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>⬜</span>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>Klaviyo</div>
                <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>Email lists, flows, campaigns</div>
              </div>
            </div>
          </div>
          <button className="btn primary" onClick={() => onNavigate('connections')}>Connect sources →</button>
        </div>
      )}

      {data && (
        <>
          <div className="grid-2" style={{ gap: 12 }}>
            <KpiCard label="List size" value={data.list_size?.toLocaleString()} sub={`${data.lists?.length || 0} lists`}/>
            <KpiCard label="Open rate" value={`${data.open_rate}%`}
              sub={data.open_rate >= 25 ? '\u2713 Above benchmark' : '\u2193 Below 25% benchmark'}
              color={data.open_rate >= 25 ? 'var(--up)' : 'var(--dn)'}/>
            <KpiCard label="Click rate" value={`${data.click_rate}%`} sub="Last 30 days"/>
            <KpiCard label="Revenue attributed" value={fmt(data.revenue_attributed)} sub="From email/SMS flows + campaigns"/>
          </div>

          {data.lists?.length > 0 && (
            <div className="card">
              <h3 style={{ marginBottom: 16 }}>Subscriber lists</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {data.lists.map(l => {
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
              {data.unsubscribe_rate != null && (
                <div style={{ marginTop: 12, padding: '10px 14px', background: 'var(--surface-2)', borderRadius: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: 'var(--ink-3)' }}>Unsubscribe rate</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: data.unsubscribe_rate < 0.5 ? 'var(--up)' : 'var(--dn)' }}>{data.unsubscribe_rate}%</span>
                </div>
              )}
            </div>
          )}

          {data.flow_performance?.length > 0 && (
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

          {data.campaigns?.length > 0 && (
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
        </>
      )}
    </div>
  )
}
