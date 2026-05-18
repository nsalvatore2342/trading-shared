export interface T1ScreenerSnapshot {
    id: number;
    snapshot_at: string | null;
    spx_price: number;
    call_strike: number;
    put_strike: number;
    front_expiry: string;
    back_expiry: string;
    front_dte: number;
    back_dte: number;
    short_call_price: number;
    short_put_price: number;
    long_call_price: number;
    long_put_price: number;
    contracts: number;
    short_call_iv?: number | null;
    short_put_iv?: number | null;
    short_call_minus_put_iv?: number | null;
    skew_signal?: string | null;
    decision_reason?: string | null;
    old_theoretical_rr?: number | null;
}
export type ZoneKey = 'flat' | 'sweet_spot' | 'acceptable' | 'borderline' | 'steep';
export type ZoneColor = 'blue' | 'green' | 'amber' | 'red';
export interface ZoneStat {
    n: number;
    winRate: number;
    avgWin: number;
    avgLoss: number;
    payoff: number;
    avgPL: number;
}
export interface ZoneInfo {
    key: ZoneKey;
    name: string;
    action: string;
    decisionReason: string;
    isTake: boolean;
    color: ZoneColor;
    range: string;
    interpretation: string;
    stats: ZoneStat;
}
export declare const ZONES: Record<ZoneKey, ZoneInfo>;
export declare const BAND_ORDER: ZoneKey[];
export declare const TENT_THRESHOLD = 0.3;
export declare function getSkewZone(skew: number): ZoneKey;
export declare const T1_TOOLTIPS: {
    readonly skewSignal: "IV(short call) − IV(short put). When puts are priced far more expensively than calls, the put calendar's edge compresses. Above −3.6% the strategy has positive expected value historically; below it, win rates and payoffs degrade significantly.";
    readonly sweetSpot: "The only zone where avg winner exceeds avg loser (payoff > 1.0×). Moderate put skew signals elevated but well-priced fear. Size up here.";
    readonly tentRatio: "Previously the primary entry signal. Replaced by the skew system after backtesting showed skew predicts edge more reliably. The tent peak assumes constant IV, which breaks down in high-skew environments — skew captures that directly.";
    readonly netDebit: "Total cost per spread in dollars. Each SPX option contract has a $100 multiplier. Formula: (long call + long put − short call − short put) × contracts × $100.";
    readonly frontDte: "Days to expiration for the short legs (the options you SELL). Usually 1 DTE — the weekly Friday expiry.";
    readonly backDte: "Days to expiration for the long legs (the options you BUY). Usually 6–7 DTE — the following Friday.";
    readonly ivBackSolved: "Implied volatility reverse-engineered from each option's mid price using Black-Scholes. More precise than chain-reported IV because it uses the actual traded price at the current spot.";
    readonly payoffRatio: "Avg win ÷ |avg loss|. A ratio > 1.0× means winners are larger than losers in dollar terms. Only the Sweet Spot zone achieves this historically.";
    readonly shortLeg: "The option you SELL in the front expiry (1 DTE). You receive the premium upfront; it decays to zero if SPX stays between the strikes at expiry.";
    readonly longLeg: "The option you BUY in the back expiry (6–7 DTE). This caps your max loss and retains time value while the short leg decays.";
};
