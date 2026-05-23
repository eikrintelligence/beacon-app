import React, { useState } from 'react'
import { Icon } from './shared'

export default function Onboarding({ onComplete, token, userEmail }) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Step 1 — Workspace
  const [brandName, setBrandName] = useState('Dog Treat Naturals')
  const [industry, setIndustry] = useState('ecommerce')

  // Step 2 — Goal
  const [goalAmount, setGoalAmount] = useState('500000')
  const [startDate, setStartDate] = useState('2026-04-01')
  const [endDate, setEndDate] = useState('2026-12-31')

  // Step 3 — Shopify
  const [storeUrl, setStoreUrl] = useState('')
  const [accessToken, setAccessToken] = useState('')
  const [shopifyConnected, setShopifyConnected] = useState(false)
  const [shopName, setShopName] = useState('')
  const [workspaceId, setWorkspaceId] = useState(null)

  const totalWeeks = Math.round(
    (new Date(endDate) - new Date(startDate)) / (7 * 24 * 60 * 60 * 1000)
  )
  const neededPerWeek = totalWeeks > 0
    ? Math.round(parseInt(goalAmount || 0) / totalWeeks)
    : 0

  async function handleGoalNext() {
    setLoading(true)
    setError('')
    try {
      const { createWorkspace, updateGoal } = await import('./api')
      const wsData = await createWorkspace(token, { name: brandName, industry })
      if (wsData.error) throw new Error(wsData.error)
      const wsId = wsData.workspace.id
      localStorage.setItem('sja_workspace_id', wsId)
      await updateGoal(token, wsId, {
        type: 'revenue',
        target: parseInt(goalAmount),
        start_date: startDate,
        end_date: endDate,
        label: `$${parseInt(goalAmount).toLocaleString()} Revenue Goal`
      })
      setStep(3)
      setWorkspaceId(wsId)
    } catch (e) {
      setError('Could not save. Check connection: ' + e.message)
    }
    setLoading(false)
  }

  async function handleShopifyConnect() {
    setLoading(true)
    setError('')
    try {
      const { connectShopify, testShopify } = await import('./api')
      const clean = storeUrl.replace('https://', '').replace('http://', '').replace(/\/$/, '')
      await connectShopify(token, workspaceId, clean, accessToken)
      const test = await testShopify(token)
      if (test.success) {
        setShopifyConnected(true)
        setShopName(test.shop)
      } else {
        setError('Could not connect to Shopify. Check your credentials.')
      }
    } catch (e) {
      setError('Connection failed. Make sure your store URL and token are correct.')
    }
    setLoading(false)
  }

  function handleComplete() {
    localStorage.setItem('sja_onboarded', 'true')
    localStorage.setItem('sja_brand', brandName)
    onComplete()
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, fontFamily: 'var(--font-body)'
    }}>
      <div style={{ width: '100%', maxWidth: 520 }}>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 48 }}>
          <div style={{ width: 32, height: 32, background: 'var(--ink)', borderRadius: 9, display: 'grid', placeItems: 'center' }}>
            <span style={{ color: 'var(--bg)', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18 }}>s</span>
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, letterSpacing: '-0.02em' }}>
            sjá <span style={{ color: 'var(--ink-3)', fontWeight: 400 }}>by EIKR</span>
          </span>
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 40 }}>
          {[1, 2, 3].map(s => (
            <div key={s} style={{
              height: 3, flex: 1, borderRadius: 2,
              background: s <= step ? 'var(--accent)' : 'var(--border)',
              transition: 'background 0.3s'
            }}/>
          ))}
        </div>

        {/* STEP 1 — Workspace */}
        {step === 1 && (
          <div className="fade-in">
            <h2 style={{ fontSize: 32, marginBottom: 8 }}>Your workspace</h2>
            <p style={{ color: 'var(--ink-3)', marginBottom: 32, fontSize: 15 }}>
              Tell Sjá about the business you're managing.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-3)', letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                  Brand / Client name
                </label>
                <input
                  value={brandName}
                  onChange={e => setBrandName(e.target.value)}
                  placeholder="e.g. Dog Treat Naturals"
                  style={{
                    width: '100%', padding: '12px 14px', borderRadius: 10,
                    border: '1px solid var(--border)', background: 'var(--surface)',
                    fontSize: 15, color: 'var(--ink)', fontFamily: 'var(--font-body)',
                    outline: 'none', boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-3)', letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                  Industry
                </label>
                <select
                  value={industry}
                  onChange={e => setIndustry(e.target.value)}
                  style={{
                    width: '100%', padding: '12px 14px', borderRadius: 10,
                    border: '1px solid var(--border)', background: 'var(--surface)',
                    fontSize: 15, color: 'var(--ink)', fontFamily: 'var(--font-body)',
                    outline: 'none', boxSizing: 'border-box'
                  }}
                >
                  <option value="ecommerce">E-commerce</option>
                  <option value="retail">Retail</option>
                  <option value="saas">SaaS</option>
                  <option value="consulting">Consulting</option>
                  <option value="construction">Construction</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <button
              className="btn primary"
              style={{ width: '100%', justifyContent: 'center', marginTop: 32, padding: '14px', fontSize: 15, borderRadius: 12 }}
              onClick={() => setStep(2)}
              disabled={!brandName.trim()}
            >
              Continue <Icon name="arrow-right" size={16}/>
            </button>
          </div>
        )}

        {/* STEP 2 — Goal */}
        {step === 2 && (
          <div className="fade-in">
            <h2 style={{ fontSize: 32, marginBottom: 8 }}>Set your goal</h2>
            <p style={{ color: 'var(--ink-3)', marginBottom: 32, fontSize: 15 }}>
              Sjá will track every metric against this target and alert you when you're off pace.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-3)', letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                  Revenue target ($)
                </label>
                <input
                  type="number"
                  value={goalAmount}
                  onChange={e => setGoalAmount(e.target.value)}
                  placeholder="500000"
                  style={{
                    width: '100%', padding: '12px 14px', borderRadius: 10,
                    border: '1px solid var(--border)', background: 'var(--surface)',
                    fontSize: 28, fontWeight: 700, color: 'var(--ink)',
                    fontFamily: 'var(--font-display)', outline: 'none', boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-3)', letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                    Start date
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={e => setStartDate(e.target.value)}
                    style={{
                      width: '100%', padding: '12px 14px', borderRadius: 10,
                      border: '1px solid var(--border)', background: 'var(--surface)',
                      fontSize: 14, color: 'var(--ink)', fontFamily: 'var(--font-body)',
                      outline: 'none', boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-3)', letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                    End date
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={e => setEndDate(e.target.value)}
                    style={{
                      width: '100%', padding: '12px 14px', borderRadius: 10,
                      border: '1px solid var(--border)', background: 'var(--surface)',
                      fontSize: 14, color: 'var(--ink)', fontFamily: 'var(--font-body)',
                      outline: 'none', boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              {/* Live pace calculation */}
              {goalAmount && startDate && endDate && (
                <div style={{
                  padding: '16px 18px', background: 'var(--accent-soft)',
                  borderRadius: 12, border: '1px solid color-mix(in oklab, var(--accent) 30%, var(--surface))'
                }}>
                  <div style={{ fontSize: 13, color: 'var(--ink-2)' }}>
                    That's <strong style={{ color: 'var(--ink)' }}>{totalWeeks} weeks</strong> to hit{' '}
                    <strong style={{ color: 'var(--ink)' }}>${parseInt(goalAmount).toLocaleString()}</strong>.
                    You need <strong style={{ color: 'var(--accent)' }}>${neededPerWeek.toLocaleString()}/week</strong> to get there.
                  </div>
                </div>
              )}
            </div>

            {error && <div style={{ color: 'var(--dn)', fontSize: 13, marginTop: 12 }}>{error}</div>}

            <div style={{ display: 'flex', gap: 10, marginTop: 32 }}>
              <button className="btn" style={{ padding: '14px 20px', borderRadius: 12 }} onClick={() => setStep(1)}>
                Back
              </button>
              <button
                className="btn primary"
                style={{ flex: 1, justifyContent: 'center', padding: '14px', fontSize: 15, borderRadius: 12 }}
                onClick={handleGoalNext}
                disabled={loading || !goalAmount || !startDate || !endDate}
              >
                {loading ? 'Saving...' : 'Save goal'} <Icon name="arrow-right" size={16}/>
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 — Connect Shopify */}
        {step === 3 && (
          <div className="fade-in">
            <h2 style={{ fontSize: 32, marginBottom: 8 }}>Connect Shopify</h2>
            <p style={{ color: 'var(--ink-3)', marginBottom: 32, fontSize: 15 }}>
              Sjá pulls real revenue, orders, and product data directly from your store.
            </p>

            {!shopifyConnected ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ padding: '14px 16px', background: 'var(--surface-2)', borderRadius: 10, fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.6 }}>
                  <strong>How to get your access token:</strong><br/>
                  Shopify Admin → Settings → Apps → Develop apps → Create app →
                  API scopes: <code style={{ fontFamily: 'var(--font-mono)', fontSize: 11 }}>read_orders, read_products, read_customers</code> → Install → Copy token
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-3)', letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                    Store URL
                  </label>
                  <input
                    value={storeUrl}
                    onChange={e => setStoreUrl(e.target.value)}
                    placeholder="your-store.myshopify.com"
                    style={{
                      width: '100%', padding: '12px 14px', borderRadius: 10,
                      border: '1px solid var(--border)', background: 'var(--surface)',
                      fontSize: 15, color: 'var(--ink)', fontFamily: 'var(--font-mono)',
                      outline: 'none', boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-3)', letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                    Admin API access token
                  </label>
                  <input
                    type="password"
                    value={accessToken}
                    onChange={e => setAccessToken(e.target.value)}
                    placeholder="shpat_••••••••••••••••••••••••••••••••"
                    style={{
                      width: '100%', padding: '12px 14px', borderRadius: 10,
                      border: '1px solid var(--border)', background: 'var(--surface)',
                      fontSize: 15, color: 'var(--ink)', fontFamily: 'var(--font-mono)',
                      outline: 'none', boxSizing: 'border-box'
                    }}
                  />
                </div>

                {error && <div style={{ color: 'var(--dn)', fontSize: 13 }}>{error}</div>}

                <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                  <button className="btn" style={{ padding: '14px 20px', borderRadius: 12 }} onClick={() => setStep(2)}>
                    Back
                  </button>
                  <button
                    className="btn primary"
                    style={{ flex: 1, justifyContent: 'center', padding: '14px', fontSize: 15, borderRadius: 12 }}
                    onClick={handleShopifyConnect}
                    disabled={loading || !storeUrl || !accessToken}
                  >
                    {loading ? 'Connecting...' : 'Connect Shopify'} <Icon name="plug" size={16}/>
                  </button>
                </div>

                <button
                  className="btn ghost"
                  style={{ textAlign: 'center', justifyContent: 'center', color: 'var(--ink-3)', fontSize: 13 }}
                  onClick={handleComplete}
                >
                  Skip for now — use demo data
                </button>
              </div>
            ) : (
              <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                <div style={{
                  padding: '20px', background: 'color-mix(in oklab, var(--up) 10%, var(--surface))',
                  borderRadius: 12, border: '1px solid color-mix(in oklab, var(--up) 25%, var(--surface))',
                  display: 'flex', alignItems: 'center', gap: 14
                }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: '#95bf47', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                    <span style={{ color: 'white', fontWeight: 700, fontSize: 13 }}>SH</span>
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15 }}>{shopName}</div>
                    <div style={{ fontSize: 13, color: 'var(--up)', marginTop: 2 }}>
                      <Icon name="check" size={12}/> Connected successfully
                    </div>
                  </div>
                </div>

                <button
                  className="btn primary"
                  style={{ width: '100%', justifyContent: 'center', padding: '14px', fontSize: 15, borderRadius: 12 }}
                  onClick={handleComplete}
                >
                  Open Sjá <Icon name="arrow-right" size={16}/>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
