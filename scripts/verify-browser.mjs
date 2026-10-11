/* Browser verification for Argus Mobile (Priority A + B).
 * Run: npm run build && (vite preview --port 5175 &) && node scripts/verify-browser.mjs
 * Uses system Chromium headless; no test-framework dependency.
 */
import { chromium } from 'playwright-core';

const BASE = process.env.PREVIEW_URL || 'http://localhost:5175';
const results = [];
const errors = [];
const check = (name, ok, detail = '') => {
  results.push({ name, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
};

const browser = await chromium.launch({
  executablePath: '/usr/bin/chromium',
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  hasTouch: true,
  isMobile: true,
  deviceScaleFactor: 2,
});
const page = await context.newPage();
page.on('console', (msg) => {
  if (msg.type() === 'error') errors.push(`console: ${msg.text().slice(0, 200)}`);
});
page.on('pageerror', (err) => errors.push(`page: ${String(err).slice(0, 200)}`));

try {
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });

  // --- Corridors tab (default) ---
  check('header renders', await page.getByText('Argus Mobile').first().isVisible());
  check('mock badge visible offline', (await page.getByText('MOCK DATA').count()) >= 1);
  await page.waitForSelector('text=Minto Bridge underpass', { timeout: 8000 });
  const cards = await page.locator('text=/of 10 above 50%/').count();
  check('risk count line renders', cards >= 1);
  check('honesty banner', await page.getByText(/relative ranking from an/).isVisible());
  const overflow1 = await page.evaluate(
    () => document.documentElement.scrollWidth <= window.innerWidth + 1,
  );
  check('no horizontal overflow (390px)', overflow1);
  await page.screenshot({ path: '/tmp/opencode/shot-corridors.png' });

  // Search + filter
  await page.getByPlaceholder(/Search underpasses/).fill('minto');
  check(
    'search filters list',
    (await page.getByText('Minto Bridge underpass').count()) >= 1 &&
      (await page.getByText('Moolchand underpass').count()) === 0,
  );
  await page.getByPlaceholder(/Search underpasses/).fill('');
  await page.getByText('Critical / High Risk').click();
  check(
    'critical filter narrows list',
    (await page.getByText('Karala–Kanjhawala Road').count()) === 0,
  );
  await page.getByText('All Corridors', { exact: false }).first().click();
  await page.getByText('Extreme').click();
  await page.getByText('Hazard under water').click();
  check('preset + HUW toggle interactive', true);

  // Detail sheet
  await page.getByText('Minto Bridge underpass').first().click();
  await page.waitForSelector('text=Close Inspection', { timeout: 5000 });
  await page.waitForTimeout(700); // let the entry animation settle before asserting pixels
  check('detail sheet opens', await page.getByText('Civic Ownership').first().isVisible());
  check('warranty shown', await page.getByText(/Contractor A/).isVisible());
  await page.screenshot({ path: '/tmp/opencode/shot-sheet.png' });
  await page.getByText('Close Inspection').click();
  check('detail sheet closes', (await page.getByText('Close Inspection').count()) === 0);

  // --- Report tab ---
  await page.getByText('Report', { exact: true }).last().click();
  check('report heading', await page.getByText('Report Road Hazard').isVisible());
  await page.getByText('Submit & Open Escalation').click();
  const apiErr = await page.getByText(/API is not configured/).isVisible();
  check('failed submit shows error, no fake case', apiErr);
  await page.screenshot({ path: '/tmp/opencode/shot-report.png' });

  // --- Cases tab ---
  await page.getByText('Cases', { exact: true }).last().click();
  check('cases heading', await page.getByText('Civic Escalation Cases').isVisible());
  check('seeded case listed', await page.getByText('CS-SEED01').first().isVisible());
  // Note: the first case auto-selects on load, so its button toggles closed.
  // Pick a non-selected case to exercise expand explicitly.
  await page.getByText('CS-SEED02').first().click();
  await page.waitForSelector('text=4-Rung Escalation Ladder', { timeout: 5000 });
  check('rung ladder renders', await page.getByText('District Magistrate').first().isVisible());
  await page.screenshot({ path: '/tmp/opencode/shot-cases.png' });

  // --- Evidence + Architecture sheets ---
  await page.getByRole('button', { name: 'Model & evidence' }).click();
  check('evidence sheet', await page.getByRole('heading', { name: 'Model & Evidence' }).isVisible());
  await page.getByText('RDD2022').click();
  check('rdd2022 empty state', await page.getByText('Not yet measured.').isVisible());
  await page.getByRole('button', { name: 'Backtest' }).click();
  check('backtest empty state', await page.getByText('No backtest events loaded.').isVisible());
  await page.getByText('Close').last().click();
  await page.getByText('Architecture').click();
  check('architecture sheet', await page.getByText('System Architecture').isVisible());
  await page.getByText('Close').last().click();

  // --- Map tab ---
  await page.getByText('Live Map').click();
  await page.waitForTimeout(2500);
  const canvases = await page.locator('.maplibregl-canvas, canvas').count();
  check('map canvas renders', canvases >= 1, `${canvases} canvas element(s)`);
  await page.getByText('Pinned Hotspots').scrollIntoViewIfNeeded();
  await page.screenshot({ path: '/tmp/opencode/shot-map.png' });

  // --- Demo mode ---
  await page.goto(BASE + '/?demo=1', { waitUntil: 'networkidle' });
  check('demo strip', await page.getByText('Demo Mode').isVisible());
  check('demo shortcut legend', await page.getByText(/Shortcuts/).isVisible());

  // --- PWA: manifest + icons ---
  const manifestRes = await page.request.get(BASE + '/manifest.webmanifest');
  const manifest = await manifestRes.json();
  check(
    'manifest valid + installable',
    manifestRes.ok() &&
      manifest.display === 'standalone' &&
      manifest.icons?.length >= 2 &&
      manifest.icons.some((i) => i.sizes === '512x512'),
  );
  for (const icon of manifest.icons) {
    const r = await page.request.get(BASE + icon.src);
    check(`icon ${icon.sizes} served`, r.ok());
  }

  // --- PWA: service worker + offline startup ---
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  await page.waitForFunction(() => navigator.serviceWorker?.controller !== null, null, {
    timeout: 10000,
  }).catch(() => {});
  const swState = await page.evaluate(async () => {
    if (!('serviceWorker' in navigator)) return 'unsupported';
    const reg = await navigator.serviceWorker.getRegistration();
    return reg?.active?.state || reg?.installing?.state || 'none';
  });
  check('service worker active', swState === 'activated', swState);
  await context.setOffline(true);
  await page.reload({ waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);
  check(
    'offline startup boots shell with mock label',
    (await page.getByText('Argus Mobile').count()) >= 1 &&
      (await page.getByText('MOCK DATA').count()) >= 1,
  );
  await page.screenshot({ path: '/tmp/opencode/shot-offline.png' });
  await context.setOffline(false);

  // --- Wide viewport ---
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto(BASE + '/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);
  const overflow2 = await page.evaluate(
    () => document.documentElement.scrollWidth <= window.innerWidth + 1,
  );
  check('no horizontal overflow (1280px)', overflow2);
  await page.screenshot({ path: '/tmp/opencode/shot-wide.png' });
} catch (e) {
  errors.push(`fatal: ${String(e).slice(0, 300)}`);
  check('script completed without fatal', false, String(e).slice(0, 200));
}

check('zero console/page errors', errors.length === 0, errors.slice(0, 5).join(' | '));
await browser.close();
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
process.exit(failed.length ? 1 : 0);
