import { useEffect, useState } from 'react'
import { FolderLock, ChevronDown, ChevronUp, Download, FileText, Image, FileCode, File } from 'lucide-react'
import { api } from '../api/client'

function fileIcon(filename) {
  if (filename.endsWith('.png') || filename.endsWith('.jpg')) return <Image size={16} color="#a855f7" />
  if (filename.endsWith('.pdf')) return <FileText size={16} color="#f59e0b" />
  if (filename.endsWith('.txt')) return <FileText size={16} color="#a8a4c8" />
  if (filename.endsWith('.json')) return <FileCode size={16} color="#10b981" />
  return <File size={16} color="#5c5880" />
}

function EvidencePackage({ pkg }) {
  const [open, setOpen] = useState(false)
  const files = pkg.files || []

  return (
    <div className="card" style={{ marginBottom: 10, overflow: 'hidden' }}>
      <div
        style={{
          padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer',
          transition: 'background 0.15s',
        }}
        onClick={() => setOpen(o => !o)}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(124,58,237,0.04)' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
      >
        <FolderLock size={18} color="#f59e0b" style={{ flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#a855f7', marginBottom: 3 }}>
            {pkg.target || pkg.scan_id || '—'}
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <span style={{ fontSize: 11, color: '#5c5880' }}>
              Scan: <span style={{ color: '#f1f0ff', fontFamily: 'JetBrains Mono, monospace' }}>{(pkg.scan_id || '').slice(0, 12)}</span>
            </span>
            <span style={{ fontSize: 11, color: '#5c5880' }}>{files.length} files</span>
          </div>
        </div>
        <span style={{ color: '#5c5880' }}>
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </span>
      </div>

      {open && (
        <div style={{ borderTop: '1px solid #2a2a4a', padding: '14px 20px', background: 'rgba(26,26,46,0.3)' }}>
          {files.length === 0 ? (
            <div style={{ color: '#5c5880', fontSize: 12, padding: '8px 0' }}>No files in this package</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
              {files.map((file, i) => {
                const downloadUrl = `http://localhost:8000/api/evidence/${pkg.scan_id}/${encodeURIComponent(pkg.target)}/${encodeURIComponent(file)}`
                return (
                  <a
                    key={i}
                    href={downloadUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 14px', borderRadius: 8, textDecoration: 'none',
                      background: 'rgba(124,58,237,0.05)',
                      border: '1px solid #2a2a4a',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = '#7c3aed'
                      e.currentTarget.style.background = 'rgba(124,58,237,0.1)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = '#2a2a4a'
                      e.currentTarget.style.background = 'rgba(124,58,237,0.05)'
                    }}
                  >
                    {fileIcon(file)}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11, color: '#f1f0ff', fontFamily: 'JetBrains Mono, monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file}</div>
                      <div style={{ fontSize: 9, color: '#5c5880', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Download size={9} /> Download
                      </div>
                    </div>
                  </a>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function Evidence() {
  const [packages, setPackages] = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')

  useEffect(() => {
    api.listEvidence()
      .then(data => setPackages(data.packages ?? data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const filtered = packages.filter(p =>
    !search || (p.target || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.scan_id || '').toLowerCase().includes(search.toLowerCase())
  )
  const totalFiles = packages.reduce((sum, p) => sum + (p.files?.length || 0), 0)

  return (
    <div className="page-enter" style={{ padding: '28px 32px', maxWidth: 1000, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
            <FolderLock size={22} color="#f59e0b" />
            <h1 style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 20, fontWeight: 700, margin: 0, letterSpacing: '0.05em' }}>
              EVIDENCE
            </h1>
          </div>
          <p style={{ color: '#5c5880', fontSize: 13, margin: 0 }}>
            {packages.length} evidence packages · {totalFiles} files collected
          </p>
        </div>
      </div>

      {/* Search */}
      <div style={{ marginBottom: 20 }}>
        <input
          placeholder="Search by target or scan ID…"
          value={search} onChange={e => setSearch(e.target.value)}
          style={{
            maxWidth: 400, padding: '10px 14px', borderRadius: 8,
            background: '#1a1a2e', border: '1px solid #2a2a4a', color: '#f1f0ff',
            fontSize: 13, outline: 'none', width: '100%',
          }}
          onFocus={e => { e.target.style.borderColor = '#7c3aed'; e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.15)' }}
          onBlur={e => { e.target.style.borderColor = '#2a2a4a'; e.target.style.boxShadow = 'none' }}
        />
      </div>

      {/* Info box */}
      <div style={{
        padding: '12px 18px', borderRadius: 8, marginBottom: 24,
        background: 'rgba(124,58,237,0.05)', border: '1px solid rgba(124,58,237,0.2)',
        fontSize: 12, color: '#a8a4c8', fontFamily: 'JetBrains Mono, monospace', lineHeight: 1.8,
      }}>
        Evidence packages are built automatically when a takedown is filed. Each package includes a screenshot, WHOIS data, DNS records, HTTP headers, and a DMCA notice.
      </div>

      {/* List */}
      {loading ? (
        <div style={{ color: '#5c5880', textAlign: 'center', padding: 60 }}>Loading evidence packages…</div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ padding: 60, textAlign: 'center' }}>
          <FolderLock size={40} color="#5c5880" style={{ margin: '0 auto 16px' }} />
          <div style={{ color: '#5c5880', fontSize: 14 }}>
            {packages.length === 0
              ? 'No evidence packages yet — file a takedown to generate one'
              : 'No packages match your search'}
          </div>
        </div>
      ) : (
        filtered.map((pkg, i) => <EvidencePackage key={i} pkg={pkg} />)
      )}
    </div>
  )
}
