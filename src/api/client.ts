import type {
  CaseEvent,
  CaseRecord,
  ClaimFixResult,
  EvalResultsResponse,
  GroundAsset,
  HazardAnalysis,
  Hotspot,
  Jurisdiction,
  RiskResponse,
  TimerProfile,
  Warranty,
} from './types';
import { parseApiError } from './utils';

function apiBase(): string {
  const base = import.meta.env.VITE_API_BASE as string | undefined;
  if (!base) throw new Error('API is not configured. Set VITE_API_BASE and restart the app.');
  return base.replace(/\/$/, '');
}

async function readJson(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

function throwApiError(payload: unknown, status: number): never {
  const parsed = parseApiError(payload, status);
  const err = new Error(parsed.message) as Error & { code: string; statusCode: number };
  err.code = parsed.code;
  err.statusCode = status;
  throw err;
}

async function get<T>(path: string): Promise<T> {
  const response = await fetch(`${apiBase()}${path}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  const payload = await readJson(response);
  if (!response.ok) throwApiError(payload, response.status);
  return payload as T;
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${apiBase()}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const payload = await readJson(response);
  if (!response.ok) throwApiError(payload, response.status);
  return payload as T;
}

export async function fetchHealth(): Promise<{ status: string; time: string }> {
  return get('/health');
}

export async function fetchHotspots(): Promise<{ hotspots: Hotspot[]; mock?: boolean }> {
  return get('/hotspots');
}

export async function fetchAssets(): Promise<{ assets: GroundAsset[]; mock?: boolean }> {
  return get('/assets');
}

export async function fetchRisk(
  mode: 'whatif' | 'live',
  rain3h: number,
  rain24h: number,
  trafficPercent: number,
): Promise<RiskResponse> {
  const traffic = trafficPercent / 100;
  return get(
    `/risk?mode=${mode}&rain_3h_mm=${rain3h}&rain_prev24h_mm=${rain24h}&traffic_slowdown=${traffic}`,
  );
}

export interface PresignResult {
  upload_url: string;
  s3_key: string;
  expires_in: number;
}

export async function presignUpload(
  purpose: 'report' | 'fix',
  contentType: 'image/jpeg' | 'image/png',
): Promise<PresignResult> {
  return post('/uploads/presign', { purpose, content_type: contentType });
}

/** PUT raw bytes to a presigned S3 URL with a matching Content-Type. */
export async function putToUploadUrl(
  uploadUrl: string,
  blob: Blob,
  contentType: 'image/jpeg' | 'image/png',
): Promise<void> {
  const response = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': contentType },
    body: blob,
  });
  if (!response.ok) throw new Error('Photo upload failed. Please retry.');
}

export async function analyzeHazard(s3Key: string): Promise<{ analysis: HazardAnalysis }> {
  return post('/analyze', { s3_key: s3Key });
}

export async function resolveLocation(
  lat: number,
  lng: number,
  assetType: string | null,
): Promise<{ road: Hotspot['road']; jurisdiction: Jurisdiction; warranty: Warranty }> {
  return post('/resolve', { lat, lng, asset_type: assetType });
}

export interface CreateCasePayload {
  hotspot_id?: string;
  lat: number;
  lng: number;
  asset_type?: string;
  analysis?: HazardAnalysis;
  photo_key?: string;
  timer_profile: TimerProfile;
}

export async function createCase(payload: CreateCasePayload): Promise<CaseRecord> {
  return post('/cases', payload);
}

export async function fetchCases(): Promise<{ cases: CaseRecord[] }> {
  return get('/cases');
}

export async function fetchCaseDetails(
  caseId: string,
): Promise<{ case: CaseRecord; events: CaseEvent[]; photo_url?: string }> {
  return get(`/cases/${encodeURIComponent(caseId)}`);
}

export async function claimFix(
  caseId: string,
  s3Key: string,
  lat: number,
  lng: number,
): Promise<ClaimFixResult> {
  return post(`/cases/${encodeURIComponent(caseId)}/claim-fix`, {
    s3_key: s3Key,
    lat,
    lng,
  });
}

export async function extractTenderClause(docKey: string): Promise<{
  found: boolean;
  quote: string;
  page_hint: string;
  verified_in_text: boolean | null;
}> {
  return post('/tender/clause', { doc_key: docKey });
}

export async function fetchEvalResults(): Promise<EvalResultsResponse> {
  return get('/eval/results');
}

/** Resize an image file so the long edge <= 1280px, JPEG quality 0.85. */
export function resizeImage(file: File, maxDim = 1280, quality = 0.85): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      let width = img.width;
      let height = img.height;
      URL.revokeObjectURL(objectUrl);
      if (width > maxDim || height > maxDim) {
        if (width > height) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context failed'));
        return;
      }
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Canvas toBlob failed'));
        },
        'image/jpeg',
        quality,
      );
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Could not read this image. Choose another JPEG or PNG.'));
    };
    img.src = objectUrl;
  });
}
