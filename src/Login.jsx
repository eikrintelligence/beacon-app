import React, { useState } from 'react'
import { useAuth } from './AuthContext'
import { Icon } from './shared'

const BASE = 'https://sja.eikr.ee/api'

export default function Login({ onNeedOnboarding }) {
  const { login, register } = useAuth()
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resetSent, setResetSent] = useState(false)
  const [resetting, setResetting] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit() {
    setLoading(true)
    setError('')
    try {
      if (mode === 'signin') {
        await login(email, password)
      } else {
        const data = await register(email, password, fullName)
        if (data.error) throw new Error(data.error)
        setSuccess(true)
        setTimeout(() => {
          onNeedOnboarding({ email, password, fullName })
        }, 1500)
      }
    } catch (e) {
      setError(e.message)
    }
    setLoading(false)
  }

  async function handleReset() {
    if (!email) { setError('Enter your email address first'); return }
    setResetting(true)
    setError('')
    try {
      const res = await fetch(`${BASE}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      }).then(r => r.json())
      if (res.error) throw new Error(res.error)
      setResetSent(true)
    } catch (e) {
      setError(e.message)
    }
    setResetting(false)
  }

  if (success) return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:56, height:56, borderRadius:'50%', background:'var(--up)', display:'grid', placeItems:'center', margin:'0 auto 16px', fontSize:24 }}>✓</div>
        <h2 style={{ fontFamily:'var(--font-display)', marginBottom:8 }}>Account created!</h2>
        <p style={{ color:'var(--ink-3)' }}>Setting up your workspace...</p>
      </div>
    </div>
  )

  const inputStyle = {
    width: '100%', padding: '12px 14px', borderRadius: 10,
    border: '1px solid var(--border)', background: 'var(--surface)',
    fontSize: 15, color: 'var(--ink)', fontFamily: 'var(--font-body)',
    outline: 'none', boxSizing: 'border-box'
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 48 }}>
          <div style={{ width: 32, height: 32, background: 'var(--ink)', borderRadius: 9, display: 'grid', placeItems: 'center' }}>
            <span style={{ color: 'var(--bg)', fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18 }}>s</span>
          </div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, letterSpacing: '-0.02em' }}>
            faro <span style={{ color: 'var(--ink-3)', fontWeight: 400 }}>by EIKR</span>
          </span>
        </div>

        <h2 style={{ fontSize: 30, marginBottom: 8 }}>
          {mode === 'signin' ? 'Welcome back' : 'Create your account'}
        </h2>
        <p style={{ color: 'var(--ink-3)', marginBottom: 32, fontSize: 15 }}>
          {mode === 'signin' ? 'Sign in to your workspace' : 'Start tracking what matters'}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {mode === 'signup' && (
            <input
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="Full name"
              style={inputStyle}
            />
          )}
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email address"
            style={inputStyle}
          />
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
            style={inputStyle}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          />
        </div>

        {error && (
          <div style={{ color: 'var(--dn)', fontSize: 13, marginTop: 12, padding: '10px 14px', background: 'color-mix(in oklab, var(--dn) 10%, var(--surface))', borderRadius: 8 }}>
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading || !email || !password || (mode === 'signup' && !fullName)}
          style={{
            width: '100%', marginTop: 20, padding: '14px',
            borderRadius: 12, border: 'none',
            background: 'var(--ink)', color: 'var(--bg)',
            fontSize: 15, fontWeight: 600, cursor: 'pointer',
            fontFamily: 'var(--font-body)', opacity: loading ? 0.7 : 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
          }}
        >
          {loading ? 'Please wait...' : mode === 'signin' ? 'Sign in' : 'Create account'}
          {!loading && <Icon name="arrow-right" size={16}/>}
        </button>

        {mode === 'signin' && (
          <div style={{ textAlign: 'right', marginTop: 10 }}>
            <button onClick={handleReset} disabled={resetting}
              style={{ color: 'var(--ink-3)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13 }}>
              {resetting ? 'Sending...' : 'Forgot password?'}
            </button>
          </div>
        )}

        {resetSent && (
          <div style={{ fontSize: 13, marginTop: 10, padding: '10px 14px', background: 'color-mix(in oklab, var(--up) 10%, var(--surface))', borderRadius: 8, color: 'var(--up)' }}>
            Check your email — we sent a password reset link.
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--ink-3)' }}>
          {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(''); setResetSent(false) }}
            style={{ color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14 }}
          >
            {mode === 'signin' ? 'Sign up' : 'Sign in'}
          </button>
        </div>
      </div>
    </div>
  )
}
