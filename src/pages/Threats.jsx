import { useEffect, useState, useMemo } from 'react'
import { ShieldAlert, X as XIcon } from 'lucide-react'
import { api } from '../api/client'

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

function ThreatModal({ threat, brand, onClose }) {
  const [filing, setFiling] = useState(false)
  const [filed, setFiled]   = useState(false)

  const fileTakedown = async () => {
    setFiling(true)
    try {
      await api.fileTakedown({
        threat_type: threat.type === 'twitter' ? 'x' : threat.type,
        target: threat.domain || threat.handle || threat.username,
        platform: threat.platform === 'twitter' ? 'x' : (threat.platform || null),
        brand: brand || threat._scan_target || '',
        scan_id: threat._scan_id || null,
        threat_score: threat.threat_score,
        flags: threat.flags ?? [],
      })
      setFiled(true)
    } catch { /* silent */ } finally { setFiling(false) }
  }

  const url = threat.domain || threat.profile_url || threat.url || ''
  // Replace twitter.com with x.com
  const displayUrl = url.replace('twitter.com', 'x.com')

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(13,13,20,0.88)',
      zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24,
    }} onClick={onClose}>
      <div className="card" style={{ width: '100%', maxWidth: 600, padding: 0, overflow: 'hidden' }}
        onClick={e => e.stopPropagation()}>
        <div style={{
          padding: '20px 24px', borderBottom: '1px solid #2a2a4a',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12,
        }}>
          <div>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: '#a855f7', marginBottom: 6 }}>
              {threat.domain || `@${threat.handle || threat.username}` || '—'}
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <SevBadge sev={threat.severity} />
              <span className="badge badge-purple" style={{ fontSize: 10 }}>
                {threat.type === 'twitter' ? 'x' : threat.type}
              </span>
            </div>
          </div>
          <button className="btn-ghost" onClick={onClose} style={{ padding: '4px 10px', fontSize: 18, lineHeight: 1 }}>
            <XIcon size={16} />
          </button>
        </div>

        <div style={{ padding: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
            {[
              ['IP', threat.ip],
              ['Registrar', threat.registrar],
              ['HTTP Status', threat.http_status],
              ['Age', threat.age_days != null ? `${threat.age_days} days` : null],
              ['Platform', threat.platform === 'twitter' ? 'X' : threat.platform],
              ['Followers', threat.followers_raw],
              ['Verified', threat.verified != null ? (threat.verified ? 'Yes' : 'No') : null],
              ['Safe Browsing', threat.safe_browsing_flagged != null ? (threat.safe_browsing_flagged ? '⚠ Flagged' : 'Clean') : null],
              ['Title', threat.title?.slice(0, 80)],
              ['Bio', threat.bio?.slice(0, 80)],
            ].filter(([, v]) => v != null).map(([k, v]) => (
              <div key={k}>
                <div style={{ fontSize: 10, color: '#5c5880', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 2 }}>{k}</div>
                <div style={{ fontSize: 13, fontFamily: 'JetBrains Mono, monospace', color: '#f1f0ff' }}>{v}</div>
              </div>
            ))}
          </div>

          {(threat.flags || []).length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 10, color: '#5c5880', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 8 }}>Flags</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                <IntelBadges flags={threat.flags} />
                {threat.flags.filter(f => !INTEL_FLAGS[f]).map(f => (
                  <span key={f} style={{
                    padding: '3px 10px', borderRadius: 4, fontSize: 11,
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

          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            {filed
              ? <span style={{ color: '#10b981', fontSize: 13 }}>✓ Takedown filed</span>
              : <button
                  onClick={fileTakedown} disabled={filing}
                  style={{
                    padding: '9px 20px', borderRadius: 8, border: 'none', cursor: 'pointer',
                    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                    color: '#1a0a00', fontWeight: 700, fontSize: 13,
                    display: 'flex', alignItems: 'center', gap: 6,
                    opacity: filing ? 0.7 : 1, transition: 'all 0.15s',
                  }}>
                  ⚡ {filing ? 'Filing…' : 'File Takedown'}
                </button>
            }
            {displayUrl && (
              <a href={displayUrl} target="_blank" rel="noopener noreferrer" className="btn-ghost"
                style={{ textDecoration: 'none' }}>
                Open ↗
              </a>
            )}
          </div>
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
          <div style={{ padding: 40, textAlign: 'center', color: '#5c5880' }}>Loading threats…</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#5c5880' }}>
            {threats.length === 0 ? 'No threats found — run a scan first' : 'No threats match current filters'}
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
