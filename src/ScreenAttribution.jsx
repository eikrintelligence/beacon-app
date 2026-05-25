import React from 'react'

export function ScreenAttribution({ workspaceData, onNavigate }) {
  const hasMeta = workspaceData?.connections?.some(c => c.platform === 'meta' && c.status === 'active')
  const hasGads = workspaceData?.connections?.some(c => c.platform === 'gads' && c.status === 'active')
  const hasTikTok = workspaceData?.connections?.some(c => c.platform === 'tt' && c.status === 'active')
  const hasAllSources = hasMeta && hasGads && hasTikTok

  if (!hasAllSources) return (
    <div className="page">
      <div className="page-head">
        <div><h1>Attribution</h1><div className="sub">Cross-channel revenue attribution</div></div>
      </div>
      <div className="card" style={{ padding: '48px 36px', textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>🔌</div>
        <h3 style={{ marginBottom: 8 }}>Connect your ad platforms to see attribution</h3>
        <p style={{ color: 'var(--ink-3)', marginBottom: 24, maxWidth: 400, margin: '0 auto 24px' }}>
          Attribution requires your ad platforms to compare claimed revenue against Shopify actuals.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 28 }}>
          {[
            { name: 'Meta Ads', connected: hasMeta, desc: 'Facebook & Instagram campaigns' },
            { name: 'Google Ads', connected: hasGads, desc: 'Search, display & shopping' },
            { name: 'TikTok Ads', connected: hasTikTok, desc: 'TikTok paid campaigns' },
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
        <button className="btn primary" onClick={() => onNavigate('connections')}>Connect sources →</button>
      </div>
    </div>
  )

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Attribution</h1>
          <div className="sub">Cross-channel revenue attribution · last 30 days</div>
        </div>
      </div>
      <div className="card" style={{ textAlign: 'center', padding: '64px 24px', maxWidth: 480, margin: '0 auto' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
        <h3 style={{ marginBottom: 8 }}>Attribution analysis coming soon</h3>
        <p style={{ color: 'var(--ink-3)', fontSize: 14, lineHeight: 1.6 }}>
          Your ad platforms are connected. Cross-channel attribution analysis is being built.
        </p>
      </div>
    </div>
  )
}
