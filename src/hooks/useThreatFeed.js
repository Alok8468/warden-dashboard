/**
 * useThreatFeed — real-time threat state management.
 *
 * Subscribes to the event stream and maintains three live data structures:
 *   threats    — unique threats, keyed by target, with live status
 *   takedowns  — takedown records keyed by takedown_id
 *   timeline   — all pipeline events ordered newest → oldest
 *
 * Each threat object:
 *   { target, threat_score, risk_level, kind, flags, url, brand,
 *     status, scan_id, detected_at,
 *     takedown_id?, takedown_status?, takedown_email_sent? }
 *
 * The `status` field tracks the full lifecycle:
 *   "detected" → "takedown_started" → "takedown_completed"
 */
import { useCallback, useReducer } from 'react'
import { useRealtimeEvents } from './useRealtimeEvents'

const MAX_THREATS  = 100
const MAX_TIMELINE = 300

// ── Reducer ───────────────────────────────────────────────────────────────────

function reducer(state, action) {
  switch (action.type) {
    case 'THREAT_DETECTED': {
      const { target, threat_score, risk_level, kind, flags, url, brand, scan_id, created_at } = action
      const existing = state.threats.find(t => t.target === target && t.brand === brand)
      if (existing) {
        // Update score if higher
        return {
          ...state,
          threats: state.threats.map(t =>
            t.target === target && t.brand === brand
              ? { ...t, threat_score: Math.max(t.threat_score, threat_score), detected_at: created_at }
              : t
          ),
          timeline: [action.raw, ...state.timeline].slice(0, MAX_TIMELINE),
        }
      }
      const threat = {
        target, threat_score, risk_level, kind, flags: flags || [], url,
        brand, scan_id, status: 'detected', detected_at: created_at,
        isNew: true,
      }
      return {
        ...state,
        threats:  [threat, ...state.threats].slice(0, MAX_THREATS),
        timeline: [action.raw, ...state.timeline].slice(0, MAX_TIMELINE),
      }
    }

    case 'TAKEDOWN_STARTED': {
      const { target, brand, takedown_id, scan_id } = action
      return {
        ...state,
        threats: state.threats.map(t =>
          t.target === target && t.brand === brand
            ? { ...t, status: 'takedown_started', takedown_id }
            : t
        ),
        takedowns: {
          ...state.takedowns,
          [takedown_id]: { takedown_id, target, brand, scan_id, status: 'started', started_at: action.created_at },
        },
        timeline: [action.raw, ...state.timeline].slice(0, MAX_TIMELINE),
      }
    }

    case 'TAKEDOWN_COMPLETED': {
      const { target, brand, takedown_id, status, email_sent, registrar_email } = action
      return {
        ...state,
        threats: state.threats.map(t =>
          t.target === target && t.brand === brand
            ? { ...t, status: 'takedown_completed', takedown_status: status, takedown_email_sent: email_sent }
            : t
        ),
        takedowns: {
          ...state.takedowns,
          [takedown_id]: {
            ...(state.takedowns[takedown_id] || {}),
            takedown_id, target, brand, status,
            email_sent, registrar_email,
            completed_at: action.created_at,
          },
        },
        timeline: [action.raw, ...state.timeline].slice(0, MAX_TIMELINE),
      }
    }

    case 'GENERIC_EVENT': {
      return {
        ...state,
        timeline: [action.raw, ...state.timeline].slice(0, MAX_TIMELINE),
      }
    }

    case 'CLEAR_NEW_FLAGS': {
      return {
        ...state,
        threats: state.threats.map(t => ({ ...t, isNew: false })),
      }
    }

    case 'RESET':
      return initialState

    default:
      return state
  }
}

const initialState = { threats: [], takedowns: {}, timeline: [] }

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useThreatFeed({ brand } = {}) {
  const [state, dispatch] = useReducer(reducer, initialState)

  const handleEvent = useCallback((event) => {
    const { event_type, data = {}, brand: evtBrand, scan_id, created_at } = event

    // Filter to current brand if specified
    if (brand && evtBrand && evtBrand !== brand) return

    switch (event_type) {
      case 'threat_detected':
        dispatch({
          type:         'THREAT_DETECTED',
          target:       data.target,
          threat_score: data.threat_score,
          risk_level:   data.risk_level,
          kind:         data.kind,
          flags:        data.flags,
          url:          data.url,
          brand:        evtBrand,
          scan_id,
          created_at,
          raw:          event,
        })
        break

      case 'takedown_started':
        dispatch({
          type:        'TAKEDOWN_STARTED',
          target:      data.target,
          brand:       evtBrand,
          takedown_id: data.takedown_id,
          scan_id,
          created_at,
          raw:         event,
        })
        break

      case 'takedown_completed':
        dispatch({
          type:            'TAKEDOWN_COMPLETED',
          target:          data.target,
          brand:           evtBrand,
          takedown_id:     data.takedown_id,
          status:          data.status,
          email_sent:      data.email_sent,
          registrar_email: data.registrar_email,
          created_at,
          raw:             event,
        })
        break

      default:
        dispatch({ type: 'GENERIC_EVENT', raw: event })
    }
  }, [brand])

  const { events, connected, error, clearEvents } = useRealtimeEvents({ onEvent: handleEvent })

  const reset = useCallback(() => {
    dispatch({ type: 'RESET' })
    clearEvents()
  }, [clearEvents])

  const clearNewFlags = useCallback(() => {
    dispatch({ type: 'CLEAR_NEW_FLAGS' })
  }, [])

  return {
    threats:    state.threats,
    takedowns:  state.takedowns,
    timeline:   state.timeline,
    connected,
    error,
    reset,
    clearNewFlags,
    // Raw events (for consumers that want everything)
    rawEvents:  events,
  }
}
