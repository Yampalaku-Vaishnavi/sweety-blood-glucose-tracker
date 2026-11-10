import { apiRequest } from './api.js'

export function listReadings(date) {
  const query = date ? `?date=${encodeURIComponent(date)}` : ''
  return apiRequest('/readings' + query)
}

export function createReading(reading) {
  return apiRequest('/readings', { method: 'POST', body: reading })
}

export function updateReading(id, reading) {
  return apiRequest(`/readings/${encodeURIComponent(id)}`, { method: 'PUT', body: reading })
}

export function deleteReading(id) {
  return apiRequest(`/readings/${encodeURIComponent(id)}`, { method: 'DELETE' })
}
