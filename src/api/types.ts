/**
 * Argus Mobile - Core Data Contracts
 * Synced with Argus Backend OpenAPI v1
 */

export interface Hotspot {
  hotspot_id: string;
  name: string;
  lat: number;
  lng: number;
  coord_verified: boolean;
  road_id: string;
  features: {
    elev_m: number;
    depression_m: number;
    rel_elev_m: number;
    underpass: boolean;
    news_events_count: number | null;
  };
  provenance: string;
  road?: {
    road_id: string;
    name: string;
    road_class: string;
    width_ft: number;
    provenance: string;
  };
  jurisdiction?: {
    owner: 'PWD' | 'MCD' | 'NHAI' | 'DDA' | 'NDMC' | 'I&FC' | 'unknown';
    confidence: number;
    reasons: string[];
    start_rung: number;
    officer_role: string;
    provenance_note: string;
  };
  warranty?: {
    status: 'in_warranty' | 'expired' | 'unknown';
    contractor_label: string;
    completion_date: string | null;
    end_date: string | null;
    days_remaining: number;
    work_type: string;
    clause_text: string | null;
    tender_doc_key: string | null;
    provenance: string;
  };
  assets?: GroundAsset[];
}

export interface GroundAsset {
  asset_id: string;
  type: 'open_manhole' | 'broken_grate' | 'construction_debris' | 'submerged_curb' | 'pothole';
  lat: number;
  lng: number;
  severity: 'high' | 'medium' | 'low';
  photo_url?: string;
  provenance: string;
}

export interface RiskScore {
  hotspot_id: string;
  susceptibility: number;
  probability: number;
  band: 'low' | 'moderate' | 'high' | 'severe';
  hazard_under_water: {
    score: number;
    weight: number;
    asset_ids: string[];
  };
}

export interface CaseRecord {
  case_id: string;
  hotspot_id?: string;
  title: string;
  status: 'OPEN' | 'INVESTIGATING' | 'ESCALATED' | 'RESOLVED';
  owner_agency: string;
  created_at: string;
  contractor_label?: string;
  severity: 'low' | 'moderate' | 'high' | 'severe';
}
