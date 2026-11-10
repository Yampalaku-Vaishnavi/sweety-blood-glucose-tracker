const TOKEN_KEY = 'sweety.accessToken'
const USER_KEY = 'sweety.user'

export function getToken() {
  return window.sessionStorage.getItem(TOKEN_KEY)
}

export function getSession() {
  const token = getToken()
  if (!token) return null

  try {
    return { token, user: JSON.parse(window.sessionStorage.getItem(USER_KEY) || 'null') }
  } catch {
    clearSession()
    return null
  }
}

export function saveSession({ token, user }) {
  window.sessionStorage.setItem(TOKEN_KEY, token)
  window.sessionStorage.setItem(USER_KEY, JSON.stringify(user))
}

export function clearSession() {
  window.sessionStorage.removeItem(TOKEN_KEY)
  window.sessionStorage.removeItem(USER_KEY)
}
