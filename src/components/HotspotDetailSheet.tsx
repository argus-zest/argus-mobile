import React, { useState } from 'react';
import type { Hotspot, RiskScore } from '../api/types';
import { extractTenderClause } from '../api/client';
import { ProvenanceChip } from './chips';
import { Building2, ChevronDown, ChevronUp, Sparkles, X } from 'lucide-react';

interface HotspotDetailSheetProps {
  hotspot: Hotspot | null;
  risk?: RiskScore;
  onClose: () => void;
  onOpenCase?: (hotspot: Hotspot) => void;
}

export const HotspotDetailSheet: React.FC<HotspotDetailSheetProps> = ({
  hotspot,
  risk,
  onClose,
  onOpenCase,
}) => {
  const [whyOpen, setWhyOpen] = useState(false);
  const [extracting, setExtracting] = useState(false);
  const [extracted, setExtracted] = useState<{
    found: boolean;
    quote: string;
    page_hint: string;
    verified_in_text: boolean | null;
  } | null>(null);
  const [extractError, setExtractError] = useState<string | null>(null);

  if (!hotspot) return null;

  const prob = risk ? Math.round(risk.probability * 100) : 0;
  const huw = risk?.hazard_under_water;
  const jur = hotspot.jurisdiction;
  const war = hotspot.warranty;

  const handleExtract = async () => {
    if (!war?.tender_doc_key) return;
    setExtracting(true);
    setExtractError(null);
    try {
      const res = await extractTenderClause(war.tender_doc_key);
      setExtracted(res);
    } catch (err) {
      setExtractError(err instanceof Error ? err.message : 'Clause extraction failed');
    } finally {
      setExtracting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-end justify-center animate-fade-in">
      <div className="bg-white rounded-t-3xl w-full max-w-md max-h-[85vh] overflow-y-auto p-5 pb-8 space-y-4 safe-bottom shadow-2xl animate-slide-up">
        {/* Header Handle */}
        <div className="flex items-center justify-between">
          <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto absolute left-1/2 -translate-x-1/2 top-2.5" />
          <div>
            <h2 className="text-base font-bold text-slate-800">{hotspot.name}</h2>
            <p className="text-xs text-slate-500">
              {hotspot.road?.name || 'Road segment'} &bull; {hotspot.road?.road_class || 'Arterial'} &bull;{' '}
              {hotspot.road?.width_ft || 60} ft width
            </p>
            <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
              <ProvenanceChip value={hotspot.provenance} />
              {hotspot.coord_verified ? (
                <span className="text-[9px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded">Verified Coords</span>
              ) : (
                <span className="text-[9px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded">location unverified</span>
              )}
              {hotspot.features.underpass && (
                <span className="text-[9px] font-bold bg-purple-50 text-purple-800 border border-purple-200 px-1.5 py-0.5 rounded">Underpass</span>
              )}
            </div>
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
            <span className="text-[10px] text-slate-500 capitalize">{risk?.band ?? 'unknown'} · Calibrated Prior</span>
          </div>

          <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
            <span className="text-[10px] font-semibold text-slate-400 uppercase">Submerged Hazard</span>
            <div className="text-2xl font-black text-rose-600 mt-0.5">
              {Math.round((huw?.score ?? 0) * 100)}%
            </div>
            <span className="text-[10px] text-slate-500">
              Hidden Road Traps &middot; Weight: {Math.round((huw?.weight ?? 0) * 100)}%
            </span>
          </div>
        </div>

        {/* Risk drivers */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-slate-800">Hydrological Drivers</div>
            <span className="text-[10px] text-slate-400">Logit contribution</span>
          </div>
          {risk?.drivers && risk.drivers.length > 0 ? (
            <div className="space-y-1.5">
              {risk.drivers.map((d) => (
                <div key={d.name} className="space-y-0.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-600 capitalize flex items-center gap-1">
                      <span>{d.name.replace(/_/g, ' ')}</span>
                      {d.missing && <span className="text-[9px] text-slate-400 bg-slate-100 px-1 rounded">missing</span>}
                    </span>
                    <span className="font-mono text-slate-600">
                      {d.contribution > 0 ? '+' : ''}
                      {d.contribution.toFixed(2)}
                    </span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden flex">
                    <div className="w-1/2 flex justify-end">
                      {d.contribution < 0 && (
                        <div className="h-full bg-slate-400" style={{ width: `${Math.min(100, (Math.abs(d.contribution) / 3) * 100)}%` }} />
                      )}
                    </div>
                    <div className="w-1/2 flex justify-start">
                      {d.contribution >= 0 && (
                        <div className="h-full bg-sky-600" style={{ width: `${Math.min(100, (Math.abs(d.contribution) / 3) * 100)}%` }} />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-slate-400 italic">No drivers recorded.</p>
          )}
        </div>

        {/* Hidden hazards nearby */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-slate-800">
              Hidden hazards nearby ({hotspot.assets?.length ?? 0})
            </div>
            <span className="text-[11px] font-mono font-bold text-rose-700">
              Weight: {Math.round((huw?.weight ?? 0) * 100)}%
            </span>
          </div>
          {hotspot.assets && hotspot.assets.length > 0 ? (
            <div className="space-y-1.5">
              {hotspot.assets.map((a) => (
                <div key={a.asset_id} className="flex items-center justify-between text-[11px] bg-slate-50 rounded-lg px-2.5 py-1.5 border border-slate-100">
                  <span className="font-semibold text-slate-700 capitalize">{a.type.replace(/_/g, ' ')} · {a.severity}/5</span>
                  <ProvenanceChip value={a.provenance} />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-slate-500">No hazards recorded within 50 m.</p>
          )}
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
              {jur?.owner || 'ORPHAN'}
            </span>
          </div>
          <div className="text-[11px] text-slate-500">
            Confidence: <strong className="text-slate-700">{Math.round((jur?.confidence || 0) * 100)}%</strong>
            {jur && jur.reasons.length > 0 && (
              <button onClick={() => setWhyOpen((v) => !v)} className="ml-2 font-semibold text-sky-600 inline-flex items-center gap-0.5">
                Why? {whyOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            )}
          </div>
          {whyOpen && jur && (
            <ul className="pl-4 list-disc text-[11px] text-slate-600 space-y-0.5">
              {jur.reasons.map((r, i) => <li key={i}>{r}</li>)}
            </ul>
          )}

          <div className="text-xs text-slate-600 pt-1 border-t border-slate-100">
            <span className="font-semibold text-slate-700">Accountable Official: </span>
            <span>{jur?.officer_role || 'District Magistrate (illustrative)'}</span>
            {jur?.provenance_note && (
              <div className="text-[11px] text-slate-500 mt-0.5">{jur.provenance_note}</div>
            )}
          </div>
          <div className="text-xs text-slate-600">
            <span className="font-semibold text-slate-700">Contractor: </span>
            <span>{war?.contractor_label || 'Unassigned / Not Determined'}</span>
            {war?.work_type ? <span className="text-slate-500"> · {war.work_type}</span> : null}
          </div>
        </div>

        {/* Defect Warranty Card */}
        <div className={`rounded-2xl p-4 space-y-2 text-xs border ${
          war?.status === 'in_warranty'
            ? 'bg-emerald-50/70 border-emerald-200/90'
            : war?.status === 'expired'
              ? 'bg-rose-50/70 border-rose-200/90'
              : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900">Contractor Defect Warranty</span>
            {war?.status === 'in_warranty' && (
              <span className="bg-emerald-200/70 text-emerald-900 font-bold text-[10px] px-2 py-0.5 rounded-full">
                In warranty — {war.days_remaining ?? '—'} days left
              </span>
            )}
            {war?.status === 'expired' && (
              <span className="bg-rose-200/70 text-rose-900 font-bold text-[10px] px-2 py-0.5 rounded-full">
                Warranty expired
                {typeof war.days_remaining === 'number'
                  ? ` (${Math.abs(war.days_remaining)} days ago)`
                  : ''}
              </span>
            )}
            {(!war || war.status === 'unknown') && (
              <span className="bg-slate-200/70 text-slate-700 font-bold text-[10px] px-2 py-0.5 rounded-full">
                Unknown
              </span>
            )}
          </div>

          {war && war.status !== 'unknown' && (
            <p className="text-[11px] text-slate-600">
              Completed: <strong>{war.completion_date ?? '—'}</strong> · Ends: <strong>{war.end_date ?? '—'}</strong>
            </p>
          )}

          {war?.clause_text && (
            <div className="text-[11px] italic text-slate-700 bg-white/60 p-2 rounded-lg border border-slate-200/60">
              <p>&ldquo;{war.clause_text}&rdquo;</p>
              <div className="mt-1.5 flex items-center justify-between not-italic text-[10px] text-slate-400">
                <span>Quoted from Public Tender</span>
                <ProvenanceChip value={war.provenance || 'illustrative'} />
              </div>
            </div>
          )}

          {war?.tender_doc_key && (
            <div className="space-y-2">
              <button
                onClick={handleExtract}
                disabled={extracting}
                className="w-full py-2 px-3 rounded-xl text-[11px] font-semibold bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 flex items-center justify-center space-x-1.5 transition disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                <span>{extracting ? 'Extracting with Nova 2 Lite...' : 'Verify Clause with Amazon Nova'}</span>
              </button>
              {extractError && <p className="text-[11px] text-rose-700">{extractError}</p>}
              {extracted && (
                <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-[11px]">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-slate-700">{extracted.page_hint}</span>
                    {extracted.verified_in_text ? (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">verified in PDF</span>
                    ) : (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">not found verbatim</span>
                    )}
                  </div>
                  <p className="italic text-slate-700">&ldquo;{extracted.quote}&rdquo;</p>
                </div>
              )}
            </div>
          )}
        </div>

        {onOpenCase && (
          <button
            onClick={() => onOpenCase(hotspot)}
            className="w-full py-3 rounded-xl bg-sky-600 text-white font-bold text-xs shadow-md"
          >
            Open case for this hotspot
          </button>
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
