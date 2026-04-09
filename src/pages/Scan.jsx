import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, CheckCircle, XCircle, RotateCcw } from 'lucide-react'
import { api } from '../api/client'

const INTEL_FLAGS = {
  KNOWN_THREAT_DATABASE: { label: 'Intel Hit',  color: '#ef4444', bg: 'rgba(239,68,68,0.15)' },
  URLHAUS_LISTED:        { label: 'URLhaus DB', color: '#ef4444', bg: 'rgba(239,68,68,0.15)' },
  OPENPHISH_LISTED:      { label: 'OpenPhish',  color: '#ef4444', bg: 'rgba(239,68,68,0.15)' },
  SAFE_BROWSING_HIT:     { label: 'SafeBrowse', color: '#ef4444', bg: 'rgba(239,68,68,0.15)' },
}

function IntelBadges({ flags = [] }) {
  const hits = (flags || []).filter(f => INTEL_FLAGS[f])
  if (!hits.length) return null
  return hits.map(f => {
    const cfg = INTEL_FLAGS[f]
    return (
      <span key={f} style={{
        padding: '2px 6px', borderRadius: 3, fontSize: 10,
        fontFamily: 'JetBrains Mono, monospace', fontWeight: 700,
        background: cfg.bg, color: cfg.color, marginRight: 4,
      }}>
        ⚑ {cfg.label}
      </span>
    )
  })
}

const BOOT_LINES = [
  '> Initializing WARDEN.AI scanner...',
  '> Loading threat intelligence database...',
  '> Connecting to DNS resolver...',
  '> Loading brand impersonation models...',
  '> Generating domain permutations...',
  '> Connecting to platform APIs...',
  '> SCAN INITIATED — streaming results...',
]

const PLATFORMS = [
  { key: 'instagram', label: 'Instagram', icon: '📷' },
  { key: 'facebook',  label: 'Facebook',  icon: '👤' },
  { key: 'x',         label: 'X',         icon: '𝕏' },
  { key: 'youtube',   label: 'YouTube',   icon: '▶' },
  { key: 'linkedin',  label: 'LinkedIn',  icon: '💼' },
]

function BootSequence({ onDone }) {
  const [lines, setLines] = useState([])
  const [cursor, setCursor] = useState(true)

  useEffect(() => {
    let i = 0
    const tick = () => {
      if (i < BOOT_LINES.length) {
        setLines(prev => [...prev, BOOT_LINES[i]])
        i++
        setTimeout(tick, 280)
      } else {
        setTimeout(onDone, 300)
      }
    }
    setTimeout(tick, 120)
    const blink = setInterval(() => setCursor(c => !c), 500)
    return () => clearInterval(blink)
  }, [onDone])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(13,13,20,0.95)',
        zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
      }}
    >
      <div style={{
        width: '100%', maxWidth: 560,
        background: '#08080f', border: '1px solid #7c3aed',
        borderRadius: 12, padding: 28,
        boxShadow: '0 0 60px rgba(124,58,237,0.2)',
      }}>
        <div style={{
          fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#5c5880',
          letterSpacing: '0.12em', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{ color: '#7c3aed' }}>◈</span> WARDEN.AI // BOOT SEQUENCE
        </div>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, lineHeight: 2 }}>
          {lines.map((line, i) => (
            <div key={i} style={{ color: i === lines.length - 1 ? '#a855f7' : '#5c5880' }}>
              {line}
            </div>
          ))}
          {cursor && <span style={{ color: '#a855f7' }}>█</span>}
        </div>
        {lines.length === BOOT_LINES.length && (
          <div style={{
            marginTop: 16, fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
            color: '#f59e0b', fontWeight: 700, letterSpacing: '0.08em',
          }}>
            ⚡ CONNECTING TO SCAN ENGINE...
          </div>
        )}
      </div>
    </motion.div>
  )
}

function SeverityBadge({ sev }) {
  const clr = sev === 'high' || sev === 'critical' ? '#ef4444'
    : sev === 'medium' ? '#f59e0b' : '#10b981'
  const bg = sev === 'high' || sev === 'critical' ? 'rgba(239,68,68,0.15)'
    : sev === 'medium' ? 'rgba(245,158,11,0.15)' : 'rgba(16,185,129,0.12)'
  return (
    <span style={{
      padding: '2px 10px', borderRadius: 100, fontSize: 11,
      fontFamily: 'JetBrains Mono, monospace', fontWeight: 600,
      background: bg, color: clr, border: `1px solid ${clr}44`,
    }}>
      {(sev || 'low').toUpperCase()}
    </span>
  )
}

function ThreatRow({ threat, onTakedown }) {
  const [filing, setFiling] = useState(false)
  const [filed, setFiled]   = useState(false)
  const [expanded, setExpanded] = useState(false)

  const handle = async (e) => {
    e.stopPropagation()
    setFiling(true)
    try { await onTakedown(threat); setFiled(true) }
    catch { /* silent */ }
    finally { setFiling(false) }
  }

  const url  = threat.url || threat.domain || threat.username || threat.profile_url || '—'
  const type = threat.type || threat.platform || 'domain'
  // X rebrand
  const displayType = type === 'twitter' ? 'x' : type

  return (
    <>
      <tr style={{ cursor: 'pointer' }} onClick={() => setExpanded(e => !e)}>
        <td>
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#a855f7' }}>
            {url.length > 44 ? url.slice(0, 44) + '…' : url}
          </span>
        </td>
        <td>
          <span className="badge badge-purple" style={{ fontSize: 10 }}>{displayType}</span>
        </td>
        <td><SeverityBadge sev={threat.severity} /></td>
        <td style={{ fontSize: 12, color: '#5c5880' }}>
          <IntelBadges flags={threat.flags} />
          {(threat.flags || []).filter(f => !INTEL_FLAGS[f]).slice(0, 2).map(f => (
            <span key={f} style={{ marginRight: 6, fontSize: 11 }}>{f.replace(/_/g, ' ')}</span>
          ))}
        </td>
        <td>
          {filed
            ? <span style={{ color: '#10b981', fontSize: 12 }}>✓ Filed</span>
            : <button
                onClick={handle} disabled={filing}
                style={{
                  padding: '4px 12px', borderRadius: 6, fontSize: 11,
                  border: '1px solid rgba(245,158,11,0.4)', background: 'rgba(245,158,11,0.08)',
                  color: '#f59e0b', cursor: 'pointer', fontFamily: 'JetBrains Mono, monospace',
                  transition: 'all 0.15s', opacity: filing ? 0.6 : 1,
                }}>
                {filing ? 'Filing…' : '⚡ Takedown'}
              </button>
          }
        </td>
      </tr>
      {expanded && (
        <tr>
          <td colSpan={5} style={{ padding: '12px 16px', background: 'rgba(124,58,237,0.04)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, fontSize: 12 }}>
              {threat.ip && <div><span style={{ color: '#5c5880', fontSize: 10 }}>IP</span><br /><span style={{ fontFamily: 'JetBrains Mono, monospace', color: '#f1f0ff' }}>{threat.ip}</span></div>}
              {threat.registrar && <div><span style={{ color: '#5c5880', fontSize: 10 }}>REGISTRAR</span><br /><span style={{ color: '#f1f0ff' }}>{threat.registrar}</span></div>}
              {threat.http_status && <div><span style={{ color: '#5c5880', fontSize: 10 }}>HTTP</span><br /><span style={{ color: '#f1f0ff' }}>{threat.http_status}</span></div>}
              {threat.age_days != null && <div><span style={{ color: '#5c5880', fontSize: 10 }}>AGE</span><br /><span style={{ color: '#f1f0ff' }}>{threat.age_days}d</span></div>}
              {threat.title && <div><span style={{ color: '#5c5880', fontSize: 10 }}>TITLE</span><br /><span style={{ color: '#f1f0ff' }}>{threat.title.slice(0, 60)}</span></div>}
              {threat.followers_raw && <div><span style={{ color: '#5c5880', fontSize: 10 }}>FOLLOWERS</span><br /><span style={{ color: '#f1f0ff' }}>{threat.followers_raw}</span></div>}
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

export default function Scan() {
  const [brand, setBrand]       = useState('')
  const [domain, setDomain]     = useState('')
  const [maxPerm, setMaxPerm]   = useState(200)
  const [platforms, setPlatforms] = useState(['instagram', 'facebook', 'x'])
  const [phase, setPhase]       = useState('idle')
  const [scanId, setScanId]     = useState(null)
  const [logs, setLogs]         = useState([])
  const [results, setResults]   = useState(null)
  const [progress, setProgress] = useState(0)
  const [statusMsg, setStatusMsg] = useState('')
  const [err, setErr]           = useState(null)
  const logsEndRef = useRef(null)
  const esRef      = useRef(null)

  useEffect(() => { logsEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [logs])
  useEffect(() => () => esRef.current?.close(), [])

  const togglePlatform = (p) =>
    setPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])

  const launch = () => {
    if (!brand.trim()) return
    setErr(null); setLogs([]); setResults(null); setProgress(0)
    setPhase('boot')
  }

  const onBootDone = async () => {
    setPhase('scanning')
    try {
      const res = await api.scanFull(brand.trim(), domain.trim() || undefined, maxPerm)
      setScanId(res.scan_id)
      esRef.current = api.streamScan(
        res.scan_id,
        (evt) => {
          if (evt.message) setLogs(prev => [...prev, evt.message])
          if (typeof evt.progress === 'number') setProgress(evt.progress)
          if (evt.status) setStatusMsg(evt.status)
        },
        (done) => {
          setPhase('done'); setProgress(100)
          if (done.results) setResults(done.results)
          else if (done.status === 'error') setErr('Scan stream closed with error.')
        },
      )
    } catch (e) {
      setErr(e.message); setPhase('error')
    }
  }

  const handleTakedown = async (threat) =>
    api.fileTakedown({
      brand: brand.trim(), scan_id: scanId,
      threat_url: threat.url || threat.domain || threat.profile_url,
      threat_type: threat.type === 'twitter' ? 'x' : (threat.type || threat.platform || 'domain'),
      severity: threat.severity || 'medium',
    })

  const allThreats = results ? [
    ...(results.domain_results || []).map(d => ({ ...d, type: 'domain' })),
    ...(results.social_results || []).map(s => ({
      ...s,
      type: s.platform === 'twitter' ? 'x' : (s.platform || 'social'),
    })),
  ] : []

  const highCount = allThreats.filter(t => t.severity === 'high' || t.severity === 'critical').length

  return (
    <div className="page-enter" style={{ padding: '28px 32px', maxWidth: 1100, margin: '0 auto' }}>
      {/* Boot sequence overlay */}
      <AnimatePresence>
        {phase === 'boot' && <BootSequence onDone={onBootDone} />}
      </AnimatePresence>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <Zap size={22} color="#7c3aed" />
          <h1 style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 20, fontWeight: 700, margin: 0, letterSpacing: '0.05em' }}>
            INITIATE BRAND SCAN
          </h1>
        </div>
        <p style={{ color: '#5c5880', fontSize: 13, margin: 0 }}>
          Full brand protection sweep across domains and social platforms
        </p>
      </div>

      {/* Config form */}
      {(phase === 'idle' || phase === 'error') && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
          style={{ padding: 28, marginBottom: 24, maxWidth: 680 }}
        >
          <h2 style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fontWeight: 700, color: '#7c3aed', marginBottom: 20, letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 20px' }}>
            Scan Configuration
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
            <div>
              <label style={{ fontSize: 10, color: '#5c5880', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                Brand Name *
              </label>
              <input
                className="input-cyber" placeholder="e.g. mamaearth"
                value={brand} onChange={e => setBrand(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && launch()}
              />
            </div>
            <div>
              <label style={{ fontSize: 10, color: '#5c5880', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                Root Domain (optional)
              </label>
              <input
                className="input-cyber" placeholder="e.g. mamaearth.in"
                value={domain} onChange={e => setDomain(e.target.value)}
              />
            </div>
          </div>

          {/* Platforms */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 10, color: '#5c5880', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 10 }}>
              Social Platforms
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {PLATFORMS.map(p => {
                const active = platforms.includes(p.key)
                return (
                  <button
                    key={p.key}
                    onClick={() => togglePlatform(p.key)}
                    style={{
                      padding: '6px 16px', borderRadius: 8, fontSize: 12,
                      fontFamily: 'JetBrains Mono, monospace', border: '1px solid',
                      cursor: 'pointer', transition: 'all 0.15s',
                      display: 'flex', alignItems: 'center', gap: 6,
                      background: active ? 'rgba(124,58,237,0.15)' : 'transparent',
                      borderColor: active ? '#7c3aed' : '#2a2a4a',
                      color: active ? '#a855f7' : '#5c5880',
                    }}
                  >
                    <span style={{ fontSize: p.key === 'x' ? 14 : 14 }}>{p.icon}</span>
                    {p.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Permutations */}
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 10, color: '#5c5880', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
              Max Permutations
            </label>
            <select className="input-cyber" value={maxPerm} onChange={e => setMaxPerm(Number(e.target.value))} style={{ maxWidth: 200 }}>
              <option value={100}>100 — Fast</option>
              <option value={200}>200 — Standard</option>
              <option value={500}>500 — Deep</option>
              <option value={1000}>1000 — Full</option>
            </select>
          </div>

          {phase === 'error' && err && (
            <div style={{
              padding: '12px 16px', borderRadius: 8, marginBottom: 20,
              background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)',
              color: '#ef4444', fontSize: 12,
            }}>
              {err}
            </div>
          )}

          <button
            className="btn-primary"
            disabled={!brand.trim()}
            onClick={launch}
            style={{ fontSize: 14, padding: '12px 32px', letterSpacing: '0.05em' }}
          >
            <Zap size={16} /> ⚡ LAUNCH SCAN
          </button>
        </motion.div>
      )}

      {/* Progress + logs */}
      {(phase === 'scanning' || phase === 'done') && (
        <>
          <div className="card" style={{ padding: 24, marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
              <span style={{ fontSize: 12, fontFamily: 'JetBrains Mono, monospace', color: phase === 'done' ? '#10b981' : '#a855f7', display: 'flex', alignItems: 'center', gap: 8 }}>
                {phase === 'done' ? <><CheckCircle size={14} /> SCAN COMPLETE</> : '● SCANNING…'}
              </span>
              <span style={{ fontSize: 12, fontFamily: 'JetBrains Mono, monospace', color: '#5c5880' }}>{progress}%</span>
            </div>
            <div style={{ background: '#1a1a2e', borderRadius: 100, height: 6, marginBottom: statusMsg ? 10 : 0 }}>
              <div
                className={phase === 'scanning' ? 'progress-shimmer' : ''}
                style={{
                  width: `${progress}%`, height: '100%', borderRadius: 100,
                  background: phase === 'done' ? '#10b981' : undefined,
                  transition: 'width 0.4s ease',
                }}
              />
            </div>
            {statusMsg && <div style={{ fontSize: 11, color: '#5c5880', fontFamily: 'JetBrains Mono, monospace' }}>{statusMsg}</div>}
          </div>

          <div className="card" style={{ padding: 20, marginBottom: 20 }}>
            <div style={{ fontSize: 10, color: '#5c5880', fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.08em', marginBottom: 8 }}>LIVE LOG STREAM</div>
            <div className="terminal" style={{ maxHeight: 180, overflowY: 'auto' }}>
              {logs.length === 0 && <span style={{ color: '#5c5880' }}>Waiting for events…</span>}
              {logs.map((line, i) => (
                <div key={i} style={{ color: i === logs.length - 1 ? '#a855f7' : '#5c5880' }}>
                  <span style={{ color: '#2a2a4a' }}>[{String(i + 1).padStart(3, '0')}] </span>{line}
                </div>
              ))}
              <div ref={logsEndRef} />
            </div>
          </div>

          {phase === 'done' && results && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="card"
              style={{ padding: 0, overflow: 'hidden' }}
            >
              <div style={{
                padding: '18px 24px', borderBottom: '1px solid #2a2a4a',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#f1f0ff' }}>Threats Detected</span>
                  <span style={{ marginLeft: 12, color: '#5c5880', fontSize: 12 }}>
                    {allThreats.length} total
                    {highCount > 0 && <span style={{ color: '#ef4444', marginLeft: 8 }}>{highCount} high/critical</span>}
                  </span>
                </div>
                <button className="btn-ghost" onClick={() => { setPhase('idle'); setLogs([]); setResults(null) }}>
                  <RotateCcw size={13} style={{ marginRight: 6 }} />New Scan
                </button>
              </div>
              {allThreats.length === 0 ? (
                <div style={{ padding: 40, textAlign: 'center' }}>
                  <CheckCircle size={40} color="#10b981" style={{ margin: '0 auto 12px' }} />
                  <div style={{ color: '#10b981', fontSize: 14, fontWeight: 600 }}>No threats detected</div>
                  <div style={{ color: '#5c5880', fontSize: 12, marginTop: 4 }}>Brand appears clean across all monitored surfaces</div>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="cyber-table">
                    <thead><tr>
                      <th>URL / Handle</th><th>Type</th><th>Severity</th><th>Flags</th><th>Action</th>
                    </tr></thead>
                    <tbody>
                      {allThreats.map((t, i) => (
                        <ThreatRow key={i} threat={t} onTakedown={handleTakedown} />
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </motion.div>
          )}
        </>
      )}
    </div>
  )
}
