// types.ts — shared domain types used by both trading apps

export type EventType =
  | 'open'
  | 'adjust'
  | 'close'
  | 'hedge'
  | 'scale_in'
  | 'scale_out'
  | 'settlement'

export type CampaignStatus = 'open' | 'closed'

// A single aggregated leg within an order group.
// qty/price are the aggregated values after merging split fills.
export interface ParsedLeg {
  symbol:      string
  side:        'Bot' | 'Sold'
  qty:         number
  price:       number          // weighted-average fill price
  strike?:     number
  expiration?: string          // YYYY-MM-DD
  put_call?:   'P' | 'C'
}

// One raw fill row from the Silexx export.
export interface RawImportRow {
  id?:               string    // present when fetched from DB
  batch_id?:         string
  campaign_event_id?: string | null
  row_date:          string    // YYYY-MM-DD
  row_time:          string    // HH:MM:SS
  symbol:            string
  underlying:        string
  fill_qty:          number
  fill_price:        number
  side:              'Bot' | 'Sold'
  expiration?:       string
  strike?:           number
  put_call?:         'P' | 'C'
}

// A group of fills that belong to the same order execution.
export interface OrderGroup {
  group_key:         string
  underlying:        string
  trade_date:        string    // YYYY-MM-DD
  execution_time:    string    // HH:MM:SS of the first fill
  legs:              ParsedLeg[]
  estimated_premium: number
  raw_rows:          RawImportRow[]
}

// A user-assigned group ready to be committed to the database.
export interface GroupAssignment {
  group_key:              string
  trade_plan:             string
  trade_plan_custom_name?: string
  event_type:             EventType
  campaign_id:            string | null   // null = create new campaign
  underlying:             string
  trade_date:             string
  execution_time:         string
  legs:                   ParsedLeg[]
  estimated_premium:      number
  raw_rows:               RawImportRow[]
  notes?:                 string
}
