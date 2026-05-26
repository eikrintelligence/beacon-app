import React, { useState, useEffect } from 'react'

const BASE = 'https://sja.eikr.ee/api'

export function ScreenWebsite({ token, workspaceId, onNavigate, workspaceData }) {
  const [loading, setLoading] = useState(true)
  const [metrics, setMetrics] = useState(null)
  const [loaded, setLoaded] = useState(false)

  const connected = workspaceData?.connections?.some(
    c => c.platform === 'ga4' && c.status === 'active'
  )

  useEffect(() => {
    if (!token || !workspaceId) {
      setLoading(false)
      return
    }

    fetch(`${BASE}/ga4/metrics?workspace_id=${workspaceId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(r => r.json())
      .then(data => {
        if (data && !data.error) {
          setMetrics(data)
          setLoaded(true)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [token, workspaceId])

  const hasData =
    metrics &&
    (
      Number(metrics.sessions || 0) > 0 ||
      Number(metrics.users || 0) > 0 ||
      Number(metrics.conversions || 0) > 0 ||
      (metrics.traffic_by_source || []).length > 0
    )

  if (loading) {
    return (
      <div className="page">
        <div className="page-head">
          <div>
            <h1>Website</h1>
            <div className="sub">Google Analytics 4</div>
          </div>
        </div>
        <div className="muted">Loading...</div>
      </div>
    )
  }

  if (!connected) {
    return (
      <div className="page">
        <div className="page-head">
          <div>
            <h1>Website</h1>
            <div className="sub">Google Analytics 4</div>
          </div>
        </div>

        <div className="card" style={{ padding: '48px 36px', textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🔌</div>
          <h3 style={{ marginBottom: 8 }}>Connect Google Analytics to see website data</h3>
          <p style={{ color: 'var(--ink-3)', maxWidth: 400, margin: '0 auto 24px' }}>
            Link your GA4 property to see sessions, traffic sources, bounce rate and conversion data.
          </p>
          <button className="btn primary" onClick={() => onNavigate('connections')}>
            Connect sources →
          </button>
        </div>
      </div>
    )
  }

  if (!hasData) {
    return (
      <div className="page">
        <div className="page-head">
          <div>
            <h1>Website</h1>
            <div className="sub">Google Analytics 4</div>
          </div>
        </div>

        <div className="card" style={{ padding: '48px 36px', textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>✅</div>
          <h3 style={{ marginBottom: 8 }}>Google Analytics connected, no website data yet</h3>
          <p style={{ color: 'var(--ink-3)', maxWidth: 460, margin: '0 auto 24px' }}>
            GA4 is connected, but the app has not received usable sessions, users, traffic sources, or conversion data yet.
          </p>
          <button className="btn primary" onClick={() => onNavigate('connections')}>
            Manage Google Analytics →
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Website</h1>
          <div className="sub">Google Analytics 4</div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="tag">SESSIONS</div>
          <div className="num">{Number(metrics.sessions || 0).toLocaleString()}</div>
          <div className="muted">Last 30 days</div>
        </div>

        <div className="card">
          <div className="tag">USERS</div>
          <div className="num">{Number(metrics.users || 0).toLocaleString()}</div>
          <div className="muted">Last 30 days</div>
        </div>

        <div className="card">
          <div className="tag">BOUNCE RATE</div>
          <div className="num">{metrics.bounce_rate || 0}%</div>
          <div className="muted">Weighted average</div>
        </div>

        <div className="card">
          <div className="tag">CONVERSIONS</div>
          <div className="num">{Number(metrics.conversions || 0).toLocaleString()}</div>
          <div className="muted">Last 30 days</div>
        </div>
      </div>
    </div>
  )
}
