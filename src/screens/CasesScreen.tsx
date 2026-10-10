import React from 'react';
import { MOCK_MOBILE_CASES } from '../mocks/data';


export const CasesScreen: React.FC = () => {
  return (
    <div className="p-4 space-y-4 pb-24">
      <div>
        <h2 className="text-lg font-bold text-slate-800">Civic Escalation Cases</h2>
        <p className="text-xs text-slate-500">
          Tracking official defect notifications and 4-rung Step Functions workflow.
        </p>
      </div>

      <div className="space-y-3">
        {MOCK_MOBILE_CASES.map((c) => (
          <div
            key={c.case_id}
            className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs space-y-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="font-mono text-[11px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded">
                  {c.case_id}
                </span>
                <h3 className="text-sm font-bold text-slate-800 mt-1 leading-tight">
                  {c.title}
                </h3>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  c.status === 'OPEN'
                    ? 'bg-rose-100 text-rose-800'
                    : c.status === 'INVESTIGATING'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-blue-100 text-blue-800'
                }`}
              >
                {c.status}
              </span>
            </div>

            {/* Escalation Ladder visualization */}
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1.5">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Civic Escalation Ladder (Step Functions)
              </div>
              <div className="flex items-center space-x-1.5 text-[11px]">
                <div className="flex-1 bg-emerald-100 text-emerald-800 text-center py-1 rounded font-bold text-[10px]">
                  Rung 1: JE
                </div>
                <div className="text-slate-300">&rarr;</div>
                <div className="flex-1 bg-sky-100 text-sky-800 text-center py-1 rounded font-bold text-[10px]">
                  Rung 2: AE
                </div>
                <div className="text-slate-300">&rarr;</div>
                <div className="flex-1 bg-slate-200 text-slate-500 text-center py-1 rounded font-medium text-[10px]">
                  Rung 3: EE
                </div>
                <div className="text-slate-300">&rarr;</div>
                <div className="flex-1 bg-slate-200 text-slate-500 text-center py-1 rounded font-medium text-[10px]">
                  Rung 4: CE
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
              <span className="font-medium text-slate-700">Agency: {c.owner_agency}</span>
              <span className="text-[11px] text-slate-400">
                {new Date(c.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
