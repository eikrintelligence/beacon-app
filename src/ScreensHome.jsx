import React, { useState, useRef } from 'react'
import { PERSONAS, FEED, TAG_STYLES, shapeSeries, fmt, fmtChange, pctChange, Icon, SrcIcon, Sparkline, LineChart, KPI } from './shared'

export function ScreenHome({ persona, shape, onNavigate, onAsk }) {
  const p = PERSONAS[persona] || PERSONAS.marketing
  const h = new Date().getHours()
  const greeting = h < 12 ? 'good morning' : h < 18 ? 'good afternoon' : 'good evening'
  const [filter, setFilter] = useState('all')
  const filtered = FEED.filter(f => filter === 'all' || f.tag === filter)
  const filters = [['all','All'],['spike','Spikes'],['drop','Drops'],['goal','Goals'],['risk','Risks'],['opportunity','Opps']]

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>{greeting}, Denisse</h1>
          <div className="sub">6 things changed since yesterday · <span style={{ color:'var(--accent)', fontWeight:600 }}>2 worth your attention</span></div>
        </div>
        <div className="actions">
          <div className="range"><span className="dot"/> Last 7 days <Icon name="chev-down" size={12}/></div>
          <button className="btn"><Icon name="share" size={14}/> Share digest</button>
        </div>
      </div>

      <div className="fade-in" style={{ marginBottom:4 }}>
        <button className="prompt-bar" onClick={onAsk} style={{ width:'100%', textAlign:'left', cursor:'pointer' }}>
          <span style={{ width:26, height:26, borderRadius:8, background:'linear-gradient(135deg,var(--accent),var(--accent-3))', display:'grid', placeItems:'center', color:'white', flexShrink:0 }}>
            <Icon name="sparkles" size={14}/>
          </span>
          <span style={{ color:'var(--ink-3)', fontSize:15, flex:1 }}>
            Ask Sjá · <i style={{ color:'var(--ink-4)' }}>"why did TikTok spike yesterday?"</i>
          </span>
          <kbd style={{ fontFamily:'var(--font-mono)', fontSize:10, background:'var(--surface-2)', border:'1px solid var(--border)', padding:'2px 6px', borderRadius:4, color:'var(--ink-3)' }}>/</kbd>
        </button>
      </div>

      <div className="grid-4 fade-in" style={{ animationDelay:'60ms' }}>
        {p.kpis.map((k, i) => (
          <KPI key={k.key} label={k.label} value={k.base} prev={k.prev} format={k.format}
            invert={k.key==='cac'||k.key==='burn'||k.key==='cycle'}
            color={['var(--accent)','var(--accent-2)','var(--accent-4)','var(--accent-3)'][i%4]}
            data={shapeSeries(k.base*0.6, 14, shape, 10+i*3)}/>
        ))}
      </div>

      <div className="row between fade-in" style={{ alignItems:'center', animationDelay:'100ms' }}>
        <div className="row tight" style={{ alignItems:'center' }}>
          <h2 style={{ fontSize:22 }}>Today's pulse</h2>
          <span className="chip accent" style={{ marginLeft:8 }}>
            <span style={{ width:6, height:6, borderRadius:'50%', background:'var(--accent)', animation:'halo-pulse 1.8s ease-out infinite' }}/>
            live
          </span>
        </div>
        <div className="row tight">
          {filters.map(([val, lbl]) => (
            <button key={val} className={'btn sm'+(filter===val?' primary':'')} onClick={() => setFilter(val)}>{lbl}</button>
          ))}
        </div>
      </div>

      <div className="stack fade-in" style={{ animationDelay:'140ms' }}>
        {filtered.map(f => {
          const ts = TAG_STYLES[f.tag] || {}
          return (
            <div key={f.id} className="feed-item">
              <div className="row tight" style={{ alignItems:'flex-start' }}>
                <SrcIcon icon={f.who}>{f.who.slice(0,2).toUpperCase()}</SrcIcon>
                <div style={{ flex:1 }}>
                  <div className="row between" style={{ alignItems:'center', marginBottom:4 }}>
                    <div style={{ fontWeight:600, fontSize:14.5 }}>{f.title}</div>
                    <div className="row tight" style={{ alignItems:'center' }}>
                      <span style={{ fontSize:11, color:ts.color, fontWeight:600 }}>{ts.label}</span>
                      <span className="muted" style={{ fontSize:11 }}>{f.when}</span>
                    </div>
                  </div>
                  <div style={{ color:'var(--ink-2)', fontSize:13.5, lineHeight:1.55 }}>{f.body}</div>
                </div>
              </div>
              <div className="row between" style={{ alignItems:'center', marginTop:4 }}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <span className={'chip '+(f.delta.dir==='up'?'up':'dn')} style={{ fontSize:11 }}>
                    {f.delta.dir==='up'?'↑':'↓'} {f.delta.value}
                  </span>
                  <span className="muted" style={{ fontSize:11 }}>{f.delta.label}</span>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ width:120, height:32 }}>
                    <Sparkline data={f.data} color={f.delta.dir==='up'?'var(--up)':'var(--dn)'} height={32}/>
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
  'why did TikTok spike yesterday?',
  'compare CAC across channels last 30 days',
  'which product drives the most repeat buyers?',
  'where is the funnel leaking this week?',
  'what is our best performing creative this month?',
]

const MOCK_ANSWERS = {
  default: {
    text: "TikTok is your **best week ever** — **4.8M views**, up 38% week over week. The whole spike traces to **one video** that went viral Tuesday night.",
    chart: true,
    actions: ['Show me the video', 'Compare to Meta', 'What % of revenue came from it?'],
  }
}

export function ScreenAsk({ persona, shape }) {
  const [input, setInput] = useState('')
  const [threads, setThreads] = useState([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef(null)

  React.useEffect(() => { inputRef.current?.focus() }, [])

  function submit(q) {
    const question = q || input.trim()
    if (!question) return
    setInput('')
    setLoading(true)
    setTimeout(() => {
      setThreads(prev => [...prev, { q: question, a: MOCK_ANSWERS.default }])
      setLoading(false)
    }, 800)
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
              <p style={{ margin:'0 0 12px', fontSize:14.5, lineHeight:1.65 }}>
                TikTok is your <strong>best week ever</strong> — <strong>4.8M views</strong>, up 38% week over week.
                The whole spike traces to <strong>one video</strong> that went viral Tuesday night.
              </p>
              {t.a.chart && (
                <div style={{ margin:'12px 0', background:'var(--surface-2)', borderRadius:10, padding:'14px 16px' }}>
                  <div className="row between" style={{ marginBottom:8 }}>
                    <span className="tag">TIKTOK VIEWS · 7D</span>
                    <span className="chip up" style={{ fontSize:11 }}>↑ +38% WoW</span>
                  </div>
                  <div style={{ height:90 }}>
                    <Sparkline data={shapeSeries(80, 14, 'growth', 4)} height={90}/>
                  </div>
                </div>
              )}
              <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginTop:8 }}>
                {t.a.actions.map(a => (
                  <button key={a} className="btn sm">{a}</button>
                ))}
              </div>
              <div className="row between" style={{ marginTop:14, paddingTop:12, borderTop:'1px solid var(--border)' }}>
                <div className="row tight">
                  <button className="btn sm"><Icon name="pin" size={12}/> Pin to dashboard</button>
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
