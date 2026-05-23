import React, { useState, useRef } from 'react'
import { PERSONAS, FEED, TAG_STYLES, shapeSeries, fmt, fmtChange, pctChange, Icon, SrcIcon, Sparkline, LineChart, KPI } from './shared'

export function ScreenHome({ persona, shape, onNavigate, onAsk, revenueData, workspaceData }) {
  const p = PERSONAS[persona] || PERSONAS.marketing
  const h = new Date().getHours()
  const greeting = h < 12 ? 'good morning' : h < 18 ? 'good afternoon' : 'good evening'
  const [filter, setFilter] = useState('all')
  const filtered = FEED.filter(f => filter === 'all' || f.tag === filter)
  const filters = [['all','All'],['spike','Spikes'],['drop','Drops'],['goal','Goals'],['risk','Risks'],['opportunity','Opps']]

  // $500K pace tracker — use real data if available
  const goal = workspaceData?.goals?.find(g => g.type === 'revenue')
  const goalTarget = goal?.target || 500000
  const goalStart = goal?.start_date || '2026-04-01'
  const goalEnd = goal?.end_date || '2026-12-31'
  const brandName = workspaceData?.workspace?.name || 'Dog Treat Naturals'

  const startDate = new Date(goalStart)
  const endDate = new Date(goalEnd)
  const now = new Date()
  const totalWeeks = Math.round((endDate - startDate) / (7 * 24 * 60 * 60 * 1000))
  const weeksElapsed = Math.max(1, Math.round((now - startDate) / (7 * 24 * 60 * 60 * 1000)))
  const weekNumber = weeksElapsed
  const weeksLeft = Math.max(1, totalWeeks - weeksElapsed)

  const current = revenueData?.allTimeRevenue || goal?.current || 0
  const pacePerWeek = current / weeksElapsed
  const projected = Math.round(pacePerWeek * totalWeeks)
  const projectedK = Math.round(projected / 1000)
  const neededPerWeek = Math.round((goalTarget - current) / weeksLeft)
  const onTrack = projected >= goalTarget * 0.95
  const ahead = projected >= goalTarget
  const statusColor = ahead ? 'var(--up)' : onTrack ? 'var(--accent-3)' : 'var(--dn)'
  const statusLabel = ahead ? '✓ On track' : onTrack ? '⚠ Watch closely' : '✗ Off pace'
  const pct = Math.min(100, Math.round((current / goalTarget) * 100))
  const projPct = Math.min(100, Math.round((projected / goalTarget) * 100))

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>{greeting}, Denisse</h1>
          <div className="sub">{brandName} · Week {weekNumber} of {totalWeeks} · <span style={{ color:'var(--accent)', fontWeight:600 }}>2 things need your attention</span></div>
        </div>
        <div className="actions">
          <div className="range"><span className="dot"/> Last 7 days <Icon name="chev-down" size={12}/></div>
          <button className="btn"><Icon name="share" size={14}/> Share digest</button>
        </div>
      </div>

      {/* $500K GOAL TRACKER */}
      <div className="card fade-in" style={{ background: 'var(--ink)', color: 'var(--bg)', borderColor: 'var(--ink)', padding: '24px 28px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 24, alignItems: 'start' }}>
          <div style={{ gridColumn: '1 / 3' }}>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', opacity: 0.5, marginBottom: 8, fontFamily: 'var(--font-mono)' }}>$500K REVENUE GOAL · DEC 2026</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 6 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 52, letterSpacing: '-0.03em', lineHeight: 1 }}>
                ${Math.round(current / 1000)}k
              </div>
              <div style={{ opacity: 0.5, fontSize: 20, fontFamily: 'var(--font-display)', fontWeight: 500 }}>/ $500k</div>
              <div style={{ padding: '4px 10px', borderRadius: 999, background: statusColor, color: ahead ? 'white' : 'var(--ink)', fontSize: 12, fontWeight: 700, marginLeft: 4 }}>
                {statusLabel}
              </div>
            </div>
            {/* Progress bar */}
            <div style={{ height: 6, background: 'rgba(255,255,255,0.12)', borderRadius: 3, marginBottom: 8, position: 'relative' }}>
              <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: pct + '%', background: 'var(--accent)', borderRadius: 3, transition: 'width 0.6s ease' }}/>
              <div style={{ position: 'absolute', left: projPct + '%', top: -3, width: 2, height: 12, background: 'rgba(255,255,255,0.4)', borderRadius: 1 }}/>
            </div>
            <div style={{ fontSize: 12, opacity: 0.55, fontFamily: 'var(--font-mono)' }}>
              {pct}% complete · projected ${projectedK}k at current pace
            </div>
          </div>

          <div style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: 24 }}>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.07em', opacity: 0.45, marginBottom: 8, fontFamily: 'var(--font-mono)' }}>WEEKLY PACE NEEDED</div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 28, letterSpacing: '-0.02em' }}>
              ${Math.round(neededPerWeek / 1000)}k
            </div>
            <div style={{ fontSize: 12, opacity: 0.5, marginTop: 4 }}>${Math.round(pacePerWeek / 1000)}k current avg</div>
            <div style={{ marginTop: 8, fontSize: 12, color: pacePerWeek >= neededPerWeek ? '#4ade80' : '#f87171', fontWeight: 600 }}>
              {pacePerWeek >= neededPerWeek ? '↑ Ahead of pace' : `↓ ${Math.round((neededPerWeek - pacePerWeek) / 1000)}k gap to close`}
            </div>
          </div>

          <div style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: 24 }}>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.07em', opacity: 0.45, marginBottom: 8, fontFamily: 'var(--font-mono)' }}>WEEKS REMAINING</div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 28, letterSpacing: '-0.02em' }}>{weeksLeft}</div>
            <div style={{ fontSize: 12, opacity: 0.5, marginTop: 4 }}>of {totalWeeks} total</div>
            <div style={{ marginTop: 8, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              {Array.from({ length: totalWeeks }).map((_, i) => (
                <div key={i} style={{ width: 6, height: 6, borderRadius: 1, background: i < weekNumber ? 'var(--accent)' : 'rgba(255,255,255,0.12)' }}/>
              ))}
            </div>
          </div>
        </div>
      </div>

      {workspaceData?.alerts?.length > 0 && (
        <div className="stack fade-in" style={{ gap: 8, animationDelay: '30ms' }}>
          {workspaceData.alerts.map(alert => (
            <div key={alert.id} style={{
              display: 'flex', alignItems: 'flex-start', gap: 12,
              padding: '12px 16px', borderRadius: 12,
              background: alert.severity === 'warning' ? 'color-mix(in oklab, #f59e0b 12%, var(--surface))' : 'color-mix(in oklab, var(--dn) 10%, var(--surface))',
              border: `1px solid ${alert.severity === 'warning' ? 'color-mix(in oklab, #f59e0b 30%, var(--surface))' : 'color-mix(in oklab, var(--dn) 25%, var(--surface))'}`,
            }}>
              <span style={{ fontSize: 16 }}>{alert.severity === 'warning' ? '⚠️' : '🚨'}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)' }}>{alert.message}</div>
                <div style={{ fontSize: 11.5, color: 'var(--ink-3)', marginTop: 2 }}>{new Date(alert.created_at).toLocaleDateString()}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ASK SJÁ PROMPT */}
      <div className="fade-in" style={{ marginBottom: 4, animationDelay: '40ms' }}>
        <button className="prompt-bar" onClick={onAsk} style={{ width: '100%', textAlign: 'left', cursor: 'pointer' }}>
          <span style={{ width: 26, height: 26, borderRadius: 8, background: 'linear-gradient(135deg,var(--accent),var(--accent-3))', display: 'grid', placeItems: 'center', color: 'white', flexShrink: 0 }}>
            <Icon name="sparkles" size={14}/>
          </span>
          <span style={{ color: 'var(--ink-3)', fontSize: 15, flex: 1 }}>
            Ask Sjá · <i style={{ color: 'var(--ink-4)' }}>"are we on pace for $500K this week?"</i>
          </span>
          <kbd style={{ fontFamily: 'var(--font-mono)', fontSize: 10, background: 'var(--surface-2)', border: '1px solid var(--border)', padding: '2px 6px', borderRadius: 4, color: 'var(--ink-3)' }}>/</kbd>
        </button>
      </div>

      {/* KPI GRID */}
      <div className="grid-4 fade-in" style={{ animationDelay: '60ms' }}>
        {p.kpis.map((k, i) => (
          <KPI key={k.key} label={k.label} value={k.base} prev={k.prev} format={k.format}
            invert={k.key === 'cac' || k.key === 'burn' || k.key === 'cycle'}
            color={['var(--accent)', 'var(--accent-2)', 'var(--accent-4)', 'var(--accent-3)'][i % 4]}
            data={shapeSeries(k.base * 0.6, 14, shape, 10 + i * 3)}/>
        ))}
      </div>

      {/* PULSE FEED */}
      <div className="row between fade-in" style={{ alignItems: 'center', animationDelay: '100ms' }}>
        <div className="row tight" style={{ alignItems: 'center' }}>
          <h2 style={{ fontSize: 22 }}>Today's pulse</h2>
          <span className="chip accent" style={{ marginLeft: 8 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', animation: 'halo-pulse 1.8s ease-out infinite' }}/>
            live
          </span>
        </div>
        <div className="row tight">
          {filters.map(([val, lbl]) => (
            <button key={val} className={'btn sm' + (filter === val ? ' primary' : '')} onClick={() => setFilter(val)}>{lbl}</button>
          ))}
        </div>
      </div>

      <div className="stack fade-in" style={{ animationDelay: '140ms' }}>
        {filtered.map(f => {
          const ts = TAG_STYLES[f.tag] || {}
          return (
            <div key={f.id} className="feed-item">
              <div className="row tight" style={{ alignItems: 'flex-start' }}>
                <SrcIcon icon={f.who}>{f.who.slice(0, 2).toUpperCase()}</SrcIcon>
                <div style={{ flex: 1 }}>
                  <div className="row between" style={{ alignItems: 'center', marginBottom: 4 }}>
                    <div style={{ fontWeight: 600, fontSize: 14.5 }}>{f.title}</div>
                    <div className="row tight" style={{ alignItems: 'center' }}>
                      <span style={{ fontSize: 11, color: ts.color, fontWeight: 600 }}>{ts.label}</span>
                      <span className="muted" style={{ fontSize: 11 }}>{f.when}</span>
                    </div>
                  </div>
                  <div style={{ color: 'var(--ink-2)', fontSize: 13.5, lineHeight: 1.55 }}>{f.body}</div>
                </div>
              </div>
              <div className="row between" style={{ alignItems: 'center', marginTop: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span className={'chip ' + (f.delta.dir === 'up' ? 'up' : 'dn')} style={{ fontSize: 11 }}>
                    {f.delta.dir === 'up' ? '↑' : '↓'} {f.delta.value}
                  </span>
                  <span className="muted" style={{ fontSize: 11 }}>{f.delta.label}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 120, height: 32, overflow: 'hidden' }}>
                    <Sparkline data={f.data} color={f.delta.dir === 'up' ? 'var(--up)' : 'var(--dn)'} height={32}/>
                  </div>
                  <button className="btn sm">{f.cta} <Icon name="arrow-right" size={12}/></button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const SUGGESTIONS = [
  'Are we on pace for our revenue goal?',
  'Which channel is driving the most revenue?',
  'What is our repurchase rate this month?',
  'Which products are selling best right now?',
  'Where is our biggest drop-off in the funnel?',
  'What should I focus on this week?',
]

export function ScreenAsk({ persona, shape, token, workspaceId }) {
  const [input, setInput] = useState('')
  const [threads, setThreads] = useState([])
  const [loading, setLoading] = useState(false)
  const [history, setHistory] = useState([])
  const inputRef = useRef(null)

  React.useEffect(() => { inputRef.current?.focus() }, [])

  async function submit(q) {
    const question = q || input.trim()
    if (!question) return
    setInput('')
    setLoading(true)
    try {
      const { askAI } = await import('./api')
      const result = await askAI(token, workspaceId, question, history)
      const newThread = { q: question, a: result.answer }
      setThreads(prev => [...prev, newThread])
      setHistory(prev => [
        ...prev,
        { role: 'user', content: question },
        { role: 'assistant', content: result.answer }
      ])
    } catch (err) {
      setThreads(prev => [...prev, { q: question, a: 'Sorry — could not reach Sjá backend. Check your connection.' }])
    }
    setLoading(false)
  }

  return (
    <div className="page" style={{ gap:16 }}>
      <div className="page-head">
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ width:36, height:36, background:'var(--accent)', borderRadius:10, display:'grid', placeItems:'center' }}>
            <Icon name="sparkles" size={18} strokeWidth={1.8}/>
          </div>
          <div>
            <h1 style={{ fontSize:28 }}>Ask Sjá</h1>
            <div className="sub">Plain-English questions across all your data. Pin answers to a dashboard.</div>
          </div>
        </div>
        <div className="actions">
          <button className="btn"><Icon name="list" size={14}/> Threads ({threads.length})</button>
          <button className="btn primary" onClick={() => { setThreads([]); setInput('') }}><Icon name="plus" size={14}/> New</button>
        </div>
      </div>

      {threads.length === 0 && (
        <div className="fade-in">
          <div className="tag" style={{ marginBottom:12 }}>TRY ASKING</div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
            {SUGGESTIONS.map(s => (
              <button key={s} className="btn" style={{ fontSize:13 }} onClick={() => submit(s)}>
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="ask-thread">
        {threads.map((t, i) => (
          <div key={i} className="fade-in" style={{ display:'flex', flexDirection:'column', gap:10 }}>
            <div className="ask-bubble user">
              <div style={{ fontWeight:500 }}>{t.q}</div>
            </div>
            <div className="ask-bubble">
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
                <div style={{ width:22, height:22, background:'var(--accent)', borderRadius:6, display:'grid', placeItems:'center', flexShrink:0 }}>
                  <Icon name="sparkles" size={12}/>
                </div>
                <span className="tag">SJÁ</span>
              </div>
              <div style={{ fontSize:14.5, lineHeight:1.7, color:'var(--ink-2)' }}
                dangerouslySetInnerHTML={{ __html: t.a.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>') }}
              />
              <div className="row between" style={{ marginTop:14, paddingTop:12, borderTop:'1px solid var(--border)' }}>
                <div className="row tight">
                  <button className="btn sm ghost"><Icon name="share" size={12}/></button>
                </div>
                <div className="row tight">
                  <button className="btn sm ghost">👍</button>
                  <button className="btn sm ghost">👎</button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="ask-bubble fade-in">
            <div style={{ display:'flex', gap:6, alignItems:'center', color:'var(--ink-3)' }}>
              <Icon name="sparkles" size={14}/> Thinking…
            </div>
          </div>
        )}
      </div>

      <div style={{ marginTop:'auto' }}>
        <div className="ask-input-bar">
          <span style={{ color:'var(--accent)' }}><Icon name="sparkles" size={16}/></span>
          <input ref={inputRef} placeholder="Ask anything · try 'compare CAC across channels last 30 days'"
            value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key==='Enter' && submit()}/>
          <button className="btn sm primary" onClick={() => submit()} disabled={!input.trim()}>
            <Icon name="send" size={13}/> Ask
          </button>
        </div>
        <div style={{ textAlign:'center', marginTop:6, fontSize:11, color:'var(--ink-4)' }}>
          / to focus · ↵ to send · <span style={{ color:'var(--accent)' }}>Sjá can be wrong</span> — verify big decisions
        </div>
      </div>
    </div>
  )
}
