const KEY      = 'warden_token'
const USER_KEY = 'warden_user'

export const getToken    = ()  => localStorage.getItem(KEY)
export const setToken    = (t) => localStorage.setItem(KEY, t)
export const clearToken  = ()  => { localStorage.removeItem(KEY); localStorage.removeItem(USER_KEY) }
export const isLoggedIn  = ()  => !!getToken()
export const getHeaders  = ()  => ({ 'Authorization': `Bearer ${getToken()}`, 'Content-Type': 'application/json' })
export const setUser     = (u) => {
  // Normalize full_name → name so display code can use user.name everywhere
  const normalized = u ? { ...u, name: u.name || u.full_name || '' } : u
  localStorage.setItem(USER_KEY, JSON.stringify(normalized))
}
export const getUser     = ()  => { try { return JSON.parse(localStorage.getItem(USER_KEY)) } catch { return null } }
