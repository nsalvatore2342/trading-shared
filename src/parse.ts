// parse.ts — full Silexx Excel → OrderGroup[] pipeline

import * as XLSX from 'xlsx'
import type { OrderGroup, ParsedLeg, RawImportRow } from './types'
import {
  findCol,
  COL_DATE, COL_TIME, COL_SYMBOL, COL_QTY,
  COL_PRICE, COL_SIDE, COL_EXPIRY, COL_STRIKE, COL_PUT_CALL,
} from './columns'
import { parseDate, parseTime, timeToSeconds } from './dates'
import { parseSilexxSymbol } from './symbols'

export interface ParseSuccess {
  groups:   OrderGroup[]
  filename: string
}

export interface ParseFailure {
  error: string
}

export type ParseResult = ParseSuccess | ParseFailure

/** Type guard — true when the result is an error. */
export function isParseError(r: ParseResult): r is ParseFailure {
  return 'error' in r
}

/**
 * Full pipeline: Buffer → OrderGroup[].
 *
 * Steps:
 *  1. Parse Excel with xlsx
 *  2. Detect header row and column indices
 *  3. Parse each row into a RawImportRow
 *  4. Group rows by (underlying, date, second)
 *  5. Auto-merge consecutive groups within ≤2 seconds (split-fill handling)
 *  6. Aggregate same (symbol, side) legs with weighted-average pricing
 *  7. Sort groups by date+time descending
 */
export function parseXlsxBuffer(buffer: Buffer, filename: string): ParseResult {
  try {
    const workbook = XLSX.read(buffer, { type: 'buffer', cellDates: false })
    const sheetName = workbook.SheetNames[0]
    const sheet = workbook.Sheets[sheetName]
    const allRows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: null })

    if (allRows.length < 2) return { error: 'File appears empty' }

    // Find header row — first row that contains 'date' or 'symbol' (case-insensitive)
    let headerIdx = -1
    for (let i = 0; i < Math.min(10, allRows.length); i++) {
      const row = allRows[i] as string[]
      const lower = row.map(c => c?.toString().toLowerCase().trim() ?? '')
      if (lower.includes('date') || lower.includes('symbol')) { headerIdx = i; break }
    }
    if (headerIdx === -1) return { error: 'Could not find header row' }

    const header = (allRows[headerIdx] as string[]).map(h => h?.toString() ?? '')
    const iDate    = findCol(header, COL_DATE)
    const iTime    = findCol(header, COL_TIME)
    const iSymbol  = findCol(header, COL_SYMBOL)
    const iQty     = findCol(header, COL_QTY)
    const iPrice   = findCol(header, COL_PRICE)
    const iSide    = findCol(header, COL_SIDE)
    const iExpiry  = findCol(header, COL_EXPIRY)
    const iStrike  = findCol(header, COL_STRIKE)
    const iPutCall = findCol(header, COL_PUT_CALL)

    if (iDate === -1 || iSymbol === -1 || iSide === -1 || iQty === -1 || iPrice === -1) {
      return { error: `Could not find required columns. Found: ${header.join(', ')}` }
    }

    // ── Step 3: parse each row ──────────────────────────────────────────────
    const rawRows: RawImportRow[] = []

    for (let r = headerIdx + 1; r < allRows.length; r++) {
      const row = allRows[r] as unknown[]
      const sym = row[iSymbol]?.toString().trim()
      if (!sym) continue

      const row_date = parseDate(row[iDate])
      const row_time = iTime !== -1 ? parseTime(row[iTime]) : null
      if (!row_date || !row_time) continue

      const sideRaw  = row[iSide]?.toString().trim() ?? ''
      const side: 'Bot' | 'Sold' = sideRaw.toLowerCase().startsWith('b') ? 'Bot' : 'Sold'
      const fill_qty   = Math.abs(parseInt(String(row[iQty]  ?? '0'), 10)) || 1
      const fill_price = Math.abs(parseFloat(String(row[iPrice] ?? '0')))  || 0

      const symInfo = parseSilexxSymbol(sym)

      // Prefer Silexx-parsed expiry; fall back to explicit expiration column
      let expiration = symInfo.expiration
      if (!expiration && iExpiry !== -1 && row[iExpiry]) {
        expiration = parseDate(row[iExpiry]) ?? undefined
      }

      // Prefer Silexx-parsed strike; fall back to explicit column
      let strike = symInfo.strike
      if (strike == null && iStrike !== -1 && row[iStrike]) {
        const n = parseFloat(String(row[iStrike]).replace(/,/g, ''))
        if (!isNaN(n) && n > 0) strike = n
      }

      // Prefer Silexx-parsed P/C; fall back to explicit column
      let put_call = symInfo.put_call
      if (!put_call && iPutCall !== -1) {
        const pc = row[iPutCall]?.toString().trim().toUpperCase()
        if (pc === 'P' || pc === 'PUT')  put_call = 'P'
        if (pc === 'C' || pc === 'CALL') put_call = 'C'
      }

      rawRows.push({
        row_date,
        row_time,
        symbol:     sym,
        underlying: symInfo.underlying,
        fill_qty,
        fill_price,
        side,
        expiration,
        strike,
        put_call,
      })
    }

    if (rawRows.length === 0) {
      return { error: 'No valid trade rows found in file' }
    }

    // ── Steps 4–6: group, merge, aggregate ──────────────────────────────────
    const groups = groupRawRows(rawRows)

    // ── Step 7: sort by date+time descending ────────────────────────────────
    groups.sort((a, b) => {
      const d = b.trade_date.localeCompare(a.trade_date)
      if (d !== 0) return d
      return b.execution_time.localeCompare(a.execution_time)
    })

    return { groups, filename }
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : String(err) }
  }
}

/**
 * Groups an array of RawImportRow into OrderGroup[].
 *
 * Exported separately so callers that already have raw rows (e.g. loaded from
 * the database) can re-group without re-parsing the Excel file.
 */
export function groupRawRows(rawRows: RawImportRow[]): OrderGroup[] {
  type RawGroup = {
    underlying: string
    trade_date: string
    exec_sec:   number
    rows:       RawImportRow[]
  }

  // ── Group by (underlying, date, second) ───────────────────────────────────
  const secMap = new Map<string, RawGroup>()
  for (const row of rawRows) {
    const sec = timeToSeconds(row.row_time)
    const key = `${row.underlying}|${row.row_date}|${sec}`
    if (!secMap.has(key)) {
      secMap.set(key, { underlying: row.underlying, trade_date: row.row_date, exec_sec: sec, rows: [] })
    }
    secMap.get(key)!.rows.push(row)
  }

  // Sort for consistent merge ordering
  const sorted = [...secMap.values()].sort((a, b) => {
    const u = a.underlying.localeCompare(b.underlying)
    if (u !== 0) return u
    const d = a.trade_date.localeCompare(b.trade_date)
    if (d !== 0) return d
    return a.exec_sec - b.exec_sec
  })

  // ── Auto-merge consecutive groups within ≤2 seconds ──────────────────────
  const merged: RawGroup[] = []
  for (const grp of sorted) {
    const last = merged[merged.length - 1]
    if (
      last &&
      last.underlying === grp.underlying &&
      last.trade_date === grp.trade_date &&
      Math.abs(grp.exec_sec - last.exec_sec) <= 2
    ) {
      last.rows.push(...grp.rows)
    } else {
      merged.push({ ...grp, rows: [...grp.rows] })
    }
  }

  // ── Aggregate legs, compute estimated premium ─────────────────────────────
  return merged.map((grp, idx) => {
    const legMap = new Map<string, {
      qty:       number
      totalCost: number
      info:      Omit<ParsedLeg, 'qty' | 'price'>
    }>()

    for (const r of grp.rows) {
      const legKey = `${r.symbol}|${r.side}`
      if (!legMap.has(legKey)) {
        legMap.set(legKey, {
          qty: 0, totalCost: 0,
          info: { symbol: r.symbol, side: r.side, strike: r.strike, expiration: r.expiration, put_call: r.put_call },
        })
      }
      const e = legMap.get(legKey)!
      e.qty       += r.fill_qty
      e.totalCost += r.fill_price * r.fill_qty
    }

    const legs: ParsedLeg[] = [...legMap.values()].map(e => ({
      ...e.info,
      qty:   e.qty,
      price: Math.round((e.totalCost / e.qty) * 10000) / 10000,
    }))

    // Options: 1 contract = 100 shares. Sold = credit (+), Bot = debit (-)
    const estimated_premium = legs.reduce((acc, leg) => {
      const mult = leg.strike != null ? 100 : 1
      const sign = leg.side === 'Sold' ? 1 : -1
      return acc + sign * leg.qty * leg.price * mult
    }, 0)

    return {
      group_key:         `${grp.underlying}_${grp.trade_date}_${grp.exec_sec}_${idx}`,
      underlying:        grp.underlying,
      trade_date:        grp.trade_date,
      execution_time:    grp.rows[0].row_time,
      legs,
      estimated_premium: Math.round(estimated_premium * 100) / 100,
      raw_rows:          grp.rows,
    }
  })
}
