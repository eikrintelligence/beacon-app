import React, { useState, useEffect } from 'react'
import { Sparkline, shapeSeries, fmt, Icon } from './shared'

const DEMO_PRODUCTS = [
  { name: 'Beef Liver Treats 8oz', units: 842, revenue: 16840, pct: 22.1 },
  { name: 'Salmon Bites 6oz', units: 621, revenue: 12420, pct: 16.3 },
  { name: 'Variety Pack (3-flavor)', units: 508, revenue: 10160, pct: 13.4 },
  { name: 'Chicken Jerky 4oz', units: 477, revenue: 7155, pct: 9.4 },
  { name: 'Duck Tender Strips 5oz', units: 392, revenue: 7840, pct: 10.3 },
  { name: 'Turkey Hearts 6oz', units: 341, revenue: 5115, pct: 6.7 },
  { name: 'Freeze-Dried Rabbit 3oz', units: 287, revenue: 8610, pct: 11.3 },
  { name: 'Bison Lung Crisps 4oz', units: 218, revenue: 4360, pct: 5.7 },
  { name: 'Lamb Ear Chews 2pk', units: 196, revenue: 2940, pct: 3.9 },
  { name: 'Sweet Potato Chews 5oz', units: 143, revenue: 1430, pct: 1.9 },
]

function TrendSpark({ seed, up }) {
  const data = shapeSeries(50, 14, up ? 'growth' : 'decline', seed)
  return <Sparkline data={data} color={up ? 'var(--up)' : 'var(--dn)'} height={28}/>
}

export function ScreenSKU({ token, workspaceId }) {
  const [products, setProducts] = useState(null)
  const [loading, setLoading] = useState(true)
  const [sort, setSort] = useState('revenue')

  useEffect(() => {
    if (!token || !workspaceId) { setLoading(false); return }
    fetch(`https://sja.eikr.ee/api/shopify/products?workspace_id=${workspaceId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(d => {
        if (d.products?.length > 0) setProducts(d.products)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [token, workspaceId])

  const data = products || DEMO_PRODUCTS
  const totalRevenue = data.reduce((s, p) => s + p.revenue, 0)
  const sorted = [...data].sort((a, b) => b[sort] - a[sort])

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Products</h1>
          <div className="sub">Top {data.length} SKUs by revenue · last 30 days{!products && <span style={{ color: 'var(--ink-3)', marginLeft: 8 }}>· demo data</span>}</div>
        </div>
        <div className="actions">
          <div className="row tight">
            {[['revenue','Revenue'],['units','Units']].map(([k,l]) => (
              <button key={k} className={'btn sm' + (sort===k?' primary':'')} onClick={() => setSort(k)}>{l}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card" style={{ background: 'var(--ink)', color: 'var(--bg)' }}>
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.07em', opacity: 0.45, marginBottom: 8, fontFamily: 'var(--font-mono)' }}>TOTAL SKU REVENUE (30D)</div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 40, letterSpacing: '-0.03em' }}>${(totalRevenue/1000).toFixed(1)}k</div>
        </div>
        <div className="card">
          <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.07em', color: 'var(--ink-3)', marginBottom: 8, fontFamily: 'var(--font-mono)' }}>TOP PRODUCT</div>
          <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 4 }}>{sorted[0]?.name}</div>
          <div style={{ fontSize: 13, color: 'var(--ink-3)' }}>${sorted[0]?.revenue.toLocaleString()} · {sorted[0]?.units.toLocaleString()} units</div>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['#', 'Product', 'Units', 'Revenue', '% of total', 'Trend'].map((h, i) => (
                <th key={h} style={{ padding: '12px 16px', textAlign: i === 0 ? 'center' : i >= 4 ? 'right' : 'left', fontSize: 11, fontWeight: 600, color: 'var(--ink-3)', letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((p, i) => {
              const pct = Math.round((p.revenue / totalRevenue) * 100)
              const up = i < sorted.length / 2
              return (
                <tr key={p.name} style={{ borderBottom: i < sorted.length - 1 ? '1px solid var(--border)' : 'none', background: i % 2 === 0 ? 'transparent' : 'var(--surface-2)' }}>
                  <td style={{ padding: '12px 16px', textAlign: 'center', color: 'var(--ink-3)', fontWeight: 600 }}>{i + 1}</td>
                  <td style={{ padding: '12px 16px', fontWeight: 600 }}>
                    <div>{p.name}</div>
                    <div style={{ height: 3, background: 'var(--surface-2)', borderRadius: 2, marginTop: 6, maxWidth: 180 }}>
                      <div style={{ height: '100%', width: pct + '%', background: 'var(--accent)', borderRadius: 2 }}/>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>{p.units.toLocaleString()}</td>
                  <td style={{ padding: '12px 16px', fontWeight: 700 }}>${p.revenue.toLocaleString()}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <span style={{ padding: '2px 8px', borderRadius: 999, background: i < 3 ? 'color-mix(in oklab, var(--up) 12%, var(--surface))' : 'var(--surface-2)', color: i < 3 ? 'var(--up)' : 'var(--ink-3)', fontWeight: 600, fontSize: 12 }}>{pct}%</span>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <div style={{ width: 80, height: 28, marginLeft: 'auto' }}>
                      <TrendSpark seed={i * 7 + 3} up={up}/>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
