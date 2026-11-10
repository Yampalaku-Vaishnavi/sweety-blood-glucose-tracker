import { clearSession, getToken } from './authStorage.js'

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api').replace(/\/+$/, '')

export async function apiRequest(path, { method = 'GET', body } = {}) {
  const token = getToken()
  const headers = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = 'Bearer ' + token

  let response
  try {
    response = await fetch(API_BASE_URL + path, {
      method,
      headers,
      ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
    })
  } catch {
    throw new Error('Unable to reach Sweety right now. Check your connection and try again.')
  }

  const responseText = await response.text()
  let data = null
  if (responseText) {
    try {
      data = JSON.parse(responseText)
    } catch {
      data = { message: responseText }
    }
  }

  if (!response.ok) {
    if (response.status === 401 && token && !path.startsWith('/auth/')) {
      clearSession()
      window.dispatchEvent(new Event('sweety:unauthorized'))
    }
    throw new Error(data?.message || 'Request failed (' + response.status + '). Please try again.')
  }

  return data
}
