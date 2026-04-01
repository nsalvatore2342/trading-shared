export type EventType = 'open' | 'adjust' | 'close' | 'hedge' | 'scale_in' | 'scale_out' | 'settlement';
export type CampaignStatus = 'open' | 'closed';
export interface ParsedLeg {
    symbol: string;
    side: 'Bot' | 'Sold';
    qty: number;
    price: number;
    strike?: number;
    expiration?: string;
    put_call?: 'P' | 'C';
}
export interface RawImportRow {
    id?: string;
    batch_id?: string;
    campaign_event_id?: string | null;
    row_date: string;
    row_time: string;
    symbol: string;
    underlying: string;
    fill_qty: number;
    fill_price: number;
    side: 'Bot' | 'Sold';
    expiration?: string;
    strike?: number;
    put_call?: 'P' | 'C';
}
export interface OrderGroup {
    group_key: string;
    underlying: string;
    trade_date: string;
    execution_time: string;
    legs: ParsedLeg[];
    estimated_premium: number;
    raw_rows: RawImportRow[];
}
export interface GroupAssignment {
    group_key: string;
    trade_plan: string;
    trade_plan_custom_name?: string;
    event_type: EventType;
    campaign_id: string | null;
    underlying: string;
    trade_date: string;
    execution_time: string;
    legs: ParsedLeg[];
    estimated_premium: number;
    raw_rows: RawImportRow[];
    notes?: string;
}
