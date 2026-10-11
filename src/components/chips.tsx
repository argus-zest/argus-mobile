import React from 'react';
import { getBandColor } from '../api/utils';
import type { RiskBand } from '../api/types';

/** Provenance chip. Colours per SPEC: sourced green, illustrative amber, simulated grey. */
export const ProvenanceChip: React.FC<{ value: string | null | undefined }> = ({ value }) => {
  if (!value) return null;
  let cls = 'bg-slate-100 text-slate-600 border-slate-200';
  if (value === 'sourced') cls = 'bg-emerald-50 text-emerald-800 border-emerald-200';
  else if (value === 'illustrative') cls = 'bg-amber-50 text-amber-800 border-amber-200';
  else if (value === 'simulated') cls = 'bg-slate-100 text-slate-600 border-slate-300';
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${cls}`}>
      {value}
    </span>
  );
};

export const BandChip: React.FC<{ band: RiskBand | string }> = ({ band }) => {
  const color = getBandColor(band);
  return (
    <span
      className="px-2 py-0.5 rounded-full text-[10px] font-bold capitalize"
      style={{ backgroundColor: `${color}1a`, color, border: `1px solid ${color}55` }}
    >
      {band}
    </span>
  );
};

export const MockBadge: React.FC = () => (
  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 text-red-700 border border-red-300">
    MOCK DATA
  </span>
);
