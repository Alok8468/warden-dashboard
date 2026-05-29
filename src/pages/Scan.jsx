import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, CheckCircle, XCircle, RotateCcw, Wifi, WifiOff } from 'lucide-react'
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
    let tid  // track latest pending timeout so cleanup can cancel it
    const tick = () => {
      if (i < BOOT_LINES.length) {
        setLines(prev => [...prev, BOOT_LINES[i]])
        i++
        tid = setTimeout(tick, 280)
      } else {
        tid = setTimeout(onDone, 300)
      }
    }
    tid = setTimeout(tick, 120)
    const blink = setInterval(() => setCursor(c => !c), 500)
    // Cancel BOTH the blink interval and any in-flight timeout on cleanup.
    // Without this, React StrictMode's double-invoke causes the boot sequence
    // to call onDone twice → two concurrent /api/scan/full requests.
    return () => { clearInterval(blink); clearTimeout(tid) }
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

const POPULAR_BRANDS = [
  { name: 'Nykaa',       domain: 'nykaa.com' },
  { name: 'boAt',        domain: 'boat-lifestyle.com' },
  { name: 'Mamaearth',   domain: 'mamaearth.in' },
  { name: 'CRED',        domain: 'cred.club' },
  { name: 'Zomato',      domain: 'zomato.com' },
  { name: 'Swiggy',      domain: 'swiggy.com' },
  { name: 'Meesho',      domain: 'meesho.com' },
  { name: 'PhonePe',     domain: 'phonepe.com' },
  { name: 'Paytm',       domain: 'paytm.com' },
  { name: 'HDFC Bank',   domain: 'hdfcbank.com' },
  { name: 'Myntra',      domain: 'myntra.com' },
  { name: 'Flipkart',    domain: 'flipkart.com' },
  { name: 'Ola',         domain: 'olacabs.com' },
  { name: 'Uber',        domain: 'uber.com' },
  { name: 'MakeMyTrip',  domain: 'makemytrip.com' },
  { name: 'Wow Skin',    domain: 'wowskinscience.com' },
  { name: 'mCaffeine',   domain: 'mcaffeine.com' },
  { name: 'Noise',       domain: 'gonoise.com' },
]

function friendlyError(msg) {
  if (!msg) return 'Something went wrong. Please try again.'
  if (msg.includes('invalid_domain') || msg.includes('two labels'))
    return 'Please enter a valid domain like nykaa.com'
  if (msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('ECONNREFUSED'))
    return 'Cannot connect to server. Is the backend running?'
  if (msg.includes('401') || msg.includes('Unauthorized'))
    return 'Session expired. Please log in again.'
  if (msg.includes('429') || msg.includes('quota'))
    return 'Scan limit reached. Upgrade your plan for more scans.'
  if (msg.includes('500') || msg.includes('Server error'))
    return 'Server error. Please try again in a moment.'
  return msg
}

// ── Staged progress bar ───────────────────────────────────────────────────────
// The scan has three observable stages. We infer the current stage from the
// progress % so we don't need to change the backend event shape at all.
const STAGES = [
  { label: 'Queued',    pct: 0  },
  { label: 'Probing',   pct: 15 },
  { label: 'Analyzing', pct: 50 },
  { label: 'Complete',  pct: 100 },
]

function ScanProgressBar({ progress, phase, connected, reconnectAttempt }) {
  const done      = phase === 'done'
  const failed    = phase === 'error'
  const fillColor = failed ? '#ef4444' : done ? '#10b981' : '#7c3aed'

  const activeStage = STAGES.reduce((acc, s) => (progress >= s.pct ? s : acc), STAGES[0])

  return (
    <div style={{ padding: '20px 24px' }}>
      {/* Stage labels */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        {STAGES.map((s) => {
          const past   = progress >= s.pct
          const active = s.label === activeStage.label && !done && !failed
          return (
            <span key={s.label} style={{
              fontSize: 10,
              fontFamily: 'JetBrains Mono, monospace',
              letterSpacing: '0.06em',
              color: active ? '#a855f7' : past ? '#5c5880' : '#2a2a4a',
              fontWeight: active ? 700 : 400,
              transition: 'color 0.3s',
            }}>
              {active ? '● ' : past && !done ? '✓ ' : ''}{s.label.toUpperCase()}
            </span>
          )
        })}
      </div>

      {/* Bar */}
      <div style={{ position: 'relative', background: '#1a1a2e', borderRadius: 100, height: 8, overflow: 'hidden' }}>
        {/* Animated shimmer stripe on the unfilled portion while scanning */}
        {!done && !failed && (
          <div className="progress-shimmer" style={{ position: 'absolute', inset: 0 }} />
        )}
        <div style={{
          position:   'relative',
          width:      `${progress}%`,
          height:     '100%',
          borderRadius: 100,
          background: fillColor,
          boxShadow:  done ? `0 0 12px ${fillColor}66` : undefined,
          transition: 'width 0.5s cubic-bezier(0.4,0,0.2,1), background 0.3s',
        }} />
      </div>

      {/* Status row */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8,
      }}>
        <span style={{
          fontSize: 11, fontFamily: 'JetBrains Mono, monospace',
          color: failed ? '#ef4444' : done ? '#10b981' : '#a855f7',
          display: 'flex', alignItems: 'center', gap: 6,
        }}>
          {done    ? <><CheckCircle size={13} /> COMPLETE</>
          : failed ? <><XCircle    size={13} /> FAILED</>
          :          <>● {activeStage.label.toUpperCase()}…</>}
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {reconnectAttempt > 0 && !done && (
            <span style={{ fontSize: 10, color: '#f59e0b', fontFamily: 'JetBrains Mono, monospace' }}>
              ↻ Reconnecting ({reconnectAttempt})
            </span>
          )}
          <span style={{ fontSize: 11, fontFamily: 'JetBrains Mono, monospace', color: '#5c5880' }}>
            {progress}%
          </span>
          {connected != null && (
            <span title={connected ? 'WebSocket connected' : 'WebSocket disconnected'}
              style={{ color: connected ? '#10b981' : '#ef4444', display: 'flex', alignItems: 'center' }}>
              {connected ? <Wifi size={12} /> : <WifiOff size={12} />}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}


export default function Scan() {
  const [brand, setBrand]             = useState('')
  const [domain, setDomain]           = useState('')
  const [domainAutoFilled, setDomainAutoFilled] = useState(false)
  const [showSuggestions, setShowSuggestions]   = useState(false)
  const [maxPerm, setMaxPerm]         = useState(200)
  const [platforms, setPlatforms]     = useState(['instagram', 'facebook', 'x'])
  const [phase, setPhase]                   = useState('idle')
  const [scanId, setScanId]                 = useState(null)
  const [logs, setLogs]                     = useState([])
  const [results, setResults]               = useState(null)
  const [progress, setProgress]             = useState(0)
  const [statusMsg, setStatusMsg]           = useState('')
  const [err, setErr]                       = useState(null)
  const [wsConnected, setWsConnected]       = useState(null)   // null=not yet / true / false
  const [reconnectAttempt, setReconnect]    = useState(0)
  const logsEndRef     = useRef(null)
  const wsCtrlRef      = useRef(null)   // WebSocket controller from api.streamScanWS
  const brandRef       = useRef(null)
  const scanStartedRef = useRef(false)  // guard against StrictMode double-invoke

  useEffect(() => { logsEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [logs])
  // Cleanup WebSocket on unmount
  useEffect(() => () => wsCtrlRef.current?.close(), [])

  // Auto-fill domain when brand name changes
  useEffect(() => {
    if (brand && !domain) {
      const auto = brand.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '') + '.com'
      setDomain(auto)
      setDomainAutoFilled(true)
    }
    if (!brand) {
      if (domainAutoFilled) setDomain('')
      setDomainAutoFilled(false)
    }
  }, [brand]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleDomainChange = (e) => {
    setDomain(e.target.value)
    setDomainAutoFilled(false)
  }

  const suggestions = brand.length > 1
    ? POPULAR_BRANDS.filter(b => b.name.toLowerCase().includes(brand.toLowerCase())).slice(0, 5)
    : []

  const togglePlatform = (p) =>
    setPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])

  const launch = () => {
    if (!brand.trim()) return
    // Close any existing stream before starting fresh
    wsCtrlRef.current?.close()
    wsCtrlRef.current = null
    scanStartedRef.current = false  // reset guard so next boot sequence can fire
    setErr(null); setLogs([]); setResults(null); setProgress(0)
    setWsConnected(null); setReconnect(0)
    setShowSuggestions(false)
    setPhase('boot')
  }

  const onBootDone = useCallback(async () => {
    // StrictMode double-fire guard: ensure only the first invocation runs
    if (scanStartedRef.current) return
    scanStartedRef.current = true
    setPhase('scanning')
    const finalDomain = domain.trim() ||
      brand.trim().toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9]/g, '') + '.com'
    try {
      const res = await api.scanFull(brand.trim(), finalDomain, maxPerm)
      setScanId(res.scan_id)

      wsCtrlRef.current = api.streamScanWS(res.scan_id, {
        onEvent: (evt) => {
          if (evt.message) setLogs(prev => [...prev, evt.message])
          if (evt.current != null && evt.total > 0)
            setProgress(Math.round((evt.current / evt.total) * 100))
          else if (typeof evt.progress === 'number')
            setProgress(evt.progress)
          if (evt.status) setStatusMsg(evt.status)
        },

        onDone: async (done) => {
          setProgress(100)
          setWsConnected(false)
          if (done.status === 'error' || done.status === 'timeout') {
            setPhase('error')
            setErr(done.error || 'Scan failed on server. Check backend logs.')
            return
          }
          if (done.results) {
            setResults(done.results)
            setPhase('done')
          } else {
            // Worker finished but results weren't bundled in the done event —
            // fetch them from the threats endpoint.
            try {
              const threatData = await api.listThreats({ scan_id: res.scan_id, limit: 200 })
              setResults({ threats: threatData.threats || [], threats_found: threatData.total || 0 })
            } catch { /* silent */ }
            setPhase('done')
          }
        },

        onConnectionChange: (ok) => setWsConnected(ok),
        onReconnect: (attempt) => setReconnect(attempt),
      })
    } catch (e) {
      setErr(friendlyError(e.message)); setPhase('error')
    }
  }, [brand, domain, maxPerm])  // eslint-disable-line react-hooks/exhaustive-deps

  const handleTakedown = async (threat) =>
    api.fileTakedown({
      brand: brand.trim(), scan_id: scanId,
      threat_url: threat.url || threat.domain || threat.profile_url,
      threat_type: threat.type === 'twitter' ? 'x' : (threat.type || threat.platform || 'domain'),
      severity: threat.severity || 'medium',
    })

  const allThreats = results ? [
    // Full scan: results.domain_results = { threats: [...] }
    ...((results.domain_results?.threats || results.domain_results || results.threats || [])).map(d => ({
      ...d,
      severity: d.severity || d.risk_level || (d.threat_engine?.risk_level) || 'low',
      type: 'domain',
    })),
    ...((results.social_results?.threats || results.social_results || [])).map(s => ({
      ...s,
      severity: s.severity || s.risk_level || 'low',
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
            {/* Brand name with suggestions */}
            <div style={{ position: 'relative' }}>
              <label style={{ fontSize: 10, color: '#5c5880', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                Brand Name *
              </label>
              <input
                ref={brandRef}
                className="input-cyber" placeholder="e.g. mamaearth"
                value={brand}
                onChange={e => { setBrand(e.target.value); setShowSuggestions(true) }}
                onKeyDown={e => e.key === 'Enter' && launch()}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                autoComplete="off"
              />
              {showSuggestions && suggestions.length > 0 && (
                <div style={{
                  position: 'absolute', top: '100%', left: 0, right: 0,
                  background: '#13131f', border: '1px solid #2a2a4a',
                  borderRadius: 8, zIndex: 100, overflow: 'hidden', marginTop: 2,
                }}>
                  {suggestions.map(s => (
                    <div
                      key={s.name}
                      onMouseDown={() => {
                        setBrand(s.name)
                        setDomain(s.domain)
                        setDomainAutoFilled(false)
                        setShowSuggestions(false)
                      }}
                      style={{
                        padding: '10px 14px', cursor: 'pointer',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        fontSize: 13, color: '#f1f0ff', transition: 'background 0.1s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#1a1a2e'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <span>{s.name}</span>
                      <span style={{ color: '#5c5880', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}>{s.domain}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Domain with auto-fill indicator */}
            <div>
              <label style={{ fontSize: 10, color: '#5c5880', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                Domain <span style={{ color: '#3a3a5c', textTransform: 'lowercase', letterSpacing: 0 }}>(optional)</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  className="input-cyber" placeholder="nykaa.com (auto-filled)"
                  value={domain}
                  onChange={handleDomainChange}
                  style={{ paddingRight: domainAutoFilled ? 60 : undefined }}
                />
                {domainAutoFilled && (
                  <span style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    fontSize: 11, color: '#10b981', fontFamily: 'JetBrains Mono, monospace',
                    pointerEvents: 'none',
                  }}>
                    auto ✓
                  </span>
                )}
              </div>
              <p style={{ fontSize: 11, color: '#3a3a5c', margin: '4px 0 0' }}>
                Leave blank to auto-detect from brand name
              </p>
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
              {friendlyError(err)}
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
          <div className="card" style={{ marginBottom: 20, overflow: 'hidden' }}>
            <ScanProgressBar
              progress={progress}
              phase={phase}
              connected={wsConnected}
              reconnectAttempt={reconnectAttempt}
            />
            {statusMsg && (
              <div style={{
                padding: '0 24px 14px',
                fontSize: 11, color: '#5c5880', fontFamily: 'JetBrains Mono, monospace',
              }}>
                {statusMsg}
              </div>
            )}
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
                <button className="btn-ghost" onClick={() => { wsCtrlRef.current?.close(); setPhase('idle'); setLogs([]); setResults(null); setWsConnected(null); setReconnect(0) }}>
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
