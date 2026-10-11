import React from 'react';
import { X } from 'lucide-react';

interface ArchitectureSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureSheet: React.FC<ArchitectureSheetProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-end justify-center">
      <div className="bg-white rounded-t-3xl w-full max-w-md max-h-[88vh] overflow-y-auto p-5 pb-8 space-y-4 safe-bottom shadow-2xl">
        <div className="flex items-center justify-between">
          <div className="w-10 h-1 bg-slate-300 rounded-full mx-auto absolute left-1/2 -translate-x-1/2 top-2.5" />
          <div>
            <h2 className="text-base font-bold text-slate-800">System Architecture</h2>
            <p className="text-[11px] text-slate-500">AWS SAM Serverless · Predict &amp; Enforce</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="w-full bg-white border border-slate-200 rounded-2xl p-3">
          <svg viewBox="0 0 960 520" className="w-full h-auto text-slate-800" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="20" y="30" width="445" height="460" rx="16" fill="#f8fafc" stroke="#0284c7" strokeWidth="1.5" strokeDasharray="4 4" />
            <rect x="495" y="30" width="445" height="460" rx="16" fill="#f8fafc" stroke="#e11d48" strokeWidth="1.5" strokeDasharray="4 4" />
            <text x="40" y="60" fill="#0369a1" fontSize="15" fontWeight="bold">PREDICT (Risk &amp; Basemap)</text>
            <text x="515" y="60" fill="#be123c" fontSize="15" fontWeight="bold">ENFORCE (Hazard &amp; Escalation)</text>
            <rect x="360" y="90" width="240" height="52" rx="10" fill="#ffffff" stroke="#0284c7" strokeWidth="2" />
            <text x="480" y="115" fill="#0f172a" fontSize="14" fontWeight="bold" textAnchor="middle">Mobile App / Browser</text>
            <text x="480" y="132" fill="#475569" fontSize="11" textAnchor="middle">React 18 + MapLibre GL</text>
            <rect x="60" y="90" width="200" height="52" rx="10" fill="#ffffff" stroke="#0284c7" strokeWidth="1.5" />
            <text x="160" y="115" fill="#0f172a" fontSize="13" fontWeight="bold" textAnchor="middle">Amazon Location Service</text>
            <text x="160" y="132" fill="#64748b" fontSize="11" textAnchor="middle">Vector Tiles / OSM fallback</text>
            <rect x="370" y="180" width="220" height="48" rx="10" fill="#0284c7" stroke="#0369a1" strokeWidth="1.5" />
            <text x="480" y="203" fill="#ffffff" fontSize="14" fontWeight="bold" textAnchor="middle">Amazon API Gateway</text>
            <text x="480" y="219" fill="#e0f2fe" fontSize="11" textAnchor="middle">HTTP API v2 (/v1/*)</text>
            <path d="M 480 142 L 480 180" stroke="#0284c7" strokeWidth="2" />
            <rect x="50" y="180" width="160" height="48" rx="10" fill="#ffffff" stroke="#64748b" strokeWidth="1.5" />
            <text x="130" y="203" fill="#0f172a" fontSize="12" fontWeight="bold" textAnchor="middle">Amazon EventBridge</text>
            <text x="130" y="219" fill="#64748b" fontSize="10" textAnchor="middle">Hourly Schedule Rule</text>
            <rect x="50" y="260" width="160" height="52" rx="10" fill="#ffffff" stroke="#ca8a04" strokeWidth="1.5" />
            <text x="130" y="283" fill="#0f172a" fontSize="12" fontWeight="bold" textAnchor="middle">scheduled_score Lambda</text>
            <text x="130" y="300" fill="#a16207" fontSize="10" textAnchor="middle">Open-Meteo → S3 Export</text>
            <path d="M 130 228 L 130 260" stroke="#94a3b8" strokeWidth="1.5" />
            <rect x="250" y="260" width="180" height="52" rx="10" fill="#ffffff" stroke="#0284c7" strokeWidth="1.5" />
            <text x="340" y="283" fill="#0f172a" fontSize="12" fontWeight="bold" textAnchor="middle">Hotspots &amp; Risk Lambdas</text>
            <text x="340" y="300" fill="#64748b" fontSize="10" textAnchor="middle">Susceptibility Core</text>
            <path d="M 430 228 L 360 260" stroke="#0284c7" strokeWidth="1.5" />
            <rect x="140" y="370" width="180" height="62" rx="10" fill="#ffffff" stroke="#16a34a" strokeWidth="1.5" />
            <text x="230" y="395" fill="#0f172a" fontSize="13" fontWeight="bold" textAnchor="middle">Amazon S3 Bucket</text>
            <text x="230" y="412" fill="#15803d" fontSize="10" textAnchor="middle">uploads/ · exports/ · eval/</text>
            <path d="M 130 312 L 190 370" stroke="#94a3b8" strokeWidth="1.5" />
            <path d="M 330 312 L 260 370" stroke="#94a3b8" strokeWidth="1.5" />
            <rect x="520" y="260" width="180" height="52" rx="10" fill="#ffffff" stroke="#e11d48" strokeWidth="1.5" />
            <text x="610" y="283" fill="#0f172a" fontSize="12" fontWeight="bold" textAnchor="middle">analyze &amp; presign Lambdas</text>
            <text x="610" y="300" fill="#be123c" fontSize="10" textAnchor="middle">Uploads &amp; Hazard Inspection</text>
            <path d="M 510 228 L 580 260" stroke="#0284c7" strokeWidth="1.5" />
            <rect x="730" y="260" width="190" height="52" rx="10" fill="#fff1f2" stroke="#e11d48" strokeWidth="2" />
            <text x="825" y="283" fill="#881337" fontSize="13" fontWeight="bold" textAnchor="middle">Amazon Bedrock</text>
            <text x="825" y="300" fill="#be123c" fontSize="10" textAnchor="middle">Nova 2 Lite (Converse)</text>
            <path d="M 700 286 L 730 286" stroke="#e11d48" strokeWidth="1.5" />
            <rect x="510" y="340" width="190" height="62" rx="10" fill="#ffffff" stroke="#9333ea" strokeWidth="1.5" />
            <text x="605" y="365" fill="#0f172a" fontSize="13" fontWeight="bold" textAnchor="middle">Amazon DynamoDB</text>
            <text x="605" y="382" fill="#7e22ce" fontSize="10" textAnchor="middle">Cases · CaseEvents · Assets</text>
            <rect x="730" y="340" width="190" height="62" rx="10" fill="#ffffff" stroke="#d97706" strokeWidth="1.5" />
            <text x="825" y="365" fill="#0f172a" fontSize="13" fontWeight="bold" textAnchor="middle">Step Functions</text>
            <text x="825" y="382" fill="#b45309" fontSize="10" textAnchor="middle">4-Rung Escalation Flow</text>
            <path d="M 610 312 L 610 340" stroke="#94a3b8" strokeWidth="1.5" />
            <path d="M 700 371 L 730 371" stroke="#d97706" strokeWidth="1.5" />
            <rect x="620" y="425" width="280" height="52" rx="10" fill="#ffffff" stroke="#64748b" strokeWidth="1.5" />
            <text x="760" y="448" fill="#0f172a" fontSize="12" fontWeight="bold" textAnchor="middle">Strands Notice Agent → SES</text>
            <text x="760" y="464" fill="#64748b" fontSize="10" textAnchor="middle">[DRY-RUN] Dispatch to Sandbox</text>
            <path d="M 825 402 L 825 425" stroke="#d97706" strokeWidth="1.5" />
          </svg>
        </div>

        <div className="space-y-2 text-[11px] text-slate-700">
          <div className="p-3 rounded-2xl bg-white border border-slate-200">
            <span className="font-bold text-sky-700 block mb-0.5">Predict Pipeline</span>
            Open-Meteo rainfall and elevation feed the expert-prior susceptibility model. Scores cache to S3 and reach the map via HTTP API.
          </div>
          <div className="p-3 rounded-2xl bg-white border border-slate-200">
            <span className="font-bold text-rose-700 block mb-0.5">Enforce Pipeline</span>
            Citizen reports are vision-inspected by Nova 2 Lite, resolved against road records, and tracked through a 4-rung Step Functions workflow with SES dry-run notices.
          </div>
        </div>

        <button onClick={onClose} className="w-full py-3 rounded-xl bg-[#0c192c] text-white font-bold text-xs shadow-md">
          Close
        </button>
      </div>
    </div>
  );
};
