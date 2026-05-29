/**
 * ActivityTimeline — chronological feed of all pipeline events,
 * auto-scrolling to the latest entry. Renders inline (no modal).
 *
 * Props:
 *   events    — array from useThreatFeed().timeline (newest first)
 *   maxItems  — max events to render (default 50)
 *   compact   — if true, show condensed single-line rows
 */
import { useEffect, useRef } from 'react'
import {
  ShieldAlert, Zap, CheckCircle, ScanLine,
  Bell, AlertTriangle, Radio, Wifi, WifiOff,
} from 'lucide-react'

// ── Event config ──────────────────────────────────────────────────────────────

const EVENT_CFG = {
  threat_detected:    { icon: ShieldAlert,  color: '#ef4444', label: 'Threat Detected'     },
  takedown_started:   { icon: Zap,          color: '#a855f7', label: 'Takedown Started'     },
  takedown_completed: { icon: CheckCircle,  color: '#10b981', label: 'Takedown Completed'   },
  scan_queued:        { icon: Radio,        color: '#06b6d4', label: 'Scan Queued'          },
  scan_started:       { icon: ScanLine,     color: '#06b6d4', label: 'Scan Started'         },
  scan_completed:     { icon: ScanLine,     color: '#7c3aed', label: 'Scan Completed'       },
  alert_sent:         { icon: Bell,         color: '#f59e0b', label: 'Alert Sent'           },
  brand_added:        { icon: CheckCircle,  color: '#10b981', label: 'Brand Added'          },
  brand_deleted:      { icon: AlertTriangle,color: '#ef4444', label: 'Brand Removed'        },
}

function getCfg(eventType) {
  return EVENT_CFG[eventType] || { icon: Radio, color: '#5c5880', label: eventType }
}

// ── Summary line from event data ───────────────────────────────────────────────

function makeSummary(event) {
  const { event_type, data = {}, brand } = event

  switch (event_type) {
    case 'threat_detected':
      return `${data.target || '?'} — score ${data.threat_score?.toFixed(1) || '?'} (${data.risk_level || 'unknown'})`

    case 'takedown_started':
      return `Filing against ${data.target || '?'} [${data.takedown_id || ''}]`

    case 'takedown_completed':
      if (data.status === 'sent' && data.email_sent)
        return `DMCA sent to ${data.registrar_email || 'registrar'} for ${data.target}`
      return `${data.target || '?'} — status: ${data.status || '?'}`

    case 'scan_queued':
    case 'scan_started':
      return `${brand || ''} ${data.domain ? `(${data.domain})` : ''}`

    case 'scan_completed':
      return `${data.total_threats ?? '?'} threats found (${data.high_risk ?? 0} high-risk)`

    case 'alert_sent':
      return `${data.channel || 'WhatsApp'} — ${data.recipients_ok ?? 0} sent`

    default:
      return brand || event_type
  }
}

// ── Single event row ──────────────────────────────────────────────────────────

function EventRow({ event, compact }) {
  const cfg      = getCfg(event.event_type)
  const Icon     = cfg.icon
  const timeStr  = event.created_at
    ? new Date(event.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : '—'
  const summary  = makeSummary(event)

  if (compact) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '6px 0', borderBottom: '1px solid #1a1a2e',
      }}>
        <Icon size={12} color={cfg.color} style={{ flexShrink: 0 }} />
        <span style={{
          fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
          color: '#5c5880', minWidth: 54, flexShrink: 0,
        }}>
          {timeStr}
        </span>
        <span style={{
          fontSize: 12, color: '#e0e0ff',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {summary}
        </span>
      </div>
    )
  }

  return (
    <div style={{
      display: 'flex', gap: 12,
      padding: '12px 0', borderBottom: '1px solid #1a1a2e',
    }}>
      {/* Icon column */}
      <div style={{
        width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
        background: `${cfg.color}18`, border: `1px solid ${cfg.color}33`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={14} color={cfg.color} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
          <span style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
            color: cfg.color, fontWeight: 700, letterSpacing: '0.04em',
          }}>
            {cfg.label}
          </span>
          <span style={{
            fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
            color: '#3a3a5a', flexShrink: 0, marginLeft: 8,
          }}>
            {timeStr}
          </span>
        </div>
        <div style={{
          fontSize: 12, color: '#9090b0',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {summary}
        </div>
        {event.brand && (
          <div style={{
            marginTop: 3, fontSize: 10,
            color: '#5c5880', fontFamily: 'JetBrains Mono, monospace',
          }}>
            {event.brand}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function ActivityTimeline({ events = [], maxItems = 50, compact = false, connected }) {
  const bottomRef = useRef(null)
  const shown     = events.slice(0, maxItems)

  // Auto-scroll to top (newest) on new events
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [events.length])

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        padding: '14px 16px', borderBottom: '1px solid #2a2a4a',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <span style={{
          fontFamily: 'JetBrains Mono, monospace', fontSize: 12,
          color: '#e0e0ff', letterSpacing: '0.08em', textTransform: 'uppercase',
        }}>
          Activity Timeline
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          {connected === true  && <Wifi    size={13} color="#10b981" />}
          {connected === false && <WifiOff size={13} color="#ef4444" />}
          <span style={{
            fontSize: 10, fontFamily: 'JetBrains Mono, monospace',
            color: connected ? '#10b981' : connected === false ? '#ef4444' : '#5c5880',
          }}>
            {connected === true ? 'LIVE' : connected === false ? 'OFFLINE' : 'CONNECTING'}
          </span>
        </div>
      </div>

      {/* Events list */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '0 16px',
        maxHeight: compact ? 260 : 420,
      }}>
        {shown.length === 0 ? (
          <div style={{
            padding: '32px 0', textAlign: 'center',
            color: '#3a3a5a', fontFamily: 'JetBrains Mono, monospace', fontSize: 12,
          }}>
            Waiting for events…
          </div>
        ) : (
          shown.map((ev, i) => (
            <EventRow key={`${ev.id || i}-${ev.event_type}-${ev.created_at}`} event={ev} compact={compact} />
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {events.length > maxItems && (
        <div style={{
          padding: '8px 16px', borderTop: '1px solid #2a2a4a',
          color: '#5c5880', fontSize: 10, fontFamily: 'JetBrains Mono, monospace',
          textAlign: 'center', flexShrink: 0,
        }}>
          showing {maxItems} of {events.length} events
        </div>
      )}
    </div>
  )
}
