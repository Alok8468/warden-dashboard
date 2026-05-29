import { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { RefreshCw, Plus, ShieldAlert, Zap, FolderLock, Shield, Activity } from 'lucide-react'
import { api } from '../api/client'
import CountUp from '../components/CountUp'
import { LiveThreatFeed } from '../components/LiveThreatFeed'
import { ActivityTimeline } from '../components/ActivityTimeline'
import { ScoreTrend } from '../components/ScoreTrend'
import { useThreatFeed } from '../hooks/useThreatFeed'

// ── Radar Canvas ──────────────────────────────────────────────────────────────
function RadarCanvas({ threats = [] }) {
  const canvasRef = useRef(null)
  const angleRef  = useRef(0)
  const dots      = useRef([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const cx = canvas.width / 2, cy = canvas.height / 2, r = cx - 10
    dots.current = threats.slice(0, 20).map((t, i) => {
      const a  = (i / Math.max(threats.length, 1)) * Math.PI * 2
      const dr = (0.3 + Math.random() * 0.6) * r
      return { x: cx + Math.cos(a) * dr, y: cy + Math.sin(a) * dr,
               score: t.threat_score || 0, label: t.domain || t.handle || '?' }
    })
    if (!dots.current.length) {
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2, dr = (0.3 + Math.random() * 0.5) * r
        dots.current.push({ x: cx + Math.cos(a) * dr, y: cy + Math.sin(a) * dr, score: Math.random() * 10, label: '?' })
      }
    }
  }, [threats])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let raf

    const draw = () => {
      const w = canvas.width, h = canvas.height
      const cx = w / 2, cy = h / 2, r = cx - 10

      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = '#08080f'
      ctx.fillRect(0, 0, w, h)

      // Rings
      for (let i = 1; i <= 4; i++) {
        ctx.beginPath()
        ctx.arc(cx, cy, (r / 4) * i, 0, Math.PI * 2)
        ctx.strokeStyle = 'rgba(124,58,237,0.15)'
        ctx.lineWidth = 1
        ctx.stroke()
      }

      // Crosshairs
      ctx.strokeStyle = 'rgba(124,58,237,0.1)'
      ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(cx - r, cy); ctx.lineTo(cx + r, cy); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(cx, cy - r); ctx.lineTo(cx, cy + r); ctx.stroke()

      // Sweep
      angleRef.current = (angleRef.current + 0.012) % (Math.PI * 2)
      const sweep = angleRef.current
      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(sweep)
      const g = ctx.createLinearGradient(0, 0, r, 0)
      g.addColorStop(0, 'rgba(124,58,237,0.5)')
      g.addColorStop(0.3, 'rgba(124,58,237,0.15)')
      g.addColorStop(1, 'rgba(124,58,237,0)')
      ctx.fillStyle = g
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.arc(0, 0, r, -0.45, 0)
      ctx.closePath()
      ctx.fill()

      ctx.strokeStyle = 'rgba(168,85,247,0.8)'
      ctx.lineWidth = 1.5
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(r, 0); ctx.stroke()
      ctx.restore()

      // Dots
      dots.current.forEach(d => {
        const score = d.score || 0
        const color = score >= 8 ? '#ef4444' : score >= 5 ? '#f59e0b' : '#10b981'
        const glow  = score >= 8 ? 'rgba(239,68,68,0.4)' : score >= 5 ? 'rgba(245,158,11,0.3)' : 'rgba(16,185,129,0.3)'
        const pulse = Math.sin(Date.now() * 0.003 + d.x) * 0.5 + 0.5
        const size  = 3 + score * 0.3

        ctx.beginPath()
        ctx.arc(d.x, d.y, size + pulse * 2, 0, Math.PI * 2)
        ctx.fillStyle = glow
        ctx.fill()
        ctx.beginPath()
        ctx.arc(d.x, d.y, size, 0, Math.PI * 2)
        ctx.fillStyle = color
        ctx.fill()
      })

      ctx.beginPath()
      ctx.arc(cx, cy, 4, 0, Math.PI * 2)
      ctx.fillStyle = '#a855f7'
      ctx.fill()

      raf = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(raf)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      width={260} height={260}
      style={{ borderRadius: '50%', display: 'block' }}
    />
  )
}

// ── Metric Card ───────────────────────────────────────────────────────────────
function MetricCard({ label, value, sub, color = '#7c3aed', icon: Icon }) {
  return (
    <div className="card p-5" style={{
      borderTop: `2px solid ${color}`,
      display: 'flex', flexDirection: 'column', gap: 8,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ color: '#5c5880', fontSize: 10, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.1em', textTransform: 'uppercase' }}>{label}</span>
        {Icon && <Icon size={18} color={color} style={{ opacity: 0.8 }} />}
      </div>
      <div style={{ color, fontSize: 34, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace', lineHeight: 1, textShadow: `0 0 20px ${color}40` }}>
        <CountUp value={typeof value === 'number' ? value : 0} />
      </div>
      {sub && <div style={{ color: '#5c5880', fontSize: 11 }}>{sub}</div>}
    </div>
  )
}

// ── Protection Score Explanation Modal ────────────────────────────────────────
function ScoreModal({ score, stats, onClose }) {
  const color = score >= 90 ? '#10b981' : score >= 70 ? '#06b6d4' : score >= 50 ? '#f59e0b' : '#ef4444'
  const label = score >= 90 ? 'Excellent' : score >= 70 ? 'Good' : score >= 50 ? 'At Risk' : 'Critical'

  const factors = [
    {
      label: 'High-Risk Threats',
      value: stats.threats_high || 0,
      impact: -(Math.min(stats.threats_high || 0, 10) * 4),
      color: '#ef4444',
      desc: 'Each high-risk threat detected deducts up to 4 points.',
    },
    {
      label: 'Takedowns Filed',
      value: stats.takedowns_filed || 0,
      impact: Math.min((stats.takedowns_filed || 0) * 2, 20),
      color: '#10b981',
      desc: 'Successfully filed takedowns improve your score.',
    },
    {
      label: 'Platforms Monitored',
      value: 7,
      impact: 10,
      color: '#7c3aed',
      desc: 'Active monitoring across all 7 platforms adds baseline points.',
    },
    {
      label: 'Scans Run',
      value: stats.total_scans || 0,
      impact: Math.min((stats.total_scans || 0) * 1, 10),
      color: '#06b6d4',
      desc: 'Regular scanning demonstrates active brand protection.',
    },
  ]

  return (
    <div
      style={{
        position: 'fixed', inset: 0, background: 'rgba(13,13,20,0.88)',
        zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{ width: '100%', maxWidth: 560, padding: 0, overflow: 'hidden' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '20px 24px', borderBottom: '1px solid #2a2a4a',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: '#5c5880', marginBottom: 4 }}>
              PROTECTION SCORE BREAKDOWN
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span style={{ fontSize: 36, fontWeight: 700, color, fontFamily: 'JetBrains Mono, monospace' }}>
                {score}
              </span>
              <span style={{ color: '#5c5880', fontSize: 13 }}>/100 — {label}</span>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: '#5c5880', cursor: 'pointer', fontSize: 20, lineHeight: 1 }}
          >✕</button>
        </div>

        {/* Body */}
        <div style={{ padding: 24 }}>
          <p style={{ fontSize: 13, color: '#a8a4c8', marginBottom: 20, lineHeight: 1.6 }}>
            Your protection score reflects how actively your brand is monitored and defended.
            Scores above 70 are considered healthy; below 50 indicates immediate action required.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {factors.map(f => (
              <div key={f.label} style={{ background: '#0d0d1a', borderRadius: 8, padding: '14px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#f1f0ff' }}>{f.label}</div>
                  <div style={{ display: 'flex', align: 'center', gap: 10 }}>
                    <span style={{ fontSize: 12, color: '#5c5880', fontFamily: 'JetBrains Mono, monospace' }}>{f.value}</span>
                    <span style={{
                      fontSize: 12, fontWeight: 700, color: f.impact >= 0 ? '#10b981' : '#ef4444',
                      fontFamily: 'JetBrains Mono, monospace', minWidth: 44, textAlign: 'right',
                    }}>
                      {f.impact >= 0 ? '+' : ''}{f.impact}
                    </span>
                  </div>
                </div>
                <div style={{ fontSize: 11, color: '#5c5880' }}>{f.desc}</div>
                {/* Progress bar */}
                <div style={{ height: 3, background: '#1a1a2e', borderRadius: 2, marginTop: 8, overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', background: f.color, borderRadius: 2,
                    width: `${Math.min(Math.abs(f.impact) * 5, 100)}%`,
                    transition: 'width 0.6s ease',
                  }} />
                </div>
              </div>
            ))}
          </div>

          <div style={{
            marginTop: 20, padding: '12px 16px', borderRadius: 8,
            background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)',
            fontSize: 12, color: '#a8a4c8',
          }}>
            <strong style={{ color: '#a855f7' }}>Improve your score:</strong> Run more scans, file takedowns for detected threats,
            and ensure monitoring is active on all platforms.
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Protection Score Ring ──────────────────────────────────────────────────────
function ProtectionRing({ score, stats }) {
  const [showModal, setShowModal] = useState(false)
  const radius = 54
  const circ   = 2 * Math.PI * radius
  const dash   = (score / 100) * circ
  const color  = score >= 90 ? '#10b981' : score >= 70 ? '#06b6d4' : score >= 50 ? '#f59e0b' : '#ef4444'
  const label  = score >= 90 ? 'Excellent' : score >= 70 ? 'Good' : score >= 50 ? 'At Risk' : 'Critical'
  const offset = circ - dash

  return (
    <>
      {showModal && <ScoreModal score={score} stats={stats} onClose={() => setShowModal(false)} />}
      <div
        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, cursor: 'pointer' }}
        onClick={() => setShowModal(true)}
        title="Click to see score breakdown"
      >
        <svg width={140} height={140} viewBox="0 0 140 140">
          <circle cx={70} cy={70} r={radius} fill="none" stroke="#1a1a2e" strokeWidth={12} />
          <circle cx={70} cy={70} r={radius} fill="none" stroke={color} strokeWidth={12}
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="round"
            transform="rotate(-90 70 70)"
            style={{ transition: 'stroke-dashoffset 1.5s ease', filter: `drop-shadow(0 0 6px ${color})` }}
          />
          <text x={70} y={65} textAnchor="middle" fill={color} fontSize={26} fontWeight={700} fontFamily="JetBrains Mono, monospace">
            <CountUp value={score} />
          </text>
          <text x={70} y={83} textAnchor="middle" fill="#5c5880" fontSize={10} fontFamily="JetBrains Mono, monospace">
            /100
          </text>
        </svg>
        <div style={{ fontSize: 11, color: '#5c5880', textAlign: 'center', fontFamily: 'JetBrains Mono, monospace' }}>
          PROTECTION SCORE
        </div>
        <div style={{ fontSize: 12, color, fontWeight: 600 }}>{label}</div>
        <div style={{ fontSize: 10, color: '#3a3060', fontFamily: 'JetBrains Mono, monospace' }}>click for details</div>
      </div>
    </>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const [scans,   setScans]   = useState([])
  const [stats,   setStats]   = useState({})
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  // ── Real-time threat feed ──────────────────────────────────────────────────
  const { threats, timeline, connected, clearNewFlags } = useThreatFeed()

  // Merge real-time threat counts into stats and recompute score instantly
  const liveHigh  = threats.filter(t => ['high', 'critical'].includes(t.risk_level)).length
  const liveMed   = threats.filter(t => t.risk_level === 'medium').length
  const liveLow   = threats.filter(t => t.risk_level === 'low').length
  const totalHigh = Math.max(stats.threats_high   || 0, liveHigh)
  const totalMed  = Math.max(stats.threats_medium || 0, liveMed)
  const totalLow  = Math.max(stats.threats_low    || 0, liveLow)
  const liveScore = threats.length > 0
    ? Math.max(5, 100
        - Math.round(30 * (1 - Math.exp(-totalHigh / 5)))
        - Math.round(25 * (1 - Math.exp(-totalMed  / 8)))
        - Math.round(10 * (1 - Math.exp(-totalLow  / 15))))
    : null
  const liveStats = {
    ...stats,
    threats_total:    Math.max(stats.threats_total    || 0, threats.length),
    threats_high:     totalHigh,
    threats_medium:   totalMed,
    threats_low:      totalLow,
    protection_score: liveScore ?? stats.protection_score,
  }

  const load = useCallback(async () => {
    try {
      // Use the shared api client so the Authorization header and 401 redirect
      // are handled consistently (raw fetch was causing unauthenticated stats calls).
      const [statsData, scansData] = await Promise.all([
        api.getStats().catch(() => null),
        api.listScans(20).catch(() => null),
      ])
      if (statsData) setStats(statsData)
      if (scansData) setScans(scansData.scans || [])
    } catch {
      // silently ignore — dashboard degrades gracefully
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load(); const id = setInterval(load, 30000); return () => clearInterval(id) }, [load])


  const chartData = scans.slice(0, 10).reverse().map((s, i) => {
    const r     = s.results || {}
    const total = r.threats_found || r.total_threats || 0
    // Use high/med/low from results if present, otherwise estimate
    const high   = r.threats_high   ?? Math.round(total * 0.3)
    const medium = r.threats_medium ?? Math.round(total * 0.55)
    const low    = r.threats_low    ?? Math.max(0, total - high - medium)
    const label  = s.started_at
      ? new Date(s.started_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })
      : `S${i + 1}`
    return { name: label, high, medium, low, total }
  })

  // Build synthetic radar dots from stats counts (no full threat objects in seeded data)
  const radarDots = (() => {
    const h = stats.threats_high   || 0
    const m = stats.threats_medium || 0
    const l = stats.threats_low    || 0
    const dots = []
    for (let i = 0; i < Math.min(h, 12); i++) dots.push({ threat_score: 8 + Math.random() * 2, domain: `high-threat-${i}` })
    for (let i = 0; i < Math.min(m, 10); i++) dots.push({ threat_score: 5 + Math.random() * 3, domain: `med-threat-${i}` })
    for (let i = 0; i < Math.min(l, 6);  i++) dots.push({ threat_score: Math.random() * 5,      domain: `low-threat-${i}` })
    return dots
  })()

  const score       = liveStats.protection_score ?? stats.protection_score ?? 100
  const location    = useLocation()
  const toastMsg    = location.state?.toast

  // Show a success toast if navigated here from onboarding
  const [toast, setToast] = useState(toastMsg || null)
  useEffect(() => {
    if (toast) { const t = setTimeout(() => setToast(null), 4000); return () => clearTimeout(t) }
  }, [toast])

  return (
    <div className="page-enter dot-grid min-h-screen" style={{ padding: 24 }}>

      {/* Success toast from onboarding */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
          display: 'flex', alignItems: 'center', gap: 12,
          padding: '14px 20px', borderRadius: 12,
          background: '#0d0d14', border: '1px solid rgba(16,185,129,0.4)',
          boxShadow: '0 0 40px rgba(16,185,129,0.2)',
          fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: '#10b981',
          animation: 'fadeInUp 0.3s ease',
        }}>
          {toast}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: 20, fontWeight: 700,
            margin: 0, color: '#f1f0ff', letterSpacing: '0.05em',
          }}>
            THREAT OVERVIEW
          </h1>
          <p style={{ color: '#5c5880', fontSize: 12, fontFamily: 'JetBrains Mono, monospace', margin: '4px 0 0' }}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn-outline" onClick={load} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <RefreshCw size={13} /> Refresh
          </button>
          <button className="btn-primary" onClick={() => navigate('/scan')} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Plus size={14} /> New Scan
          </button>
        </div>
      </div>

      {/* Top row: score ring + 7-day trend + metric cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'auto auto 1fr', gap: 20, marginBottom: 20 }}>
        {/* Score ring */}
        <div className="card p-5" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minWidth: 160 }}>
          <ProtectionRing score={score} stats={stats} />
        </div>

        {/* 7-day score trend */}
        <ScoreTrend />

        {/* Metric cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }} className="mobile-stack">
          <MetricCard label="Threats Total"   value={liveStats.threats_total || 0}     color="#ef4444" icon={ShieldAlert} sub={`${liveStats.threats_high || 0} high risk`} />
          <MetricCard label="Takedowns Filed" value={liveStats.takedowns_filed || 0}   color="#7c3aed" icon={Zap}         sub="evidence built" />
          <MetricCard label="Platforms"       value={7}                                color="#f59e0b" icon={Activity}     sub="monitored" />
          <MetricCard label="Evidence Pkgs"   value={liveStats.evidence_packages || 0} color="#10b981" icon={FolderLock}   sub="packages ready" />
        </div>
      </div>

      {/* Middle row: radar + chart + feed */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 20 }} className="mobile-stack">
        {/* Radar */}
        <div className="card p-5" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <h2 style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#5c5880', letterSpacing: '0.15em', textTransform: 'uppercase', margin: 0, width: '100%', textAlign: 'center' }}>
            THREAT RADAR
          </h2>
          <RadarCanvas threats={radarDots} />
          <div style={{ display: 'flex', gap: 16, fontSize: 10, fontFamily: 'JetBrains Mono, monospace' }}>
            <span style={{ color: '#ef4444' }}>● HIGH</span>
            <span style={{ color: '#f59e0b' }}>● MED</span>
            <span style={{ color: '#10b981' }}>● LOW</span>
          </div>
        </div>

        {/* Trend chart */}
        <div className="card p-5">
          <h2 style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#5c5880', letterSpacing: '0.12em', textTransform: 'uppercase', margin: '0 0 16px' }}>
            THREAT TREND
          </h2>
          {chartData.length === 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 180, color: '#5c5880', fontSize: 12 }}>
              No scan data yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="gH" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="gP" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#7c3aed" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(42,42,74,0.8)" />
                <XAxis dataKey="name" tick={{ fill: '#5c5880', fontSize: 10 }} />
                <YAxis tick={{ fill: '#5c5880', fontSize: 10 }} allowDecimals={false} />
                <Tooltip contentStyle={{ background: '#13131f', border: '1px solid #2a2a4a', borderRadius: 8, fontSize: 11, color: '#f1f0ff' }} />
                <Area type="monotone" dataKey="high"   stroke="#ef4444" fill="url(#gH)" strokeWidth={2} name="High" />
                <Area type="monotone" dataKey="medium" stroke="#f59e0b" fill="none"    strokeWidth={1.5} strokeDasharray="4 2" name="Medium" />
                <Area type="monotone" dataKey="low"    stroke="#7c3aed" fill="url(#gP)" strokeWidth={2} name="Low" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Activity timeline */}
        <ActivityTimeline events={timeline} connected={connected} compact />
      </div>

      {/* Recent scans table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 20px', borderBottom: '1px solid #2a2a4a' }}>
          <h2 style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#5c5880', letterSpacing: '0.12em', textTransform: 'uppercase', margin: 0 }}>
            RECENT SCANS
          </h2>
          <span className="badge badge-purple">{scans.length} total</span>
        </div>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#5c5880' }}>Loading...</div>
        ) : scans.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center' }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🛡️</div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 14, fontWeight: 700, color: '#f1f0ff', marginBottom: 8 }}>
              No brands protected yet
            </div>
            <div style={{ color: '#5c5880', fontSize: 13, marginBottom: 24, maxWidth: 360, margin: '0 auto 24px' }}>
              Add your first brand to start monitoring for fake domains, social impersonation, and other threats — 24/7.
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button
                className="btn-primary"
                onClick={() => navigate('/onboarding')}
                style={{ display: 'flex', alignItems: 'center', gap: 8 }}
              >
                <Plus size={14} /> Add First Brand
              </button>
              <button
                className="btn-outline"
                onClick={() => navigate('/scan')}
                style={{ fontSize: 12 }}
              >
                Run Manual Scan
              </button>
            </div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="cyber-table">
              <thead>
                <tr>
                  <th>Target</th><th>Type</th><th>Status</th>
                  <th>Threats</th><th className="hidden md:table-cell">Started</th><th>Action</th>
                </tr>
              </thead>
              <tbody>
                {scans.slice(0, 8).map(s => {
                  const threats = s.results?.threats_found ?? (s.results?.total_threats ?? 0)
                  const statusColor = s.status === 'complete' ? '#10b981' : s.status === 'running' ? '#a855f7' : '#ef4444'
                  return (
                    <tr key={s.scan_id}>
                      <td style={{ fontFamily: 'JetBrains Mono, monospace', color: '#f1f0ff', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 12 }}>
                        {s.target}
                      </td>
                      <td>
                        <span className="badge badge-purple" style={{ fontSize: 10 }}>{s.type}</span>
                      </td>
                      <td>
                        <span style={{
                          padding: '2px 10px', borderRadius: 100, fontSize: 11,
                          fontFamily: 'JetBrains Mono, monospace', fontWeight: 600,
                          background: `${statusColor}22`, color: statusColor, border: `1px solid ${statusColor}44`,
                        }}>
                          {s.status === 'running' && '● '}{s.status}
                        </span>
                      </td>
                      <td style={{ fontFamily: 'JetBrains Mono, monospace', color: threats > 0 ? '#ef4444' : '#10b981', fontSize: 13 }}>
                        {s.status === 'complete' ? threats : '—'}
                      </td>
                      <td className="hidden md:table-cell" style={{ color: '#5c5880', fontSize: 11 }}>
                        {new Date(s.started_at).toLocaleString('en-IN', { timeStyle: 'short', dateStyle: 'short' })}
                      </td>
                      <td>
                        <button className="btn-outline" style={{ fontSize: 11 }} onClick={() => navigate('/threats')}>
                          View
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Live threat feed */}
      <div style={{ marginTop: 20 }}>
        <LiveThreatFeed threats={threats} onClearNew={clearNewFlags} />
      </div>

    </div>
  )
}
