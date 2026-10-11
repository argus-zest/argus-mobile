import React from 'react';
import type { Hotspot, RiskScore } from '../api/types';
import { getBandColor } from '../api/utils';
import { Building2, ChevronRight, Clock } from 'lucide-react';

interface CorridorCardProps {
  hotspot: Hotspot;
  risk?: RiskScore;
  hazardMode?: boolean;
  rank?: number;
  selected?: boolean;
  onSelect: (hotspot: Hotspot) => void;
}

export const CorridorCard: React.FC<CorridorCardProps> = ({ hotspot, risk, hazardMode, rank, selected, onSelect }) => {
  const value = hazardMode ? (risk?.hazard_under_water.score ?? 0) : (risk?.probability ?? 0);
  const prob = Math.round(value * 100);
  const band = risk?.band || 'low';
  const color = getBandColor(band);
  const warranty = hotspot.warranty;

  return (
    <div
      onClick={() => onSelect(hotspot)}
      className={`bg-white rounded-2xl p-4 border shadow-xs hover:border-slate-300 active:scale-[0.99] transition cursor-pointer ${
        selected ? 'border-sky-500 ring-1 ring-sky-300' : 'border-slate-200/90'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex flex-1 pr-2">
          {rank !== undefined && (
            <span className="font-mono text-xs font-bold text-slate-400 w-5 shrink-0 pt-0.5 text-right mr-2">
              {rank}
            </span>
          )}
          <div className="flex-1">
          <div className="flex items-center space-x-2">
            <h3 className="text-sm font-bold text-slate-800 leading-tight">
              {hotspot.name}
            </h3>
            {hotspot.features.underpass && (
              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                Underpass
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {hotspot.road?.name || 'Corridor Road'} &bull; {hotspot.road?.width_ft ?? '—'} ft width
          </p>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span
            className="px-2 py-0.5 rounded-full text-[10px] font-bold capitalize"
            style={{ backgroundColor: `${color}1a`, color, border: `1px solid ${color}55` }}
          >
            {band}
          </span>
          <span className="text-xs font-bold text-slate-700 mt-1">
            {prob}% {hazardMode ? 'HUW' : 'Risk'}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${Math.max(8, prob)}%`, backgroundColor: color }}
        />
      </div>

      {/* Meta chips */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 mt-3 pt-2.5 border-t border-slate-100">
        <div className="flex items-center space-x-1">
          <Building2 className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-semibold text-slate-700">{hotspot.jurisdiction?.owner || 'ORPHAN'}</span>
          <span className="text-[10px] text-slate-400">({Math.round((hotspot.jurisdiction?.confidence || 0) * 100)}% conf)</span>
        </div>

        {warranty?.status === 'in_warranty' && (
          <div className="flex items-center space-x-1 text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded-md">
            <Clock className="w-3 h-3 text-emerald-600" />
            <span>{warranty.days_remaining ?? '—'}d warranty</span>
          </div>
        )}
        {warranty?.status === 'expired' && (
          <div className="flex items-center space-x-1 text-rose-700 font-medium bg-rose-50 px-2 py-0.5 rounded-md">
            <Clock className="w-3 h-3 text-rose-600" />
            <span>Warranty expired</span>
          </div>
        )}
        {(!warranty || warranty.status === 'unknown') && (
          <div className="flex items-center space-x-1 text-slate-500 font-medium bg-slate-100 px-2 py-0.5 rounded-md">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>Warranty unknown</span>
          </div>
        )}

        <ChevronRight className="w-4 h-4 text-slate-400 ml-auto" />
      </div>
    </div>
  );
};
