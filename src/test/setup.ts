import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Vitest does not expose a global afterEach, so Testing Library's
// auto-cleanup never registers. Unmount explicitly between tests.
afterEach(() => {
  cleanup();
});
