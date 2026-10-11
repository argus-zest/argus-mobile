import React, { Suspense, lazy, useEffect, useRef, useState } from 'react';
import { MobileHeader } from './components/MobileHeader';
import { BottomNav, TabType } from './components/BottomNav';
import { CorridorsScreen } from './screens/CorridorsScreen';
import { ReportScreen } from './screens/ReportScreen';
import { CasesScreen } from './screens/CasesScreen';
import { HotspotDetailSheet } from './components/HotspotDetailSheet';
import { EvidenceSheet } from './components/EvidenceSheet';
import { ArchitectureSheet } from './components/ArchitectureSheet';
import type { CaseRecord, GroundAsset, Hotspot, RiskResponse } from './api/types';
import { fetchAssets, fetchHotspots, fetchRisk } from './api/client';
import { debounce } from './api/utils';
import { MOCK_MOBILE_ASSETS, MOCK_MOBILE_CASES, MOCK_MOBILE_HOTSPOTS, getMockRisk } from './mocks/data';

// MapLibre is the largest dependency; load it only when the map tab opens.
const MapScreen = lazy(() => import('./screens/MapScreen').then((m) => ({ default: m.MapScreen })));

export const App: React.FC = () => {
  const isDemoMode = new URLSearchParams(window.location.search).get('demo') === '1';

  const [activeTab, setActiveTab] = useState<TabType>('corridors');
  const [hotspots, setHotspots] = useState<Hotspot[]>(MOCK_MOBILE_HOTSPOTS);
  const [assets, setAssets] = useState<GroundAsset[]>(MOCK_MOBILE_ASSETS);
  const [riskData, setRiskData] = useState<RiskResponse | null>(null);
  const [isMock, setIsMock] = useState(true);
  const [coreError, setCoreError] = useState<string | null>(null);

  const [mode, setMode] = useState<'whatif' | 'live'>('whatif');
  const [rain3h, setRain3h] = useState(0);
  const [rain24h, setRain24h] = useState(0);
  const [traffic, setTraffic] = useState(0);
  const [hazardMode, setHazardMode] = useState(false);
  const [isLoadingRisk, setIsLoadingRisk] = useState(false);
  const [liveError, setLiveError] = useState<string | null>(null);

  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);
  const [presetHotspot, setPresetHotspot] = useState<Hotspot | null>(null);
  const [picking, setPicking] = useState(false);
  const [pickedLocation, setPickedLocation] = useState<{ lat: number; lng: number } | null>(null);

  const [activeCaseId, setActiveCaseId] = useState<string | null>(null);
  const [casesRefresh, setCasesRefresh] = useState(0);
  const [evidenceOpen, setEvidenceOpen] = useState(false);
  const [architectureOpen, setArchitectureOpen] = useState(false);

  // Initial data load: backend first, offline mocks as labelled fallback
  const loadInitialData = async () => {
    setCoreError(null);
    try {
      const [hsRes, astRes] = await Promise.all([fetchHotspots(), fetchAssets()]);
      setHotspots(hsRes.hotspots);
      setAssets(astRes.assets);
      setIsMock(Boolean(hsRes.mock));
      if (isDemoMode) {
        setSelectedHotspot(hsRes.hotspots.find((h) => h.hotspot_id === 'minto_bridge') || null);
      } else if (hsRes.hotspots.length > 0 && !selectedHotspot) {
        setSelectedHotspot(hsRes.hotspots[0]);
      }
    } catch (err) {
      // Offline-first: labelled mock data keeps field workflows usable
      setHotspots(MOCK_MOBILE_HOTSPOTS);
      setAssets(MOCK_MOBILE_ASSETS);
      setIsMock(true);
      if (!import.meta.env.VITE_API_BASE) {
        setCoreError(null);
      } else {
        setCoreError(err instanceof Error ? err.message : 'Failed to connect to backend service.');
      }
      if (isDemoMode) {
        setSelectedHotspot(MOCK_MOBILE_HOTSPOTS.find((h) => h.hotspot_id === 'minto_bridge') || null);
      }
    }
  };

  useEffect(() => {
    void loadInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced risk fetch; previous scores stay visible while loading
  const executeFetchRisk = async (targetMode: 'whatif' | 'live', r3: number, r24: number, tr: number) => {
    setIsLoadingRisk(true);
    setLiveError(null);
    try {
      const res = await fetchRisk(targetMode, r3, r24, tr);
      setRiskData(res);
      setIsMock(Boolean(res.mock));
    } catch (err) {
      if (targetMode === 'live') {
        setLiveError(err instanceof Error ? err.message : 'Live scores not available yet');
        setMode('whatif');
      }
      // Offline fallback: deterministic mock risk, clearly labelled
      setRiskData(getMockRisk(r3, r24, tr));
      setIsMock(true);
    } finally {
      setIsLoadingRisk(false);
    }
  };

  const debouncedRef = useRef(
    debounce((m: 'whatif' | 'live', r3: number, r24: number, tr: number) => {
      void executeFetchRisk(m, r3, r24, tr);
    }, 200),
  );

  useEffect(() => {
    debouncedRef.current(mode, rain3h, rain24h, traffic);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, rain3h, rain24h, traffic]);

  const handlePreset = (r3: number, r24: number, tr: number) => {
    setRain3h(r3);
    setRain24h(r24);
    setTraffic(tr);
  };

  // Demo keyboard shortcuts
  useEffect(() => {
    if (!isDemoMode) return;
    const onKey = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)) return;
      switch (e.key) {
        case '1': handlePreset(10, 10, 10); break;
        case '2': handlePreset(40, 30, 30); break;
        case '3': handlePreset(80, 60, 60); break;
        case '0': handlePreset(0, 0, 0); break;
        case 'h':
        case 'H': setHazardMode((v) => !v); break;
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDemoMode]);

  const handleSelectHotspot = (h: Hotspot) => setSelectedHotspot(h);

  const handleOpenCase = (h: Hotspot) => {
    setPresetHotspot(h);
    setSelectedHotspot(null);
    setPickedLocation(null);
    setActiveTab('report');
  };

  const handleCaseCreated = (c: CaseRecord) => {
    setActiveCaseId(c.case_id);
    setCasesRefresh((n) => n + 1);
    setActiveTab('cases');
  };

  const handlePickLocation = (lat: number, lng: number) => {
    setPickedLocation({ lat, lng });
    setPicking(false);
    setActiveTab('report');
  };

  const selectedRisk = selectedHotspot
    ? riskData?.scores.find((s) => s.hotspot_id === selectedHotspot.hotspot_id)
    : undefined;

  return (
    <div className="min-h-screen bg-[#f0f4f8] flex flex-col max-w-md mx-auto shadow-2xl relative border-x border-slate-200">
      <MobileHeader
        mock={isMock}
        onOpenEvidence={() => setEvidenceOpen(true)}
        onOpenArchitecture={() => setArchitectureOpen(true)}
      />

      {isDemoMode && (
        <div className="bg-sky-50 border-b border-sky-100 text-sky-800 text-[11px] py-1 px-4 text-center font-medium">
          <span className="font-bold text-sky-900 bg-sky-200/70 px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider mr-1.5">
            Demo Mode
          </span>
          Seeded + simulated data is labelled. Shortcuts:{' '}
          <strong>[1]</strong> Light &bull; <strong>[2]</strong> Heavy &bull;{' '}
          <strong>[3]</strong> Extreme &bull; <strong>[0]</strong> Clear &bull;{' '}
          <strong>[H]</strong> Hazards
        </div>
      )}

      <main className="flex-1 overflow-y-auto">
        {activeTab === 'corridors' && (
          <CorridorsScreen
            hotspots={hotspots}
            scores={riskData?.scores || []}
            mode={mode}
            onModeChange={setMode}
            rain3h={rain3h}
            rain24h={rain24h}
            traffic={traffic}
            onRain3hChange={setRain3h}
            onRain24hChange={setRain24h}
            onTrafficChange={setTraffic}
            onPreset={handlePreset}
            hazardMode={hazardMode}
            onToggleHazard={() => setHazardMode((v) => !v)}
            isLoadingRisk={isLoadingRisk}
            liveError={liveError}
            coreError={hotspots.length === 0 ? coreError : null}
            offlineNotice={hotspots.length === 0 ? null : coreError}
            onRetry={loadInitialData}
            isMock={isMock}
            onSelectHotspot={handleSelectHotspot}
          />
        )}
        {activeTab === 'map' && (
          <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Loading map…</div>}>
            <MapScreen
            hotspots={hotspots}
            scores={riskData?.scores || []}
            assets={assets}
            selectedId={selectedHotspot?.hotspot_id || null}
            onSelectHotspot={handleSelectHotspot}
            rain3h={rain3h}
            picking={picking}
            onPickLocation={handlePickLocation}
            isDemo={isDemoMode}
            />
          </Suspense>
        )}
        {activeTab === 'report' && (
          <ReportScreen
            hotspots={hotspots}
            presetHotspot={presetHotspot}
            pickedLocation={pickedLocation}
            onStartPickLocation={() => {
              setPicking(true);
              setActiveTab('map');
            }}
            onCaseCreated={handleCaseCreated}
          />
        )}
        {activeTab === 'cases' && (
          <CasesScreen
            initialCases={MOCK_MOBILE_CASES}
            activeCaseId={activeCaseId}
            onSelectCase={setActiveCaseId}
            isMock={isMock}
            refreshSignal={casesRefresh}
          />
        )}
      </main>

      {selectedHotspot && (
        <HotspotDetailSheet
          hotspot={selectedHotspot}
          risk={selectedRisk}
          onClose={() => setSelectedHotspot(null)}
          onOpenCase={handleOpenCase}
        />
      )}

      <EvidenceSheet
        isOpen={evidenceOpen}
        onClose={() => setEvidenceOpen(false)}
        modelVersion={riskData?.model.version || 'expert-prior-v1'}
        modelFitted={riskData?.model.fitted || false}
        useMock={isMock}
      />
      <ArchitectureSheet isOpen={architectureOpen} onClose={() => setArchitectureOpen(false)} />

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
};

export default App;
