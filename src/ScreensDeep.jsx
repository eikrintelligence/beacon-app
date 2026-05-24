import React, { useState, useMemo, useEffect } from 'react'
import { FUNNEL, CHANNELS, shapeSeries, fmt, pctChange, Icon, SrcIcon, Sparkline, LineChart, BarChart, Donut, StackBar } from './shared'

export function ScreenFunnel({ shape, workspaceData }) {
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

  const hasConnections = workspaceData?.connections?.some(c => c.status === 'active')
  if (!hasConnections) return (
    <div className="page">
      <div className="page-head">
        <div><h1>The funnel</h1><div className="sub">Connect data sources to unlock real funnel data</div></div>
      </div>
      <div style={{ padding: '64px 24px', textAlign: 'center', maxWidth: 480, margin: '0 auto' }}>
        <div style={{ fontSize: 56, marginBottom: 20 }}>🔗</div>
        <h2 style={{ marginBottom: 10 }}>No data sources connected</h2>
        <div style={{ color: 'var(--ink-3)', fontSize: 15, lineHeight: 1.6, marginBottom: 28 }}>
          Connect Shopify and your ad platforms to see a real customer journey from impression to order — with drop-off rates, conversion benchmarks, and what-if simulations.
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          {['Shopify', 'Meta Ads', 'Google Ads', 'TikTok'].map(p => (
            <span key={p} style={{ padding: '6px 14px', borderRadius: 999, background: 'var(--surface-2)', fontSize: 13, fontWeight: 600, color: 'var(--ink-2)' }}>{p}</span>
          ))}
        </div>
      </div>
    </div>
  )

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

export function ScreenConnections({ token, workspaceId }) {
  const [connections, setConnections] = useState([])
  const [connecting, setConnecting] = useState(null)
  const [metaToken, setMetaToken] = useState('')
  const [metaAccountId, setMetaAccountId] = useState('')
  const [shopifyUrl, setShopifyUrl] = useState('')
  const [shopifyToken, setShopifyToken] = useState('')
  const [ga4PropertyId, setGa4PropertyId] = useState('')
  const [klaviyoKey, setKlaviyoKey] = useState('')
  const [gadsCustomerId, setGadsCustomerId] = useState('')
  const [gadsDeveloperToken, setGadsDeveloperToken] = useState('')
  const [gadsClientId, setGadsClientId] = useState('')
  const [gadsClientSecret, setGadsClientSecret] = useState('')
  const [gadsRefreshToken, setGadsRefreshToken] = useState('')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (workspaceId && token) {
      fetch(`https://sja.eikr.ee/api/workspace/${workspaceId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(r => r.json())
        .then(d => setConnections(d.connections || []))
        .catch(() => {})
    }
  }, [workspaceId, token])

  const isConnected = (platform) => connections.some(c => c.platform === platform && c.status === 'active')

  async function connectShopify() {
    setLoading(true)
    setMsg('')
    try {
      const clean = shopifyUrl.replace('https://','').replace('http://','').replace(/\/$/,'')
      const res = await fetch('https://sja.eikr.ee/api/shopify/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ store_url: clean, access_token: shopifyToken, workspace_id: workspaceId })
      })
      const data = await res.json()
      if (data.success) {
        setMsg('✓ Shopify connected!')
        setConnecting(null)
        const test = await fetch(`https://sja.eikr.ee/api/shopify/test?workspace_id=${workspaceId}`, {
          headers: { Authorization: `Bearer ${token}` }
        }).then(r => r.json())
        if (test.success) setMsg(`✓ Connected to ${test.shop}`)
      } else {
        setMsg('Error: ' + data.error)
      }
    } catch (e) {
      setMsg('Connection failed: ' + e.message)
    }
    setLoading(false)
  }

  async function connectMeta() {
    setLoading(true)
    setMsg('')
    try {
      const res = await fetch('https://sja.eikr.ee/api/meta/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ access_token: metaToken, ad_account_id: metaAccountId, workspace_id: workspaceId })
      })
      const data = await res.json()
      if (data.success) { setMsg('✓ Meta Ads connected!'); setConnecting(null) }
      else setMsg('Error: ' + data.error)
    } catch (e) {
      setMsg('Connection failed: ' + e.message)
    }
    setLoading(false)
  }

  async function connectGA4() {
    setLoading(true)
    setMsg('')
    try {
      const res = await fetch('https://sja.eikr.ee/api/ga4/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ workspace_id: workspaceId, property_id: ga4PropertyId })
      })
      const data = await res.json()
      if (data.success) { setMsg('✓ Google Analytics connected!'); setConnecting(null) }
      else setMsg('Error: ' + data.error)
    } catch (e) {
      setMsg('Connection failed: ' + e.message)
    }
    setLoading(false)
  }

  async function connectGoogleAds() {
    setLoading(true); setMsg('')
    try {
      const res = await fetch('https://sja.eikr.ee/api/googleads/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ workspace_id: workspaceId, customer_id: gadsCustomerId, developer_token: gadsDeveloperToken, client_id: gadsClientId, client_secret: gadsClientSecret, refresh_token: gadsRefreshToken })
      })
      const data = await res.json()
      if (data.success) { setMsg('✓ Google Ads connected!'); setConnecting(null) }
      else setMsg('Error: ' + data.error)
    } catch (e) { setMsg('Connection failed: ' + e.message) }
    setLoading(false)
  }

  async function connectKlaviyo() {
    setLoading(true)
    setMsg('')
    try {
      const res = await fetch('https://sja.eikr.ee/api/klaviyo/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ workspace_id: workspaceId, api_key: klaviyoKey })
      })
      const data = await res.json()
      if (data.success) { setMsg('✓ Klaviyo connected!'); setConnecting(null) }
      else setMsg('Error: ' + data.error)
    } catch (e) {
      setMsg('Connection failed: ' + e.message)
    }
    setLoading(false)
  }

  const inputStyle = {
    width: '100%', padding: '10px 14px', borderRadius: 10,
    border: '1px solid var(--border)', background: 'var(--surface)',
    fontSize: 14, color: 'var(--ink)', fontFamily: 'var(--font-body)',
    outline: 'none', boxSizing: 'border-box'
  }

  const sources = [
    { id: 'shopify', name: 'Shopify', short: 'SH', color: '#95bf47', desc: 'Orders, revenue, products, customers' },
    { id: 'meta', name: 'Meta Ads', short: 'MA', color: '#1877f2', desc: 'Campaigns, spend, ROAS, CPA' },
    { id: 'gads', name: 'Google Ads', short: 'GA', color: '#4285f4', desc: 'Search campaigns, keywords, spend' },
    { id: 'ga', name: 'Google Analytics', short: 'G4', color: '#f9ab00', desc: 'Sessions, traffic sources, conversions' },
    { id: 'klaviyo', name: 'Klaviyo', short: 'KL', color: '#f26722', desc: 'Email flows, open rates, revenue' },
    { id: 'tt', name: 'TikTok Ads', short: 'TT', color: '#fe2c55', desc: 'Video campaigns, views, CTR' },
  ]

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Sources</h1>
          <div className="sub">{connections.length} connected · {sources.length - connections.length} available</div>
        </div>
        {msg && <div style={{ padding: '8px 16px', borderRadius: 10, background: msg.startsWith('✓') ? 'color-mix(in oklab, var(--up) 12%, var(--surface))' : 'color-mix(in oklab, var(--dn) 12%, var(--surface))', color: msg.startsWith('✓') ? 'var(--up)' : 'var(--dn)', fontSize: 13, fontWeight: 600 }}>{msg}</div>}
      </div>

      <div className="conn-grid">
        {sources.map(s => {
          const connected = isConnected(s.id)
          const isOpen = connecting === s.id
          return (
            <div key={s.id} className={'conn-card' + (connected ? ' connected' : '')} style={{ gap: 12 }}>
              <div className="row tight" style={{ alignItems: 'center' }}>
                <div className="src lg" style={{ background: s.color, color: 'white', borderRadius: 10 }}>{s.short}</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{s.name}</div>
                  <div className="muted" style={{ fontSize: 11.5 }}>{connected ? 'Connected ✓' : s.desc}</div>
                </div>
              </div>

              {isOpen && s.id === 'shopify' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <input style={inputStyle} placeholder="yourstore.myshopify.com" value={shopifyUrl} onChange={e => setShopifyUrl(e.target.value)}/>
                  <input style={inputStyle} type="password" placeholder="shpat_••••••••••••••••" value={shopifyToken} onChange={e => setShopifyToken(e.target.value)}/>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn sm" onClick={() => setConnecting(null)}>Cancel</button>
                    <button className="btn sm primary" style={{ flex: 1 }} onClick={connectShopify} disabled={loading || !shopifyUrl || !shopifyToken}>
                      {loading ? 'Connecting...' : 'Connect'}
                    </button>
                  </div>
                </div>
              )}

              {isOpen && s.id === 'meta' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <input style={inputStyle} placeholder="Meta Access Token" value={metaToken} onChange={e => setMetaToken(e.target.value)}/>
                  <input style={inputStyle} placeholder="Ad Account ID (without act_)" value={metaAccountId} onChange={e => setMetaAccountId(e.target.value)}/>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn sm" onClick={() => setConnecting(null)}>Cancel</button>
                    <button className="btn sm primary" style={{ flex: 1 }} onClick={connectMeta} disabled={loading || !metaToken || !metaAccountId}>
                      {loading ? 'Connecting...' : 'Connect'}
                    </button>
                  </div>
                </div>
              )}

              {isOpen && s.id === 'gads' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <input style={inputStyle} placeholder="Customer ID (e.g. 123-456-7890)" value={gadsCustomerId} onChange={e => setGadsCustomerId(e.target.value)}/>
                  <input style={inputStyle} placeholder="Developer Token" value={gadsDeveloperToken} onChange={e => setGadsDeveloperToken(e.target.value)}/>
                  <input style={inputStyle} placeholder="OAuth Client ID" value={gadsClientId} onChange={e => setGadsClientId(e.target.value)}/>
                  <input style={inputStyle} type="password" placeholder="OAuth Client Secret" value={gadsClientSecret} onChange={e => setGadsClientSecret(e.target.value)}/>
                  <input style={inputStyle} type="password" placeholder="Refresh Token" value={gadsRefreshToken} onChange={e => setGadsRefreshToken(e.target.value)}/>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn sm" onClick={() => setConnecting(null)}>Cancel</button>
                    <button className="btn sm primary" style={{ flex: 1 }} onClick={connectGoogleAds} disabled={loading || !gadsCustomerId}>{loading ? 'Connecting...' : 'Connect'}</button>
                  </div>
                </div>
              )}

              {isOpen && s.id === 'ga' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <input style={inputStyle} placeholder="GA4 Property ID (e.g. 123456789)" value={ga4PropertyId} onChange={e => setGa4PropertyId(e.target.value)}/>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn sm" onClick={() => setConnecting(null)}>Cancel</button>
                    <button className="btn sm primary" style={{ flex: 1 }} onClick={connectGA4} disabled={loading || !ga4PropertyId}>
                      {loading ? 'Connecting...' : 'Connect'}
                    </button>
                  </div>
                </div>
              )}

              {isOpen && s.id === 'klaviyo' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <input style={inputStyle} type="password" placeholder="Klaviyo Private API Key" value={klaviyoKey} onChange={e => setKlaviyoKey(e.target.value)}/>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn sm" onClick={() => setConnecting(null)}>Cancel</button>
                    <button className="btn sm primary" style={{ flex: 1 }} onClick={connectKlaviyo} disabled={loading || !klaviyoKey}>
                      {loading ? 'Connecting...' : 'Connect'}
                    </button>
                  </div>
                </div>
              )}

              {isOpen && s.id === 'tt' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ padding: '10px 14px', background: 'var(--surface-2)', borderRadius: 8, fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.5 }}>
                    TikTok API access requires approval. Use manual import while waiting — paste spend/impressions/clicks/conversions data via Ask Faro.
                  </div>
                  <button className="btn sm primary" style={{ justifyContent: 'center' }} onClick={() => { setMsg('Manual import ready: use Ask Faro to paste your TikTok Ads Manager CSV export'); setConnecting(null) }}>Set up manual import</button>
                  <button className="btn sm" onClick={() => setConnecting(null)}>Cancel</button>
                </div>
              )}

              {!isOpen && (
                <button
                  className={'btn sm' + (connected ? ' ghost' : ' primary')}
                  style={{ justifyContent: 'center' }}
                  onClick={() => {
                    if (['shopify', 'meta', 'ga', 'gads', 'klaviyo', 'tt'].includes(s.id)) setConnecting(s.id)
                    else setMsg(`${s.name} integration coming soon`)
                  }}
                >
                  {connected ? 'Manage' : 'Connect'}
                </button>
              )}
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

export function ScreenGoals({ workspaceData }) {
  const goals = workspaceData?.goals || []
  const defaultGoals = [
    { id: 'demo1', label: 'Weekly revenue', type: 'revenue', current: 84200, target: 100000, end_date: new Date(Date.now() + 2*24*60*60*1000).toISOString(), unit: 'money' },
    { id: 'demo2', label: 'Monthly orders', type: 'orders', current: 4128, target: 5000, end_date: new Date(Date.now() + 9*24*60*60*1000).toISOString(), unit: 'int' },
    { id: 'demo3', label: 'Blended ROAS', type: 'roas', current: 3.4, target: 4.0, end_date: new Date(Date.now() + 14*24*60*60*1000).toISOString(), unit: 'x' },
    { id: 'demo4', label: 'New customers', type: 'customers', current: 412, target: 600, end_date: new Date(Date.now() + 14*24*60*60*1000).toISOString(), unit: 'int' },
  ]
  const displayGoals = goals.length > 0 ? goals : defaultGoals

  function fmtVal(v, unit) {
    if (unit === 'money') return v >= 1000 ? '$' + (v/1000).toFixed(1) + 'k' : '$' + Math.round(v)
    if (unit === 'x') return parseFloat(v).toFixed(1) + 'x'
    return Math.round(v).toLocaleString()
  }

  function daysLeft(dateStr) {
    const days = Math.ceil((new Date(dateStr) - Date.now()) / (1000*60*60*24))
    return days > 0 ? `${days}d left` : 'overdue'
  }

  const revenue = displayGoals.find(g => g.type === 'revenue')
  const startDate = workspaceData?.goals?.[0]?.start_date
  const endDate = workspaceData?.goals?.[0]?.end_date
  const totalWeeks = startDate && endDate ? Math.round((new Date(endDate) - new Date(startDate)) / (7*24*60*60*1000)) : 39
  const weeksElapsed = startDate ? Math.max(1, Math.round((Date.now() - new Date(startDate)) / (7*24*60*60*1000))) : 8
  const weeksLeft = Math.max(1, totalWeeks - weeksElapsed)
  const pacePerWeek = revenue ? (revenue.current / weeksElapsed) : 0
  const projected = Math.round(pacePerWeek * totalWeeks)
  const onTrack = revenue ? projected >= revenue.target * 0.95 : false

  return (
    <div className="page">
      <div className="page-head">
        <div><h1>Goals & alerts</h1>
          <div className="sub">{displayGoals.length} active goals · {onTrack ? '✓ on track' : '⚠ needs attention'}</div>
        </div>
        <div className="actions">
          <button className="btn primary"><Icon name="plus" size={14}/> New goal</button>
        </div>
      </div>

      {revenue && (
        <div className="card" style={{ background: 'var(--ink)', color: 'var(--bg)', padding: '20px 24px' }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', opacity: 0.5, marginBottom: 8, fontFamily: 'var(--font-mono)' }}>
            PRIMARY GOAL · {endDate ? new Date(endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : 'DEC 2026'}
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 10 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 48, letterSpacing: '-0.03em' }}>
              ${Math.round(revenue.current / 1000)}k
            </div>
            <div style={{ opacity: 0.4, fontSize: 22, fontFamily: 'var(--font-display)' }}>/ ${Math.round(revenue.target / 1000)}k</div>
            <span style={{ padding: '4px 10px', borderRadius: 999, background: onTrack ? '#4ade80' : '#f87171', color: '#1a1612', fontSize: 12, fontWeight: 700 }}>
              {onTrack ? '✓ On track' : '✗ Off pace'}
            </span>
          </div>
          <div style={{ height: 6, background: 'rgba(255,255,255,0.12)', borderRadius: 3, marginBottom: 8 }}>
            <div style={{ height: '100%', width: Math.min(100, Math.round(revenue.current/revenue.target*100)) + '%', background: 'var(--accent)', borderRadius: 3 }}/>
          </div>
          <div style={{ display: 'flex', gap: 32, marginTop: 12 }}>
            <div>
              <div style={{ fontSize: 10, opacity: 0.45, fontFamily: 'var(--font-mono)', letterSpacing: '0.07em' }}>CURRENT PACE</div>
              <div style={{ fontWeight: 700, fontSize: 18, marginTop: 2 }}>${Math.round(pacePerWeek/1000)}k/wk</div>
            </div>
            <div>
              <div style={{ fontSize: 10, opacity: 0.45, fontFamily: 'var(--font-mono)', letterSpacing: '0.07em' }}>NEEDED PACE</div>
              <div style={{ fontWeight: 700, fontSize: 18, marginTop: 2 }}>${Math.round((revenue.target-revenue.current)/weeksLeft/1000)}k/wk</div>
            </div>
            <div>
              <div style={{ fontSize: 10, opacity: 0.45, fontFamily: 'var(--font-mono)', letterSpacing: '0.07em' }}>PROJECTED</div>
              <div style={{ fontWeight: 700, fontSize: 18, marginTop: 2, color: onTrack ? '#4ade80' : '#f87171' }}>${Math.round(projected/1000)}k</div>
            </div>
            <div>
              <div style={{ fontSize: 10, opacity: 0.45, fontFamily: 'var(--font-mono)', letterSpacing: '0.07em' }}>WEEKS LEFT</div>
              <div style={{ fontWeight: 700, fontSize: 18, marginTop: 2 }}>{weeksLeft}</div>
            </div>
          </div>
        </div>
      )}

      <div className="grid-2">
        {displayGoals.map(g => {
          const pct = Math.min(100, Math.round((g.current / g.target) * 100))
          const up = pct >= 70
          return (
            <div key={g.id} className="card">
              <div className="row between" style={{ marginBottom: 14 }}>
                <div>
                  <div className="tag">{g.type?.toUpperCase()} · {daysLeft(g.end_date)}</div>
                  <h3 style={{ marginTop: 4 }}>{g.label}</h3>
                </div>
                <span className={'chip ' + (up ? 'up' : 'dn')}>{pct}% complete</span>
              </div>
              <div className="row tight" style={{ gap: 18, alignItems: 'center' }}>
                <Donut value={pct/100} label={pct+'%'} size={88} color={up ? 'var(--accent)' : 'var(--dn)'}/>
                <div style={{ flex: 1 }}>
                  <div className="num" style={{ fontSize: 28 }}>{fmtVal(g.current, g.unit || 'int')}</div>
                  <div className="muted" style={{ fontSize: 12 }}>of {fmtVal(g.target, g.unit || 'int')} target</div>
                  <div style={{ height: 4, background: 'var(--surface-2)', borderRadius: 2, marginTop: 10 }}>
                    <div style={{ height: '100%', width: pct+'%', background: up ? 'var(--accent)' : 'var(--dn)', borderRadius: 2, transition: 'width 0.6s' }}/>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
