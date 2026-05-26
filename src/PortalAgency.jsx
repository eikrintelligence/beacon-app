import React, { useState } from 'react'
import Papa from 'papaparse'

const PLATFORMS = [
  { id: 'instagram', name: 'Instagram', color: '#e1306c', icon: 'IG' },
  { id: 'tiktok',    name: 'TikTok',    color: '#fe2c55', icon: 'TT' },
  { id: 'facebook',  name: 'Facebook',  color: '#1877f2', icon: 'FB' },
]

export function PortalAgency({ token, workspaceId, workspace, logout, role }) {
  const workspaceName = workspace?.name || 'Workspace'
  const storageKey = 'social_metrics_' + (workspaceId || 'default')
  const [metrics, setMetrics] = useState(() => {
    try { return JSON.parse(localStorage.getItem(storageKey) || '{}') } catch { return {} }
  })
  const [editing, setEditing] = useState(null)
  const [draft, setDraft] = useState({})
  const [saved, setSaved] = useState(false)
  const [csvMsg, setCsvMsg] = useState('')
  const canImport = role === 'admin' || role === 'analyst'

  function startEdit(pid) { setEditing(pid); setDraft({ ...metrics[pid] }) }

  function saveEdit() {
    const next = { ...metrics, [editing]: { ...draft } }
    setMetrics(next)
    try { localStorage.setItem(storageKey, JSON.stringify(next)) } catch {}
    setEditing(null)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  function cancelEdit() { setEditing(null); setDraft({}) }

  function handleCsv(file) {
    if (!file) return
    setCsvMsg('')
    const reader = new FileReader()
    reader.onload = e => {
      const result = Papa.parse(e.target.result, {
        header: true, skipEmptyLines: true,
        transformHeader: h => h.trim().toLowerCase()
      })
      if (!result.data.length) { setCsvMsg('CSV appears empty'); return }
      const byPlatform = {}
      result.data.forEach(row => {
        const pid = (row.platform || '').toLowerCase()
        if (!pid) return
        if (!byPlatform[pid] || (row.date || '') > (byPlatform[pid].date || '')) byPlatform[pid] = row
      })
      if (!Object.keys(byPlatform).length) { setCsvMsg('No platform column found in CSV'); return }
      const next = { ...metrics }
      Object.entries(byPlatform).forEach(([pid, row]) => {
        next[pid] = {
          followers:       parseInt(row.followers)                            || next[pid]?.followers       || 0,
          growth:          parseInt(row.growth ?? row.reach)                  || next[pid]?.growth           || 0,
          engagement_rate: parseFloat(row.engagement ?? row.engagement_rate)  || next[pid]?.engagement_rate  || 0,
          posts_this_week: parseInt(row.posts ?? row.posts_this_week)         || next[pid]?.posts_this_week  || 0,
        }
      })
      setMetrics(next)
      try { localStorage.setItem(storageKey, JSON.stringify(next)) } catch {}
      setCsvMsg('✓ Updated ' + Object.keys(byPlatform).length + ' platform(s) from CSV')
    }
    reader.readAsText(file)
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <header style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '0 24px', display: 'flex', alignItems: 'center', height: 56, gap: 16, position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, background: 'var(--ink)', borderRadius: 7, display: 'grid', placeItems: 'center' }}>
            <span style={{ color: 'var(--bg)', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16 }}>s</span>
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15 }}>faro</span>
          <span style={{ color: 'var(--ink-3)', fontSize: 12 }}>by EIKR</span>
        </div>
        <div style={{ width: 1, height: 20, background: 'var(--border)' }}/>
        <span style={{ fontSize: 13, color: 'var(--ink-2)', fontWeight: 500 }}>{workspaceName}</span>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 10, alignItems: 'center' }}>
          {canImport && (
          <label style={{ padding: '5px 14px', borderRadius: 7, border: '1px solid var(--border)', background: 'var(--surface-2)', cursor: 'pointer', fontSize: 13, color: 'var(--ink-2)', fontWeight: 500 }}>
            Import CSV
            <input type="file" accept=".csv" style={{ display: 'none' }}
              onChange={e => { handleCsv(e.target.files[0]); e.target.value = '' }}/>
          </label>
          )}
          <button onClick={logout} style={{ padding: '5px 12px', borderRadius: 7, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', fontSize: 13, color: 'var(--ink-3)' }}>Sign out</button>
        </div>
      </header>

      <div style={{ flex: 1, maxWidth: 880, width: '100%', margin: '0 auto', padding: '32px 20px' }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 28, margin: '0 0 4px' }}>Social Metrics</h1>
          <div style={{ color: 'var(--ink-3)', fontSize: 14 }}>Update your platform data · {workspaceName}</div>
          {csvMsg && <div style={{ marginTop: 10, fontSize: 13, fontWeight: 600, color: csvMsg.startsWith('✓') ? 'var(--up)' : 'var(--dn)' }}>{csvMsg}</div>}
        </div>

        {saved && (
          <div style={{ background: 'color-mix(in oklab, var(--up) 10%, var(--surface))', border: '1px solid color-mix(in oklab, var(--up) 28%, transparent)', borderRadius: 10, padding: '10px 16px', fontSize: 14, color: 'var(--up)', fontWeight: 600, marginBottom: 16 }}>✓ Saved successfully</div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {PLATFORMS.map(p => {
            const m = metrics[p.id] || {}
            const isEditing = editing === p.id
            return (
              <div key={p.id} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '22px 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: p.color, display: 'grid', placeItems: 'center', fontSize: 11, fontWeight: 800, color: '#fff', letterSpacing: '0.03em' }}>{p.icon}</div>
                    <h3 style={{ margin: 0, fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17 }}>{p.name}</h3>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {isEditing && (
                      <button onClick={cancelEdit} style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--ink-3)', cursor: 'pointer', fontSize: 13 }}>Cancel</button>
                    )}
                    <button onClick={() => isEditing ? saveEdit() : startEdit(p.id)}
                      style={{ padding: '6px 16px', borderRadius: 8, border: 'none', background: isEditing ? 'var(--ink)' : 'var(--surface-2)', color: isEditing ? 'var(--bg)' : 'var(--ink)', cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                      {isEditing ? 'Save' : 'Edit'}
                    </button>
                  </div>
                </div>

                {isEditing ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
                    {[
                      { key: 'followers',       label: 'Followers',              type: 'number' },
                      { key: 'growth',           label: 'New followers this week', type: 'number' },
                      { key: 'engagement_rate',  label: 'Engagement rate (%)',     type: 'number', step: '0.1' },
                      { key: 'posts_this_week',  label: 'Posts this week',         type: 'number' },
                    ].map(field => (
                      <div key={field.key}>
                        <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--ink-3)', letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>{field.label}</label>
                        <input
                          type={field.type}
                          step={field.step || '1'}
                          value={draft[field.key] ?? ''}
                          onChange={e => setDraft(d => ({ ...d, [field.key]: e.target.value }))}
                          placeholder="0"
                          style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--surface-2)', fontSize: 14, color: 'var(--ink)', fontFamily: 'var(--font-mono)', outline: 'none', boxSizing: 'border-box' }}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                    {[
                      { label: 'Followers',    value: m.followers ? Number(m.followers).toLocaleString() : '—' },
                      { label: 'Weekly growth', value: m.growth ? '+' + Number(m.growth).toLocaleString() : '—', color: m.growth > 0 ? 'var(--up)' : undefined },
                      { label: 'Engagement',   value: m.engagement_rate ? parseFloat(m.engagement_rate).toFixed(1) + '%' : '—' },
                      { label: 'Posts/week',   value: m.posts_this_week || '—' },
                    ].map(stat => (
                      <div key={stat.label} style={{ background: 'var(--surface-2)', borderRadius: 10, padding: '12px 14px' }}>
                        <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--ink-3)', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 6 }}>{stat.label}</div>
                        <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'var(--font-display)', color: stat.color || 'var(--ink)' }}>{stat.value}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div style={{ marginTop: 20, padding: '14px 18px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, fontSize: 12, color: 'var(--ink-3)', lineHeight: 1.6 }}>
          <strong style={{ color: 'var(--ink-2)' }}>CSV format:</strong> date, platform, followers, growth, engagement_rate, posts_this_week &mdash; one row per platform per period.
        </div>
      </div>
    </div>
  )
}
