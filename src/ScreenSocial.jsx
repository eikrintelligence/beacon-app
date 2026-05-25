import React, { useState } from 'react'
import { Icon } from './shared'

const PLATFORMS = [
  { id: 'instagram', name: 'Instagram', color: '#e1306c', icon: 'IG' },
  { id: 'tiktok',    name: 'TikTok',    color: '#fe2c55', icon: 'TT' },
  { id: 'facebook',  name: 'Facebook',  color: '#1877f2', icon: 'FB' },
]


export function ScreenSocial({ token, workspaceId }) {
  const storageKey = `social_metrics_${workspaceId || 'default'}`
  const [metrics, setMetrics] = useState(() => {
    try { return JSON.parse(localStorage.getItem(storageKey) || '{}') } catch { return {} }
  })
  const [editing, setEditing] = useState(null)
  const [draft, setDraft] = useState({})
  const [saved, setSaved] = useState(false)

  function startEdit(platformId) {
    setEditing(platformId)
    setDraft({ ...metrics[platformId] })
  }

  function saveEdit() {
    const next = { ...metrics, [editing]: { ...draft } }
    setMetrics(next)
    try { localStorage.setItem(storageKey, JSON.stringify(next)) } catch {}
    setEditing(null)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const totalFollowers = Object.values(metrics).reduce((s, m) => s + (m.followers || 0), 0)
  const totalGrowth = Object.values(metrics).reduce((s, m) => s + (m.growth || 0), 0)
  const hasData = totalFollowers > 0

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Social media</h1>
          <div className="sub">{hasData ? `${totalFollowers.toLocaleString()} total followers` : 'Enter your social metrics below'}</div>
        </div>
        {saved && <div style={{ padding: '8px 16px', borderRadius: 10, background: 'color-mix(in oklab, var(--up) 12%, var(--surface))', color: 'var(--up)', fontSize: 13, fontWeight: 600 }}>✓ Saved</div>}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        {PLATFORMS.map(p => {
          const m = metrics[p.id] || {}
          const isEditing = editing === p.id
          return (
            <div key={p.id} className="card" style={{ position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: p.color, color: 'white', display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 700 }}>{p.icon}</div>
                <div style={{ fontWeight: 600, fontSize: 15 }}>{p.name}</div>
              </div>

              {!isEditing ? (
                <>
                  <div style={{ fontSize: 42, fontWeight: 800, fontFamily: 'var(--font-display)', letterSpacing: '-0.03em', color: 'var(--ink)', marginBottom: 4 }}>
                    {m.followers >= 1000 ? `${(m.followers/1000).toFixed(1)}k` : m.followers?.toLocaleString()}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 14 }}>followers</div>
                  <div style={{ display: 'flex', gap: 16 }}>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>WoW growth</div>
                      <div style={{ fontWeight: 700, fontSize: 16, color: m.growth > 0 ? 'var(--up)' : 'var(--dn)', marginTop: 2 }}>+{m.growth?.toLocaleString()}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Engagement</div>
                      <div style={{ fontWeight: 700, fontSize: 16, marginTop: 2 }}>{m.engagement_rate}%</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Posts/wk</div>
                      <div style={{ fontWeight: 700, fontSize: 16, marginTop: 2 }}>{m.posts_this_week}</div>
                    </div>
                  </div>
                  <button className="btn sm ghost" style={{ marginTop: 14, width: '100%', justifyContent: 'center' }} onClick={() => startEdit(p.id)}>
                    <Icon name="edit" size={13}/> Update
                  </button>
                </>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {[
                    { key: 'followers', label: 'Followers', type: 'number' },
                    { key: 'growth', label: 'WoW growth', type: 'number' },
                    { key: 'engagement_rate', label: 'Engagement %', type: 'number' },
                    { key: 'posts_this_week', label: 'Posts this week', type: 'number' },
                  ].map(field => (
                    <div key={field.key}>
                      <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 4 }}>{field.label}</label>
                      <input
                        type={field.type}
                        value={draft[field.key] || ''}
                        onChange={e => setDraft(d => ({ ...d, [field.key]: parseFloat(e.target.value) || 0 }))}
                        style={{ width: '100%', padding: '8px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface)', fontSize: 14, color: 'var(--ink)', fontFamily: 'var(--font-body)', outline: 'none', boxSizing: 'border-box' }}
                      />
                    </div>
                  ))}
                  <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                    <button className="btn sm" onClick={() => setEditing(null)}>Cancel</button>
                    <button className="btn sm primary" style={{ flex: 1, justifyContent: 'center' }} onClick={saveEdit}>Save</button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="card">
        <h3 style={{ marginBottom: 4 }}>About this dashboard</h3>
        <div style={{ fontSize: 13, color: 'var(--ink-3)', lineHeight: 1.6 }}>
          Enter your social metrics manually each week. Click <strong>Update</strong> on any platform card to enter the latest numbers.
          API integrations for Instagram, TikTok and Facebook are coming soon.
        </div>
      </div>
    </div>
  )
}
