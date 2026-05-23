// skew-scanner.ts — Shared types and enums for the Skew Overextension Scanner.
//
// All IV values are decimals (0.2345 = 23.45%). All percentile values are 0..1.
// Signal strength and liquidity score are 0..100.

// ── Enums ──────────────────────────────────────────────────────────────────────

export type ScannerSource = 'intraday_ibkr' | 'nightly_polygon' | 'manual' | 'backfill'
export type ScannerStatus = 'running' | 'completed' | 'failed' | 'partial'

export type DataQuality = 'ok' | 'partial' | 'fallback' | 'poor'

export type DteBucket = '7-14' | '14-21' | '21-35' | '35-60'

export const DTE_BUCKETS: DteBucket[] = ['7-14', '14-21', '21-35', '35-60']

export type ExtensionRegime = 'none' | 'mild' | 'extended' | 'extreme' | 'unstable'
export type Direction = 'up' | 'down' | 'none'

export type Side = 'calls' | 'puts' | 'both' | 'neither'

export type PreferredStructure =
  | 'bull_call_debit_spread'
  | 'bear_put_debit_spread'
  | 'call_credit_spread'
  | 'put_credit_spread'
  | 'avoid_long_premium'
  | 'continuation_possible'
  | 'mean_reversion_fade'
  | 'premium_selling_favorable'
  | 'no_clear_edge'

export type WarningFlagSeverity = 'low' | 'medium' | 'high'

export type WarningFlagName =
  | 'earnings_within_7d'
  | 'earnings_within_14d'
  | 'low_float'
  | 'wide_bid_ask'
  | 'unusual_iv_spike'
  | 'abnormal_volume'
  | 'split_recent'
  | 'insufficient_history'
  | 'poor_liquidity'
  | 'unstable_extension_ratio'
  | 'missing_iv'
  | 'no_chain'

export interface WarningFlag {
  flag:     WarningFlagName
  severity: WarningFlagSeverity
  value?:   number | string | null
}

// ── Skew metric names (for the benchmarks table) ──────────────────────────────

export type SkewMetricName =
  | 'call_25_skew'
  | 'put_25_skew'
  | 'call_10_25_slope'
  | 'put_10_25_slope'
  | 'put_call_skew_spread'
  | 'term_structure_slope'
  | 'atm_iv'
  | 'expected_move_pct'
  | 'expected_move_vs_atr_ratio'

export const SKEW_METRIC_NAMES: SkewMetricName[] = [
  'call_25_skew',
  'put_25_skew',
  'call_10_25_slope',
  'put_10_25_slope',
  'put_call_skew_spread',
  'term_structure_slope',
  'atm_iv',
  'expected_move_pct',
  'expected_move_vs_atr_ratio',
]

// ── Constants ─────────────────────────────────────────────────────────────────

// Minimum sample size before Z-scores are emitted by the skew scanner.
// (Distinct from vol-surface's MIN_ZSCORE=10 — do not unify.)
export const SKEW_MIN_SAMPLE_SIZE = 30

// Inflation thresholds applied to z-score and percentile
export const INFLATION_Z_THRESHOLD          = 2
export const INFLATION_PERCENTILE_THRESHOLD = 0.90

// Extension regime boundaries (extension_ratio = actual_move_pct / expected_move_pct)
export const EXTENSION_MILD_LO    = 1.0
export const EXTENSION_EXTENDED_LO = 1.5
export const EXTENSION_EXTREME_LO  = 2.0

// ── Row shapes (mirror the Supabase tables) ───────────────────────────────────

export interface SkewScannerRun {
  id:               string
  run_timestamp:    string
  source:           ScannerSource
  status:           ScannerStatus
  symbols_scanned:  number
  symbols_flagged:  number
  notes:            string | null
  created_at:       string
}

export interface SkewSurfaceSnapshot {
  id:                       string
  run_id:                   string
  symbol:                   string
  underlying_price:         number
  expiration:               string   // YYYY-MM-DD
  dte:                      number

  atm_iv:                   number | null
  call_10_delta_iv:         number | null
  call_25_delta_iv:         number | null
  put_25_delta_iv:          number | null
  put_10_delta_iv:          number | null

  call_25_skew:             number | null
  put_25_skew:              number | null
  call_10_25_slope:         number | null
  put_10_25_slope:          number | null
  put_call_skew_spread:     number | null
  term_structure_slope:     number | null

  call_volume:              number | null
  put_volume:               number | null
  call_oi:                  number | null
  put_oi:                   number | null

  avg_bid_ask_spread_pct:   number | null
  liquidity_score:          number | null

  data_quality:             DataQuality
  quality_notes:            string | null
  meta:                     Record<string, unknown> | null
  created_at:               string
}

export interface SkewHistoricalBenchmark {
  id:                          string
  symbol:                      string
  dte_bucket:                  DteBucket
  lookback_days:               number
  metric_name:                 SkewMetricName | string

  mean_value:                  number | null
  std_dev:                     number | null
  percentile_10:               number | null
  percentile_25:               number | null
  percentile_50:               number | null
  percentile_75:               number | null
  percentile_90:               number | null
  percentile_95:               number | null
  sample_size:                 number

  // Regime-awareness fields (denormalized per symbol+dte_bucket)
  skew_stability_score:        number | null
  avg_call_skew:               number | null
  avg_put_skew:                number | null
  skew_volatility:             number | null
  avg_term_structure:          number | null
  avg_expected_move_vs_atr:    number | null

  updated_at:                  string
}

export interface SkewScannerSignal {
  id:                       string
  run_id:                   string
  symbol:                   string
  underlying_price:         number
  expiration:               string
  dte:                      number

  direction_extended:       Direction
  actual_move_pct:          number | null
  expected_move_pct:        number | null
  atr_pct:                  number | null
  extension_ratio:          number | null
  extension_regime:         ExtensionRegime
  movement_ratio:           number | null

  call_skew_z:              number | null
  put_skew_z:               number | null
  call_wing_z:              number | null
  put_wing_z:               number | null
  term_structure_z:         number | null

  call_skew_percentile:     number | null
  put_skew_percentile:      number | null

  call_inflated:            boolean
  put_inflated:             boolean
  call_wing_inflated:       boolean
  put_wing_inflated:        boolean

  expensive_side:           Side
  cheap_side:               Side
  preferred_structure:      PreferredStructure
  signal_strength:          number | null
  liquidity_score:          number | null

  spread_width:             number | null
  net_delta:                number | null
  net_vega:                 number | null
  debit_paid:               number | null
  width_capture_pct:        number | null
  debit_per_delta:          number | null
  iv_differential:          number | null
  spread_efficiency_score:  number | null

  warning_flags:            WarningFlag[]
  earnings_proximity_days:  number | null
  has_low_float:            boolean
  has_unusual_iv_spike:     boolean
  has_abnormal_volume:      boolean
  has_wide_bid_ask:         boolean
  has_recent_split:         boolean
  has_insufficient_history: boolean
  has_poor_liquidity:       boolean

  decision_reason:          string | null
  explanation_text:         string | null
  created_at:               string
}

// ── Input-side types for the calculation utilities ────────────────────────────
// These are what the calculation utilities (and the Python writer) build BEFORE
// rows hit Supabase. Most fields are nullable because chain data can be partial.

export interface ChainSurfaceInput {
  symbol:                string
  underlyingPrice:       number
  priorClose:            number | null
  expiration:            string
  dte:                   number

  atmIv:                 number | null
  call25dIv:             number | null
  call10dIv:             number | null
  put25dIv:              number | null
  put10dIv:              number | null

  atmCallMid:            number | null
  atmPutMid:             number | null

  // For term structure
  backExpiryAtmIv:       number | null

  callVolume:            number | null
  putVolume:             number | null
  callOi:                number | null
  putOi:                 number | null
  avgBidAskSpreadPct:    number | null
}

export interface BenchmarkRow {
  metric: SkewMetricName | string
  mean:        number | null
  stdDev:      number | null
  sampleSize:  number
  percentiles: {
    p10: number | null
    p25: number | null
    p50: number | null
    p75: number | null
    p90: number | null
    p95: number | null
  }
}

// Per-(symbol, dte_bucket) benchmark lookup keyed by metric name
export type BenchmarkLookup = Partial<Record<SkewMetricName, BenchmarkRow>>
