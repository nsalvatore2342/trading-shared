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

// T-1 Double Calendar Screener
export type { T1ScreenerSnapshot, ZoneKey, ZoneColor, ZoneStat, ZoneInfo } from './t1-screener'
export { ZONES, BAND_ORDER, TENT_THRESHOLD, getSkewZone, T1_TOOLTIPS } from './t1-screener'

// Skew Overextension Scanner
export type {
  ScannerSource,
  ScannerStatus,
  DataQuality,
  DteBucket,
  ExtensionRegime,
  Direction,
  Side,
  PreferredStructure,
  WarningFlagSeverity,
  WarningFlagName,
  WarningFlag,
  SkewMetricName,
  SkewScannerRun,
  SkewSurfaceSnapshot,
  SkewHistoricalBenchmark,
  SkewScannerSignal,
  ChainSurfaceInput,
  BenchmarkRow,
  BenchmarkLookup,
  // Phase 2 additions
  RvAcceleration,
  TrendState,
  SignalStatus,
  CandidateStructure,
  ExclusionSource,
  FeedbackClassification,
  SkewSpreadCandidate,
  SkewScannerExclusion,
  SkewMarketContext,
  SkewDailyBar,
  SkewSignalFeedback,
  StructureOutcome,
  // Phase 3 additions
  InstrumentType,
  VolatilityRegime,
  SkewRegime,
  MarketStateCluster,
  EdgeComponents,
  SkewSignalEnriched,
} from './skew-scanner'
export {
  DTE_BUCKETS,
  SKEW_METRIC_NAMES,
  SKEW_MIN_SAMPLE_SIZE,
  INFLATION_Z_THRESHOLD,
  INFLATION_PERCENTILE_THRESHOLD,
  EXTENSION_MILD_LO,
  EXTENSION_EXTENDED_LO,
  EXTENSION_EXTREME_LO,
} from './skew-scanner'
