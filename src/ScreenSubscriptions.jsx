import React from 'react'
import { Icon } from './shared'

export function ScreenSubscriptions({ token, workspaceId }) {
  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>Subscriptions</h1>
          <div className="sub">Recurring revenue health &amp; churn risk</div>
        </div>
      </div>
      <div className="card" style={{ textAlign: 'center', padding: '64px 24px', maxWidth: 480, margin: '0 auto' }}>
        <div style={{ fontSize: 52, marginBottom: 20 }}>&#128260;</div>
        <h2 style={{ marginBottom: 10 }}>Subscription analytics coming soon</h2>
        <div style={{ color: 'var(--ink-3)', fontSize: 15, lineHeight: 1.6, marginBottom: 28 }}>
          Connect your subscription billing platform to see MRR, churn rate, at-risk subscribers, and cohort retention.
        </div>
        <div style={{ fontSize: 13, color: 'var(--ink-4)', fontFamily: 'var(--font-mono)' }}>
          Supported: Recharge, Bold, Skio, Stay AI
        </div>
      </div>
    </div>
  )
}
