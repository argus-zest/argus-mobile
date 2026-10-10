import React from 'react';
import { Hotspot, RiskScore } from '../api/types';
import { Clock, Building2, ChevronRight } from 'lucide-react';

interface CorridorCardProps {
  hotspot: Hotspot;
  risk?: RiskScore;
  onSelect: (hotspot: Hotspot) => void;
}

export const CorridorCard: React.FC<CorridorCardProps> = ({ hotspot, risk, onSelect }) => {
  const prob = risk ? Math.round(risk.probability * 100) : 15;
  const band = risk?.band || 'low';

  const getBandBadge = () => {
    switch (band) {
      case 'severe':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">Severe</span>;
      case 'high':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">High</span>;
      case 'moderate':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-yellow-100 text-yellow-800">Moderate</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">Low</span>;
    }
  };

  return (
    <div
      onClick={() => onSelect(hotspot)}
      className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs hover:border-slate-300 active:scale-[0.99] transition cursor-pointer"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 pr-2">
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
            {hotspot.road?.name || 'Corridor Road'} &bull; {hotspot.road?.width_ft} ft width
          </p>
        </div>
        <div className="flex flex-col items-end">
          {getBandBadge()}
          <span className="text-xs font-bold text-slate-700 mt-1">
            {prob}% Risk
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            band === 'severe'
              ? 'bg-rose-500'
              : band === 'high'
              ? 'bg-amber-500'
              : band === 'moderate'
              ? 'bg-yellow-500'
              : 'bg-emerald-500'
          }`}
          style={{ width: `${Math.max(8, prob)}%` }}
        />
      </div>

      {/* Meta chips */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 mt-3 pt-2.5 border-t border-slate-100">
        <div className="flex items-center space-x-1">
          <Building2 className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-semibold text-slate-700">{hotspot.jurisdiction?.owner || 'PWD'}</span>
          <span className="text-[10px] text-slate-400">({Math.round((hotspot.jurisdiction?.confidence || 0.8) * 100)}% conf)</span>
        </div>

        {hotspot.warranty?.status === 'in_warranty' && (
          <div className="flex items-center space-x-1 text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded-md">
            <Clock className="w-3 h-3 text-emerald-600" />
            <span>{hotspot.warranty.days_remaining}d warranty</span>
          </div>
        )}

        <ChevronRight className="w-4 h-4 text-slate-400 ml-auto" />
      </div>
    </div>
  );
};
