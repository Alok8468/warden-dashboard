import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User, Mail, Key, Bell, CreditCard, Trash2,
  Copy, RefreshCw, Plus, Eye, EyeOff, Check,
  AlertTriangle, Shield, Zap, ChevronRight,
} from 'lucide-react'

const BASE = 'http://localhost:8000'

function authHeaders() {
  const token = localStorage.getItem('warden_token')
  return { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ msg, type = 'success', onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t) }, [])
  const bg = type === 'success' ? 'rgba(16,185,129,0.15)' : type === 'error' ? 'rgba(239,68,68,0.15)' : 'rgba(124,58,237,0.15)'
  const color = type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#a855f7'
  const border = type === 'success' ? 'rgba(16,185,129,0.3)' : type === 'error' ? 'rgba(239,68,68,0.3)' : 'rgba(124,58,237,0.3)'
  return (
    <motion.div
      initial={{ opacity: 0, y: -12, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8 }}
      style={{
        position: 'fixed', top: 20, right: 20, zIndex: 9999,
        padding: '12px 20px', borderRadius: 10,
        background: bg, border: `1px solid ${border}`,
        color, fontSize: 13, fontWeight: 600,
        display: 'flex', alignItems: 'center', gap: 8,
        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      }}
    >
      {type === 'success' ? <Check size={14} /> : <AlertTriangle size={14} />}
      {msg}
    </motion.div>
  )
}

// ── Section wrapper ───────────────────────────────────────────────────────────
function Section({ title, subtitle, icon: Icon, children, danger = false }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="card"
      style={{
        marginBottom: 20,
        border: danger ? '1px solid rgba(239,68,68,0.25)' : undefined,
      }}
    >
      <div style={{
        padding: '18px 24px 14px',
        borderBottom: `1px solid ${danger ? 'rgba(239,68,68,0.15)' : '#2a2a4a'}`,
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <div style={{
          width: 34, height: 34, borderRadius: 8, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: danger ? 'rgba(239,68,68,0.1)' : 'rgba(124,58,237,0.1)',
          border: `1px solid ${danger ? 'rgba(239,68,68,0.25)' : 'rgba(124,58,237,0.2)'}`,
        }}>
          <Icon size={16} color={danger ? '#ef4444' : '#a855f7'} />
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 700, color: danger ? '#ef4444' : '#f1f0ff' }}>{title}</div>
          {subtitle && <div style={{ fontSize: 11, color: '#5c5880', marginTop: 1 }}>{subtitle}</div>}
        </div>
      </div>
      <div style={{ padding: '20px 24px' }}>{children}</div>
    </motion.div>
  )
}

// ── Input field ───────────────────────────────────────────────────────────────
function Field({ label, value, onChange, type = 'text', placeholder, disabled, hint, suffix }) {
  const [show, setShow] = useState(false)
  const isPass = type === 'password'
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 10, fontWeight: 600, color: '#5c5880', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 6 }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <input
          type={isPass ? (show ? 'text' : 'password') : type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          style={{
            width: '100%', padding: suffix ? '10px 44px 10px 14px' : '10px 14px',
            background: disabled ? 'rgba(26,26,46,0.4)' : 'rgba(26,26,46,0.8)',
            border: '1px solid #2a2a4a', borderRadius: 8,
            color: disabled ? '#5c5880' : '#f1f0ff',
            fontSize: 13, outline: 'none',
            transition: 'border-color 0.2s, box-shadow 0.2s',
            boxSizing: 'border-box',
            cursor: disabled ? 'not-allowed' : 'text',
          }}
          onFocus={e => { if (!disabled) { e.target.style.borderColor = '#7c3aed'; e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.12)' } }}
          onBlur={e => { e.target.style.borderColor = '#2a2a4a'; e.target.style.boxShadow = 'none' }}
        />
        {isPass && (
          <button type="button" onClick={() => setShow(s => !s)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#5c5880', padding: 0 }}>
            {show ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        )}
        {suffix && !isPass && (
          <span style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 11, color: '#5c5880' }}>{suffix}</span>
        )}
      </div>
      {hint && <div style={{ fontSize: 11, color: '#5c5880', marginTop: 5 }}>{hint}</div>}
    </div>
  )
}

// ── Toggle switch ─────────────────────────────────────────────────────────────
function Toggle({ checked, onChange, label, desc }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(42,42,74,0.5)' }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#f1f0ff' }}>{label}</div>
        {desc && <div style={{ fontSize: 11, color: '#5c5880', marginTop: 2 }}>{desc}</div>}
      </div>
      <button
        onClick={() => onChange(!checked)}
        style={{
          width: 44, height: 24, borderRadius: 12, border: 'none', cursor: 'pointer',
          background: checked ? 'linear-gradient(135deg, #7c3aed, #6d28d9)' : '#2a2a4a',
          position: 'relative', transition: 'background 0.2s', flexShrink: 0,
          boxShadow: checked ? '0 0 12px rgba(124,58,237,0.4)' : 'none',
        }}
      >
        <span style={{
          position: 'absolute', top: 3, left: checked ? 22 : 3,
          width: 18, height: 18, borderRadius: '50%',
          background: 'white', transition: 'left 0.2s',
          boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
        }} />
      </button>
    </div>
  )
}

// ── Plan badge ────────────────────────────────────────────────────────────────
const PLAN_CONFIG = {
  free:       { color: '#5c5880', bg: 'rgba(92,88,128,0.12)', label: 'Free',       price: '₹0/mo' },
  starter:    { color: '#10b981', bg: 'rgba(16,185,129,0.12)', label: 'Starter',   price: '₹25,000/mo' },
  growth:     { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', label: 'Growth',    price: '₹1,00,000/mo' },
  enterprise: { color: '#a855f7', bg: 'rgba(168,85,247,0.12)', label: 'Enterprise', price: '₹3,00,000+/mo' },
  creator:    { color: '#3b82f6', bg: 'rgba(59,130,246,0.12)', label: 'Creator',   price: '₹999/mo' },
}

// ─────────────────────────────────────────────────────────────────────────────
export default function Settings() {
  const [toast, setToast]   = useState(null)
  const [user,  setUser]    = useState(null)

  // Profile
  const [name,     setName]     = useState('')
  const [savingP,  setSavingP]  = useState(false)

  // API Keys
  const [keys,      setKeys]     = useState([])
  const [keyName,   setKeyName]  = useState('')
  const [newKey,    setNewKey]   = useState(null)   // raw key shown once
  const [creatingK, setCreatingK] = useState(false)
  const [loadingK,  setLoadingK]  = useState(false)
  const [copiedId,  setCopiedId]  = useState(null)

  // Notifications (localStorage)
  const [notifs, setNotifs] = useState(() => {
    try { return JSON.parse(localStorage.getItem('warden_notifs') || '{}') } catch { return {} }
  })

  // Danger zone
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [deleting,      setDeleting]      = useState(false)

  const toast$ = (msg, type = 'success') => setToast({ msg, type, id: Date.now() })

  // ── Load user ──────────────────────────────────────────────────────────────
  useEffect(() => {
    const stored = localStorage.getItem('warden_user')
    if (stored) {
      try {
        const u = JSON.parse(stored)
        setUser(u)
        setName(u.full_name || u.name || '')
      } catch { /* ignore */ }
    }
    // Always fetch fresh from API
    fetch(`${BASE}/auth/me`, { headers: authHeaders() })
      .then(r => r.ok ? r.json() : null)
      .then(u => { if (u) { setUser(u); setName(u.full_name || '') } })
      .catch(() => {})
  }, [])

  // ── Load API keys ──────────────────────────────────────────────────────────
  const loadKeys = async () => {
    setLoadingK(true)
    try {
      const res = await fetch(`${BASE}/api/keys`, { headers: authHeaders() })
      if (res.ok) {
        const data = await res.json()
        setKeys(data.keys || [])
      }
    } catch { /* non-critical */ } finally { setLoadingK(false) }
  }

  useEffect(() => { loadKeys() }, [])

  // ── Save profile ───────────────────────────────────────────────────────────
  const saveProfile = async (e) => {
    e.preventDefault()
    if (!name.trim()) return toast$('Name cannot be empty', 'error')
    setSavingP(true)
    try {
      const res = await fetch(`${BASE}/auth/profile`, {
        method: 'PATCH',
        headers: authHeaders(),
        body: JSON.stringify({ full_name: name.trim() }),
      })
      if (res.ok) {
        const updated = { ...user, full_name: name.trim() }
        setUser(updated)
        localStorage.setItem('warden_user', JSON.stringify(updated))
        toast$('Profile updated successfully')
      } else {
        const err = await res.json().catch(() => ({}))
        toast$(err.detail || 'Update failed', 'error')
      }
    } catch { toast$('Network error', 'error') } finally { setSavingP(false) }
  }

  // ── Create API key ─────────────────────────────────────────────────────────
  const createKey = async (e) => {
    e.preventDefault()
    if (!keyName.trim()) return toast$('Enter a key name', 'error')
    setCreatingK(true)
    try {
      const res = await fetch(`${BASE}/api/keys`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ name: keyName.trim(), tier: 'free', rate_limit: 60 }),
      })
      if (res.ok) {
        const data = await res.json()
        setNewKey(data.raw_key)
        setKeyName('')
        await loadKeys()
        toast$('API key created — copy it now!')
      } else {
        const err = await res.json().catch(() => ({}))
        toast$(err.detail || 'Could not create key', 'error')
      }
    } catch { toast$('Network error', 'error') } finally { setCreatingK(false) }
  }

  // ── Revoke API key ─────────────────────────────────────────────────────────
  const revokeKey = async (id) => {
    if (!window.confirm('Revoke this API key? All apps using it will stop working.')) return
    try {
      const res = await fetch(`${BASE}/api/keys/${id}`, { method: 'DELETE', headers: authHeaders() })
      if (res.ok) { await loadKeys(); toast$('Key revoked') }
      else toast$('Failed to revoke key', 'error')
    } catch { toast$('Network error', 'error') }
  }

  // ── Copy to clipboard ──────────────────────────────────────────────────────
  const copy = (text, id) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 1500)
    })
  }

  // ── Save notification prefs ────────────────────────────────────────────────
  const setNotif = (key, val) => {
    const next = { ...notifs, [key]: val }
    setNotifs(next)
    localStorage.setItem('warden_notifs', JSON.stringify(next))
    toast$('Preference saved')
  }

  // ── Delete account ─────────────────────────────────────────────────────────
  const deleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') return toast$('Type DELETE to confirm', 'error')
    setDeleting(true)
    try {
      // In real implementation: call DELETE /auth/account
      // For now show a message
      toast$('In production this would delete your account.', 'info')
    } finally { setDeleting(false) }
  }

  const plan = user?.plan || 'free'
  const pc   = PLAN_CONFIG[plan] || PLAN_CONFIG.free

  return (
    <div className="page-enter dot-grid min-h-screen" style={{ padding: '24px 24px 48px' }}>

      <AnimatePresence>
        {toast && <Toast key={toast.id} msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
      </AnimatePresence>

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 20, fontWeight: 700, margin: 0, color: '#f1f0ff', letterSpacing: '0.05em' }}>
          SETTINGS
        </h1>
        <p style={{ color: '#5c5880', fontSize: 12, fontFamily: 'JetBrains Mono, monospace', margin: '4px 0 0' }}>
          Manage your account, API keys, and preferences
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 20 }} className="mobile-stack">

        {/* ── LEFT COLUMN ── */}
        <div>

          {/* Profile */}
          <Section title="Profile" subtitle="Your name and email address" icon={User}>
            <form onSubmit={saveProfile}>
              <Field
                label="Full Name"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your full name"
              />
              <Field
                label="Email Address"
                value={user?.email || ''}
                type="email"
                disabled
                hint="Email cannot be changed. Contact support to update."
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
                <button type="submit" className="btn-primary" disabled={savingP} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {savingP ? <><RefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }} /> Saving...</> : <><Check size={13} /> Save Changes</>}
                </button>
              </div>
            </form>
          </Section>

          {/* Plan */}
          <Section title="Plan & Billing" subtitle="Your current subscription" icon={CreditCard}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '16px 20px', borderRadius: 10,
              background: pc.bg, border: `1px solid ${pc.color}30`,
              marginBottom: 16,
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{
                    padding: '3px 12px', borderRadius: 100, fontSize: 11,
                    fontWeight: 800, letterSpacing: '0.08em',
                    background: `${pc.color}20`, color: pc.color,
                    border: `1px solid ${pc.color}40`,
                    fontFamily: 'JetBrains Mono, monospace',
                  }}>{pc.label.toUpperCase()}</span>
                  {plan === 'enterprise' && (
                    <span style={{ fontSize: 11, color: '#10b981', fontWeight: 600 }}>● Active</span>
                  )}
                </div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 20, fontWeight: 700, color: pc.color, marginTop: 8 }}>
                  {pc.price}
                </div>
              </div>
              <Shield size={32} color={pc.color} style={{ opacity: 0.5 }} />
            </div>

            {/* Plan features */}
            <div style={{ marginBottom: 16 }}>
              {plan === 'enterprise' ? [
                'Unlimited brands monitored',
                'All 7 platforms',
                'Unlimited takedowns',
                'Dedicated AI agent',
                '24/7 support + SLA',
              ] : plan === 'growth' ? [
                '3 brands monitored',
                'All 7 platforms',
                'Unlimited takedowns',
                'Legal evidence packages',
              ] : [
                '1 brand monitored',
                '5 platforms',
                '20 takedowns/month',
                'Basic dashboard',
              ].map(f => (
                <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#a8a4c8', marginBottom: 6 }}>
                  <Check size={12} color="#10b981" /> {f}
                </div>
              ))}
            </div>

            {plan !== 'enterprise' && (
              <a href="/pricing" style={{ textDecoration: 'none' }}>
                <button className="btn-gold" style={{ width: '100%', justifyContent: 'center', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Zap size={14} /> Upgrade Plan <ChevronRight size={14} />
                </button>
              </a>
            )}
            {plan === 'enterprise' && (
              <div style={{ fontSize: 11, color: '#5c5880', textAlign: 'center' }}>
                Contact <span style={{ color: '#a855f7' }}>support@warden.ai</span> to manage your subscription
              </div>
            )}
          </Section>

        </div>

        {/* ── RIGHT COLUMN ── */}
        <div>

          {/* Notifications */}
          <Section title="Notification Preferences" subtitle="Choose how you want to be alerted" icon={Bell}>
            <Toggle
              label="WhatsApp Alerts"
              desc="Get instant WhatsApp messages when high-risk threats are found"
              checked={notifs.whatsapp !== false}
              onChange={v => setNotif('whatsapp', v)}
            />
            <Toggle
              label="Email Alerts"
              desc="Receive email notifications for new threats and takedown updates"
              checked={notifs.email !== false}
              onChange={v => setNotif('email', v)}
            />
            <Toggle
              label="Weekly Report"
              desc="Auto-send a weekly PDF summary to your email every Monday"
              checked={notifs.weekly_report === true}
              onChange={v => setNotif('weekly_report', v)}
            />
            <Toggle
              label="Scan Completed"
              desc="Notify when a scan finishes running"
              checked={notifs.scan_complete !== false}
              onChange={v => setNotif('scan_complete', v)}
            />
            <Toggle
              label="Takedown Confirmed"
              desc="Alert when a threat is successfully removed"
              checked={notifs.takedown_confirmed !== false}
              onChange={v => setNotif('takedown_confirmed', v)}
            />
            <div style={{ marginTop: 4 }} />
          </Section>

          {/* Account info */}
          <Section title="Account Details" subtitle="Your account identifiers" icon={Shield}>
            {[
              { label: 'User ID',   value: user?.id || '—' },
              { label: 'Tenant ID', value: user?.tenant_id || '—' },
              { label: 'Role',      value: user?.role || '—' },
              { label: 'Member since', value: user ? new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : '—' },
            ].map(r => (
              <div key={r.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(42,42,74,0.4)' }}>
                <span style={{ fontSize: 12, color: '#5c5880' }}>{r.label}</span>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#a8a4c8', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.value}</span>
              </div>
            ))}
          </Section>

        </div>
      </div>

      {/* ── API Keys — full width ── */}
      <Section title="API Keys" subtitle="Use these keys to access the Warden.AI API from your own applications" icon={Key}>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto', gap: 12, marginBottom: 20, alignItems: 'flex-end' }}>
          <Field
            label="New Key Name"
            value={keyName}
            onChange={e => setKeyName(e.target.value)}
            placeholder="e.g. Production App, CI Pipeline"
          />
          <button
            onClick={createKey}
            disabled={creatingK || !keyName.trim()}
            className="btn-primary"
            style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16, whiteSpace: 'nowrap' }}
          >
            {creatingK ? <RefreshCw size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Plus size={14} />}
            Generate Key
          </button>
        </div>

        {/* New key banner — shown once */}
        <AnimatePresence>
          {newKey && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{
                padding: '14px 18px', borderRadius: 10, marginBottom: 16,
                background: 'rgba(16,185,129,0.08)',
                border: '1px solid rgba(16,185,129,0.3)',
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 700, color: '#10b981', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Check size={12} /> KEY CREATED — COPY NOW. IT WON'T BE SHOWN AGAIN.
              </div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <code style={{
                  flex: 1, padding: '8px 12px', borderRadius: 6,
                  background: '#0d0d14', border: '1px solid #2a2a4a',
                  fontFamily: 'JetBrains Mono, monospace', fontSize: 12,
                  color: '#f1f0ff', wordBreak: 'break-all',
                }}>{newKey}</code>
                <button
                  onClick={() => copy(newKey, 'new')}
                  className="btn-outline"
                  style={{ display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap' }}
                >
                  {copiedId === 'new' ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
                  {copiedId === 'new' ? 'Copied!' : 'Copy'}
                </button>
                <button onClick={() => setNewKey(null)} className="btn-outline" style={{ fontSize: 11 }}>
                  Dismiss
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Keys table */}
        {loadingK ? (
          <div style={{ color: '#5c5880', fontSize: 12, padding: '12px 0' }}>Loading keys...</div>
        ) : keys.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '32px 0',
            color: '#5c5880', fontSize: 13,
          }}>
            <Key size={24} style={{ margin: '0 auto 10px', display: 'block', opacity: 0.3 }} />
            No API keys yet. Generate one above to get started.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="cyber-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Key Prefix</th>
                  <th>Tier</th>
                  <th>Rate Limit</th>
                  <th>Created</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {keys.map(k => (
                  <tr key={k.id}>
                    <td style={{ fontWeight: 600, color: '#f1f0ff' }}>{k.name || '—'}</td>
                    <td>
                      <code style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#a855f7', background: 'rgba(124,58,237,0.1)', padding: '2px 6px', borderRadius: 4 }}>
                        {k.key_prefix || (k.hashed_key || '').slice(0, 12) + '...'}
                      </code>
                    </td>
                    <td>
                      <span className="badge badge-purple" style={{ fontSize: 10 }}>{k.tier || 'free'}</span>
                    </td>
                    <td style={{ color: '#a8a4c8', fontSize: 12 }}>{k.rate_limit || 60}/min</td>
                    <td style={{ color: '#5c5880', fontSize: 11 }}>
                      {k.created_at ? new Date(k.created_at).toLocaleDateString('en-IN') : '—'}
                    </td>
                    <td>
                      <span style={{
                        padding: '2px 8px', borderRadius: 100, fontSize: 10, fontWeight: 600,
                        fontFamily: 'JetBrains Mono, monospace',
                        background: k.is_active !== false ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                        color:      k.is_active !== false ? '#10b981' : '#ef4444',
                        border:     `1px solid ${k.is_active !== false ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
                      }}>
                        {k.is_active !== false ? 'ACTIVE' : 'REVOKED'}
                      </span>
                    </td>
                    <td>
                      {k.is_active !== false && (
                        <button
                          onClick={() => revokeKey(k.id)}
                          className="btn-outline"
                          style={{ fontSize: 11, color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)', display: 'flex', alignItems: 'center', gap: 4 }}
                        >
                          <Trash2 size={11} /> Revoke
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div style={{ marginTop: 14, padding: '10px 14px', borderRadius: 8, background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.15)', fontSize: 11, color: '#5c5880' }}>
          Pass your API key in the <code style={{ color: '#a855f7' }}>X-API-Key</code> header.
          Base URL: <code style={{ color: '#a855f7' }}>http://localhost:8000</code>
        </div>
      </Section>

      {/* ── Danger Zone ── */}
      <Section title="Danger Zone" subtitle="Irreversible actions — proceed with caution" icon={AlertTriangle} danger>
        <div style={{
          display: 'grid', gridTemplateColumns: 'minmax(0,1fr) auto', gap: 16, alignItems: 'center',
          padding: '16px 20px', borderRadius: 10,
          background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.15)',
          marginBottom: 16,
        }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#f1f0ff', marginBottom: 4 }}>Delete Account</div>
            <div style={{ fontSize: 12, color: '#5c5880', lineHeight: 1.5 }}>
              Permanently delete your account, all brands, scans, threats, and evidence packages. This cannot be undone.
            </div>
          </div>
          <button
            onClick={() => setDeleteConfirm(deleteConfirm === null ? '' : null)}
            style={{
              padding: '8px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600,
              background: 'transparent', border: '1px solid rgba(239,68,68,0.4)',
              color: '#ef4444', cursor: 'pointer', whiteSpace: 'nowrap',
              display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            <Trash2 size={13} /> Delete Account
          </button>
        </div>

        <AnimatePresence>
          {deleteConfirm !== null && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ overflow: 'hidden' }}
            >
              <div style={{ padding: '16px 20px', borderRadius: 10, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}>
                <div style={{ fontSize: 12, color: '#ef4444', marginBottom: 12, fontWeight: 600 }}>
                  Type <strong>DELETE</strong> to confirm permanent account deletion:
                </div>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                  <input
                    value={deleteConfirm}
                    onChange={e => setDeleteConfirm(e.target.value)}
                    placeholder="Type DELETE"
                    style={{
                      flex: 1, padding: '9px 14px',
                      background: 'rgba(26,26,46,0.8)', border: '1px solid rgba(239,68,68,0.4)',
                      borderRadius: 8, color: '#ef4444', fontSize: 13, outline: 'none',
                    }}
                  />
                  <button
                    onClick={deleteAccount}
                    disabled={deleteConfirm !== 'DELETE' || deleting}
                    style={{
                      padding: '9px 20px', borderRadius: 8, fontSize: 13, fontWeight: 700,
                      background: deleteConfirm === 'DELETE' ? 'rgba(239,68,68,0.2)' : 'rgba(239,68,68,0.05)',
                      border: '1px solid rgba(239,68,68,0.4)',
                      color: '#ef4444', cursor: deleteConfirm === 'DELETE' ? 'pointer' : 'not-allowed',
                      display: 'flex', alignItems: 'center', gap: 6,
                    }}
                  >
                    <Trash2 size={13} /> Confirm Delete
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Section>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
