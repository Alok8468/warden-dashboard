import { useState, useCallback } from 'react'

/**
 * useToast — lightweight toast notification hook
 *
 * Usage:
 *   const { toasts, toast } = useToast()
 *   toast('Saved!', 'success')          // success | error | info | warning
 *   <ToastContainer toasts={toasts} />  // render at top of component
 */

let _id = 0

export function useToast() {
  const [toasts, setToasts] = useState([])

  const toast = useCallback((message, type = 'success', duration = 3500) => {
    const id = ++_id
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, duration)
  }, [])

  const dismiss = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return { toasts, toast, dismiss }
}

// ── ToastContainer ─────────────────────────────────────────────────────────────
const COLORS = {
  success: { bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)', color: '#10b981' },
  error:   { bg: 'rgba(239,68,68,0.15)',  border: 'rgba(239,68,68,0.3)',  color: '#ef4444' },
  warning: { bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.3)', color: '#f59e0b' },
  info:    { bg: 'rgba(124,58,237,0.15)', border: 'rgba(124,58,237,0.3)', color: '#a855f7' },
}

const ICONS = {
  success: '✓',
  error:   '✕',
  warning: '⚠',
  info:    'ℹ',
}

export function ToastContainer({ toasts, onDismiss }) {
  if (!toasts?.length) return null

  return (
    <div style={{
      position: 'fixed', top: 20, right: 20, zIndex: 9999,
      display: 'flex', flexDirection: 'column', gap: 10,
      pointerEvents: 'none',
    }}>
      {toasts.map(t => {
        const c = COLORS[t.type] || COLORS.info
        return (
          <div
            key={t.id}
            onClick={() => onDismiss?.(t.id)}
            style={{
              padding: '12px 18px', borderRadius: 10,
              background: c.bg, border: `1px solid ${c.border}`,
              color: c.color, fontSize: 13, fontWeight: 600,
              display: 'flex', alignItems: 'center', gap: 9,
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
              fontFamily: 'Inter, sans-serif',
              pointerEvents: 'auto', cursor: 'pointer',
              backdropFilter: 'blur(8px)',
              animation: 'toastIn 0.25s ease',
              maxWidth: 360,
            }}
          >
            <span style={{ fontSize: 15, lineHeight: 1 }}>{ICONS[t.type] || 'ℹ'}</span>
            <span style={{ flex: 1 }}>{t.message}</span>
          </div>
        )
      })}

      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateX(20px) scale(0.96); }
          to   { opacity: 1; transform: translateX(0)    scale(1); }
        }
      `}</style>
    </div>
  )
}
