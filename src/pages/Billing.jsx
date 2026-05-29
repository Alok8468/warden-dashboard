import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CreditCard, CheckCircle, AlertTriangle, Zap, RefreshCw, ExternalLink } from 'lucide-react'

const BASE = 'http://localhost:8000'

function authHeaders() {
  const t = localStorage.getItem('warden_token')
  return { 'Content-Type': 'application/json', ...(t ? { Authorization: `Bearer ${t}` } : {}) }
}

const PLANS = [
  {
    id: 'creator',
    name: 'Creator',
    price: 999,
    period: '/mo',
    color: '#10b981',
    desc: 'For individual creators & freelancers',
    features: ['1 brand', 'DMCA filing', 'Platform monitoring', 'Content fingerprinting', 'Email alerts'],
    stripeKey: 'STRIPE_CREATOR_PRICE',
  },
  {
    id: 'starter',
    name: 'Starter',
    price: 25000,
    period: '/mo',
    color: '#7c3aed',
    desc: 'For growing D2C brands',
    features: ['1 brand', '5 platforms', 'Basic takedowns', 'WhatsApp alerts', 'Dashboard access', '50 scans/mo'],
    stripeKey: 'STRIPE_STARTER_PRICE',
  },
  {
    id: 'growth',
    name: 'Growth',
    price: 100000,
    period: '/mo',
    color: '#f59e0b',
    highlight: true,
    badge: 'MOST POPULAR',
    desc: 'For established Indian brands',
    features: ['3 brands', 'All platforms', 'Priority takedowns', 'Legal evidence', 'Advanced dashboard', 'API access', '200 scans/mo'],
    stripeKey: 'STRIPE_GROWTH_PRICE',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 300000,
    period: '/mo',
    color: '#ef4444',
    desc: 'For banks, enterprises & large brands',
    features: ['Unlimited brands', 'Custom monitoring', 'Dedicated agent', 'SLA guarantee', 'White-label', '24/7 support', 'Custom integrations'],
    stripeKey: 'STRIPE_ENTERPRISE_PRICE',
    enterprise: true,
  },
]

function fmtINR(n) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)
}

// ── Current plan badge ────────────────────────────────────────────────────────
function CurrentPlanCard({ sub }) {
  if (!sub) return null
  const plan = PLANS.find(p => p.id === sub.plan) || { name: sub.plan, color: '#7c3aed' }
  const statusColor = sub.status === 'active' ? '#10b981' : sub.status === 'trialing' ? '#f59e0b' : '#ef4444'

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      className="card" style={{ padding: 24, marginBottom: 28, borderTop: `2px solid ${plan.color}` }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div style={{ fontSize: 10, color: '#5c5880', letterSpacing: '0.1em', fontFamily: 'JetBrains Mono, monospace', marginBottom: 6 }}>
            CURRENT PLAN
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <span style={{ fontSize: 22, fontWeight: 700, color: plan.color, fontFamily: 'JetBrains Mono, monospace' }}>
              {plan.name}
            </span>
            <span style={{
              padding: '2px 10px', borderRadius: 100, fontSize: 11, fontWeight: 700,
              fontFamily: 'JetBrains Mono, monospace',
              background: `${statusColor}22`, color: statusColor, border: `1px solid ${statusColor}44`,
            }}>
              {(sub.status || 'active').toUpperCase()}
            </span>
          </div>
          {sub.current_period_end && (
            <div style={{ fontSize: 12, color: '#5c5880' }}>
              Renews on {new Date(sub.current_period_end * 1000).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <a
            href="https://billing.stripe.com/p/login/test_00000000"
            target="_blank" rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              padding: '8px 16px', borderRadius: 8, fontSize: 12, fontWeight: 600,
              background: 'transparent', border: '1px solid #2a2a4a', color: '#a8a4c8',
              textDecoration: 'none', cursor: 'pointer',
            }}
          >
            <ExternalLink size={12} /> Manage Billing
          </a>
        </div>
      </div>
    </motion.div>
  )
}

// ── Plan card ─────────────────────────────────────────────────────────────────
function PlanCard({ plan, current, onUpgrade, loading }) {
  const isCurrent = current?.plan === plan.id
  const isLoading = loading === plan.id

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="card"
      style={{
        padding: 24, position: 'relative', overflow: 'hidden',
        borderTop: `2px solid ${plan.color}`,
        boxShadow: plan.highlight ? `0 0 40px ${plan.color}20` : undefined,
        border: plan.highlight ? `1px solid ${plan.color}40` : undefined,
      }}
    >
      {plan.badge && (
        <div style={{
          position: 'absolute', top: 0, right: 0,
          background: plan.color, color: '#0d0d14',
          fontSize: 9, fontWeight: 700, fontFamily: 'JetBrains Mono, monospace',
          padding: '4px 12px', borderBottomLeftRadius: 8, letterSpacing: '0.08em',
        }}>
          {plan.badge}
        </div>
      )}

      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 10, color: '#5c5880', letterSpacing: '0.1em', fontFamily: 'JetBrains Mono, monospace', marginBottom: 6 }}>
          {plan.name.toUpperCase()}
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 6 }}>
          <span style={{ fontSize: 28, fontWeight: 700, color: plan.color, fontFamily: 'JetBrains Mono, monospace' }}>
            {plan.enterprise ? 'Custom' : fmtINR(plan.price)}
          </span>
          {!plan.enterprise && (
            <span style={{ fontSize: 12, color: '#5c5880' }}>{plan.period}</span>
          )}
        </div>
        <div style={{ fontSize: 12, color: '#5c5880', marginBottom: 16 }}>{plan.desc}</div>
      </div>

      <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
        {plan.features.map(f => (
          <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#a8a4c8' }}>
            <CheckCircle size={13} color={plan.color} />
            {f}
          </li>
        ))}
      </ul>

      {isCurrent ? (
        <div style={{
          padding: '9px 16px', borderRadius: 8, textAlign: 'center',
          background: `${plan.color}15`, border: `1px solid ${plan.color}40`,
          color: plan.color, fontSize: 12, fontWeight: 600,
          fontFamily: 'JetBrains Mono, monospace',
        }}>
          ✓ CURRENT PLAN
        </div>
      ) : plan.enterprise ? (
        <a
          href="mailto:sales@warden.ai?subject=Enterprise%20Inquiry"
          style={{
            display: 'block', padding: '9px 16px', borderRadius: 8, textAlign: 'center',
            background: `${plan.color}20`, border: `1px solid ${plan.color}40`,
            color: plan.color, fontSize: 13, fontWeight: 700, textDecoration: 'none',
            fontFamily: 'JetBrains Mono, monospace',
          }}
        >
          Contact Sales →
        </a>
      ) : (
        <button
          onClick={() => onUpgrade(plan.id)}
          disabled={isLoading}
          style={{
            width: '100%', padding: '9px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
            background: isLoading ? '#2a2a4a' : `linear-gradient(135deg, ${plan.color}, ${plan.color}cc)`,
            color: isLoading ? '#5c5880' : '#0d0d14', fontSize: 13, fontWeight: 700,
            fontFamily: 'JetBrains Mono, monospace', letterSpacing: '0.04em',
            transition: 'all 0.15s',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}
        >
          {isLoading ? <><RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> Processing…</> : <><Zap size={14} /> Upgrade Now</>}
        </button>
      )}
    </motion.div>
  )
}

// ── Invoice row ───────────────────────────────────────────────────────────────
function InvoiceRow({ inv }) {
  const statusColor = inv.status === 'paid' ? '#10b981' : '#ef4444'
  return (
    <tr>
      <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#f1f0ff' }}>
        {new Date(inv.created * 1000).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
      </td>
      <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, color: '#a8a4c8' }}>
        {inv.description || 'WARDEN.AI Subscription'}
      </td>
      <td style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, fontWeight: 700, color: '#f1f0ff' }}>
        {fmtINR((inv.amount_paid || inv.total || 0) / 100)}
      </td>
      <td>
        <span style={{
          padding: '2px 9px', borderRadius: 100, fontSize: 10, fontWeight: 700,
          background: `${statusColor}22`, color: statusColor, border: `1px solid ${statusColor}44`,
          fontFamily: 'JetBrains Mono, monospace',
        }}>
          {(inv.status || 'paid').toUpperCase()}
        </span>
      </td>
      <td>
        {inv.invoice_pdf && (
          <a href={inv.invoice_pdf} target="_blank" rel="noopener noreferrer" style={{ color: '#a855f7', fontSize: 12 }}>
            PDF ↗
          </a>
        )}
      </td>
    </tr>
  )
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function Billing() {
  const [sub,      setSub]      = useState(null)
  const [invoices, setInvoices] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [upgrading, setUpgrading] = useState(null)
  const [error,    setError]    = useState(null)
  const [toast,    setToast]    = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        const [subRes, invRes] = await Promise.all([
          fetch(`${BASE}/api/billing/subscription`, { headers: authHeaders() }),
          fetch(`${BASE}/api/billing/invoices`,     { headers: authHeaders() }),
        ])
        if (subRes.ok)  setSub(await subRes.json())
        if (invRes.ok)  setInvoices((await invRes.json()).invoices || [])
      } catch (e) {
        setError('Could not load billing data. Check your API connection.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3500)
  }

  const handleUpgrade = async (planId) => {
    setUpgrading(planId)
    setError(null)
    try {
      const res = await fetch(`${BASE}/api/billing/checkout`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ plan: planId }),
      })
      if (!res.ok) throw new Error((await res.json()).detail || 'Checkout failed')
      const { url } = await res.json()
      if (url) {
        window.location.href = url
      } else {
        showToast('Plan updated!', 'success')
        setSub(prev => ({ ...prev, plan: planId }))
      }
    } catch (e) {
      setError(e.message)
      showToast(e.message, 'error')
    } finally {
      setUpgrading(null)
    }
  }

  return (
    <div className="page-enter" style={{ padding: '28px 32px', maxWidth: 1100, margin: '0 auto' }}>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 20, zIndex: 9999,
          padding: '12px 20px', borderRadius: 10, fontSize: 13, fontWeight: 600,
          background: toast.type === 'success' ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)',
          border: `1px solid ${toast.type === 'success' ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`,
          color: toast.type === 'success' ? '#10b981' : '#ef4444',
          boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
        }}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <CreditCard size={22} color="#7c3aed" />
          <h1 style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 20, fontWeight: 700, margin: 0, letterSpacing: '0.05em' }}>
            BILLING
          </h1>
        </div>
        <p style={{ color: '#5c5880', fontSize: 13, margin: 0 }}>Manage your subscription and payment details</p>
      </div>

      {error && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '12px 16px', borderRadius: 8, marginBottom: 20,
          background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#ef4444', fontSize: 13,
        }}>
          <AlertTriangle size={16} /> {error}
        </div>
      )}

      {loading ? (
        <div style={{ padding: 60, textAlign: 'center', color: '#5c5880' }}>
          <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', marginBottom: 12 }} />
          <div>Loading billing…</div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : (
        <>
          {/* Current plan */}
          <CurrentPlanCard sub={sub} />

          {/* Plan selector */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 10, color: '#5c5880', letterSpacing: '0.1em', fontFamily: 'JetBrains Mono, monospace', marginBottom: 16 }}>
              AVAILABLE PLANS
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
              {PLANS.map(plan => (
                <PlanCard
                  key={plan.id}
                  plan={plan}
                  current={sub}
                  onUpgrade={handleUpgrade}
                  loading={upgrading}
                />
              ))}
            </div>
          </div>

          {/* Invoice history */}
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '14px 20px', borderBottom: '1px solid #2a2a4a', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: '#5c5880', letterSpacing: '0.12em', textTransform: 'uppercase', margin: 0 }}>
                INVOICE HISTORY
              </h2>
              <span className="badge badge-purple">{invoices.length} invoices</span>
            </div>
            {invoices.length === 0 ? (
              <div style={{ padding: '40px 24px', textAlign: 'center' }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>🧾</div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 14, fontWeight: 700, color: '#f1f0ff', marginBottom: 8 }}>
                  No invoices yet
                </div>
                <div style={{ color: '#5c5880', fontSize: 13 }}>
                  Your payment history will appear here after your first billing cycle.
                </div>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="cyber-table">
                  <thead>
                    <tr><th>Date</th><th>Description</th><th>Amount</th><th>Status</th><th>PDF</th></tr>
                  </thead>
                  <tbody>
                    {invoices.map((inv, i) => <InvoiceRow key={i} inv={inv} />)}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Compliance notice */}
          <div style={{
            marginTop: 24, padding: '14px 18px', borderRadius: 10,
            background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.2)',
            fontSize: 12, color: '#5c5880', lineHeight: 1.6,
          }}>
            <strong style={{ color: '#a855f7' }}>Secure Payments via Stripe</strong> — All transactions are processed securely.
            Prices are in INR inclusive of GST. Cancel anytime from the billing portal.
            Questions? Email <a href="mailto:billing@warden.ai" style={{ color: '#a855f7' }}>billing@warden.ai</a>
          </div>
        </>
      )}
    </div>
  )
}
