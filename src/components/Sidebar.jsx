import { useState, useEffect } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, ScanLine, ShieldAlert, Zap,
  FolderLock, FileBarChart, Bell, Clock as ClockIcon, Shield,
  LogOut, Menu, X, Activity, CreditCard, Settings,
} from 'lucide-react'
import { clearToken } from '../auth'
import { api } from '../api/client'

const NAV = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard',  key: 'dashboard' },
  { to: '/scan',      icon: ScanLine,        label: 'New Scan',   key: 'scan' },
  { to: '/threats',   icon: ShieldAlert,     label: 'Threats',    key: 'threats' },
  { to: '/takedowns', icon: Zap,             label: 'Takedowns',  key: 'takedowns' },
  { to: '/evidence',  icon: FolderLock,      label: 'Evidence',   key: 'evidence' },
  { to: '/reports',   icon: FileBarChart,    label: 'Reports',    key: 'reports' },
  { to: '/alerts',    icon: Bell,            label: 'Alerts',     key: 'alerts' },
  { to: '/scheduler', icon: ClockIcon,       label: 'Scheduler',  key: 'scheduler' },
  { to: '/settings',  icon: Settings,        label: 'Settings',   key: 'settings' },
  { to: '/pricing',   icon: CreditCard,      label: 'Pricing',    key: 'pricing' },
]

function Clock() {
  const [t, setT] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setT(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  return (
    <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#5c5880', letterSpacing: '0.05em' }}>
      {t.toLocaleTimeString('en-IN', { hour12: false })}
    </span>
  )
}

function SidebarContent({ onClose }) {
  const [online, setOnline] = useState(null)
  const [stats, setStats] = useState({})
  const location = useLocation()
  const navigate = useNavigate()

  const logout = () => {
    clearToken()
    navigate('/login')
  }

  useEffect(() => {
    const check = async () => {
      try {
        const h = await api.health()
        setOnline(!!h)
        const s = await api.getStats().catch(() => null)
        if (s) setStats(s)
      } catch { setOnline(false) }
    }
    check()
    const id = setInterval(check, 30000)
    return () => clearInterval(id)
  }, [])

  const badges = {
    threats:   stats.threats_high  || 0,    // red  — high-risk count
    takedowns: stats.takedowns_filed || 0,  // amber — filed count
    alerts:    stats.unread_alerts  || 0,   // purple — unread
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      background: '#0d0d18',
      borderRight: '1px solid #2a2a4a',
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid #2a2a4a' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10, flexShrink: 0,
            background: 'linear-gradient(135deg, rgba(124,58,237,0.3), rgba(76,29,149,0.5))',
            border: '1px solid rgba(124,58,237,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 16px rgba(124,58,237,0.2)',
          }}>
            <Shield size={20} color="#a855f7" />
          </div>
          <div>
            <div style={{
              fontFamily: 'JetBrains Mono, monospace', fontWeight: 700,
              fontSize: 15, letterSpacing: '0.12em',
              color: '#f1f0ff',
            }}>
              <span style={{ color: '#f1f0ff' }}>WARDEN</span>
              <span style={{ color: '#a855f7' }}>.AI</span>
            </div>
            <div style={{
              fontFamily: 'JetBrains Mono, monospace', fontSize: 8,
              letterSpacing: '0.18em', color: '#5c5880', marginTop: 1,
            }}>BRAND PROTECTION</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, paddingTop: 12, paddingBottom: 8, overflowY: 'auto' }}>
        {NAV.map(item => {
          const active = location.pathname === item.to
          const badge = badges[item.key]
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 16px 9px 18px',
                margin: '1px 8px',
                borderRadius: 8,
                textDecoration: 'none',
                fontSize: 13,
                fontWeight: active ? 600 : 400,
                color: active ? '#f1f0ff' : '#a8a4c8',
                background: active ? 'rgba(124,58,237,0.1)' : 'transparent',
                borderLeft: `3px solid ${active ? '#7c3aed' : 'transparent'}`,
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => {
                if (!active) {
                  e.currentTarget.style.background = 'rgba(124,58,237,0.06)'
                  e.currentTarget.style.color = '#d4cfff'
                }
              }}
              onMouseLeave={e => {
                if (!active) {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = '#a8a4c8'
                }
              }}
            >
              <Icon
                size={16}
                color={active ? '#a855f7' : '#5c5880'}
                style={{ flexShrink: 0 }}
              />
              <span style={{ flex: 1 }}>{item.label}</span>
              {badge > 0 && (
                <span style={{
                  background: item.key === 'threats'
                    ? 'rgba(239,68,68,0.18)'
                    : item.key === 'takedowns'
                    ? 'rgba(245,158,11,0.18)'
                    : 'rgba(124,58,237,0.15)',
                  color: item.key === 'threats'
                    ? '#ef4444'
                    : item.key === 'takedowns'
                    ? '#f59e0b'
                    : '#a855f7',
                  border: `1px solid ${
                    item.key === 'threats'
                      ? 'rgba(239,68,68,0.35)'
                      : item.key === 'takedowns'
                      ? 'rgba(245,158,11,0.35)'
                      : 'rgba(124,58,237,0.3)'
                  }`,
                  borderRadius: 999, fontSize: 10, fontWeight: 700,
                  fontFamily: 'JetBrains Mono, monospace',
                  padding: '1px 7px', minWidth: 22, textAlign: 'center',
                }}>
                  {badge > 99 ? '99+' : badge}
                </span>
              )}
            </NavLink>
          )
        })}
      </nav>

      {/* Status footer */}
      <div style={{ padding: '14px 16px', borderTop: '1px solid #2a2a4a' }}>
        {/* API status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <div className="pulse-dot" style={{
            background: online === null ? '#5c5880' : online ? '#10b981' : '#ef4444',
          }} />
          <span style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
            color: online === null ? '#5c5880' : online ? '#10b981' : '#ef4444',
            letterSpacing: '0.08em',
          }}>
            {online === null ? 'CONNECTING...' : online ? 'API ONLINE' : 'API OFFLINE'}
          </span>
        </div>

        {/* Clock + version */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <Clock />
          <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 9, color: '#3a3060', letterSpacing: '0.06em' }}>
            v1.1.0
          </span>
        </div>

        {/* Logout */}
        <button
          onClick={logout}
          style={{
            width: '100%', padding: '7px 12px', borderRadius: 7,
            fontSize: 11, cursor: 'pointer', fontFamily: 'JetBrains Mono, monospace',
            letterSpacing: '0.06em', textAlign: 'left',
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'transparent',
            border: '1px solid rgba(239,68,68,0.2)',
            color: '#ef4444', transition: 'all 0.15s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(239,68,68,0.08)'
            e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.borderColor = 'rgba(239,68,68,0.2)'
          }}
        >
          <LogOut size={13} /> LOGOUT
        </button>
      </div>
    </div>
  )
}

export default function Sidebar() {
  const [open, setOpen] = useState(false)
  const location = useLocation()

  // Close mobile sidebar on route change
  useEffect(() => { setOpen(false) }, [location.pathname])

  return (
    <>
      {/* Desktop sidebar */}
      <div style={{
        display: 'none',
        position: 'fixed', left: 0, top: 0, bottom: 0,
        width: 240, zIndex: 40, flexDirection: 'column',
      }}
        className="md:flex"
      >
        <SidebarContent onClose={() => {}} />
      </div>

      {/* Mobile top bar */}
      <div className="md:hidden" style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 16px', height: 48,
        background: '#0d0d18', borderBottom: '1px solid #2a2a4a',
      }}>
        <span style={{
          fontFamily: 'JetBrains Mono, monospace', fontWeight: 700,
          fontSize: 14, letterSpacing: '0.1em',
        }}>
          <span style={{ color: '#f1f0ff' }}>WARDEN</span>
          <span style={{ color: '#a855f7' }}>.AI</span>
        </span>
        <button
          onClick={() => setOpen(o => !o)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#a8a4c8', padding: 4,
          }}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <div className="md:hidden" style={{ position: 'fixed', inset: 0, zIndex: 45 }}
            onClick={() => setOpen(false)}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.7)' }}
            />
            <motion.div
              initial={{ x: -260 }}
              animate={{ x: 0 }}
              exit={{ x: -260 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 240 }}
              onClick={e => e.stopPropagation()}
            >
              <SidebarContent onClose={() => setOpen(false)} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile top-bar spacer */}
      <div className="md:hidden" style={{ height: 48 }} />

      {/* Mobile bottom tab bar */}
      <nav className="mobile-bottom-nav">
        {NAV.slice(0, 5).map(item => {
          const active = location.pathname === item.to
          const Icon = item.icon
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`mobile-tab${active ? ' active' : ''}`}
            >
              <Icon size={18} />
              <span>{item.label.split(' ')[0]}</span>
            </NavLink>
          )
        })}
      </nav>
    </>
  )
}
