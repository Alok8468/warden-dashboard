import { useEffect, useState } from 'react'
import { Bell, Plus, Trash2, Send, RefreshCw } from 'lucide-react'
import { api } from '../api/client'

export default function Alerts() {
  const [brand, setBrand]           = useState('')
  const [recipients, setRecipients] = useState([])
  const [history, setHistory]       = useState([])
  const [loading, setLoading]       = useState(false)
  const [addPhone, setAddPhone]     = useState('')
  const [addBrand, setAddBrand]     = useState('')
  const [addErr, setAddErr]         = useState('')
  const [testPhone, setTestPhone]   = useState('')
  const [testBrand, setTestBrand]   = useState('')
  const [testing, setTesting]       = useState(false)
  const [testResult, setTestResult] = useState(null)
  const [fetchedFor, setFetchedFor] = useState('')

  // Apprise channels
  const [channels, setChannels]         = useState([])
  const [channelUrl, setChannelUrl]     = useState('')
  const [channelName, setChannelName]   = useState('')
  const [addingCh, setAddingCh]         = useState(false)
  const [channelErr, setChannelErr]     = useState('')

  const fetchRecipients = async (b) => {
    if (!b.trim()) return
    setLoading(true)
    try {
      const data = await api.listRecipients(b.trim())
      setRecipients(data.recipients ?? [])
      setFetchedFor(b.trim())
    } catch { setRecipients([]) } finally { setLoading(false) }
  }

  const fetchHistory = async () => {
    try {
      const data = await api.alertHistory()
      setHistory(data.logs ?? [])
    } catch { setHistory([]) }
  }

  const fetchChannels = async () => {
    try {
      const data = await api.listChannels()
      setChannels(data.channels ?? [])
    } catch { setChannels([]) }
  }

  useEffect(() => { fetchHistory(); fetchChannels() }, [])

  const addRecipient = async (e) => {
    e.preventDefault(); setAddErr('')
    if (!addPhone.match(/^\+?[0-9]{10,15}$/)) {
      setAddErr('Enter a valid phone number (e.g. +919876543210)')
      return
    }
    try {
      await api.addRecipient(addPhone, addBrand || brand)
      setAddPhone(''); setAddBrand('')
      fetchRecipients(brand || addBrand)
    } catch (err) { setAddErr(err.message) }
  }

  const removeRecipient = async (phone, recipBrand) => {
    try {
      await api.removeRecipient(phone, recipBrand || brand)
      setRecipients(r => r.filter(x => x.phone !== phone))
    } catch { /* silent */ }
  }

  const sendTest = async () => {
    if (!testPhone.trim()) return
    setTesting(true); setTestResult(null)
    try {
      await api.sendTestAlert(testPhone, testBrand || brand)
      setTestResult('ok'); fetchHistory()
    } catch { setTestResult('fail') } finally { setTesting(false) }
  }

  const addChannel = async (e) => {
    e.preventDefault(); setChannelErr('')
    setAddingCh(true)
    try {
      await api.addChannel({ url: channelUrl, name: channelName || channelUrl })
      setChannelUrl(''); setChannelName('')
      fetchChannels()
    } catch (err) { setChannelErr(err.message) } finally { setAddingCh(false) }
  }

  const deleteChannel = async (id) => {
    try {
      await api.deleteChannel(id)
      fetchChannels()
    } catch { /* silent */ }
  }

  return (
    <div className="page-enter" style={{ padding: '28px 32px', maxWidth: 1000, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <Bell size={22} color="#f59e0b" />
          <h1 style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 20, fontWeight: 700, margin: 0, letterSpacing: '0.05em' }}>
            ALERTS
          </h1>
        </div>
        <p style={{ color: '#5c5880', fontSize: 13, margin: 0 }}>
          Manage alert recipients and notification channels
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }} className="mobile-stack">
        {/* Recipients lookup */}
        <div className="card" style={{ padding: 24 }}>
          <h2 style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fontWeight: 700, color: '#7c3aed', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 16px' }}>
            Recipients
          </h2>
          <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
            <input
              placeholder="Brand name…"
              value={brand} onChange={e => setBrand(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && fetchRecipients(brand)}
              style={{
                flex: 1, padding: '8px 12px', borderRadius: 7,
                background: '#1a1a2e', border: '1px solid #2a2a4a', color: '#f1f0ff',
                fontSize: 12, outline: 'none',
              }}
              onFocus={e => { e.target.style.borderColor = '#7c3aed' }}
              onBlur={e => { e.target.style.borderColor = '#2a2a4a' }}
            />
            <button className="btn-outline" disabled={loading || !brand.trim()} onClick={() => fetchRecipients(brand)}>
              Fetch
            </button>
          </div>

          {fetchedFor && (
            <div>
              {loading ? (
                <div style={{ color: '#5c5880', fontSize: 12 }}>Loading…</div>
              ) : recipients.length === 0 ? (
                <div style={{ color: '#5c5880', fontSize: 12 }}>No recipients for "{fetchedFor}"</div>
              ) : (
                recipients.map(r => (
                  <div key={r.phone} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '10px 14px', borderRadius: 8, marginBottom: 8,
                    background: 'rgba(124,58,237,0.05)', border: '1px solid #2a2a4a',
                  }}>
                    <div>
                      <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: '#f1f0ff' }}>{r.phone}</div>
                      {r.brand && <div style={{ fontSize: 11, color: '#5c5880', marginTop: 2 }}>{r.brand}</div>}
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn-outline" disabled={testing} style={{ fontSize: 11, padding: '4px 10px' }}
                        onClick={() => { setTestPhone(r.phone); setTestBrand(r.brand || brand); setTimeout(sendTest, 0) }}>
                        Test
                      </button>
                      <button onClick={() => removeRecipient(r.phone, r.brand)} style={{
                        padding: '4px 8px', borderRadius: 6, fontSize: 11, cursor: 'pointer',
                        background: 'transparent', border: '1px solid rgba(239,68,68,0.3)',
                        color: '#ef4444', transition: 'all 0.15s', display: 'flex', alignItems: 'center',
                      }}>
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Add recipient */}
        <div className="card" style={{ padding: 24 }}>
          <h2 style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fontWeight: 700, color: '#7c3aed', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 16px' }}>
            Add Recipient
          </h2>
          <form onSubmit={addRecipient}>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 10, color: '#5c5880', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Phone Number</label>
              <input
                placeholder="+919876543210" value={addPhone} onChange={e => setAddPhone(e.target.value)} required
                style={{
                  width: '100%', padding: '9px 12px', borderRadius: 7,
                  background: '#1a1a2e', border: '1px solid #2a2a4a', color: '#f1f0ff',
                  fontSize: 13, outline: 'none', fontFamily: 'JetBrains Mono, monospace',
                }}
                onFocus={e => { e.target.style.borderColor = '#7c3aed' }}
                onBlur={e => { e.target.style.borderColor = '#2a2a4a' }}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 10, color: '#5c5880', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Brand (optional)</label>
              <input
                placeholder={brand || 'mamaearth'} value={addBrand} onChange={e => setAddBrand(e.target.value)}
                style={{
                  width: '100%', padding: '9px 12px', borderRadius: 7,
                  background: '#1a1a2e', border: '1px solid #2a2a4a', color: '#f1f0ff',
                  fontSize: 13, outline: 'none',
                }}
                onFocus={e => { e.target.style.borderColor = '#7c3aed' }}
                onBlur={e => { e.target.style.borderColor = '#2a2a4a' }}
              />
            </div>
            {addErr && <div style={{ color: '#ef4444', fontSize: 12, marginBottom: 12 }}>{addErr}</div>}
            <button type="submit" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Plus size={14} /> Add Recipient
            </button>
          </form>
        </div>
      </div>

      {/* Apprise channels */}
      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        <h2 style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fontWeight: 700, color: '#7c3aed', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 16px' }}>
          Notification Channels (Apprise)
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }} className="mobile-stack">
          <form onSubmit={addChannel}>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 10, color: '#5c5880', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Apprise URL</label>
              <input
                placeholder="slack://token@channel" value={channelUrl} onChange={e => setChannelUrl(e.target.value)} required
                style={{
                  width: '100%', padding: '9px 12px', borderRadius: 7,
                  background: '#1a1a2e', border: '1px solid #2a2a4a', color: '#f1f0ff',
                  fontSize: 12, outline: 'none', fontFamily: 'JetBrains Mono, monospace',
                }}
                onFocus={e => { e.target.style.borderColor = '#7c3aed' }}
                onBlur={e => { e.target.style.borderColor = '#2a2a4a' }}
              />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 10, color: '#5c5880', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Label (optional)</label>
              <input
                placeholder="My Slack channel" value={channelName} onChange={e => setChannelName(e.target.value)}
                style={{
                  width: '100%', padding: '9px 12px', borderRadius: 7,
                  background: '#1a1a2e', border: '1px solid #2a2a4a', color: '#f1f0ff',
                  fontSize: 12, outline: 'none',
                }}
                onFocus={e => { e.target.style.borderColor = '#7c3aed' }}
                onBlur={e => { e.target.style.borderColor = '#2a2a4a' }}
              />
            </div>
            {channelErr && <div style={{ color: '#ef4444', fontSize: 12, marginBottom: 10 }}>{channelErr}</div>}
            <button type="submit" className="btn-outline" disabled={addingCh} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Plus size={13} /> Add Channel
            </button>
          </form>

          <div>
            {channels.length === 0 ? (
              <div style={{ color: '#5c5880', fontSize: 12, padding: '12px 0' }}>No channels configured yet</div>
            ) : (
              channels.map(ch => (
                <div key={ch.id || ch.url} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '10px 14px', borderRadius: 8, marginBottom: 8,
                  background: 'rgba(124,58,237,0.05)', border: '1px solid #2a2a4a',
                }}>
                  <div>
                    <div style={{ fontSize: 12, color: '#f1f0ff', fontFamily: 'JetBrains Mono, monospace' }}>{ch.name || ch.url}</div>
                    <div style={{ fontSize: 10, color: ch.status === 'active' ? '#10b981' : '#5c5880', marginTop: 2 }}>
                      <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: ch.status === 'active' ? '#10b981' : '#5c5880', marginRight: 4, verticalAlign: 'middle' }} />
                      {ch.status || 'configured'}
                    </div>
                  </div>
                  <button onClick={() => deleteChannel(ch.id || ch.url)} style={{
                    padding: '4px 8px', borderRadius: 6, cursor: 'pointer',
                    background: 'transparent', border: '1px solid rgba(239,68,68,0.3)',
                    color: '#ef4444', display: 'flex', alignItems: 'center',
                  }}>
                    <Trash2 size={12} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Test alert */}
      <div className="card" style={{ padding: 24, marginBottom: 24 }}>
        <h2 style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fontWeight: 700, color: '#7c3aed', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 16px' }}>
          Send Test Alert
        </h2>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div>
            <label style={{ fontSize: 10, color: '#5c5880', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Phone</label>
            <input
              placeholder="+919876543210" value={testPhone} onChange={e => setTestPhone(e.target.value)}
              style={{
                width: 200, padding: '9px 12px', borderRadius: 7,
                background: '#1a1a2e', border: '1px solid #2a2a4a', color: '#f1f0ff',
                fontSize: 13, outline: 'none', fontFamily: 'JetBrains Mono, monospace',
              }}
              onFocus={e => { e.target.style.borderColor = '#7c3aed' }}
              onBlur={e => { e.target.style.borderColor = '#2a2a4a' }}
            />
          </div>
          <div>
            <label style={{ fontSize: 10, color: '#5c5880', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>Brand</label>
            <input
              placeholder={brand || 'mamaearth'} value={testBrand} onChange={e => setTestBrand(e.target.value)}
              style={{
                width: 160, padding: '9px 12px', borderRadius: 7,
                background: '#1a1a2e', border: '1px solid #2a2a4a', color: '#f1f0ff',
                fontSize: 13, outline: 'none',
              }}
              onFocus={e => { e.target.style.borderColor = '#7c3aed' }}
              onBlur={e => { e.target.style.borderColor = '#2a2a4a' }}
            />
          </div>
          <button
            className="btn-gold"
            disabled={testing || !testPhone.trim()} onClick={sendTest}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <Send size={13} /> {testing ? 'Sending…' : 'Send Test'}
          </button>
          {testResult === 'ok'   && <span style={{ color: '#10b981', fontSize: 13 }}>✓ Sent</span>}
          {testResult === 'fail' && <span style={{ color: '#ef4444', fontSize: 13 }}>✗ Failed</span>}
        </div>
      </div>

      {/* History */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '14px 24px', borderBottom: '1px solid #2a2a4a', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: '#f1f0ff' }}>Alert History</span>
          <button className="btn-ghost" onClick={fetchHistory} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <RefreshCw size={12} /> Refresh
          </button>
        </div>

        {history.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center', color: '#5c5880' }}>No alerts sent yet</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="cyber-table">
              <thead>
                <tr><th>Recipient</th><th>Brand</th><th>Status</th><th>Channel</th><th style={{ textAlign: 'right' }}>Time</th></tr>
              </thead>
              <tbody>
                {history.map((log, i) => (
                  <tr key={i}>
                    <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#f1f0ff' }}>{log.recipient}</td>
                    <td style={{ fontSize: 12, color: '#5c5880' }}>{log.brand ?? '—'}</td>
                    <td>
                      <span style={{
                        padding: '2px 10px', borderRadius: 100, fontSize: 11,
                        fontFamily: 'JetBrains Mono, monospace', fontWeight: 600,
                        background: log.status === 'sent' ? 'rgba(16,185,129,0.12)' : log.status === 'failed' ? 'rgba(239,68,68,0.12)' : 'rgba(245,158,11,0.12)',
                        color: log.status === 'sent' ? '#10b981' : log.status === 'failed' ? '#ef4444' : '#f59e0b',
                        border: `1px solid ${log.status === 'sent' ? 'rgba(16,185,129,0.3)' : log.status === 'failed' ? 'rgba(239,68,68,0.3)' : 'rgba(245,158,11,0.3)'}`,
                      }}>
                        {log.status}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: '#5c5880', fontFamily: 'JetBrains Mono, monospace' }}>{log.channel ?? 'whatsapp'}</td>
                    <td style={{ textAlign: 'right', fontSize: 11, color: '#5c5880', fontFamily: 'JetBrains Mono, monospace' }}>
                      {log.sent_at ? new Date(log.sent_at).toLocaleString('en-IN', { timeStyle: 'short', dateStyle: 'short' }) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
