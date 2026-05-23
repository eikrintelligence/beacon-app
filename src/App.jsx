import React, { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './AuthContext'
import Login from './Login'
import Onboarding from './Onboarding'
import { PERSONAS, Icon } from './shared'
import { useTweaks, TweaksPanel, TweakSection, TweakRadio, TweakColor, TweakSelect } from './TweaksPanel'
import { ScreenHome, ScreenAsk } from './ScreensHome'
import { ScreenFunnel, ScreenConnections, ScreenDashboards, ScreenGoals } from './ScreensDeep'
import { getWorkspace, getRevenue, createWorkspace } from './api'

const ACCENTS = ['#ec6b4e','#4a8c6e','#6b8cff','#a86bc4']

const NAV = [
  { id:'home',        label:'Today',          icon:'home',     group:'overview' },
  { id:'ask',         label:'Ask Sjá',        icon:'sparkles', group:'overview', badge:'new' },
  { id:'dashboards',  label:'Dashboards',     icon:'grid',     group:'overview' },
  { id:'funnel',      label:'Funnel',         icon:'funnel',   group:'analysis' },
  { id:'cohorts',     label:'Cohorts',        icon:'users',    group:'analysis', soon:true },
  { id:'goals',       label:'Goals & alerts', icon:'target',   group:'analysis' },
  { id:'connections', label:'Sources',        icon:'plug',     group:'admin', count:5 },
  { id:'settings',    label:'Settings',       icon:'gear',     group:'admin' },
]

const TWEAK_DEFAULTS = {
  theme: 'light', accent: '#ec6b4e', density: 'cozy',
  persona: 'marketing', shape: 'growth',
}

const ROLE_NAV = {
  admin:   ['home','ask','dashboards','funnel','cohorts','goals','connections','settings'],
  analyst: ['home','ask','dashboards','funnel','goals','connections'],
  client:  ['home','ask','dashboards','goals'],
  agency:  ['home','dashboards'],
}

function AppShell() {
  const { user, profile, workspace, role, token, loading, logout } = useAuth()
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS)
  const [route, setRoute] = useState({ name: 'home', params: {} })
  const [needOnboarding, setNeedOnboarding] = useState(false)
  const [revenueData, setRevenueData] = useState(null)
  const [workspaceData, setWorkspaceData] = useState(null)

  useEffect(() => {
    document.documentElement.dataset.theme = tweaks.theme
    document.documentElement.dataset.density = tweaks.density
    document.documentElement.style.setProperty('--accent', tweaks.accent)
  }, [tweaks.theme, tweaks.density, tweaks.accent])

  useEffect(() => {
    if (token && workspace) {
      getWorkspace(token, workspace?.id)
        .then(data => setWorkspaceData(data))
        .catch(() => {})
      getRevenue(token, workspace?.id)
        .then(data => setRevenueData(data))
        .catch(() => {})
    }
  }, [token, workspace])

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--bg)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 28, height: 28, background: 'var(--ink)', borderRadius: 8, display: 'grid', placeItems: 'center' }}>
          <span style={{ color: 'var(--bg)', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 15 }}>s</span>
        </div>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18 }}>Loading...</span>
      </div>
    </div>
  )

  if (!user) return <Login onNeedOnboarding={(data) => setNeedOnboarding(data)}/>

  const alreadyOnboarded = localStorage.getItem('sja_onboarded')
  if (needOnboarding || (!workspace && !alreadyOnboarded)) return (
    <Onboarding
      token={token}
      userEmail={typeof needOnboarding === 'object' ? needOnboarding.email : user?.email}
      onComplete={() => { setNeedOnboarding(false); window.location.reload() }}
    />
  )

  const allowedNav = ROLE_NAV[role] || ROLE_NAV.admin
  const filteredNav = NAV.filter(n => allowedNav.includes(n.id))

  function navigate(name, params = {}) { setRoute({ name, params }) }

  const persona = PERSONAS[tweaks.persona] || PERSONAS.marketing

  return (
    <div className="app">
      <Sidebar route={route} navigate={navigate} persona={persona}
        workspaceName={workspace?.name} filteredNav={filteredNav}
        role={role} onLogout={logout}/>
      <div className="main">
        <Topbar route={route} navigate={navigate} tweaks={tweaks} setTweak={setTweak}
          profile={profile} onLogout={logout}/>
        <RouteView route={route} navigate={navigate} tweaks={tweaks}
          revenueData={revenueData} workspaceData={workspaceData}
          token={token} workspace={workspace} role={role}/>
      </div>
      {role === 'admin' && (
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
      )}
    </div>
  )
}

function Sidebar({ route, navigate, persona, workspaceName, filteredNav, role, onLogout }) {
  const groups = ['overview','analysis','admin']
  return (
    <aside className="side">
      <div className="brand">
        <div className="brand-mark"/>
        <div className="brand-name">sjá</div>
      </div>
      <div className="workspace">
        <div className="avatar">{(workspaceName || 'W')[0].toUpperCase()}</div>
        <div className="ws-meta">
          <div className="ws-name">{workspaceName || 'Workspace'}</div>
          <div className="ws-plan">{role} · active</div>
        </div>
        <Icon name="chev-down" size={12}/>
      </div>
      {groups.map(g => {
        const items = filteredNav.filter(n => n.group === g)
        if (!items.length) return null
        return (
          <div key={g}>
            <div className="nav-group">{g}</div>
            {items.map(n => (
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
        )
      })}
      <div style={{ marginTop:'auto', paddingTop:14 }}>
        <div className="card tinted" style={{ padding:12, borderRadius:12 }}>
          <div className="row tight" style={{ marginBottom:6, alignItems:'center' }}>
            <span className="src beac sm"><Icon name="sparkles" size={10}/></span>
            <span className="tag" style={{ fontSize:9 }}>SJÁ · TIP</span>
          </div>
          <div style={{ fontSize:12, lineHeight:1.35 }}>
            Hit <kbd style={{ fontFamily:'var(--font-mono)', fontSize:10, background:'var(--surface)', border:'1px solid var(--border)', padding:'1px 5px', borderRadius:3 }}>/</kbd> anywhere to ask a question.
          </div>
        </div>
        <button onClick={onLogout} className="nav-item" style={{ marginTop:8, color:'var(--ink-3)', width:'100%' }}>
          <span className="ico">→</span> Sign out
        </button>
      </div>
    </aside>
  )
}

function Topbar({ route, navigate, tweaks, setTweak, profile, onLogout }) {
  const meta = NAV.find(n => n.id===route.name)
  const initials = profile?.full_name?.split(' ').map(n=>n[0]).join('').slice(0,2) || 'D'
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
        <span>Search or ask Sjá…</span>
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
      <button className="btn ghost sm" title="Morning digest" onClick={() => navigate('ask')}>
        <Icon name="zap" size={16}/>
      </button>
      <div style={{ width:30, height:30, borderRadius:9, background:'linear-gradient(135deg,var(--accent),var(--accent-3))', color:'white', display:'grid', placeItems:'center', fontFamily:'var(--font-display)', fontWeight:700, fontSize:13, marginLeft:4, cursor:'pointer' }}
        title={profile?.full_name || 'Profile'}>
        {initials}
      </div>
    </div>
  )
}

function RouteView({ route, navigate, tweaks, revenueData, workspaceData, token, workspace, role }) {
  switch (route.name) {
    case 'home': return <ScreenHome persona={tweaks.persona} shape={tweaks.shape} onNavigate={navigate} onAsk={() => navigate('ask')} revenueData={revenueData} workspaceData={workspaceData} role={role}/>
    case 'ask': return <ScreenAsk persona={tweaks.persona} shape={tweaks.shape} token={token} workspaceId={workspace?.id}/>
    case 'funnel': return <ScreenFunnel shape={tweaks.shape}/>
    case 'connections': return <ScreenConnections token={token} workspaceId={workspace?.id}/>
    case 'dashboards': return <ScreenDashboards shape={tweaks.shape}/>
    case 'goals': return <ScreenGoals workspaceData={workspaceData}/>
    case 'settings': return <ScreenSettings token={token} workspaceId={workspace?.id} workspaceData={workspaceData}/>
    default: return <div className="page"><h1>Coming soon</h1></div>
  }
}

function ScreenSettings({ token, workspaceId, workspaceData }) {
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('analyst')
  const [inviting, setInviting] = useState(false)
  const [inviteMsg, setInviteMsg] = useState('')

  async function handleInvite() {
    setInviting(true)
    try {
      const { inviteMember } = await import('./api')
      await inviteMember(token, workspaceId, inviteEmail, inviteRole)
      setInviteMsg(`Invite sent to ${inviteEmail}`)
      setInviteEmail('')
    } catch (e) {
      setInviteMsg('Failed to send invite')
    }
    setInviting(false)
  }

  const members = workspaceData?.members || []

  return (
    <div className="page">
      <div className="page-head">
        <div><h1>Settings</h1><div className="sub">Manage your workspace</div></div>
      </div>

      {/* Team */}
      <div className="card">
        <h3 style={{ marginBottom:16 }}>Team members</h3>
        <div className="stack" style={{ gap:10, marginBottom:20 }}>
          {members.map(m => (
            <div key={m.id} className="row between" style={{ alignItems:'center', padding:'10px 14px', background:'var(--surface-2)', borderRadius:10 }}>
              <div>
                <div style={{ fontWeight:600, fontSize:14 }}>{m.profiles?.full_name || m.invited_email}</div>
                <div style={{ fontSize:12, color:'var(--ink-3)' }}>{m.profiles?.email || m.invited_email}</div>
              </div>
              <span className="chip" style={{ textTransform:'capitalize' }}>{m.role}</span>
            </div>
          ))}
          {members.length === 0 && <div className="muted" style={{ fontSize:13 }}>No team members yet</div>}
        </div>

        <div style={{ borderTop:'1px solid var(--border)', paddingTop:16 }}>
          <div className="tag" style={{ marginBottom:12 }}>INVITE MEMBER</div>
          <div style={{ display:'flex', gap:10 }}>
            <input
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
              placeholder="Email address"
              style={{ flex:1, padding:'10px 14px', borderRadius:10, border:'1px solid var(--border)', background:'var(--surface)', fontSize:14, fontFamily:'var(--font-body)', outline:'none', color:'var(--ink)' }}
            />
            <select
              value={inviteRole}
              onChange={e => setInviteRole(e.target.value)}
              style={{ padding:'10px 14px', borderRadius:10, border:'1px solid var(--border)', background:'var(--surface)', fontSize:14, fontFamily:'var(--font-body)', outline:'none', color:'var(--ink)' }}
            >
              <option value="analyst">Analyst</option>
              <option value="client">Client view</option>
              <option value="agency">Agency</option>
              <option value="admin">Admin</option>
            </select>
            <button className="btn primary" onClick={handleInvite} disabled={inviting || !inviteEmail}>
              {inviting ? 'Sending...' : 'Invite'}
            </button>
          </div>
          {inviteMsg && <div style={{ fontSize:13, marginTop:10, color:'var(--up)' }}>{inviteMsg}</div>}
        </div>
      </div>

      {/* Role legend */}
      <div className="card">
        <h3 style={{ marginBottom:16 }}>Access levels</h3>
        <div className="grid-2" style={{ gap:10 }}>
          {[
            { role:'Admin', desc:'Full access — you. Configure everything, see all data.', color:'var(--accent)' },
            { role:'Analyst', desc:'Paid media data, campaign notes, ROAS/CPA alerts. No revenue detail.', color:'var(--accent-2)' },
            { role:'Client', desc:'Executive summary only — revenue vs goal, green/red status. Read-only.', color:'var(--accent-4)' },
            { role:'Agency', desc:'Social metrics only — followers, engagement, content performance.', color:'var(--accent-3)' },
          ].map(a => (
            <div key={a.role} style={{ padding:'14px 16px', background:'var(--surface-2)', borderRadius:10 }}>
              <div style={{ fontWeight:600, fontSize:14, color:a.color, marginBottom:4 }}>{a.role}</div>
              <div style={{ fontSize:13, color:'var(--ink-2)', lineHeight:1.5 }}>{a.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell/>
    </AuthProvider>
  )
}
