/**
 * Parses a raw cell value (Excel serial number or string) into an ISO date string.
 * Supports:
 *   - Excel serial number  (e.g. 45678)
 *   - MM/DD/YYYY or MM-DD-YYYY
 *   - Any string parseable by Date
 * Returns YYYY-MM-DD or null on failure.
 */
export declare function parseDate(raw: unknown): string | null;
/**
 * Parses a raw cell value into an HH:MM:SS time string.
 * Supports:
 *   - Excel time fraction (0.5 = 12:00:00)
 *   - HH:MM or HH:MM:SS strings
 * Returns HH:MM:SS or null on failure.
 */
export declare function parseTime(raw: unknown): string | null;
/** Converts an HH:MM:SS string to total seconds since midnight. */
export declare function timeToSeconds(t: string): number;
