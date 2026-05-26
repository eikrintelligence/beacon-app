import React, { useEffect, useState } from 'react'

const API = 'https://sja.eikr.ee/api'

export function ScreenEmail({ token, workspaceId, onNavigate, workspaceData }) {
  const [loading, setLoading] = useState(true)
  const [metrics, setMetrics] = useState(null)
  const [loaded, setLoaded] = useState(false)

  const connected = workspaceData?.connections?.some(
    c => c.platform === 'klaviyo' && c.status === 'active'
  )

  useEffect(() => {
    if (!token || !workspaceId) {
      setLoading(false)
      return
    }

    fetch(`${API}/klaviyo/metrics?workspace_id=${workspaceId}`, {
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
      Number(metrics.list_size || 0) > 0 ||
      Number(metrics.open_rate || 0) > 0 ||
      Number(metrics.click_rate || 0) > 0 ||
      Number(metrics.revenue_attributed || 0) > 0 ||
      (metrics.lists || []).length > 0 ||
      (metrics.campaigns || []).length > 0
    )

  if (loading) {
    return (
      <div className="page">
        <div className="page-head">
          <div>
            <h1>Email & SMS</h1>
            <div className="sub">Klaviyo email & SMS</div>
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
            <h1>Email & SMS</h1>
            <div className="sub">Klaviyo email & SMS</div>
          </div>
        </div>

        <div className="card" style={{ padding: '48px 36px', textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>📧</div>
          <h3 style={{ marginBottom: 8 }}>Connect Klaviyo to see email data</h3>
          <p style={{ color: 'var(--ink-3)', maxWidth: 400, margin: '0 auto 24px' }}>
            Link your Klaviyo account to see list size, open rates, flow performance and attributed revenue.
          </p>
          <button className="btn primary" onClick={() => onNavigate && onNavigate('connections')}>
            Connect Klaviyo →
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
            <h1>Email & SMS</h1>
            <div className="sub">Klaviyo email & SMS</div>
          </div>
        </div>

        <div className="card" style={{ padding: '48px 36px', textAlign: 'center' }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>✅</div>
          <h3 style={{ marginBottom: 8 }}>Klaviyo connected, no email data yet</h3>
          <p style={{ color: 'var(--ink-3)', maxWidth: 460, margin: '0 auto 24px' }}>
            The connection is active, but Klaviyo returned no lists, campaigns, open rates, clicks, or attributed revenue yet.
          </p>
          <button className="btn primary" onClick={() => onNavigate && onNavigate('connections')}>
            Manage Klaviyo →
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Email & SMS</h1>
          <div className="sub">Klaviyo email & SMS</div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="tag">LIST SIZE</div>
          <div className="num">{Number(metrics.list_size || 0).toLocaleString()}</div>
          <div className="muted">Subscribers</div>
        </div>

        <div className="card">
          <div className="tag">OPEN RATE</div>
          <div className="num">{metrics.open_rate || 0}%</div>
          <div className="muted">Last synced Klaviyo metric</div>
        </div>

        <div className="card">
          <div className="tag">CLICK RATE</div>
          <div className="num">{metrics.click_rate || 0}%</div>
          <div className="muted">Last synced Klaviyo metric</div>
        </div>

        <div className="card">
          <div className="tag">ATTRIBUTED REVENUE</div>
          <div className="num">${Number(metrics.revenue_attributed || 0).toLocaleString()}</div>
          <div className="muted">Last 30 days</div>
        </div>
      </div>
    </div>
  )
}
