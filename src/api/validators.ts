const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const offsetTimestampPattern = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?(?:Z|[+-](\d{2}):(\d{2}))$/

export const stableCodePattern = /^[A-Z][A-Z0-9_]{0,63}$/

export function isUuid(value: unknown): value is string {
  return typeof value === 'string' && uuidPattern.test(value)
}

/** Strict RFC 3339 shape and calendar validation; Date.parse alone normalizes impossible dates. */
export function isOffsetTimestamp(value: unknown): value is string {
  if (typeof value !== 'string') return false
  const match = offsetTimestampPattern.exec(value)
  if (!match) return false
  const [year, month, day, hour, minute, second, offsetHour, offsetMinute] = match.slice(1).map(Number)
  if (year < 1 || month < 1 || month > 12 || hour > 23 || minute > 59 || second > 59
    || (offsetHour != null && offsetHour > 23) || (offsetMinute != null && offsetMinute > 59)) return false
  const calendar = new Date(0)
  calendar.setUTCHours(0, 0, 0, 0)
  calendar.setUTCFullYear(year, month - 1, day)
  return calendar.getUTCFullYear() === year && calendar.getUTCMonth() === month - 1
    && calendar.getUTCDate() === day && Number.isFinite(Date.parse(value))
}
