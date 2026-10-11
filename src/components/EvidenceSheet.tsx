import React, { useEffect, useState } from 'react';
import type { EvalResultsResponse } from '../api/types';
import { fetchEvalResults } from '../api/client';
import { MOCK_EVAL_RESULTS } from '../mocks/data';
import { AlertCircle, CheckCircle2, RefreshCw, X } from 'lucide-react';

interface EvidenceSheetProps {
  isOpen: boolean;
  onClose: () => void;
  modelVersion?: string;
  modelFitted?: boolean;
  useMock?: boolean;
}

export const EvidenceSheet: React.FC<EvidenceSheetProps> = ({
  isOpen,
  onClose,
  modelVersion = 'expert-prior-v1',
  modelFitted = false,
  useMock = false,
}) => {
  const [activeTab, setActiveTab] = useState<'model' | 'rdd2022' | 'backtest'>('model');
  const [evalData, setEvalData] = useState<EvalResultsResponse>(MOCK_EVAL_RESULTS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState(0);

  useEffect(() => {
    if (!isOpen || useMock) return;
    let active = true;
    setLoading(true);
    setError(null);
    fetchEvalResults()
      .then((data) => {
        if (active) setEvalData(data);
      })
      .catch((err: unknown) => {
        if (active) setError(err instanceof Error ? err.message : 'Failed to load evaluation results');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [isOpen, useMock]);

  if (!isOpen) return null;

  const rdd = evalData.rdd2022;
  const events = evalData.backtest?.events || [];
  const current = events[selectedEvent] || null;

  const tabs: Array<{ id: 'model' | 'rdd2022' | 'backtest'; label: string }> = [
    { id: 'model', label: 'Model' },
    { id: 'rdd2022', label: 'RDD2022' },
    { id: 'backtest', label: 'Backtest' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-end justify-center">
      <div className="bg-white rounded-t-3xl w-full max-w-md max-h-[88vh] overflow-y-auto p-5 pb-8 space-y-4 safe-bottom shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto absolute left-1/2 -translate-x-1/2 top-2.5" />
          <div>
            <h2 className="text-base font-bold text-slate-800">Model &amp; Evidence</h2>
            <p className="text-[11px] text-slate-500">
              Honest empirical metrics · Formulas · Backtest{useMock ? ' · offline preview' : ''}
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition ${
                activeTab === t.id ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading && <p className="text-xs text-slate-500">Loading evaluation results…</p>}
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => {
                setLoading(true);
                setError(null);
                fetchEvalResults()
                  .then(setEvalData)
                  .catch((e: unknown) => setError(e instanceof Error ? e.message : 'Failed to load'))
                  .finally(() => setLoading(false));
              }}
              className="ml-2 inline-flex items-center gap-1 font-bold"
            >
              <RefreshCw className="w-3 h-3" /> Retry
            </button>
          </div>
        )}

        {activeTab === 'model' && (
          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <span className="text-slate-500">Version: <strong className="font-mono text-slate-900">{modelVersion}</strong></span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${modelFitted ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'}`}>
                {modelFitted ? 'EMPIRICALLY FITTED' : 'EXPERT PRIORS'}
              </span>
            </div>
            {!modelFitted && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800">
                Coefficients are expert priors and have not been fitted.
              </div>
            )}
            <pre className="p-3 rounded-2xl bg-slate-900 text-slate-200 font-mono text-[10px] overflow-x-auto leading-relaxed">
{`z_dep  = clip((depression_m - mean_dep) / std_dep, -3, 3)   # null -> 0
z_low  = clip(-(rel_elev_m - mean_rel) / std_rel, -3, 3)     # null -> 0 ; lower ground => higher
S      = σ(bias + w_depression*z_dep + w_low_rel_elev*z_low
           + w_underpass*(1 if underpass else 0)
           + w_news*ln(1+news_events_count_or_0))

logit  = event.bias + a*S + b*ln(1+rain_3h_mm)
         + c*ln(1+rain_prev24h_mm) + d*traffic_slowdown
P      = σ(logit)

where σ(x) = 1 / (1 + e^-x)`}
            </pre>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              <strong className="text-slate-800">Depression calculation:</strong> Uses elevation ring
              averages at 200m from Open-Meteo elevation contour API.
            </p>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              <strong className="text-slate-800">Relative elevation:</strong> Compares point elevation to
              average elevation across a 1500m regional radius.
            </p>
            <p className="text-slate-600 text-[11px] leading-relaxed">
              <strong className="text-slate-800">Hazard under water interaction:</strong> Multiplies
              waterlogging probability by localized open manhole, missing drain cover, and pothole presence
              within 50m.
            </p>
          </div>
        )}

        {activeTab === 'rdd2022' && (
          <div className="space-y-3 text-xs">
            {rdd ? (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                    <div className="text-[10px] uppercase font-bold text-slate-500">Precision</div>
                    <div className="text-lg font-bold font-mono text-sky-700">{rdd.precision != null ? `${(rdd.precision * 100).toFixed(1)}%` : '—'}</div>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                    <div className="text-[10px] uppercase font-bold text-slate-500">Recall</div>
                    <div className="text-lg font-bold font-mono text-emerald-700">{rdd.recall != null ? `${(rdd.recall * 100).toFixed(1)}%` : '—'}</div>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                    <div className="text-[10px] uppercase font-bold text-slate-500">F1</div>
                    <div className="text-lg font-bold font-mono text-purple-700">{rdd.f1 != null ? rdd.f1.toFixed(3) : '—'}</div>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                    <div className="text-[10px] uppercase font-bold text-slate-500">Sample</div>
                    <div className="text-lg font-bold font-mono text-amber-700">{rdd.n_pos + rdd.n_neg}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-center font-mono text-xs font-bold">
                  <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800">TP: {rdd.tp}</div>
                  <div className="p-2 bg-rose-50 border border-rose-200 rounded-xl text-rose-800">FP: {rdd.fp}</div>
                  <div className="p-2 bg-amber-50 border border-amber-200 rounded-xl text-amber-800">FN: {rdd.fn}</div>
                  <div className="p-2 bg-slate-100 rounded-xl text-slate-700">TN: {rdd.tn}</div>
                </div>
                <p className="text-[11px] text-slate-500">
                  {rdd.dataset && (
                    <>Dataset: <span className="font-bold text-slate-700">{rdd.dataset}</span> &middot; </>
                  )}
                  Model: <span className="font-mono text-sky-700">{rdd.model_id}</span> &middot; {rdd.run_at} &middot; {rdd.level}-level
                </p>
              </>
            ) : (
              <div className="p-8 rounded-2xl bg-slate-50 border border-dashed border-slate-300 text-center space-y-2">
                <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
                <p className="text-sm font-bold text-slate-900">Not yet measured.</p>
                <p className="text-[11px] text-slate-500">Place RDD2022 India images + VOC XML in eval/data/rdd2022_india/ and run eval/rdd2022_eval.py.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'backtest' && (
          <div className="space-y-3 text-xs">
            {events.length > 0 ? (
              <>
                <select
                  value={selectedEvent}
                  onChange={(e) => setSelectedEvent(Number(e.target.value))}
                  className="w-full py-2.5 px-3 rounded-xl bg-white border border-slate-300 text-xs text-slate-800"
                >
                  {events.map((ev, idx) => (
                    <option key={ev.event_id || idx} value={idx}>
                      {ev.date} — {ev.description || ev.event_id}
                    </option>
                  ))}
                </select>
                {current && (
                  <>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200">
                        <div className="text-[9px] uppercase font-bold text-slate-500">P@20</div>
                        <div className="font-bold font-mono text-sky-700">{current.precision_at_20 !== undefined ? `${(current.precision_at_20 * 100).toFixed(1)}%` : 'N/A'}</div>
                      </div>
                      <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200">
                        <div className="text-[9px] uppercase font-bold text-slate-500">Recall</div>
                        <div className="font-bold font-mono text-emerald-700">{current.recall != null ? `${(current.recall * 100).toFixed(1)}%` : 'N/A'}</div>
                      </div>
                      <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200">
                        <div className="text-[9px] uppercase font-bold text-slate-500">Baseline</div>
                        <div className="font-bold font-mono text-slate-600">{current.random_baseline_precision !== undefined ? `${(current.random_baseline_precision * 100).toFixed(1)}%` : 'N/A'}</div>
                      </div>
                    </div>
                    <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden max-h-56 overflow-y-auto divide-y divide-slate-100">
                      {(current.top_20 || []).length > 0 ? (
                        (current.top_20 || []).map((row, idx) => (
                          <div key={row.hotspot_id} className="px-3 py-2 flex items-center justify-between text-[11px]">
                            <span className="text-slate-900 font-semibold"><span className="font-mono text-slate-400 mr-1.5">{idx + 1}</span>{row.name}</span>
                            <span className="flex items-center gap-2">
                              <span className="font-mono font-bold text-sky-700">{(row.probability * 100).toFixed(1)}%</span>
                              {row.reported_hit && (
                                <span className="flex items-center gap-0.5 text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200 font-bold text-[10px]">
                                  <CheckCircle2 className="w-3 h-3" /> Hit
                                </span>
                              )}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="p-3 text-slate-400 text-center italic text-[11px]">
                          {current.top20_predicted?.join(', ') || 'No predicted list recorded'}
                        </div>
                      )}
                    </div>
                    {current.reported_other_count !== undefined && (
                      <p className="text-[11px] text-slate-500">Reported waterlogging incidents outside known hotspot set: {current.reported_other_count}</p>
                    )}
                  </>
                )}
              </>
            ) : (
              <div className="p-8 rounded-2xl bg-slate-50 border border-dashed border-slate-300 text-center space-y-2">
                <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
                <p className="text-sm font-bold text-slate-900">No backtest events loaded.</p>
                <p className="text-[11px] text-slate-500">Replace placeholders in backtest/events.json and run backtest/run_backtest.py.</p>
              </div>
            )}
          </div>
        )}

        <button onClick={onClose} className="w-full py-3 rounded-xl bg-[#0c192c] text-white font-bold text-xs shadow-md">
          Close
        </button>
      </div>
    </div>
  );
};
