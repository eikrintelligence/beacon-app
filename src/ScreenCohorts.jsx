import React, { useState, useEffect } from 'react'

const BASE = 'https://sja.eikr.ee/api'

function cellColor(pct) {
  if (pct === null) return { bg: 'transparent', color: 'var(--ink-4)' }
  if (pct === 100)  return { bg: 'transparent', color: 'var(--ink-3)', fontWeight: 400 }
  if (pct >= 40)    return { bg: 'rgba(34,197,94,0.15)',  color: 'var(--up)',     fontWeight: 700 }
  if (pct >= 20)    return { bg: 'rgba(234,179,8,0.15)',  color: '#b45309',       fontWeight: 600 }
  return               { bg: 'rgba(239,68,68,0.12)',  color: 'var(--dn)',     fontWeight: 600 }
}

function KpiCard({ label, value, sub, color }) {
  return (
    <div className="card" style={{ padding: '20px 24px' }}>
      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', color: 'var(--ink-3)', textTransform: 'uppercase', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 32, fontWeight: 800, color: color || 'var(--ink)', fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>{value ?? '—'}</div>
      {sub && <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 4 }}>{sub}</div>}
    </div>
  )
}

export default function ScreenCohorts({ token, workspaceId, workspaceData }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const hasShopify = workspaceData?.connections?.some(
    c => c.platform === 'shopify' && c.status === 'active'
  )

  useEffect(() => {
    if (!hasShopify || !workspaceId) return
    setLoading(true)
    fetch(`${BASE}/cohorts?workspace_id=${workspaceId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(d => { if (d.error) setError(d.error); else setData(d) })
      .catch(() => setError('Failed to load cohort data'))
      .finally(() => setLoading(false))
  }, [hasShopify, workspaceId, token])

  if (!hasShopify) {
    return (
      <div className="page">
        <div className="page-head">
          <div><h1>Cohorts</h1><div className="sub">Customer retention by acquisition week</div></div>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '64px 24px', maxWidth: 480, margin: '0 auto' }}>
          <div style={{ fontSize: 52, marginBottom: 20 }}>🔌</div>
          <h2 style={{ marginBottom: 10 }}>Connect Shopify to see cohort data</h2>
          <div style={{ color: 'var(--ink-3)', fontSize: 15, lineHeight: 1.6, marginBottom: 28 }}>
            Link your Shopify store to see which customer cohorts retain best over time.
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <div style={{ padding: '12px 16px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--surface)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>⬜</span>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>Shopify</div>
                <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>Orders, customers, cohorts</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="page-head">
        <div><h1>Cohorts</h1><div className="sub">Customer retention by acquisition week</div></div>
      </div>

      {loading && <div className="muted">Calculating cohorts...</div>}
      {error && <div style={{ color: 'var(--dn)', fontSize: 14 }}>{error}</div>}

      {data?.insufficient && (
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px', maxWidth: 480, margin: '0 auto' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>📊</div>
          <h3 style={{ marginBottom: 8 }}>Not enough data yet</h3>
          <div style={{ color: 'var(--ink-3)', fontSize: 14, lineHeight: 1.6 }}>
            Cohort analysis needs at least 4 weeks of order history. Keep collecting data and check back soon.
          </div>
          {data.cohorts?.length > 0 && (
            <div style={{ marginTop: 16, fontSize: 12, color: 'var(--ink-4)' }}>
              {data.cohorts.length} week{data.cohorts.length !== 1 ? 's' : ''} of data collected so far
            </div>
          )}
        </div>
      )}

      {data && !data.insufficient && data.cohorts?.length > 0 && (
        <>
          {data.summary && (
            <div className="grid-2" style={{ gap: 12 }}>
              <KpiCard
                label="Avg week-1 retention"
                value={data.summary.avgW1 != null ? `${data.summary.avgW1}%` : null}
                sub="Customers who came back in week 1"
                color={data.summary.avgW1 >= 30 ? 'var(--up)' : data.summary.avgW1 >= 15 ? 'var(--ink)' : 'var(--dn)'}
              />
              <KpiCard
                label="Avg week-4 retention"
                value={data.summary.avgW4 != null ? `${data.summary.avgW4}%` : null}
                sub="Customers who came back in week 4"
                color={data.summary.avgW4 >= 15 ? 'var(--up)' : data.summary.avgW4 >= 8 ? 'var(--ink)' : 'var(--dn)'}
              />
              <KpiCard
                label="Best cohort"
                value={data.summary.bestCohort}
                sub="Highest week-1 retention"
                color="var(--up)"
              />
              <KpiCard
                label="Worst cohort"
                value={data.summary.worstCohort}
                sub="Lowest week-1 retention"
                color="var(--dn)"
              />
            </div>
          )}

          <div className="card" style={{ overflowX: 'auto' }}>
            <h3 style={{ marginBottom: 16 }}>Retention by cohort week</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '8px 12px', color: 'var(--ink-3)', fontWeight: 600, fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>Cohort</th>
                  <th style={{ padding: '8px 10px', color: 'var(--ink-3)', fontWeight: 600, fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase' }}>Size</th>
                  {data.weekCols.map(w => (
                    <th key={w} style={{ padding: '8px 10px', color: 'var(--ink-3)', fontWeight: 600, fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase' }}>W{w}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.cohorts.map((cohort, i) => (
                  <tr key={i} style={{ borderTop: '1px solid var(--border)' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 500, whiteSpace: 'nowrap', color: 'var(--ink)' }}>{cohort.label}</td>
                    <td style={{ padding: '10px', textAlign: 'center', color: 'var(--ink-2)', fontFamily: 'var(--font-mono)', fontSize: 12 }}>{cohort.size}</td>
                    {data.weekCols.map(w => {
                      const pct = cohort.retention[w]
                      const style = cellColor(pct)
                      return (
                        <td key={w} style={{ padding: '6px 4px', textAlign: 'center' }}>
                          {pct === null ? (
                            <span style={{ color: 'var(--ink-4)', fontSize: 11 }}>—</span>
                          ) : (
                            <span style={{
                              display: 'inline-block',
                              padding: '4px 8px',
                              borderRadius: 6,
                              background: style.bg,
                              color: style.color,
                              fontWeight: style.fontWeight,
                              fontFamily: 'var(--font-mono)',
                              fontSize: 12,
                              minWidth: 36,
                            }}>
                              {pct}%
                            </span>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ marginTop: 16, display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 12, color: 'var(--ink-3)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 12, height: 12, borderRadius: 3, background: 'rgba(34,197,94,0.25)', display: 'inline-block' }}/>
                ≥40% retained
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 12, height: 12, borderRadius: 3, background: 'rgba(234,179,8,0.25)', display: 'inline-block' }}/>
                20–40%
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 12, height: 12, borderRadius: 3, background: 'rgba(239,68,68,0.2)', display: 'inline-block' }}/>
                &lt;20%
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ color: 'var(--ink-4)', fontFamily: 'var(--font-mono)' }}>—</span>
                Window not yet reached
              </span>
            </div>
            {data.fromCache && (
              <div style={{ marginTop: 10, fontSize: 11, color: 'var(--ink-4)', textAlign: 'right' }}>Cached — updates hourly</div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
