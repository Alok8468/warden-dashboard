import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Shield, Zap, Eye, FileText, Bell, BarChart2, ChevronRight, CheckCircle } from 'lucide-react'

const STATS = [
  { value: '$3.7B', label: 'Total Addressable Market' },
  { value: '63M+',  label: 'MSMEs in India' },
  { value: '3 hrs', label: 'Avg Takedown Time' },
  { value: '99.2%', label: 'Detection Accuracy' },
]

const PROBLEMS = [
  { icon: '🌐', title: 'Fake Websites',         desc: 'Lookalike domains stealing customers and revenue' },
  { icon: '📱', title: 'Social Impersonation',  desc: 'Fake accounts spreading misinformation' },
  { icon: '🎭', title: 'Deepfakes',             desc: 'AI-generated videos using your brand identity' },
  { icon: '📢', title: 'Fake Ads',              desc: 'Unauthorized ads defrauding your customers' },
  { icon: '📦', title: 'Counterfeit Products',  desc: 'Fake goods destroying brand reputation' },
]

const STEPS = [
  { n: '01', title: 'SCAN',    desc: 'AI scans 500+ domain variants and 7 social platforms simultaneously', time: '< 2 min', color: '#7c3aed' },
  { n: '02', title: 'DETECT',  desc: 'Threat engine scores every result 0–10 using 12 detection modules', time: '< 30 sec', color: '#f59e0b' },
  { n: '03', title: 'FIGHT',   desc: 'Autonomous agent files DMCA, contacts registrars, reports to platforms', time: '< 3 hrs', color: '#ef4444' },
  { n: '04', title: 'REPORT',  desc: 'Legal evidence package generated automatically for each takedown', time: 'Instant', color: '#10b981' },
]

const FEATURES = [
  { icon: Eye,         title: 'Brand Monitoring',      desc: 'Real-time scanning across domains and 7 social platforms. 500+ permutations per scan.' },
  { icon: Zap,         title: 'Autonomous Takedowns',  desc: 'AI agent files DMCA notices, abuse reports, and registrar complaints automatically.' },
  { icon: Shield,      title: 'Deepfake Detection',    desc: 'Identifies AI-generated content using your brand identity across video platforms.' },
  { icon: Bell,        title: 'WhatsApp Alerts',       desc: 'Instant WhatsApp notifications when high-risk threats are detected.' },
  { icon: FileText,    title: 'Legal Evidence',        desc: 'Timestamped screenshots, WHOIS, DNS records, and DMCA notices auto-packaged.' },
  { icon: BarChart2,   title: 'Live Dashboard',        desc: 'Protection score, threat radar, trend charts — all updating in real time.' },
]

const PLANS = [
  {
    name: 'Creator',
    price: '₹999',
    period: '/mo',
    desc: 'For individual creators',
    features: ['1 brand', 'DMCA filing', 'Platform monitoring', 'Content fingerprinting'],
    cta: 'Get Started',
    highlight: false,
  },
  {
    name: 'Starter',
    price: '₹25,000',
    period: '/mo',
    desc: 'For growing brands',
    features: ['1 brand', '5 platforms', 'Basic takedowns', 'WhatsApp alerts', 'Dashboard access'],
    cta: 'Get Started',
    highlight: false,
  },
  {
    name: 'Growth',
    price: '₹1,00,000',
    period: '/mo',
    desc: 'For established brands',
    badge: 'POPULAR',
    features: ['3 brands', 'All platforms', 'Priority takedowns', 'Legal evidence', 'Advanced dashboard', 'API access'],
    cta: 'Get Started',
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: '₹3,00,000+',
    period: '/mo',
    desc: 'For large enterprises',
    features: ['Unlimited brands', 'Custom monitoring', 'Dedicated agent', 'SLA guarantee', 'White-label', '24/7 support'],
    cta: 'Contact Sales',
    highlight: false,
  },
]

const REGULATIONS = [
  { title: 'IT Rules 2026',         desc: 'Mandatory 24-hour takedown compliance for platforms' },
  { title: 'DPDP Act',              desc: 'Data protection requirements for brand monitoring' },
  { title: 'Bharatiya Nyaya Sanhita', desc: 'Criminal remedies for brand impersonation' },
]

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: '100vh', background: '#0d0d14', color: '#f1f0ff', fontFamily: 'Inter, sans-serif', overflowX: 'hidden' }}>

      {/* Nav */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 40px', height: 60,
        background: 'rgba(13,13,20,0.9)', backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(124,58,237,0.15)',
      }}>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 18, fontWeight: 700, letterSpacing: '0.1em' }}>
          <span style={{ color: '#f1f0ff' }}>WARDEN</span>
          <span style={{ color: '#a855f7' }}>.AI</span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link to="/login" style={{
            padding: '8px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600,
            background: 'transparent', border: '1px solid rgba(124,58,237,0.4)',
            color: '#a855f7', textDecoration: 'none', cursor: 'pointer',
          }}>Sign In</Link>
          <button onClick={() => navigate('/register')} style={{
            padding: '8px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600,
            background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
            border: 'none', color: 'white', cursor: 'pointer',
          }}>Start Free Trial</button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        minHeight: '100vh', display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '100px 24px 60px', textAlign: 'center',
        position: 'relative',
      }}>
        {/* Grid bg */}
        <div style={{
          position: 'absolute', inset: 0, opacity: 0.3,
          backgroundImage: 'linear-gradient(rgba(124,58,237,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.08) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />

        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} style={{ position: 'relative' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 14px', borderRadius: 100,
            background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.3)',
            fontSize: 11, color: '#a855f7', fontWeight: 600, letterSpacing: '0.1em',
            marginBottom: 28, textTransform: 'uppercase',
          }}>
            <Shield size={11} /> AI-Powered Brand Protection
          </div>

          <h1 style={{
            fontFamily: 'JetBrains Mono, monospace',
            fontSize: 'clamp(36px, 7vw, 72px)',
            fontWeight: 700, lineHeight: 1.1,
            margin: '0 0 24px', letterSpacing: '0.04em',
          }}>
            <span style={{ color: '#f1f0ff' }}>WARDEN</span>
            <span style={{ color: '#a855f7', textShadow: '0 0 40px rgba(168,85,247,0.4)' }}>.AI</span>
          </h1>

          <p style={{ fontSize: 'clamp(18px, 3vw, 26px)', color: '#a8a4c8', maxWidth: 700, margin: '0 auto 16px', lineHeight: 1.5 }}>
            The AI Agent That Destroys Brand Threats — <span style={{ color: '#f59e0b' }}>Automatically</span>
          </p>
          <p style={{ fontSize: 14, color: '#5c5880', maxWidth: 500, margin: '0 auto 40px' }}>
            Detects fake domains, social impersonators, and deepfakes. Files DMCA takedowns autonomously. Built for India's fastest-growing brands.
          </p>

          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 60 }}>
            <motion.button
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/register')}
              style={{
                padding: '14px 32px', borderRadius: 10, fontSize: 15, fontWeight: 700,
                background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                border: 'none', color: 'white', cursor: 'pointer',
                boxShadow: '0 0 30px rgba(124,58,237,0.4)',
                display: 'flex', alignItems: 'center', gap: 8,
              }}
            >
              Start Free Trial <ChevronRight size={16} />
            </motion.button>
            <button
              onClick={() => navigate('/login')}
              style={{
                padding: '14px 32px', borderRadius: 10, fontSize: 15, fontWeight: 600,
                background: 'transparent',
                border: '1px solid rgba(124,58,237,0.4)',
                color: '#a8a4c8', cursor: 'pointer',
              }}
            >
              Sign In to Dashboard
            </button>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap' }}>
            {STATS.map(s => (
              <div key={s.label} style={{
                padding: '16px 24px', borderRadius: 12,
                background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.15)',
                textAlign: 'center', minWidth: 120,
              }}>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 22, fontWeight: 700, color: '#a855f7' }}>{s.value}</div>
                <div style={{ fontSize: 11, color: '#5c5880', marginTop: 4 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Problem section */}
      <section style={{ padding: '80px 24px', background: 'rgba(124,58,237,0.03)', borderTop: '1px solid rgba(124,58,237,0.1)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 28, fontWeight: 700, color: '#f1f0ff', margin: '0 0 12px' }}>
              Your Brand Is Under Attack
            </h2>
            <p style={{ color: '#5c5880', fontSize: 14 }}>Every day, bad actors exploit your brand across the internet</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
            {PROBLEMS.map(p => (
              <div key={p.title} style={{
                padding: '24px 20px', borderRadius: 12,
                background: '#13131f', border: '1px solid #2a2a4a',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>{p.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#f1f0ff', marginBottom: 8 }}>{p.title}</div>
                <div style={{ fontSize: 12, color: '#5c5880', lineHeight: 1.6 }}>{p.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 28, fontWeight: 700, color: '#f1f0ff', margin: '0 0 12px' }}>
              How It Works
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
            {STEPS.map(s => (
              <div key={s.n} style={{
                padding: '28px 24px', borderRadius: 12,
                background: '#13131f', border: `1px solid ${s.color}30`,
                position: 'relative',
              }}>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 40, fontWeight: 700, color: `${s.color}20`, position: 'absolute', top: 16, right: 16 }}>{s.n}</div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 18, fontWeight: 700, color: s.color, marginBottom: 12 }}>{s.title}</div>
                <div style={{ fontSize: 13, color: '#a8a4c8', lineHeight: 1.6, marginBottom: 16 }}>{s.desc}</div>
                <div style={{
                  display: 'inline-block', padding: '3px 10px', borderRadius: 100,
                  background: `${s.color}15`, border: `1px solid ${s.color}40`,
                  fontSize: 11, color: s.color, fontFamily: 'JetBrains Mono, monospace',
                }}>{s.time}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ padding: '80px 24px', background: 'rgba(124,58,237,0.03)', borderTop: '1px solid rgba(124,58,237,0.1)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 28, fontWeight: 700, color: '#f1f0ff', margin: '0 0 12px' }}>
              Everything You Need
            </h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {FEATURES.map(f => {
              const Icon = f.icon
              return (
                <div key={f.title} style={{
                  padding: '28px 24px', borderRadius: 12,
                  background: '#13131f', border: '1px solid #2a2a4a',
                }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 10, marginBottom: 16,
                    background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Icon size={20} color="#a855f7" />
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: '#f1f0ff', marginBottom: 8 }}>{f.title}</div>
                  <div style={{ fontSize: 13, color: '#5c5880', lineHeight: 1.6 }}>{f.desc}</div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section style={{ padding: '80px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 28, fontWeight: 700, color: '#f1f0ff', margin: '0 0 12px' }}>
              Simple Pricing
            </h2>
            <p style={{ color: '#5c5880', fontSize: 14 }}>Start free. Scale as you grow.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: 20 }}>
            {PLANS.map(p => (
              <div key={p.name} style={{
                padding: '32px 24px', borderRadius: 14,
                background: p.highlight ? 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(76,29,149,0.1))' : '#13131f',
                border: `1px solid ${p.highlight ? '#7c3aed' : '#2a2a4a'}`,
                position: 'relative',
                boxShadow: p.highlight ? '0 0 40px rgba(124,58,237,0.2)' : 'none',
              }}>
                {p.badge && (
                  <div style={{
                    position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                    padding: '3px 14px', borderRadius: 100,
                    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                    fontSize: 10, fontWeight: 700, color: 'white', letterSpacing: '0.1em',
                  }}>{p.badge}</div>
                )}
                <div style={{ fontSize: 16, fontWeight: 700, color: '#f1f0ff', marginBottom: 4 }}>{p.name}</div>
                <div style={{ fontSize: 12, color: '#5c5880', marginBottom: 20 }}>{p.desc}</div>
                <div style={{ marginBottom: 24 }}>
                  <span style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 28, fontWeight: 700, color: p.highlight ? '#a855f7' : '#f1f0ff' }}>{p.price}</span>
                  <span style={{ fontSize: 13, color: '#5c5880' }}>{p.period}</span>
                </div>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px' }}>
                  {p.features.map(f => (
                    <li key={f} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#a8a4c8', marginBottom: 8 }}>
                      <CheckCircle size={13} color="#10b981" style={{ flexShrink: 0 }} /> {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => navigate(p.cta === 'Contact Sales' ? '/register' : '/register')}
                  style={{
                    width: '100%', padding: '11px', borderRadius: 8, fontSize: 13, fontWeight: 700,
                    background: p.highlight ? 'linear-gradient(135deg, #7c3aed, #6d28d9)' : 'transparent',
                    border: p.highlight ? 'none' : '1px solid #2a2a4a',
                    color: p.highlight ? 'white' : '#a8a4c8', cursor: 'pointer',
                  }}
                >{p.cta}</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* India Regulatory */}
      <section style={{ padding: '60px 24px', background: 'rgba(124,58,237,0.03)', borderTop: '1px solid rgba(124,58,237,0.1)' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <h3 style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 18, fontWeight: 700, color: '#f1f0ff', marginBottom: 8 }}>
            Built for India's Regulatory Landscape
          </h3>
          <p style={{ color: '#5c5880', fontSize: 13, marginBottom: 32 }}>
            Fully compliant with Indian laws. Our takedown agent knows exactly which laws to cite.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            {REGULATIONS.map(r => (
              <div key={r.title} style={{
                padding: '16px 24px', borderRadius: 10, textAlign: 'left',
                background: '#13131f', border: '1px solid rgba(124,58,237,0.2)',
                maxWidth: 240,
              }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#a855f7', marginBottom: 6 }}>{r.title}</div>
                <div style={{ fontSize: 11, color: '#5c5880', lineHeight: 1.5 }}>{r.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 24px', textAlign: 'center' }}>
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 32, fontWeight: 700, color: '#f1f0ff', margin: '0 0 16px' }}>
            Start Protecting Your Brand Today
          </h2>
          <p style={{ color: '#5c5880', fontSize: 14, marginBottom: 36 }}>
            Join 2,400+ brands already protected by WARDEN.AI
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <motion.button
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/register')}
              style={{
                padding: '16px 40px', borderRadius: 10, fontSize: 16, fontWeight: 700,
                background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                border: 'none', color: 'white', cursor: 'pointer',
                boxShadow: '0 0 40px rgba(124,58,237,0.4)',
              }}
            >
              Get Started Free
            </motion.button>
            <button
              onClick={() => navigate('/login')}
              style={{
                padding: '16px 40px', borderRadius: 10, fontSize: 16, fontWeight: 600,
                background: 'transparent', border: '1px solid rgba(124,58,237,0.4)',
                color: '#a8a4c8', cursor: 'pointer',
              }}
            >
              Sign In
            </button>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '24px', borderTop: '1px solid #2a2a4a', textAlign: 'center' }}>
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 13, color: '#3a3060' }}>
          <span style={{ color: '#5c5880' }}>WARDEN</span>
          <span style={{ color: '#7c3aed' }}>.AI</span>
          <span style={{ margin: '0 12px', color: '#2a2a4a' }}>|</span>
          <span style={{ color: '#3a3060' }}>Brand Protection Platform · Made in India</span>
        </div>
      </footer>
    </div>
  )
}
