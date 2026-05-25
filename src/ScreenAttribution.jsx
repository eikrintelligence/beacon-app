import React, { useState, useEffect } from 'react'

const BASE = 'https://sja.eikr.ee/api'

function fmt(n) {
  if (n == null) return '—'
  if (n >= 1000000) return '$' + (n/1000000).toFixed(1) + 'M'
  if (n >= 1000)    return '$' + (n/1000).toFixed(1) + 'k'
  return '$' + Math.round(n).toLocaleString()
}

export function ScreenAttribution({ workspaceData, onNavigate, token, workspaceId }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const hasShopify = workspaceData?.connections?.some(c => c.platform === 'shopify' && c.status === 'active')
  const hasMeta    = workspaceData?.connections?.some(c => c.platform === 'meta'    && c.status === 'active')
  const hasGads    = workspaceData?.connections?.some(c => c.platform === 'gads'    && c.status === 'active')
  const hasTikTok  = workspaceData?.connections?.some(c => c.platform === 'tt'      && c.status === 'active')
  const hasAnyAd   = hasMeta || hasGads || hasTikTok
  const canShow    = hasShopify && hasAnyAd

  useEffect(() => {
    if (!canShow || !workspaceId) return
    setLoading(true)
    fetch(`${BASE}/attribution/summary?workspace_id=${workspaceId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(d => { if (d.error) setError(d.error); else setData(d) })
      .catch(() => setError('Failed to load attribution data'))
      .finally(() => setLoading(false))
  }, [canShow, workspaceId, token])

  if (!canShow) {
    return (
      <div className="page">
        <div className="page-head">
          <div><h1>Attribution</h1><div className="sub">Cross-channel revenue attribution</div></div>
        </div>
        <div className="card" style={{ padding: '48px 36px', textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🔌</div>
          <h3 style={{ marginBottom: 8 }}>Connect your ad platforms to see attribution</h3>
          <p style={{ color: 'var(--ink-3)', marginBottom: 24, maxWidth: 400, margin: '0 auto 24px' }}>
            Attribution compares what each ad platform claims against your actual Shopify revenue.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 28 }}>
            {[
              { name: 'Shopify',      connected: hasShopify, desc: 'Source of truth revenue' },
              { name: 'Meta Ads',     connected: hasMeta,    desc: 'Facebook & Instagram' },
              { name: 'Google Ads',   connected: hasGads,    desc: 'Search & shopping' },
              { name: 'TikTok Ads',   connected: hasTikTok,  desc: 'TikTok campaigns' },
            ].map(s => (
              <div key={s.name} style={{ padding: '12px 16px', borderRadius: 10, border: '1px solid var(--border)', background: s.connected ? 'color-mix(in oklab, var(--up) 10%, var(--surface))' : 'var(--surface)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>{s.connected ? '✅' : '⬜'}</span>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{s.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <button className="btn primary" onClick={() => onNavigate('connections')}>Connect sources →</button>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="page-head">
        <div><h1>Attribution</h1><div className="sub">Cross-channel revenue · last 30 days</div></div>
      </div>

      {loading && <div className="muted">Loading attribution data...</div>}
      {error   && <div style={{ color: 'var(--dn)', fontSize: 14 }}>{error}</div>}

      {data && !data.has_data && (
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>📊</div>
          <h3 style={{ marginBottom: 8 }}>No cached data yet</h3>
          <p style={{ color: 'var(--ink-3)', fontSize: 14 }}>
            Visit the Meta Ads, Google Ads, or TikTok screens to trigger a data sync first.
          </p>
        </div>
      )}

      {data && data.has_data && (
        <>
          {/* Summary KPIs */}
          <div className="grid-2" style={{ gap: 12 }}>
            <div className="card" style={{ padding: '20px 24px' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Shopify actual revenue</div>
              <div style={{ fontSize: 36, fontWeight: 800, fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>{fmt(data.shopify_actual)}</div>
              <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 4 }}>Ground truth from orders</div>
            </div>
            <div className="card" style={{ padding: '20px 24px' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Total ad spend</div>
              <div style={{ fontSize: 36, fontWeight: 800, fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>{fmt(data.total_spend)}</div>
              <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 4 }}>Across all paid channels</div>
            </div>
            <div className="card" style={{ padding: '20px 24px' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Total claimed revenue</div>
              <div style={{ fontSize: 36, fontWeight: 800, fontFamily: 'var(--font-display)', letterSpacing: '-0.02em', color: data.total_claimed > (data.shopify_actual || 0) ? 'var(--dn)' : 'var(--ink)' }}>{fmt(data.total_claimed)}</div>
              <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 4 }}>What platforms report combined</div>
            </div>
            <div className="card" style={{ padding: '20px 24px' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>Correction factor</div>
              <div style={{ fontSize: 36, fontWeight: 800, fontFamily: 'var(--font-display)', letterSpacing: '-0.02em', color: (data.correction_factor || 1) < 0.8 ? 'var(--dn)' : (data.correction_factor || 1) > 1.1 ? 'var(--dn)' : 'var(--up)' }}>
                {data.shopify_actual ? `${data.correction_factor?.toFixed(2)}×` : '—'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 4 }}>
                {data.correction_factor < 1 ? 'Platforms over-claiming' : data.correction_factor > 1.05 ? 'Shopify higher than claimed' : 'Roughly aligned ✓'}
              </div>
            </div>
          </div>

          {/* Channel breakdown */}
          <div className="card" style={{ overflowX: 'auto' }}>
            <h3 style={{ marginBottom: 16 }}>Channel breakdown</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr>
                  {['Channel', 'Spend', 'Claimed Rev', 'Claimed ROAS', 'True ROAS', 'Adj. Revenue', 'Share'].map(h => (
                    <th key={h} style={{ textAlign: h === 'Channel' ? 'left' : 'right', padding: '8px 12px', color: 'var(--ink-3)', fontWeight: 600, fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.channels.map((ch, i) => (
                  <tr key={i} style={{ borderTop: '1px solid var(--border)' }}>
                    <td style={{ padding: '12px', fontWeight: 600, whiteSpace: 'nowrap' }}>
                      {ch.name}
                      {ch.manual && <span style={{ fontSize: 10, color: 'var(--ink-3)', marginLeft: 6, fontWeight: 400 }}>manual</span>}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 12 }}>{fmt(ch.spend)}</td>
                    <td style={{ padding: '12px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 12 }}>{fmt(ch.claimed_revenue)}</td>
                    <td style={{ padding: '12px', textAlign: 'right', fontWeight: 600, color: ch.claimed_roas >= 3 ? 'var(--up)' : ch.claimed_roas >= 1.5 ? 'var(--ink)' : 'var(--dn)' }}>
                      {ch.claimed_roas != null ? `${ch.claimed_roas}×` : '—'}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right', fontWeight: 700, color: ch.true_roas >= 2.5 ? 'var(--up)' : ch.true_roas >= 1.2 ? 'var(--ink)' : ch.true_roas != null ? 'var(--dn)' : 'var(--ink-3)' }}>
                      {ch.true_roas != null ? `${ch.true_roas}×` : '—'}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 12 }}>{fmt(ch.adjusted_revenue)}</td>
                    <td style={{ padding: '12px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
                        <div style={{ width: 60, height: 6, background: 'var(--surface-2)', borderRadius: 3, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${ch.share_pct}%`, background: 'var(--accent)', borderRadius: 3 }}/>
                        </div>
                        <span style={{ fontSize: 12, color: 'var(--ink-2)', minWidth: 28, textAlign: 'right' }}>{ch.share_pct}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {data.correction_factor && data.correction_factor !== 1 && data.shopify_actual && (
              <div style={{ marginTop: 16, padding: '12px 16px', background: 'var(--surface-2)', borderRadius: 10, fontSize: 12, color: 'var(--ink-3)', lineHeight: 1.6 }}>
                <strong style={{ color: 'var(--ink-2)' }}>About correction factor:</strong> Platforms report{' '}
                {data.total_claimed > data.shopify_actual ? 'more' : 'less'} revenue than Shopify recorded ({fmt(data.total_claimed)} claimed vs {fmt(data.shopify_actual)} actual).
                {' '}The {data.correction_factor?.toFixed(2)}× factor is applied to "Adj. Revenue" to bring each channel into proportion with ground truth.
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
