// t1-screener.ts — Shared constants, types, and logic for the T-1 Double Calendar Screener
// Primary signal: ShortCallMinusPutIv = IV(short call) − IV(short put)
// 5-zone system based on 1,414 backtest trades (2019–2025)

// ── Types ──────────────────────────────────────────────────────────────────────

export interface T1ScreenerSnapshot {
  id: number
  snapshot_at: string | null
  spx_price: number
  call_strike: number
  put_strike: number
  front_expiry: string
  back_expiry: string
  front_dte: number
  back_dte: number
  short_call_price: number
  short_put_price: number
  long_call_price: number
  long_put_price: number
  contracts: number
  short_call_iv?: number | null
  short_put_iv?: number | null
  short_call_minus_put_iv?: number | null
  skew_signal?: string | null
  decision_reason?: string | null
  old_theoretical_rr?: number | null
}

export type ZoneKey = 'flat' | 'sweet_spot' | 'acceptable' | 'borderline' | 'steep'
export type ZoneColor = 'blue' | 'green' | 'amber' | 'red'

export interface ZoneStat {
  n: number
  winRate: number
  avgWin: number
  avgLoss: number
  payoff: number
  avgPL: number
}

export interface ZoneInfo {
  key: ZoneKey
  name: string
  action: string
  decisionReason: string
  isTake: boolean
  color: ZoneColor
  range: string
  interpretation: string
  stats: ZoneStat
}

// ── Zone definitions ───────────────────────────────────────────────────────────

export const ZONES: Record<ZoneKey, ZoneInfo> = {
  flat: {
    key: 'flat',
    name: 'NORMAL — FLAT SKEW',
    action: 'TAKE',
    decisionReason: 'TAKE_FLAT_SKEW',
    isTake: true,
    color: 'blue',
    range: '> −1.0%',
    interpretation: 'Low-vol environment. Thinner premium but skew is clean.',
    stats: { n: 303, winRate: 0.617, avgWin: 1457, avgLoss: -1794, payoff: 0.81, avgPL: 213 },
  },
  sweet_spot: {
    key: 'sweet_spot',
    name: 'SWEET SPOT',
    action: 'SIZE UP',
    decisionReason: 'TAKE_SWEET_SPOT',
    isTake: true,
    color: 'green',
    range: '−1.0% to −2.0%',
    interpretation: 'Best historical zone. Only band where payoff > 1.0× — avg winners exceed avg losers.',
    stats: { n: 342, winRate: 0.611, avgWin: 1410, avgLoss: -1358, payoff: 1.04, avgPL: 334 },
  },
  acceptable: {
    key: 'acceptable',
    name: 'NORMAL — ACCEPTABLE SKEW',
    action: 'TAKE',
    decisionReason: 'TAKE_ACCEPTABLE_SKEW',
    isTake: true,
    color: 'blue',
    range: '−2.0% to −3.6%',
    interpretation: 'Moderate put skew. Normal size. Edge is present but slightly compressed.',
    stats: { n: 474, winRate: 0.591, avgWin: 1455, avgLoss: -1509, payoff: 0.96, avgPL: 242 },
  },
  borderline: {
    key: 'borderline',
    name: 'BORDERLINE STEEP',
    action: 'SKIP',
    decisionReason: 'SKIP_BORDERLINE_STEEP_SKEW',
    isTake: false,
    color: 'amber',
    range: '−3.6% to −5.0%',
    interpretation: 'Break-even zone historically. Put skew elevated — risk/reward not favorable.',
    stats: { n: 182, winRate: 0.516, avgWin: 1609, avgLoss: -1725, payoff: 0.93, avgPL: -3 },
  },
  steep: {
    key: 'steep',
    name: 'HARD SKIP — STRESSED SKEW',
    action: 'HARD SKIP',
    decisionReason: 'SKIP_STRESSED_SKEW',
    isTake: false,
    color: 'red',
    range: '< −5.0%',
    interpretation: 'Stressed vol environment. Win rate collapses to 44%. Do not trade.',
    stats: { n: 90, winRate: 0.444, avgWin: 1579, avgLoss: -1359, payoff: 1.16, avgPL: -53 },
  },
}

export const BAND_ORDER: ZoneKey[] = ['flat', 'sweet_spot', 'acceptable', 'borderline', 'steep']

export const TENT_THRESHOLD = 0.30

// ── Decision function ──────────────────────────────────────────────────────────

export function getSkewZone(skew: number): ZoneKey {
  if (skew > -0.010) return 'flat'
  if (skew > -0.020) return 'sweet_spot'
  if (skew > -0.036) return 'acceptable'
  if (skew > -0.050) return 'borderline'
  return 'steep'
}

// ── Tooltip content ────────────────────────────────────────────────────────────

export const T1_TOOLTIPS = {
  skewSignal:
    'IV(short call) − IV(short put). When puts are priced far more expensively than calls, the put calendar\'s edge compresses. Above −3.6% the strategy has positive expected value historically; below it, win rates and payoffs degrade significantly.',
  sweetSpot:
    'The only zone where avg winner exceeds avg loser (payoff > 1.0×). Moderate put skew signals elevated but well-priced fear. Size up here.',
  tentRatio:
    'Previously the primary entry signal. Replaced by the skew system after backtesting showed skew predicts edge more reliably. The tent peak assumes constant IV, which breaks down in high-skew environments — skew captures that directly.',
  netDebit:
    'Total cost per spread in dollars. Each SPX option contract has a $100 multiplier. Formula: (long call + long put − short call − short put) × contracts × $100.',
  frontDte:
    'Days to expiration for the short legs (the options you SELL). Usually 1 DTE — the weekly Friday expiry.',
  backDte:
    'Days to expiration for the long legs (the options you BUY). Usually 6–7 DTE — the following Friday.',
  ivBackSolved:
    'Implied volatility reverse-engineered from each option\'s mid price using Black-Scholes. More precise than chain-reported IV because it uses the actual traded price at the current spot.',
  payoffRatio:
    'Avg win ÷ |avg loss|. A ratio > 1.0× means winners are larger than losers in dollar terms. Only the Sweet Spot zone achieves this historically.',
  shortLeg:
    'The option you SELL in the front expiry (1 DTE). You receive the premium upfront; it decays to zero if SPX stays between the strikes at expiry.',
  longLeg:
    'The option you BUY in the back expiry (6–7 DTE). This caps your max loss and retains time value while the short leg decays.',
} as const
