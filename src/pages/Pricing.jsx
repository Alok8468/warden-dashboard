import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, Shield } from 'lucide-react'

const PLANS = [
  {
    name: 'Creator',
    price: '₹999',
    period: '/mo',
    desc: 'For individual creators & influencers',
    features: [
      '1 brand',
      'Content fingerprinting',
      'DMCA filing (5/mo)',
      'Platform monitoring',
      'Basic dashboard',
      'Email support',
    ],
    cta: 'Get Started',
    highlight: false,
    color: '#10b981',
  },
  {
    name: 'Starter',
    price: '₹25,000',
    period: '/mo',
    desc: 'For growing brands',
    features: [
      '1 brand',
      '5 platforms monitored',
      'Domain scan (100/day)',
      'Basic takedowns (20/mo)',
      'WhatsApp alerts',
      'Dashboard access',
      'Email + chat support',
    ],
    cta: 'Get Started',
    highlight: false,
    color: '#7c3aed',
  },
  {
    name: 'Growth',
    price: '₹1,00,000',
    period: '/mo',
    desc: 'For established brands',
    badge: 'MOST POPULAR',
    features: [
      '3 brands',
      'All 7 platforms',
      'Domain scan (500/day)',
      'Priority takedowns (unlimited)',
      'Legal evidence packages',
      'Advanced dashboard',
      'API access',
      'Dedicated account manager',
    ],
    cta: 'Get Started',
    highlight: true,
    color: '#f59e0b',
  },
  {
    name: 'Enterprise',
    price: '₹3,00,000+',
    period: '/mo',
    desc: 'For large enterprises',
    features: [
      'Unlimited brands',
      'Custom monitoring',
      'Dedicated AI agent',
      'SLA guarantee (99.9%)',
      'White-label reports',
      'Custom integrations',
      '24/7 phone support',
      'On-premise option',
    ],
    cta: 'Contact Sales',
    highlight: false,
    color: '#a855f7',
  },
]

const COMPARE = [
  { feature: 'Brands monitored',      creator: '1',      starter: '1',       growth: '3',         enterprise: 'Unlimited' },
  { feature: 'Platforms',             creator: '3',      starter: '5',       growth: 'All 7',     enterprise: 'All + custom' },
  { feature: 'Domain scans/day',      creator: '10',     starter: '100',     growth: '500',       enterprise: 'Unlimited' },
  { feature: 'Takedowns/month',       creator: '5',      starter: '20',      growth: 'Unlimited', enterprise: 'Unlimited' },
  { feature: 'WhatsApp alerts',       creator: '—',      starter: '✓',       growth: '✓',         enterprise: '✓' },
  { feature: 'Legal evidence pkg',    creator: '—',      starter: '—',       growth: '✓',         enterprise: '✓' },
  { feature: 'API access',            creator: '—',      starter: '—',       growth: '✓',         enterprise: '✓' },
  { feature: 'Deepfake detection',    creator: '✓',      starter: '—',       growth: '✓',         enterprise: '✓' },
  { feature: 'PDF reports',           creator: '—',      starter: '✓',       growth: '✓',         enterprise: '✓' },
  { feature: 'Support',               creator: 'Email',  starter: 'Email+Chat', growth: 'Account Mgr', enterprise: '24/7 Phone' },
]

export default function Pricing() {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: '100vh', background: '#0d0d14', color: '#f1f0ff', fontFamily: 'Inter, sans-serif' }}>
      {/* Nav */}
      <nav style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 40px', height: 60,
        borderBottom: '1px solid rgba(124,58,237,0.15)',
      }}>
        <Link to="/" style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 18, fontWeight: 700, textDecoration: 'none' }}>
          <span style={{ color: '#f1f0ff' }}>WARDEN</span>
          <span style={{ color: '#a855f7' }}>.AI</span>
        </Link>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link to="/login" style={{ padding: '8px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600, border: '1px solid rgba(124,58,237,0.4)', color: '#a855f7', textDecoration: 'none' }}>Sign In</Link>
          <button onClick={() => navigate('/register')} style={{ padding: '8px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600, background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', border: 'none', color: 'white', cursor: 'pointer' }}>Get Started</button>
        </div>
      </nav>

      {/* Header */}
      <div style={{ textAlign: 'center', padding: '60px 24px 40px' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '5px 14px', borderRadius: 100, background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.3)', fontSize: 11, color: '#a855f7', fontWeight: 600, letterSpacing: '0.1em', marginBottom: 20 }}>
            <Shield size={11} /> PRICING
          </div>
          <h1 style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 36, fontWeight: 700, margin: '0 0 12px' }}>
            Simple, Transparent Pricing
          </h1>
          <p style={{ color: '#5c5880', fontSize: 15, maxWidth: 480, margin: '0 auto' }}>
            Start protecting your brand today. No hidden fees. Cancel anytime.
          </p>
        </motion.div>
      </div>

      {/* Plans */}
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 24px 60px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
          {PLANS.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              style={{
                padding: '32px 24px', borderRadius: 16,
                background: p.highlight
                  ? 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(76,29,149,0.08))'
                  : '#13131f',
                border: `1px solid ${p.highlight ? '#7c3aed' : '#2a2a4a'}`,
                position: 'relative',
                boxShadow: p.highlight ? '0 0 50px rgba(124,58,237,0.2)' : 'none',
              }}
            >
              {p.badge && (
                <div style={{
                  position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)',
                  padding: '4px 16px', borderRadius: 100,
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  fontSize: 10, fontWeight: 800, color: 'white', letterSpacing: '0.12em',
                  whiteSpace: 'nowrap',
                }}>{p.badge}</div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 16, fontWeight: 800, color: p.highlight ? '#f1f0ff' : '#f1f0ff' }}>{p.name}</span>
              </div>
              <div style={{ fontSize: 12, color: '#5c5880', marginBottom: 20 }}>{p.desc}</div>
              <div style={{ marginBottom: 28 }}>
                <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 30, fontWeight: 800, color: p.color }}>{p.price}</span>
                <span style={{ fontSize: 13, color: '#5c5880' }}>{p.period}</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 28px' }}>
                {p.features.map(f => (
                  <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 9, fontSize: 13, color: '#a8a4c8', marginBottom: 10, lineHeight: 1.4 }}>
                    <CheckCircle size={13} color="#10b981" style={{ flexShrink: 0, marginTop: 1 }} /> {f}
                  </li>
                ))}
              </ul>
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                onClick={() => navigate(p.cta === 'Contact Sales' ? '/register' : '/register')}
                style={{
                  width: '100%', padding: '12px', borderRadius: 9, fontSize: 14, fontWeight: 700,
                  background: p.highlight
                    ? 'linear-gradient(135deg, #7c3aed, #6d28d9)'
                    : 'transparent',
                  border: p.highlight ? 'none' : `1px solid ${p.color}50`,
                  color: p.highlight ? 'white' : p.color, cursor: 'pointer',
                  letterSpacing: '0.04em',
                }}
              >{p.cta}</motion.button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Comparison table */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 24px 80px' }}>
        <h2 style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 20, fontWeight: 700, textAlign: 'center', marginBottom: 28, color: '#f1f0ff' }}>
          Full Comparison
        </h2>
        <div style={{ borderRadius: 12, overflow: 'hidden', border: '1px solid #2a2a4a' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#13131f', borderBottom: '1px solid #2a2a4a' }}>
                <th style={{ padding: '14px 20px', textAlign: 'left', fontSize: 12, color: '#5c5880', fontWeight: 600 }}>Feature</th>
                {PLANS.map(p => (
                  <th key={p.name} style={{ padding: '14px 16px', textAlign: 'center', fontSize: 12, color: p.highlight ? '#a855f7' : '#a8a4c8', fontWeight: 700 }}>{p.name}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARE.map((row, i) => (
                <tr key={row.feature} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(124,58,237,0.02)', borderBottom: '1px solid #2a2a4a' }}>
                  <td style={{ padding: '12px 20px', fontSize: 13, color: '#a8a4c8' }}>{row.feature}</td>
                  {['creator', 'starter', 'growth', 'enterprise'].map(k => (
                    <td key={k} style={{ padding: '12px 16px', textAlign: 'center', fontSize: 12, color: row[k] === '✓' ? '#10b981' : row[k] === '—' ? '#3a3060' : '#f1f0ff', fontFamily: row[k] === '✓' || row[k] === '—' ? 'inherit' : 'JetBrains Mono, monospace' }}>
                      {row[k]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CTA */}
      <div style={{ textAlign: 'center', padding: '40px 24px 60px', borderTop: '1px solid #2a2a4a' }}>
        <h3 style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 22, fontWeight: 700, margin: '0 0 12px' }}>Ready to protect your brand?</h3>
        <p style={{ color: '#5c5880', fontSize: 14, marginBottom: 28 }}>Start with a free trial. No credit card required.</p>
        <button onClick={() => navigate('/register')} style={{
          padding: '14px 40px', borderRadius: 10, fontSize: 15, fontWeight: 700,
          background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
          border: 'none', color: 'white', cursor: 'pointer',
          boxShadow: '0 0 30px rgba(124,58,237,0.3)',
        }}>Get Started Free</button>
      </div>
    </div>
  )
}
