import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Shield, User, Mail, Lock, Tag } from 'lucide-react'
import { setToken } from '../auth'

const BASE = 'http://localhost:8001'

const FIELDS = [
  { key: 'name',       label: 'Full Name',   type: 'text',     placeholder: 'Rahul Rawat',    icon: User },
  { key: 'email',      label: 'Email',        type: 'email',    placeholder: 'you@company.com', icon: Mail },
  { key: 'password',   label: 'Password',     type: 'password', placeholder: '••••••••',        icon: Lock },
  { key: 'brand_name', label: 'Brand Name',   type: 'text',     placeholder: 'boAt, Nykaa…',    icon: Tag  },
]

export default function Register() {
  const [form, setForm]       = useState({ name: '', email: '', password: '', brand_name: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const navigate = useNavigate()

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const res = await fetch(`${BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.detail || 'Registration failed')
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
      <div className="hidden md:flex" style={{
        flex: '0 0 42%', position: 'relative',
        background: 'linear-gradient(135deg, #0d0d14 0%, #12103a 60%, #0d0d14 100%)',
        flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: 48, overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.4,
          backgroundImage: 'linear-gradient(rgba(124,58,237,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.07) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute',
            width: 3 + (i % 3), height: 3 + (i % 3),
            borderRadius: '50%',
            background: i % 2 === 0 ? 'rgba(124,58,237,0.5)' : 'rgba(245,158,11,0.4)',
            left: `${15 + (i * 13) % 70}%`,
            top: `${10 + (i * 15) % 80}%`,
            animation: `float ${3.5 + (i % 3)}s ease-in-out infinite`,
            animationDelay: `${i * 0.5}s`,
          }} />
        ))}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            width: 80, height: 80, borderRadius: 20,
            background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(76,29,149,0.4))',
            border: '1px solid rgba(124,58,237,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 28, boxShadow: '0 0 40px rgba(124,58,237,0.25)',
          }}
        >
          <Shield size={36} color="#a855f7" />
        </motion.div>
        <h2 style={{
          fontFamily: 'JetBrains Mono, monospace', fontSize: 28, fontWeight: 700,
          margin: '0 0 12px', letterSpacing: '0.08em', textAlign: 'center',
        }}>
          <span style={{ color: '#f1f0ff' }}>WARDEN</span>
          <span style={{ color: '#a855f7' }}>.AI</span>
        </h2>
        <p style={{ color: '#a8a4c8', fontSize: 14, textAlign: 'center', maxWidth: 280, lineHeight: 1.7 }}>
          Start protecting your brand across the entire digital landscape — domains, social media, and more.
        </p>
      </div>

      {/* Right panel — form */}
      <motion.div
        initial={{ x: 60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 24 }}
        style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: '#13131f', padding: 32,
        }}
      >
        <div style={{ width: '100%', maxWidth: 400 }}>
          <div className="md:hidden" style={{ textAlign: 'center', marginBottom: 28 }}>
            <Shield size={36} color="#a855f7" style={{ margin: '0 auto 10px' }} />
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 18, fontWeight: 700 }}>
              <span style={{ color: '#f1f0ff' }}>WARDEN</span>
              <span style={{ color: '#a855f7' }}>.AI</span>
            </div>
          </div>

          <h2 style={{ fontSize: 22, fontWeight: 700, color: '#f1f0ff', margin: '0 0 6px' }}>
            Create your account
          </h2>
          <p style={{ color: '#5c5880', fontSize: 13, margin: '0 0 28px' }}>
            Get started with brand protection in minutes
          </p>

          <form onSubmit={submit}>
            {FIELDS.map(({ key, label, type, placeholder, icon: Icon }) => (
              <div key={key} style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 10, color: '#5c5880', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                  {label}{key !== 'brand_name' && ' *'}
                </label>
                <div style={{ position: 'relative' }}>
                  <Icon size={14} color="#5c5880" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  <input
                    type={type} placeholder={placeholder}
                    value={form[key]} onChange={set(key)}
                    required={key !== 'brand_name'}
                    style={{
                      paddingLeft: 36,
                      background: 'rgba(26,26,46,0.8)',
                      border: '1px solid #2a2a4a', borderRadius: 8, color: '#f1f0ff',
                      fontSize: 13, padding: '10px 14px 10px 36px', width: '100%',
                      outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s',
                    }}
                    onFocus={e => { e.target.style.borderColor = '#7c3aed'; e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.15)' }}
                    onBlur={e => { e.target.style.borderColor = '#2a2a4a'; e.target.style.boxShadow = 'none' }}
                  />
                </div>
              </div>
            ))}

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  style={{
                    padding: '10px 14px', borderRadius: 8, marginBottom: 16,
                    background: 'rgba(239,68,68,0.08)',
                    border: '1px solid rgba(239,68,68,0.3)',
                    color: '#ef4444', fontSize: 12,
                  }}
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              className="btn-gold"
              type="submit"
              disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: 14, letterSpacing: '0.05em', marginTop: 8 }}
            >
              {loading ? 'CREATING ACCOUNT...' : 'CREATE ACCOUNT'}
            </button>
          </form>

          <div style={{ marginTop: 24, textAlign: 'center', fontSize: 13, color: '#5c5880' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#a855f7', textDecoration: 'none', fontWeight: 600 }}>
              Sign in
            </Link>
          </div>
        </div>
      </motion.div>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  )
}
