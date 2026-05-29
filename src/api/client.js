import { getToken, clearToken } from '../auth'

const BASE = 'http://localhost:8000'

async function request(method, path, body) {
  const token = getToken()
  const headers = { 'Content-Type': 'application/json' }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (res.status === 401) {
    clearToken()
    window.location.href = '/login'
    return
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || 'Request failed')
  }
  return res.json()
}

export const api = {
  // Auth
  login:    (email, password)                    => request('POST', '/auth/login',    { email, password }),
  register: (email, password, full_name)  => request('POST', '/auth/signup', { email, password, full_name }),
  me:       ()                                   => request('GET',  '/auth/me'),

  // Brands
  listBrands:   ()         => request('GET',    '/api/brands'),
  createBrand:  (body)     => request('POST',   '/api/brands', body),
  getBrand:     (id)       => request('GET',    `/api/brands/${id}`),
  updateBrand:  (id, body) => request('PUT',    `/api/brands/${id}`, body),
  deleteBrand:  (id)       => request('DELETE', `/api/brands/${id}`),

  // Scans
  listScans:   (limit)              => request('GET',  `/api/scans${limit ? `?limit=${limit}` : ''}`),
  getScan:     (id)                 => request('GET',  `/api/scan/${id}/status`),
  scanDomains: (domain, max)        => request('POST', '/api/scan/domains', { domain, max_permutations: max }),
  scanSocial:  (brand, platforms)   => request('POST', '/api/scan/social',  { brand_name: brand, platforms }),
  scanFull:    (brand, domain, max) => request('POST', '/api/scan/full',    { brand_name: brand, domain, max_permutations: max }),

  // Alerts
  addRecipient:    (phone, brand)       => request('POST',   '/api/alerts/recipients', { brand, phone }),
  removeRecipient: (phone, brand)       => request('DELETE', '/api/alerts/recipients', { brand, phone }),
  listRecipients:  (brand)             => request('GET',    `/api/alerts/recipients/${encodeURIComponent(brand)}`),
  sendTestAlert:   (phone, brand)      => request('POST',   '/api/alerts/test',   { phone, brand }),
  sendEmailAlert:  (to, brand, scan_id) => request('POST',  '/api/alerts/email',  { to, brand, scan_id }),
  alertHistory:    ()                  => request('GET',    '/api/alerts/history'),

  // Channels (Apprise)
  listChannels:   ()      => request('GET',  '/api/channels'),
  addChannel:     (body)  => request('POST', '/api/channels', body),
  deleteChannel:  (id)    => request('DELETE', `/api/channels/${id}`),

  // Takedowns
  fileTakedown:         (body)         => request('POST', '/api/takedown',           body),
  getTakedown:          (id)           => request('GET',  `/api/takedown/${id}`),
  listTakedowns:        (brand)        => request('GET',  `/api/takedowns${brand ? `?brand=${encodeURIComponent(brand)}` : ''}`),
  updateTakedownStatus: (id, status)   => request('PUT',  `/api/takedowns/${id}/status`, { status }),

  // Scheduler
  schedulerJobs:      ()       => request('GET',    '/api/scheduler/jobs'),
  addSchedulerJob:    (body)   => request('POST',   '/api/scheduler/jobs', body),
  removeSchedulerJob: (id)     => request('DELETE', `/api/scheduler/jobs/${id}`),
  runScanNow:         (domain) => request('POST',   `/api/scheduler/run-now/${domain}`),

  // Monitoring
  knownThreats:  (brand)        => request('GET',  `/api/monitoring/known/${encodeURIComponent(brand)}`),
  resolveThreat: (domain, brand) => request('POST', '/api/monitoring/resolve', { domain, brand }),

  // Threats (with filter support)
  listThreats: ({ brand, scan_id, risk_level, min_score, limit, offset } = {}) => {
    const q = new URLSearchParams()
    if (brand)      q.set('brand',      brand)
    if (scan_id)    q.set('scan_id',    scan_id)
    if (risk_level) q.set('risk_level', risk_level)
    if (min_score)  q.set('min_score',  min_score)
    if (limit)      q.set('limit',      limit)
    if (offset)     q.set('offset',     offset)
    const qs = q.toString()
    return request('GET', `/api/threats${qs ? `?${qs}` : ''}`)
  },

  // Stats & Evidence & Reports
  getStats:       ()           => request('GET', '/api/stats'),
  scoreHistory:   (days = 7)  => request('GET', `/api/score/history?days=${days}`),
  listEvidence:   ()           => request('GET', '/api/evidence'),
  listReports:    ()           => request('GET', '/api/reports'),
  generateReport: (brand)      => `${BASE}/api/report/${encodeURIComponent(brand)}`,

  // Health (no auth required — use raw fetch so a missing token never causes a redirect)
  health: () => fetch(`${BASE}/health`).then(r => r.json()).catch(() => null),

  // SSE stream (kept for backward compat)
  streamScan: (scanId, onEvent, onDone) => {
    const es = new EventSource(`${BASE}/api/scan/${scanId}/stream`)
    es.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data)
        if (data.type === 'done') { es.close(); onDone(data) }
        else onEvent(data)
      } catch { /* ignore */ }
    }
    es.onerror = () => { es.close(); onDone({ type: 'done', status: 'error', results: null }) }
    return es
  },

  /**
   * WebSocket scan progress stream with automatic exponential-backoff reconnection.
   *
   * Returns a controller object:
   *   controller.close()   — gracefully close (no reconnect)
   *   controller.closed    — true after close() has been called
   *
   * Callbacks:
   *   onEvent(data)          — progress event { message, current, total, ts }
   *   onDone(data)           — terminal event { type:'done', status, results? }
   *   onReconnect(attempt)   — called when a reconnect attempt starts (optional)
   *   onConnectionChange(ok) — called with true=connected / false=disconnected (optional)
   */
  streamScanWS: (scanId, { onEvent, onDone, onReconnect, onConnectionChange } = {}) => {
    const WS_BASE   = BASE.replace(/^http/, 'ws')
    const MAX_RETRY = 6
    const BACKOFF   = [500, 1000, 2000, 4000, 8000, 15000]  // ms per attempt

    let ws        = null
    let attempt   = 0
    let done      = false  // set when a 'done' event is received — no more reconnects
    const ctrl    = { closed: false }

    function connect() {
      if (ctrl.closed || done) return

      ws = new WebSocket(`${WS_BASE}/api/scan/${scanId}/ws`)

      ws.onopen = () => {
        attempt = 0
        onConnectionChange?.(true)
      }

      ws.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data)
          if (data.type === 'ping') return        // heartbeat — ignore
          if (data.type === 'done' || data.type === 'cancelled') {
            done = true
            ws.close()
            onDone?.(data)
          } else {
            onEvent?.(data)
          }
        } catch { /* malformed frame — ignore */ }
      }

      ws.onerror = () => { /* handled by onclose */ }

      ws.onclose = (e) => {
        onConnectionChange?.(false)
        if (ctrl.closed || done) return
        if (attempt >= MAX_RETRY) {
          onDone?.({ type: 'done', status: 'error', error: 'Connection lost' })
          return
        }
        const delay = BACKOFF[attempt] ?? 15000
        attempt++
        onReconnect?.(attempt)
        setTimeout(connect, delay)
      }
    }

    ctrl.close = () => {
      ctrl.closed = true
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'cancel' }))
        ws.close(1000, 'client closed')
      }
    }

    connect()
    return ctrl
  },

  /**
   * Open the per-tenant real-time events SSE stream.
   *
   * Returns an EventSource-like controller:
   *   ctrl.close()   — close connection (no reconnect)
   *   ctrl.closed    — true after close()
   *
   * Callbacks (all optional):
   *   onEvent(event)          — called for every non-ping event
   *   onConnectionChange(ok)  — true=connected, false=disconnected
   *   onReconnect(attempt)    — called on each reconnect attempt
   */
  openEventStream: (token, { onEvent, onConnectionChange, onReconnect } = {}) => {
    const MAX_RETRY = 10
    const BACKOFF   = [1000, 2000, 4000, 8000, 15000, 30000]

    let es       = null
    let attempt  = 0
    const ctrl   = { closed: false }

    function connect() {
      if (ctrl.closed) return
      const url = `${BASE}/api/events/stream?token=${encodeURIComponent(token)}`
      es = new EventSource(url)

      es.onopen = () => {
        attempt = 0
        onConnectionChange?.(true)
      }

      es.onmessage = (e) => {
        try {
          const event = JSON.parse(e.data)
          if (event.event_type === 'ping' || event.event_type === 'connected') return
          onEvent?.(event)
        } catch { /* ignore malformed */ }
      }

      es.onerror = () => {
        es.close()
        onConnectionChange?.(false)
        if (ctrl.closed || attempt >= MAX_RETRY) return
        const delay = BACKOFF[Math.min(attempt, BACKOFF.length - 1)]
        attempt++
        onReconnect?.(attempt)
        setTimeout(connect, delay)
      }
    }

    ctrl.close = () => {
      ctrl.closed = true
      es?.close()
    }

    connect()
    return ctrl
  },
}
