// symbols.ts — Silexx option symbol parser

export interface SymbolInfo {
  underlying:  string
  strike?:     number
  expiration?: string   // YYYY-MM-DD
  put_call?:   'P' | 'C'
}

/**
 * Parses a Silexx symbol string into its components.
 *
 * Silexx format:  SPXW/260323/6830P
 *   parts[0] = underlying  e.g. "SPXW"
 *   parts[1] = expiry      e.g. "260323" (YYMMDD) → 2026-03-23
 *   parts[2] = strike+PC   e.g. "6830P" → strike=6830, put_call='P'
 *
 * Falls back to using the first segment before any space as the underlying.
 */
export function parseSilexxSymbol(sym: string): SymbolInfo {
  const parts = sym.split('/')
  if (parts.length === 3) {
    const underlying = parts[0].trim()

    // Expiry: YYMMDD or YYYYMMDD
    const expRaw = parts[1].trim()
    let expiration: string | undefined
    if (expRaw.length === 6) {
      const y = `20${expRaw.slice(0, 2)}`
      const m = expRaw.slice(2, 4)
      const d = expRaw.slice(4, 6)
      expiration = `${y}-${m}-${d}`
    } else if (expRaw.length === 8) {
      expiration = `${expRaw.slice(0, 4)}-${expRaw.slice(4, 6)}-${expRaw.slice(6, 8)}`
    }

    // Strike + P/C: "6830P", "6700C", "2195P"
    const strikePc = parts[2].trim()
    const pcMatch = strikePc.match(/^([\d.,]+)([PC])$/i)
    let strike: number | undefined
    let put_call: 'P' | 'C' | undefined
    if (pcMatch) {
      strike   = parseFloat(pcMatch[1].replace(',', ''))
      put_call = pcMatch[2].toUpperCase() as 'P' | 'C'
    }

    return { underlying, expiration, strike, put_call }
  }

  // Fallback: standard OCC-style symbol e.g. "AAPL 230120C00150000"
  const underlying = sym.split(' ')[0].replace(/[^A-Z]/g, '').slice(0, 6)
  return { underlying }
}
