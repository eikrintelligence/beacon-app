import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './AuthContext'

const API = import.meta.env.VITE_API_URL || 'https://sja.eikr.ee/api'


function LineChart({ data, yKey = 'revenue', color = '#6366f1', h = 128 }) {
  if (!data || data.length < 2) return (
    <div style={{ height: h, background: '#f8fafc', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1', fontSize: 13 }}>
      No data yet
    </div>
  )
  const vals = data.map(d => d[yKey] || 0)
  const min = Math.min(...vals), max = Math.max(...vals)
  const range = max - min || 1
  const W = 600, H = h - 12
  const px = i => (i / (vals.length - 1)) * W
  const py = v => H - ((v - min) / range) * (H - 12) + 6
  const pts = vals.map((v, i) => `${i === 0 ? 'M' : 'L'} ${px(i).toFixed(1)} ${py(v).toFixed(1)}`).join(' ')
  const area = `${pts} L ${W} ${H + 6} L 0 ${H + 6} Z`
  return (
    <svg width="100%" height={h} viewBox={`0 0 ${W} ${h}`} preserveAspectRatio="none" style={{ display: 'block' }}>
      <defs>
        <linearGradient id="hg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#hg)" />
      <path d={pts} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function fmtMoney(v) {
  if (!v) return '$0'
  if (v >= 1e6) return `$${(v / 1e6).toFixed(2)}M`
  if (v >= 1e3) return `$${(v / 1e3).toFixed(1)}K`
  return `$${Math.round(v).toLocaleString()}`
}

function Delta({ pct }) {
  const n = parseFloat(pct)
  if (isNaN(n) || pct === null) return <span style={{ color: '#94a3b8' }}>—</span>
  const up = n >= 0
  return (
    <span style={{ color: up ? '#10b981' : '#ef4444', fontWeight: 600 }}>
      {up ? '▲' : '▼'} {Math.abs(n)}%
    </span>
  )
}

function exportCSV(data, filename) {
  if (!data || !data.length) return
  const keys = Object.keys(data[0])
  const rows = [keys.join(','), ...data.map(r => keys.map(k => JSON.stringify(r[k] ?? '')).join(','))]
  const blob = new Blob([rows.join('\n')], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click()
  URL.revokeObjectURL(url)
}

const PILL = (active, onClick, label) => (
  <button key={label} onClick={onClick} style={{
    padding: '5px 14px', borderRadius: 20, border: '1px solid',
    borderColor: active ? '#6366f1' : '#e2e8f0',
    background: active ? '#6366f1' : '#fff',
    color: active ? '#fff' : '#64748b',
    cursor: 'pointer', fontWeight: 500, fontSize: 12, transition: 'all .15s'
  }}>{label}</button>
)

export default function ScreenHistory({ workspaceId }) {
  const { token } = useAuth()
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [empty, setEmpty] = useState(false)
  const [range, setRange] = useState('90')
  const [tab, setTab] = useState('shopify')

  useEffect(() => {
    if (!workspaceId) return
    setLoading(true)
    fetch(`${API}/history/summary?workspace_id=${workspaceId}&days=${range}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(d => {
        if (!d || d.error || !Object.keys(d).length) { setSummary(null); setEmpty(true) }
        else { setSummary(d); setEmpty(false); if (!d[tab]) setTab(Object.keys(d)[0]) }
      })
      .catch(() => { setSummary(null); setEmpty(true) })
      .finally(() => setLoading(false))
  }, [workspaceId, range, token])

  const data = summary?.[tab] || []
  const shopify = summary?.shopify || []
  const totalRev = shopify.reduce((a, d) => a + (d.revenue || 0), 0)
  const totalOrd = shopify.reduce((a, d) => a + (d.orders || 0), 0)
  const aov = totalOrd ? totalRev / totalOrd : 0
  const h = Math.floor(shopify.length / 2)
  const sumKey = (arr, k) => arr.reduce((a, d) => a + (d[k] || 0), 0)
  const currRev = sumKey(shopify.slice(h), 'revenue')
  const prevRev = sumKey(shopify.slice(0, h), 'revenue')
  const currOrd = sumKey(shopify.slice(h), 'orders')
  const prevOrd = sumKey(shopify.slice(0, h), 'orders')
  const revPct = prevRev ? ((currRev - prevRev) / prevRev * 100).toFixed(1) : null
  const ordPct = prevOrd ? ((currOrd - prevOrd) / prevOrd * 100).toFixed(1) : null

  const platforms = summary ? Object.keys(summary) : ['shopify']

  const card = { background: '#fff', borderRadius: 12, padding: '18px 22px', border: '1px solid #e2e8f0' }

  return (
    <div style={{ padding: '24px 32px', maxWidth: 980, margin: '0 auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <h2 style={{ margin: 0, fontWeight: 700, fontSize: 22, color: '#111' }}>History</h2>

        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {['30', '90', '180'].map(d => PILL(range === d, () => setRange(d), `${d}d`))}
        </div>
      </div>

      {empty && (
        <div style={{ textAlign: 'center', padding: '64px 24px', background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>&#128202;</div>
          <div style={{ fontWeight: 700, fontSize: 18, marginBottom: 8 }}>No history yet</div>
          <div style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.6 }}>Connect Shopify to start building your revenue history. Data accumulates automatically once connected.</div>
        </div>
      )}

      {!empty && (<>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 20 }}>
        {[
          { label: 'Total Revenue', value: fmtMoney(totalRev) },
          { label: 'Total Orders', value: totalOrd.toLocaleString() },
          { label: 'Avg Order Value', value: fmtMoney(aov) },
        ].map(kpi => (
          <div key={kpi.label} style={card}>
            <div style={{ fontSize: 11, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 6 }}>{kpi.label}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#0f172a' }}>{loading ? '—' : kpi.value}</div>
          </div>
        ))}
      </div>

      {/* Chart Card */}
      <div style={{ ...card, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', gap: 6 }}>
            {platforms.map(p => PILL(tab === p, () => setTab(p), p.charAt(0).toUpperCase() + p.slice(1)))}
          </div>
          <button onClick={() => exportCSV(data, `sja-${tab}-${range}d.csv`)} style={{
            padding: '5px 14px', borderRadius: 6, border: '1px solid #e2e8f0',
            background: '#f8fafc', color: '#64748b', cursor: 'pointer', fontSize: 12, fontWeight: 500
          }}>↓ Export CSV</button>
        </div>

        {loading
          ? <div style={{ height: 128, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: 13 }}>Loading…</div>
          : <LineChart data={data} yKey="revenue" color="#6366f1" h={128} />
        }

        {data.length >= 2 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 11, color: '#94a3b8' }}>
            <span>{data[0]?.date}</span>
            <span>{data[data.length - 1]?.date}</span>
          </div>
        )}
      </div>

      {/* Period Comparison */}
      <div style={{ ...card, marginBottom: 20 }}>
        <h3 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 600, color: '#374151' }}>Period Comparison</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Metric', 'This Period', 'Last Period', 'Change'].map((h, i) => (
                <th key={h} style={{ textAlign: i === 0 ? 'left' : 'right', padding: '6px 0', fontSize: 11, color: '#94a3b8', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '.05em', borderBottom: '1px solid #f1f5f9' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[
              { label: 'Revenue', curr: fmtMoney(currRev), prev: fmtMoney(prevRev), pct: revPct },
              { label: 'Orders', curr: currOrd.toLocaleString(), prev: prevOrd.toLocaleString(), pct: ordPct },
              { label: 'AOV', curr: fmtMoney(currOrd ? currRev / currOrd : 0), prev: fmtMoney(prevOrd ? prevRev / prevOrd : 0), pct: (prevOrd && currOrd) ? (((currRev / currOrd) - (prevRev / prevOrd)) / (prevRev / prevOrd) * 100).toFixed(1) : null },
            ].map(row => (
              <tr key={row.label} style={{ borderBottom: '1px solid #f8fafc' }}>
                <td style={{ padding: '10px 0', fontSize: 14, color: '#374151' }}>{row.label}</td>
                <td style={{ padding: '10px 0', fontSize: 14, textAlign: 'right', fontWeight: 600, color: '#0f172a' }}>{row.curr}</td>
                <td style={{ padding: '10px 0', fontSize: 14, textAlign: 'right', color: '#94a3b8' }}>{row.prev}</td>
                <td style={{ padding: '10px 0', fontSize: 14, textAlign: 'right' }}><Delta pct={row.pct} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* YoY */}
      <div style={{ ...card, display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ fontSize: 28, opacity: .35 }}>📅</div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>Year-over-Year</div>
          <div style={{ color: '#94a3b8', fontSize: 13 }}>
            YoY comparison unlocks once 12+ months of data has accumulated. Keep Faro connected to build your full history.
          </div>
        </div>
      </div>
      </>)}

    </div>
  )
}
