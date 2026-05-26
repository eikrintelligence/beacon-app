import React, { useState, useEffect } from 'react'
import { AuthProvider, useAuth } from './AuthContext'
import Login from './Login'
import Onboarding from './Onboarding'
import { Icon } from './shared'
import { useTweaks } from './TweaksPanel'
import { ScreenHome, ScreenAsk } from './ScreensHome'
import { ScreenFunnel, ScreenConnections, ScreenDashboards, ScreenGoals } from './ScreensDeep'
import { ScreenAttribution } from './ScreenAttribution'
import { ScreenEmail } from './ScreenEmail'
import { ScreenSocial } from './ScreenSocial'
import { ScreenWebsite } from './ScreenWebsite'
import { ScreenAlerts } from './ScreenAlerts'
import ScreenHistory from './ScreenHistory'
import ScreenCohorts from './ScreenCohorts'
import { ScreenSKU } from './ScreenSKU'
import { ScreenSubscriptions } from './ScreenSubscriptions'
import AcceptInvite from './AcceptInvite'
import PublicView from './PublicView'
import { getWorkspace, getRevenue, createWorkspace } from './api'
import { PortalAnalyst } from './PortalAnalyst'
import { PortalClient } from './PortalClient'
import { PortalAgency } from './PortalAgency'

const ACCENTS = ['#ec6b4e','#4a8c6e','#6b8cff','#a86bc4']

const NAV = [
  { id:'home',         label:'Today',          icon:'home',     group:'overview' },
  { id:'ask',          label:'Ask Faro',        icon:'sparkles', group:'overview', badge:'new' },
  { id:'dashboards',   label:'Dashboards',     icon:'grid',     group:'overview' },
  { id:'funnel',       label:'Funnel',         icon:'funnel',   group:'analysis' },
  { id:'attribution',  label:'Attribution',    icon:'grid',     group:'analysis' },
  { id:'sku',          label:'Products',       icon:'grid',     group:'analysis' },
  { id:'subscriptions',label:'Subscriptions',  icon:'users',    group:'analysis' },
  { id:'cohorts',      label:'Cohorts',        icon:'users',    group:'analysis' },
  { id:'goals',        label:'Goals',          icon:'target',   group:'analysis' },
  { id:'alerts',       label:'Alerts',         icon:'bell',     group:'analysis' },
  { id:'email',        label:'Email & SMS',   icon:'bell',     group:'analysis' },
  { id:'social',       label:'Social',        icon:'users',    group:'analysis' },
  { id:'website',      label:'Website',       icon:'grid',     group:'analysis' },
  { id:'history',     label:'History',        icon:'clock',    group:'analysis' },
  { id:'connections',  label:'Sources',        icon:'plug',     group:'admin' },
  { id:'settings',     label:'Settings',       icon:'gear',     group:'admin' },
]

const TWEAK_DEFAULTS = {
  theme: 'light', accent: '#ec6b4e', density: 'cozy',
}

const ROLE_NAV = {
  admin:   ['home','ask','dashboards','funnel','attribution','sku','subscriptions','cohorts','goals','alerts','email','social','website','history','connections','settings'],
  analyst: ['home','ask','dashboards','funnel','attribution','sku','subscriptions','goals','alerts','email','social','website','history','connections'],
  client:  ['home','goals'],
  agency:  ['home','dashboards','social','connections'],
}

function AppShell() {
  const { user, profile, workspace, memberships, role, token, loading, logout, switchWorkspace } = useAuth()
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS)
  const [route, setRoute] = useState({ name: 'home', params: {} })
  const [needOnboarding, setNeedOnboarding] = useState(false)
  const [revenueData, setRevenueData] = useState(null)
  const [workspaceData, setWorkspaceData] = useState(null)
  const [sideOpen, setSideOpen] = useState(false)

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

  async function refreshWorkspace() {
    if (!token || !workspace?.id) return
    try { const data = await getWorkspace(token, workspace.id); setWorkspaceData(data) } catch (e) {}
  }

  async function refreshWorkspace() {
    if (token && workspace?.id) {
      try { const data = await getWorkspace(token, workspace.id); setWorkspaceData(data) } catch (e) {}
    }
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--bg)' }}>
      <style>{`@keyframes sja-pulse { 0%,100%{opacity:1} 50%{opacity:0.35} }`}</style>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 44, height: 44, background: 'var(--ink)', borderRadius: 12, display: 'grid', placeItems: 'center', margin: '0 auto 16px', animation: 'sja-pulse 1.6s ease-in-out infinite' }}>
          <span style={{ color: 'var(--bg)', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 24 }}>s</span>
        </div>
        <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, letterSpacing: '-0.02em', color: 'var(--ink)' }}>
          faro <span style={{ fontWeight: 400, color: 'var(--ink-3)' }}>by EIKR</span>
        </div>
      </div>
    </div>
  )

  const inviteToken = new URLSearchParams(window.location.search).get('invite')
  if (inviteToken) return <AcceptInvite inviteToken={inviteToken}/>

  const shareToken = new URLSearchParams(window.location.search).get('share')
  if (shareToken) return <PublicView token={shareToken}/>

  if (needOnboarding) return (
    <Onboarding
      token={token}
      userEmail={typeof needOnboarding === 'object' ? needOnboarding.email : user?.email}
      onComplete={() => { setNeedOnboarding(false); window.location.reload() }}
    />
  )

  if (!user) return <Login onNeedOnboarding={(data) => setNeedOnboarding(data)}/>

  const alreadyOnboarded = localStorage.getItem('sja_onboarded')
  if (!workspace && !alreadyOnboarded) return (
    <Onboarding
      token={token}
      userEmail={user?.email}
      onComplete={() => { setNeedOnboarding(false); window.location.reload() }}
    />
  )

  // Role-based portal routing — non-admin roles get dedicated portal UX
  if (role === 'analyst') return <PortalAnalyst token={token} workspaceId={workspace?.id} workspace={workspace} logout={logout} workspaceData={workspaceData}/>
  if (role === 'client')  return <PortalClient  token={token} workspaceId={workspace?.id} workspace={workspace} logout={logout} workspaceData={workspaceData} revenueData={revenueData}/>
  if (role === 'agency')  return <PortalAgency  token={token} workspaceId={workspace?.id} workspace={workspace} logout={logout}/>

  const allowedNav = ROLE_NAV[role] || ROLE_NAV.admin
  const filteredNav = NAV.filter(n => allowedNav.includes(n.id))

  function navigate(name, params = {}) { setRoute({ name, params }) }

  return (
    <div className="app">
      {sideOpen && <div onClick={() => setSideOpen(false)} style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.45)', zIndex:99, display:'none' }} className="mob-overlay"/>}
      <Sidebar route={route} navigate={(n,p) => { navigate(n,p); setSideOpen(false) }}
        workspaceName={workspace?.name} filteredNav={filteredNav}
        role={role} onLogout={logout} sideOpen={sideOpen} setSideOpen={setSideOpen}
        memberships={memberships} switchWorkspace={m => { switchWorkspace(m); window.location.reload() }}
        onNewClient={() => { setNeedOnboarding(true); setSideOpen(false) }}/>
      <div className="main">
        <Topbar route={route} navigate={navigate} tweaks={tweaks} setTweak={setTweak}
          profile={profile} onLogout={logout} setSideOpen={setSideOpen}/>
        <RouteView route={route} navigate={navigate} tweaks={tweaks}
          revenueData={revenueData} workspaceData={workspaceData} refreshWorkspace={refreshWorkspace}
          token={token} workspace={workspace} role={role}/>
      </div>
    </div>
  )
}

function Sidebar({ route, navigate, workspaceName, filteredNav, role, onLogout, sideOpen, setSideOpen, memberships, switchWorkspace, onNewClient }) {
  const [wsOpen, setWsOpen] = useState(false)
  const branding = (() => { try { return JSON.parse(localStorage.getItem('sja_branding') || '{}') } catch { return {} } })()
  const groups = ['overview','analysis','admin']
  return (
    <aside className="side" style={{ '--mob-open': sideOpen ? '1' : '0' }}>
      <div className="brand">
        <div className="brand-mark"/>
        <div className="brand-name">{branding.name || 'faro'}</div>
      </div>
      <div className="workspace" onClick={() => memberships.length > 1 && setWsOpen(o => !o)} style={{ cursor: memberships.length > 1 ? 'pointer' : 'default', position: 'relative' }}>
        <div className="avatar" style={{ background: branding.color || undefined }}>{(workspaceName || 'W')[0].toUpperCase()}</div>
        <div className="ws-meta">
          <div className="ws-name">{workspaceName || 'Workspace'}</div>
          <div className="ws-plan">{role} · Pro · 5 users</div>
        </div>
        {memberships.length > 1 && <Icon name="chev-down" size={12}/>}
      </div>
      {wsOpen && (
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, margin: '4px 12px', padding: 6, boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}>
          {memberships.map(m => (
            <button key={m.workspaces?.id} onClick={() => { switchWorkspace(m); setWsOpen(false) }}
              style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '8px 10px', borderRadius: 8, border: 'none', background: m.workspaces?.id === localStorage.getItem('sja_workspace_id') ? 'var(--surface-2)' : 'transparent', cursor: 'pointer', textAlign: 'left' }}>
              <div style={{ width: 26, height: 26, borderRadius: 7, background: 'var(--accent)', color: 'white', display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 700, flexShrink: 0 }}>{(m.workspaces?.name || 'W')[0].toUpperCase()}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{m.workspaces?.name}</div>
                <div style={{ fontSize: 11, color: 'var(--ink-3)', textTransform: 'capitalize' }}>{m.role}</div>
              </div>
            </button>
          ))}
          <div style={{ borderTop: '1px solid var(--border)', margin: '4px 0' }}/>
          <button onClick={onNewClient} style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 10px', borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--accent)', fontSize: 13, fontWeight: 600 }}>
            <Icon name="plus" size={14}/> New client
          </button>
        </div>
      )}
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
            <span className="tag" style={{ fontSize:9 }}>FARO · TIP</span>
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

function Topbar({ route, navigate, tweaks, setTweak, profile, onLogout, setSideOpen }) {
  const meta = NAV.find(n => n.id===route.name)
  const initials = profile?.full_name?.split(' ').map(n=>n[0]).join('').slice(0,2) || 'D'
  return (
    <div className="topbar">
      <button className="btn ghost sm mob-menu" onClick={() => setSideOpen(s => !s)} style={{ marginRight: 4 }}>
        <Icon name="menu" size={18}/>
      </button>
      <div className="crumbs">
        <span>Workspace</span>
        <span className="sep">/</span>
        <span className="here">{meta?.label||''}</span>
      </div>
      <div className="grow"/>
      <button className="search" onClick={() => navigate('ask')}>
        <Icon name="search" size={14}/>
        <span>Search or ask Faro…</span>
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

function RouteView({ route, navigate, tweaks, revenueData, workspaceData, token, workspace, role, refreshWorkspace }) {
  switch (route.name) {
    case 'home': return <ScreenHome onNavigate={navigate} onAsk={() => navigate('ask')} revenueData={revenueData} workspaceData={workspaceData} role={role} token={token} workspaceId={workspace?.id}/>
    case 'ask': return <ScreenAsk token={token} workspaceId={workspace?.id}/>
    case 'funnel': return <ScreenFunnel workspaceData={workspaceData} onNavigate={navigate}/>
    case 'attribution': return <ScreenAttribution workspaceData={workspaceData} onNavigate={navigate} token={token} workspaceId={workspace?.id}/>
    case 'sku': return <ScreenSKU token={token} workspaceId={workspace?.id} onNavigate={navigate}/>
    case 'connections': return <ScreenConnections token={token} workspaceId={workspace?.id} refreshWorkspace={refreshWorkspace}/>
    case 'dashboards': return <ScreenDashboards token={token} workspaceId={workspace?.id} workspaceData={workspaceData} revenueData={revenueData}/>
    case 'goals': return <ScreenGoals workspaceData={workspaceData}/>
    case 'alerts': return <ScreenAlerts workspaceData={workspaceData} token={token} workspaceId={workspace?.id}/>
    case 'subscriptions': return <ScreenSubscriptions token={token} workspaceId={workspace?.id} workspaceData={workspaceData}/>
    case 'history': return <ScreenHistory workspaceData={workspaceData} token={token} workspaceId={workspace?.id}/>
    case 'cohorts': return <ScreenCohorts token={token} workspaceId={workspace?.id} workspaceData={workspaceData}/>
    case 'email': return <ScreenEmail token={token} workspaceId={workspace?.id} onNavigate={navigate} workspaceData={workspaceData}/>
    case 'social': return <ScreenSocial token={token} workspaceId={workspace?.id}/>
    case 'website': return <ScreenWebsite token={token} workspaceId={workspace?.id} onNavigate={navigate} workspaceData={workspaceData}/>
    case 'settings':
      if (role !== 'admin') return <ScreenHome onNavigate={navigate} onAsk={() => navigate('ask')} revenueData={revenueData} workspaceData={workspaceData} role={role} token={token} workspaceId={workspace?.id}/>
      return <ScreenSettings token={token} workspaceId={workspace?.id} workspaceData={workspaceData} role={role}/>
    default: return <div className="page"><h1>Coming soon</h1></div>
  }
}

function ClientPortalLink({ shareToken }) {
  const [copied, setCopied] = React.useState(false)
  const url = `${window.location.origin}/?share=${shareToken}`
  function copy() {
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
      <input readOnly value={url}
        onClick={e => e.target.select()}
        style={{ flex: 1, padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--surface-2)', fontSize: 13, color: 'var(--ink-2)', fontFamily: 'var(--font-mono)', outline: 'none' }}
      />
      <button className="btn primary" onClick={copy} style={{ flexShrink: 0 }}>
        {copied ? '✓ Copied' : 'Copy link'}
      </button>
    </div>
  )
}

function ScreenSettings({ token, workspaceId, workspaceData, role }) {
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('analyst')
  const [inviting, setInviting] = useState(false)
  const [inviteMsg, setInviteMsg] = useState('')
  const [branding, setBranding] = useState(() => {
    try { return JSON.parse(localStorage.getItem('sja_branding') || '{}') } catch { return {} }
  })
  const [brandSaved, setBrandSaved] = useState(false)

  function saveBranding() {
    localStorage.setItem('sja_branding', JSON.stringify(branding))
    setBrandSaved(true)
    setTimeout(() => setBrandSaved(false), 2000)
  }

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
  const isAdmin = role === 'admin'

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

        {isAdmin && (
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
        )}
      </div>

      {/* Branding */}
      {isAdmin && (
      <div className="card">
        <h3 style={{ marginBottom: 4 }}>White-label branding</h3>
        <div style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 16 }}>Replaces "faro by EIKR" in the sidebar with your own brand</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-3)', letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Consultant / agency name</label>
            <input value={branding.name || ''} onChange={e => setBranding(b => ({ ...b, name: e.target.value }))} placeholder="e.g. Denisse Consulting"
              style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--surface)', fontSize: 14, color: 'var(--ink)', fontFamily: 'var(--font-body)', outline: 'none', boxSizing: 'border-box' }}/>
          </div>
          <div className="row tight" style={{ alignItems: 'center', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-3)', letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Primary colour</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input type="color" value={branding.color || '#ec6b4e'} onChange={e => setBranding(b => ({ ...b, color: e.target.value }))}
                  style={{ width: 40, height: 40, borderRadius: 8, border: '1px solid var(--border)', padding: 2, cursor: 'pointer', background: 'var(--surface)' }}/>
                <span style={{ fontSize: 13, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)' }}>{branding.color || '#ec6b4e'}</span>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-3)', letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Logo</label>
              <div style={{ padding: '10px 14px', borderRadius: 10, border: '1px dashed var(--border)', background: 'var(--surface-2)', fontSize: 13, color: 'var(--ink-3)', textAlign: 'center' }}>Upload coming soon</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button className="btn primary" onClick={saveBranding}>Save branding</button>
            {brandSaved && <span style={{ fontSize: 13, color: 'var(--up)', fontWeight: 600 }}>✓ Saved — reload to see changes</span>}
          </div>
        </div>
      </div>
      )}

      {/* Client portal link */}
      {isAdmin && workspaceData?.workspace?.share_token && (
        <div className="card">
          <h3 style={{ marginBottom: 4 }}>Client portal</h3>
          <div style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 16 }}>Share this link with your client — no login required</div>
          <ClientPortalLink shareToken={workspaceData.workspace.share_token} />
        </div>
      )}

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
