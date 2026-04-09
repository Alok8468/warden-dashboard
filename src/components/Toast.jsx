import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

const CONFIGS = {
  success: { icon: CheckCircle,   color: '#10b981', bg: 'rgba(16,185,129,0.12)',  border: 'rgba(16,185,129,0.3)'  },
  error:   { icon: AlertCircle,   color: '#ef4444', bg: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.3)'   },
  warning: { icon: AlertTriangle, color: '#f59e0b', bg: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.3)'  },
  info:    { icon: Info,          color: '#a855f7', bg: 'rgba(124,58,237,0.12)',  border: 'rgba(124,58,237,0.3)'  },
}

export default function Toast({ type = 'info', message, onDismiss }) {
  const [progress, setProgress] = useState(100)
  const cfg = CONFIGS[type] || CONFIGS.info
  const Icon = cfg.icon

  useEffect(() => {
    const start = Date.now()
    const duration = 3000
    const tick = () => {
      const elapsed = Date.now() - start
      const pct = Math.max(0, 100 - (elapsed / duration) * 100)
      setProgress(pct)
      if (pct > 0) requestAnimationFrame(tick)
      else onDismiss?.()
    }
    const raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [onDismiss])

  return (
    <motion.div
      initial={{ opacity: 0, x: 60, scale: 0.95 }}
      animate={{ opacity: 1, x: 0,  scale: 1 }}
      exit={{ opacity: 0, x: 60, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      style={{
        background: '#13131f',
        border: `1px solid ${cfg.border}`,
        borderRadius: 10,
        padding: '12px 16px',
        minWidth: 280, maxWidth: 360,
        boxShadow: `0 4px 24px rgba(0,0,0,0.4), 0 0 0 1px ${cfg.border}`,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Icon size={16} color={cfg.color} style={{ flexShrink: 0 }} />
        <span style={{ flex: 1, fontSize: 13, color: '#f1f0ff', lineHeight: 1.4 }}>{message}</span>
        <button onClick={onDismiss} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: '#5c5880', padding: 2, display: 'flex',
        }}>
          <X size={14} />
        </button>
      </div>
      {/* Progress bar */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0,
        height: 2, background: cfg.color, opacity: 0.6,
        width: `${progress}%`, transition: 'none',
        borderRadius: '0 0 0 10px',
      }} />
    </motion.div>
  )
}

export function ToastContainer({ toasts, onDismiss }) {
  return (
    <div style={{
      position: 'fixed', top: 20, right: 20, zIndex: 9000,
      display: 'flex', flexDirection: 'column', gap: 10,
    }}>
      <AnimatePresence>
        {toasts.map(t => (
          <Toast key={t.id} type={t.type} message={t.message} onDismiss={() => onDismiss(t.id)} />
        ))}
      </AnimatePresence>
    </div>
  )
}
