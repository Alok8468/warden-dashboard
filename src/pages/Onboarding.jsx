import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Shield, ChevronRight, ChevronLeft, Check,
  Globe, Bell, Zap, Loader2, AlertTriangle,
} from 'lucide-react'
import { api } from '../api/client'

// ── Constants ─────────────────────────────────────────────────────────────────

const INDUSTRIES = ['D2C', 'Fintech', 'FMCG', 'Creator', 'Healthcare', 'EdTech', 'Other']

const PLATFORMS = [
  { key: 'google',    label: 'Google',    emoji: '🔍' },
  { key: 'instagram', label: 'Instagram', emoji: '📷' },
  { key: 'twitter',   label: 'X / Twitter', emoji: '𝕏' },
  { key: 'facebook',  label: 'Facebook',  emoji: '👤' },
  { key: 'youtube',   label: 'YouTube',   emoji: '▶' },
  { key: 'tiktok',    label: 'TikTok',    emoji: '🎵' },
  { key: 'telegram',  label: 'Telegram',  emoji: '✈️' },
  { key: 'amazon',    label: 'Amazon',    emoji: '📦' },
  { key: 'linkedin',  label: 'LinkedIn',  emoji: '💼' },
  { key: 'flipkart',  label: 'Flipkart',  emoji: '🛍️' },
  { key: 'meesho',    label: 'Meesho',    emoji: '🏪' },
  { key: 'darkweb',   label: 'Dark Web',  emoji: '🕸️' },
]

const STEP_LABELS = ['Brand Details', 'Platforms', 'Alert Setup', 'Launch']

// ── Helpers ───────────────────────────────────────────────────────────────────

function sanitizeDomain(raw) {
  return raw
    .trim()
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .split('/')[0]
    .toLowerCase()
}

function inputStyle(focus) {
  return {
    width: '100%', padding: '10px 14px', borderRadius: 8, fontSize: 13,
    background: '#1a1a2e',
    border: `1px solid ${focus ? '#7c3aed' : '#2a2a4a'}`,
    boxShadow: focus ? '0 0 0 3px rgba(124,58,237,0.15)' : 'none',
    color: '#f1f0ff', outline: 'none', transition: 'all 0.2s',
    boxSizing: 'border-box',
  }
}

function useFocusStyle() {
  const [focus, setFocus] = useState(false)
  return [focus, { onFocus: () => setFocus(true), onBlur: () => setFocus(false) }]
}

// ── Step indicator ────────────────────────────────────────────────────────────

function Steps({ current }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 36 }}>
      {STEP_LABELS.map((label, i) => {
        const done   = i < current
        const active = i === current
        return (
          <div key={label} style={{ display: 'flex', alignItems: 'center', flex: i < STEP_LABELS.length - 1 ? 1 : 'none' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, flexShrink: 0 }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: done ? '#7c3aed' : active ? 'rgba(124,58,237,0.2)' : '#1a1a2e',
                border: `2px solid ${done || active ? '#7c3aed' : '#2a2a4a'}`,
                color: done ? '#fff' : active ? '#a855f7' : '#5c5880',
                fontSize: 12, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace',
                transition: 'all 0.3s',
              }}>
                {done ? <Check size={14} /> : i + 1}
              </div>
              <span style={{
                fontSize: 10, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.08em',
                color: active ? '#a855f7' : done ? '#7c3aed' : '#5c5880',
                whiteSpace: 'nowrap',
              }}>
                {label.toUpperCase()}
              </span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div style={{
                flex: 1, height: 2, margin: '0 8px', marginBottom: 22,
                background: done ? '#7c3aed' : '#2a2a4a',
                transition: 'background 0.3s',
              }} />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Step 1: Brand Details ──────────────────────────────────────────────────────

function StepBrand({ data, onChange, onNext }) {
  const [errs, setErrs] = useState({})
  const [fName, fNameHandlers]       = useFocusStyle()
  const [fDomain, fDomainHandlers]   = useFocusStyle()
  const [fLogo, fLogoHandlers]       = useFocusStyle()

  const validate = () => {
    const e = {}
    if (!data.name.trim())   e.name   = 'Brand name is required'
    if (!data.domain.trim()) e.domain = 'Domain is required'
    setErrs(e)
    return Object.keys(e).length === 0
  }

  const handleNext = () => {
    if (validate()) onNext()
  }

  const setField = (k) => (e) => onChange({ ...data, [k]: e.target.value })
  const handleDomainBlur = (e) => {
    fDomainHandlers.onBlur(e)
    if (data.domain) onChange({ ...data, domain: sanitizeDomain(data.domain) })
  }

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h2 style={{
          fontFamily: 'JetBrains Mono, monospace', fontSize: 18, fontWeight: 700,
          color: '#f1f0ff', margin: '0 0 8px', letterSpacing: '0.05em',
        }}>
          Tell us about your brand
        </h2>
        <p style={{ color: '#5c5880', fontSize: 13, margin: 0 }}>
          We'll use this to generate permutations and scan for threats across the internet.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        {/* Brand Name */}
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={{ fontSize: 10, color: '#5c5880', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
            Brand Name *
          </label>
          <input
            placeholder="e.g. Nykaa"
            value={data.name}
            onChange={setField('name')}
            style={inputStyle(fName)}
            {...fNameHandlers}
          />
          {errs.name && <p style={{ color: '#ef4444', fontSize: 11, margin: '4px 0 0' }}>{errs.name}</p>}
        </div>

        {/* Domain */}
        <div>
          <label style={{ fontSize: 10, color: '#5c5880', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
            Website Domain *
          </label>
          <input
            placeholder="nykaa.com"
            value={data.domain}
            onChange={setField('domain')}
            onBlur={handleDomainBlur}
            onFocus={fDomainHandlers.onFocus}
            style={inputStyle(fDomain)}
          />
          {errs.domain && <p style={{ color: '#ef4444', fontSize: 11, margin: '4px 0 0' }}>{errs.domain}</p>}
          <p style={{ fontSize: 10, color: '#5c5880', margin: '4px 0 0' }}>
            Without http:// or www — e.g. nykaa.com
          </p>
        </div>

        {/* Industry */}
        <div>
          <label style={{ fontSize: 10, color: '#5c5880', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
            Industry
          </label>
          <select
            value={data.industry}
            onChange={setField('industry')}
            style={{ ...inputStyle(false), appearance: 'none' }}
          >
            {INDUSTRIES.map(i => <option key={i} value={i} style={{ background: '#1a1a2e' }}>{i}</option>)}
          </select>
        </div>

        {/* Logo URL */}
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={{ fontSize: 10, color: '#5c5880', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
            Logo URL <span style={{ color: '#3a3060' }}>(optional)</span>
          </label>
          <input
            placeholder="https://nykaa.com/logo.png"
            value={data.logoUrl}
            onChange={setField('logoUrl')}
            style={inputStyle(fLogo)}
            {...fLogoHandlers}
          />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 28 }}>
        <button
          className="btn-primary"
          onClick={handleNext}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 24px' }}
        >
          Next: Platforms <ChevronRight size={15} />
        </button>
      </div>
    </div>
  )
}

// ── Step 2: Platform Selection ────────────────────────────────────────────────

function StepPlatforms({ selected, onChange, onNext, onBack }) {
  const toggle = (key) => {
    onChange(
      selected.includes(key)
        ? selected.filter(k => k !== key)
        : [...selected, key]
    )
  }

  const selectAll = () => {
    onChange(selected.length === PLATFORMS.length ? [] : PLATFORMS.map(p => p.key))
  }

  const canNext = selected.length >= 3

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h2 style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 18, fontWeight: 700, color: '#f1f0ff', margin: '0 0 8px', letterSpacing: '0.05em' }}>
          Where should we scan?
        </h2>
        <p style={{ color: '#5c5880', fontSize: 13, margin: 0 }}>
          Select the platforms to monitor for brand impersonation.
          <span style={{ color: '#f59e0b', marginLeft: 6 }}>Select at least 3.</span>
        </p>
      </div>

      {/* Select All */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#5c5880', letterSpacing: '0.1em' }}>
          {selected.length} / {PLATFORMS.length} SELECTED
        </span>
        <button
          className="btn-outline"
          onClick={selectAll}
          style={{ fontSize: 11, padding: '5px 14px' }}
        >
          {selected.length === PLATFORMS.length ? 'Deselect All' : 'Select All'}
        </button>
      </div>

      {/* Platform grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 24 }}>
        {PLATFORMS.map(p => {
          const on = selected.includes(p.key)
          return (
            <button
              key={p.key}
              onClick={() => toggle(p.key)}
              style={{
                padding: '14px 8px', borderRadius: 10, cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                background: on ? 'rgba(124,58,237,0.12)' : 'rgba(26,26,46,0.5)',
                border: `1.5px solid ${on ? '#7c3aed' : '#2a2a4a'}`,
                color: on ? '#a855f7' : '#5c5880',
                fontSize: 11, fontFamily: 'JetBrains Mono, monospace',
                transition: 'all 0.15s',
                outline: 'none',
              }}
              onMouseEnter={e => { if (!on) e.currentTarget.style.borderColor = '#7c3aed44' }}
              onMouseLeave={e => { if (!on) e.currentTarget.style.borderColor = '#2a2a4a' }}
            >
              <span style={{ fontSize: 20 }}>{p.emoji}</span>
              <span style={{ fontSize: 10, letterSpacing: '0.05em' }}>{p.label}</span>
              {on && (
                <div style={{
                  width: 16, height: 16, borderRadius: '50%', background: '#7c3aed',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Check size={10} color="#fff" />
                </div>
              )}
            </button>
          )
        })}
      </div>

      {!canNext && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 8, marginBottom: 16,
          background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', color: '#f59e0b', fontSize: 12,
        }}>
          <AlertTriangle size={13} /> Select at least 3 platforms to continue
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button className="btn-outline" onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ChevronLeft size={14} /> Back
        </button>
        <button
          className="btn-primary"
          onClick={onNext}
          disabled={!canNext}
          style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: canNext ? 1 : 0.4 }}
        >
          Next: Alert Setup <ChevronRight size={15} />
        </button>
      </div>
    </div>
  )
}

// ── Step 3: Alert Setup ────────────────────────────────────────────────────────

function StepAlerts({ data, onChange, onNext, onBack }) {
  const [fPhone, fPhoneHandlers] = useFocusStyle()
  const [fEmail, fEmailHandlers] = useFocusStyle()

  const setField = (k) => (e) => onChange({ ...data, [k]: e.target.value })

  const FREQS = ['Immediate', 'Hourly', 'Daily']

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 18, fontWeight: 700, color: '#f1f0ff', margin: '0 0 8px', letterSpacing: '0.05em' }}>
          How should we alert you?
        </h2>
        <p style={{ color: '#5c5880', fontSize: 13, margin: 0 }}>
          Get instant WhatsApp notifications when Warden.AI detects threats.
        </p>
      </div>

      {/* WhatsApp */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontSize: 10, color: '#5c5880', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
          📱 WhatsApp Number
        </label>
        <input
          placeholder="+919876543210"
          value={data.phone}
          onChange={setField('phone')}
          style={{ ...inputStyle(fPhone), fontFamily: 'JetBrains Mono, monospace' }}
          {...fPhoneHandlers}
        />
        <p style={{ fontSize: 10, color: '#5c5880', margin: '4px 0 0' }}>
          E.164 format — you'll get a WhatsApp message when threats are found
        </p>
      </div>

      {/* Email */}
      <div style={{ marginBottom: 24 }}>
        <label style={{ fontSize: 10, color: '#5c5880', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
          ✉️ Email Address
        </label>
        <input
          type="email"
          placeholder="you@company.com"
          value={data.email}
          onChange={setField('email')}
          style={inputStyle(fEmail)}
          {...fEmailHandlers}
        />
      </div>

      {/* Threshold slider */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <label style={{ fontSize: 10, color: '#5c5880', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            🎯 Alert Threshold
          </label>
          <span style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 700,
            color: data.threshold >= 8 ? '#ef4444' : data.threshold >= 6 ? '#f59e0b' : '#10b981',
          }}>
            ≥ {data.threshold}/10
          </span>
        </div>
        <input
          type="range" min={1} max={10} step={1}
          value={data.threshold}
          onChange={e => onChange({ ...data, threshold: parseInt(e.target.value) })}
          style={{ width: '100%', accentColor: '#7c3aed', cursor: 'pointer' }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#5c5880', marginTop: 4 }}>
          <span>1 — All threats</span>
          <span style={{ color: '#a8a4c8', fontSize: 11 }}>
            Alert me when threat score ≥ {data.threshold}
          </span>
          <span>10 — Critical only</span>
        </div>
      </div>

      {/* Frequency */}
      <div style={{ marginBottom: 28 }}>
        <label style={{ fontSize: 10, color: '#5c5880', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 10 }}>
          ⏱ Alert Frequency
        </label>
        <div style={{ display: 'flex', gap: 8 }}>
          {FREQS.map(f => (
            <button
              key={f}
              onClick={() => onChange({ ...data, frequency: f })}
              style={{
                flex: 1, padding: '9px 0', borderRadius: 8, cursor: 'pointer',
                fontSize: 12, fontFamily: 'JetBrains Mono, monospace', fontWeight: 600,
                background: data.frequency === f ? 'rgba(124,58,237,0.15)' : '#1a1a2e',
                border: `1.5px solid ${data.frequency === f ? '#7c3aed' : '#2a2a4a'}`,
                color: data.frequency === f ? '#a855f7' : '#5c5880',
                transition: 'all 0.15s',
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <button className="btn-outline" onClick={onBack} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ChevronLeft size={14} /> Back
        </button>
        <button
          className="btn-primary"
          onClick={onNext}
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
        >
          Next: Launch <ChevronRight size={15} />
        </button>
      </div>
    </div>
  )
}

// ── Step 4: Launch ─────────────────────────────────────────────────────────────

function StepLaunch({ brand, platforms, alerts, onBack }) {
  const navigate  = useNavigate()
  const [status,  setStatus]  = useState('idle')   // idle | launching | done | error
  const [log,     setLog]     = useState([])
  const [errMsg,  setErrMsg]  = useState('')

  const addLog = (msg, color = '#a855f7') =>
    setLog(prev => [...prev, { msg, color, time: new Date().toLocaleTimeString('en-IN', { hour12: false }) }])

  const launch = useCallback(async () => {
    setStatus('launching')
    setLog([])
    setErrMsg('')

    try {
      // Step 1 — Create brand
      addLog('> Creating brand profile...')
      let brandId = null
      try {
        const b = await api.createBrand({ name: brand.name, domain: brand.domain })
        brandId = b.id || b.brand_id
        addLog(`> Brand created: ${brand.name} (${brand.domain})`, '#10b981')
      } catch (e) {
        addLog(`> Brand note: ${e.message}`, '#f59e0b')
        // Continue — brand might already exist
      }

      // Step 2 — Register alert recipient
      if (alerts.phone?.trim()) {
        addLog('> Registering WhatsApp alert recipient...')
        try {
          await api.addRecipient(alerts.phone.trim(), brand.name)
          addLog(`> WhatsApp alerts enabled for ${alerts.phone}`, '#10b981')
        } catch {
          addLog('> Alert setup skipped (configure in Alerts page)', '#f59e0b')
        }
      }

      // Step 3 — Launch full scan
      addLog(`> Generating domain permutations for ${brand.domain}...`)
      addLog('> Connecting to 7 monitoring platforms...')

      const scanRes = await api.scanFull(brand.name, brand.domain, 100)
      const scanId  = scanRes.scan_id

      addLog(`> ⚡ SCAN LAUNCHED — ID: ${scanId.slice(0, 12)}`, '#f59e0b')
      addLog('> Streaming threat intelligence...', '#a855f7')

      // Step 4 — Watch progress via SSE (up to 15s then proceed)
      await new Promise((resolve) => {
        const timeout = setTimeout(resolve, 15000)
        api.streamScan(
          scanId,
          (data) => {
            if (data.message) addLog(`> ${data.message}`, '#5c5880')
          },
          (done) => {
            clearTimeout(timeout)
            if (done.results) {
              const t = done.results?.domain_results?.threats?.length
                     ?? done.results?.threats?.length ?? 0
              addLog(`> Scan complete — ${t} threats found`, t > 0 ? '#ef4444' : '#10b981')
            }
            resolve()
          },
        )
      })

      addLog('> ✅ Protection activated. Redirecting to dashboard...', '#10b981')
      setStatus('done')

      setTimeout(() => {
        navigate('/dashboard', { state: { toast: `🛡️ ${brand.name} is now protected!` } })
      }, 1400)

    } catch (e) {
      setErrMsg(e.message || 'Launch failed')
      addLog(`> ✗ Error: ${e.message}`, '#ef4444')
      setStatus('error')
    }
  }, [brand, alerts, navigate])

  const selectedPlatforms = PLATFORMS.filter(p => platforms.includes(p.key))

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 18, fontWeight: 700, color: '#f1f0ff', margin: '0 0 8px', letterSpacing: '0.05em' }}>
          Ready to launch
        </h2>
        <p style={{ color: '#5c5880', fontSize: 13, margin: 0 }}>
          Review your configuration and start your first scan.
        </p>
      </div>

      {/* Summary card */}
      <div className="card" style={{ padding: 20, marginBottom: 20, borderTop: '2px solid #7c3aed' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <div style={{ fontSize: 10, color: '#5c5880', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>Brand</div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 14, color: '#f1f0ff', fontWeight: 700 }}>{brand.name}</div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: '#5c5880', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>Domain</div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 14, color: '#a855f7' }}>{brand.domain}</div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: '#5c5880', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>
              Platforms ({selectedPlatforms.length})
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {selectedPlatforms.map(p => (
                <span key={p.key} style={{
                  padding: '2px 8px', borderRadius: 100, fontSize: 10,
                  background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.25)',
                  color: '#a855f7', fontFamily: 'JetBrains Mono, monospace',
                }}>{p.emoji} {p.label}</span>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 10, color: '#5c5880', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>Alerts</div>
            <div style={{ fontSize: 12, color: '#f1f0ff' }}>
              {alerts.phone ? `📱 ${alerts.phone}` : '—'}
              {alerts.email ? <div>✉️ {alerts.email}</div> : null}
              <div style={{ color: '#5c5880', fontSize: 11, marginTop: 2 }}>Score ≥ {alerts.threshold} · {alerts.frequency}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Terminal log */}
      {log.length > 0 && (
        <div className="terminal" style={{ height: 160, overflowY: 'auto', marginBottom: 20 }}>
          {log.map((l, i) => (
            <div key={i} style={{ color: l.color, fontFamily: 'JetBrains Mono, monospace', fontSize: 12, lineHeight: 1.8 }}>
              <span style={{ color: '#3a3060' }}>[{l.time}] </span>{l.msg}
            </div>
          ))}
          {status === 'launching' && (
            <span style={{ color: '#a855f7', display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'JetBrains Mono, monospace', fontSize: 12 }}>
              <Loader2 size={11} style={{ animation: 'spin 1s linear infinite' }} /> Processing...
            </span>
          )}
        </div>
      )}

      {/* Error */}
      {status === 'error' && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px',
          borderRadius: 8, marginBottom: 16,
          background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', fontSize: 12,
        }}>
          <AlertTriangle size={13} /> {errMsg}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          className="btn-outline"
          onClick={onBack}
          disabled={status === 'launching' || status === 'done'}
          style={{ display: 'flex', alignItems: 'center', gap: 8, opacity: status !== 'idle' && status !== 'error' ? 0.4 : 1 }}
        >
          <ChevronLeft size={14} /> Back
        </button>

        <button
          onClick={launch}
          disabled={status === 'launching' || status === 'done'}
          style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '13px 32px', borderRadius: 10, cursor: 'pointer', fontSize: 14,
            fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, letterSpacing: '0.06em',
            background: status === 'done'
              ? 'rgba(16,185,129,0.15)'
              : 'linear-gradient(135deg, #7c3aed, #4f46e5)',
            border: status === 'done' ? '1px solid rgba(16,185,129,0.4)' : 'none',
            color: status === 'done' ? '#10b981' : '#fff',
            boxShadow: status === 'done' ? 'none' : '0 0 30px rgba(124,58,237,0.4)',
            opacity: status === 'launching' ? 0.7 : 1,
            transition: 'all 0.3s',
          }}
        >
          {status === 'done' ? (
            <><Check size={16} /> Protected!</>
          ) : status === 'launching' ? (
            <><Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> Launching…</>
          ) : (
            <><Zap size={16} /> 🛡️ Start Protecting Now</>
          )}
        </button>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function Onboarding() {
  const [step, setStep] = useState(0)

  const [brand, setBrand] = useState({
    name: '', domain: '', industry: 'D2C', logoUrl: '',
  })

  const [platforms, setPlatforms] = useState([
    'google', 'instagram', 'twitter', 'amazon',
  ])

  const [alerts, setAlerts] = useState({
    phone: '', email: '', threshold: 7, frequency: 'Immediate',
  })

  return (
    <div style={{
      minHeight: '100vh', background: '#0d0d14', color: '#f1f0ff',
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      padding: '48px 24px',
    }}>
      <div style={{ width: '100%', maxWidth: 640 }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 36 }}>
          <div style={{
            width: 42, height: 42, borderRadius: 12, flexShrink: 0,
            background: 'linear-gradient(135deg, rgba(124,58,237,0.3), rgba(76,29,149,0.5))',
            border: '1px solid rgba(124,58,237,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px rgba(124,58,237,0.2)',
          }}>
            <Shield size={22} color="#a855f7" />
          </div>
          <div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: 16, letterSpacing: '0.1em' }}>
              <span style={{ color: '#f1f0ff' }}>WARDEN</span>
              <span style={{ color: '#a855f7' }}>.AI</span>
            </div>
            <div style={{ fontSize: 11, color: '#5c5880', letterSpacing: '0.05em', marginTop: 2 }}>
              Brand Protection Setup
            </div>
          </div>
        </div>

        {/* Steps indicator */}
        <Steps current={step} />

        {/* Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.2 }}
            className="card"
            style={{ padding: '28px 32px' }}
          >
            {step === 0 && (
              <StepBrand
                data={brand}
                onChange={setBrand}
                onNext={() => setStep(1)}
              />
            )}
            {step === 1 && (
              <StepPlatforms
                selected={platforms}
                onChange={setPlatforms}
                onNext={() => setStep(2)}
                onBack={() => setStep(0)}
              />
            )}
            {step === 2 && (
              <StepAlerts
                data={alerts}
                onChange={setAlerts}
                onNext={() => setStep(3)}
                onBack={() => setStep(1)}
              />
            )}
            {step === 3 && (
              <StepLaunch
                brand={brand}
                platforms={platforms}
                alerts={alerts}
                onBack={() => setStep(2)}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Skip link */}
        {step < 3 && (
          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <a
              href="/dashboard"
              style={{ color: '#3a3060', fontSize: 12, textDecoration: 'none' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#5c5880' }}
              onMouseLeave={e => { e.currentTarget.style.color = '#3a3060' }}
            >
              Skip for now → go to dashboard
            </a>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}
