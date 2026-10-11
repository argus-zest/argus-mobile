/** Risk band -> colour mapping. Matches web app + SPEC section 13. */
export function getBandColor(band: string): string {
  switch (band) {
    case 'severe':
      return '#ef4444';
    case 'high':
      return '#f97316';
    case 'moderate':
      return '#eab308';
    case 'low':
    default:
      return '#22c55e';
  }
}

/** Hazard asset type -> stroke colour. Matches web app. */
export function getHazardColor(type: string): string {
  switch (type) {
    case 'open_manhole':
      return '#f43f5e';
    case 'missing_drain_cover':
      return '#a855f7';
    case 'pothole':
      return '#facc15';
    default:
      return '#94a3b8';
  }
}

export interface ParsedApiError {
  code: string;
  message: string;
  statusCode: number;
}

/**
 * Parse a backend error payload of shape {error:{code,message}}.
 * Falls back to INTERNAL / 'Unexpected server response'.
 * Typed adapter: the only place `any` JSON crosses into typed code.
 */
export function parseApiError(payload: unknown, statusCode: number): ParsedApiError {
  if (
    typeof payload === 'object' &&
    payload !== null &&
    'error' in payload &&
    typeof (payload as { error: unknown }).error === 'object' &&
    (payload as { error: unknown }).error !== null
  ) {
    const inner = (payload as { error: { code?: unknown; message?: unknown } }).error;
    if (typeof inner.code === 'string' && typeof inner.message === 'string') {
      return { code: inner.code, message: inner.message, statusCode };
    }
  }
  return { code: 'INTERNAL', message: 'Unexpected server response', statusCode };
}

/** Debounce helper. Matches web app semantics (coalesces rapid calls). */
export function debounce<T extends unknown[]>(
  fn: (...args: T) => void,
  ms: number,
): ((...args: T) => void) & { cancel: () => void } {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const run = (...args: T): void => {
    if (timer !== undefined) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
  run.cancel = (): void => {
    if (timer !== undefined) clearTimeout(timer);
  };
  return run;
}

/** Human reason text for claim-fix API reasons. Matches web case view. */
export function claimReasonText(reason: string): string {
  switch (reason) {
    case 'VERIFIED':
      return 'Verified closed';
    case 'TOO_FAR':
      return 'Photo location is more than 25 m from the hazard';
    case 'HAZARD_STILL_PRESENT':
      return 'Nova still sees the hazard — case escalates';
    case 'LOCATION_MISMATCH':
      return 'Photo does not appear to show the same spot';
    case 'LOW_CONFIDENCE':
      return 'Not confident enough to close';
    case 'CASE_NOT_OPEN':
      return 'Case is not open for fix claims';
    default:
      return reason;
  }
}
