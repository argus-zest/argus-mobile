import { Hotspot, CaseRecord, RiskScore } from '../api/types';

export const MOCK_MOBILE_HOTSPOTS: Hotspot[] = [
  {
    hotspot_id: "minto_bridge",
    name: "Minto Bridge underpass",
    lat: 28.6330,
    lng: 77.2200,
    coord_verified: false,
    road_id: "minto_road",
    features: {
      elev_m: 214.0,
      depression_m: 4.5,
      rel_elev_m: -7.12,
      underpass: true,
      news_events_count: null
    },
    provenance: "illustrative",
    road: {
      road_id: "minto_road",
      name: "Minto Road",
      road_class: "arterial",
      width_ft: 60,
      provenance: "illustrative"
    },
    jurisdiction: {
      owner: "PWD",
      confidence: 0.80,
      reasons: ["Roads wider than 60 ft are treated as PWD roads"],
      start_rung: 1,
      officer_role: "Executive Engineer, PWD Division (illustrative)",
      provenance_note: "rules are heuristic; verify"
    },
    warranty: {
      status: "in_warranty",
      contractor_label: "Contractor A (demo)",
      completion_date: "2024-03-15",
      end_date: "2029-03-15",
      days_remaining: 886,
      work_type: "redevelopment",
      clause_text: "The contractor shall be responsible for maintenance and rectification of any defect during the 5-year defect liability period.",
      tender_doc_key: null,
      provenance: "illustrative"
    },
    assets: [
      {
        asset_id: "asset_01",
        type: "open_manhole",
        lat: 28.6331,
        lng: 77.2202,
        severity: "high",
        provenance: "illustrative"
      },
      {
        asset_id: "asset_02",
        type: "broken_grate",
        lat: 28.6329,
        lng: 77.2198,
        severity: "medium",
        provenance: "illustrative"
      }
    ]
  },
  {
    hotspot_id: "zakhira_underpass",
    name: "Zakhira underpass",
    lat: 28.6660,
    lng: 77.1620,
    coord_verified: false,
    road_id: "rohtak_road_zakhira",
    features: {
      elev_m: 217.0,
      depression_m: 3.0,
      rel_elev_m: -4.12,
      underpass: true,
      news_events_count: null
    },
    provenance: "illustrative",
    road: {
      road_id: "rohtak_road_zakhira",
      name: "Rohtak Road (Zakhira)",
      road_class: "arterial",
      width_ft: 100,
      provenance: "illustrative"
    },
    jurisdiction: {
      owner: "PWD",
      confidence: 0.80,
      reasons: ["Roads wider than 60 ft are treated as PWD roads"],
      start_rung: 1,
      officer_role: "Executive Engineer, PWD Division (illustrative)",
      provenance_note: "rules are heuristic; verify"
    },
    warranty: {
      status: "in_warranty",
      contractor_label: "Contractor B (demo)",
      completion_date: "2025-01-10",
      end_date: "2030-01-10",
      days_remaining: 1550,
      work_type: "drainage_upgrade",
      clause_text: null,
      tender_doc_key: null,
      provenance: "illustrative"
    },
    assets: [
      {
        asset_id: "asset_03",
        type: "pothole",
        lat: 28.6661,
        lng: 77.1622,
        severity: "high",
        provenance: "illustrative"
      }
    ]
  },
  {
    hotspot_id: "pul_prahladpur",
    name: "Pul Prahladpur underpass",
    lat: 28.4940,
    lng: 77.2910,
    coord_verified: false,
    road_id: "mehrauli_badarpur_road",
    features: {
      elev_m: 222.0,
      depression_m: 0.0,
      rel_elev_m: -2.12,
      underpass: true,
      news_events_count: null
    },
    provenance: "illustrative",
    road: {
      road_id: "mehrauli_badarpur_road",
      name: "Mehrauli-Badarpur Road",
      road_class: "arterial",
      width_ft: 80,
      provenance: "illustrative"
    },
    jurisdiction: {
      owner: "PWD",
      confidence: 0.80,
      reasons: ["Roads wider than 60 ft are treated as PWD roads"],
      start_rung: 1,
      officer_role: "Executive Engineer, PWD Division (illustrative)",
      provenance_note: "rules are heuristic; verify"
    },
    warranty: {
      status: "in_warranty",
      contractor_label: "Contractor C (demo)",
      completion_date: "2023-11-20",
      end_date: "2028-11-20",
      days_remaining: 771,
      work_type: "pump_installation",
      clause_text: null,
      tender_doc_key: null,
      provenance: "illustrative"
    },
    assets: []
  }
];

export const MOCK_MOBILE_CASES: CaseRecord[] = [
  {
    case_id: "CASE-2026-DEL-001",
    hotspot_id: "minto_bridge",
    title: "Minto Bridge Submerged Manhole Grate Defect",
    status: "OPEN",
    owner_agency: "PWD",
    created_at: "2026-10-10T09:30:00Z",
    contractor_label: "Contractor A (demo)",
    severity: "severe",
  },
  {
    case_id: "CASE-2026-DEL-002",
    hotspot_id: "zakhira_underpass",
    title: "Rohtak Road Drainage Pump Power Interruption",
    status: "INVESTIGATING",
    owner_agency: "PWD",
    created_at: "2026-10-09T14:15:00Z",
    contractor_label: "Contractor B (demo)",
    severity: "high",
  },
  {
    case_id: "CASE-2026-DEL-003",
    hotspot_id: "pul_prahladpur",
    title: "Underpass Silt Clearing Escalation Notice",
    status: "ESCALATED",
    owner_agency: "PWD",
    created_at: "2026-10-08T11:00:00Z",
    contractor_label: "Contractor C (demo)",
    severity: "moderate",
  }
];

export const MOCK_MOBILE_RISKS: Record<string, RiskScore> = {
  minto_bridge: {
    hotspot_id: "minto_bridge",
    susceptibility: 0.28,
    probability: 0.88,
    band: "severe",
    hazard_under_water: {
      score: 0.704,
      weight: 0.8,
      asset_ids: ["asset_01", "asset_02"]
    }
  },
  zakhira_underpass: {
    hotspot_id: "zakhira_underpass",
    susceptibility: 0.24,
    probability: 0.65,
    band: "high",
    hazard_under_water: {
      score: 0.26,
      weight: 0.4,
      asset_ids: ["asset_03"]
    }
  },
  pul_prahladpur: {
    hotspot_id: "pul_prahladpur",
    susceptibility: 0.17,
    probability: 0.35,
    band: "moderate",
    hazard_under_water: {
      score: 0.0,
      weight: 0.0,
      asset_ids: []
    }
  }
};
