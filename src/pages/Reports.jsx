import { useEffect, useState } from 'react'
import { FileBarChart, Download, RefreshCw, ChevronDown } from 'lucide-react'
import { api } from '../api/client'

const DATE_RANGES = ['Last 7 days', 'Last 30 days', 'Last 90 days']

const SECTIONS = [
  { key: 'summary',    label: 'Executive Summary',      default: true  },
  { key: 'domains',    label: 'Domain Threats',         default: true  },
  { key: 'social',     label: 'Social Media Threats',   default: true  },
  { key: 'takedowns',  label: 'Takedown Operations',    default: true  },
  { key: 'evidence',   label: 'Evidence Packages',      default: false },
  { key: 'timeline',   label: 'Threat Timeline',        default: false },
]

const inputStyle = {
  padding: '10px 14px', borderRadius: 8,
  background: '#1a1a2e', border: '1px solid #2a2a4a', color: '#f1f0ff',
  fontSize: 13, outline: 'none', width: '100%', boxSizing: 'border-box',
}

export default function Reports() {
  const [brands,       setBrands]      = useState([])
  const [brand,        setBrand]       = useState('')
  const [dateRange,    setDateRange]   = useState('Last 30 days')
  const [sections,     setSections]    = useState(
    Object.fromEntries(SECTIONS.map(s => [s.key, s.default]))
  )
  const [format,       setFormat]      = useState('PDF')
  const [generating,   setGenerating]  = useState(false)
  const [err,          setErr]         = useState('')
  const [reports,      setReports]     = useState([])
  const [loading,      setLoading]     = useState(true)

  // Load brands for dropdown + saved reports
  useEffect(() => {
    api.listBrands()
      .then(data => {
        const list = data.brands ?? data ?? []
        setBrands(list)
        if (list.length > 0) setBrand(list[0].name || list[0])
      })
      .catch(() => {})

    api.listReports()
      .then(data => setReports(data.reports ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const generate = async () => {
    if (!brand.trim()) return
    setGenerating(true); setErr('')
    try {
      const url = api.generateReport(brand.trim())
      window.open(url, '_blank')

      // Track in localStorage
      const saved = JSON.parse(localStorage.getItem('warden_reports') || '[]')
      saved.unshift({
        filename: `warden-report-${brand.trim()}.pdf`,
        brand:    brand.trim(),
        range:    dateRange,
        format,
        created_at: new Date().toISOString(),
      })
      localStorage.setItem('warden_reports', JSON.stringify(saved.slice(0, 20)))
      setReports(saved.slice(0, 20))

      setTimeout(() => {
        api.listReports().then(data => {
          const api_list = data.reports ?? []
          const local_list = JSON.parse(localStorage.getItem('warden_reports') || '[]')
          setReports([...api_list, ...local_list].slice(0, 30))
        }).catch(() => {})
      }, 1500)
    } catch (e) {
      setErr(e.message || 'Failed to generate report')
    } finally {
      setTimeout(() => setGenerating(false), 3000)
    }
  }

  const refreshList = () => {
    setLoading(true)
    const local = JSON.parse(localStorage.getItem('warden_reports') || '[]')
    api.listReports()
      .then(data => setReports([...(data.reports ?? []), ...local].slice(0, 30)))
      .catch(() => setReports(local))
      .finally(() => setLoading(false))
  }

  const toggleSection = (key) =>
    setSections(s => ({ ...s, [key]: !s[key] }))

  return (
    <div className="page-enter" style={{ padding: '28px 32px', maxWidth: 900, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <FileBarChart size={22} color="#10b981" />
          <h1 style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 20, fontWeight: 700, margin: 0, letterSpacing: '0.05em' }}>
            REPORTS
          </h1>
        </div>
        <p style={{ color: '#5c5880', fontSize: 13, margin: 0 }}>
          Generate and download brand protection reports
        </p>
      </div>

      {/* Generator card */}
      <div className="card" style={{ padding: 28, marginBottom: 28, borderTop: '2px solid #f59e0b' }}>
        <h2 style={{
          fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fontWeight: 700,
          color: '#f59e0b', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 20px',
        }}>
          Generate New Report
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          {/* Brand dropdown */}
          <div>
            <label style={{ fontSize: 10, color: '#5c5880', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
              Brand *
            </label>
            <div style={{ position: 'relative' }}>
              {brands.length > 0 ? (
                <select
                  value={brand}
                  onChange={e => setBrand(e.target.value)}
                  style={{ ...inputStyle, appearance: 'none', paddingRight: 36 }}
                  onFocus={e => { e.target.style.borderColor = '#7c3aed' }}
                  onBlur={e => { e.target.style.borderColor = '#2a2a4a' }}
                >
                  {brands.map((b, i) => {
                    const name = b.name || b
                    return <option key={i} value={name} style={{ background: '#1a1a2e' }}>{name}</option>
                  })}
                </select>
              ) : (
                <input
                  placeholder="e.g. mamaearth"
                  value={brand}
                  onChange={e => setBrand(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && generate()}
                  style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = '#7c3aed' }}
                  onBlur={e => { e.target.style.borderColor = '#2a2a4a' }}
                />
              )}
              {brands.length > 0 && (
                <ChevronDown size={14} color="#5c5880" style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none',
                }} />
              )}
            </div>
          </div>

          {/* Date range */}
          <div>
            <label style={{ fontSize: 10, color: '#5c5880', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
              Date Range
            </label>
            <div style={{ display: 'flex', gap: 6 }}>
              {DATE_RANGES.map(r => (
                <button
                  key={r}
                  onClick={() => setDateRange(r)}
                  style={{
                    flex: 1, padding: '9px 0', borderRadius: 7, cursor: 'pointer',
                    fontSize: 11, fontFamily: 'JetBrains Mono, monospace', fontWeight: 600,
                    background: dateRange === r ? 'rgba(245,158,11,0.15)' : '#1a1a2e',
                    border: `1px solid ${dateRange === r ? 'rgba(245,158,11,0.5)' : '#2a2a4a'}`,
                    color: dateRange === r ? '#f59e0b' : '#5c5880',
                    transition: 'all 0.15s', whiteSpace: 'nowrap',
                  }}
                >
                  {r.replace('Last ', '')}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Sections to include */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ fontSize: 10, color: '#5c5880', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
            Include Sections
          </label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {SECTIONS.map(s => (
              <button
                key={s.key}
                onClick={() => toggleSection(s.key)}
                style={{
                  padding: '5px 12px', borderRadius: 100, cursor: 'pointer',
                  fontSize: 11, fontFamily: 'JetBrains Mono, monospace',
                  background: sections[s.key] ? 'rgba(124,58,237,0.15)' : 'transparent',
                  border: `1px solid ${sections[s.key] ? '#7c3aed' : '#2a2a4a'}`,
                  color: sections[s.key] ? '#a855f7' : '#5c5880',
                  transition: 'all 0.15s',
                }}
              >
                {sections[s.key] ? '✓ ' : ''}{s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Format + Generate */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
          <div>
            <label style={{ fontSize: 10, color: '#5c5880', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
              Format
            </label>
            <div style={{ display: 'flex', gap: 6 }}>
              {['PDF', 'JSON'].map(f => (
                <button
                  key={f}
                  onClick={() => setFormat(f)}
                  style={{
                    padding: '9px 20px', borderRadius: 7, cursor: 'pointer',
                    fontSize: 12, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700,
                    background: format === f ? 'rgba(245,158,11,0.15)' : '#1a1a2e',
                    border: `1px solid ${format === f ? 'rgba(245,158,11,0.5)' : '#2a2a4a'}`,
                    color: format === f ? '#f59e0b' : '#5c5880',
                    transition: 'all 0.15s',
                  }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <button
            className="btn-gold"
            disabled={!brand.trim() || generating}
            onClick={generate}
            style={{ padding: '10px 32px', display: 'flex', alignItems: 'center', gap: 8, flex: 1, justifyContent: 'center' }}
          >
            <Download size={14} />
            {generating ? '⏳ Generating…' : '📄 GENERATE REPORT'}
          </button>
        </div>

        {err && (
          <div style={{
            marginTop: 12, padding: '10px 14px', borderRadius: 8,
            background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
            color: '#ef4444', fontSize: 12,
          }}>
            {err}
          </div>
        )}
      </div>

      {/* Past reports */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{
          padding: '14px 24px', borderBottom: '1px solid #2a2a4a',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#f1f0ff' }}>Saved Reports</span>
          <button className="btn-ghost" onClick={refreshList} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <RefreshCw size={12} /> Refresh
          </button>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#5c5880' }}>Loading reports…</div>
        ) : reports.length === 0 ? (
          <div style={{ padding: 60, textAlign: 'center' }}>
            <FileBarChart size={40} color="#5c5880" style={{ margin: '0 auto 14px' }} />
            <div style={{ color: '#5c5880', fontSize: 13 }}>No reports generated yet</div>
            <div style={{ color: '#5c5880', fontSize: 12, marginTop: 4 }}>Select a brand and click Generate Report above</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="cyber-table">
              <thead>
                <tr><th>Brand</th><th>Range</th><th>Format</th><th>Generated</th><th>Action</th></tr>
              </thead>
              <tbody>
                {reports.map((r, i) => {
                  const filename  = typeof r === 'string' ? r : r.filename || r.name || '—'
                  const brandName = r.brand || filename.replace(/^warden-report-/, '').replace(/\.(pdf|txt)$/, '')
                  const downloadUrl = `http://localhost:8000/api/reports/${encodeURIComponent(filename)}`
                  return (
                    <tr key={i}>
                      <td>
                        <span className="badge badge-gold" style={{ fontSize: 10 }}>{brandName}</span>
                      </td>
                      <td style={{ fontSize: 11, color: '#5c5880', fontFamily: 'JetBrains Mono, monospace' }}>
                        {r.range || '—'}
                      </td>
                      <td>
                        <span style={{
                          padding: '1px 8px', borderRadius: 4, fontSize: 10,
                          fontFamily: 'JetBrains Mono, monospace', fontWeight: 700,
                          background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
                          color: '#10b981',
                        }}>
                          {r.format || 'PDF'}
                        </span>
                      </td>
                      <td style={{ fontSize: 12, color: '#5c5880' }}>
                        {r.created_at ? new Date(r.created_at).toLocaleDateString('en-IN') : '—'}
                      </td>
                      <td>
                        <a
                          href={downloadUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            padding: '5px 12px', borderRadius: 6, textDecoration: 'none',
                            background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)',
                            color: '#f59e0b', fontSize: 11, fontFamily: 'JetBrains Mono, monospace',
                            transition: 'all 0.15s',
                          }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(245,158,11,0.2)' }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(245,158,11,0.1)' }}
                        >
                          <Download size={12} /> Download
                        </a>
                      </td>
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
