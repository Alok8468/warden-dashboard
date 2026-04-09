export function threatLevel(score) {
  if (score >= 8) return 'high'
  if (score >= 5) return 'medium'
  return 'low'
}

const STYLES = {
  high:   { bg: 'rgba(239,68,68,0.15)',   color: '#ef4444', border: 'rgba(239,68,68,0.35)'   },
  medium: { bg: 'rgba(245,158,11,0.15)',  color: '#f59e0b', border: 'rgba(245,158,11,0.35)'  },
  low:    { bg: 'rgba(16,185,129,0.12)',  color: '#10b981', border: 'rgba(16,185,129,0.3)'   },
}

const DOT_COLORS = {
  high:   '#ef4444',
  medium: '#f59e0b',
  low:    '#10b981',
}

const LABELS = { high: 'High', medium: 'Medium', low: 'Low' }

export default function ThreatBadge({ score }) {
  const level = threatLevel(score)
  const s = STYLES[level]
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '2px 10px', borderRadius: 100, fontSize: 11,
      fontFamily: 'JetBrains Mono, monospace', fontWeight: 600,
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
    }}>
      <span style={{
        width: 6, height: 6, borderRadius: '50%',
        background: DOT_COLORS[level], flexShrink: 0,
      }} />
      {score.toFixed(1)} · {LABELS[level]}
    </span>
  )
}

export function ScoreDot({ score, size = 'md' }) {
  const level = threatLevel(score)
  const sz = size === 'sm' ? 8 : 12
  return (
    <span style={{
      display: 'inline-block', borderRadius: '50%',
      width: sz, height: sz, background: DOT_COLORS[level],
      flexShrink: 0,
    }} title={`Score ${score}`} />
  )
}
