/**
 * LiveThreatFeed — real-time threat table with animated new entries,
 * live status badges, and takedown status transitions.
 *
 * Props:
 *   threats       — array from useThreatFeed()
 *   onClearNew    — callback to clear isNew flags after animation
 *   brand         — currently selected brand (for display)
 *   maxRows       — max rows to render (default 25)
 */
import { useEffect, useRef } from 'react'
import { ShieldAlert, Shield, Zap, CheckCircle, AlertTriangle, Clock, ExternalLink } from 'lucide-react'

// ── Risk badge ────────────────────────────────────────────────────────────────
function RiskBadge({ level }) {
  const cfg = {
    critical: { color: '#ef4444', bg: 'rgba(239,68,68,0.15)', label: 'CRITICAL' },
    high:     { color: '#f97316', bg: 'rgba(249,115,22,0.15)', label: 'HIGH'     },
    medium:   { color: '#f59e0b', bg: 'rgba(245,158,11,0.15)', label: 'MEDIUM'   },
    low:      { color: '#10b981', bg: 'rgba(16,185,129,0.12)', label: 'LOW'      },
  }[level] || { color: '#6b7280', bg: 'rgba(107,114,128,0.12)', label: level?.toUpperCase() || 'UNKNOWN' }

  return (
    <span style={{
      padding: '2px 8px', borderRadius: 100, fontSize: 10,
      fontFamily: 'JetBrains Mono, monospace', fontWeight: 700,
      background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.color}44`,
      letterSpacing: '0.05em',
    }}>
      {cfg.label}
    </span>
  )
}

// ── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status, takedownStatus }) {
  let icon, text, color

  if (status === 'takedown_completed') {
    if (takedownStatus === 'sent') {
      icon  = <CheckCircle size={11} />
      text  = 'DMCA SENT'
      color = '#10b981'
    } else if (takedownStatus === 'email_failed') {
      icon  = <AlertTriangle size={11} />
      text  = 'RETRY'
      color = '#f59e0b'
    } else {
      icon  = <Shield size={11} />
      text  = takedownStatus?.toUpperCase() || 'DONE'
      color = '#6b7280'
    }
  } else if (status === 'takedown_started') {
    icon  = <Zap size={11} />
    text  = 'FILING'
    color = '#a855f7'
  } else {
    icon  = <Clock size={11} />
    text  = 'DETECTED'
    color = '#f59e0b'
  }

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      padding: '2px 8px', borderRadius: 100, fontSize: 10,
      fontFamily: 'JetBrains Mono, monospace', fontWeight: 600,
      background: `${color}1a`, color, border: `1px solid ${color}44`,
    }}>
      {icon}
      {text}
    </span>
  )
}

// ── Score bar ─────────────────────────────────────────────────────────────────
function ScoreBar({ score }) {
  const pct   = Math.min(score * 10, 100)
  const color = score >= 8 ? '#ef4444' : score >= 5 ? '#f59e0b' : '#10b981'
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <div style={{
        flex: 1, height: 4, background: '#2a2a4a', borderRadius: 2, overflow: 'hidden',
      }}>
        <div style={{
          width: `${pct}%`, height: '100%', background: color,
          borderRadius: 2, transition: 'width 0.4s ease',
        }} />
      </div>
      <span style={{
        fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
        color, minWidth: 24, textAlign: 'right', fontWeight: 700,
      }}>
        {score?.toFixed(1)}
      </span>
    </div>
  )
}

// ── Threat row ────────────────────────────────────────────────────────────────
function ThreatRow({ threat, isFirst }) {
  const rowRef    = useRef(null)
  const isNew     = threat.isNew
  const timeLabel = threat.detected_at
    ? new Date(threat.detected_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : '—'

  useEffect(() => {
    if (isNew && rowRef.current) {
      rowRef.current.style.animation = 'none'
      // Trigger reflow
      void rowRef.current.offsetHeight
      rowRef.current.style.animation = 'threatPulse 1.2s ease-out'
    }
  }, [isNew])

  return (
    <tr
      ref={rowRef}
      style={{
        borderBottom: '1px solid #1a1a2e',
        background: isNew ? 'rgba(168,85,247,0.06)' : 'transparent',
        transition: 'background 0.6s ease',
      }}
    >
      <td style={{ padding: '10px 12px', maxWidth: 200 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, minWidth: 0 }}>
          {isNew && (
            <span style={{
              display: 'inline-block', width: 6, height: 6, borderRadius: '50%',
              background: '#a855f7', flexShrink: 0,
              boxShadow: '0 0 6px #a855f7',
              animation: 'livePulse 1s ease-in-out infinite',
            }} />
          )}
          <span style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: 12,
            color: '#e0e0ff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {threat.target}
          </span>
          {threat.url && (
            <a href={threat.url.startsWith('http') ? threat.url : `http://${threat.url}`}
               target="_blank" rel="noopener noreferrer"
               style={{ color: '#5c5880', flexShrink: 0 }}
               onClick={e => e.stopPropagation()}>
              <ExternalLink size={11} />
            </a>
          )}
        </div>
      </td>

      <td style={{ padding: '10px 8px' }}>
        <RiskBadge level={threat.risk_level} />
      </td>

      <td style={{ padding: '10px 8px', minWidth: 120 }}>
        <ScoreBar score={threat.threat_score} />
      </td>

      <td style={{ padding: '10px 8px' }}>
        <StatusBadge status={threat.status} takedownStatus={threat.takedown_status} />
      </td>

      <td style={{ padding: '10px 8px', color: '#5c5880', fontSize: 11, fontFamily: 'JetBrains Mono, monospace' }}>
        {timeLabel}
      </td>
    </tr>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
export function LiveThreatFeed({ threats = [], onClearNew, brand, maxRows = 25 }) {
  const hasThreats = threats.length > 0
  const shown      = threats.slice(0, maxRows)

  // Clear "new" flags after animation
  useEffect(() => {
    const hasNew = threats.some(t => t.isNew)
    if (!hasNew || !onClearNew) return
    const t = setTimeout(onClearNew, 1500)
    return () => clearTimeout(t)
  }, [threats, onClearNew])

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        padding: '14px 16px', borderBottom: '1px solid #2a2a4a',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ShieldAlert size={16} color="#a855f7" />
          <span style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: 12,
            color: '#e0e0ff', letterSpacing: '0.08em', textTransform: 'uppercase',
          }}>
            Live Threat Feed
          </span>
          {brand && (
            <span style={{
              fontSize: 11, color: '#5c5880', fontFamily: 'JetBrains Mono, monospace',
            }}>
              — {brand}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{
            display: 'inline-block', width: 7, height: 7, borderRadius: '50%',
            background: '#10b981', animation: 'livePulse 2s ease-in-out infinite',
          }} />
          <span style={{ fontSize: 11, color: '#10b981', fontFamily: 'JetBrains Mono, monospace' }}>
            LIVE
          </span>
          {threats.length > 0 && (
            <span style={{
              marginLeft: 8, fontSize: 11, color: '#5c5880',
              fontFamily: 'JetBrains Mono, monospace',
            }}>
              {threats.length} threat{threats.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Table */}
      {hasThreats ? (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#0d0d14' }}>
                {['Target', 'Risk', 'Score', 'Status', 'Time'].map(h => (
                  <th key={h} style={{
                    padding: '8px 12px', textAlign: 'left',
                    color: '#5c5880', fontSize: 10, fontWeight: 600,
                    fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.08em',
                    textTransform: 'uppercase', borderBottom: '1px solid #2a2a4a',
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {shown.map((t, i) => (
                <ThreatRow key={`${t.target}-${t.brand}`} threat={t} isFirst={i === 0} />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{
          padding: '40px 24px', textAlign: 'center',
          color: '#5c5880', fontFamily: 'JetBrains Mono, monospace', fontSize: 12,
        }}>
          <Shield size={32} color="#2a2a4a" style={{ marginBottom: 12 }} />
          <div>No threats detected yet.</div>
          <div style={{ fontSize: 11, marginTop: 6, color: '#3a3a5a' }}>
            Add a brand and run a scan to start monitoring.
          </div>
        </div>
      )}

      {/* Overflow indicator */}
      {threats.length > maxRows && (
        <div style={{
          padding: '8px 16px', borderTop: '1px solid #2a2a4a',
          color: '#5c5880', fontSize: 11, fontFamily: 'JetBrains Mono, monospace',
          textAlign: 'center',
        }}>
          +{threats.length - maxRows} more threats not shown
        </div>
      )}

      <style>{`
        @keyframes threatPulse {
          0%   { background: rgba(168,85,247,0.18); }
          100% { background: transparent; }
        }
        @keyframes livePulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
      `}</style>
    </div>
  )
}
