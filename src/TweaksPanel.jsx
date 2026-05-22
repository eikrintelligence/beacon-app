import React from 'react'

const STYLE = `
  .twk-panel{position:fixed;right:16px;bottom:16px;z-index:9999;width:280px;
    max-height:calc(100vh - 32px);display:flex;flex-direction:column;
    background:rgba(250,249,247,.88);color:#29261b;
    -webkit-backdrop-filter:blur(24px) saturate(160%);backdrop-filter:blur(24px) saturate(160%);
    border:.5px solid rgba(255,255,255,.6);border-radius:14px;
    box-shadow:0 1px 0 rgba(255,255,255,.5) inset,0 12px 40px rgba(0,0,0,.18);
    font:11.5px/1.4 ui-sans-serif,system-ui,sans-serif;overflow:hidden}
  .twk-hd{display:flex;align-items:center;justify-content:space-between;
    padding:10px 8px 10px 14px;cursor:move;user-select:none;border-bottom:1px solid rgba(0,0,0,.06)}
  .twk-hd b{font-size:12px;font-weight:600}
  .twk-x{appearance:none;border:0;background:transparent;color:rgba(41,38,27,.55);
    width:22px;height:22px;border-radius:6px;cursor:pointer;font-size:13px}
  .twk-x:hover{background:rgba(0,0,0,.06);color:#29261b}
  .twk-body{padding:8px 14px 14px;display:flex;flex-direction:column;gap:10px;
    overflow-y:auto;min-height:0}
  .twk-sect{font-size:10px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;
    color:rgba(41,38,27,.45);padding:8px 0 0}
  .twk-row{display:flex;flex-direction:column;gap:5px}
  .twk-row-h{flex-direction:row;align-items:center;justify-content:space-between;gap:10px}
  .twk-lbl{display:flex;justify-content:space-between;color:rgba(41,38,27,.72)}
  .twk-lbl>span:first-child{font-weight:500}
  .twk-field{appearance:none;box-sizing:border-box;width:100%;height:26px;padding:0 8px;
    border:.5px solid rgba(0,0,0,.1);border-radius:7px;
    background:rgba(255,255,255,.6);color:inherit;font:inherit;outline:none}
  .twk-field:focus{border-color:rgba(0,0,0,.25)}
  select.twk-field{background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'><path fill='rgba(0,0,0,.5)' d='M0 0h10L5 6z'/></svg>");
    background-repeat:no-repeat;background-position:right 8px center;padding-right:22px}
  .twk-seg{position:relative;display:flex;padding:2px;border-radius:8px;
    background:rgba(0,0,0,.06);user-select:none}
  .twk-seg-thumb{position:absolute;top:2px;bottom:2px;border-radius:6px;
    background:rgba(255,255,255,.9);box-shadow:0 1px 2px rgba(0,0,0,.12);
    transition:left .15s,width .15s}
  .twk-seg button{appearance:none;position:relative;z-index:1;flex:1;border:0;
    background:transparent;color:inherit;font:inherit;font-weight:500;min-height:22px;
    border-radius:6px;cursor:pointer;padding:4px 6px}
  .twk-toggle{position:relative;width:32px;height:18px;border:0;border-radius:999px;
    background:rgba(0,0,0,.15);transition:background .15s;cursor:pointer;padding:0}
  .twk-toggle[data-on="1"]{background:#34c759}
  .twk-toggle i{position:absolute;top:2px;left:2px;width:14px;height:14px;border-radius:50%;
    background:#fff;box-shadow:0 1px 2px rgba(0,0,0,.25);transition:transform .15s;display:block}
  .twk-toggle[data-on="1"] i{transform:translateX(14px)}
  .twk-chips{display:flex;gap:6px}
  .twk-chip{position:relative;appearance:none;flex:1;height:36px;border:0;border-radius:6px;
    overflow:hidden;cursor:pointer;
    box-shadow:0 0 0 .5px rgba(0,0,0,.12);transition:transform .12s}
  .twk-chip:hover{transform:translateY(-1px)}
  .twk-chip[data-on="1"]{box-shadow:0 0 0 2px rgba(0,0,0,.85)}
`

export function useTweaks(defaults) {
  const [values, setValues] = React.useState(defaults)
  const setTweak = React.useCallback((keyOrEdits, val) => {
    const edits = typeof keyOrEdits === 'object' && keyOrEdits !== null
      ? keyOrEdits : { [keyOrEdits]: val }
    setValues(prev => ({ ...prev, ...edits }))
  }, [])
  return [values, setTweak]
}

export function TweaksPanel({ title = 'Tweaks', children }) {
  const [open, setOpen] = React.useState(true)
  if (!open) return (
    <button onClick={() => setOpen(true)} style={{
      position:'fixed', right:16, bottom:16, zIndex:9999,
      padding:'6px 14px', borderRadius:10, border:'1px solid rgba(0,0,0,.12)',
      background:'rgba(250,249,247,.9)', backdropFilter:'blur(12px)',
      cursor:'pointer', fontSize:12, fontWeight:600
    }}>Tweaks</button>
  )
  return (
    <>
      <style>{STYLE}</style>
      <div className="twk-panel">
        <div className="twk-hd">
          <b>{title}</b>
          <button className="twk-x" onClick={() => setOpen(false)}>✕</button>
        </div>
        <div className="twk-body">{children}</div>
      </div>
    </>
  )
}

export function TweakSection({ label, children }) {
  return <><div className="twk-sect">{label}</div>{children}</>
}

export function TweakRow({ label, children }) {
  return <div className="twk-row"><div className="twk-lbl"><span>{label}</span></div>{children}</div>
}

export function TweakRadio({ label, value, options, onChange }) {
  const opts = options.map(o => typeof o === 'object' ? o : { value: o, label: o })
  const idx = Math.max(0, opts.findIndex(o => o.value === value))
  const n = opts.length
  return (
    <TweakRow label={label}>
      <div className="twk-seg" role="radiogroup">
        <div className="twk-seg-thumb" style={{
          left: `calc(2px + ${idx} * (100% - 4px) / ${n})`,
          width: `calc((100% - 4px) / ${n})`
        }}/>
        {opts.map(o => (
          <button key={o.value} type="button" onClick={() => onChange(o.value)}
                  role="radio" aria-checked={o.value === value}>
            {o.label}
          </button>
        ))}
      </div>
    </TweakRow>
  )
}

export function TweakSelect({ label, value, options, onChange }) {
  return (
    <TweakRow label={label}>
      <select className="twk-field" value={value} onChange={e => onChange(e.target.value)}>
        {options.map(o => {
          const v = typeof o === 'object' ? o.value : o
          const l = typeof o === 'object' ? o.label : o
          return <option key={v} value={v}>{l}</option>
        })}
      </select>
    </TweakRow>
  )
}

export function TweakColor({ label, value, options, onChange }) {
  return (
    <TweakRow label={label}>
      <div className="twk-chips">
        {options.map((o, i) => (
          <button key={i} type="button" className="twk-chip"
                  data-on={o === value ? '1' : '0'}
                  style={{ background: o }}
                  onClick={() => onChange(o)}/>
        ))}
      </div>
    </TweakRow>
  )
}
