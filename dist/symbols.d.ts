export interface SymbolInfo {
    underlying: string;
    strike?: number;
    expiration?: string;
    put_call?: 'P' | 'C';
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
export declare function parseSilexxSymbol(sym: string): SymbolInfo;
