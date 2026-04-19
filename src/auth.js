const KEY      = 'warden_token'
const USER_KEY = 'warden_user'

export const getToken    = ()  => localStorage.getItem(KEY)
export const setToken    = (t) => localStorage.setItem(KEY, t)
export const clearToken  = ()  => { localStorage.removeItem(KEY); localStorage.removeItem(USER_KEY) }
export const isLoggedIn  = ()  => !!getToken()
export const getHeaders  = ()  => ({ 'Authorization': `Bearer ${getToken()}`, 'Content-Type': 'application/json' })
export const setUser     = (u) => localStorage.setItem(USER_KEY, JSON.stringify(u))
export const getUser     = ()  => { try { return JSON.parse(localStorage.getItem(USER_KEY)) } catch { return null } }
