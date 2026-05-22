import React, { useState, useEffect } from 'react'
import { PERSONAS, Icon } from './shared'
import { useTweaks, TweaksPanel, TweakSection, TweakRadio, TweakColor, TweakSelect } from './TweaksPanel'
import { ScreenHome, ScreenAsk } from './ScreensHome'
import { ScreenFunnel, ScreenConnections, ScreenDashboards, ScreenGoals } from './ScreensDeep'

const ACCENTS = ['#ec6b4e','#4a8c6e','#6b8cff','#a86bc4']

const NAV = [
  { id:'home',        label:'Today',          icon:'home',     group:'overview' },
  { id:'ask',         label:'Ask Beacon',     icon:'sparkles', group:'overview', badge:'new' },
  { id:'dashboards',  label:'Dashboards',     icon:'grid',     group:'overview' },
  { id:'funnel',      label:'Funnel',         icon:'funnel',   group:'analysis' },
  { id:'cohorts',     label:'Cohorts',        icon:'users',    group:'analysis', soon:true },
  { id:'goals',       label:'Goals & alerts', icon:'target',   group:'analysis' },
  { id:'connections', label:'Sources',        icon:'plug',     group:'admin', count:5 },
  { id:'settings',    label:'Settings',       icon:'gear',     group:'admin' },
]

const TWEAK_DEFAULTS = {
  theme:   'light',
  accent:  '#ec6b4e',
  density: 'cozy',
  persona: 'marketing',
  shape:   'growth',
}

export default function App() {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS)
  const [route, setRoute] = useState({ name:'home', params:{} })

  useEffect(() => {
    document.documentElement.dataset.theme = tweaks.theme
    document.documentElement.dataset.density = tweaks.density
    document.documentElement.style.setProperty('--accent', tweaks.accent)
  }, [tweaks.theme, tweaks.density, tweaks.accent])

  function navigate(name, params = {}) { setRoute({ name, params }) }

  const persona = PERSONAS[tweaks.persona] || PERSONAS.marketing

  return (
    <div className="app">
      <Sidebar route={route} navigate={navigate} persona={persona}/>
      <div className="main">
        <Topbar route={route} navigate={navigate} tweaks={tweaks} setTweak={setTweak}/>
        <RouteView route={route} navigate={navigate} tweaks={tweaks}/>
      </div>
      <TweaksPanel title="Tweaks">
        <TweakSection label="Theme">
          <TweakRadio label="Mode" value={tweaks.theme}
            options={[{value:'light',label:'Light'},{value:'dark',label:'Dark'}]}
            onChange={v => setTweak('theme', v)}/>
          <TweakColor label="Accent" value={tweaks.accent} options={ACCENTS}
            onChange={v => setTweak('accent', v)}/>
        </TweakSection>
        <TweakSection label="Layout">
          <TweakRadio label="Density" value={tweaks.density}
            options={[{value:'compact',label:'Compact'},{value:'cozy',label:'Cozy'},{value:'spacious',label:'Spacious'}]}
            onChange={v => setTweak('density', v)}/>
        </TweakSection>
        <TweakSection label="Demo data">
          <TweakSelect label="Persona" value={tweaks.persona}
            options={[
              {value:'marketing',label:'Marketing (ecom)'},
              {value:'sales',label:'Sales'},
              {value:'founder',label:'Founder / Exec'},
              {value:'agency',label:'Agency'},
            ]}
            onChange={v => setTweak('persona', v)}/>
          <TweakRadio label="Trend" value={tweaks.shape}
            options={[{value:'growth',label:'Growth'},{value:'flat',label:'Flat'},{value:'decline',label:'Decline'}]}
            onChange={v => setTweak('shape', v)}/>
        </TweakSection>
      </TweaksPanel>
    </div>
  )
}

function Sidebar({ route, navigate, persona }) {
  return (
    <aside className="side">
      <div className="brand">
        <div className="brand-mark"/>
        <div className="brand-name">beacon</div>
      </div>
      <div className="workspace">
        <div className="avatar">D</div>
        <div className="ws-meta">
          <div className="ws-name">{persona.workspace}</div>
          <div className="ws-plan">Pro · 6 sources</div>
        </div>
        <Icon name="chev-down" size={12}/>
      </div>
      {['overview','analysis','admin'].map(g => (
        <div key={g}>
          <div className="nav-group">{g}</div>
          {NAV.filter(n => n.group===g).map(n => (
            <button key={n.id}
              className={'nav-item'+(route.name===n.id?' active':'')}
              onClick={() => !n.soon && navigate(n.id)}
              style={n.soon ? { opacity:.5, cursor:'not-allowed' } : {}}>
              <span className="ico"><Icon name={n.icon} size={16}/></span>
              <span>{n.label}</span>
              {n.badge==='new' && <span className="dotnew"/>}
              {n.soon && <span className="chip" style={{ fontSize:9, marginLeft:'auto', padding:'0 6px' }}>soon</span>}
              {n.count!=null && <span className="badge">{n.count}</span>}
            </button>
          ))}
        </div>
      ))}
      <div style={{ marginTop:'auto', paddingTop:14 }}>
        <div className="card tinted" style={{ padding:12, borderRadius:12 }}>
          <div className="row tight" style={{ marginBottom:6, alignItems:'center' }}>
            <span className="src beac sm"><Icon name="sparkles" size={10}/></span>
            <span className="tag" style={{ fontSize:9 }}>BEACON · TIP</span>
          </div>
          <div style={{ fontSize:12, lineHeight:1.35 }}>
            Hit <kbd style={{ fontFamily:'var(--font-mono)', fontSize:10, background:'var(--surface)', border:'1px solid var(--border)', padding:'1px 5px', borderRadius:3 }}>/</kbd> anywhere to ask a question.
          </div>
        </div>
      </div>
    </aside>
  )
}

function Topbar({ route, navigate, tweaks, setTweak }) {
  const meta = NAV.find(n => n.id===route.name)
  return (
    <div className="topbar">
      <div className="crumbs">
        <span>Workspace</span>
        <span className="sep">/</span>
        <span className="here">{meta?.label||''}</span>
      </div>
      <div className="grow"/>
      <button className="search" onClick={() => navigate('ask')}>
        <Icon name="search" size={14}/>
        <span>Search or ask Beacon…</span>
        <kbd>/</kbd>
      </button>
      <button className="btn ghost sm" title="Toggle theme"
        onClick={() => setTweak('theme', tweaks.theme==='dark'?'light':'dark')}>
        <Icon name="moon" size={16}/>
      </button>
      <button className="btn ghost sm" title="Notifications" style={{ position:'relative' }}>
        <Icon name="bell" size={16}/>
        <span style={{ position:'absolute', top:4, right:4, width:7, height:7, borderRadius:'50%', background:'var(--accent)', boxShadow:'0 0 0 2px var(--surface)' }}/>
      </button>
      <div style={{ width:30, height:30, borderRadius:9, background:'linear-gradient(135deg,var(--accent),var(--accent-3))', color:'white', display:'grid', placeItems:'center', fontFamily:'var(--font-display)', fontWeight:700, fontSize:13, marginLeft:4 }}>D</div>
    </div>
  )
}

function RouteView({ route, navigate, tweaks }) {
  switch (route.name) {
    case 'home':        return <ScreenHome persona={tweaks.persona} shape={tweaks.shape} onNavigate={navigate} onAsk={() => navigate('ask')}/>
    case 'ask':         return <ScreenAsk persona={tweaks.persona} shape={tweaks.shape}/>
    case 'funnel':      return <ScreenFunnel shape={tweaks.shape}/>
    case 'connections': return <ScreenConnections/>
    case 'dashboards':  return <ScreenDashboards shape={tweaks.shape}/>
    case 'goals':       return <ScreenGoals/>
    default:            return <div className="page"><h1>Coming soon</h1></div>
  }
}
