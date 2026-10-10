import React, { useState } from 'react';
import { Camera, MapPin, Upload, CheckCircle2 } from 'lucide-react';

export const ReportScreen: React.FC = () => {
  const [selectedType, setSelectedType] = useState('open_manhole');
  const [description, setDescription] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [coords] = useState<{ lat: number; lng: number }>({ lat: 28.6330, lng: 77.2200 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedCase, setSubmittedCase] = useState<string | null>(null);

  const hazardTypes = [
    { id: 'open_manhole', label: 'Open Manhole', icon: '⚠️' },
    { id: 'broken_grate', label: 'Broken Drain Grate', icon: '🕳️' },
    { id: 'pothole', label: 'Deep Pothole', icon: '🛑' },
    { id: 'submerged_curb', label: 'Submerged Curb', icon: '🌊' },
  ];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate Nova 2 Lite visual inspection & civic case creation
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmittedCase(`CASE-2026-DEL-${Math.floor(100 + Math.random() * 900)}`);
    }, 1200);
  };

  const handleReset = () => {
    setSubmittedCase(null);
    setImagePreview(null);
    setDescription('');
  };

  if (submittedCase) {
    return (
      <div className="p-4 flex flex-col items-center justify-center min-h-[70vh] text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Hazard Report Dispatched</h2>
        <p className="text-xs text-slate-500 mt-1 max-w-xs">
          Amazon Nova 2 Lite verified hazard features. Civic notice queued for responsible authority.
        </p>

        <div className="mt-4 p-3 bg-white rounded-xl border border-slate-200 w-full max-w-xs shadow-2xs">
          <div className="text-[11px] text-slate-400 uppercase font-semibold">Assigned Case ID</div>
          <div className="text-base font-mono font-bold text-slate-800 mt-0.5">{submittedCase}</div>
          <div className="text-[11px] text-amber-700 font-semibold bg-amber-50 rounded px-2 py-0.5 mt-2 inline-block">
            Escalation Level: AE (Assistant Engineer)
          </div>
        </div>

        <button
          onClick={handleReset}
          className="mt-6 w-full max-w-xs py-3 rounded-xl bg-[#0c192c] text-white font-semibold text-sm shadow-md"
        >
          Submit Another Report
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4 pb-24">
      <div>
        <h2 className="text-lg font-bold text-slate-800">Report Road Hazard</h2>
        <p className="text-xs text-slate-500">
          Upload photo for Amazon Bedrock AI vision inspection &amp; civic liability escalation.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Photo Upload Area */}
        <div className="relative">
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Hazard Photo (Camera Capture)
          </label>
          <div className="relative border-2 border-dashed border-slate-300 rounded-2xl p-4 text-center bg-white hover:bg-slate-50 transition overflow-hidden">
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-44 object-cover rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => setImagePreview(null)}
                  className="absolute top-2 right-2 px-2.5 py-1 bg-black/70 text-white text-xs rounded-lg font-medium"
                >
                  Retake
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center py-6 cursor-pointer">
                <div className="w-12 h-12 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center mb-2">
                  <Camera className="w-6 h-6" />
                </div>
                <span className="text-xs font-semibold text-slate-800">Take Photo or Upload</span>
                <span className="text-[11px] text-slate-400 mt-0.5">Supports PNG, JPG, HEIC</span>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
        </div>

        {/* Hazard Type Selector */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Hazard Classification
          </label>
          <div className="grid grid-cols-2 gap-2">
            {hazardTypes.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setSelectedType(t.id)}
                className={`flex items-center space-x-2 p-2.5 rounded-xl border text-xs font-semibold transition ${
                  selectedType === t.id
                    ? 'border-sky-500 bg-sky-50/70 text-sky-900 shadow-2xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                <span className="text-base">{t.icon}</span>
                <span>{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* GPS Coordinates */}
        <div className="bg-white p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <MapPin className="w-4 h-4 text-rose-500" />
            <div>
              <span className="font-semibold text-slate-800">Pinpoint Location:</span>
              <span className="font-mono text-slate-500 ml-1.5">{coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}</span>
            </div>
          </div>
          <span className="text-[10px] font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
            Auto-GPS
          </span>
        </div>

        {/* Description Note */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Optional Notes / Landmark
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. Near bus stop underpass entrance, cover dislodged..."
            rows={2}
            className="w-full text-xs p-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3.5 rounded-xl bg-[#0c192c] hover:bg-[#162740] text-white font-bold text-sm shadow-md active:scale-[0.99] transition disabled:opacity-50 flex items-center justify-center space-x-2"
        >
          {isSubmitting ? (
            <span>Analyzing with Amazon Nova...</span>
          ) : (
            <>
              <Upload className="w-4 h-4 text-sky-400" />
              <span>Submit Hazard Report</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
