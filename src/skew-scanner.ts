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
  // Surface-distortion metrics added in Phase 2
  | 'smile_curvature'
  | 'call_wing_curvature'   // ≡ call_10_25_slope; benchmarked separately for clarity
  | 'put_wing_curvature'    // ≡ put_10_25_slope
  | 'skew_asymmetry'

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
  'smile_curvature',
  'call_wing_curvature',
  'put_wing_curvature',
  'skew_asymmetry',
]

// ── Phase 2 enums ─────────────────────────────────────────────────────────────

export type RvAcceleration = 'expanding' | 'compressing' | 'neutral' | 'unknown'

export type TrendState =
  | 'bullish'
  | 'bearish'
  | 'rangebound'
  | 'squeeze_setup'
  | 'parabolic'
  | 'unknown'

export type SignalStatus = 'new' | 'strengthening' | 'weakening' | 'resolved'

export type CandidateStructure =
  | 'bull_call_debit_spread'
  | 'bear_put_debit_spread'
  | 'call_credit_spread'
  | 'put_credit_spread'

export type ExclusionSource = 'manual' | 'auto'

export type FeedbackClassification = 'true_positive' | 'false_positive' | 'ambiguous'

// ── Phase 3 enums ─────────────────────────────────────────────────────────────

export type InstrumentType = 'equity' | 'index' | 'future' | 'crypto' | 'vol_product'

// Regime clustering — free text in Phase 3 (will tighten once clusters stabilise)
export type VolatilityRegime    = string
export type SkewRegime          = string
export type MarketStateCluster  = string

// ── Phase 4 enums ─────────────────────────────────────────────────────────────

export type RunRequestStatus = 'pending' | 'claimed' | 'running' | 'done' | 'failed' | 'cancelled'

export type DaemonStatus = 'idle' | 'scanning' | 'draining' | 'degraded'

export type OutcomeEvaluationWindow = '1d' | '3d' | '5d' | 'expiration'

// Positive/negative contributors: per-factor reasoning for a signal.
export interface SignalContributor {
  factor:        string                       // 'call_skew_z' | 'trend_alignment' | …
  contribution:  number                       // 0..100 (positive) or negative (penalty)
  note?:         string                       // human-readable explanation
}

// Edge component breakdown for a candidate's structure_quality_score
export interface EdgeComponents {
  spread_efficiency?:      number
  skew_efficiency?:        number
  liquidity_quality?:      number
  trend_alignment?:        number
  expected_move_position?: number
  rv_regime_fit?:          number
  // Negative entries represent penalties
  [key: string]: number | undefined
}

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

  // Surface distortion (Phase 2)
  smile_curvature:          number | null
  call_wing_curvature:      number | null
  put_wing_curvature:       number | null
  skew_asymmetry:           number | null

  excluded_from_benchmark:  boolean
  exclusion_reason:         string | null

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

  // Surface distortion (Phase 2)
  smile_curvature:          number | null
  call_wing_curvature:      number | null
  put_wing_curvature:       number | null
  skew_asymmetry:           number | null

  // Realized vol regime
  rv10:                     number | null
  rv20:                     number | null
  rv30:                     number | null
  iv30_rv20_ratio:          number | null
  rv_acceleration:          RvAcceleration | null

  // Trend state
  trend_state:              TrendState | null

  // Expected move breach analytics
  breached_1x_expected_move:        boolean
  breached_1_5x_expected_move:      boolean
  breached_2x_expected_move:        boolean
  expected_move_distance_remaining: number | null

  // Intraday expansion vs prior snapshot
  iv_expansion_pct:         number | null
  skew_expansion_pct:       number | null
  term_structure_change:    number | null

  // Composite quality + lifecycle
  structure_quality_score:  number | null
  excluded_reason:          string | null
  signal_status:            SignalStatus

  // Phase 3 — decoupled directional vs risk/reward recommendations
  recommended_structure:      PreferredStructure | null
  best_risk_reward_structure: CandidateStructure | null

  // Three independent confidences (0..100)
  directional_confidence:   number | null
  structure_confidence:     number | null
  data_quality_confidence:  number | null

  // Continuation vs exhaustion (0..1)
  continuation_probability: number | null
  exhaustion_probability:   number | null

  // Skew velocity (IV-decimal deltas)
  call_skew_change_1d:        number | null
  put_skew_change_1d:         number | null
  call_skew_change_intraday:  number | null
  put_skew_change_intraday:   number | null

  // Dealer positioning placeholders
  gamma_flip_distance:        number | null
  distance_to_call_wall:      number | null
  distance_to_put_wall:       number | null
  dealer_positioning_bias:    string | null

  // Surface integrity
  surface_integrity_score:    number | null

  // Drift monitoring
  benchmark_age_hours:        number | null
  stale_surface_flag:         boolean
  stale_benchmark_flag:       boolean

  // Regime clustering placeholders
  volatility_regime:          VolatilityRegime | null
  skew_regime:                SkewRegime | null
  market_state_cluster:       MarketStateCluster | null

  // Multi-underlying support
  instrument_type:            InstrumentType

  // Phase 4 — replay + explainability
  is_replay:                  boolean
  positive_contributors:      SignalContributor[]
  negative_contributors:      SignalContributor[]

  created_at:               string
}

// ── Spread candidate + exclusion + context + feedback rows ────────────────────

export interface SkewSpreadCandidate {
  id:                       string
  signal_id:                string
  rank_in_signal:           number
  structure:                CandidateStructure

  long_strike:              number
  short_strike:             number
  width:                    number

  long_leg_iv:              number | null
  short_leg_iv:             number | null
  iv_differential:          number | null

  long_leg_delta:           number | null
  short_leg_delta:          number | null
  net_delta:                number | null

  long_leg_vega:            number | null
  short_leg_vega:           number | null
  net_vega:                 number | null

  debit_credit:             number | null   // + debit, − credit
  pop_estimate:             number | null   // 0..1

  spread_efficiency_score:  number | null
  skew_efficiency_score:    number | null
  liquidity_quality:        number | null
  structure_quality_score:  number | null

  meta:                     Record<string, unknown> | null
  // Phase 3 — explainability
  edge_components:          EdgeComponents
  created_at:               string
}

export interface SkewScannerExclusion {
  id:          string
  symbol:      string
  reason:      string
  source:      ExclusionSource
  expires_at:  string | null
  notes:       string | null
  created_at:  string
}

export interface SkewMarketContext {
  run_id:               string
  vix_level:            number | null
  vix_percentile:       number | null
  market_trend_state:   string | null
  market_gamma_regime:  string | null
  captured_at:          string
}

export interface SkewDailyBar {
  symbol:     string
  trade_date: string  // YYYY-MM-DD
  open:       number
  high:       number
  low:        number
  close:      number
  volume:     number | null
  source:     string
}

export interface SkewSignalFeedback {
  id:             string
  signal_id:      string
  reviewer:       string | null
  classification: FeedbackClassification
  notes:          string | null
  reviewed_at:    string | null
  created_at:     string
}

export interface StructureOutcome {
  id:            string
  signal_id:     string
  candidate_id:  string | null
  entered_at:    string | null
  exited_at:     string | null
  entry_price:   number | null
  exit_price:    number | null
  pnl:           number | null
  max_favorable: number | null
  max_adverse:   number | null
  status:        'open' | 'closed' | 'expired' | 'cancelled' | null
  notes:         string | null

  // Phase 3 — canonical backtest fields (forward-looking column names)
  max_favorable_excursion:   number | null
  max_adverse_excursion:     number | null
  realized_pnl:              number | null
  realized_iv_change:        number | null
  realized_move_vs_expected: number | null

  // Phase 4 — configurable evaluation windows
  evaluation_window:    OutcomeEvaluationWindow | null
  evaluation_end_at:    string | null
  underlying_at_exit:   number | null
  atm_iv_at_exit:       number | null

  created_at:    string
}

// ── Phase 4 row shapes ────────────────────────────────────────────────────────

export interface SkewRunRequest {
  id:             string
  source:         string
  symbols:        string[]
  notes:          string | null
  status:         RunRequestStatus
  claimed_by:     string | null
  claimed_at:     string | null
  run_id:         string | null
  error_message:  string | null
  created_at:     string
  updated_at:     string
}

export interface SkewDaemonHeartbeat {
  id:                string
  daemon_id:         string
  reported_at:       string
  status:            DaemonStatus
  current_run_id:    string | null
  pending_requests:  number
  memory_mb:         number | null
  notes:             string | null
}

export interface SkewScannerHealth {
  id:                       string
  run_id:                   string
  daemon_id:                string | null
  symbols_per_minute:       number | null
  avg_chain_latency_ms:     number | null
  p95_chain_latency_ms:     number | null
  failed_symbols:           number
  skipped_symbols:          number
  api_cooldowns:            number
  benchmark_age_hours:      number | null
  benchmark_cache_hits:     number
  benchmark_cache_misses:   number
  memory_peak_mb:           number | null
  notes:                    string | null
  errors_jsonb:             Array<{ symbol: string; phase: string; error: string }>
  created_at:               string
}

// Helper: enriched signal returned by the SQL view skew_signals_enriched
export interface SkewSignalEnriched extends SkewScannerSignal {
  vix_level:           number | null
  vix_percentile:      number | null
  market_trend_state:  string | null
  market_gamma_regime: string | null
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
