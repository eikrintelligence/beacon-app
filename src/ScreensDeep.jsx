import React, { useState, useMemo } from 'react'
import { FUNNEL, CHANNELS, shapeSeries, fmt, pctChange, Icon, SrcIcon, Sparkline, LineChart, BarChart, Donut, StackBar } from './shared'

export function ScreenFunnel({ shape }) {
  const [selectedIdx, setSelectedIdx] = useState(3)
  const [whatIf, setWhatIf] = useState(null)

  const stages = useMemo(() => FUNNEL.map((s, i) => {
    const prev = FUNNEL[i-1]
    const passCurr = prev ? (s.v / prev.v) * 100 : 100
    const passPrev = prev ? (s.prev / prev.prev) * 100 : 100
    return { ...s, passCurr, passPrev, delta: passCurr - passPrev }
  }), [])

  const projection = useMemo(() => {
    if (!whatIf) return null
    const newV = stages.map(s => s.v)
    for (let i = whatIf.idx; i < stages.length; i++) {
      if (i === 0) continue
      const pass = FUNNEL[i].v / FUNNEL[i-1].v
      const newPass = i === whatIf.idx ? pass * whatIf.multiplier : pass
      newV[i] = Math.round(newV[i-1] * newPass)
    }
    return newV
  }, [whatIf, stages])

  const channelMix = [
    { id:'tt', label:'TikTok', v:38, color:'#fe2c55' },
    { id:'ma', label:'Meta', v:27, color:'#1877f2' },
    { id:'gads', label:'Google Ads', v:18, color:'#4285f4' },
    { id:'org', label:'Organic', v:11, color:'var(--accent-2)' },
    { id:'em', label:'Email', v:6, color:'var(--accent-3)' },
  ]

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>The funnel</h1>
          <div className="sub">Follow a customer from impression to order · last 7 days</div>
        </div>
        <div className="actions">
          <div className="range"><span className="dot"/> Last 7 days <Icon name="chev-down" size={12}/></div>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'minmax(0,1fr) 300px', gap:16 }}>
        <div className="stack">
          <div className="card row between" style={{ alignItems:'center', gap:16 }}>
            <div>
              <div className="tag">END-TO-END CONVERSION</div>
              <div className="row tight" style={{ alignItems:'baseline', marginTop:4 }}>
                <div className="num" style={{ fontSize:44 }}>3.8%</div>
                <span className="chip up" style={{ marginLeft:4 }}><Icon name="arrow-up" size={11}/> +0.4pp WoW</span>
              </div>
              <div className="muted" style={{ fontSize:13, marginTop:2 }}>1,284 orders from 184k sessions · best in 9 weeks</div>
            </div>
            <div style={{ flex:'0 0 180px', height:80 }}>
              <Sparkline data={shapeSeries(3, 14, 'growth', 7)} height={80}/>
            </div>
          </div>

          <div className="card">
            <div className="row between" style={{ marginBottom:18 }}>
              <h3>Customer journey</h3>
              <div className="row tight">
                {whatIf && <button className="btn sm" onClick={() => setWhatIf(null)}><Icon name="x" size={11}/> Clear what-if</button>}
              </div>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
              {stages.map((s, i) => {
                const w = 30 + (Math.log10(s.v+1) / Math.log10(stages[0].v+1)) * 70
                const projV = projection ? projection[i] : null
                return (
                  <React.Fragment key={s.id}>
                    <button className={'stage'+(i===selectedIdx?' selected':'')}
                      style={{ width:w+'%', alignSelf:'center', textAlign:'left',
                        background: i===selectedIdx ? 'var(--accent-soft)' : 'var(--surface)',
                        borderColor: i===selectedIdx ? 'var(--accent)' : 'var(--border)' }}
                      onClick={() => setSelectedIdx(i)}>
                      <div className="row between" style={{ alignItems:'center' }}>
                        <div>
                          <div style={{ fontWeight:600, fontSize:15 }}>{s.name}</div>
                          {i > 0 && (
                            <div className="row tight" style={{ marginTop:2, fontSize:11.5 }}>
                              <span className="muted mono">{s.passCurr.toFixed(1)}% from prev</span>
                              <span style={{ color: s.delta>=0 ? 'var(--up)' : 'var(--dn)', fontFamily:'var(--font-mono)', fontSize:11 }}>
                                {s.delta>=0?'↑':'↓'} {Math.abs(s.delta).toFixed(1)}pp
                              </span>
                            </div>
                          )}
                        </div>
                        <div style={{ textAlign:'right' }}>
                          <div className="num" style={{ fontSize:22 }}>{fmt(s.v,'compact')}</div>
                          {projV && <div className="mono" style={{ fontSize:11, color:'var(--accent)' }}>→ {fmt(projV,'compact')}</div>}
                        </div>
                      </div>
                    </button>
                    {i < stages.length-1 && <div style={{ height:8, width:1, background:'var(--border-2)', alignSelf:'center' }}/>}
                  </React.Fragment>
                )
              })}
            </div>
          </div>

          <div className="card">
            <div className="row between" style={{ marginBottom:14 }}>
              <div>
                <div className="tag">STAGE BREAKDOWN</div>
                <h3 style={{ marginTop:4 }}>{stages[selectedIdx].name} · by source</h3>
              </div>
            </div>
            <div className="stack" style={{ gap:10 }}>
              {channelMix.map(c => {
                const v = Math.round(stages[selectedIdx].v * (c.v/100))
                return (
                  <div key={c.id} className="row tight" style={{ alignItems:'center', gap:12 }}>
                    <div style={{ width:90, fontSize:13 }}>{c.label}</div>
                    <div style={{ flex:1, height:22, background:'var(--surface-2)', borderRadius:6, overflow:'hidden' }}>
                      <div style={{ width:c.v+'%', height:'100%', background:c.color, transition:'width .4s' }}/>
                    </div>
                    <div className="num" style={{ width:70, textAlign:'right', fontSize:14 }}>{fmt(v,'compact')}</div>
                    <div className="mono muted" style={{ width:36, textAlign:'right', fontSize:11 }}>{c.v}%</div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <div className="stack">
          <div className="card" style={{ background:'var(--accent-soft)', borderColor:'color-mix(in oklab,var(--accent) 30%,var(--surface))' }}>
            <div className="row tight" style={{ marginBottom:8 }}>
              <Icon name="wand" size={14}/>
              <span className="tag" style={{ color:'var(--accent)' }}>WHAT-IF SIM</span>
            </div>
            <p style={{ fontSize:13, margin:'0 0 14px', color:'var(--ink-2)' }}>
              What if <strong>{stages[selectedIdx].name}</strong> conversion improved by 20%?
            </p>
            <button className="btn primary" style={{ width:'100%', justifyContent:'center' }}
              onClick={() => setWhatIf({ idx: selectedIdx, multiplier: 1.2 })}>
              Run simulation
            </button>
            {projection && (
              <div style={{ marginTop:14, padding:12, background:'var(--surface)', borderRadius:8 }}>
                <div className="tag" style={{ marginBottom:6 }}>PROJECTED IMPACT</div>
                <div className="num" style={{ fontSize:28 }}>+{fmt(projection[5]-stages[5].v,'compact')}</div>
                <div className="muted" style={{ fontSize:12 }}>additional orders/week</div>
              </div>
            )}
          </div>

          <div className="card">
            <div className="tag" style={{ marginBottom:10 }}>STAGE INSIGHTS</div>
            <div className="stack" style={{ gap:8 }}>
              {[
                { label:'Best stage', value:'Impressions → Sessions', color:'var(--up)' },
                { label:'Leakiest stage', value:'Checkout (−0.8pp)', color:'var(--dn)' },
                { label:'Biggest WoW gain', value:'Add to cart +1.2pp', color:'var(--accent)' },
              ].map(ins => (
                <div key={ins.label} style={{ padding:'10px 12px', background:'var(--surface-2)', borderRadius:8 }}>
                  <div className="tag" style={{ marginBottom:3 }}>{ins.label}</div>
                  <div style={{ fontWeight:600, fontSize:13.5, color:ins.color }}>{ins.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function ScreenConnections() {
  const [connected, setConnected] = useState(['tt','ma','gads','sh','ga'])
  const allSources = [
    ...CHANNELS,
    { id:'em', name:'Klaviyo Email', short:'EM', color:'#f59e0b', icon:'am' },
    { id:'yt', name:'YouTube Ads', short:'YT', color:'#ff0000', icon:'ma' },
    { id:'pi', name:'Pinterest', short:'PI', color:'#e60023', icon:'tt' },
  ]
  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Sources</h1>
          <div className="sub">{connected.length} connected · {allSources.length - connected.length} available</div>
        </div>
        <div className="actions">
          <button className="btn primary"><Icon name="plus" size={14}/> Add source</button>
        </div>
      </div>
      <div className="conn-grid">
        {allSources.map(s => {
          const isConn = connected.includes(s.id)
          return (
            <div key={s.id} className={'conn-card'+(isConn?' connected':'')}>
              <div className="row tight" style={{ alignItems:'center' }}>
                <SrcIcon icon={s.icon} size="lg">{s.short}</SrcIcon>
                <div>
                  <div style={{ fontWeight:600, fontSize:14 }}>{s.name}</div>
                  <div className="muted" style={{ fontSize:11.5 }}>{isConn ? 'Synced 3 min ago' : 'Not connected'}</div>
                </div>
              </div>
              {isConn && (
                <div style={{ height:40 }}>
                  <Sparkline data={shapeSeries(50, 14, 'growth', s.id.charCodeAt(0))} height={40}/>
                </div>
              )}
              <button className={'btn sm'+(isConn?' ghost':' primary')} style={{ justifyContent:'center' }}
                onClick={() => setConnected(prev => isConn ? prev.filter(x => x!==s.id) : [...prev, s.id])}>
                {isConn ? 'Disconnect' : 'Connect'}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function ScreenDashboards({ shape }) {
  const boards = [
    { id:'exec', title:'Executive summary', desc:'Revenue, ROAS, CAC, orders at a glance', pins:6, updated:'2 hr ago' },
    { id:'tiktok', title:'TikTok deep-dive', desc:'Views, CTR, CAC, viral content tracker', pins:8, updated:'9 min ago' },
    { id:'paid', title:'Paid media overview', desc:'All channels · spend, ROAS, CAC comparison', pins:10, updated:'1 hr ago' },
    { id:'weekly', title:'Weekly digest', desc:'Auto-generated Monday morning brief', pins:5, updated:'Mon 9am' },
  ]
  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Dashboards</h1>
          <div className="sub">{boards.length} boards · shared with team</div>
        </div>
        <div className="actions">
          <button className="btn primary"><Icon name="plus" size={14}/> New dashboard</button>
        </div>
      </div>
      <div className="grid-2">
        {boards.map((b, i) => (
          <div key={b.id} className="card" style={{ cursor:'pointer', transition:'box-shadow .15s' }}
            onMouseEnter={e => e.currentTarget.style.boxShadow='var(--shadow-md)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow=''}>
            <div className="row between" style={{ marginBottom:12 }}>
              <div>
                <div className="tag" style={{ marginBottom:4 }}>DASHBOARD · {b.pins} PINS</div>
                <h3>{b.title}</h3>
              </div>
              <button className="btn sm ghost"><Icon name="dots" size={14}/></button>
            </div>
            <div className="muted" style={{ fontSize:13, marginBottom:14 }}>{b.desc}</div>
            <div style={{ height:60, overflow:'hidden', width:'100%', marginBottom:12 }}>
              <Sparkline data={shapeSeries(50+i*10, 14, shape, i*7)} height={60}
                color={['var(--accent)','var(--accent-2)','var(--accent-4)','var(--accent-3)'][i]}/>
            </div>
            <div className="row between" style={{ alignItems:'center' }}>
              <span className="muted" style={{ fontSize:11.5 }}>Updated {b.updated}</span>
              <button className="btn sm">Open <Icon name="arrow-right" size={12}/></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function ScreenGoals() {
  const goals = [
    { name:'Weekly revenue', current:84200, target:100000, deadline:'in 2d', pace:'on track', up:true, unit:'money' },
    { name:'Monthly orders', current:4128, target:5000, deadline:'in 9d', pace:'on track', up:true, unit:'int' },
    { name:'Blended ROAS', current:3.4, target:4.0, deadline:'in 14d', pace:'behind', up:false, unit:'x' },
    { name:'New customers', current:412, target:600, deadline:'in 14d', pace:'on track', up:true, unit:'int' },
  ]
  return (
    <div className="page">
      <div className="page-head">
        <div><h1>Goals & alerts</h1><div className="sub">4 active goals · 3 on track · 1 behind pace</div></div>
        <div className="actions">
          <button className="btn primary"><Icon name="plus" size={14}/> New goal</button>
        </div>
      </div>
      <div className="grid-2">
        {goals.map((g, i) => {
          const pct = g.current / g.target
          return (
            <div key={i} className="card">
              <div className="row between" style={{ marginBottom:14 }}>
                <div>
                  <div className="tag">GOAL · {g.deadline}</div>
                  <h3 style={{ marginTop:4 }}>{g.name}</h3>
                </div>
                <span className={'chip '+(g.up?'up':'dn')}>{g.pace}</span>
              </div>
              <div className="row tight" style={{ gap:18, alignItems:'center' }}>
                <Donut value={Math.min(1,pct)} label={Math.round(pct*100)+'%'} size={88}
                  color={g.up?'var(--accent)':'var(--dn)'}/>
                <div style={{ flex:1 }}>
                  <div className="num" style={{ fontSize:28 }}>{fmt(g.current, g.unit)}</div>
                  <div className="muted" style={{ fontSize:12 }}>of {fmt(g.target, g.unit)} target</div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
