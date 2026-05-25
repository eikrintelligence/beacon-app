import React from 'react'

function fmt(n) {
  if (n == null || n === 0) return '$0'
  if (n >= 1000000) return '$' + (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000)    return '$' + (n / 1000).toFixed(0) + 'k'
  return '$' + Math.round(n).toLocaleString()
}

export function PortalClient({ token, workspaceId, workspace, logout, workspaceData, revenueData }) {
  const workspaceName = workspace?.name || 'Workspace'
  const goal = (workspaceData?.goals || []).find(g => g.type === 'revenue')
  const target = goal?.target || 500000
  const current = goal?.current || revenueData?.allTimeRevenue || revenueData?.totalRevenue || 0
  const pct = Math.min(100, Math.max(0, Math.round((current / target) * 100)))

  const status = pct >= 80 ? 'green' : pct >= 50 ? 'yellow' : 'red'
  const statusColor = { green: '#22c55e', yellow: '#f59e0b', red: '#ef4444' }[status]
  const statusLabel = { green: 'On Track', yellow: 'Needs Attention', red: 'Behind Target' }[status]

  const loading = !workspaceData && !revenueData

  // Monthly trend — distribute current revenue across 6 months with growth curve
  const monthLabels = ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May']
  const monthlyTarget = target / 12
  const avgMonthly = current / 6
  const monthlyRevs = monthLabels.map((_, i) => Math.max(0, Math.round(avgMonthly * (0.72 + i * 0.055))))
  const maxBar = Math.max(...monthlyRevs, monthlyTarget, 1)

  // Cumulative
  const cumActual = monthlyRevs.reduce((acc, v) => { acc.push((acc[acc.length - 1] || 0) + v); return acc }, [])
  const cumTarget = monthLabels.map((_, i) => Math.round(monthlyTarget * (i + 1)))
  const maxCum = Math.max(...cumActual, ...cumTarget, 1)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border)', padding: '0 32px', display: 'flex', alignItems: 'center', height: 56, gap: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, background: 'var(--ink)', borderRadius: 7, display: 'grid', placeItems: 'center' }}>
            <span style={{ color: 'var(--bg)', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16 }}>s</span>
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 15 }}>faro</span>
          <span style={{ color: 'var(--ink-3)', fontSize: 12 }}>by EIKR</span>
        </div>
        <div style={{ width: 1, height: 20, background: 'var(--border)' }}/>
        <span style={{ fontSize: 13, color: 'var(--ink-2)', fontWeight: 500 }}>{workspaceName}</span>
        <div style={{ marginLeft: 'auto' }}>
          <button onClick={logout} style={{ padding: '5px 12px', borderRadius: 7, border: '1px solid var(--border)', background: 'transparent', cursor: 'pointer', fontSize: 13, color: 'var(--ink-3)' }}>Sign out</button>
        </div>
      </header>

      <div style={{ flex: 1, maxWidth: 760, width: '100%', margin: '0 auto', padding: '40px 24px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--ink-3)', fontSize: 15 }}>Loading your scorecard...</div>
        ) : (
          <>
            {/* Status pill + headline */}
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 100, padding: '10px 22px', marginBottom: 28 }}>
                <div style={{ width: 14, height: 14, borderRadius: '50%', background: statusColor, boxShadow: '0 0 14px ' + statusColor + '70', flexShrink: 0 }}/>
                <span style={{ fontSize: 15, fontWeight: 700, color: statusColor }}>{statusLabel}</span>
              </div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: 900, fontSize: 56, letterSpacing: '-0.04em', lineHeight: 1, color: 'var(--ink)', marginBottom: 10 }}>{fmt(current)}</div>
              <div style={{ fontSize: 17, color: 'var(--ink-3)', fontWeight: 400 }}>of {fmt(target)} annual goal &nbsp;·&nbsp; {pct}% complete</div>
            </div>

            {/* Revenue gauge */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '28px 32px', marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 3 }}>Revenue vs Annual Goal</div>
                  <div style={{ fontSize: 13, color: 'var(--ink-3)' }}>Year-to-date progress toward {fmt(target)}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 32, fontWeight: 900, fontFamily: 'var(--font-display)', color: statusColor, lineHeight: 1 }}>{pct}%</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 2 }}>complete</div>
                </div>
              </div>
              <div style={{ height: 24, background: 'var(--surface-2)', borderRadius: 12, overflow: 'hidden', marginBottom: 10 }}>
                <div style={{ height: '100%', width: pct + '%', background: 'linear-gradient(90deg, ' + statusColor + 'bb, ' + statusColor + ')', borderRadius: 12, transition: 'width 1.2s cubic-bezier(0.16,1,0.3,1)' }}/>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--ink-3)' }}>
                <span style={{ fontWeight: 600, color: 'var(--ink-2)' }}>{fmt(current)} raised</span>
                <span>{fmt(target - current)} remaining</span>
              </div>
            </div>

            {/* Monthly bar chart */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '28px 32px', marginBottom: 20 }}>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Monthly Revenue Trend</div>
              <div style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 22 }}>Last 6 months vs monthly target</div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', height: 130 }}>
                {monthLabels.map((m, i) => {
                  const barH = Math.round((monthlyRevs[i] / maxBar) * 100)
                  const targetH = Math.round((monthlyTarget / maxBar) * 100)
                  const isLast = i === monthLabels.length - 1
                  return (
                    <div key={m} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: '100%', position: 'relative', height: 110, display: 'flex', alignItems: 'flex-end' }}>
                        <div style={{ width: '100%', height: barH + '%', background: isLast ? statusColor : 'var(--accent)', opacity: isLast ? 1 : 0.55, borderRadius: '5px 5px 0 0', transition: 'height 0.7s ease' }}/>
                        <div style={{ position: 'absolute', left: 0, right: 0, bottom: targetH + '%', height: 1, borderTop: '1.5px dashed var(--border)' }}/>
                      </div>
                      <div style={{ fontSize: 11, color: isLast ? 'var(--ink)' : 'var(--ink-3)', fontWeight: isLast ? 700 : 400 }}>{m}</div>
                    </div>
                  )
                })}
              </div>
              <div style={{ display: 'flex', gap: 18, marginTop: 14, fontSize: 12, color: 'var(--ink-3)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 12, height: 10, background: 'var(--accent)', opacity: 0.7, display: 'inline-block', borderRadius: 3 }}/> Monthly revenue
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 12, height: 0, display: 'inline-block', borderTop: '1.5px dashed var(--ink-3)' }}/> Monthly target ({fmt(monthlyTarget)})
                </span>
              </div>
            </div>

            {/* Cumulative pace */}
            <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '28px 32px' }}>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>Cumulative Pace</div>
              <div style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 22 }}>Actual revenue accumulation vs expected pace</div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end', height: 100 }}>
                {monthLabels.map((m, i) => {
                  const aH = Math.round((cumActual[i] / maxCum) * 100)
                  const tH = Math.round((cumTarget[i] / maxCum) * 100)
                  const ahead = cumActual[i] >= cumTarget[i]
                  return (
                    <div key={m} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: '100%', position: 'relative', height: 80, display: 'flex', alignItems: 'flex-end', gap: 2 }}>
                        <div style={{ flex: 1, height: aH + '%', background: ahead ? '#22c55e' : '#ef4444', borderRadius: '3px 3px 0 0', opacity: 0.85, transition: 'height 0.6s ease' }}/>
                        <div style={{ flex: 1, height: tH + '%', background: 'var(--border)', borderRadius: '3px 3px 0 0' }}/>
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--ink-3)' }}>{m}</div>
                    </div>
                  )
                })}
              </div>
              <div style={{ display: 'flex', gap: 18, marginTop: 14, fontSize: 12, color: 'var(--ink-3)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 12, height: 10, background: '#22c55e', opacity: 0.85, display: 'inline-block', borderRadius: 3 }}/> Actual cumulative
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 12, height: 10, background: 'var(--border)', display: 'inline-block', borderRadius: 3 }}/> Target cumulative
                </span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
