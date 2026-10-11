import { describe, expect, it, vi } from 'vitest';
import { claimReasonText, debounce, getBandColor, getHazardColor, parseApiError } from './utils';

describe('Mobile API utilities (parity with web reference)', () => {
  describe('Risk band colour mapping', () => {
    it('maps severe band to red (#ef4444)', () => {
      expect(getBandColor('severe')).toBe('#ef4444');
    });

    it('maps high band to orange (#f97316)', () => {
      expect(getBandColor('high')).toBe('#f97316');
    });

    it('maps moderate band to yellow (#eab308)', () => {
      expect(getBandColor('moderate')).toBe('#eab308');
    });

    it('maps low band to green (#22c55e)', () => {
      expect(getBandColor('low')).toBe('#22c55e');
    });

    it('maps unknown/default band to green (#22c55e)', () => {
      expect(getBandColor('unknown')).toBe('#22c55e');
    });
  });

  describe('Hazard asset colour mapping', () => {
    it('maps open_manhole to rose (#f43f5e)', () => {
      expect(getHazardColor('open_manhole')).toBe('#f43f5e');
    });

    it('maps missing_drain_cover to purple (#a855f7)', () => {
      expect(getHazardColor('missing_drain_cover')).toBe('#a855f7');
    });

    it('maps pothole to yellow (#facc15)', () => {
      expect(getHazardColor('pothole')).toBe('#facc15');
    });
  });

  describe('API error parsing', () => {
    it('extracts structured error code and message', () => {
      const payload = {
        error: {
          code: 'IMAGE_TOO_LARGE',
          message: 'Image exceeds maximum allowed size of 3.5 MB',
        },
      };
      const err = parseApiError(payload, 413);
      expect(err.code).toBe('IMAGE_TOO_LARGE');
      expect(err.message).toBe('Image exceeds maximum allowed size of 3.5 MB');
      expect(err.statusCode).toBe(413);
    });

    it('falls back gracefully on empty or unstructured payload', () => {
      const err = parseApiError(null, 500);
      expect(err.code).toBe('INTERNAL');
      expect(err.message).toBe('Unexpected server response');
      expect(err.statusCode).toBe(500);
    });
  });

  describe('Debounce utility', () => {
    it('delays execution and coalesces rapid invocations', async () => {
      vi.useFakeTimers();
      const fn = vi.fn();
      const debounced = debounce(fn, 200);

      debounced('call 1');
      debounced('call 2');
      debounced('call 3');

      expect(fn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(199);
      expect(fn).not.toHaveBeenCalled();

      vi.advanceTimersByTime(1);
      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn).toHaveBeenCalledWith('call 3');

      vi.useRealTimers();
    });
  });

  describe('Claim-fix reason text', () => {
    it('maps backend reasons to human text', () => {
      expect(claimReasonText('VERIFIED')).toBe('Verified closed');
      expect(claimReasonText('TOO_FAR')).toBe('Photo location is more than 25 m from the hazard');
      expect(claimReasonText('HAZARD_STILL_PRESENT')).toBe('Nova still sees the hazard — case escalates');
      expect(claimReasonText('LOCATION_MISMATCH')).toBe('Photo does not appear to show the same spot');
      expect(claimReasonText('LOW_CONFIDENCE')).toBe('Not confident enough to close');
    });
  });
});
