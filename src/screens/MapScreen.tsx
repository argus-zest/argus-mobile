import React from 'react';
import { MOCK_MOBILE_HOTSPOTS, MOCK_MOBILE_RISKS } from '../mocks/data';
import { Hotspot } from '../api/types';
import { MapPin, Navigation2 } from 'lucide-react';

interface MapScreenProps {
  onSelectHotspot: (h: Hotspot) => void;
}

export const MapScreen: React.FC<MapScreenProps> = ({ onSelectHotspot }) => {
  return (
    <div className="relative flex-1 h-[calc(100vh-120px)] w-full overflow-hidden bg-slate-100 pb-16">
      {/* Map visual representation with OpenStreetMap attribution */}
      <div className="absolute inset-0 bg-slate-200 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-14 h-14 rounded-full bg-white shadow-md flex items-center justify-center text-sky-600 mb-3">
          <Navigation2 className="w-7 h-7 rotate-45" />
        </div>
        <h3 className="text-base font-bold text-slate-800">Interactive Delhi Basemap</h3>
        <p className="text-xs text-slate-500 max-w-xs mt-1">
          GPS Geolocation &amp; Corridor Map ready for MapLibre Native or Google Maps Mobile SDK integration.
        </p>

        {/* Floating Quick Select Cards */}
        <div className="w-full max-w-sm mt-6 space-y-2">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider text-left">
            Pinned Hotspots
          </div>
          {MOCK_MOBILE_HOTSPOTS.map((h) => {
            const risk = MOCK_MOBILE_RISKS[h.hotspot_id];
            return (
              <button
                key={h.hotspot_id}
                onClick={() => onSelectHotspot(h)}
                className="w-full bg-white p-3 rounded-xl border border-slate-200/90 shadow-2xs flex items-center justify-between text-left hover:border-sky-400 transition"
              >
                <div className="flex items-center space-x-2.5">
                  <MapPin className={`w-4 h-4 ${risk?.band === 'severe' ? 'text-rose-500' : 'text-amber-500'}`} />
                  <div>
                    <div className="text-xs font-bold text-slate-800">{h.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{h.lat.toFixed(4)}, {h.lng.toFixed(4)}</div>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  risk?.band === 'severe' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {risk?.band || 'low'}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
