import React, { useEffect, useState } from 'react';
import type { CaseEvent, CaseRecord } from '../api/types';
import { claimFix, fetchCaseDetails, fetchCases, presignUpload, putToUploadUrl } from '../api/client';
import { claimReasonText } from '../api/utils';
import { MockBadge } from '../components/chips';
import { Award, CheckCircle, ChevronDown, ChevronUp, Clock, Mail, MapPin, RefreshCw, ShieldCheck } from 'lucide-react';

interface CasesScreenProps {
  initialCases: CaseRecord[];
  activeCaseId: string | null;
  onSelectCase: (id: string | null) => void;
  isMock: boolean;
  refreshSignal: number;
}

function mockEventsFor(c: CaseRecord): CaseEvent[] {
  return [
    { case_id: c.case_id, ts_seq: `${c.created_at}#0001`, type: 'CASE_OPENED', message: `Case opened for ${c.hotspot_id || 'reported location'}`, rung: c.rung, meta: {} },
    { case_id: c.case_id, ts_seq: `${c.created_at}#0002`, type: 'JURISDICTION_RESOLVED', message: `Owner resolved: ${c.owner}`, rung: c.rung, meta: {} },
  ];
}

const RUNGS = (owner: string): Array<{ rung: number; label: string; agency: string; role: string }> => [
  { rung: 1, label: 'Executive Engineer', agency: owner, role: 'Local Division Nodal' },
  { rung: 2, label: 'Flood Control Officer', agency: 'Delhi Flood Control', role: 'Designated Nodal Officer' },
  { rung: 3, label: 'Superintending Engineer', agency: owner, role: 'Senior Agency Oversight' },
  { rung: 4, label: 'District Magistrate', agency: 'Revenue Dept / DM Taskforce', role: 'Inter-Agency Convening' },
];

export const CasesScreen: React.FC<CasesScreenProps> = ({
  initialCases,
  activeCaseId,
  onSelectCase,
  isMock,
  refreshSignal,
}) => {
  const [cases, setCases] = useState<CaseRecord[]>(initialCases);
  const [selected, setSelected] = useState<CaseRecord | null>(null);
  const [events, setEvents] = useState<CaseEvent[]>([]);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [apiAvailable, setApiAvailable] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [emailOpen, setEmailOpen] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);

  const [claimFile, setClaimFile] = useState<File | null>(null);
  const [claimLat, setClaimLat] = useState<number>(0);
  const [claimLng, setClaimLng] = useState<number>(0);
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimResult, setClaimResult] = useState<{ accepted: boolean; reason: string; distance_m?: number } | null>(null);
  const [claimError, setClaimError] = useState<string | null>(null);
  const apiAvailableRef = React.useRef(true);
  apiAvailableRef.current = apiAvailable;

  // Cases list: load + poll every 5s while API works
  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await fetchCases();
        if (!active) return;
        setCases(res.cases);
        setApiAvailable(true);
        setListError(null);
        if (!activeCaseId && res.cases.length > 0) onSelectCase(res.cases[0].case_id);
      } catch (err) {
        if (!active) return;
        setApiAvailable(false);
        setListError(err instanceof Error ? err.message : 'Failed to load cases');
        setCases(initialCases);
        if (!activeCaseId && initialCases.length > 0) onSelectCase(initialCases[0].case_id);
      }
    };
    void load();
    const id = setInterval(() => {
      if (apiAvailableRef.current) void load();
    }, 5000);
    return () => {
      active = false;
      clearInterval(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshSignal]);

  // Case details: poll every 2s while API works
  useEffect(() => {
    if (!activeCaseId) {
      setSelected(null);
      setEvents([]);
      setPhotoUrl(null);
      return;
    }
    // Seed selection from list immediately
    const fromList = cases.find((c) => c.case_id === activeCaseId) || null;
    if (fromList) {
      setSelected(fromList);
      setClaimLat(fromList.lat);
      setClaimLng(fromList.lng);
    }
    let active = true;
    const load = async () => {
      try {
        const res = await fetchCaseDetails(activeCaseId);
        if (!active) return;
        setSelected(res.case);
        setEvents(res.events || []);
        setPhotoUrl(res.photo_url || null);
        setApiAvailable(true);
        const duration = res.case.timer_profile === 'demo' ? 20 : 259200;
        const last = res.events?.[res.events.length - 1];
        if (last) {
          const t = new Date(last.ts_seq.split('#')[0]).getTime();
          setCountdown(Math.max(0, duration - Math.floor((Date.now() - t) / 1000)));
        }
      } catch {
        if (!active) return;
        setApiAvailable(false);
        if (fromList) {
          setEvents(mockEventsFor(fromList));
          setCountdown(null);
        }
      }
    };
    void load();
    const id = setInterval(() => {
      if (apiAvailableRef.current) void load();
    }, 2000);
    return () => {
      active = false;
      clearInterval(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCaseId, cases.length]);

  const toggleExpand = (seq: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(seq)) next.delete(seq);
      else next.add(seq);
      return next;
    });
  };

  const handleClaim = async () => {
    if (!selected) return;
    setIsClaiming(true);
    setClaimResult(null);
    setClaimError(null);
    try {
      let key = '';
      if (claimFile) {
        const presign = await presignUpload('fix', 'image/jpeg');
        await putToUploadUrl(presign.upload_url, claimFile, 'image/jpeg');
        key = presign.s3_key;
      }
      if (!key) {
        setClaimError('Attach a repair photo to verify the fix.');
        return;
      }
      const res = await claimFix(selected.case_id, key, claimLat || selected.lat, claimLng || selected.lng);
      setClaimResult({ accepted: res.accepted, reason: res.reason, distance_m: res.distance_m });
      try {
        const refreshed = await fetchCaseDetails(selected.case_id);
        setSelected(refreshed.case);
        setEvents(refreshed.events || []);
      } catch {
        /* keep claim result even if refresh fails */
      }
    } catch (err) {
      setClaimError(err instanceof Error ? err.message : 'Fix claim failed');
    } finally {
      setIsClaiming(false);
    }
  };

  const currentRung = selected?.rung || 1;
  const isClosed = selected?.status === 'CLOSED_VERIFIED';
  const isFinal = selected?.status === 'UNRESOLVED_FINAL';
  const latestNotice = [...events].reverse().find((e) => e.type === 'NOTICE_SENT' || e.type === 'REMINDER_SENT' || e.type === 'ESCALATED');
  const noticeMeta = (latestNotice?.meta || {}) as Record<string, unknown>;

  return (
    <div className="p-4 space-y-4 pb-24">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-800">Civic Escalation Cases</h2>
            <span className="text-[11px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              {cases.length} cases
            </span>
          </div>
          <p className="text-xs text-slate-500">4-rung autonomous workflow · {(isMock || !apiAvailable) && 'offline preview'}</p>
        </div>
        {(isMock || !apiAvailable) && <MockBadge />}
      </div>

      {listError && !apiAvailable && (
        <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-[11px] flex items-center justify-between">
          <span>Live case list unavailable: {listError}. Showing seeded preview.</span>
        </div>
      )}

      {/* Cases list */}
      <div className="space-y-2.5">
        {cases.map((c) => {
          const isSel = c.case_id === activeCaseId;
          return (
            <button
              key={c.case_id}
              onClick={() => onSelectCase(isSel ? null : c.case_id)}
              className={`w-full text-left bg-white rounded-2xl p-3.5 border shadow-xs transition ${
                isSel ? 'border-sky-500 ring-1 ring-sky-300' : 'border-slate-200/90'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-mono text-[11px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded">{c.case_id}</span>
                  <div className="text-sm font-bold text-slate-800 mt-1 leading-tight">
                    {c.hotspot_id ? c.hotspot_id.replace(/_/g, ' ') : `${c.lat.toFixed(3)}, ${c.lng.toFixed(3)}`}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                    {c.status}
                  </span>
                  {c.seeded && (
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-purple-50 text-purple-700 border border-purple-200">SEEDED</span>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-100">
                <span>Agency: <strong className="text-slate-700">{c.owner}</strong></span>
                <span>Rung {c.rung}/4 · {c.timer_profile} timers</span>
              </div>
            </button>
          );
        })}
        {cases.length === 0 && (
          <div className="p-8 text-center bg-white border border-dashed border-slate-300 rounded-2xl">
            <p className="text-sm font-bold text-slate-800">No cases yet</p>
            <p className="text-[11px] text-slate-500 mt-1">Report a hazard to open the first escalation case.</p>
          </div>
        )}
      </div>

      {/* Case detail */}
      {selected && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <div className="text-base font-bold text-slate-900">{selected.case_id}</div>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  {selected.status}
                </span>
                {selected.timer_profile && (
                  <span className="text-[9px] font-mono uppercase bg-slate-200/80 px-2 py-0.5 rounded text-slate-600 font-bold">
                    {selected.timer_profile} timers
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3" />
                {selected.lat.toFixed(4)}, {selected.lng.toFixed(4)} &bull; Owner Agency:{' '}
                <strong className="text-slate-700">{selected.owner}</strong>
              </div>
            </div>
            {!isClosed && !isFinal && countdown !== null && apiAvailable && (
              <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-200">
                <Clock className="w-3.5 h-3.5 text-sky-600" />
                <div className="text-right">
                  <div className="text-[8px] uppercase tracking-wider text-slate-400 font-bold">Next Escalation</div>
                  <div className="font-mono text-[11px] font-bold text-sky-800">{countdown}s remaining</div>
                </div>
              </div>
            )}
          </div>

          {/* Rung tracker */}
          <div className="space-y-1.5">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Award className="w-3.5 h-3.5 text-sky-600" /> 4-Rung Escalation Ladder
            </div>
            <div className="grid grid-cols-4 gap-1.5">
              {RUNGS(selected.owner).map((r) => {
                const passed = currentRung > r.rung || isClosed;
                const current = currentRung === r.rung && !isClosed;
                return (
                  <div
                    key={r.rung}
                    className={`p-2 rounded-xl border text-center transition ${
                      current
                        ? 'border-sky-400 bg-sky-50 ring-1 ring-sky-200'
                        : passed
                          ? 'border-emerald-200 bg-emerald-50/60'
                          : 'border-slate-200 bg-slate-50/50'
                    }`}
                  >
                    <div className={`text-[9px] font-bold ${current ? 'text-sky-900' : passed ? 'text-emerald-900' : 'text-slate-400'}`}>
                      R{r.rung}
                    </div>
                    <div className={`text-[9px] leading-tight mt-0.5 ${current || passed ? 'font-bold text-slate-800' : 'text-slate-400'}`}>
                      {r.label}
                    </div>
                    <div className={`text-[8px] leading-tight mt-0.5 ${current || passed ? 'text-slate-600' : 'text-slate-400'}`}>
                      {r.agency}
                    </div>
                    <div className="text-[8px] leading-tight italic text-slate-400 mt-0.5">{r.role}</div>
                    {passed && <CheckCircle className="w-3 h-3 text-emerald-600 mx-auto mt-1" />}
                    {current && <span className="block w-2 h-2 rounded-full bg-sky-600 animate-ping mx-auto mt-1" />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Photo evidence */}
          {photoUrl && (
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <img src={photoUrl} alt="Report evidence" className="w-14 h-14 rounded-lg object-cover border border-slate-200" />
              <div className="text-[11px]">
                <div className="font-bold text-slate-800">Citizen photo evidence</div>
                <div className="text-slate-500">{selected.analysis?.hazard_type || 'hazard'} · severity {selected.analysis?.severity ?? '—'}/5</div>
              </div>
            </div>
          )}

          {/* Claim fix */}
          {!isClosed && (
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Claim Fix
                </h3>
                <span className="text-[10px] text-slate-400">Within 25 m</span>
              </div>
              <div className="flex gap-2">
                <input
                  type="number" step="0.0001" placeholder="Lat" value={claimLat || ''}
                  onChange={(e) => setClaimLat(Number(e.target.value))}
                  className="w-1/2 p-2 rounded-xl bg-white border border-slate-200 text-xs"
                />
                <input
                  type="number" step="0.0001" placeholder="Lng" value={claimLng || ''}
                  onChange={(e) => setClaimLng(Number(e.target.value))}
                  className="w-1/2 p-2 rounded-xl bg-white border border-slate-200 text-xs"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="file" accept="image/jpeg,image/png"
                  onChange={(e) => setClaimFile(e.target.files?.[0] || null)}
                  className="flex-1 text-[11px] text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-[11px] file:font-semibold file:bg-white file:text-slate-700"
                />
                <button type="button" onClick={() => { setClaimLat(selected.lat); setClaimLng(selected.lng); }} className="text-[11px] font-semibold text-sky-600 whitespace-nowrap">
                  Use case location
                </button>
              </div>
              <p className="text-[10px] text-slate-400">Location is attested by the claimant.</p>
              <button
                onClick={handleClaim}
                disabled={isClaiming}
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-[#0c192c] text-white disabled:opacity-50"
              >
                {isClaiming ? 'Verifying with Nova…' : 'Verify Repair & Close Case'}
              </button>
              {!apiAvailable && <p className="text-[11px] text-amber-700">Fix claims need a backend connection (VITE_API_BASE).</p>}
              {claimError && <p className="text-[11px] text-rose-700">{claimError}</p>}
              {claimResult && (
                <div className={`p-2.5 rounded-xl border text-[11px] ${claimResult.accepted ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'}`}>
                  <div className="font-bold">{claimResult.accepted ? 'Fix verified & case resolved!' : 'Claim rejected'}</div>
                  <div>{claimReasonText(claimResult.reason)}</div>
                  {claimResult.distance_m !== undefined && <div>Distance: <strong>{claimResult.distance_m.toFixed(1)} m</strong> (limit 25 m)</div>}
                </div>
              )}
            </div>
          )}

          {/* Email preview */}
          <div>
            <button onClick={() => setEmailOpen((v) => !v)} className="text-[11px] font-bold text-sky-600 flex items-center gap-1">
              <Mail className="w-3.5 h-3.5" /> {emailOpen ? 'Hide notice preview' : 'Preview sent notice'}
            </button>
            {emailOpen && (
              <div className="mt-2 p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] space-y-1.5">
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 inline-block">[DRY-RUN] Sandbox inbox</span>
                <p className="text-slate-800">
                  <strong>Subject:</strong>{' '}
                  {typeof noticeMeta.subject === 'string'
                    ? noticeMeta.subject
                    : `[DRY-RUN] Notice to ${selected.owner}: hazard at ${selected.hotspot_id || 'reported location'}`}
                </p>
                <p className="p-2.5 bg-white rounded-lg border border-slate-200 text-slate-700 whitespace-pre-wrap max-h-40 overflow-y-auto">
                  {typeof noticeMeta.body === 'string'
                    ? noticeMeta.body
                    : `DRY-RUN: this notice was NOT sent to any official.\n\nCase ID: ${selected.case_id}\nLocation: https://www.openstreetmap.org/?mlat=${selected.lat}&mlon=${selected.lng}#map=18/${selected.lat}/${selected.lng}\nDemand: Please inspect and repair, and reply with a geo-tagged photo of the repaired spot.\n\nGenerated by Argus (hackathon prototype)`}
                </p>
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="space-y-2">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Audit trail ({events.length})</div>
            {events.map((ev) => {
              const open = expanded.has(ev.ts_seq);
              return (
                <div key={ev.ts_seq} className="p-2.5 rounded-xl bg-white border border-slate-200 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{ev.type}</span>
                    <button onClick={() => toggleExpand(ev.ts_seq)} className="text-slate-400 p-0.5">
                      {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  {ev.message && <p className="text-slate-600 mt-0.5">{ev.message}</p>}
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">{new Date(ev.ts_seq.split('#')[0]).toLocaleString()} · rung {ev.rung}</p>
                  {open && ev.meta != null && (
                    <pre className="mt-1.5 p-2 rounded-lg bg-slate-50 border border-slate-200 text-[10px] font-mono overflow-x-auto">
                      {JSON.stringify(ev.meta, null, 2)}
                    </pre>
                  )}
                </div>
              );
            })}
            {events.length === 0 && <p className="text-[11px] text-slate-400 italic">No events recorded yet.</p>}
          </div>
        </div>
      )}

      {!selected && cases.length > 0 && (
        <div className="p-6 text-center bg-white border border-dashed border-slate-300 rounded-2xl">
          <p className="text-xs text-slate-500">
            Select a case from the list to view escalation ladder details.
          </p>
        </div>
      )}

      {apiAvailable && (
        <button
          onClick={() => setRefreshSignalFallback()}
          className="w-full py-2 rounded-xl bg-white border border-slate-200 text-[11px] font-bold text-slate-600 flex items-center justify-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh cases
        </button>
      )}
    </div>
  );

  function setRefreshSignalFallback() {
    // Local re-poll without parent state: reload list directly
    fetchCases()
      .then((res) => {
        setCases(res.cases);
        setListError(null);
      })
      .catch((err: unknown) => setListError(err instanceof Error ? err.message : 'Refresh failed'));
  }
};
