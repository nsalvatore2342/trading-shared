"use strict";
// skew-scanner.ts — Shared types and enums for the Skew Overextension Scanner.
//
// All IV values are decimals (0.2345 = 23.45%). All percentile values are 0..1.
// Signal strength and liquidity score are 0..100.
Object.defineProperty(exports, "__esModule", { value: true });
exports.EXTENSION_EXTREME_LO = exports.EXTENSION_EXTENDED_LO = exports.EXTENSION_MILD_LO = exports.INFLATION_PERCENTILE_THRESHOLD = exports.INFLATION_Z_THRESHOLD = exports.SKEW_MIN_SAMPLE_SIZE = exports.SKEW_METRIC_NAMES = exports.DTE_BUCKETS = void 0;
exports.DTE_BUCKETS = ['7-14', '14-21', '21-35', '35-60'];
exports.SKEW_METRIC_NAMES = [
    'call_25_skew',
    'put_25_skew',
    'call_10_25_slope',
    'put_10_25_slope',
    'put_call_skew_spread',
    'term_structure_slope',
    'atm_iv',
    'expected_move_pct',
    'expected_move_vs_atr_ratio',
];
// ── Constants ─────────────────────────────────────────────────────────────────
// Minimum sample size before Z-scores are emitted by the skew scanner.
// (Distinct from vol-surface's MIN_ZSCORE=10 — do not unify.)
exports.SKEW_MIN_SAMPLE_SIZE = 30;
// Inflation thresholds applied to z-score and percentile
exports.INFLATION_Z_THRESHOLD = 2;
exports.INFLATION_PERCENTILE_THRESHOLD = 0.90;
// Extension regime boundaries (extension_ratio = actual_move_pct / expected_move_pct)
exports.EXTENSION_MILD_LO = 1.0;
exports.EXTENSION_EXTENDED_LO = 1.5;
exports.EXTENSION_EXTREME_LO = 2.0;
