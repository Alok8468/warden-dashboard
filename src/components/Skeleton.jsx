/**
 * Skeleton loading components for WARDEN.AI dashboard.
 *
 * Usage:
 *   <SkeletonLine width="60%" />
 *   <SkeletonCard />
 *   <SkeletonTable rows={5} cols={4} />
 *   <SkeletonMetricCard />
 */

const shimmer = {
  background: 'linear-gradient(90deg, #1a1a2e 25%, #2a2a4a 50%, #1a1a2e 75%)',
  backgroundSize: '200% 100%',
  animation: 'shimmer 1.6s infinite',
  borderRadius: 6,
}

// ── Base shimmer element ───────────────────────────────────────────────────────
export function SkeletonLine({ width = '100%', height = 14, style = {} }) {
  return (
    <>
      <div style={{ ...shimmer, width, height, ...style }} />
      <style>{`
        @keyframes shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </>
  )
}

// ── Card skeleton ──────────────────────────────────────────────────────────────
export function SkeletonCard({ lines = 3 }) {
  return (
    <div style={{
      background: '#13131f', border: '1px solid #2a2a4a', borderRadius: 12,
      padding: 20, display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      <SkeletonLine width="40%" height={12} />
      <SkeletonLine width="70%" height={32} />
      {lines > 2 && <SkeletonLine width="50%" height={11} />}
    </div>
  )
}

// ── Metric card grid skeleton ─────────────────────────────────────────────────
export function SkeletonMetricCard() {
  return (
    <div style={{
      background: '#13131f', border: '1px solid #2a2a4a', borderRadius: 12,
      padding: 20, borderTop: '2px solid #2a2a4a',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <SkeletonLine width="45%" height={10} />
        <SkeletonLine width={18} height={18} style={{ borderRadius: '50%' }} />
      </div>
      <SkeletonLine width="55%" height={36} style={{ marginBottom: 10 }} />
      <SkeletonLine width="60%" height={11} />
    </div>
  )
}

// ── Table skeleton ─────────────────────────────────────────────────────────────
export function SkeletonTable({ rows = 5, cols = 4 }) {
  const colWidths = ['35%', '20%', '20%', '15%', '10%']
  return (
    <div style={{ overflow: 'hidden' }}>
      {/* Header */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gap: 12, padding: '10px 20px',
        borderBottom: '1px solid #2a2a4a',
      }}>
        {Array.from({ length: cols }).map((_, i) => (
          <SkeletonLine key={i} width="60%" height={10} />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, row) => (
        <div key={row} style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gap: 12, padding: '14px 20px',
          borderBottom: '1px solid #1a1a2e',
        }}>
          {Array.from({ length: cols }).map((_, col) => (
            <SkeletonLine key={col} width={colWidths[col] || '80%'} height={12} />
          ))}
        </div>
      ))}
    </div>
  )
}

// ── Page-level skeleton (full page loader) ────────────────────────────────────
export function SkeletonPage() {
  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <SkeletonLine width={220} height={22} style={{ marginBottom: 8 }} />
          <SkeletonLine width={160} height={12} />
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <SkeletonLine width={90} height={34} style={{ borderRadius: 8 }} />
          <SkeletonLine width={110} height={34} style={{ borderRadius: 8 }} />
        </div>
      </div>
      {/* Metric cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 }}>
        {[0,1,2,3].map(i => <SkeletonMetricCard key={i} />)}
      </div>
      {/* Main card */}
      <div style={{ background: '#13131f', border: '1px solid #2a2a4a', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid #2a2a4a' }}>
          <SkeletonLine width={140} height={12} />
        </div>
        <SkeletonTable rows={6} cols={5} />
      </div>
    </div>
  )
}
