import { useEffect, useState } from 'react'
import { FileBarChart, Download, RefreshCw } from 'lucide-react'
import { api } from '../api/client'

export default function Reports() {
  const [brand, setBrand]       = useState('')
  const [generating, setGenerating] = useState(false)
  const [reports, setReports]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [err, setErr]           = useState('')

  useEffect(() => {
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
      const a = document.createElement('a')
      a.href = url
      a.download = `warden-report-${brand.trim()}.pdf`
      a.click()
      setTimeout(() => {
        api.listReports().then(data => setReports(data.reports ?? [])).catch(() => {})
      }, 1500)
    } catch (e) {
      setErr(e.message || 'Failed to generate report')
    } finally {
      setGenerating(false)
    }
  }

  const refreshList = () => {
    setLoading(true)
    api.listReports().then(data => setReports(data.reports ?? [])).catch(() => {}).finally(() => setLoading(false))
  }

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
          Generate and download brand protection PDF reports
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

        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 240 }}>
            <label style={{ fontSize: 10, color: '#5c5880', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
              Brand Name
            </label>
            <input
              placeholder="e.g. mamaearth"
              value={brand} onChange={e => setBrand(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && generate()}
              style={{
                padding: '10px 14px', borderRadius: 8,
                background: '#1a1a2e', border: '1px solid #2a2a4a', color: '#f1f0ff',
                fontSize: 13, outline: 'none', width: '100%',
              }}
              onFocus={e => { e.target.style.borderColor = '#7c3aed'; e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.15)' }}
              onBlur={e => { e.target.style.borderColor = '#2a2a4a'; e.target.style.boxShadow = 'none' }}
            />
          </div>
          <button
            className="btn-gold"
            disabled={!brand.trim() || generating}
            onClick={generate}
            style={{ padding: '10px 28px', whiteSpace: 'nowrap' }}
          >
            <Download size={14} />
            {generating ? 'Generating…' : 'Generate PDF'}
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

        <div style={{
          marginTop: 16, padding: '14px 18px', borderRadius: 8,
          background: 'rgba(124,58,237,0.05)', border: '1px solid rgba(124,58,237,0.15)',
          fontSize: 12, color: '#a8a4c8', fontFamily: 'JetBrains Mono, monospace', lineHeight: 1.8,
        }}>
          Report includes:<br />
          • Executive summary with protection score<br />
          • Domain threats table (all lookalike domains)<br />
          • Social media threats table<br />
          • Takedown operations status
        </div>
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
            <div style={{ color: '#5c5880', fontSize: 12, marginTop: 4 }}>Enter a brand name above to generate your first report</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="cyber-table">
              <thead>
                <tr><th>Filename</th><th>Brand</th><th>Generated</th><th>Action</th></tr>
              </thead>
              <tbody>
                {reports.map((r, i) => {
                  const filename = typeof r === 'string' ? r : r.filename || r.name || '—'
                  const brandName = filename.replace(/^warden-report-/, '').replace(/\.pdf$/, '').replace(/\.txt$/, '')
                  const downloadUrl = `http://localhost:8001/api/reports/${encodeURIComponent(filename)}`
                  return (
                    <tr key={i}>
                      <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#a855f7' }}>{filename}</td>
                      <td><span className="badge badge-gold" style={{ fontSize: 10 }}>{brandName}</span></td>
                      <td style={{ fontSize: 12, color: '#5c5880' }}>
                        {r.created_at ? new Date(r.created_at).toLocaleDateString('en-IN') : '—'}
                      </td>
                      <td>
                        <a
                          href={downloadUrl}
                          download={filename}
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
