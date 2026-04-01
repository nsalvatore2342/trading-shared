export declare const COL_DATE: string[];
export declare const COL_TIME: string[];
export declare const COL_SYMBOL: string[];
export declare const COL_QTY: string[];
export declare const COL_PRICE: string[];
export declare const COL_SIDE: string[];
export declare const COL_EXPIRY: string[];
export declare const COL_STRIKE: string[];
export declare const COL_PUT_CALL: string[];
/**
 * Returns the index of the first column header that matches any of the
 * candidate strings (case-insensitive, trimmed). Returns -1 if not found.
 */
export declare function findCol(header: string[], candidates: string[]): number;
