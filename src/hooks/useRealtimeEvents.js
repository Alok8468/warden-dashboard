/**
 * useRealtimeEvents — connects to /api/events/stream (SSE) and exposes
 * a live stream of typed pipeline events for the current tenant.
 *
 * Returns:
 *   events      — array of all events received this session (newest first)
 *   connected   — true | false | null (null = not yet attempted)
 *   error       — last error message, or null
 *   clearEvents — reset the events array
 *
 * Event shape:
 *   { event_type, brand, brand_id, scan_id, data, created_at }
 *
 * event_type values:
 *   "threat_detected"    — a new high-risk threat was found
 *   "takedown_started"   — automated takedown initiated
 *   "takedown_completed" — takedown finished (any status)
 *   "scan_queued"        — brand scan was queued
 *   "scan_completed"     — scan finished
 *   "alert_sent"         — WA/channel alert dispatched
 *   "connected"          — SSE handshake (ignore in UI)
 *   "ping"               — heartbeat (ignore in UI)
 */
import { useEffect, useRef, useState, useCallback } from 'react'
import { getToken } from '../auth'

const BASE          = 'http://localhost:8000'
const MAX_EVENTS    = 200          // cap in-memory history
const RECONNECT_MS  = [1000, 2000, 4000, 8000, 15000, 30000]  // backoff ladder

export function useRealtimeEvents({ onEvent } = {}) {
  const [events,    setEvents]    = useState([])
  const [connected, setConnected] = useState(null)
  const [error,     setError]     = useState(null)

  const esRef       = useRef(null)
  const attemptRef  = useRef(0)
  const mountedRef  = useRef(true)
  const timerRef    = useRef(null)
  const onEventRef  = useRef(onEvent)

  // Keep callback ref current without re-connecting
  useEffect(() => { onEventRef.current = onEvent }, [onEvent])

  const clearEvents = useCallback(() => setEvents([]), [])

  const connect = useCallback(() => {
    if (!mountedRef.current) return

    const token = getToken()
    if (!token) {
      setError('Not authenticated')
      setConnected(false)
      return
    }

    const url = `${BASE}/api/events/stream?token=${encodeURIComponent(token)}`
    const es  = new EventSource(url)
    esRef.current = es

    es.onopen = () => {
      if (!mountedRef.current) return
      attemptRef.current = 0
      setConnected(true)
      setError(null)
    }

    es.onmessage = (e) => {
      if (!mountedRef.current) return
      try {
        const event = JSON.parse(e.data)

        // Skip internals
        if (event.event_type === 'ping' || event.event_type === 'connected') return

        // Prepend (newest first) + cap size
        setEvents(prev => [event, ...prev].slice(0, MAX_EVENTS))

        // Fire callback if provided
        onEventRef.current?.(event)
      } catch { /* malformed frame — ignore */ }
    }

    es.onerror = () => {
      if (!mountedRef.current) return
      es.close()
      setConnected(false)

      const delay = RECONNECT_MS[Math.min(attemptRef.current, RECONNECT_MS.length - 1)]
      attemptRef.current++
      setError(`Reconnecting in ${Math.round(delay / 1000)}s…`)

      timerRef.current = setTimeout(connect, delay)
    }
  }, [])

  useEffect(() => {
    mountedRef.current = true
    connect()
    return () => {
      mountedRef.current = false
      clearTimeout(timerRef.current)
      esRef.current?.close()
    }
  }, [connect])

  return { events, connected, error, clearEvents }
}
