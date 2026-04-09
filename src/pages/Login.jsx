import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, Shield, Zap } from 'lucide-react'
import { setToken } from '../auth'

const BASE = 'http://localhost:8001'

const STATS = [
  { label: 'Brands Protected',    value: '2,400+' },
  { label: 'Threats Neutralized', value: '18,000+' },
  { label: 'Takedowns Filed',     value: '3,200+' },
]

export default function Login() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw]     = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const navigate = useNavigate()

  const fillDemo = () => { setEmail('demo@warden.ai'); setPassword('demo123') }

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const res = await fetch(`${BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Login failed')
      setToken(data.access_token)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      background: '#0d0d14', overflow: 'hidden',
    }}>
      {/* Left panel */}
      <div style={{
        flex: '0 0 58%', position: 'relative',
        background: 'linear-gradient(135deg, #0d0d14 0%, #12103a 50%, #0d0d14 100%)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '48px', overflow: 'hidden',
      }}
        className="hidden md:flex"
      >
        {/* Grid bg */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.4,
          backgroundImage: 'linear-gradient(rgba(124,58,237,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.08) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />

        {/* Floating particles */}
        {[...Array(8)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: 3 + (i % 3), height: 3 + (i % 3),
            borderRadius: '50%',
            background: i % 2 === 0 ? 'rgba(124,58,237,0.5)' : 'rgba(245,158,11,0.4)',
            left: `${10 + (i * 11) % 80}%`,
            top: `${5 + (i * 13) % 90}%`,
            animation: `float ${3 + (i % 3)}s ease-in-out infinite`,
            animationDelay: `${i * 0.4}s`,
          }} />
        ))}

        {/* Shield icon */}
        <motion.div
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            width: 100, height: 100, borderRadius: 24,
            background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(76,29,149,0.4))',
            border: '1px solid rgba(124,58,237,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 32, boxShadow: '0 0 60px rgba(124,58,237,0.3)',
          }}
        >
          <Shield size={48} color="#a855f7" />
        </motion.div>

        <div style={{ textAlign: 'center', marginBottom: 48, position: 'relative' }}>
          <h1 style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: 36,
            fontWeight: 700, margin: '0 0 12px', letterSpacing: '0.08em',
          }}>
            <span style={{ color: '#f1f0ff' }}>WARDEN</span>
            <span style={{ color: '#a855f7', textShadow: '0 0 20px rgba(168,85,247,0.5)' }}>.AI</span>
          </h1>
          <p style={{ color: '#a8a4c8', fontSize: 15, margin: '0 0 8px' }}>
            Defend your brand across every digital surface
          </p>
          <p style={{ color: '#5c5880', fontSize: 13 }}>
            AI-powered brand protection for India's leading companies
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 20 }}>
          {STATS.map(s => (
            <div key={s.label} style={{
              textAlign: 'center', padding: '16px 20px',
              background: 'rgba(124,58,237,0.06)',
              border: '1px solid rgba(124,58,237,0.15)',
              borderRadius: 12,
            }}>
              <div style={{
                fontFamily: 'JetBrains Mono, monospace', fontSize: 20,
                fontWeight: 700, color: '#a855f7',
                textShadow: '0 0 12px rgba(168,85,247,0.4)',
              }}>{s.value}</div>
              <div style={{ fontSize: 11, color: '#5c5880', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <motion.div
        initial={{ x: 60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 24 }}
        style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: '#13131f', padding: 32, position: 'relative',
        }}
      >
        <div style={{ width: '100%', maxWidth: 380 }}>
          {/* Mobile logo */}
          <div className="md:hidden" style={{ textAlign: 'center', marginBottom: 32 }}>
            <Shield size={40} color="#a855f7" style={{ margin: '0 auto 12px' }} />
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 20, fontWeight: 700 }}>
              <span style={{ color: '#f1f0ff' }}>WARDEN</span>
              <span style={{ color: '#a855f7' }}>.AI</span>
            </div>
          </div>

          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#f1f0ff', margin: '0 0 6px' }}>
            Welcome back
          </h2>
          <p style={{ color: '#5c5880', fontSize: 13, margin: '0 0 28px' }}>
            Sign in to your brand protection dashboard
          </p>

          <form onSubmit={submit}>
            {/* Email */}
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 10, color: '#5c5880', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                Email
              </label>
              <div style={{ position: 'relative' }}>
                <Mail size={14} color="#5c5880" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input
                  type="email" placeholder="you@company.com"
                  value={email} onChange={e => setEmail(e.target.value)} required
                  style={{
                    paddingLeft: 36, background: 'rgba(26,26,46,0.8)',
                    border: '1px solid #2a2a4a', borderRadius: 8, color: '#f1f0ff',
                    fontSize: 13, padding: '10px 14px 10px 36px', width: '100%',
                    outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s',
                  }}
                  onFocus={e => { e.target.style.borderColor = '#7c3aed'; e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.15)' }}
                  onBlur={e => { e.target.style.borderColor = '#2a2a4a'; e.target.style.boxShadow = 'none' }}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 10, color: '#5c5880', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={14} color="#5c5880" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input
                  type={showPw ? 'text' : 'password'} placeholder="••••••••"
                  value={password} onChange={e => setPassword(e.target.value)} required
                  style={{
                    paddingLeft: 36, paddingRight: 40,
                    background: 'rgba(26,26,46,0.8)',
                    border: '1px solid #2a2a4a', borderRadius: 8, color: '#f1f0ff',
                    fontSize: 13, padding: '10px 40px 10px 36px', width: '100%',
                    outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s',
                  }}
                  onFocus={e => { e.target.style.borderColor = '#7c3aed'; e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.15)' }}
                  onBlur={e => { e.target.style.borderColor = '#2a2a4a'; e.target.style.boxShadow = 'none' }}
                />
                <button type="button" onClick={() => setShowPw(p => !p)} style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: '#5c5880', padding: 0,
                }}>
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  style={{
                    padding: '10px 14px', borderRadius: 8,
                    background: 'rgba(239,68,68,0.08)',
                    border: '1px solid rgba(239,68,68,0.3)',
                    color: '#ef4444', fontSize: 12, marginBottom: 16,
                  }}
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <button
              className="btn-primary"
              type="submit"
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: 14, letterSpacing: '0.06em' }}
            >
              {loading ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
                    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                  </svg>
                  SIGNING IN...
                </>
              ) : 'SIGN IN'}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0' }}>
            <div style={{ flex: 1, height: 1, background: '#2a2a4a' }} />
            <span style={{ color: '#5c5880', fontSize: 12 }}>or</span>
            <div style={{ flex: 1, height: 1, background: '#2a2a4a' }} />
          </div>

          {/* Demo */}
          <button
            onClick={fillDemo}
            style={{
              width: '100%', padding: '10px', borderRadius: 8, cursor: 'pointer',
              background: 'transparent', border: '1px solid rgba(245,158,11,0.35)',
              color: '#f59e0b', fontSize: 13, fontFamily: 'Inter, sans-serif',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(245,158,11,0.08)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
          >
            <Zap size={14} /> Use demo account
          </button>

          <div style={{ marginTop: 24, textAlign: 'center', fontSize: 13, color: '#5c5880' }}>
            No account?{' '}
            <Link to="/register" style={{ color: '#a855f7', textDecoration: 'none', fontWeight: 600 }}>
              Create one free
            </Link>
          </div>
        </div>
      </motion.div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  )
}
