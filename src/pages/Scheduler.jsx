import { useEffect, useState } from 'react'
import { Clock, Plus, Play, Trash2, RefreshCw } from 'lucide-react'
import { api } from '../api/client'

const INTERVALS = [
  { label: '6h',     value: 6 },
  { label: '12h',    value: 12 },
  { label: '24h',    value: 24 },
  { label: 'Weekly', value: 168 },
]

export default function Scheduler() {
  const [jobs, setJobs]         = useState([])
  const [loading, setLoading]   = useState(true)
  const [brand, setBrand]       = useState('')
  const [domain, setDomain]     = useState('')
  const [interval, setInterval] = useState(24)
  const [adding, setAdding]     = useState(false)
  const [running, setRunning]   = useState({})

  const fetchJobs = () => {
    setLoading(true)
    api.schedulerJobs()
      .then(d => setJobs(d.jobs || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchJobs() }, [])

  const addJob = async (e) => {
    e.preventDefault()
    setAdding(true)
    try {
      await api.addSchedulerJob({ brand, domain, interval_hours: interval })
      setBrand(''); setDomain('')
      fetchJobs()
    } catch { /* silent */ } finally { setAdding(false) }
  }

  const removeJob = async (id) => {
    await api.removeSchedulerJob(id).catch(() => {})
    fetchJobs()
  }

  const runNow = async (domainKey) => {
    setRunning(r => ({ ...r, [domainKey]: true }))
    try { await api.runScanNow(domainKey) }
    catch { /* silent */ }
    finally { setTimeout(() => setRunning(r => ({ ...r, [domainKey]: false })), 3000) }
  }

  return (
    <div className="page-enter" style={{ padding: '28px 32px', maxWidth: 1000, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <Clock size={22} color="#7c3aed" />
          <h1 style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 20, fontWeight: 700, margin: 0, letterSpacing: '0.05em' }}>
            SCHEDULER
          </h1>
        </div>
        <p style={{ color: '#5c5880', fontSize: 13, margin: 0 }}>
          Automated brand monitoring — scans run in the background
        </p>
      </div>

      {/* Active schedules */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 24 }}>
        <div style={{ padding: '14px 24px', borderBottom: '1px solid #2a2a4a', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#f1f0ff' }}>Active Schedules</span>
          <button className="btn-ghost" onClick={fetchJobs} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <RefreshCw size={12} /> Refresh
          </button>
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#5c5880' }}>Loading…</div>
        ) : jobs.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center' }}>
            <Clock size={36} color="#5c5880" style={{ margin: '0 auto 14px' }} />
            <div style={{ color: '#5c5880', fontSize: 13 }}>No schedules yet — add one below</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="cyber-table">
              <thead>
                <tr><th>Name</th><th>Next Run</th><th>Interval</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {jobs.map(job => {
                  const domainFromId = job.id?.replace('scan_', '').replace(/_/g, '.')
                  return (
                    <tr key={job.id}>
                      <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#a855f7' }}>
                        {job.name}
                      </td>
                      <td style={{ fontSize: 12, color: '#f59e0b', fontFamily: 'JetBrains Mono, monospace', fontWeight: 600 }}>
                        {job.next_run ? new Date(job.next_run).toLocaleString('en-IN') : '—'}
                      </td>
                      <td style={{ fontSize: 12, color: '#5c5880' }}>
                        {job.interval_hours ? `${job.interval_hours}h` : '—'}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            className="btn-outline"
                            style={{ fontSize: 11, padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 5 }}
                            disabled={running[domainFromId]}
                            onClick={() => runNow(domainFromId)}
                          >
                            <Play size={11} />
                            {running[domainFromId] ? 'Running…' : 'Run Now'}
                          </button>
                          <button
                            onClick={() => removeJob(job.id)}
                            style={{
                              padding: '4px 10px', borderRadius: 6, fontSize: 11, cursor: 'pointer',
                              background: 'transparent', border: '1px solid rgba(239,68,68,0.3)',
                              color: '#ef4444', display: 'flex', alignItems: 'center', gap: 4,
                              transition: 'all 0.15s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)' }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
                          >
                            <Trash2 size={11} /> Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add schedule */}
      <div className="card" style={{ padding: 28 }}>
        <h2 style={{
          fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fontWeight: 700,
          color: '#7c3aed', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 20px',
        }}>
          Add Schedule
        </h2>

        <form onSubmit={addJob}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }} className="mobile-stack">
            <div>
              <label style={{ fontSize: 10, color: '#5c5880', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                Brand Name
              </label>
              <input
                placeholder="boAt" value={brand} onChange={e => setBrand(e.target.value)} required
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: 8,
                  background: '#1a1a2e', border: '1px solid #2a2a4a', color: '#f1f0ff',
                  fontSize: 13, outline: 'none',
                }}
                onFocus={e => { e.target.style.borderColor = '#7c3aed'; e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.15)' }}
                onBlur={e => { e.target.style.borderColor = '#2a2a4a'; e.target.style.boxShadow = 'none' }}
              />
            </div>
            <div>
              <label style={{ fontSize: 10, color: '#5c5880', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                Domain
              </label>
              <input
                placeholder="boat-lifestyle.com" value={domain} onChange={e => setDomain(e.target.value)} required
                style={{
                  width: '100%', padding: '10px 14px', borderRadius: 8,
                  background: '#1a1a2e', border: '1px solid #2a2a4a', color: '#f1f0ff',
                  fontSize: 13, outline: 'none',
                }}
                onFocus={e => { e.target.style.borderColor = '#7c3aed'; e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.15)' }}
                onBlur={e => { e.target.style.borderColor = '#2a2a4a'; e.target.style.boxShadow = 'none' }}
              />
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 10, color: '#5c5880', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 10 }}>
              Scan Interval
            </label>
            <div style={{ display: 'flex', gap: 8 }}>
              {INTERVALS.map(i => (
                <button key={i.value} type="button" onClick={() => setInterval(i.value)} style={{
                  padding: '7px 20px', borderRadius: 100, fontSize: 12, cursor: 'pointer',
                  fontFamily: 'JetBrains Mono, monospace', border: '1px solid',
                  background: interval === i.value ? 'rgba(124,58,237,0.15)' : 'transparent',
                  borderColor: interval === i.value ? '#7c3aed' : '#2a2a4a',
                  color: interval === i.value ? '#a855f7' : '#5c5880',
                  transition: 'all 0.15s',
                }}>{i.label}</button>
              ))}
            </div>
          </div>

          <button className="btn-primary" type="submit" disabled={adding} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Plus size={14} /> {adding ? 'Scheduling…' : 'Schedule Brand'}
          </button>
        </form>
      </div>
    </div>
  )
}
