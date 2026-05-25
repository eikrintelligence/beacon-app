import React, { useState, useMemo, useEffect } from 'react'
import { fmt, Icon, SrcIcon, Sparkline, Donut, StackBar } from './shared'

export function ScreenFunnel({ shape, workspaceData, onNavigate }) {
  const [selectedIdx, setSelectedIdx] = useState(3)
  const [whatIf, setWhatIf] = useState(null)
  const [days, setDays] = useState(7)
  const [funnelData, setFunnelData] = useState(null)
  const [syncing, setSyncing] = useState(false)

  async function syncFunnel() {
    setSyncing(true)
    try {
      const wid = workspaceData?.id
      const res = await fetch(`https://sja.eikr.ee/api/shopify/funnel?workspace_id=${wid}&days=${days}`)
      const json = await res.json()
      if (!json.error) setFunnelData(json)
    } catch (e) {}
    setSyncing(false)
  }

  const stages = useMemo(() => {
    const raw = funnelData?.stages || []
    return raw.map((s, i) => {
      const prev = raw[i-1]
      const passCurr = prev ? (s.v / prev.v) * 100 : 100
      const passPrev = prev && s.prev != null && prev.prev != null ? (s.prev / prev.prev) * 100 : passCurr
      return { ...s, passCurr, passPrev, delta: passCurr - passPrev }
    })
  }, [funnelData])

  const projection = useMemo(() => {
    if (!whatIf || !stages.length) return null
    const newV = stages.map(s => s.v)
    for (let i = whatIf.idx; i < stages.length; i++) {
      if (i === 0) continue
      const pass = stages[i].v / stages[i-1].v
      const newPass = i === whatIf.idx ? pass * whatIf.multiplier : pass
      newV[i] = Math.round(newV[i-1] * newPass)
    }
    return newV
  }, [whatIf, stages])


  const hasShopify = workspaceData?.connections?.some(c => c.platform === 'shopify' && c.status === 'active')
  const hasGA4 = workspaceData?.connections?.some(c => c.platform === 'ga4' && c.status === 'active')
  const hasFunnelData = hasShopify && hasGA4
  if (!hasFunnelData) return (
    <div className='page'>
      <div className='page-head'><div><h1>Funnel</h1><div className='sub'>Customer journey from impression to order</div></div></div>
      <div className='card' style={{ padding: '48px 36px', textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>🔌</div>
        <h3 style={{ marginBottom: 8 }}>Connect your data sources to see the funnel</h3>
        <p style={{ color: 'var(--ink-3)', marginBottom: 24, maxWidth: 400, margin: '0 auto 24px' }}>
          The funnel requires data from multiple platforms to show the complete customer journey.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 28 }}>
          {[
            { name: 'Shopify', connected: hasShopify, desc: 'Orders, checkout, cart data' },
            { name: 'Google Analytics', connected: hasGA4, desc: 'Sessions, page views, behavior' },
          ].map(s => (
            <div key={s.name} style={{ padding: '12px 16px', borderRadius: 10, border: '1px solid var(--border)', background: s.connected ? 'color-mix(in oklab, var(--up) 10%, var(--surface))' : 'var(--surface)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>{s.connected ? '✅' : '⬜'}</span>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{s.name}</div>
                <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
        <button className='btn primary' onClick={() => onNavigate('connections')}>Connect sources →</button>
      </div>
    </div>
  )

  if (!funnelData || !stages.length) return (
    <div className="page">
      <div className="page-head">
        <div><h1>The funnel</h1><div className="sub">Follow a customer from impression to order</div></div>
        <div className="actions">
          <div style={{ display: 'flex', gap: 4 }}>
            {[7, 30, 90].map(d => (
              <button key={d} className={'btn sm' + (days === d ? ' primary' : '')} onClick={() => setDays(d)}>Last {d}d</button>
            ))}
          </div>
          <button className="btn sm" onClick={syncFunnel} disabled={syncing}>
            {syncing ? 'Syncing…' : 'Sync funnel data'}
          </button>
        </div>
      </div>
      <div className="card" style={{ textAlign: 'center', padding: '64px 24px', maxWidth: 480, margin: '0 auto' }}>
        <div style={{ fontSize: 52, marginBottom: 20 }}>&#128202;</div>
        <h2 style={{ marginBottom: 10 }}>Sync your funnel data</h2>
        <div style={{ color: 'var(--ink-3)', fontSize: 15, lineHeight: 1.6, marginBottom: 28 }}>
          Pull live conversion data from your Shopify store to see your customer journey, drop-off rates, and what-if simulations.
        </div>
        <button className="btn primary" onClick={syncFunnel} disabled={syncing}>
          {syncing ? 'Syncing…' : 'Sync funnel data'}
        </button>
      </div>
    </div>
  )

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>The funnel</h1>
          <div className="sub">Follow a customer from impression to order · last {days} days</div>
        </div>
        <div className="actions">
          <div style={{ display: 'flex', gap: 4 }}>
            {[7, 30, 90].map(d => (
              <button key={d} className={'btn sm' + (days === d ? ' primary' : '')} onClick={() => setDays(d)}>Last {d}d</button>
            ))}
          </div>
          {hasFunnelData && (
            <button className="btn sm" onClick={syncFunnel} disabled={syncing}>
              {syncing ? 'Syncing…' : 'Sync funnel data'}
            </button>
          )}
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'minmax(0,1fr) 300px', gap:16 }}>
        <div className="stack">
          {stages.length > 1 && (
            <div className="card" style={{ padding: '20px 24px' }}>
              <div className="tag">END-TO-END CONVERSION</div>
              <div className="row tight" style={{ alignItems:'baseline', marginTop:4 }}>
                <div className="num" style={{ fontSize:44 }}>
                  {((stages[stages.length-1].v / stages[0].v) * 100).toFixed(1)}%
                </div>
              </div>
              <div className="muted" style={{ fontSize:13, marginTop:2 }}>
                {fmt(stages[stages.length-1].v,'compact')} {stages[stages.length-1].name.toLowerCase()} from {fmt(stages[0].v,'compact')} {stages[0].name.toLowerCase()}
              </div>
            </div>
          )}

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
                <div className="num" style={{ fontSize:28 }}>+{fmt(projection[projection.length-1]-stages[stages.length-1].v,'compact')}</div>
                <div className="muted" style={{ fontSize:12 }}>additional orders/week</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export function ScreenConnections({ token, workspaceId, refreshWorkspace }) {
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
  const getConnection = (platform) => connections.find(c => c.platform === platform && c.status === 'active')

  async function afterConnect(name) {
    setMsg(`✓ ${name} connected!`)
    setConnecting(null)
    try {
      const d = await fetch(`https://sja.eikr.ee/api/workspace/${workspaceId}`, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(r => r.json())
      setConnections(d.connections || [])
    } catch (e) {}
    if (refreshWorkspace) refreshWorkspace()
    setTimeout(() => window.location.reload(), 1000)
  }

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
        const test = await fetch(`https://sja.eikr.ee/api/shopify/test?workspace_id=${workspaceId}`, {
          headers: { Authorization: `Bearer ${token}` }
        }).then(r => r.json())
        await afterConnect(test.success ? `Shopify (${test.shop})` : 'Shopify')
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
      if (data.success) { await afterConnect('Meta Ads') }
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
      if (data.success) { await afterConnect('Google Analytics') }
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
      if (data.success) { await afterConnect('Google Ads') }
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
      if (data.success) { await afterConnect('Klaviyo') }
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
    { id: 'ga4', name: 'Google Analytics', short: 'G4', color: '#f9ab00', desc: 'Sessions, traffic sources, conversions' },
    { id: 'klaviyo', name: 'Klaviyo', short: 'KL', color: '#f26722', desc: 'Email flows, open rates, revenue' },
    { id: 'tt', name: 'TikTok Ads', short: 'TT', color: '#fe2c55', desc: 'Video campaigns, views, CTR' },
  ]

  return (
    <div className="page">
      <style>{`@keyframes faro-spin{to{transform:rotate(360deg)}}.faro-spinner{display:inline-block;width:12px;height:12px;border:2px solid currentColor;border-top-color:transparent;border-radius:50%;animation:faro-spin .6s linear infinite;margin-right:6px;vertical-align:middle}`}</style>
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
                  {connected ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                    <span style={{ padding: '2px 8px', borderRadius: 999, fontSize: 10.5, fontWeight: 700,
                      background: 'color-mix(in oklab, var(--up) 15%, var(--surface))', color: 'var(--up)' }}>
                      Connected ✓
                    </span>
                    {getConnection(s.id)?.last_synced && (
                      <span className="muted" style={{ fontSize: 10.5 }}>
                        synced {new Date(getConnection(s.id).last_synced).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="muted" style={{ fontSize: 11.5 }}>{s.desc}</div>
                )}
                </div>
              </div>

              {isOpen && s.id === 'shopify' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <input style={inputStyle} placeholder="yourstore.myshopify.com" value={shopifyUrl} onChange={e => setShopifyUrl(e.target.value)}/>
                  <input style={inputStyle} type="password" placeholder="shpat_••••••••••••••••" value={shopifyToken} onChange={e => setShopifyToken(e.target.value)}/>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn sm" onClick={() => setConnecting(null)}>Cancel</button>
                    <button className="btn sm primary" style={{ flex: 1 }} onClick={connectShopify} disabled={loading || !shopifyUrl || !shopifyToken}>
                      {loading ? <><span className='faro-spinner'/>Connecting…</> : 'Connect'}
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
                      {loading ? <><span className='faro-spinner'/>Connecting…</> : 'Connect'}
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
                    <button className="btn sm primary" style={{ flex: 1 }} onClick={connectGoogleAds} disabled={loading || !gadsCustomerId}>{loading ? <><span className='faro-spinner'/>Connecting…</> : 'Connect'}</button>
                  </div>
                </div>
              )}

              {isOpen && s.id === 'ga4' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <input style={inputStyle} placeholder="GA4 Property ID (e.g. 123456789)" value={ga4PropertyId} onChange={e => setGa4PropertyId(e.target.value)}/>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn sm" onClick={() => setConnecting(null)}>Cancel</button>
                    <button className="btn sm primary" style={{ flex: 1 }} onClick={connectGA4} disabled={loading || !ga4PropertyId}>
                      {loading ? <><span className='faro-spinner'/>Connecting…</> : 'Connect'}
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
                      {loading ? <><span className='faro-spinner'/>Connecting…</> : 'Connect'}
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
                    if (['shopify', 'meta', 'ga4', 'gads', 'klaviyo', 'tt'].includes(s.id)) setConnecting(s.id)
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
      )}
    </div>
  )
}

export function ScreenDashboards({ token, workspaceId }) {
  const [dashboards, setDashboards] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!token || !workspaceId) { setLoading(false); return }
    fetch(`https://sja.eikr.ee/api/workspace/${workspaceId}/dashboards`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setDashboards(d) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [token, workspaceId])

  async function createDashboard() {
    if (!name.trim()) return
    setSaving(true)
    setError('')
    try {
      const r = await fetch(`https://sja.eikr.ee/api/workspace/${workspaceId}/dashboards`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), description: desc.trim() })
      })
      const d = await r.json()
      if (d.error) { setError(d.error); setSaving(false); return }
      setDashboards(prev => [d, ...prev])
      setShowModal(false)
      setName('')
      setDesc('')
    } catch (e) {
      setError('Failed to create dashboard')
    }
    setSaving(false)
  }

  return (
    <div className="page">
      <div className="page-head">
        <div><h1>Dashboards</h1><div className="sub">Pin insights and build custom views</div></div>
        <div className="actions">
          <button className="btn primary" onClick={() => setShowModal(true)}><Icon name="plus" size={14}/> New dashboard</button>
        </div>
      </div>

      {loading && <div className="muted">Loading...</div>}

      {!loading && dashboards.length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: '64px 24px', maxWidth: 480, margin: '0 auto' }}>
          <div style={{ fontSize: 52, marginBottom: 20 }}>&#128202;</div>
          <h2 style={{ marginBottom: 10 }}>No dashboards yet</h2>
          <div style={{ color: 'var(--ink-3)', fontSize: 15, lineHeight: 1.6, marginBottom: 28 }}>
            Create custom dashboards by pinning insights, charts, and AI answers from across the app.
          </div>
          <button className="btn primary" onClick={() => setShowModal(true)}><Icon name="plus" size={14}/> Create first dashboard</button>
        </div>
      )}

      {dashboards.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {dashboards.map(d => (
            <div key={d.id} className="card" style={{ cursor: 'pointer' }}>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{d.name}</div>
              {d.description && <div style={{ fontSize: 13, color: 'var(--ink-3)', lineHeight: 1.5 }}>{d.description}</div>}
              <div style={{ fontSize: 11, color: 'var(--ink-4)', marginTop: 12, fontFamily: 'var(--font-mono)' }}>
                {new Date(d.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}
          onClick={() => setShowModal(false)}>
          <div style={{ background: 'var(--surface)', borderRadius: 16, maxWidth: 480, width: '100%', padding: 28, boxShadow: '0 8px 40px rgba(0,0,0,0.2)' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ margin: 0 }}>New dashboard</h3>
              <button className="btn ghost sm" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-3)', display: 'block', marginBottom: 6 }}>NAME</label>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Weekly performance"
                  autoFocus
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--surface-2)', fontSize: 14, color: 'var(--ink)', fontFamily: 'var(--font-body)', outline: 'none', boxSizing: 'border-box' }}
                  onKeyDown={e => e.key === 'Enter' && createDashboard()}
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-3)', display: 'block', marginBottom: 6 }}>DESCRIPTION <span style={{ fontWeight: 400, opacity: 0.6 }}>(optional)</span></label>
                <input
                  value={desc}
                  onChange={e => setDesc(e.target.value)}
                  placeholder="What is this dashboard for?"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--surface-2)', fontSize: 14, color: 'var(--ink)', fontFamily: 'var(--font-body)', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              {error && <div style={{ fontSize: 13, color: 'var(--dn)' }}>{error}</div>}
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
                <button className="btn ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="btn primary" onClick={createDashboard} disabled={!name.trim() || saving}>
                  {saving ? 'Creating...' : 'Create dashboard'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export function ScreenGoals({ workspaceData }) {
  const goals = workspaceData?.goals || []
  const displayGoals = goals

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

      {displayGoals.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px 24px', maxWidth: 480, margin: '0 auto' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>&#127919;</div>
          <h3 style={{ marginBottom: 8 }}>No goals yet</h3>
          <p style={{ color: 'var(--ink-3)', fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
            Set revenue, orders, or ROAS goals to track your progress and get on-track alerts.
          </p>
          <button className="btn primary"><Icon name="plus" size={14}/> Add first goal</button>
        </div>
      ) : (
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
      )}
    </div>
  )
}
