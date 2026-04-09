const KEY = 'warden_token'

export const getToken    = ()  => localStorage.getItem(KEY)
export const setToken    = (t) => localStorage.setItem(KEY, t)
export const clearToken  = ()  => localStorage.removeItem(KEY)
export const isLoggedIn  = ()  => !!getToken()
export const getHeaders  = ()  => ({ 'Authorization': `Bearer ${getToken()}`, 'Content-Type': 'application/json' })
