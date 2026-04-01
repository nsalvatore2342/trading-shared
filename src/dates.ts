// dates.ts — date/time parsing helpers for Silexx Excel exports

import * as XLSX from 'xlsx'

/**
 * Parses a raw cell value (Excel serial number or string) into an ISO date string.
 * Supports:
 *   - Excel serial number  (e.g. 45678)
 *   - MM/DD/YYYY or MM-DD-YYYY
 *   - Any string parseable by Date
 * Returns YYYY-MM-DD or null on failure.
 */
export function parseDate(raw: unknown): string | null {
  if (raw == null) return null
  if (typeof raw === 'number') {
    const d = XLSX.SSF.parse_date_code(raw)
    if (!d) return null
    return `${d.y}-${String(d.m).padStart(2, '0')}-${String(d.d).padStart(2, '0')}`
  }
  const s = String(raw).trim()
  // MM/DD/YYYY or MM-DD-YYYY
  const mdy = s.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/)
  if (mdy) {
    const [, m, d, y] = mdy
    const year = y.length === 2 ? `20${y}` : y
    return `${year}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`
  }
  const dt = new Date(s)
  if (!isNaN(dt.getTime())) return dt.toISOString().slice(0, 10)
  return null
}

/**
 * Parses a raw cell value into an HH:MM:SS time string.
 * Supports:
 *   - Excel time fraction (0.5 = 12:00:00)
 *   - HH:MM or HH:MM:SS strings
 * Returns HH:MM:SS or null on failure.
 */
export function parseTime(raw: unknown): string | null {
  if (raw == null) return null
  if (typeof raw === 'number') {
    const totalSec = Math.round(raw * 86400)
    const h = Math.floor(totalSec / 3600)
    const m = Math.floor((totalSec % 3600) / 60)
    const s = totalSec % 60
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }
  const s = String(raw).trim()
  const match = s.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?/)
  if (match) {
    const [, h, m, sec = '00'] = match
    return `${h.padStart(2, '0')}:${m.padStart(2, '0')}:${sec.padStart(2, '0')}`
  }
  return null
}

/** Converts an HH:MM:SS string to total seconds since midnight. */
export function timeToSeconds(t: string): number {
  const [h, m, s] = t.split(':').map(Number)
  return h * 3600 + m * 60 + (s || 0)
}
