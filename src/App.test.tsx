/** @vitest-environment jsdom */
import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import App from './App';

describe('App tab workflow (offline)', () => {
  it('boots into labelled mock mode with corridor rankings', async () => {
    render(<App />);
    expect(screen.getByText('Argus Mobile')).toBeInTheDocument();
    // Header + corridors banner both label mock data explicitly.
    expect(screen.getAllByText('MOCK DATA').length).toBeGreaterThanOrEqual(1);
    await waitFor(() => {
      expect(screen.getByText('Minto Bridge underpass')).toBeInTheDocument();
    });
  });

  it('navigates across report and cases tabs without errors', async () => {
    const onError = () => {};
    window.addEventListener('error', onError);
    render(<App />);
    fireEvent.click(screen.getByText('Report'));
    expect(screen.getByText('Report Road Hazard')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Cases'));
    expect(screen.getByText('Civic Escalation Cases')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Corridors'));
    await waitFor(() => {
      expect(screen.getByText('Minto Bridge underpass')).toBeInTheDocument();
    });
    window.removeEventListener('error', onError);
  });
});
