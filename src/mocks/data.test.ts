import { describe, expect, it } from 'vitest';
import {
  MOCK_MOBILE_ASSETS,
  MOCK_MOBILE_CASES,
  MOCK_MOBILE_HOTSPOTS,
  getMockRisk,
} from './data';

describe('Offline mock data (labelled fallback, never live)', () => {
  it('seeds 10 hotspots covering the SPEC hotspot set', () => {
    expect(MOCK_MOBILE_HOTSPOTS).toHaveLength(10);
    const ids = MOCK_MOBILE_HOTSPOTS.map((h) => h.hotspot_id);
    for (const id of ['minto_bridge', 'pul_prahladpur', 'zakhira_underpass', 'moolchand', 'ito']) {
      expect(ids).toContain(id);
    }
  });

  it('uses only backend asset enums with severity 1-5', () => {
    expect(MOCK_MOBILE_ASSETS).toHaveLength(8);
    for (const a of MOCK_MOBILE_ASSETS) {
      expect(['open_manhole', 'missing_drain_cover', 'pothole']).toContain(a.type);
      expect(a.severity).toBeGreaterThanOrEqual(1);
      expect(a.severity).toBeLessThanOrEqual(5);
    }
  });

  it('uses only backend case statuses and owner enums', () => {
    for (const c of MOCK_MOBILE_CASES) {
      expect(['OPEN', 'AWAITING_FIX', 'FIX_CLAIMED', 'CLOSED_VERIFIED', 'ESCALATED_DM', 'UNRESOLVED_FINAL']).toContain(c.status);
      expect(['NHAI', 'NDMC', 'PWD', 'DJB', 'MCD', 'ORPHAN']).toContain(c.jurisdiction.owner);
    }
  });

  it('computes mock risk deterministically for identical inputs', () => {
    const a = getMockRisk(40, 30, 30);
    const b = getMockRisk(40, 30, 30);
    expect(a.scores).toEqual(b.scores);
    expect(a.mock).toBe(true);
    expect(a.scores).toHaveLength(MOCK_MOBILE_HOTSPOTS.length);
  });

  it('raises probability monotonically with heavier rain', () => {
    const clear = getMockRisk(0, 0, 0);
    const heavy = getMockRisk(80, 60, 60);
    const pClear = clear.scores.find((s) => s.hotspot_id === 'minto_bridge')!.probability;
    const pHeavy = heavy.scores.find((s) => s.hotspot_id === 'minto_bridge')!.probability;
    expect(pHeavy).toBeGreaterThan(pClear);
    expect(heavy.scores.find((s) => s.hotspot_id === 'minto_bridge')!.band).toBe('severe');
  });

  it('weights hazard-under-water by nearby asset count', () => {
    const risk = getMockRisk(40, 30, 30);
    const minto = risk.scores.find((s) => s.hotspot_id === 'minto_bridge')!;
    const lonely = risk.scores.find((s) => s.hotspot_id === 'ring_road_who')!;
    expect(minto.hazard_under_water.weight).toBeGreaterThan(0);
    expect(minto.hazard_under_water.asset_ids.length).toBeGreaterThan(0);
    expect(lonely.hazard_under_water.weight).toBe(0);
  });

  it('sorts drivers by absolute contribution', () => {
    const risk = getMockRisk(40, 30, 30);
    for (const s of risk.scores) {
      const mags = (s.drivers || []).map((d) => Math.abs(d.contribution));
      expect([...mags].sort((a, b) => b - a)).toEqual(mags);
    }
  });
});
