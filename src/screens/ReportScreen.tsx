import React, { useEffect, useState } from 'react';
import type {
  AssetType,
  CaseRecord,
  HazardAnalysis,
  Hotspot,
  Jurisdiction,
  TimerProfile,
  Warranty,
} from '../api/types';
import {
  analyzeHazard,
  createCase,
  presignUpload,
  putToUploadUrl,
  resizeImage,
  resolveLocation,
} from '../api/client';
import { AlertTriangle, Camera, Clock, MapPin, Navigation, RefreshCw, ShieldCheck, Sparkles, Upload } from 'lucide-react';

interface ReportScreenProps {
  hotspots: Hotspot[];
  presetHotspot: Hotspot | null;
  pickedLocation: { lat: number; lng: number } | null;
  onStartPickLocation: () => void;
  onCaseCreated: (c: CaseRecord) => void;
}

const VALID_ASSET_TYPES: AssetType[] = ['open_manhole', 'missing_drain_cover', 'pothole'];

export const ReportScreen: React.FC<ReportScreenProps> = ({
  hotspots,
  presetHotspot,
  pickedLocation,
  onStartPickLocation,
  onCaseCreated,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [photoKey, setPhotoKey] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<HazardAnalysis | null>(null);

  const [locationType, setLocationType] = useState<'hotspot' | 'geolocation' | 'picked'>('hotspot');
  const [selectedHotspotId, setSelectedHotspotId] = useState<string>(
    presetHotspot?.hotspot_id || hotspots[0]?.hotspot_id || '',
  );
  const [customLat, setCustomLat] = useState(28.633);
  const [customLng, setCustomLng] = useState(77.22);

  const [isResolving, setIsResolving] = useState(false);
  const [resolvedChain, setResolvedChain] = useState<{
    road: Hotspot['road'];
    jurisdiction: Jurisdiction;
    warranty: Warranty;
  } | null>(null);

  const [timerProfile, setTimerProfile] = useState<TimerProfile>('demo');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Preset hotspot from detail sheet / corridors
  useEffect(() => {
    if (presetHotspot) {
      setSelectedHotspotId(presetHotspot.hotspot_id);
      setLocationType('hotspot');
      if (presetHotspot.road && presetHotspot.jurisdiction && presetHotspot.warranty) {
        setResolvedChain({
          road: presetHotspot.road,
          jurisdiction: presetHotspot.jurisdiction,
          warranty: presetHotspot.warranty,
        });
      }
    }
  }, [presetHotspot]);

  // Map-picked location
  useEffect(() => {
    if (pickedLocation) {
      setLocationType('picked');
      setCustomLat(pickedLocation.lat);
      setCustomLng(pickedLocation.lng);
      void handleResolve(pickedLocation.lat, pickedLocation.lng, analysis?.hazard_type || null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pickedLocation]);

  const handleResolve = async (lat: number, lng: number, hazardType: string | null) => {
    setIsResolving(true);
    try {
      const res = await resolveLocation(lat, lng, hazardType);
      setResolvedChain({ road: res.road, jurisdiction: res.jurisdiction, warranty: res.warranty });
    } catch (err) {
      // Fall back to the selected hotspot's embedded chain when offline
      const hs = hotspots.find((h) => h.hotspot_id === selectedHotspotId);
      if (hs?.road && hs?.jurisdiction && hs?.warranty) {
        setResolvedChain({ road: hs.road, jurisdiction: hs.jurisdiction, warranty: hs.warranty });
      }
      console.error('Resolve error:', err);
    } finally {
      setIsResolving(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    try {
      setIsUploading(true);
      const resized = await resizeImage(file, 1280, 0.85);
      const presign = await presignUpload('report', 'image/jpeg');
      await putToUploadUrl(presign.upload_url, resized, 'image/jpeg');
      setPhotoKey(presign.s3_key);
      setIsUploading(false);
      setIsAnalyzing(true);
      const result = await analyzeHazard(presign.s3_key);
      setAnalysis(result.analysis);
      let lat = customLat;
      let lng = customLng;
      if (locationType === 'hotspot') {
        const hs = hotspots.find((h) => h.hotspot_id === selectedHotspotId);
        if (hs) {
          lat = hs.lat;
          lng = hs.lng;
        }
      }
      await handleResolve(lat, lng, result.analysis.hazard_type);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error uploading or analyzing photo');
    } finally {
      setIsUploading(false);
      setIsAnalyzing(false);
    }
  };

  const handleUseGeolocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported on this device. Choose a hotspot instead.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocationType('geolocation');
        setCustomLat(pos.coords.latitude);
        setCustomLng(pos.coords.longitude);
        void handleResolve(pos.coords.latitude, pos.coords.longitude, analysis?.hazard_type || null);
      },
      () => {
        setError('Could not retrieve device location. Choose a hotspot or pick on the map.');
      },
    );
  };

  const handleSubmit = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      let lat = customLat;
      let lng = customLng;
      let hotspotId: string | undefined;
      if (locationType === 'hotspot') {
        const hs = hotspots.find((h) => h.hotspot_id === selectedHotspotId);
        if (hs) {
          lat = hs.lat;
          lng = hs.lng;
          hotspotId = hs.hotspot_id;
        }
      }
      const assetType = analysis && (VALID_ASSET_TYPES as string[]).includes(analysis.hazard_type)
        ? analysis.hazard_type
        : undefined;
      const created = await createCase({
        hotspot_id: hotspotId,
        lat,
        lng,
        asset_type: assetType ?? 'pothole',
        analysis: analysis || {
          hazard_type: 'unclear',
          severity: 3,
          submerged: false,
          confidence: 0.5,
          description: 'Citizen reported hazard (photo omitted or manual override)',
          visible_evidence: 'Manual citizen report',
        },
        ...(photoKey ? { photo_key: photoKey } : {}),
        timer_profile: timerProfile,
      });
      onCaseCreated(created);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create case');
    } finally {
      setIsSubmitting(false);
    }
  };

  const unconfirmed = analysis != null && (analysis.hazard_type === 'none' || analysis.hazard_type === 'unclear');

  return (
    <div className="p-4 space-y-4 pb-24">
      <div>
        <h2 className="text-lg font-bold text-slate-800">Report Road Hazard</h2>
        <p className="text-xs text-slate-500">
          Photo triage · Nova 2 Lite verification · Escalation initiation
        </p>
      </div>

      {/* Step 1: Photo */}
      <div className="space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block">
          1. Hazard Photo (optional for hotspots)
        </span>
        <div className="flex items-center space-x-3">
          <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 hover:border-sky-500 rounded-2xl p-4 cursor-pointer bg-white transition">
            <Upload className="w-6 h-6 text-sky-600 mb-1.5" />
            <span className="text-xs font-bold text-slate-800 text-center">
              {selectedFile ? selectedFile.name : 'Take photo or upload (JPEG / PNG)'}
            </span>
            <span className="text-[11px] text-slate-400 mt-0.5">Auto-resized to max 1280px</span>
            <input type="file" accept="image/jpeg,image/png" capture="environment" onChange={handleFileChange} className="hidden" />
          </label>
          {previewUrl && (
            <div className="w-20 h-20 rounded-2xl border border-slate-200 overflow-hidden bg-slate-100 flex-shrink-0">
              <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
            </div>
          )}
        </div>

        {isUploading && (
          <div className="flex items-center space-x-2 text-xs font-medium text-sky-600">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>Uploading resized image to S3…</span>
          </div>
        )}
        {isAnalyzing && (
          <div className="flex items-center space-x-2 text-xs font-medium text-amber-600">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>Analyzing with Nova 2 Lite…</span>
          </div>
        )}

        {analysis && (
          <div className="p-4 rounded-2xl bg-sky-50/40 border border-sky-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-sky-900 flex items-center gap-1">
                <Camera className="w-3.5 h-3.5 text-sky-600" />
                <span>Nova Hazard Assessment</span>
              </span>
              <span className="text-xs font-mono font-bold text-sky-700 bg-sky-100/70 px-2 py-0.5 rounded-full">
                {Math.round(analysis.confidence * 100)}% confidence
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-500">Type: </span>
                <span className="font-bold text-slate-900 capitalize">{analysis.hazard_type.replace(/_/g, ' ')}</span>
              </div>
              <div>
                <span className="text-slate-500">Submerged: </span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${analysis.submerged ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-slate-100 text-slate-700'}`}>
                  {analysis.submerged ? 'YES' : 'NO'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500">Severity:</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((dot) => (
                  <span key={dot} className={`w-2.5 h-2.5 rounded-full ${dot <= analysis.severity ? 'bg-rose-500' : 'bg-slate-200'}`} />
                ))}
                <span className="ml-1 font-mono font-bold text-slate-700">{analysis.severity}/5</span>
              </div>
            </div>
            <p className="text-xs text-slate-700">{analysis.description}</p>
            <p className="text-[11px] text-slate-500 italic">Visual evidence: {analysis.visible_evidence}</p>
            {unconfirmed && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>Nova could not confirm a hazard. You may still open a case if you believe one exists.</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Step 2: Location */}
      <div className="space-y-3">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block">2. Hazard Location</span>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => {
              setLocationType('hotspot');
              const hs = hotspots.find((h) => h.hotspot_id === selectedHotspotId);
              if (hs) void handleResolve(hs.lat, hs.lng, analysis?.hazard_type || null);
            }}
            className={`py-2 px-2 rounded-xl text-[11px] font-semibold border transition ${
              locationType === 'hotspot' ? 'bg-sky-50 border-sky-400 text-sky-950 font-bold' : 'bg-white text-slate-600 border-slate-200'
            }`}
          >
            Hotspot
          </button>
          <button
            type="button"
            onClick={handleUseGeolocation}
            className={`py-2 px-2 rounded-xl text-[11px] font-semibold border transition flex items-center justify-center gap-1 ${
              locationType === 'geolocation' ? 'bg-sky-50 border-sky-400 text-sky-950 font-bold' : 'bg-white text-slate-600 border-slate-200'
            }`}
          >
            <Navigation className="w-3 h-3 text-sky-600" />
            <span>My Location</span>
          </button>
          <button
            type="button"
            onClick={onStartPickLocation}
            className={`py-2 px-2 rounded-xl text-[11px] font-semibold border transition flex items-center justify-center gap-1 ${
              locationType === 'picked' ? 'bg-sky-50 border-sky-400 text-sky-950 font-bold' : 'bg-white text-slate-600 border-slate-200'
            }`}
          >
            <MapPin className="w-3 h-3 text-sky-600" />
            <span>Map Pin</span>
          </button>
        </div>

        {locationType === 'hotspot' && (
          <select
            value={selectedHotspotId}
            onChange={(e) => {
              setSelectedHotspotId(e.target.value);
              const hs = hotspots.find((h) => h.hotspot_id === e.target.value);
              if (hs) void handleResolve(hs.lat, hs.lng, analysis?.hazard_type || null);
            }}
            className="w-full py-2.5 px-3 rounded-xl bg-white border border-slate-300 text-xs text-slate-800"
          >
            {hotspots.map((hs) => (
              <option key={hs.hotspot_id} value={hs.hotspot_id}>
                {hs.name} ({hs.road?.name || 'Road unknown'})
              </option>
            ))}
          </select>
        )}

        {(locationType === 'geolocation' || locationType === 'picked') && (
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
            <div className="flex items-center justify-between">
              <span>Attested GPS:</span>
              <span className="font-mono font-bold text-sky-700">{customLat.toFixed(5)}, {customLng.toFixed(5)}</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Location is attested by the claimant.</p>
          </div>
        )}
      </div>

      {/* Step 3: Blame chain preview */}
      {resolvedChain && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">3. Accountability Preview</span>
            {isResolving && <span className="text-[11px] text-sky-600">Resolving…</span>}
          </div>
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 text-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="text-slate-500">Agency &amp; Officer:</span>
              <span className="font-bold text-slate-900 text-right">{resolvedChain.jurisdiction.owner} · {resolvedChain.jurisdiction.officer_role}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Contractor:</span>
              <span className="font-medium text-slate-800">{resolvedChain.warranty.contractor_label || 'Unassigned'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Warranty:</span>
              <span className="font-bold capitalize">{resolvedChain.warranty.status.replace(/_/g, ' ')}</span>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Timer profile */}
      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-600 block">4. Escalation Timers</span>
        <div className="flex items-center gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-200">
          <Clock className="w-5 h-5 text-sky-600 flex-shrink-0" />
          <div className="flex-1 text-xs">
            <span className="font-bold text-slate-900 block">
              {timerProfile === 'demo' ? 'Demo timers (20s per rung)' : 'Real timers (2-3 days per rung)'}
            </span>
            <span className="text-[10px] text-slate-500 block mt-0.5">
              Controls Step Functions progression speed before auto-escalating to higher officials
            </span>
          </div>
          <button
            type="button"
            onClick={() => setTimerProfile(timerProfile === 'demo' ? 'real' : 'demo')}
            className="py-1.5 px-3 rounded-lg text-[11px] font-bold bg-white text-slate-800 border border-slate-300"
          >
            Use {timerProfile === 'demo' ? 'Real' : 'Demo'}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">{error}</div>
      )}

      <button
        onClick={handleSubmit}
        disabled={isSubmitting}
        className="w-full py-3.5 rounded-xl bg-[#0c192c] text-white font-bold text-sm shadow-md active:scale-[0.99] transition disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isSubmitting ? (
          <span>Opening case…</span>
        ) : (
          <>
            {unconfirmed ? <AlertTriangle className="w-4 h-4 text-amber-400" /> : <ShieldCheck className="w-4 h-4 text-sky-400" />}
            <span>{unconfirmed ? 'Open Case Anyway' : 'Submit & Open Escalation'}</span>
          </>
        )}
      </button>
    </div>
  );
};
