import type {
  CaseRecord,
  EvalResultsResponse,
  GroundAsset,
  Hotspot,
  RiskResponse,
  RiskScore,
} from '../api/types';

/** 8 seeded ground hazards. Shapes match GET /assets contract. */
export const MOCK_MOBILE_ASSETS: GroundAsset[] = [
  { asset_id: 'ASSET-001', type: 'open_manhole', severity: 4, lat: 28.6331, lng: 77.2201, road_id: 'minto_road', reference_photo_key: null, provenance: 'simulated', seeded: true },
  { asset_id: 'ASSET-002', type: 'missing_drain_cover', severity: 3, lat: 28.6329, lng: 77.2202, road_id: 'minto_road', reference_photo_key: null, provenance: 'simulated', seeded: true },
  { asset_id: 'ASSET-003', type: 'pothole', severity: 2, lat: 28.6332, lng: 77.2198, road_id: 'minto_road', reference_photo_key: null, provenance: 'simulated', seeded: true },
  { asset_id: 'ASSET-004', type: 'open_manhole', severity: 5, lat: 28.4941, lng: 77.2911, road_id: 'mehrauli_badarpur_road', reference_photo_key: null, provenance: 'simulated', seeded: true },
  { asset_id: 'ASSET-005', type: 'pothole', severity: 3, lat: 28.4938, lng: 77.2908, road_id: 'mehrauli_badarpur_road', reference_photo_key: null, provenance: 'simulated', seeded: true },
  { asset_id: 'ASSET-006', type: 'missing_drain_cover', severity: 4, lat: 28.6288, lng: 77.2411, road_id: 'vikas_marg_ito', reference_photo_key: null, provenance: 'simulated', seeded: true },
  { asset_id: 'ASSET-007', type: 'pothole', severity: 3, lat: 28.6284, lng: 77.2408, road_id: 'vikas_marg_ito', reference_photo_key: null, provenance: 'simulated', seeded: true },
  { asset_id: 'ASSET-008', type: 'open_manhole', severity: 4, lat: 28.5684, lng: 77.2348, road_id: 'ring_road_moolchand', reference_photo_key: null, provenance: 'simulated', seeded: true },
];

/** 10 seeded hotspots. Mirrors web reference mock data (illustrative). */
export const MOCK_MOBILE_HOTSPOTS: Hotspot[] = [
  {
    hotspot_id: 'minto_bridge', name: 'Minto Bridge underpass', lat: 28.633, lng: 77.22,
    coord_verified: false, road_id: 'minto_road',
    features: { elev_m: 214.0, depression_m: 4.5, rel_elev_m: -7.12, underpass: true, news_events_count: null },
    provenance: 'illustrative',
    road: { road_id: 'minto_road', name: 'Minto Road', road_class: 'arterial', width_ft: 60, provenance: 'illustrative' },
    jurisdiction: { owner: 'PWD', confidence: 0.8, reasons: ['Roads wider than 60 ft are treated as PWD roads', "Road 'Minto Road' (class: arterial, width: 60 ft)"], start_rung: 1, officer_role: 'Executive Engineer, PWD Division (illustrative)', provenance_note: 'rules are heuristic; verify' },
    warranty: { status: 'in_warranty', contractor_label: 'Contractor A (demo)', completion_date: '2024-03-15', end_date: '2029-03-15', days_remaining: 886, work_type: 'redevelopment', clause_text: 'The contractor shall be responsible for maintenance and rectification of any defect during the 5-year defect liability period.', tender_doc_key: null, provenance: 'illustrative' },
    assets: [MOCK_MOBILE_ASSETS[0], MOCK_MOBILE_ASSETS[1], MOCK_MOBILE_ASSETS[2]],
  },
  {
    hotspot_id: 'pul_prahladpur', name: 'Pul Prahladpur underpass', lat: 28.494, lng: 77.291,
    coord_verified: false, road_id: 'mehrauli_badarpur_road',
    features: { elev_m: 222.0, depression_m: 0.0, rel_elev_m: -2.12, underpass: true, news_events_count: null },
    provenance: 'illustrative',
    road: { road_id: 'mehrauli_badarpur_road', name: 'Mehrauli-Badarpur Road', road_class: 'arterial', width_ft: 80, provenance: 'illustrative' },
    jurisdiction: { owner: 'PWD', confidence: 0.8, reasons: ['Roads wider than 60 ft are treated as PWD roads', "Road 'Mehrauli-Badarpur Road' (class: arterial, width: 80 ft)"], start_rung: 1, officer_role: 'Executive Engineer, PWD Division (illustrative)', provenance_note: 'rules are heuristic; verify' },
    warranty: { status: 'in_warranty', contractor_label: 'Contractor B (demo)', completion_date: '2023-11-20', end_date: '2028-11-20', days_remaining: 771, work_type: 'drain_construction', clause_text: null, tender_doc_key: null, provenance: 'illustrative' },
    assets: [MOCK_MOBILE_ASSETS[3], MOCK_MOBILE_ASSETS[4]],
  },
  {
    hotspot_id: 'ring_road_who', name: 'Ring Road opp. WHO building', lat: 28.6313, lng: 77.2406,
    coord_verified: false, road_id: 'ring_road_ito',
    features: { elev_m: 218.0, depression_m: 0.0, rel_elev_m: 6.0, underpass: false, news_events_count: null },
    provenance: 'illustrative',
    road: { road_id: 'ring_road_ito', name: 'Ring Road (ITO)', road_class: 'arterial', width_ft: 100, provenance: 'illustrative' },
    jurisdiction: { owner: 'PWD', confidence: 0.8, reasons: ['Roads wider than 60 ft are treated as PWD roads', "Road 'Ring Road (ITO)' (class: arterial, width: 100 ft)"], start_rung: 1, officer_role: 'Executive Engineer, PWD Division (illustrative)', provenance_note: 'rules are heuristic; verify' },
    warranty: { status: 'in_warranty', contractor_label: 'Contractor C (demo)', completion_date: '2025-01-10', end_date: '2028-01-10', days_remaining: 457, work_type: 'redevelopment', clause_text: null, tender_doc_key: null, provenance: 'illustrative' },
    assets: [],
  },
  {
    hotspot_id: 'zakhira_underpass', name: 'Zakhira underpass', lat: 28.6623, lng: 77.148,
    coord_verified: false, road_id: 'rohtak_road_zakhira',
    features: { elev_m: 217.0, depression_m: 1.88, rel_elev_m: -4.88, underpass: true, news_events_count: null },
    provenance: 'illustrative',
    road: { road_id: 'rohtak_road_zakhira', name: 'Rohtak Road (Zakhira)', road_class: 'arterial', width_ft: 80, provenance: 'illustrative' },
    jurisdiction: { owner: 'ORPHAN', confidence: 0.4, reasons: ['Ownership flagged as disputed', "Road 'Rohtak Road (Zakhira)' (class: arterial, width: 80 ft)"], start_rung: 4, officer_role: 'District Magistrate (illustrative)', provenance_note: 'rules are heuristic; verify' },
    warranty: { status: 'in_warranty', contractor_label: 'Contractor D (demo)', completion_date: '2024-08-01', end_date: '2028-08-01', days_remaining: 660, work_type: 'recarpeting', clause_text: null, tender_doc_key: null, provenance: 'illustrative' },
    assets: [],
  },
  {
    hotspot_id: 'loni_road_golchakkar', name: 'Loni Road Golchakkar', lat: 28.683, lng: 77.297,
    coord_verified: false, road_id: 'loni_road',
    features: { elev_m: 213.0, depression_m: 0.0, rel_elev_m: 2.75, underpass: false, news_events_count: null },
    provenance: 'illustrative',
    road: { road_id: 'loni_road', name: 'Loni Road', road_class: 'collector', width_ft: 50, provenance: 'illustrative' },
    jurisdiction: { owner: 'MCD', confidence: 0.6, reasons: ['Local and collector roads under 60 ft width are maintained by MCD', "Road 'Loni Road' (class: collector, width: 50 ft)"], start_rung: 1, officer_role: 'Executive Engineer, MCD Zone (illustrative)', provenance_note: 'rules are heuristic; verify' },
    warranty: { status: 'expired', contractor_label: 'Contractor B (demo)', completion_date: '2019-04-10', end_date: '2022-04-10', days_remaining: -1645, work_type: 'drain_construction', clause_text: null, tender_doc_key: null, provenance: 'illustrative' },
    assets: [],
  },
  {
    hotspot_id: 'jahangirpuri_metro_road', name: 'Jahangirpuri Metro Station Road', lat: 28.7255, lng: 77.1627,
    coord_verified: false, road_id: 'jahangirpuri_road',
    features: { elev_m: 217.0, depression_m: 0.0, rel_elev_m: 3.0, underpass: false, news_events_count: null },
    provenance: 'illustrative',
    road: { road_id: 'jahangirpuri_road', name: 'Jahangirpuri Metro Station Road', road_class: 'collector', width_ft: 45, provenance: 'illustrative' },
    jurisdiction: { owner: 'MCD', confidence: 0.6, reasons: ['Local and collector roads under 60 ft width are maintained by MCD'], start_rung: 1, officer_role: 'Executive Engineer, MCD Zone (illustrative)', provenance_note: 'rules are heuristic; verify' },
    warranty: { status: 'expired', contractor_label: 'Contractor C (demo)', completion_date: '2020-08-31', end_date: '2021-02-28', days_remaining: -2051, work_type: 'recarpeting', clause_text: null, tender_doc_key: null, provenance: 'illustrative' },
    assets: [],
  },
  {
    hotspot_id: 'karala_kanjhawala', name: 'Karala–Kanjhawala Road', lat: 28.744, lng: 77.053,
    coord_verified: false, road_id: 'karala_kanjhawala_road',
    features: { elev_m: 216.0, depression_m: 0.38, rel_elev_m: -0.62, underpass: false, news_events_count: null },
    provenance: 'illustrative',
    road: { road_id: 'karala_kanjhawala_road', name: 'Karala-Kanjhawala Road', road_class: 'collector', width_ft: 40, provenance: 'illustrative' },
    jurisdiction: { owner: 'MCD', confidence: 0.6, reasons: ['Local and collector roads under 60 ft width are maintained by MCD'], start_rung: 1, officer_role: 'Executive Engineer, MCD Zone (illustrative)', provenance_note: 'rules are heuristic; verify' },
    warranty: { status: 'unknown', contractor_label: null, completion_date: null, end_date: null, days_remaining: null, work_type: null, clause_text: null, tender_doc_key: null, provenance: null },
    assets: [],
  },
  {
    hotspot_id: 'ito', name: 'ITO junction', lat: 28.6286, lng: 77.241,
    coord_verified: false, road_id: 'vikas_marg_ito',
    features: { elev_m: 210.0, depression_m: 3.25, rel_elev_m: -3.38, underpass: false, news_events_count: null },
    provenance: 'illustrative',
    road: { road_id: 'vikas_marg_ito', name: 'Vikas Marg', road_class: 'arterial', width_ft: 90, provenance: 'illustrative' },
    jurisdiction: { owner: 'PWD', confidence: 0.8, reasons: ['Roads wider than 60 ft are treated as PWD roads'], start_rung: 1, officer_role: 'Executive Engineer, PWD Division (illustrative)', provenance_note: 'rules are heuristic; verify' },
    warranty: { status: 'in_warranty', contractor_label: 'Contractor E (demo)', completion_date: '2023-05-12', end_date: '2028-05-12', days_remaining: 579, work_type: 'redevelopment', clause_text: null, tender_doc_key: null, provenance: 'illustrative' },
    assets: [MOCK_MOBILE_ASSETS[5], MOCK_MOBILE_ASSETS[6]],
  },
  {
    hotspot_id: 'azad_market', name: 'Azad Market underpass', lat: 28.662, lng: 77.211,
    coord_verified: false, road_id: 'azad_market_road',
    features: { elev_m: 238.0, depression_m: 0.0, rel_elev_m: 12.0, underpass: true, news_events_count: null },
    provenance: 'illustrative',
    road: { road_id: 'azad_market_road', name: 'Azad Market Road', road_class: 'collector', width_ft: 40, provenance: 'illustrative' },
    jurisdiction: { owner: 'MCD', confidence: 0.6, reasons: ['Local and collector roads under 60 ft width are maintained by MCD'], start_rung: 1, officer_role: 'Executive Engineer, MCD Zone (illustrative)', provenance_note: 'rules are heuristic; verify' },
    warranty: { status: 'unknown', contractor_label: null, completion_date: null, end_date: null, days_remaining: null, work_type: null, clause_text: null, tender_doc_key: null, provenance: null },
    assets: [],
  },
  {
    hotspot_id: 'moolchand', name: 'Moolchand underpass', lat: 28.5683, lng: 77.2347,
    coord_verified: false, road_id: 'ring_road_moolchand',
    features: { elev_m: 219.0, depression_m: 0.0, rel_elev_m: 1.38, underpass: true, news_events_count: null },
    provenance: 'illustrative',
    road: { road_id: 'ring_road_moolchand', name: 'Ring Road (Moolchand)', road_class: 'arterial', width_ft: 100, provenance: 'illustrative' },
    jurisdiction: { owner: 'PWD', confidence: 0.8, reasons: ['Roads wider than 60 ft are treated as PWD roads'], start_rung: 1, officer_role: 'Executive Engineer, PWD Division (illustrative)', provenance_note: 'rules are heuristic; verify' },
    warranty: { status: 'in_warranty', contractor_label: 'Contractor F (demo)', completion_date: '2026-02-28', end_date: '2031-02-28', days_remaining: 1599, work_type: 'recarpeting', clause_text: null, tender_doc_key: null, provenance: 'illustrative' },
    assets: [MOCK_MOBILE_ASSETS[7]],
  },
];

/**
 * Deterministic offline risk model for demo/offline use.
 * Mirrors the web reference mock: structural vulnerability scaled by rain.
 */
export function getMockRisk(rain3h: number, rain24h: number, trafficPercent: number): RiskResponse {
  const traffic = trafficPercent / 100;
  const scores = MOCK_MOBILE_HOTSPOTS.map((h) => {
    const isUnderpass = h.features.underpass;
    const dep = h.features.depression_m || 0;
    const vulnerability = 0.05 + (isUnderpass ? 0.12 : 0.02) + Math.min(0.12, dep * 0.025);
    let prob: number;
    if (rain3h <= 0.5) {
      prob = vulnerability * 0.5;
    } else {
      const rainFactor = Math.min(
        0.85,
        (rain3h / 80) * 0.68 + (rain24h / 150) * 0.14 + traffic * 0.1,
      );
      prob = Math.min(0.99, Math.max(0.02, vulnerability * 0.7 + rainFactor * (0.65 + vulnerability)));
    }
    const roundedP = Math.round(prob * 1000) / 1000;
    let band: RiskScore['band'] = 'low';
    if (roundedP >= 0.75) band = 'severe';
    else if (roundedP >= 0.5) band = 'high';
    else if (roundedP >= 0.25) band = 'moderate';
    const huwWeight = h.assets && h.assets.length > 0 ? Math.min(1.0, h.assets.length * 0.4) : 0;
    const huwScore = Math.round(roundedP * huwWeight * 1000) / 1000;
    return {
      hotspot_id: h.hotspot_id,
      susceptibility: Math.round(vulnerability * 100) / 100,
      probability: roundedP,
      band,
      drivers: [
        { name: 'rain_3h', contribution: Math.round(rain3h * 0.05 * 100) / 100, missing: false },
        { name: 'depression', contribution: Math.round(dep * 0.1 * 100) / 100, missing: false },
        { name: 'underpass', contribution: isUnderpass ? 1.4 : 0, missing: false },
        { name: 'traffic', contribution: Math.round(traffic * 0.8 * 100) / 100, missing: false },
        { name: 'low_elevation', contribution: 0.1, missing: false },
        { name: 'news_events', contribution: 0, missing: true },
      ].sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution)),
      hazard_under_water: {
        score: huwScore,
        weight: huwWeight,
        asset_ids: h.assets ? h.assets.map((a) => a.asset_id) : [],
      },
    };
  });
  return {
    mode: 'whatif',
    generated_at: new Date().toISOString(),
    inputs: { rain_3h_mm: rain3h, rain_prev24h_mm: rain24h, traffic_slowdown: traffic, source: 'user_simulation (mock)' },
    model: { version: 'expert-prior-v1', fitted: false },
    scores,
    mock: true,
  };
}

/** Static snapshot for components that render before risk loads. */
export const MOCK_MOBILE_RISKS: Record<string, RiskScore> = (() => {
  const out: Record<string, RiskScore> = {};
  for (const s of getMockRisk(40, 30, 30).scores) out[s.hotspot_id] = s;
  return out;
})();

/** Offline case list. Statuses match backend CaseStatus enum. */
export const MOCK_MOBILE_CASES: CaseRecord[] = [
  {
    case_id: 'CS-SEED01', hotspot_id: 'minto_bridge', lat: 28.633, lng: 77.22,
    status: 'AWAITING_FIX', rung: 2, owner: 'PWD',
    jurisdiction: MOCK_MOBILE_HOTSPOTS[0].jurisdiction as CaseRecord['jurisdiction'],
    warranty: MOCK_MOBILE_HOTSPOTS[0].warranty as CaseRecord['warranty'],
    analysis: { hazard_type: 'open_manhole', severity: 4, submerged: true, confidence: 0.82, description: 'Open manhole visible at underpass approach.', visible_evidence: 'Circular opening with missing cover near lane edge.' },
    photo_key: null, timer_profile: 'demo', dry_run: true, seeded: true, demo_run: false,
    created_at: '2026-10-10T09:30:00Z', updated_at: '2026-10-10T09:31:00Z',
  },
  {
    case_id: 'CS-SEED02', hotspot_id: 'zakhira_underpass', lat: 28.6623, lng: 77.148,
    status: 'ESCALATED_DM', rung: 4, owner: 'ORPHAN',
    jurisdiction: MOCK_MOBILE_HOTSPOTS[3].jurisdiction as CaseRecord['jurisdiction'],
    warranty: MOCK_MOBILE_HOTSPOTS[3].warranty as CaseRecord['warranty'],
    analysis: null, photo_key: null, timer_profile: 'demo', dry_run: true, seeded: true, demo_run: false,
    created_at: '2026-10-09T14:15:00Z', updated_at: '2026-10-09T14:16:00Z',
  },
  {
    case_id: 'CS-SEED03', hotspot_id: 'moolchand', lat: 28.5683, lng: 77.2347,
    status: 'CLOSED_VERIFIED', rung: 1, owner: 'PWD',
    jurisdiction: MOCK_MOBILE_HOTSPOTS[9].jurisdiction as CaseRecord['jurisdiction'],
    warranty: MOCK_MOBILE_HOTSPOTS[9].warranty as CaseRecord['warranty'],
    analysis: { hazard_type: 'open_manhole', severity: 4, submerged: false, confidence: 0.9, description: 'Open manhole repair verified with after-photo.', visible_evidence: 'Repair photo shows covered manhole.' },
    photo_key: null, timer_profile: 'demo', dry_run: true, seeded: true, demo_run: false,
    created_at: '2026-10-08T11:00:00Z', updated_at: '2026-10-08T12:00:00Z',
  },
];

export const MOCK_EVAL_RESULTS: EvalResultsResponse = { rdd2022: null, backtest: null };
