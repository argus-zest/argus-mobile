import React from 'react';
import { Hotspot, RiskScore } from '../api/types';
import { X, Building2 } from 'lucide-react';

interface HotspotDetailSheetProps {
  hotspot: Hotspot | null;
  risk?: RiskScore;
  onClose: () => void;
}

export const HotspotDetailSheet: React.FC<HotspotDetailSheetProps> = ({ hotspot, risk, onClose }) => {
  if (!hotspot) return null;

  const prob = risk ? Math.round(risk.probability * 100) : 15;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-end justify-center animate-fade-in">
      <div className="bg-white rounded-t-3xl w-full max-w-md max-h-[85vh] overflow-y-auto p-5 pb-8 space-y-4 safe-bottom shadow-2xl animate-slide-up">
        {/* Header Handle */}
        <div className="flex items-center justify-between">
          <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto absolute left-1/2 -translate-x-1/2 top-2.5" />
          <div>
            <h2 className="text-base font-bold text-slate-800">{hotspot.name}</h2>
            <p className="text-xs text-slate-500">{hotspot.road?.name || 'Road Corridor'}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Risk Metrics */}
        <div className="grid grid-cols-2 gap-2.5 pt-2">
          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <span className="text-[10px] font-semibold text-slate-400 uppercase">Flood Probability</span>
            <div className="text-2xl font-black text-slate-800 mt-0.5">{prob}%</div>
            <span className="text-[10px] text-slate-500">Calibrated Prior</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <span className="text-[10px] font-semibold text-slate-400 uppercase">Hazard Index</span>
            <div className="text-2xl font-black text-rose-600 mt-0.5">
              {risk?.hazard_under_water?.score ? `${Math.round(risk.hazard_under_water.score * 100)}%` : 'Low'}
            </div>
            <span className="text-[10px] text-slate-500">Hidden Road Traps</span>
          </div>
        </div>

        {/* Civic Ownership Card */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-800">
            <Building2 className="w-4 h-4 text-sky-600" />
            <span>Civic Ownership &amp; Liability</span>
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-slate-500">Responsible Agency:</span>
            <span className="font-bold text-slate-800 bg-sky-50 text-sky-800 px-2 py-0.5 rounded">
              {hotspot.jurisdiction?.owner || 'PWD'}
            </span>
          </div>

          <div className="text-xs text-slate-600 pt-1 border-t border-slate-100">
            <span className="font-semibold text-slate-700">Accountable Official: </span>
            <span>{hotspot.jurisdiction?.officer_role || 'Executive Engineer'}</span>
          </div>
        </div>

        {/* Defect Warranty Card */}
        {hotspot.warranty && hotspot.warranty.status === 'in_warranty' && (
          <div className="bg-emerald-50/70 border border-emerald-200/90 rounded-2xl p-4 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-emerald-900">Contractor Defect Warranty</span>
              <span className="bg-emerald-200/70 text-emerald-900 font-bold text-[10px] px-2 py-0.5 rounded-full">
                Active
              </span>
            </div>

            <p className="text-emerald-800 text-[11px]">
              Assigned Contractor: <strong>{hotspot.warranty.contractor_label}</strong>
              <br />
              Remaining Period: <strong>{hotspot.warranty.days_remaining} days</strong>
            </p>

            {hotspot.warranty.clause_text && (
              <p className="text-[11px] italic text-emerald-900/80 bg-white/60 p-2 rounded-lg border border-emerald-200/50">
                &ldquo;{hotspot.warranty.clause_text}&rdquo;
              </p>
            )}
          </div>
        )}

        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-[#0c192c] text-white font-bold text-xs shadow-md"
        >
          Close Inspection
        </button>
      </div>
    </div>
  );
};
