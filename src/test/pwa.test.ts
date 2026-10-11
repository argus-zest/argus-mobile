/* PWA invariant guards (run in CI): manifest validity, icon assets,
 * service-worker cache policy, and installability meta tags. */
import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = join(__dirname, '..', '..');

function pngDimensions(path: string): { width: number; height: number } {
  const buf = readFileSync(path);
  expect(buf.subarray(1, 4).toString()).toBe('PNG');
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

describe('PWA readiness invariants', () => {
  it('ships a valid installable manifest', () => {
    const manifest = JSON.parse(
      readFileSync(join(ROOT, 'public', 'manifest.webmanifest'), 'utf8'),
    ) as {
      display: string;
      start_url: string;
      icons: Array<{ src: string; sizes: string }>;
    };
    expect(manifest.display).toBe('standalone');
    expect(manifest.start_url).toBe('/');
    const sizes = manifest.icons.map((i) => i.sizes);
    expect(sizes).toContain('192x192');
    expect(sizes).toContain('512x512');
    for (const icon of manifest.icons) {
      expect(existsSync(join(ROOT, 'public', icon.src.replace(/^\//, '')))).toBe(true);
    }
  });

  it('ships correctly sized icons', () => {
    expect(pngDimensions(join(ROOT, 'public', 'icons', 'icon-192.png'))).toEqual({
      width: 192,
      height: 192,
    });
    expect(pngDimensions(join(ROOT, 'public', 'icons', 'icon-512.png'))).toEqual({
      width: 512,
      height: 512,
    });
    expect(pngDimensions(join(ROOT, 'public', 'icons', 'maskable-512.png'))).toEqual({
      width: 512,
      height: 512,
    });
    expect(pngDimensions(join(ROOT, 'public', 'apple-touch-icon.png'))).toEqual({
      width: 180,
      height: 180,
    });
  });

  it('service worker caches shell/tiles but never API traffic', () => {
    const sw = readFileSync(join(ROOT, 'public', 'sw.js'), 'utf8');
    expect(sw).toContain('STATIC_HOSTS');
    expect(sw).toContain("caches.match('/index.html')");
    expect(sw).toContain('skipWaiting');
    for (const api of ['/v1/', 'presign', '/cases', '/analyze']) {
      expect(sw).not.toContain(api);
    }
  });

  it('index.html links the manifest and keeps browser zoom accessible', () => {
    const html = readFileSync(join(ROOT, 'index.html'), 'utf8');
    expect(html).toContain('rel="manifest"');
    expect(html).toContain('apple-touch-icon');
    expect(html).toContain('viewport-fit=cover');
    // Accessibility: pinch-zoom must not be disabled for MapLibre's sake.
    expect(html).not.toContain('user-scalable=no');
    expect(html).not.toContain('maximum-scale');
  });

  it('service worker registers in production builds only', () => {
    const main = readFileSync(join(ROOT, 'src', 'main.tsx'), 'utf8');
    expect(main).toContain("navigator.serviceWorker.register('/sw.js')");
    expect(main).toContain('import.meta.env.PROD');
  });
});
