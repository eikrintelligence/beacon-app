import { useEffect, useMemo, useState } from 'react'
import { getAIFeedback } from './api'
import { Icon } from './icons'

function shortDate(value) {
  if (!value) return '—'
  try { return new Date(value).toLocaleString() } catch { return '—' }
}

function sourceNames(sources) {
  if (!Array.isArray(sources) || sources.length === 0) return 'No sources saved'
  return sources.map(s => s.name || s.platform).filter(Boolean).join(' · ') || 'No sources saved'
}

export default function ScreenAIFeedback({ token, workspaceId }) {
  const [rows, setRows] = useState([])
  const [rating, setRating] = useState('')
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [error, setError] = useState('')

  async function load() {
    if (!token || !workspaceId) return
    setLoading(true)
    setError('')
    try {
      const data = await getAIFeedback(token, workspaceId, rating)
      if (data.error) throw new Error(data.error)
      setRows(Array.isArray(data.feedback) ? data.feedback : [])
    } catch (e) {
      setError(e.message || 'Could not load feedback')
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [token, workspaceId, rating])

  const stats = useMemo(() => {
    const helpful = rows.filter(r => r.rating === 'helpful').length
    const needsWork = rows.filter(r => r.rating === 'needs_work').length
    return { total: rows.length, helpful, needsWork }
  }, [rows])

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <h1>AI Feedback</h1>
          <div className="sub">Review how users rate Faro’s answers</div>
        </div>
        <div className="actions">
          <button className="btn" onClick={() => setRating('')} style={!rating ? { borderColor:'var(--accent)' } : null}>All</button>
          <button className="btn" onClick={() => setRating('helpful')} style={rating === 'helpful' ? { borderColor:'var(--up)', color:'var(--up)' } : null}>Helpful</button>
          <button className="btn" onClick={() => setRating('needs_work')} style={rating === 'needs_work' ? { borderColor:'var(--dn)', color:'var(--dn)' } : null}>Needs work</button>
          <button className="btn primary" onClick={load}><Icon name="refresh" size={14}/> Refresh</button>
        </div>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:12 }}>
        <div className="card">
          <div className="tag">TOTAL</div>
          <div style={{ fontSize:28, fontWeight:800, fontFamily:'var(--font-display)' }}>{stats.total}</div>
        </div>
        <div className="card">
          <div className="tag">HELPFUL</div>
          <div style={{ fontSize:28, fontWeight:800, color:'var(--up)', fontFamily:'var(--font-display)' }}>{stats.helpful}</div>
        </div>
        <div className="card">
          <div className="tag">NEEDS WORK</div>
          <div style={{ fontSize:28, fontWeight:800, color:'var(--dn)', fontFamily:'var(--font-display)' }}>{stats.needsWork}</div>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="muted">Loading feedback...</div>
        ) : error ? (
          <div style={{ color:'var(--dn)' }}>{error}</div>
        ) : rows.length === 0 ? (
          <div className="muted">No feedback yet.</div>
        ) : (
          <div style={{ display:'grid', gap:10 }}>
            {rows.map(row => (
              <button
                key={row.id}
                onClick={() => setSelected(row)}
                style={{
                  textAlign:'left',
                  border:'1px solid var(--border)',
                  background:'var(--surface-2)',
                  color:'var(--ink)',
                  borderRadius:14,
                  padding:14,
                  cursor:'pointer'
                }}
              >
                <div style={{ display:'flex', justifyContent:'space-between', gap:12, alignItems:'flex-start' }}>
                  <div style={{ minWidth:0 }}>
                    <div style={{ fontWeight:750, marginBottom:5, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                      {row.question}
                    </div>
                    <div className="muted" style={{ fontSize:12 }}>
                      {sourceNames(row.sources)}
                    </div>
                  </div>
                  <div style={{
                    flexShrink:0,
                    padding:'4px 9px',
                    borderRadius:999,
                    fontSize:12,
                    fontWeight:800,
                    background: row.rating === 'helpful' ? 'rgba(74,222,128,0.12)' : 'rgba(248,113,113,0.12)',
                    color: row.rating === 'helpful' ? 'var(--up)' : 'var(--dn)'
                  }}>
                    {row.rating === 'helpful' ? 'Helpful' : 'Needs work'}
                  </div>
                </div>
                <div className="muted" style={{ marginTop:8, fontSize:12 }}>{shortDate(row.updated_at || row.created_at)}</div>
              </button>
            ))}
          </div>
        )}
      </div>

      {selected && (
        <div style={{ position:'fixed', inset:0, zIndex:100, background:'rgba(0,0,0,0.35)', display:'grid', placeItems:'center', padding:20 }} onClick={() => setSelected(null)}>
          <div className="card" style={{ width:'min(760px, 100%)', maxHeight:'85vh', overflow:'auto' }} onClick={e => e.stopPropagation()}>
            <div className="row between" style={{ marginBottom:14 }}>
              <div>
                <div className="tag">{selected.rating === 'helpful' ? 'HELPFUL' : 'NEEDS WORK'}</div>
                <h2 style={{ marginTop:4 }}>Feedback detail</h2>
              </div>
              <button className="btn sm ghost" onClick={() => setSelected(null)}>✕</button>
            </div>

            <div className="tag">QUESTION</div>
            <p style={{ lineHeight:1.6 }}>{selected.question}</p>

            <div className="tag">ANSWER</div>
            <p style={{ whiteSpace:'pre-wrap', lineHeight:1.6 }}>{selected.answer}</p>

            <div className="tag">SOURCES</div>
            <p className="muted">{sourceNames(selected.sources)}</p>

            <div className="tag">UPDATED</div>
            <p className="muted">{shortDate(selected.updated_at || selected.created_at)}</p>
          </div>
        </div>
      )}
    </div>
  )
}
