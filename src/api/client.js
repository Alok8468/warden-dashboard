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
  listScans:   ()                   => request('GET',  '/api/scans'),
  getScan:     (id)                 => request('GET',  `/api/scan/${id}`),
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

  // Stats & Evidence & Reports
  getStats:       ()      => request('GET', '/api/stats'),
  listEvidence:   ()      => request('GET', '/api/evidence'),
  listReports:    ()      => request('GET', '/api/reports'),
  generateReport: (brand) => `${BASE}/api/report/${encodeURIComponent(brand)}`,

  // Health
  health: () => fetch(`${BASE}/health`).then(r => r.json()).catch(() => null),

  // SSE stream
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
}
