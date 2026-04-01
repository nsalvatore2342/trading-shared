"use strict";
// columns.ts — fuzzy column detection for Silexx Excel exports
Object.defineProperty(exports, "__esModule", { value: true });
exports.COL_PUT_CALL = exports.COL_STRIKE = exports.COL_EXPIRY = exports.COL_SIDE = exports.COL_PRICE = exports.COL_QTY = exports.COL_SYMBOL = exports.COL_TIME = exports.COL_DATE = void 0;
exports.findCol = findCol;
exports.COL_DATE = ['date', 'trade date', 'tradedate'];
exports.COL_TIME = ['time', 'trade time', 'tradetime', 'exec time'];
exports.COL_SYMBOL = ['symbol', 'ticker', 'instrument'];
exports.COL_QTY = ['fill qty', 'qty', 'quantity', 'shares', 'contracts', 'filled qty'];
exports.COL_PRICE = ['fill price', 'price', 'exec price', 'execution price'];
exports.COL_SIDE = ['side', 'b/s', 'action', 'buy/sell'];
exports.COL_EXPIRY = ['expiration', 'expiry', 'exp date', 'exp'];
exports.COL_STRIKE = ['strike', 'strike price'];
exports.COL_PUT_CALL = ['put/call', 'p/c', 'option type', 'call/put', 'cp'];
/**
 * Returns the index of the first column header that matches any of the
 * candidate strings (case-insensitive, trimmed). Returns -1 if not found.
 */
function findCol(header, candidates) {
    const lower = header.map(h => h?.toString().toLowerCase().trim());
    for (const c of candidates) {
        const idx = lower.indexOf(c);
        if (idx !== -1)
            return idx;
    }
    return -1;
}
