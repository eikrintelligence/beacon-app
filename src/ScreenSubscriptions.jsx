import React, { useState, useEffect } from 'react'

const DEMO_KPIS = {
  active: 487,
  churn_rate: 3.2,
  mrr: 8450,
  avg_age_months: 4.2,
}

const DEMO_CHURN = [
  { week: 'W1', rate: 4.1 }, { week: 'W2', rate: 3.8 }, { week: 'W3', rate: 4.4 },
  { week: 'W4', rate: 3.6 }, { week: 'W5', rate: 3.9 }, { week: 'W6', rate: 3.2 },
  { week: 'W7', rate: 2.8 }, { week: 'W8', rate: 3.1 }, { week: 'W9', rate: 2.9 },
  { week: 'W10', rate: 3.4 }, { week: 'W11', rate: 3.0 }, { week: 'W12', rate: 3.2 },
]

const DEMO_AT_RISK = [
  { id: 1, name: 'Maria González', email: 'maria@example.com', plan: 'Monthly Box', last_order_days: 58, mrr: 29 },
  { id: 2, name: 'Sarah Kim', email: 'sarah.k@example.com', plan: 'Premium Bundle', last_order_days: 52, mrr: 49 },
  { id: 3, name: 'James Walker', email: 'jwalk@example.com', plan: 'Monthly Box', last_order_days: 49, mrr: 29 },
  { id: 4, name: 'Priya Patel', email: 'priya@example.com', plan: 'Starter Pack', last_order_days: 47, mrr: 19 },
  { id: 5, name: 'Tom Brennan', email: 'tom.b@example.com', plan: 'Premium Bundle', last_order_days: 45, mrr: 49 },
  { id: 6, name: 'Linda Osei', email: 'linda.o@example.com', plan: 'Monthly Box', last_order_days: 63, mrr: 29 },
  { id: 7, name: 'Carlos Reyes', email: 'creyes@example.com', plan: 'Starter Pack', last_order_days: 71, mrr: 19 },
]

function ChurnChart({ data }) {
  const W = 520, H = 120, PAD = 12
  const max = Math.max(...data.map(d => d.rate)) + 0.5
  const min = Math.max(0, Math.min(...data.map(d => d.rate)) - 0.5)
  const xStep = (W - PAD * 2) / (data.length - 1)
  const yScale = v => PAD + ((H - PAD * 2) * (1 - (v - min) / (max - min)))
  const pts = data.map((d, i) => [PAD + i * xStep, yScale(d.rate)])
  const path = pts.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(' ')
  const area = `${path} L${pts[pts.length-1][0]},${H-PAD} L${pts[0][0]},${H-PAD} Z`

  return (
    <div style={{ overflowX: 'auto' }}>
      <svg width={W} height={H} style={{ display: 'block', minWidth: W }}>
        <defs>
          <linearGradient id="churn-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--dn)" stopOpacity="0.18"/>
            <stop offset="100%" stopColor="var(--dn)" stopOpacity="0"/>
          </linearGradient>
        </defs>
        <path d={area} fill="url(#churn-grad)"/>
        <path d={path} fill="none" stroke="var(--dn)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round"/>
        {pts.map((p, i) => (
          <circle key={i} cx={p[0]} cy={p[1]} r={3} fill="var(--dn)"/>
        ))}
        {data.map((d, i) => (
          <text key={i} x={PAD + i * xStep} y={H} textAnchor="middle"
            style={{ fontSize: 9, fill: 'var(--ink-3)', fontFamily: 'var(--font-mono)' }}>
            {d.week}
          </text>
        ))}
      </svg>
    </div>
  )
}

function KPICard({ label, value, sub, color }) {
  return (
    <div className="card" style={{ padding: '20px 24px' }}>
      <div className="tag" style={{ marginBottom: 10 }}>{label}</div>
      <div style={{ fontSize: 32, fontWeight: 800, fontFamily: 'var(--font-display)', color: color || 'var(--ink)', lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 6 }}>{sub}</div>}
    </div>
  )
}

export function ScreenSubscriptions({ token, workspaceId }) {
  const [kpis] = useState(DEMO_KPIS)
  const [churn] = useState(DEMO_CHURN)
  const [atRisk] = useState(DEMO_AT_RISK)
  const [sort, setSort] = useState('days')

  const sorted = [...atRisk].sort((a, b) => sort === 'days' ? b.last_order_days - a.last_order_days : b.mrr - a.mrr)

  const avgRate = (churn.reduce((s, d) => s + d.rate, 0) / churn.length).toFixed(1)
  const trend = churn[churn.length - 1].rate - churn[0].rate
  const trendStr = trend < 0 ? `↓ ${Math.abs(trend).toFixed(1)}% vs 12w ago` : `↑ ${trend.toFixed(1)}% vs 12w ago`

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Subscriptions</h1>
          <div className="sub">Recurring revenue health &amp; churn risk</div>
        </div>
        <span className="chip">Demo data</span>
      </div>

      <div className="grid-4" style={{ gap: 16, marginBottom: 24 }}>
        <KPICard label="ACTIVE SUBSCRIBERS" value={kpis.active.toLocaleString()} sub="All active recurring plans"/>
        <KPICard label="CHURN RATE" value={`${kpis.churn_rate}%`} sub="Last 30 days" color="var(--dn)"/>
        <KPICard label="MONTHLY RECURRING" value={`$${kpis.mrr.toLocaleString()}`} sub="MRR this month" color="var(--up)"/>
        <KPICard label="AVG SUBSCRIPTION AGE" value={`${kpis.avg_age_months}mo`} sub="Mean active tenure"/>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <div className="row between" style={{ alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <h3>Churn rate — 12 weeks</h3>
            <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 4 }}>
              Avg {avgRate}% &nbsp;·&nbsp; <span style={{ color: trend < 0 ? 'var(--up)' : 'var(--dn)' }}>{trendStr}</span>
            </div>
          </div>
        </div>
        <ChurnChart data={churn}/>
      </div>

      <div className="card">
        <div className="row between" style={{ alignItems: 'center', marginBottom: 16 }}>
          <div>
            <h3>At-risk subscribers</h3>
            <div style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 4 }}>No order in 45+ days — likely to churn</div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className={`btn sm${sort === 'days' ? ' primary' : ' ghost'}`} onClick={() => setSort('days')}>By inactivity</button>
            <button className={`btn sm${sort === 'mrr' ? ' primary' : ' ghost'}`} onClick={() => setSort('mrr')}>By MRR</button>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Customer', 'Plan', 'Last order', 'Monthly value', 'Risk'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '8px 12px', fontWeight: 600, fontSize: 11, letterSpacing: '0.06em', color: 'var(--ink-3)', textTransform: 'uppercase' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map(r => {
                const risk = r.last_order_days >= 60 ? 'high' : r.last_order_days >= 50 ? 'medium' : 'low'
                const riskColor = risk === 'high' ? 'var(--dn)' : risk === 'medium' ? 'var(--warn, #f5a623)' : 'var(--ink-3)'
                return (
                  <tr key={r.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '12px 12px' }}>
                      <div style={{ fontWeight: 600 }}>{r.name}</div>
                      <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>{r.email}</div>
                    </td>
                    <td style={{ padding: '12px 12px', color: 'var(--ink-2)' }}>{r.plan}</td>
                    <td style={{ padding: '12px 12px' }}>
                      <span style={{ color: riskColor, fontWeight: 600 }}>{r.last_order_days}d ago</span>
                    </td>
                    <td style={{ padding: '12px 12px', fontFamily: 'var(--font-mono)', fontSize: 13 }}>${r.mrr}/mo</td>
                    <td style={{ padding: '12px 12px' }}>
                      <span style={{ background: `color-mix(in oklab, ${riskColor} 12%, var(--surface))`, color: riskColor, padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>
                        {risk}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: 16, padding: '12px 16px', background: 'var(--surface-2)', borderRadius: 10, fontSize: 13, color: 'var(--ink-3)' }}>
          <strong style={{ color: 'var(--ink)' }}>Win-back tip:</strong> Send a personalised discount to subscribers inactive 45–60 days. Shopify discount codes + Klaviyo flow = ~18% re-activation rate.
        </div>
      </div>
    </div>
  )
}
