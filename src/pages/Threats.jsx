import { useEffect, useState, useMemo } from 'react'
import { ShieldAlert, X as XIcon, ScanLine } from 'lucide-react'
import { api } from '../api/client'
import { SkeletonTable } from '../components/Skeleton'

function allThreatsFromScans(scans) {
  return scans.flatMap(s => {
    const d = s.results?.domain_results?.threats ?? s.results?.domain_results ?? s.results?.threats ?? []
    const social = s.results?.social_results?.threats ?? s.results?.social_results ?? []
    return [
      ...d.map(t => ({ ...t, type: 'domain', _scan_target: s.target, _scan_id: s.scan_id, _scan_date: s.started_at })),
      ...social.map(t => ({
        ...t,
        type: t.platform === 'twitter' ? 'x' : (t.platform || 'social'),
        _scan_target: s.target, _scan_id: s.scan_id, _scan_date: s.started_at,
      })),
    ]
  })
}

function SevBadge({ sev }) {
  const clr = sev === 'high' || sev === 'critical' ? '#ef4444' : sev === 'medium' ? '#f59e0b' : '#10b981'
  const bg  = sev === 'high' || sev === 'critical' ? 'rgba(239,68,68,0.15)' : sev === 'medium' ? 'rgba(245,158,11,0.15)' : 'rgba(16,185,129,0.12)'
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

const SOURCE_BADGES = {
  nitter:          { label: 'Nitter',      color: '#a855f7', bg: 'rgba(168,85,247,0.12)' },
  invidious_api:   { label: 'Invidious',   color: '#a855f7', bg: 'rgba(168,85,247,0.12)' },
  invidious_search:{ label: 'Invidious',   color: '#a855f7', bg: 'rgba(168,85,247,0.12)' },
  proxitok:        { label: 'Proxitok',    color: '#f472b6', bg: 'rgba(244,114,182,0.12)' },
  instaloader:     { label: 'Instaloader', color: '#fb923c', bg: 'rgba(251,146,60,0.12)'  },
  snscrape:        { label: 'SNScrape',    color: '#60a5fa', bg: 'rgba(96,165,250,0.12)'  },
  http_scrape:     { label: 'HTTP',        color: '#94a3b8', bg: 'rgba(148,163,184,0.12)' },
}

function SourceBadge({ source }) {
  const cfg = SOURCE_BADGES[source]
  if (!cfg) return null
  return (
    <span style={{
      padding: '1px 6px', borderRadius: 4, fontSize: 9,
      fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.06em',
      background: cfg.bg, color: cfg.color,
    }}>{cfg.label}</span>
  )
}

const INTEL_FLAGS = {
  KNOWN_THREAT_DATABASE: { label: 'Intel Hit',  color: '#ef4444', bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.35)' },
  URLHAUS_LISTED:        { label: 'URLhaus DB', color: '#ef4444', bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.35)' },
  OPENPHISH_LISTED:      { label: 'OpenPhish',  color: '#ef4444', bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.35)' },
  SAFE_BROWSING_HIT:     { label: 'Safe Browse', color: '#ef4444', bg: 'rgba(239,68,68,0.15)', border: 'rgba(239,68,68,0.35)' },
}

function IntelBadges({ flags = [] }) {
  const hits = flags.filter(f => INTEL_FLAGS[f])
  if (!hits.length) return null
  return (
    <>
      {hits.map(f => {
        const cfg = INTEL_FLAGS[f]
        return (
          <span key={f} style={{
            padding: '2px 7px', borderRadius: 4, fontSize: 10,
            fontFamily: 'JetBrains Mono, monospace', fontWeight: 700,
            background: cfg.bg, color: cfg.color,
            border: `1px solid ${cfg.border}`, letterSpacing: '0.04em',
          }}>⚑ {cfg.label}</span>
        )
      })}
    </>
  )
}

// ── 4-Tab Threat Detail Modal ─────────────────────────────────────────────────
function ThreatModal({ threat, brand, onClose }) {
  const [tab,    setTab]    = useState('overview')
  const [filing, setFiling] = useState(false)
  const [filed,  setFiled]  = useState(false)
  const [fpDone, setFpDone] = useState(false)

  const fileTakedown = async () => {
    setFiling(true)
    try {
      await api.fileTakedown({
        threat_type: threat.type === 'twitter' ? 'x' : threat.type,
        target:      threat.domain || threat.handle || threat.username,
        platform:    threat.platform === 'twitter' ? 'x' : (threat.platform || null),
        brand:       brand || threat._scan_target || '',
        scan_id:     threat._scan_id || null,
        threat_score: threat.threat_score,
        flags:       threat.flags ?? [],
      })
      setFiled(true)
    } catch { /* silent */ } finally { setFiling(false) }
  }

  const url        = threat.domain || threat.profile_url || threat.url || ''
  const displayUrl = url.replace('twitter.com', 'x.com')
  const score      = threat.threat_score || 0
  const scoreColor = score >= 8 ? '#ef4444' : score >= 5 ? '#f59e0b' : '#10b981'

  const TABS = [
    { id: 'overview',  label: 'Overview'    },
    { id: 'detectors', label: 'Detectors'   },
    { id: 'evidence',  label: 'Evidence'    },
    { id: 'timeline',  label: 'Timeline'    },
  ]

  const detectors = threat.detector_results || threat.detectors || []
  const evidence  = threat.evidence || {}
  const aiTriage  = threat.ai_triage

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(13,13,20,0.9)',
      zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }} onClick={onClose}>
      <div
        className="card"
        style={{ width: '100%', maxWidth: 680, padding: 0, overflow: 'hidden', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Modal header */}
        <div style={{
          padding: '18px 24px', borderBottom: '1px solid #2a2a4a',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12,
          flexShrink: 0,
        }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: 'JetBrains Mono, monospace', fontSize: 14, color: '#a855f7',
              marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {threat.domain || `@${threat.handle || threat.username}` || '—'}
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <SevBadge sev={threat.severity} />
              <span className="badge badge-purple" style={{ fontSize: 10 }}>
                {threat.type === 'twitter' ? 'x' : threat.type}
              </span>
              {aiTriage && (
                <span style={{
                  padding: '2px 9px', borderRadius: 4, fontSize: 10, fontWeight: 700,
                  background: 'rgba(124,58,237,0.15)', color: '#a855f7',
                  border: '1px solid rgba(124,58,237,0.3)',
                  fontFamily: 'JetBrains Mono, monospace',
                }}>
                  🤖 AI: {aiTriage.action || aiTriage.priority || 'TRIAGED'} ({Math.round((aiTriage.confidence || 0) * 100)}%)
                </span>
              )}
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#5c5880', cursor: 'pointer', fontSize: 20, lineHeight: 1, flexShrink: 0 }}>✕</button>
        </div>

        {/* Tab nav */}
        <div style={{
          display: 'flex', gap: 0, borderBottom: '1px solid #2a2a4a',
          background: '#0d0d18', flexShrink: 0,
        }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              flex: 1, padding: '10px 8px', border: 'none', cursor: 'pointer', fontSize: 11,
              fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.06em',
              background: tab === t.id ? 'rgba(124,58,237,0.12)' : 'transparent',
              color: tab === t.id ? '#a855f7' : '#5c5880',
              borderBottom: `2px solid ${tab === t.id ? '#7c3aed' : 'transparent'}`,
              transition: 'all 0.15s',
            }}>
              {t.label.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Tab body */}
        <div style={{ padding: 24, overflowY: 'auto', flex: 1 }}>

          {/* TAB 1 — OVERVIEW */}
          {tab === 'overview' && (
            <div>
              {/* Score ring + quick stats */}
              <div style={{ display: 'flex', gap: 24, marginBottom: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                {/* Score ring */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <svg width={90} height={90} viewBox="0 0 90 90">
                    <circle cx={45} cy={45} r={38} fill="none" stroke="#1a1a2e" strokeWidth={8} />
                    <circle cx={45} cy={45} r={38} fill="none" stroke={scoreColor} strokeWidth={8}
                      strokeDasharray={2 * Math.PI * 38}
                      strokeDashoffset={2 * Math.PI * 38 * (1 - score / 10)}
                      strokeLinecap="round" transform="rotate(-90 45 45)"
                      style={{ filter: `drop-shadow(0 0 4px ${scoreColor})` }}
                    />
                    <text x={45} y={49} textAnchor="middle" fill={scoreColor} fontSize={18} fontWeight={700} fontFamily="JetBrains Mono, monospace">
                      {score.toFixed(1)}
                    </text>
                    <text x={45} y={63} textAnchor="middle" fill="#5c5880" fontSize={8} fontFamily="JetBrains Mono, monospace">/10</text>
                  </svg>
                  <div style={{ fontSize: 9, color: '#5c5880', letterSpacing: '0.1em', fontFamily: 'JetBrains Mono, monospace' }}>THREAT SCORE</div>
                </div>

                {/* Key fields */}
                <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px 24px' }}>
                  {[
                    ['IP Address',    threat.ip],
                    ['Registrar',     threat.registrar],
                    ['HTTP Status',   threat.http_status],
                    ['Domain Age',    threat.age_days != null ? `${threat.age_days}d` : null],
                    ['Platform',      threat.platform === 'twitter' ? 'X (Twitter)' : threat.platform],
                    ['Followers',     threat.followers_raw],
                    ['Verified',      threat.verified != null ? (threat.verified ? '✓ Yes' : '✗ No') : null],
                    ['Safe Browsing', threat.safe_browsing_flagged != null ? (threat.safe_browsing_flagged ? '⚠ Flagged' : '✓ Clean') : null],
                    ['Title',         threat.title?.slice(0, 60)],
                    ['Bio',           threat.bio?.slice(0, 60)],
                    ['Scan',          threat._scan_target],
                    ['Detected',      threat._scan_date ? new Date(threat._scan_date).toLocaleDateString('en-IN') : null],
                  ].filter(([, v]) => v != null).map(([k, v]) => (
                    <div key={k}>
                      <div style={{ fontSize: 9, color: '#5c5880', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 2 }}>{k}</div>
                      <div style={{ fontSize: 12, fontFamily: 'JetBrains Mono, monospace', color: '#f1f0ff' }}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Flags */}
              {(threat.flags || []).length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 9, color: '#5c5880', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Detection Flags</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    <IntelBadges flags={threat.flags} />
                    {(threat.flags || []).filter(f => !INTEL_FLAGS[f]).map(f => (
                      <span key={f} style={{
                        padding: '3px 10px', borderRadius: 4, fontSize: 10,
                        fontFamily: 'JetBrains Mono, monospace',
                        background: 'rgba(245,158,11,0.1)', color: '#f59e0b',
                        border: '1px solid rgba(245,158,11,0.2)',
                      }}>
                        {f.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* AI triage detail */}
              {aiTriage && (
                <div style={{
                  padding: '12px 16px', borderRadius: 8, marginBottom: 16,
                  background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)',
                }}>
                  <div style={{ fontSize: 10, color: '#a855f7', fontFamily: 'JetBrains Mono, monospace', marginBottom: 6, letterSpacing: '0.08em' }}>
                    🤖 AI TRIAGE ANALYSIS
                  </div>
                  <div style={{ fontSize: 12, color: '#f1f0ff', marginBottom: 4 }}>
                    <strong>Action:</strong> {aiTriage.action || aiTriage.priority || 'Review'}
                  </div>
                  {aiTriage.reason && (
                    <div style={{ fontSize: 12, color: '#a8a4c8' }}>{aiTriage.reason}</div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2 — DETECTOR BREAKDOWN */}
          {tab === 'detectors' && (
            <div>
              {detectors.length === 0 ? (
                <div style={{ padding: '32px 0', textAlign: 'center', color: '#5c5880', fontSize: 13 }}>
                  No individual detector data available for this threat.
                  <div style={{ marginTop: 8, fontSize: 12 }}>Detector breakdown is captured on full scans.</div>
                </div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid #2a2a4a' }}>
                      {['Detector', 'Score', 'Weight', 'Contribution', 'Flags'].map(h => (
                        <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontSize: 9, color: '#5c5880', letterSpacing: '0.08em', textTransform: 'uppercase' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {detectors.map((d, i) => {
                      const ds    = d.score ?? d.confidence ?? 0
                      const dw    = d.weight ?? 1
                      const color = ds >= 0.8 ? '#ef4444' : ds >= 0.5 ? '#f59e0b' : '#10b981'
                      return (
                        <tr key={i} style={{ borderBottom: '1px solid rgba(42,42,74,0.4)' }}>
                          <td style={{ padding: '10px', fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#f1f0ff' }}>
                            {d.detector || d.name}
                          </td>
                          <td style={{ padding: '10px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{ width: 60, height: 5, background: '#1a1a2e', borderRadius: 2, overflow: 'hidden' }}>
                                <div style={{ height: '100%', width: `${ds * 100}%`, background: color, borderRadius: 2 }} />
                              </div>
                              <span style={{ fontSize: 11, color, fontFamily: 'JetBrains Mono, monospace' }}>{(ds * 10).toFixed(1)}</span>
                            </div>
                          </td>
                          <td style={{ padding: '10px', fontSize: 11, color: '#5c5880', fontFamily: 'JetBrains Mono, monospace' }}>
                            ×{dw}
                          </td>
                          <td style={{ padding: '10px', fontSize: 11, fontWeight: 700, color, fontFamily: 'JetBrains Mono, monospace' }}>
                            {(ds * dw * 10).toFixed(2)}
                          </td>
                          <td style={{ padding: '10px' }}>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
                              {(d.reasons || d.flags || []).slice(0, 3).map((f, fi) => (
                                <span key={fi} style={{ fontSize: 9, padding: '1px 5px', borderRadius: 3, background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}>
                                  {String(f).replace(/_/g, ' ').slice(0, 20)}
                                </span>
                              ))}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* TAB 3 — EVIDENCE */}
          {tab === 'evidence' && (
            <div>
              {/* Screenshot */}
              {(threat.screenshot_url || evidence.screenshot) && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 9, color: '#5c5880', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Screenshot</div>
                  <img
                    src={threat.screenshot_url || evidence.screenshot}
                    alt="threat screenshot"
                    style={{ width: '100%', borderRadius: 8, border: '1px solid #2a2a4a', maxHeight: 240, objectFit: 'cover' }}
                    onError={e => { e.target.style.display = 'none' }}
                  />
                </div>
              )}

              {/* WHOIS data */}
              {(evidence.whois || threat.whois) && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 9, color: '#5c5880', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>WHOIS Data</div>
                  <pre style={{
                    background: '#08080f', borderRadius: 8, padding: '12px 14px',
                    fontSize: 10, fontFamily: 'JetBrains Mono, monospace', color: '#a8a4c8',
                    overflowX: 'auto', border: '1px solid #1a1a2e', maxHeight: 160, overflowY: 'auto',
                  }}>
                    {typeof evidence.whois === 'object' ? JSON.stringify(evidence.whois, null, 2) : evidence.whois || threat.whois}
                  </pre>
                </div>
              )}

              {/* DNS records */}
              {(evidence.dns || threat.dns_records) && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 9, color: '#5c5880', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>DNS Records</div>
                  <pre style={{
                    background: '#08080f', borderRadius: 8, padding: '12px 14px',
                    fontSize: 10, fontFamily: 'JetBrains Mono, monospace', color: '#10b981',
                    overflowX: 'auto', border: '1px solid #1a1a2e',
                  }}>
                    {typeof (evidence.dns || threat.dns_records) === 'object'
                      ? JSON.stringify(evidence.dns || threat.dns_records, null, 2)
                      : evidence.dns || threat.dns_records}
                  </pre>
                </div>
              )}

              {/* HTTP headers */}
              {evidence.http_headers && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 9, color: '#5c5880', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>HTTP Headers</div>
                  <pre style={{
                    background: '#08080f', borderRadius: 8, padding: '12px 14px',
                    fontSize: 10, fontFamily: 'JetBrains Mono, monospace', color: '#a8a4c8',
                    overflowX: 'auto', border: '1px solid #1a1a2e', maxHeight: 160, overflowY: 'auto',
                  }}>
                    {typeof evidence.http_headers === 'object' ? JSON.stringify(evidence.http_headers, null, 2) : evidence.http_headers}
                  </pre>
                </div>
              )}

              {!threat.screenshot_url && !evidence.screenshot && !evidence.whois && !threat.whois && !evidence.dns && !threat.dns_records && (
                <div style={{ padding: '32px 0', textAlign: 'center', color: '#5c5880', fontSize: 13 }}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>📁</div>
                  No evidence data captured for this threat.
                  <div style={{ marginTop: 8, fontSize: 12 }}>Evidence is collected during full domain scans.</div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4 — TIMELINE */}
          {tab === 'timeline' && (
            <div>
              {(() => {
                const events = [
                  { icon: '🔍', label: 'Detected',       color: '#ef4444', date: threat._scan_date || threat.discovered_at,  done: true },
                  { icon: '🔔', label: 'Alert Sent',      color: '#f59e0b', date: threat.alerted_at,                          done: !!threat.alerted_at },
                  { icon: '⚡', label: 'Takedown Filed',  color: '#7c3aed', date: threat.takedown_filed_at,                    done: !!threat.takedown_filed_at || filed },
                  { icon: '✅', label: 'Resolved',        color: '#10b981', date: threat.resolved_at,                          done: !!threat.resolved_at },
                ]
                return (
                  <div style={{ position: 'relative', paddingLeft: 40 }}>
                    {/* Vertical line */}
                    <div style={{ position: 'absolute', left: 15, top: 16, bottom: 16, width: 2, background: '#2a2a4a' }} />

                    {events.map((ev, i) => (
                      <div key={i} style={{ position: 'relative', marginBottom: 28 }}>
                        {/* Dot */}
                        <div style={{
                          position: 'absolute', left: -31, width: 14, height: 14, borderRadius: '50%',
                          background: ev.done ? ev.color : '#2a2a4a',
                          border: `2px solid ${ev.done ? ev.color : '#3a3a6a'}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          boxShadow: ev.done ? `0 0 8px ${ev.color}60` : 'none',
                          top: 3,
                        }} />

                        <div style={{ opacity: ev.done ? 1 : 0.4 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                            <span style={{ fontSize: 14 }}>{ev.icon}</span>
                            <span style={{ fontSize: 13, fontWeight: 700, color: ev.done ? '#f1f0ff' : '#5c5880' }}>{ev.label}</span>
                          </div>
                          <div style={{ fontSize: 11, color: ev.done ? '#5c5880' : '#3a3060', fontFamily: 'JetBrains Mono, monospace' }}>
                            {ev.date
                              ? new Date(ev.date).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })
                              : ev.done ? 'Completed' : 'Pending'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              })()}
            </div>
          )}
        </div>

        {/* Action bar */}
        <div style={{
          padding: '14px 24px', borderTop: '1px solid #2a2a4a',
          display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', flexShrink: 0,
          background: '#0d0d18',
        }}>
          {filed ? (
            <span style={{ color: '#10b981', fontSize: 13, fontWeight: 600 }}>✓ Takedown filed successfully</span>
          ) : (
            <button
              onClick={fileTakedown} disabled={filing}
              style={{
                padding: '8px 18px', borderRadius: 8, border: 'none', cursor: 'pointer',
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: '#1a0a00', fontWeight: 700, fontSize: 12,
                display: 'flex', alignItems: 'center', gap: 6,
                opacity: filing ? 0.7 : 1,
              }}
            >
              ⚡ {filing ? 'Filing…' : 'File Takedown'}
            </button>
          )}

          {!fpDone && (
            <button
              onClick={() => setFpDone(true)}
              className="btn-outline" style={{ fontSize: 12 }}
            >
              ✓ Mark False Positive
            </button>
          )}
          {fpDone && <span style={{ color: '#5c5880', fontSize: 12 }}>Marked as false positive</span>}

          {displayUrl && (
            <a href={displayUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost" style={{ textDecoration: 'none', fontSize: 12 }}>
              Open ↗
            </a>
          )}

          <button onClick={onClose} className="btn-ghost" style={{ marginLeft: 'auto', fontSize: 12 }}>
            <XIcon size={13} /> Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Threats() {
  const [scans, setScans]         = useState([])
  const [loading, setLoading]     = useState(true)
  const [severity, setSeverity]   = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [search, setSearch]       = useState('')
  const [selected, setSelected]   = useState(null)

  useEffect(() => {
    api.listScans()
      .then(data => setScans(data.scans ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const threats = useMemo(() => allThreatsFromScans(scans), [scans])
  const primaryBrand = scans[0]?.target ?? ''

  const types = useMemo(() => {
    const set = new Set(threats.map(t => t.type).filter(Boolean))
    return ['all', ...Array.from(set)]
  }, [threats])

  const filtered = useMemo(() => {
    let t = threats
    if (severity !== 'all') t = t.filter(x => x.severity === severity || (severity === 'high' && x.severity === 'critical'))
    if (typeFilter !== 'all') t = t.filter(x => x.type === typeFilter)
    if (search) t = t.filter(x =>
      (x.domain || x.handle || x.username || '').toLowerCase().includes(search.toLowerCase())
    )
    return [...t].sort((a, b) => (b.threat_score || 0) - (a.threat_score || 0))
  }, [threats, severity, typeFilter, search])

  const counts = useMemo(() => ({
    high:   threats.filter(t => t.severity === 'high' || t.severity === 'critical').length,
    medium: threats.filter(t => t.severity === 'medium').length,
    low:    threats.filter(t => t.severity === 'low').length,
  }), [threats])

  return (
    <div className="page-enter" style={{ padding: '28px 32px', maxWidth: 1200, margin: '0 auto' }}>
      {selected && <ThreatModal threat={selected} brand={primaryBrand} onClose={() => setSelected(null)} />}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
            <ShieldAlert size={22} color="#ef4444" />
            <h1 style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 20, fontWeight: 700, margin: 0, letterSpacing: '0.05em' }}>
              THREATS
            </h1>
          </div>
          <p style={{ color: '#5c5880', fontSize: 13, margin: 0 }}>{threats.length} total detected across all scans</p>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          {[
            { label: 'HIGH',   count: counts.high,   color: '#ef4444' },
            { label: 'MEDIUM', count: counts.medium, color: '#f59e0b' },
            { label: 'LOW',    count: counts.low,    color: '#10b981' },
          ].map(s => (
            <div key={s.label} className="card" style={{ padding: '10px 18px', textAlign: 'center', minWidth: 64 }}>
              <div style={{ fontSize: 20, fontWeight: 700, color: s.color, fontFamily: 'JetBrains Mono, monospace' }}>{s.count}</div>
              <div style={{ fontSize: 9, color: '#5c5880', letterSpacing: '0.08em' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: '12px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 10, color: '#5c5880', letterSpacing: '0.08em', fontFamily: 'JetBrains Mono, monospace' }}>FILTER</span>

        {/* Severity */}
        <div style={{ display: 'flex', gap: 6 }}>
          {['all', 'high', 'medium', 'low'].map(s => {
            const activeColor = s === 'high' ? '#ef4444' : s === 'medium' ? '#f59e0b' : s === 'low' ? '#10b981' : '#7c3aed'
            return (
              <button key={s} onClick={() => setSeverity(s)} style={{
                padding: '4px 14px', borderRadius: 100, fontSize: 11, cursor: 'pointer', border: '1px solid',
                fontFamily: 'JetBrains Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.04em',
                transition: 'all 0.15s',
                background: severity === s ? activeColor : 'transparent',
                borderColor: severity === s ? 'transparent' : '#2a2a4a',
                color: severity === s ? '#0d0d14' : '#5c5880',
              }}>{s}</button>
            )
          })}
        </div>

        {/* Type */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {types.map(t => (
            <button key={t} onClick={() => setTypeFilter(t)} style={{
              padding: '4px 14px', borderRadius: 100, fontSize: 11, cursor: 'pointer', border: '1px solid',
              fontFamily: 'JetBrains Mono, monospace', transition: 'all 0.15s',
              background: typeFilter === t ? 'rgba(124,58,237,0.2)' : 'transparent',
              borderColor: typeFilter === t ? '#7c3aed' : '#2a2a4a',
              color: typeFilter === t ? '#a855f7' : '#5c5880',
            }}>{t}</button>
          ))}
        </div>

        {/* Search */}
        <input
          placeholder="Search domain/handle…"
          value={search} onChange={e => setSearch(e.target.value)}
          style={{
            marginLeft: 'auto', width: 200, padding: '5px 12px', borderRadius: 6,
            background: '#1a1a2e', border: '1px solid #2a2a4a', color: '#f1f0ff',
            fontSize: 12, outline: 'none',
          }}
          onFocus={e => { e.target.style.borderColor = '#7c3aed' }}
          onBlur={e => { e.target.style.borderColor = '#2a2a4a' }}
        />
        <span style={{ color: '#5c5880', fontSize: 12, fontFamily: 'JetBrains Mono, monospace', whiteSpace: 'nowrap' }}>
          {filtered.length} results
        </span>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <SkeletonTable rows={8} cols={7} />
        ) : filtered.length === 0 ? (
          <div style={{ padding: '56px 24px', textAlign: 'center' }}>
            {threats.length === 0 ? (
              <>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🛡️</div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 16, fontWeight: 700, color: '#f1f0ff', marginBottom: 8 }}>
                  No threats detected yet
                </div>
                <div style={{ color: '#5c5880', fontSize: 13, marginBottom: 24, maxWidth: 380, margin: '0 auto 24px' }}>
                  Your brand is either threat-free or you haven't run a scan yet.
                  Start a scan to monitor for lookalike domains, fake social accounts, and more.
                </div>
                <a href="/scan" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  padding: '10px 24px', borderRadius: 8, fontSize: 13, fontWeight: 700,
                  background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                  color: '#fff', textDecoration: 'none',
                }}>
                  <ScanLine size={14} /> Run First Scan
                </a>
              </>
            ) : (
              <>
                <div style={{ fontSize: 36, marginBottom: 12 }}>🔍</div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 14, fontWeight: 700, color: '#f1f0ff', marginBottom: 8 }}>
                  No threats match your filters
                </div>
                <div style={{ color: '#5c5880', fontSize: 13 }}>
                  Try adjusting the severity filter or clearing your search query.
                </div>
                <button
                  onClick={() => { setSeverity('all'); setTypeFilter('all'); setSearch('') }}
                  style={{
                    marginTop: 16, padding: '8px 20px', borderRadius: 8, cursor: 'pointer',
                    background: 'transparent', border: '1px solid #2a2a4a', color: '#a8a4c8', fontSize: 12,
                  }}
                >
                  Clear all filters
                </button>
              </>
            )}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="cyber-table">
              <thead>
                <tr><th>Target</th><th>Type</th><th>Severity</th><th>Score</th><th>Flags</th><th>Source</th><th>Scan Date</th><th></th></tr>
              </thead>
              <tbody>
                {filtered.map((t, i) => {
                  const borderColor = t.severity === 'high' || t.severity === 'critical' ? '#ef4444' : t.severity === 'medium' ? '#f59e0b' : '#10b981'
                  return (
                    <tr key={i} style={{ cursor: 'pointer', borderLeft: `3px solid ${borderColor}20` }} onClick={() => setSelected(t)}>
                      <td>
                        <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#a855f7' }}>
                          {(t.domain || `@${t.handle || t.username}` || '—').slice(0, 38)}
                        </span>
                        {t._scan_target && <div style={{ fontSize: 10, color: '#5c5880', marginTop: 2 }}>{t._scan_target}</div>}
                      </td>
                      <td><span className="badge badge-purple" style={{ fontSize: 10 }}>{t.type}</span></td>
                      <td><SevBadge sev={t.severity} /></td>
                      <td>
                        <span style={{
                          fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 700,
                          color: (t.threat_score || 0) >= 8 ? '#ef4444' : (t.threat_score || 0) >= 5 ? '#f59e0b' : '#10b981',
                        }}>
                          {t.threat_score?.toFixed(1) ?? '—'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                          <IntelBadges flags={t.flags || []} />
                          {(t.flags || []).filter(f => !INTEL_FLAGS[f]).slice(0, 2).map(f => (
                            <span key={f} style={{
                              fontSize: 10, padding: '2px 6px', borderRadius: 3,
                              background: 'rgba(245,158,11,0.1)', color: '#f59e0b',
                              fontFamily: 'JetBrains Mono, monospace',
                            }}>
                              {f.replace(/_/g, ' ')}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td><SourceBadge source={t.source} /></td>
                      <td style={{ fontSize: 11, color: '#5c5880', fontFamily: 'JetBrains Mono, monospace' }}>
                        {t._scan_date ? new Date(t._scan_date).toLocaleDateString('en-IN') : '—'}
                      </td>
                      <td style={{ color: '#5c5880', fontSize: 16 }}>›</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
