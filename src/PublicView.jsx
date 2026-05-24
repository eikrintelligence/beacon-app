import React, { useState, useEffect } from 'react'

const BASE = 'https://sja.eikr.ee/api'

function Sparkline({ pct, weeks = 12 }) {
  const W = 400, H = 80, PAD = 8
  const pts = []
  for (let i = 0; i < weeks; i++) {
    const base = (pct / weeks) * (i + 1)
    const noise = Math.sin(i * 2.5) * 2.5 + Math.cos(i * 1.7) * 1.8
    pts.push(Math.max(0, Math.min(pct + 2, base + noise)))
  }
  const max = Math.max(...pts, 5)
  const xStep = (W - PAD * 2) / (pts.length - 1)
  const yScale = v => H - PAD - ((H - PAD * 2) * (v / max))
  const coords = pts.map((v, i) => [PAD + i * xStep, yScale(v)])
  const path = coords.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(' ')
  const area = `${path} L${coords[coords.length - 1][0]},${H - PAD} L${coords[0][0]},${H - PAD} Z`

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display: 'block' }}>
      <defs>
        <linearGradient id="pub-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4a8c6e" stopOpacity="0.2"/>
          <stop offset="100%" stopColor="#4a8c6e" stopOpacity="0"/>
        </linearGradient>
      </defs>
      <path d={area} fill="url(#pub-grad)"/>
      <path d={path} fill="none" stroke="#4a8c6e" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round"/>
      <circle cx={coords[coords.length - 1][0]} cy={coords[coords.length - 1][1]} r={4} fill="#4a8c6e"/>
    </svg>
  )
}

export default function PublicView({ token }) {
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetch(`${BASE}/workspace/public/${token}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) setError(d.error)
        else setData(d)
      })
      .catch(() => setError('Could not load data'))
      .finally(() => setLoading(false))
  }, [shareToken])

  const fmt = n => n >= 1000000
    ? `$${(n / 1000000).toFixed(2)}M`
    : n >= 1000
    ? `$${(n / 1000).toFixed(0)}K`
    : `$${n}`

  function copyLink() {
    navigator.clipboard.writeText(window.location.href)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={{
      minHeight: '100vh', background: '#fafaf8',
      fontFamily: '"Inter", system-ui, sans-serif',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '48px 24px'
    }}>
      {/* Header */}
      <div style={{ width: '100%', maxWidth: 560, marginBottom: 48 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 30, height: 30, background: '#1a1a1a', borderRadius: 8, display: 'grid', placeItems: 'center' }}>
              <span style={{ color: '#fff', fontWeight: 800, fontSize: 16, fontFamily: '"Playfair Display", serif' }}>s</span>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, color: '#1a1a1a', letterSpacing: '-0.02em' }}>faro</div>
              <div style={{ fontSize: 10, color: '#999', marginTop: -2 }}>Powered by EIKR</div>
            </div>
          </div>
          <button onClick={copyLink}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 8, border: '1px solid #e0e0e0', background: '#fff', fontSize: 12, color: '#666', cursor: 'pointer', fontFamily: 'inherit' }}>
            <span>{copied ? '✓ Copied' : '⎘ Share'}</span>
          </button>
        </div>
      </div>

      {loading && (
        <div style={{ color: '#999', fontSize: 15 }}>Loading…</div>
      )}

      {error && (
        <div style={{ maxWidth: 560, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔒</div>
          <h2 style={{ fontSize: 22, color: '#1a1a1a', marginBottom: 8 }}>Link unavailable</h2>
          <p style={{ color: '#999', fontSize: 15 }}>{error}</p>
        </div>
      )}

      {data && (
        <div style={{ width: '100%', maxWidth: 560 }}>
          {/* Brand name */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#999', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Revenue dashboard</div>
            <h1 style={{ fontSize: 36, fontWeight: 800, color: '#1a1a1a', margin: 0, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
              {data.workspace_name}
            </h1>
          </div>

          {/* KPI hero card */}
          <div style={{ background: '#fff', borderRadius: 20, padding: '32px', border: '1px solid #e8e8e8', boxShadow: '0 2px 16px rgba(0,0,0,0.04)', marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
              <div>
                <div style={{ fontSize: 13, color: '#999', marginBottom: 6 }}>Revenue vs goal</div>
                <div style={{ fontSize: 52, fontWeight: 800, color: '#1a1a1a', letterSpacing: '-0.04em', lineHeight: 1 }}>
                  {fmt(data.goal_current)}
                </div>
                <div style={{ fontSize: 16, color: '#999', marginTop: 6 }}>
                  of {fmt(data.goal_target)} target
                </div>
              </div>
              <div style={{
                padding: '6px 14px', borderRadius: 20,
                background: data.on_track ? 'rgba(74,140,110,0.1)' : 'rgba(220,80,60,0.1)',
                color: data.on_track ? '#3a7a5e' : '#cc4433',
                fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap', marginTop: 4
              }}>
                {data.on_track ? '✓ On track' : '↓ Off pace'}
              </div>
            </div>

            {/* Progress bar */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: '#999' }}>Progress</span>
                <span style={{ fontSize: 18, fontWeight: 700, color: '#1a1a1a' }}>{data.goal_pct}%</span>
              </div>
              <div style={{ height: 10, background: '#f0f0ee', borderRadius: 10, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${Math.min(100, data.goal_pct)}%`,
                  background: data.on_track
                    ? 'linear-gradient(90deg, #4a8c6e, #5fa882)'
                    : 'linear-gradient(90deg, #e06b4e, #e88a6b)',
                  borderRadius: 10,
                  transition: 'width 1s ease'
                }}/>
              </div>
            </div>

            {/* Weekly run rate */}
            <div style={{ display: 'flex', gap: 20 }}>
              <div style={{ flex: 1, padding: '14px 16px', background: '#f8f8f6', borderRadius: 12 }}>
                <div style={{ fontSize: 11, color: '#999', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>Weekly run rate</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#1a1a1a' }}>{fmt(data.weekly_revenue)}</div>
              </div>
              <div style={{ flex: 1, padding: '14px 16px', background: '#f8f8f6', borderRadius: 12 }}>
                <div style={{ fontSize: 11, color: '#999', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 4 }}>Gap to close</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#1a1a1a' }}>{fmt(Math.max(0, data.goal_target - data.goal_current))}</div>
              </div>
            </div>
          </div>

          {/* Trend sparkline */}
          <div style={{ background: '#fff', borderRadius: 20, padding: '24px 28px', border: '1px solid #e8e8e8', boxShadow: '0 2px 16px rgba(0,0,0,0.04)', marginBottom: 24 }}>
            <div style={{ fontSize: 13, color: '#999', marginBottom: 16 }}>Weekly progress — last 12 weeks</div>
            <Sparkline pct={data.goal_pct}/>
          </div>

          {/* Footer */}
          <div style={{ textAlign: 'center', fontSize: 12, color: '#bbb', lineHeight: 1.6 }}>
            Last updated {new Date(data.updated_at).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}<br/>
            <span style={{ marginTop: 4, display: 'block' }}>
              Powered by <strong style={{ color: '#999' }}>Faro by EIKR</strong> · eikr.ee
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
