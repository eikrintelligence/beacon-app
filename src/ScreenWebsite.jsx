import React, { useState, useEffect } from 'react'

const BASE = 'https://sja.eikr.ee/api'

export function ScreenWebsite({ token, workspaceId, onNavigate, workspaceData }) {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token || !workspaceId) { setLoading(false); return }
    fetch(`${BASE}/ga4/metrics?workspace_id=${workspaceId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => {})
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [token, workspaceId])

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Website</h1>
          <div className="sub">Google Analytics 4</div>
        </div>
      </div>

      {loading && <div className="muted">Loading...</div>}

      {!loading && (
        <div className="card" style={{ padding: '48px 36px', textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🔌</div>
          <h3 style={{ marginBottom: 8 }}>Connect Google Analytics to see website data</h3>
          <p style={{ color: 'var(--ink-3)', marginBottom: 24, maxWidth: 400, margin: '0 auto 24px' }}>
            Link your GA4 property to see sessions, traffic sources, bounce rate and conversion data.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 28 }}>
            <div style={{ padding: '12px 16px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--surface)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>⬜</span>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>Google Analytics 4</div>
                <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>Sessions, users, conversions</div>
              </div>
            </div>
          </div>
          <button className="btn primary" onClick={() => onNavigate('connections')}>Connect sources →</button>
        </div>
      )}
    </div>
  )
}
