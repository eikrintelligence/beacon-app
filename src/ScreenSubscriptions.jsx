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

export function ScreenSubscriptions({ token, workspaceId, workspaceData }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const hasShopify = workspaceData?.connections?.some(
    c => c.platform === 'shopify' && c.status === 'active'
  )

  useEffect(() => {
    if (!hasShopify || !workspaceId) return
    setLoading(true)
    fetch(`${BASE}/shopify/customers?workspace_id=${workspaceId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(d => { if (d.error) { setError(d.error) } else { setData(d) } })
      .catch(() => setError('Failed to load customer data'))
      .finally(() => setLoading(false))
  }, [hasShopify, workspaceId, token])

  if (!hasShopify) {
    return (
      <div className="page">
        <div className="page-head">
          <div>
            <h1>Subscriptions</h1>
            <div className="sub">Customer retention &amp; repeat purchase health</div>
          </div>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '64px 24px', maxWidth: 480, margin: '0 auto' }}>
          <div style={{ fontSize: 52, marginBottom: 20 }}>🔌</div>
          <h2 style={{ marginBottom: 10 }}>Connect Shopify to see subscription data</h2>
          <div style={{ color: 'var(--ink-3)', fontSize: 15, lineHeight: 1.6, marginBottom: 28 }}>
            Link your Shopify store to see total customers, repeat purchase rate, at-risk customers, and retention trends.
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <div style={{ padding: '12px 16px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--surface)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>⬜</span>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>Shopify</div>
                <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>Orders, customers, retention</div>
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
        <div>
          <h1>Subscriptions</h1>
          <div className="sub">Customer retention &amp; repeat purchase health</div>
        </div>
      </div>

      {loading && <div className="muted">Loading customer data...</div>}
      {error && <div style={{ color: 'var(--dn)', fontSize: 14, padding: '12px 0' }}>{error}</div>}

      {data && (
        <>
          <div className="grid-2" style={{ gap: 12 }}>
            <KpiCard
              label="Total customers"
              value={data.totalCustomers?.toLocaleString() || '0'}
              sub="Last 90 days"
            />
            <KpiCard
              label="Repeat purchase rate"
              value={`${data.repurchaseRate ?? 0}%`}
              sub={`${data.repeatCustomers?.toLocaleString() || 0} customers ordered 2+ times`}
              color={data.repurchaseRate >= 25 ? 'var(--up)' : data.repurchaseRate >= 15 ? 'var(--ink)' : 'var(--dn)'}
            />
            <KpiCard
              label="At-risk customers"
              value={data.atRiskCustomers?.toLocaleString() || '0'}
              sub="Ordered once, silent 45+ days"
              color={data.atRiskCustomers > 0 ? 'var(--dn)' : 'var(--up)'}
            />
            <KpiCard
              label="Retention trend"
              value={data.retentionDelta != null
                ? `${data.retentionDelta > 0 ? '+' : ''}${data.retentionDelta}%`
                : '—'}
              sub={`Recent 30d: ${data.recentRate ?? 0}% repeat vs prior ${data.priorRate ?? 0}%`}
              color={data.retentionDelta > 0 ? 'var(--up)' : data.retentionDelta < 0 ? 'var(--dn)' : 'var(--ink)'}
            />
          </div>

          <div className="card">
            <h3 style={{ marginBottom: 16 }}>Customer health breakdown</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                {
                  label: 'Repeat buyers',
                  count: data.repeatCustomers || 0,
                  total: data.totalCustomers || 1,
                  color: 'var(--up)',
                  note: '2+ orders — your best customers'
                },
                {
                  label: 'One-time buyers (healthy)',
                  count: Math.max(0, (data.totalCustomers || 0) - (data.repeatCustomers || 0) - (data.atRiskCustomers || 0)),
                  total: data.totalCustomers || 1,
                  color: 'var(--accent)',
                  note: 'Recent first purchase — still in window'
                },
                {
                  label: 'At-risk (silent 45d+)',
                  count: data.atRiskCustomers || 0,
                  total: data.totalCustomers || 1,
                  color: 'var(--dn)',
                  note: 'Ordered once and went quiet — win-back candidates'
                },
              ].map(row => {
                const pct = data.totalCustomers > 0 ? Math.round((row.count / data.totalCustomers) * 100) : 0
                return (
                  <div key={row.label}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <div>
                        <span style={{ fontWeight: 600, fontSize: 14 }}>{row.label}</span>
                        <span style={{ fontSize: 12, color: 'var(--ink-3)', marginLeft: 8 }}>{row.note}</span>
                      </div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{row.count.toLocaleString()} <span style={{ fontWeight: 400, color: 'var(--ink-3)', fontSize: 12 }}>({pct}%)</span></div>
                    </div>
                    <div style={{ height: 8, background: 'var(--surface-2)', borderRadius: 4, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: row.color, borderRadius: 4, transition: 'width 0.4s ease' }}/>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {data.fromCache && (
            <div style={{ fontSize: 11, color: 'var(--ink-4)', textAlign: 'right' }}>Cached data — updates every 6 hours</div>
          )}
        </>
      )}
    </div>
  )
}
