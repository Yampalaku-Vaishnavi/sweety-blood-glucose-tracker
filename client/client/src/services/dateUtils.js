export function utcDateString(date = new Date()) {
  return date.toISOString().slice(0, 10)
}

export function utcMonthString(date = new Date()) {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`
}

export function previousUtcMonthString(date = new Date()) {
  const previousMonth = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() - 1, 1))
  return utcMonthString(previousMonth)
}
