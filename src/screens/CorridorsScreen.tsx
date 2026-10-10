import React, { useState } from 'react';
import { MOCK_MOBILE_HOTSPOTS, MOCK_MOBILE_RISKS } from '../mocks/data';
import { CorridorCard } from '../components/CorridorCard';
import { Hotspot } from '../api/types';
import { Search, CloudRain } from 'lucide-react';

interface CorridorsScreenProps {
  onSelectHotspot: (h: Hotspot) => void;
}

export const CorridorsScreen: React.FC<CorridorsScreenProps> = ({ onSelectHotspot }) => {
  const [filter, setFilter] = useState<'all' | 'severe' | 'warranty'>('all');
  const [search, setSearch] = useState('');

  const filteredHotspots = MOCK_MOBILE_HOTSPOTS.filter((h) => {
    const matchesSearch = h.name.toLowerCase().includes(search.toLowerCase()) ||
      (h.road?.name || '').toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;

    if (filter === 'severe') {
      const risk = MOCK_MOBILE_RISKS[h.hotspot_id];
      return risk && (risk.band === 'severe' || risk.band === 'high');
    }
    if (filter === 'warranty') {
      return h.warranty?.status === 'in_warranty';
    }
    return true;
  });

  return (
    <div className="p-4 space-y-4 pb-24">
      {/* Simulation Weather Banner */}
      <div className="bg-gradient-to-r from-sky-50 to-blue-50 border border-sky-100 rounded-2xl p-3.5 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
            <CloudRain className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-800">Monsoon Pre-Alert Mode</div>
            <div className="text-[11px] text-slate-500">3-hour rain: 40mm &bull; High Vulnerability</div>
          </div>
        </div>
        <span className="text-[10px] font-bold bg-white text-sky-800 px-2 py-1 rounded-lg border border-sky-200 shadow-2xs">
          Auto-Synced
        </span>
      </div>

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

        {/* Filter Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition ${
              filter === 'all'
                ? 'bg-[#0c192c] text-white shadow-2xs'
                : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            All Corridors ({MOCK_MOBILE_HOTSPOTS.length})
          </button>

          <button
            onClick={() => setFilter('severe')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition ${
              filter === 'severe'
                ? 'bg-rose-600 text-white shadow-2xs'
                : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            Critical / High Risk
          </button>

          <button
            onClick={() => setFilter('warranty')}
            className={`px-3 py-1.5 rounded-xl font-semibold transition ${
              filter === 'warranty'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'bg-white text-slate-600 border border-slate-200'
            }`}
          >
            In Warranty
          </button>
        </div>
      </div>

      {/* Corridors List */}
      <div className="space-y-3">
        {filteredHotspots.map((h) => (
          <CorridorCard
            key={h.hotspot_id}
            hotspot={h}
            risk={MOCK_MOBILE_RISKS[h.hotspot_id]}
            onSelect={onSelectHotspot}
          />
        ))}
      </div>
    </div>
  );
};
