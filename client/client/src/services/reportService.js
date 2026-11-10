import { apiRequest } from './api.js'

export function getDailyReport(date) {
  return apiRequest(`/reports/daily?date=${encodeURIComponent(date)}`)
}

export function getMonthToDateReport(date) {
  return apiRequest(`/reports/month-to-date?date=${encodeURIComponent(date)}`)
}

export function getMonthlyReport(month) {
  const query = month ? `?month=${encodeURIComponent(month)}` : ''
  return apiRequest('/reports/monthly' + query)
}
