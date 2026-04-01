// index.ts — public API of @nsalvatore2342/trading-shared

// Types
export type {
  EventType,
  CampaignStatus,
  ParsedLeg,
  RawImportRow,
  OrderGroup,
  GroupAssignment,
} from './types'

// Column detection
export {
  findCol,
  COL_DATE, COL_TIME, COL_SYMBOL, COL_QTY,
  COL_PRICE, COL_SIDE, COL_EXPIRY, COL_STRIKE, COL_PUT_CALL,
} from './columns'

// Date/time helpers
export { parseDate, parseTime, timeToSeconds } from './dates'

// Symbol parser
export { parseSilexxSymbol } from './symbols'
export type { SymbolInfo } from './symbols'

// Main parse pipeline
export { parseXlsxBuffer, groupRawRows, isParseError } from './parse'
export type { ParseResult, ParseSuccess, ParseFailure } from './parse'
