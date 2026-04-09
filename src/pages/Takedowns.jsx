import { useEffect, useState } from 'react'
import { Zap } from 'lucide-react'
import { api } from '../api/client'

const STAGES = [
  { key: 'detected',       label: 'Detected',      color: '#7c3aed' },
  { key: 'evidence_built', label: 'Evidence Built', color: '#f59e0b' },
  { key: 'filed',          label: 'Filed',          color: '#6366f1' },
  { key: 'confirmed',      label: 'Confirmed',      color: '#10b981' },
]

function stageOf(td) {
  const s = (td.status || '').toLowerCase()
  if (s === 'confirmed' || s === 'completed') return 'confirmed'
  if (s === 'filed') return 'filed'
  if (s === 'evidence_built' || s === 'building') return 'evidence_built'
  return 'detected'
}

function TakedownCard({ td }) {
  const stage     = stageOf(td)
  const stageInfo = STAGES.find(s => s.key === stage)

  return (
    <div className="card" style={{
      padding: '14px 16px', marginBottom: 10,
      borderLeft: `3px solid ${stageInfo?.color}`,
      transition: 'all 0.2s',
    }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 0 20px ${stageInfo?.color}20`; e.currentTarget.style.transform = 'translateY(-1px)' }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <div>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: '#a855f7', marginBottom: 4, wordBreak: 'break-all' }}>
            {(td.target || td.threat_url || '—').slice(0, 32)}
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <span className="badge badge-purple" style={{ fontSize: 9 }}>
              {td.threat_type === 'twitter' ? 'x' : (td.threat_type || 'domain')}
            </span>
            {td.brand && <span className="badge badge-gold" style={{ fontSize: 9 }}>{td.brand}</span>}
          </div>
        </div>
        <span style={{
          fontSize: 9, fontFamily: 'JetBrains Mono, monospace', padding: '2px 8px', borderRadius: 100,
          border: `1px solid ${stageInfo?.color}40`, background: `${stageInfo?.color}15`,
          color: stageInfo?.color, letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap',
        }}>{stageInfo?.label}</span>
      </div>

      {/* Progress dots */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 8 }}>
        {STAGES.map((s, i) => {
          const stageIdx = STAGES.findIndex(x => x.key === stage)
          const done = i <= stageIdx
          return (
            <div key={s.key} style={{
              flex: 1, height: 3, borderRadius: 100,
              background: done ? s.color : '#2a2a4a',
              transition: 'background 0.3s',
            }} />
          )
        })}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#5c5880', fontFamily: 'JetBrains Mono, monospace' }}>
        <span>{(td.takedown_id || td.id || '—').toString().slice(0, 10)}</span>
        <span>{td.filed_at || td.created_at ? new Date(td.filed_at || td.created_at).toLocaleDateString('en-IN') : '—'}</span>
      </div>

      {td.channels && td.channels.length > 0 && (
        <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid #2a2a4a' }}>
          {td.channels.map((ch, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 3 }}>
              <span style={{ color: '#5c5880' }}>{ch.name}</span>
              <span style={{ color: ch.status === 'success' ? '#10b981' : ch.status === 'failed' ? '#ef4444' : '#f59e0b' }}>
                {ch.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Takedowns() {
  const [takedowns, setTakedowns] = useState([])
  const [loading, setLoading]     = useState(true)
  const [activeStage, setActiveStage] = useState('all')

  useEffect(() => {
    api.listTakedowns()
      .then(data => setTakedowns(data.takedowns ?? []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const byStage = (stage) => takedowns.filter(td => stageOf(td) === stage)
  const filtered = activeStage === 'all' ? takedowns : takedowns.filter(td => stageOf(td) === activeStage)
  const counts   = Object.fromEntries(STAGES.map(s => [s.key, byStage(s.key).length]))

  return (
    <div className="page-enter" style={{ padding: '28px 32px', maxWidth: 1200, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <Zap size={22} color="#7c3aed" />
          <h1 style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 20, fontWeight: 700, margin: 0, letterSpacing: '0.05em' }}>
            TAKEDOWNS
          </h1>
        </div>
        <p style={{ color: '#5c5880', fontSize: 13, margin: 0 }}>
          {takedowns.length} takedown operations — track progress through the pipeline
        </p>
      </div>

      {/* Stage filter pills */}
      <div className="card" style={{ padding: '12px 18px', marginBottom: 24, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <button onClick={() => setActiveStage('all')} style={{
          padding: '5px 16px', borderRadius: 100, fontSize: 11, cursor: 'pointer',
          fontFamily: 'JetBrains Mono, monospace', border: '1px solid',
          background: activeStage === 'all' ? 'rgba(124,58,237,0.15)' : 'transparent',
          borderColor: activeStage === 'all' ? '#7c3aed' : '#2a2a4a',
          color: activeStage === 'all' ? '#a855f7' : '#5c5880',
        }}>ALL ({takedowns.length})</button>

        {STAGES.map(s => (
          <button key={s.key} onClick={() => setActiveStage(s.key)} style={{
            padding: '5px 16px', borderRadius: 100, fontSize: 11, cursor: 'pointer',
            fontFamily: 'JetBrains Mono, monospace', border: '1px solid',
            background: activeStage === s.key ? `${s.color}18` : 'transparent',
            borderColor: activeStage === s.key ? s.color : '#2a2a4a',
            color: activeStage === s.key ? s.color : '#5c5880',
          }}>{s.label.toUpperCase()} ({counts[s.key]})</button>
        ))}
      </div>

      {/* Kanban or filtered list */}
      {activeStage === 'all' ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }} className="mobile-stack">
          {STAGES.map(stage => (
            <div key={stage.key}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14,
                padding: '10px 14px', borderRadius: 8,
                background: `${stage.color}08`,
                border: `1px solid ${stage.color}20`,
                borderTop: `3px solid ${stage.color}`,
              }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: stage.color }} />
                <span style={{ fontSize: 10, color: stage.color, fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.08em', textTransform: 'uppercase', flex: 1 }}>
                  {stage.label}
                </span>
                <span style={{ fontSize: 12, color: stage.color, fontFamily: 'JetBrains Mono, monospace', fontWeight: 700 }}>
                  {counts[stage.key]}
                </span>
              </div>
              {loading ? (
                <div style={{ color: '#5c5880', fontSize: 12, textAlign: 'center', padding: 20 }}>Loading…</div>
              ) : byStage(stage.key).length === 0 ? (
                <div style={{
                  border: '1px dashed #2a2a4a', borderRadius: 10,
                  padding: '20px 14px', textAlign: 'center', color: '#5c5880', fontSize: 12,
                }}>
                  Empty
                </div>
              ) : (
                byStage(stage.key).map((td, i) => <TakedownCard key={i} td={td} />)
              )}
            </div>
          ))}
        </div>
      ) : (
        <div style={{ maxWidth: 640 }}>
          {loading ? (
            <div style={{ color: '#5c5880', textAlign: 'center', padding: 40 }}>Loading…</div>
          ) : filtered.length === 0 ? (
            <div style={{ color: '#5c5880', textAlign: 'center', padding: 40 }}>No takedowns in this stage</div>
          ) : (
            filtered.map((td, i) => <TakedownCard key={i} td={td} />)
          )}
        </div>
      )}
    </div>
  )
}
