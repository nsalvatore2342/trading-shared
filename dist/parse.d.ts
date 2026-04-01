import type { OrderGroup, RawImportRow } from './types';
export interface ParseSuccess {
    groups: OrderGroup[];
    filename: string;
}
export interface ParseFailure {
    error: string;
}
export type ParseResult = ParseSuccess | ParseFailure;
/** Type guard — true when the result is an error. */
export declare function isParseError(r: ParseResult): r is ParseFailure;
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
export declare function parseXlsxBuffer(buffer: Buffer, filename: string): ParseResult;
/**
 * Groups an array of RawImportRow into OrderGroup[].
 *
 * Exported separately so callers that already have raw rows (e.g. loaded from
 * the database) can re-group without re-parsing the Excel file.
 */
export declare function groupRawRows(rawRows: RawImportRow[]): OrderGroup[];
