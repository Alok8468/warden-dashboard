/**
 * ScoreTrend — 7-day protection score area chart.
 * Self-loads from /api/score/history; refreshes every 60 s.
 */
import { useState, useEffect } from 'react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { api } from '../api/client'

function scoreColor(s) {
  if (s >= 90) return '#10b981'
  if (s >= 70) return '#06b6d4'
  if (s >= 50) return '#f59e0b'
  return '#ef4444'
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  const color = scoreColor(d.score)
  return (
    <div style={{
      background: '#13131f', border: '1px solid #2a2a4a', borderRadius: 8,
      padding: '10px 14px', fontSize: 11, fontFamily: 'JetBrains Mono, monospace',
    }}>
      <div style={{ color: '#5c5880', marginBottom: 6 }}>{label}</div>
      <div style={{ color, fontWeight: 700, fontSize: 16, marginBottom: 4 }}>
        {d.score}<span style={{ color: '#5c5880', fontWeight: 400, fontSize: 10 }}>/100</span>
      </div>
      <div style={{ color: '#ef4444', fontSize: 10 }}>HIGH {d.threats_high}</div>
      <div style={{ color: '#f59e0b', fontSize: 10 }}>MED  {d.threats_medium}</div>
      <div style={{ color: '#10b981', fontSize: 10 }}>LOW  {d.threats_low}</div>
    </div>
  )
}

export function ScoreTrend() {
  const [history, setHistory] = useState([])

  useEffect(() => {
    const load = () =>
      api.scoreHistory(7)
        .then(d => setHistory(d.history || []))
        .catch(() => {})

    load()
    const id = setInterval(load, 60_000)
    return () => clearInterval(id)
  }, [])

  if (history.length === 0) return null

  const formatted = history.map(h => ({
    ...h,
    label: new Date(h.date + 'T12:00:00').toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }),
  }))

  const lastScore = formatted[formatted.length - 1]?.score ?? 100
  const color     = scoreColor(lastScore)

  return (
    <div className="card p-5" style={{ minWidth: 220 }}>
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16,
      }}>
        <span style={{
          fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
          color: '#5c5880', letterSpacing: '0.12em', textTransform: 'uppercase',
        }}>
          Score — 7 days
        </span>
        <span style={{
          fontFamily: 'JetBrains Mono, monospace', fontSize: 13,
          fontWeight: 700, color,
        }}>
          {lastScore}
        </span>
      </div>

      <ResponsiveContainer width="100%" height={110}>
        <AreaChart data={formatted} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="gScore7" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={color} stopOpacity={0.28} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(42,42,74,0.6)" />
          <XAxis
            dataKey="label"
            tick={{ fill: '#5c5880', fontSize: 9, fontFamily: 'JetBrains Mono, monospace' }}
            tickLine={false} axisLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fill: '#5c5880', fontSize: 9, fontFamily: 'JetBrains Mono, monospace' }}
            tickLine={false} axisLine={false}
            ticks={[0, 50, 100]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="score"
            stroke={color}
            fill="url(#gScore7)"
            strokeWidth={2}
            dot={{ r: 3, fill: color, strokeWidth: 0 }}
            activeDot={{ r: 5, fill: color }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
