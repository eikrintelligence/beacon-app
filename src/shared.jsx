import React from 'react'

const DATA_SHAPES = {
  growth:  { trend: 1 },
  flat:    { trend: 0 },
  decline: { trend: -1 },
}

export function shapeSeries(base, n, shape = 'growth', seed = 1) {
  const { trend } = DATA_SHAPES[shape] || DATA_SHAPES.growth
  let s = seed
  const out = []
  for (let i = 0; i < n; i++) {
    s = (s * 9301 + 49297) % 233280
    const noise = ((s / 233280) - 0.5) * 0.12
    const tilt = trend * (i / (n - 1)) * 0.35
    out.push(Math.max(0, base * (1 + tilt + noise)))
  }
  return out.map(v => Math.round(v * 100) / 100)
}

export const PERSONAS = {
  marketing: {
    title: 'Marketing', workspace: 'Pine & Pearl · marketing',
    kpis: [
      { key: 'revenue', label: 'Revenue',  format: 'money',  base: 84200,  prev: 74900 },
      { key: 'orders',  label: 'Orders',   format: 'int',    base: 1284,   prev: 1188 },
      { key: 'roas',    label: 'ROAS',     format: 'x',      base: 3.4,    prev: 3.6 },
      { key: 'cac',     label: 'CAC',      format: 'money0', base: 24,     prev: 22 },
    ],
  },
  sales: {
    title: 'Sales', workspace: 'Pine & Pearl · revenue',
    kpis: [
      { key: 'mrr',    label: 'MRR',          format: 'money',  base: 184000, prev: 168000 },
      { key: 'closed', label: 'Deals closed', format: 'int',    base: 42,     prev: 37 },
      { key: 'avg',    label: 'Avg deal',     format: 'money0', base: 4380,   prev: 4540 },
      { key: 'cycle',  label: 'Cycle (d)',    format: 'int',    base: 28,     prev: 31 },
    ],
  },
  founder: {
    title: 'Founder', workspace: 'Pine & Pearl · exec',
    kpis: [
      { key: 'revenue', label: 'Revenue',    format: 'money',  base: 824000, prev: 740000 },
      { key: 'burn',    label: 'Net burn',   format: 'money0', base: 92000,  prev: 104000 },
      { key: 'runway',  label: 'Runway (m)', format: 'int',    base: 19,     prev: 17 },
      { key: 'nps',     label: 'NPS',        format: 'int',    base: 62,     prev: 58 },
    ],
  },
  agency: {
    title: 'Agency', workspace: 'Northbeam · client view',
    kpis: [
      { key: 'clients', label: 'Active clients', format: 'int',   base: 18,     prev: 16 },
      { key: 'spend',   label: 'Managed spend',  format: 'money', base: 482000, prev: 451000 },
      { key: 'roas',    label: 'Avg ROAS',       format: 'x',     base: 4.2,    prev: 3.9 },
      { key: 'hours',   label: 'Billable hrs',   format: 'int',   base: 312,    prev: 298 },
    ],
  },
}

export const CHANNELS = [
  { id: 'tt',   name: 'TikTok Ads',       short: 'TT', color: '#fe2c55', icon: 'tt'   },
  { id: 'ma',   name: 'Meta Ads',         short: 'MA', color: '#1877f2', icon: 'ma'   },
  { id: 'gads', name: 'Google Ads',       short: 'GA', color: '#4285f4', icon: 'gads' },
  { id: 'sh',   name: 'Shopify',          short: 'SH', color: '#95bf47', icon: 'sh'   },
  { id: 'am',   name: 'Amazon Mkt',       short: 'AM', color: '#ff9900', icon: 'am'   },
  { id: 'ga',   name: 'Google Analytics', short: 'G4', color: '#f9ab00', icon: 'ga'   },
]

export const FUNNEL = [
  { id: 'impr',     name: 'Impressions',  v: 4240000, prev: 3810000 },
  { id: 'sess',     name: 'Sessions',     v: 184400,  prev: 162800 },
  { id: 'view',     name: 'Product view', v: 92600,   prev: 84500 },
  { id: 'cart',     name: 'Add to cart',  v: 21440,   prev: 18900 },
  { id: 'checkout', name: 'Checkout',     v: 4120,    prev: 4280 },
  { id: 'order',    name: 'Order',        v: 1284,    prev: 1188 },
]

export const FEED = [
  { id: 'f1', who: 'tt', when: '9 min ago', tag: 'spike',
    title: 'TikTok CTR jumped to 4.8%',
    body: 'Your "behind the scenes · candle pour" video crossed 1M views overnight — driving 23% more clicks than yesterday.',
    delta: { dir: 'up', value: '+1.4pp', label: 'vs 7d avg' },
    data: shapeSeries(2.5, 14, 'growth', 4), cta: 'See the video' },
  { id: 'f2', who: 'ga', when: '2 hr ago', tag: 'drop',
    title: 'Mobile conversion fell 1.1pp',
    body: 'iOS Safari only. Checkout step 2 → 3 saw the biggest drop. Looks like a JS error in payment SDK.',
    delta: { dir: 'down', value: '−1.1pp', label: '24h' },
    data: shapeSeries(3.6, 14, 'decline', 11), cta: 'Investigate' },
  { id: 'f3', who: 'sh', when: '5 hr ago', tag: 'goal',
    title: '🎯 weekly revenue goal hit',
    body: '$100k crossed at 11:47am Tuesday — earliest in 6 weeks. Top contributors: TikTok ($38k), Email ($14k), Direct ($11k).',
    delta: { dir: 'up', value: '108%', label: 'of goal' },
    data: shapeSeries(60, 14, 'growth', 7), cta: 'Share win' },
  { id: 'f4', who: 'am', when: 'yesterday', tag: 'risk',
    title: '3 Amazon SKUs going OOS',
    body: 'Lavender candle, vanilla 12oz, sample pack — projected to run out by Friday at current pace.',
    delta: { dir: 'down', value: '−72%', label: 'inventory' },
    data: shapeSeries(42, 14, 'decline', 15), cta: 'Plan restock' },
  { id: 'f5', who: 'ma', when: 'yesterday', tag: 'opportunity',
    title: 'Meta CAC fell $4 → $19',
    body: 'New "summer carousel" creative is outperforming. Worth scaling the budget here while creative still feels fresh.',
    delta: { dir: 'up', value: '−$4 CAC', label: '7d' },
    data: shapeSeries(27, 14, 'decline', 22), cta: 'Scale spend' },
  { id: 'f6', who: 'gads', when: '2 days ago', tag: 'insight',
    title: 'Branded search up 18%',
    body: '"pine and pearl candles" queries jumped after the TikTok went viral. Halo effect into Google.',
    delta: { dir: 'up', value: '+18%', label: '7d' },
    data: shapeSeries(120, 14, 'growth', 31), cta: 'Read more' },
]

export const TAG_STYLES = {
  spike:       { color: 'var(--up)',       label: '▲ spike' },
  drop:        { color: 'var(--dn)',       label: '▼ drop' },
  goal:        { color: 'var(--accent)',   label: '★ goal' },
  risk:        { color: '#b05c00',         label: '! risk' },
  opportunity: { color: 'var(--accent-2)', label: '＋ opportunity' },
  insight:     { color: 'var(--ink-3)',    label: '· insight' },
}

export function fmt(value, kind = 'int') {
  if (kind === 'money') {
    if (value >= 1e6) return '$' + (value / 1e6).toFixed(1) + 'M'
    if (value >= 1e3) return '$' + (value / 1e3).toFixed(1) + 'k'
    return '$' + Math.round(value)
  }
  if (kind === 'money0') return '$' + Math.round(value).toLocaleString()
  if (kind === 'int')    return Math.round(value).toLocaleString()
  if (kind === 'x')      return value.toFixed(1) + 'x'
  if (kind === 'pct')    return value.toFixed(1) + '%'
  if (kind === 'compact') {
    if (value >= 1e6) return (value / 1e6).toFixed(1) + 'M'
    if (value >= 1e3) return (value / 1e3).toFixed(1) + 'k'
    return Math.round(value).toLocaleString()
  }
  return String(value)
}

export function pctChange(curr, prev) {
  if (!prev) return 0
  return ((curr - prev) / prev) * 100
}

export function fmtChange(curr, prev) {
  const d = pctChange(curr, prev)
  const sign = d >= 0 ? '+' : '−'
  return sign + Math.abs(d).toFixed(1) + '%'
}

export function Icon({ name, size = 16, strokeWidth = 1.6 }) {
  const p = { width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' }
  switch (name) {
    case 'home':        return <svg {...p}><path d="M3 11l9-8 9 8v9a2 2 0 0 1-2 2h-4v-7H9v7H5a2 2 0 0 1-2-2z"/></svg>
    case 'sparkles':    return <svg {...p}><path d="M12 3l1.7 4.3L18 9l-4.3 1.7L12 15l-1.7-4.3L6 9l4.3-1.7z"/><path d="M19 14l.9 2.3L22 17l-2.1.7L19 20l-.9-2.3L16 17l2.1-.7z"/></svg>
    case 'funnel':      return <svg {...p}><path d="M3 5h18l-7 9v7l-4-2v-5z"/></svg>
    case 'grid':        return <svg {...p}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
    case 'plug':        return <svg {...p}><path d="M9 2v6m6-6v6"/><path d="M5 8h14v3a7 7 0 0 1-14 0z"/><path d="M12 18v4"/></svg>
    case 'target':      return <svg {...p}><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/></svg>
    case 'bell':        return <svg {...p}><path d="M6 10a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6z"/><path d="M10 21a2 2 0 0 0 4 0"/></svg>
    case 'users':       return <svg {...p}><circle cx="9" cy="8" r="3.5"/><path d="M2 21c0-3.5 3-6 7-6s7 2.5 7 6"/><circle cx="17" cy="9" r="2.5"/><path d="M14 21h8c0-2.5-2-4.5-4-4.5"/></svg>
    case 'gear':        return <svg {...p}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 0 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 0 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 0 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9V9c.2.6.7 1 1.5 1H21a2 2 0 0 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>
    case 'search':      return <svg {...p}><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
    case 'plus':        return <svg {...p}><path d="M12 5v14M5 12h14"/></svg>
    case 'arrow-up':    return <svg {...p}><path d="M5 12l7-7 7 7"/><path d="M12 5v14"/></svg>
    case 'arrow-down':  return <svg {...p}><path d="M5 12l7 7 7-7"/><path d="M12 5v14"/></svg>
    case 'arrow-right': return <svg {...p}><path d="M5 12h14"/><path d="m13 5 7 7-7 7"/></svg>
    case 'share':       return <svg {...p}><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="m8 11 8-4"/><path d="m8 13 8 4"/></svg>
    case 'check':       return <svg {...p}><path d="m5 12 5 5L20 7"/></svg>
    case 'x':           return <svg {...p}><path d="M6 6l12 12M18 6L6 18"/></svg>
    case 'chev-right':  return <svg {...p}><path d="m9 6 6 6-6 6"/></svg>
    case 'chev-down':   return <svg {...p}><path d="m6 9 6 6 6-6"/></svg>
    case 'moon':        return <svg {...p}><path d="M21 13A9 9 0 1 1 11 3a7 7 0 0 0 10 10z"/></svg>
    case 'dots':        return <svg {...p}><circle cx="5" cy="12" r="1.4"/><circle cx="12" cy="12" r="1.4"/><circle cx="19" cy="12" r="1.4"/></svg>
    case 'zap':         return <svg {...p}><path d="M13 2 3 14h8l-1 8 10-12h-8z"/></svg>
    case 'wand':        return <svg {...p}><path d="M15 4v2M15 10v2M9 7h2M19 7h2M16 9l5 5-7 7-5-5z"/></svg>
    case 'send':        return <svg {...p}><path d="m4 12 16-8-6 18-2-8z"/></svg>
    case 'globe':       return <svg {...p}><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>
    case 'list':        return <svg {...p}><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>
    case 'play':        return <svg {...p}><path d="M6 4l14 8-14 8z"/></svg>
    default:            return null
  }
}

export function SrcIcon({ icon, size = 'md', children }) {
  return <div className={'src ' + icon + (size === 'lg' ? ' lg' : size === 'sm' ? ' sm' : '')}>{children}</div>
}

function buildPath(data, w, h, pad = 4) {
  if (!data || !data.length) return { d: '', area: '', pts: [] }
  const max = Math.max(...data), min = Math.min(...data)
  const range = Math.max(1e-6, max - min)
  const step = (w - pad * 2) / Math.max(1, data.length - 1)
  const pts = data.map((v, i) => [pad + i * step, pad + (h - pad * 2) * (1 - (v - min) / range)])
  let d = `M ${pts[0][0].toFixed(2)} ${pts[0][1].toFixed(2)}`
  for (let i = 0; i < pts.length - 1; i++) {
    const [x0,y0] = pts[Math.max(0,i-1)], [x1,y1] = pts[i]
    const [x2,y2] = pts[i+1], [x3,y3] = pts[Math.min(pts.length-1,i+2)]
    const cp1x = x1+(x2-x0)/6, cp1y = y1+(y2-y0)/6
    const cp2x = x2-(x3-x1)/6, cp2y = y2-(y3-y1)/6
    d += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${x2.toFixed(2)} ${y2.toFixed(2)}`
  }
  const area = d + ` L ${(w-pad).toFixed(2)} ${(h-pad).toFixed(2)} L ${pad} ${(h-pad).toFixed(2)} Z`
  return { d, area, pts }
}

export function Sparkline({ data, color = 'var(--accent)', height = 36, fill = true, strokeWidth = 1.8 }) {
  const w = 200, h = height
  const { d, area } = React.useMemo(() => buildPath(data, w, h, 3), [data, height])
  const gid = React.useId()
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="spark" style={{ overflow: 'hidden' }}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.22"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      {fill && <path d={area} fill={`url(#${gid})`}/>}
      <path d={d} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

export function LineChart({ data, labels, color = 'var(--accent)', height = 200, compare }) {
  const w = 800, h = height, pad = 24
  const { d, area, pts } = React.useMemo(() => buildPath(data, w, h, pad), [data, height])
  const cmp = React.useMemo(() => compare ? buildPath(compare, w, h, pad) : null, [compare, height])
  const gid = React.useId()
  const grid = [0.25, 0.5, 0.75].map(t => pad + (h - pad * 2) * t)
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="chart-svg" style={{ overflow: 'hidden' }}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18"/>
          <stop offset="100%" stopColor={color} stopOpacity="0"/>
        </linearGradient>
      </defs>
      {grid.map((y,i) => <line key={i} x1={pad} x2={w-pad} y1={y} y2={y} stroke="var(--border)" strokeWidth="1" strokeDasharray="2 3"/>)}
      {cmp && <path d={cmp.d} fill="none" stroke="var(--ink-4)" strokeWidth="1.5" strokeDasharray="4 4"/>}
      <path d={area} fill={`url(#${gid})`}/>
      <path d={d} fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
      {pts.length > 0 && (() => { const [x,y] = pts[pts.length-1]; return <><circle cx={x} cy={y} r="6" fill={color} opacity="0.18"/><circle cx={x} cy={y} r="3.5" fill={color} stroke="var(--surface)" strokeWidth="2"/></> })()}
      {labels && labels.map((t,i) => { const x = pad+((w-pad*2)*i)/Math.max(1,labels.length-1); return <text key={i} x={x} y={h-4} textAnchor="middle" fontFamily="JetBrains Mono" fontSize="10" fill="var(--ink-3)">{t}</text> })}
    </svg>
  )
}

export function BarChart({ data, labels, color = 'var(--ink)', highlight = -1, height = 200 }) {
  const w = 800, h = height, pad = 24
  const max = Math.max(...data)
  const bw = (w - pad*2) / data.length * 0.66
  const slot = (w - pad*2) / data.length
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="chart-svg" style={{ overflow: 'hidden' }}>
      {[0.25,0.5,0.75].map((t,i) => { const y = pad+(h-pad*2)*t; return <line key={i} x1={pad} x2={w-pad} y1={y} y2={y} stroke="var(--border)" strokeWidth="1" strokeDasharray="2 3"/> })}
      {data.map((v,i) => {
        const bh = (h-pad*2)*(v/max), x = pad+slot*i+(slot-bw)/2, y = h-pad-bh
        return <g key={i}><rect x={x} y={y} width={bw} height={bh} rx="6" fill={i===highlight?'var(--accent)':color}/>
          {labels&&labels[i]&&<text x={x+bw/2} y={h-6} textAnchor="middle" fontFamily="JetBrains Mono" fontSize="10" fill="var(--ink-3)">{labels[i]}</text>}
        </g>
      })}
    </svg>
  )
}

export function Donut({ value, label, sub, size = 120, stroke = 12, color = 'var(--accent)' }) {
  const r = (size-stroke)/2, c = 2*Math.PI*r
  return (
    <svg viewBox={`0 0 ${size} ${size}`} style={{ width: size, height: size, display: 'block' }}>
      <circle cx={size/2} cy={size/2} r={r} stroke="var(--surface-2)" strokeWidth={stroke} fill="none"/>
      <circle cx={size/2} cy={size/2} r={r} stroke={color} strokeWidth={stroke} fill="none"
        strokeDasharray={`${(c*value).toFixed(2)} ${c.toFixed(2)}`} strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`}/>
      <text x="50%" y="48%" dominantBaseline="middle" textAnchor="middle"
        fontFamily="Bricolage Grotesque" fontSize={size*0.22} fontWeight="700" fill="var(--ink)">{label}</text>
      {sub && <text x="50%" y="65%" dominantBaseline="middle" textAnchor="middle"
        fontFamily="JetBrains Mono" fontSize={size*0.085} fill="var(--ink-3)">{sub}</text>}
    </svg>
  )
}

export function StackBar({ parts, height = 8, radius = 4 }) {
  const total = parts.reduce((s,p) => s+p.v, 0) || 1
  return (
    <div style={{ width:'100%', height, borderRadius: radius, overflow:'hidden', display:'flex', background:'var(--surface-2)' }}>
      {parts.map((p,i) => <div key={i} style={{ width:(p.v/total*100)+'%', background:p.color, height:'100%' }} title={`${p.label}: ${p.v}`}/>)}
    </div>
  )
}

export function KPI({ label, value, prev, format='int', data, color='var(--accent)', invert=false }) {
  const change = pctChange(value, prev)
  const up = invert ? change < 0 : change >= 0
  const sign = change >= 0 ? '+' : '−'
  return (
    <div className="card">
      <div className="row between" style={{ alignItems:'baseline' }}>
        <div className="tag">{label}</div>
        <span className={'chip '+(up?'up':'dn')} style={{ fontSize:10.5 }}>
          <Icon name={change>=0?'arrow-up':'arrow-down'} size={11}/>
          {sign}{Math.abs(change).toFixed(1)}%
        </span>
      </div>
      <div className="num" style={{ fontSize:36, marginTop:6 }}>{fmt(value,format)}</div>
      <div className="muted" style={{ fontSize:11.5, marginTop:2 }}>vs {fmt(prev,format)} last period</div>
      <div style={{ marginTop:12 }}><Sparkline data={data} color={color} height={42}/></div>
    </div>
  )
}
