/**
 * Argus Mobile - Core Data Contracts
 * Aligned with Argus backend OpenAPI v1 (contracts/openapi.yaml)
 * and backend JSON schemas (Hotspot, RiskScore, HazardAnalysis,
 * Case, CaseEvent, Jurisdiction, Warranty).
 */

export type Provenance = 'sourced' | 'illustrative' | 'simulated';
export type RiskBand = 'low' | 'moderate' | 'high' | 'severe';
export type AssetType = 'open_manhole' | 'missing_drain_cover' | 'pothole';
export type CaseStatus =
  | 'OPEN'
  | 'AWAITING_FIX'
  | 'FIX_CLAIMED'
  | 'CLOSED_VERIFIED'
  | 'ESCALATED_DM'
  | 'UNRESOLVED_FINAL';
export type TimerProfile = 'demo' | 'real';

export interface Road {
  road_id: string;
  name: string;
  road_class: string;
  width_ft: number;
  provenance: Provenance;
}

export interface Jurisdiction {
  owner: 'NHAI' | 'NDMC' | 'PWD' | 'DJB' | 'MCD' | 'ORPHAN';
  confidence: number;
  reasons: string[];
  start_rung: number;
  officer_role: string;
  provenance_note: string;
}

export interface Warranty {
  status: 'in_warranty' | 'expired' | 'unknown';
  contractor_label: string | null;
  completion_date: string | null;
  end_date: string | null;
  days_remaining: number | null;
  work_type: string | null;
  clause_text: string | null;
  tender_doc_key: string | null;
  provenance: Provenance | '' | null;
}

export interface GroundAsset {
  asset_id: string;
  type: AssetType;
  severity: number;
  lat: number;
  lng: number;
  road_id?: string | null;
  reference_photo_key?: string | null;
  provenance: Provenance;
  seeded?: boolean;
}

export interface Hotspot {
  hotspot_id: string;
  name: string;
  lat: number;
  lng: number;
  coord_verified: boolean;
  road_id: string;
  features: {
    elev_m: number | null;
    depression_m: number | null;
    rel_elev_m: number | null;
    underpass: boolean;
    news_events_count: number | null;
  };
  provenance: Provenance;
  road?: Road;
  jurisdiction?: Jurisdiction;
  warranty?: Warranty;
  assets?: GroundAsset[];
}

export interface RiskDriver {
  name: string;
  contribution: number;
  missing: boolean;
}

export interface RiskScore {
  hotspot_id: string;
  susceptibility: number;
  probability: number;
  band: RiskBand;
  drivers?: RiskDriver[];
  hazard_under_water: {
    score: number;
    weight: number;
    asset_ids: string[];
  };
}

export interface RiskResponse {
  mode: 'whatif' | 'live';
  generated_at: string;
  inputs: {
    rain_3h_mm: number;
    rain_prev24h_mm: number;
    traffic_slowdown: number;
    source: string;
  };
  model: {
    version: string;
    fitted: boolean;
  };
  scores: RiskScore[];
  mock?: boolean;
}

export interface HazardAnalysis {
  hazard_type: AssetType | 'waterlogging' | 'none' | 'unclear';
  severity: number;
  submerged: boolean;
  confidence: number;
  description: string;
  visible_evidence: string;
}

export interface CaseRecord {
  case_id: string;
  hotspot_id?: string | null;
  asset_id?: string | null;
  lat: number;
  lng: number;
  status: CaseStatus;
  rung: number;
  owner: string;
  jurisdiction: Jurisdiction;
  warranty: Warranty;
  analysis?: HazardAnalysis | null;
  photo_key?: string | null;
  timer_profile: TimerProfile;
  dry_run: boolean;
  seeded?: boolean;
  demo_run?: boolean;
  created_at: string;
  updated_at: string;
}

export interface CaseEvent {
  case_id: string;
  ts_seq: string;
  type:
    | 'CASE_OPENED'
    | 'JURISDICTION_RESOLVED'
    | 'NOTICE_SENT'
    | 'REMINDER_SENT'
    | 'ESCALATED'
    | 'FIX_CLAIMED'
    | 'CLOSURE_VERIFIED'
    | 'CLOSURE_REJECTED'
    | 'UNRESOLVED_FINAL';
  message: string;
  rung: number;
  meta?: Record<string, unknown>;
}

export interface ClaimFixResult {
  accepted: boolean;
  reason:
    | 'VERIFIED'
    | 'TOO_FAR'
    | 'HAZARD_STILL_PRESENT'
    | 'LOCATION_MISMATCH'
    | 'LOW_CONFIDENCE'
    | 'CASE_NOT_OPEN';
  distance_m: number;
  verification: Record<string, unknown> | null;
}

export interface EvalResultsResponse {
  rdd2022: {
    dataset?: string;
    level?: string;
    n_pos: number;
    n_neg: number;
    tp: number;
    fp: number;
    fn: number;
    tn: number;
    precision: number | null;
    recall: number | null;
    f1: number | null;
    model_id: string;
    run_at: string;
  } | null;
  backtest: {
    events: Array<{
      event_id: string;
      date: string;
      description?: string;
      held_out?: boolean;
      top_20?: Array<{
        hotspot_id: string;
        name: string;
        probability: number;
        reported_hit: boolean;
      }>;
      top20_predicted?: string[];
      precision_at_20?: number;
      recall?: number | null;
      random_baseline_precision?: number;
      reported_other_count?: number;
    }>;
  } | null;
}
