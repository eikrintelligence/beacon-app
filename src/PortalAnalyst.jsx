import React, { useState, useEffect } from 'react'
import { ScreenAsk } from './ScreensHome'

const BASE = 'https://sja.eikr.ee/api'

function fmt$(n) {
  if (n == null) return '—'
  if (n >= 1000) return '$' + (n / 1000).toFixed(1) + 'k'
  return '$' + Math.round(n).toLocaleString()
}

export function PortalAnalyst({ token, workspaceId, workspace, logout, workspaceData }) {
  const [screen, setScreen] = useState('today')
  const [attrData, setAttrData] = useState(null)
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)
  const workspaceName = workspace?.name || 'Workspace'

  useEffect(() => {
    if (!token || !workspaceId) return
    setLoading(true)
    Promise.all([
      fetch(BASE + '/attribution/summary?workspace_id=' + workspaceId, {
        headers: { Authorization: 'Bearer ' + token }
      }).then(r => r.json()).catch(() => ({})),
      fetch(BASE + '/alerts?workspace_id=' + workspaceId, {
        headers: { Authorization: 'Bearer ' + token }
      }).then(r => r.json()).catch(() => ({ alerts: [] })),
    ]).then(([attr, alertsRes]) => {
      if (!attr.error) setAttrData(attr)
      const all = alertsRes.alerts || []
      setAlerts(all.filter(a => a.type.startsWith('low_roas_') || a.type.startsWith('overspend_')))
    }).finally(() => setLoading(false))
  }, [token, workspaceId])

  const channels = attrData?.channels || []
  const totalSpend = attrData?.total_spend || 0
  const avgRoas = channels.length && totalSpend > 0
    ? channels.reduce((s, c) => s + (c.claimed_roas || 0) * (c.spend || 0), 0) / totalSpend
    : 0
  const totalClicks = channels.reduce((s, c) => s + (c.clicks || 0), 0)
  const unseen = alerts.filter(a => !a.seen).length

  const NAV = [
    { id: 'today',   label: 'Today' },
    { id: 'paid',    label: 'Paid Media' },
    { id: 'ask',     label: 'Ask Faro' },
    { id: 'alerts',  label: 'Alerts', badge: unseen || null },
    { id: 'sources', label: 'Sources' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <header style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '0 24px', display: 'flex', alignItems: 'center', height: 56, gap: 16, position: 'sticky', top: 0, zIndex: 10, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, background: 'var(--ink)', borderRadius: 7, display: 'grid', placeItems: 'center' }}>
            <span style={{ color: 'var(--bg)', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16 }}>s</span>
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15 }}>faro</span>
          <span style={{ color: 'var(--ink-3)', fontSize: 12 }}>by EIKR</span>
        </div>
        <div style={{ width: 1, height: 20, background: 'var(--border)' }}/>
        <span style={{ fontSize: 13, color: 'var(--ink-2)', fontWeight: 500 }}>{workspaceName}</span>
        <nav style={{ display: 'flex', gap: 2, marginLeft: 8, flexWrap: 'wrap' }}>
          {NAV.map(n => (
            <button key={n.id} onClick={() => setScreen(n.id)}
              style={{ padding: '5px 12px', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 13,
                fontWeight: screen === n.id ? 600 : 400,
                background: screen === n.id ? 'var(--surface-2)' : 'transparent',
                color: screen === n.id ? 'var(--ink)' : 'var(--ink-3)',
                display: 'flex', alignItems: 'center', gap: 5 }}>
              {n.label}
              {n.badge > 0 && (
                <span style={{ background: 'var(--dn)', color: '#fff', fontSize: 10, fontWeight: 700, borderRadius: 10, padding: '1px 6px' }}>{n.badge}</span>
              )}
            </button>
          ))}
        </nav>
        <div style={{ marginLeft: 'auto' }}>
          <button onClick={logout} style={{ padding: '5px 12px', borderRadius: 7, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', fontSize: 13, color: 'var(--ink-3)' }}>Sign out</button>
        </div>
      </header>

      <div style={{ flex: 1, maxWidth: 940, width: '100%', margin: '0 auto', padding: '32px 20px' }}>

        {screen === 'today' && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, margin: '0 0 4px' }}>Paid Media Overview</h1>
              <div style={{ color: 'var(--ink-3)', fontSize: 14 }}>Last 30 days · {workspaceName}</div>
            </div>
            {loading ? <div style={{ color: 'var(--ink-3)', padding: '60px 0', textAlign: 'center' }}>Loading...</div> : (
              <>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 20 }}>
                  {[
                    { label: 'Blended ROAS', value: avgRoas ? avgRoas.toFixed(2) + 'x' : '—', bad: avgRoas > 0 && avgRoas < 1.5, good: avgRoas >= 1.5 },
                    { label: 'Total Spend',  value: fmt$(totalSpend) },
                    { label: 'Total Clicks', value: totalClicks ? totalClicks.toLocaleString() : '—' },
                    { label: 'Channels',     value: channels.length || '—' },
                  ].map(k => (
                    <div key={k.label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px 18px' }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-3)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 8 }}>{k.label}</div>
                      <div style={{ fontSize: 26, fontWeight: 800, fontFamily: 'var(--font-display)', color: k.bad ? 'var(--dn)' : k.good ? 'var(--up)' : 'var(--ink)' }}>{k.value}</div>
                    </div>
                  ))}
                </div>

                {channels.length > 0 ? (
                  <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, overflowX: 'auto' }}>
                    <h3 style={{ margin: '0 0 14px', fontFamily: 'var(--font-display)', fontWeight: 700 }}>Channel breakdown</h3>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                      <thead>
                        <tr>
                          {['Channel', 'Spend', 'ROAS', 'Clicks', 'Share'].map(h => (
                            <th key={h} style={{ textAlign: h === 'Channel' ? 'left' : 'right', padding: '6px 10px', color: 'var(--ink-3)', fontWeight: 600, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {channels.map((ch, i) => (
                          <tr key={i} style={{ borderTop: '1px solid var(--border)' }}>
                            <td style={{ padding: '10px', fontWeight: 600 }}>{ch.name}</td>
                            <td style={{ padding: '10px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 12 }}>{fmt$(ch.spend)}</td>
                            <td style={{ padding: '10px', textAlign: 'right', fontWeight: 700, color: (ch.claimed_roas || 0) >= 1.5 ? 'var(--up)' : 'var(--dn)' }}>
                              {ch.claimed_roas != null ? ch.claimed_roas + 'x' : '—'}
                            </td>
                            <td style={{ padding: '10px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontSize: 12 }}>{(ch.clicks || 0).toLocaleString()}</td>
                            <td style={{ padding: '10px', textAlign: 'right', color: 'var(--ink-2)' }}>{ch.share_pct}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '48px 24px', textAlign: 'center' }}>
                    <div style={{ fontSize: 36, marginBottom: 12 }}>📊</div>
                    <h3 style={{ marginBottom: 8 }}>No paid media data yet</h3>
                    <p style={{ color: 'var(--ink-3)', fontSize: 14 }}>Visit Sources to see connected platforms.</p>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {screen === 'paid' && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, margin: '0 0 4px' }}>Paid Media</h1>
              <div style={{ color: 'var(--ink-3)', fontSize: 14 }}>ROAS · spend · clicks by channel</div>
            </div>
            {loading ? <div style={{ color: 'var(--ink-3)', textAlign: 'center', padding: '60px 0' }}>Loading...</div> : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {channels.length === 0 && (
                  <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '48px 24px', textAlign: 'center' }}>
                    <div style={{ fontSize: 36, marginBottom: 12 }}>📈</div>
                    <h3 style={{ marginBottom: 8 }}>No channel data yet</h3>
                    <p style={{ color: 'var(--ink-3)', fontSize: 14 }}>Connect ad platforms via Sources to see per-channel ROAS and spend.</p>
                  </div>
                )}
                {channels.map((ch, i) => {
                  const roasPct = Math.min(100, ((ch.claimed_roas || 0) / 3) * 100)
                  const isGood = (ch.claimed_roas || 0) >= 1.5
                  return (
                    <div key={i} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 700 }}>{ch.name}</h3>
                        <span style={{ fontSize: 12, padding: '3px 9px', borderRadius: 6, fontWeight: 700, background: isGood ? 'color-mix(in oklab, var(--up) 12%, transparent)' : 'color-mix(in oklab, var(--dn) 12%, transparent)', color: isGood ? 'var(--up)' : 'var(--dn)' }}>
                          {isGood ? 'Healthy' : 'Below target'}
                        </span>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
                        {[
                          { label: 'ROAS', value: ch.claimed_roas != null ? ch.claimed_roas + 'x' : '—', color: isGood ? 'var(--up)' : 'var(--dn)' },
                          { label: 'Spend', value: fmt$(ch.spend) },
                          { label: 'Clicks', value: (ch.clicks || 0).toLocaleString() },
                        ].map(m => (
                          <div key={m.label} style={{ background: 'var(--surface-2)', borderRadius: 8, padding: '10px 12px' }}>
                            <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 5 }}>{m.label}</div>
                            <div style={{ fontSize: 20, fontWeight: 800, fontFamily: 'var(--font-display)', color: m.color || 'var(--ink)' }}>{m.value}</div>
                          </div>
                        ))}
                      </div>
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--ink-3)', marginBottom: 5 }}>
                          <span>ROAS vs 1.5× target</span>
                          <span>{ch.claimed_roas != null ? ch.claimed_roas + 'x' : '—'} / 3.0× scale</span>
                        </div>
                        <div style={{ height: 8, background: 'var(--surface-2)', borderRadius: 4, overflow: 'hidden', position: 'relative' }}>
                          <div style={{ height: '100%', width: roasPct + '%', background: isGood ? 'var(--up)' : 'var(--dn)', borderRadius: 4, transition: 'width 0.6s ease' }}/>
                          <div style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', width: 2, background: 'var(--border)', borderRadius: 1 }}/>
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--ink-3)', marginTop: 3, textAlign: 'center' }}>▲ 1.5× threshold</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {screen === 'ask' && (
          <ScreenAsk token={token} workspaceId={workspaceId}/>
        )}

        {screen === 'alerts' && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, margin: '0 0 4px' }}>Alerts</h1>
              <div style={{ color: 'var(--ink-3)', fontSize: 14 }}>ROAS and spend alerts only</div>
            </div>
            {loading ? <div style={{ color: 'var(--ink-3)', textAlign: 'center', padding: '60px 0' }}>Loading...</div>
              : alerts.length === 0 ? (
                <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '52px 24px', textAlign: 'center' }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
                  <h3 style={{ marginBottom: 8 }}>All clear</h3>
                  <p style={{ color: 'var(--ink-3)', fontSize: 14 }}>No active ROAS or spend alerts right now.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {alerts.map(a => (
                    <div key={a.id} style={{
                      background: a.severity === 'critical' ? 'color-mix(in oklab, var(--dn) 8%, var(--surface))' : 'color-mix(in oklab, #f59e0b 8%, var(--surface))',
                      border: '1px solid ' + (a.severity === 'critical' ? 'color-mix(in oklab, var(--dn) 22%, transparent)' : 'color-mix(in oklab, #f59e0b 22%, transparent)'),
                      borderRadius: 12, padding: '14px 16px'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-3)', fontFamily: 'var(--font-mono)', marginBottom: 5 }}>{a.type}</div>
                          <div style={{ fontSize: 14, lineHeight: 1.55 }}>{a.message}</div>
                        </div>
                        {!a.seen && (
                          <span style={{ background: a.severity === 'critical' ? 'var(--dn)' : '#f59e0b', color: '#fff', fontSize: 10, fontWeight: 700, borderRadius: 6, padding: '2px 8px', flexShrink: 0, textTransform: 'uppercase' }}>
                            {a.severity}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
          </div>
        )}

        {screen === 'sources' && (
          <div>
            <div style={{ marginBottom: 24 }}>
              <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, margin: '0 0 4px' }}>Sources</h1>
              <div style={{ color: 'var(--ink-3)', fontSize: 14 }}>Connected data sources · read-only</div>
            </div>
            {(workspaceData?.connections || []).length === 0 ? (
              <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '52px 24px', textAlign: 'center' }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>🔌</div>
                <h3 style={{ marginBottom: 8 }}>No sources connected</h3>
                <p style={{ color: 'var(--ink-3)', fontSize: 14 }}>Ask your admin to connect data sources.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {(workspaceData.connections || []).map(c => (
                  <div key={c.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14, textTransform: 'capitalize' }}>{c.platform}</div>
                      <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>{c.account_id || 'Connected'}</div>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 6, textTransform: 'uppercase', background: c.status === 'active' ? 'color-mix(in oklab, var(--up) 12%, transparent)' : 'var(--surface-2)', color: c.status === 'active' ? 'var(--up)' : 'var(--ink-3)' }}>{c.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
