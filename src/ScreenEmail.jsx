import React, { useState, useEffect } from 'react'

const BASE = 'https://sja.eikr.ee/api'

export function ScreenEmail({ token, workspaceId, onNavigate }) {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token || !workspaceId) { setLoading(false); return }
    fetch(`${BASE}/klaviyo/metrics?workspace_id=${workspaceId}`, {
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
          <h1>Email &amp; SMS</h1>
          <div className="sub">Klaviyo email &amp; SMS</div>
        </div>
      </div>

      {loading && <div className="muted">Loading...</div>}

      {!loading && (
        <div className="card" style={{ padding: '48px 36px', textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🔌</div>
          <h3 style={{ marginBottom: 8 }}>Connect Klaviyo to see email data</h3>
          <p style={{ color: 'var(--ink-3)', marginBottom: 24, maxWidth: 400, margin: '0 auto 24px' }}>
            Link your Klaviyo account to see list size, open rates, flow performance and attributed revenue.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 28 }}>
            <div style={{ padding: '12px 16px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--surface)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>⬜</span>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>Klaviyo</div>
                <div style={{ fontSize: 11, color: 'var(--ink-3)' }}>Email lists, flows, campaigns</div>
              </div>
            </div>
          </div>
          <button className="btn primary" onClick={() => onNavigate('connections')}>Connect sources →</button>
        </div>
      )}
    </div>
  )
}
