import React, { useState } from 'react';
import type { Hotspot, RiskScore } from '../api/types';
import { getBandColor } from '../api/utils';
import { CorridorCard } from '../components/CorridorCard';
import { MockBadge } from '../components/chips';
import { AlertTriangle, ChevronDown, ChevronUp, CloudRain, Loader2, RefreshCw, Search } from 'lucide-react';

interface CorridorsScreenProps {
  hotspots: Hotspot[];
  scores: RiskScore[];
  mode: 'whatif' | 'live';
  onModeChange: (m: 'whatif' | 'live') => void;
  rain3h: number;
  rain24h: number;
  traffic: number;
  onRain3hChange: (v: number) => void;
  onRain24hChange: (v: number) => void;
  onTrafficChange: (v: number) => void;
  onPreset: (r3: number, r24: number, tr: number) => void;
  hazardMode: boolean;
  onToggleHazard: () => void;
  isLoadingRisk: boolean;
  liveError: string | null;
  coreError: string | null;
  offlineNotice: string | null;
  onRetry: () => void;
  isMock: boolean;
  onSelectHotspot: (h: Hotspot) => void;
}

const PRESETS: Array<{ label: string; sub: string; value: [number, number, number] }> = [
  { label: 'Clear', sub: '0 mm rain', value: [0, 0, 0] },
  { label: 'Light', sub: '10 mm rain', value: [10, 10, 10] },
  { label: 'Heavy', sub: '40 mm rain', value: [40, 30, 30] },
  { label: 'Extreme', sub: '80 mm rain', value: [80, 60, 60] },
];

export const CorridorsScreen: React.FC<CorridorsScreenProps> = ({
  hotspots,
  scores,
  mode,
  onModeChange,
  rain3h,
  rain24h,
  traffic,
  onRain3hChange,
  onRain24hChange,
  onTrafficChange,
  onPreset,
  hazardMode,
  onToggleHazard,
  isLoadingRisk,
  liveError,
  coreError,
  offlineNotice,
  onRetry,
  isMock,
  onSelectHotspot,
}) => {
  const [filter, setFilter] = useState<'all' | 'severe' | 'warranty'>('all');
  const [search, setSearch] = useState('');
  const [fineTuneOpen, setFineTuneOpen] = useState(false);
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);

  const scoreMap = new Map(scores.map((s) => [s.hotspot_id, s]));
  const above50 = scores.filter((s) => {
    const v = hazardMode ? (s.hazard_under_water?.score ?? s.probability) : s.probability;
    return v > 0.5;
  }).length;

  const ranked = [...hotspots]
    .map((h) => {
      const s = scoreMap.get(h.hotspot_id);
      const rankVal = hazardMode ? (s?.hazard_under_water.score ?? 0) : (s?.probability ?? 0);
      return { h, s, rankVal };
    })
    .sort((a, b) => b.rankVal - a.rankVal);

  const filtered = ranked.filter(({ h, s }) => {
    const matchesSearch =
      h.name.toLowerCase().includes(search.toLowerCase()) ||
      (h.road?.name || '').toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    if (filter === 'severe') return s != null && (s.band === 'severe' || s.band === 'high');
    if (filter === 'warranty') return h.warranty?.status === 'in_warranty';
    return true;
  });

  if (coreError) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] text-center space-y-3">
        <AlertTriangle className="w-10 h-10 text-rose-500" />
        <h2 className="text-base font-bold text-slate-900">Backend Connection Required</h2>
        <p className="text-xs text-slate-500 max-w-xs">{coreError}</p>
        <button
          onClick={onRetry}
          className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-[#0c192c] text-white text-xs font-bold"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry Connection</span>
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 pb-24">
      {/* Simulation Weather Banner */}
      <div className="bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-100 rounded-2xl p-3.5 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
            <CloudRain className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-800">
              {mode === 'live' ? 'Live Forecast Mode' : 'Monsoon Pre-Alert Mode'}
            </div>
            <div className="text-[11px] text-slate-500">
              3-hour rain: {rain3h}mm &bull; {above50} of {hotspots.length} above 50%
              {isLoadingRisk && (
                <span className="inline-flex items-center gap-1">
                  {' '}
                  <Loader2 className="w-3 h-3 inline animate-spin text-sky-600" /> Simulating…
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-[10px] font-bold bg-white text-sky-800 px-2 py-1 rounded-lg border border-sky-200 shadow-2xs">
            {mode === 'live' ? 'Live' : 'Auto-Synced'}
          </span>
          {isMock && <MockBadge />}
        </div>
      </div>

      {/* Mode switch */}
      <div className="flex bg-slate-200/70 p-1 rounded-xl border border-slate-300/40">
        <button
          onClick={() => onModeChange('whatif')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
            mode === 'whatif' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
          }`}
        >
          What-if
        </button>
        <button
          onClick={() => onModeChange('live')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
            mode === 'live' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
          }`}
        >
          Live (hourly)
        </button>
      </div>

      {liveError && (
        <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
          <p className="font-semibold">Live scores unavailable</p>
          <p className="text-[11px]">{liveError}</p>
        </div>
      )}

      {offlineNotice && (
        <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center justify-between gap-2">
          <div>
            <p className="font-semibold">Backend unreachable — showing offline data</p>
            <p className="text-[11px]">{offlineNotice}</p>
          </div>
          <button
            onClick={onRetry}
            className="flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-amber-300 font-bold"
          >
            <RefreshCw className="w-3 h-3" /> Retry
          </button>
        </div>
      )}

      {/* Presets + sliders */}
      {mode === 'whatif' && (
        <div className="space-y-2">
          <div className="grid grid-cols-4 gap-1.5">
            {PRESETS.map((p) => {
              const active = rain3h === p.value[0] && rain24h === p.value[1];
              return (
                <button
                  key={p.label}
                  onClick={() => onPreset(p.value[0], p.value[1], p.value[2])}
                  className={`py-1.5 rounded-xl border text-center transition ${
                    active
                      ? 'bg-[#0c192c] text-white border-[#0c192c] font-bold'
                      : 'bg-white text-slate-600 border-slate-200'
                  }`}
                >
                  <div className="text-[11px] font-bold leading-tight">{p.label}</div>
                  <div className="text-[9px] opacity-70">{p.sub}</div>
                </button>
              );
            })}
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-3 space-y-2.5">
            <button
              type="button"
              onClick={() => setFineTuneOpen((v) => !v)}
              className="w-full flex items-center justify-between text-[11px] font-semibold text-slate-600"
            >
              <span>Fine-tune parameters ({rain3h}mm / {rain24h}mm / {traffic}%)</span>
              {fineTuneOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
            {fineTuneOpen && (
              <>
                {(
                  [
                    { label: 'Rain next 3 h', unit: 'mm', value: rain3h, set: onRain3hChange },
                    { label: 'Rain past 24 h', unit: 'mm', value: rain24h, set: onRain24hChange },
                    { label: 'Traffic slowdown', unit: '%', value: traffic, set: onTrafficChange },
                  ] as const
                ).map((sl) => (
                  <div key={sl.label} className="space-y-1">
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-600">{sl.label}</span>
                      <span className="font-mono font-bold text-sky-700">{sl.value} {sl.unit}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={sl.value}
                      aria-label={sl.label}
                      onChange={(e) => sl.set(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-sky-600"
                    />
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}

      {/* Hazard-under-water toggle */}
      <button
        onClick={onToggleHazard}
        className="w-full p-2.5 rounded-xl bg-white border border-slate-200/90 flex items-center justify-between shadow-2xs"
      >
        <div className="text-left">
          <div className="text-xs font-bold text-slate-800">Hazard under water</div>
          <div className="text-[10px] text-slate-500">Rank by submerged manhole &amp; grate risk</div>
        </div>
        <span className={`relative inline-flex h-5 w-10 rounded-full transition ${hazardMode ? 'bg-[#0c192c]' : 'bg-slate-300'}`}>
          <span className={`inline-block h-4 w-4 mt-0.5 rounded-full bg-white shadow-xs transition ${hazardMode ? 'translate-x-5 ml-0.5' : 'translate-x-0.5'}`} />
        </span>
      </button>

      {/* Search & Filter Bar */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search underpasses, roads..."
            className="w-full pl-9 pr-3 py-2.5 bg-white text-xs rounded-xl border border-slate-200/90 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition ${
              filter === 'all' ? 'bg-[#0c192c] text-white shadow-2xs' : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            All Corridors ({hotspots.length})
          </button>
          <button
            onClick={() => setFilter('severe')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition ${
              filter === 'severe' ? 'bg-rose-600 text-white shadow-2xs' : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            Critical / High Risk
          </button>
          <button
            onClick={() => setFilter('warranty')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition ${
              filter === 'warranty' ? 'bg-emerald-600 text-white shadow-2xs' : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            In Warranty
          </button>
        </div>
      </div>

      {/* Corridors List */}
      {filtered.length === 0 ? (
        <div className="p-8 text-center bg-white border border-dashed border-slate-300 rounded-2xl">
          <p className="text-sm font-bold text-slate-800">No corridors match</p>
          <p className="text-[11px] text-slate-500 mt-1">Try clearing the search or choosing another filter.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(({ h, s }, idx) => (
            <CorridorCard
              key={h.hotspot_id}
              hotspot={h}
              risk={s}
              hazardMode={hazardMode}
              rank={idx + 1}
              selected={lastSelectedId === h.hotspot_id}
              onSelect={(sel) => {
                setLastSelectedId(sel.hotspot_id);
                onSelectHotspot(sel);
              }}
            />
          ))}
        </div>
      )}

      {/* Legend + honesty banner */}
      <div className="grid grid-cols-4 gap-1.5 text-[10px] text-center font-bold">
        {(['low', 'moderate', 'high', 'severe'] as const).map((b) => (
          <div key={b} className="py-1 rounded-md border" style={{ backgroundColor: `${getBandColor(b)}1a`, color: getBandColor(b), borderColor: `${getBandColor(b)}55` }}>
            {b === 'moderate' ? 'Mod' : b[0].toUpperCase() + b.slice(1)}
          </div>
        ))}
      </div>
      <div className="p-2.5 rounded-lg bg-white border border-slate-200 text-[11px] text-slate-500 leading-relaxed">
        <strong className="text-slate-700">Note:</strong> Risk is a relative ranking from an
        expert-prior model, not a flood-depth forecast. Data tagged &apos;illustrative&apos; is
        placeholder and must be verified.
      </div>
    </div>
  );
};
