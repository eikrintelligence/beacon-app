import React, { useState } from 'react'
import { Icon } from './shared'

const CHANNELS = [
  { id: 'meta',    name: 'Meta Ads',       short: 'MA', color: '#1877f2', claimed: 48200, spend: 12400 },
  { id: 'gads',   name: 'Google Ads',      short: 'GA', color: '#4285f4', claimed: 31500, spend: 8200 },
  { id: 'tt',     name: 'TikTok Ads',      short: 'TT', color: '#fe2c55', claimed: 22100, spend: 5800 },
  { id: 'email',  name: 'Klaviyo Email',   short: 'EM', color: '#f26722', claimed: 18400, spend: 890 },
  { id: 'direct', name: 'Organic / Direct', short: 'OR', color: '#6b8cff', claimed: 12300, spend: 0 },
]

const SHOPIFY_ACTUAL = 98200

export function ScreenAttribution() {
  const [model, setModel] = useState('last_click')

  const totalClaimed = CHANNELS.reduce((s, c) => s + c.claimed, 0)
  const overlap = totalClaimed - SHOPIFY_ACTUAL
  const overlapPct = Math.round((overlap / totalClaimed) * 100)

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Attribution</h1>
          <div className="sub">Cross-channel revenue claims vs Shopify actual · last 30 days</div>
        </div>
        <div className="actions">
          <select value={model} onChange={e => setModel(e.target.value)}
            style={{ padding: '8px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--surface)', fontSize: 13, color: 'var(--ink)', fontFamily: 'var(--font-body)', outline: 'none' }}>
            <option value="last_click">Last click</option>
            <option value="first_click">First click</option>
            <option value="linear">Linear</option>
          </select>
        </div>
      </div>

      <div className="grid-2">
        <div className="card" style={{ background: 'var(--ink)', color: 'var(--bg)' }}>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.07em', opacity: 0.45, marginBottom: 8, fontFamily: 'var(--font-mono)' }}>SHOPIFY ACTUAL REVENUE</div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 44, letterSpacing: '-0.03em' }}>${(SHOPIFY_ACTUAL / 1000).toFixed(1)}k</div>
          <div style={{ fontSize: 13, opacity: 0.5, marginTop: 4 }}>Source of truth · verified orders only</div>
        </div>
        <div className="card">
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.07em', color: 'var(--ink-3)', marginBottom: 8, fontFamily: 'var(--font-mono)' }}>TOTAL CLAIMED (ALL CHANNELS)</div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 44, letterSpacing: '-0.03em', color: 'var(--dn)' }}>${(totalClaimed / 1000).toFixed(1)}k</div>
          <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 4 }}>
            <span style={{ color: 'var(--dn)', fontWeight: 600 }}>{overlapPct}% overlap</span> · channels double-count conversions
          </div>
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 16 }}>Channel contribution</h3>
        <div className="stack" style={{ gap: 14 }}>
          {CHANNELS.map(c => {
            const sharePct = Math.round((c.claimed / totalClaimed) * 100)
            const roas = c.spend > 0 ? (c.claimed / c.spend).toFixed(1) : null
            const adjRevenue = Math.round((c.claimed / totalClaimed) * SHOPIFY_ACTUAL)
            return (
              <div key={c.id}>
                <div className="row between" style={{ marginBottom: 7, alignItems: 'center' }}>
                  <div className="row tight" style={{ alignItems: 'center' }}>
                    <div style={{ width: 30, height: 30, borderRadius: 8, background: c.color, color: 'white', display: 'grid', placeItems: 'center', fontSize: 10, fontWeight: 700, flexShrink: 0 }}>{c.short}</div>
                    <span style={{ fontWeight: 600, fontSize: 14 }}>{c.name}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>${(c.claimed / 1000).toFixed(1)}k claimed</div>
                      <div style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 600 }}>→ ${(adjRevenue / 1000).toFixed(1)}k linear</div>
                    </div>
                    {roas && (
                      <div style={{ textAlign: 'right', minWidth: 40 }}>
                        <div style={{ fontSize: 13, fontWeight: 700 }}>{roas}x</div>
                        <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>ROAS</div>
                      </div>
                    )}
                    <div style={{ textAlign: 'right', minWidth: 32 }}>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>{sharePct}%</div>
                      <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>share</div>
                    </div>
                  </div>
                </div>
                <div style={{ height: 5, background: 'var(--surface-2)', borderRadius: 3 }}>
                  <div style={{ height: '100%', width: sharePct + '%', background: c.color, borderRadius: 3, transition: 'width 0.6s' }}/>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 4 }}>Reconciliation table</h3>
        <div style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 16 }}>Linear model distributes Shopify's actual ${(SHOPIFY_ACTUAL / 1000).toFixed(1)}k proportionally across channels</div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>
                {['Channel', 'Claimed', 'Linear adj.', 'Spend', 'True ROAS'].map(h => (
                  <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--ink-3)', letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', borderBottom: '1px solid var(--border)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CHANNELS.map((c, i) => {
                const adj = Math.round((c.claimed / totalClaimed) * SHOPIFY_ACTUAL)
                const trueRoas = c.spend > 0 ? (adj / c.spend).toFixed(1) : '—'
                return (
                  <tr key={c.id} style={{ borderBottom: i < CHANNELS.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 8, height: 8, borderRadius: 2, background: c.color, flexShrink: 0 }}/>
                      {c.name}
                    </td>
                    <td style={{ padding: '10px 12px' }}>${c.claimed.toLocaleString()}</td>
                    <td style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--accent)' }}>${adj.toLocaleString()}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--ink-3)' }}>{c.spend > 0 ? '$' + c.spend.toLocaleString() : '—'}</td>
                    <td style={{ padding: '10px 12px', fontWeight: 600, color: parseFloat(trueRoas) >= 2.5 ? 'var(--up)' : trueRoas === '—' ? 'var(--ink-3)' : 'var(--dn)' }}>{trueRoas !== '—' ? trueRoas + 'x' : '—'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: 14, padding: '10px 14px', background: 'color-mix(in oklab, var(--dn) 8%, var(--surface))', borderRadius: 10, fontSize: 13, color: 'var(--ink-2)', border: '1px solid color-mix(in oklab, var(--dn) 20%, var(--surface))' }}>
          <strong>Double-counting overlap:</strong> channels collectively claim <strong style={{ color: 'var(--dn)' }}>${(overlap / 1000).toFixed(1)}k ({overlapPct}%)</strong> more than Shopify recorded. Linear attribution is the fairest model for multi-touch journeys.
        </div>
      </div>
    </div>
  )
}
