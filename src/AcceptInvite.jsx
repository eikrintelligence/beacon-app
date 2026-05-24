import React, { useState, useEffect } from 'react'
import { Icon } from './shared'

const BASE = 'https://sja.eikr.ee/api'

export default function AcceptInvite({ inviteToken }) {
  const [info, setInfo] = useState(null)
  const [infoError, setInfoError] = useState('')
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingInfo, setLoadingInfo] = useState(true)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    fetch(`${BASE}/workspace/invite/${inviteToken}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) { setInfoError(data.error); return }
        setInfo(data)
        if (data.email) setEmail(data.email)
      })
      .catch(() => setInfoError('Could not load invite. The link may have expired.'))
      .finally(() => setLoadingInfo(false))
  }, [inviteToken])

  async function handleSubmit() {
    setLoading(true)
    setError('')
    try {
      let accessToken

      if (mode === 'signup') {
        const reg = await fetch(`${BASE}/auth/signup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, full_name: fullName })
        }).then(r => r.json())
        if (reg.error) throw new Error(reg.error)
      }

      const login = await fetch(`${BASE}/auth/signin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      }).then(r => r.json())
      if (login.error) throw new Error(login.error)
      accessToken = login.access_token

      const accept = await fetch(`${BASE}/workspace/invite/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({ token: inviteToken })
      }).then(r => r.json())
      if (accept.error) throw new Error(accept.error)

      localStorage.setItem('sja_token', accessToken)
      if (accept.workspace_id) localStorage.setItem('sja_workspace_id', accept.workspace_id)
      setDone(true)
      setTimeout(() => { window.location.search = '' }, 1500)
    } catch (e) {
      setError(e.message)
    }
    setLoading(false)
  }

  const inputStyle = {
    width: '100%', padding: '12px 14px', borderRadius: 10,
    border: '1px solid var(--border)', background: 'var(--surface)',
    fontSize: 15, color: 'var(--ink)', fontFamily: 'var(--font-body)',
    outline: 'none', boxSizing: 'border-box'
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 40 }}>
          <div style={{ width: 32, height: 32, background: 'var(--ink)', borderRadius: 9, display: 'grid', placeItems: 'center' }}>
            <span style={{ color: 'var(--bg)', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18 }}>s</span>
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, letterSpacing: '-0.02em' }}>
            faro <span style={{ color: 'var(--ink-3)', fontWeight: 400 }}>by EIKR</span>
          </span>
        </div>

        {loadingInfo ? (
          <div style={{ color: 'var(--ink-3)', fontSize: 15 }}>Loading invite...</div>
        ) : infoError ? (
          <div>
            <h2 style={{ fontSize: 24, marginBottom: 12 }}>Invite unavailable</h2>
            <div style={{ color: 'var(--dn)', fontSize: 15 }}>{infoError}</div>
          </div>
        ) : done ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>✓</div>
            <h2 style={{ fontSize: 24, marginBottom: 8 }}>You're in!</h2>
            <p style={{ color: 'var(--ink-3)', fontSize: 15 }}>Redirecting to your workspace…</p>
          </div>
        ) : (
          <>
            <div style={{ padding: '16px 20px', background: 'var(--surface-2)', borderRadius: 14, marginBottom: 32, border: '1px solid var(--border)' }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-3)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 6 }}>You were invited to</div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{info?.workspace_name || 'a workspace'}</div>
              <div style={{ marginTop: 4 }}>
                <span className="chip" style={{ textTransform: 'capitalize' }}>{info?.role || 'member'}</span>
              </div>
            </div>

            <h2 style={{ fontSize: 26, marginBottom: 6 }}>
              {mode === 'signin' ? 'Sign in to accept' : 'Create your account'}
            </h2>
            <p style={{ color: 'var(--ink-3)', marginBottom: 24, fontSize: 15 }}>
              {mode === 'signin' ? 'Sign in to join this workspace' : 'Create an account to get started'}
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {mode === 'signup' && (
                <input value={fullName} onChange={e => setFullName(e.target.value)}
                  placeholder="Full name" style={inputStyle}/>
              )}
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="Email address" style={inputStyle}/>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Password" style={inputStyle}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}/>
            </div>

            {error && (
              <div style={{ color: 'var(--dn)', fontSize: 13, marginTop: 12, padding: '10px 14px', background: 'color-mix(in oklab, var(--dn) 10%, var(--surface))', borderRadius: 8 }}>
                {error}
              </div>
            )}

            <button onClick={handleSubmit}
              disabled={loading || !email || !password || (mode === 'signup' && !fullName)}
              style={{ width: '100%', marginTop: 20, padding: '14px', borderRadius: 12, border: 'none', background: 'var(--ink)', color: 'var(--bg)', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-body)', opacity: loading ? 0.7 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {loading ? 'Please wait...' : mode === 'signin' ? 'Sign in & accept invite' : 'Create account & accept'}
              {!loading && <Icon name="arrow-right" size={16}/>}
            </button>

            <div style={{ textAlign: 'center', marginTop: 18, fontSize: 14, color: 'var(--ink-3)' }}>
              {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
              <button onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError('') }}
                style={{ color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>
                {mode === 'signin' ? 'Sign up' : 'Sign in'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
