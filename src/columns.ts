// columns.ts — fuzzy column detection for Silexx Excel exports

export const COL_DATE     = ['date', 'trade date', 'tradedate']
export const COL_TIME     = ['time', 'trade time', 'tradetime', 'exec time']
export const COL_SYMBOL   = ['symbol', 'ticker', 'instrument']
export const COL_QTY      = ['fill qty', 'qty', 'quantity', 'shares', 'contracts', 'filled qty']
export const COL_PRICE    = ['fill price', 'price', 'exec price', 'execution price']
export const COL_SIDE     = ['side', 'b/s', 'action', 'buy/sell']
export const COL_EXPIRY   = ['expiration', 'expiry', 'exp date', 'exp']
export const COL_STRIKE   = ['strike', 'strike price']
export const COL_PUT_CALL = ['put/call', 'p/c', 'option type', 'call/put', 'cp']

/**
 * Returns the index of the first column header that matches any of the
 * candidate strings (case-insensitive, trimmed). Returns -1 if not found.
 */
export function findCol(header: string[], candidates: string[]): number {
  const lower = header.map(h => h?.toString().toLowerCase().trim())
  for (const c of candidates) {
    const idx = lower.indexOf(c)
    if (idx !== -1) return idx
  }
  return -1
}
