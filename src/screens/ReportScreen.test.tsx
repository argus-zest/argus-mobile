/** @vitest-environment jsdom */
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { ReportScreen } from './ReportScreen';
import { MOCK_MOBILE_HOTSPOTS } from '../mocks/data';

function renderReport() {
  return render(
    <ReportScreen
      hotspots={MOCK_MOBILE_HOTSPOTS}
      presetHotspot={null}
      pickedLocation={null}
      onStartPickLocation={vi.fn()}
      onCaseCreated={vi.fn()}
    />,
  );
}

describe('ReportScreen', () => {
  it('renders all four reporting steps', () => {
    renderReport();
    expect(screen.getByText(/1\. Hazard Photo/)).toBeInTheDocument();
    expect(screen.getByText(/2\. Hazard Location/)).toBeInTheDocument();
    expect(screen.getByText(/4\. Escalation Timers/)).toBeInTheDocument();
  });

  it('offers hotspot, geolocation, and map-pin location modes', () => {
    renderReport();
    expect(screen.getByText('Hotspot')).toBeInTheDocument();
    expect(screen.getByText('My Location')).toBeInTheDocument();
    expect(screen.getByText('Map Pin')).toBeInTheDocument();
  });

  it('enters map-pick mode through the parent handler', () => {
    const onStartPickLocation = vi.fn();
    render(
      <ReportScreen
        hotspots={MOCK_MOBILE_HOTSPOTS}
        presetHotspot={null}
        pickedLocation={null}
        onStartPickLocation={onStartPickLocation}
        onCaseCreated={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByText('Map Pin'));
    expect(onStartPickLocation).toHaveBeenCalled();
  });

  it('surfaces backend errors instead of fabricating a case', async () => {
    const onCaseCreated = vi.fn();
    render(
      <ReportScreen
        hotspots={MOCK_MOBILE_HOTSPOTS}
        presetHotspot={null}
        pickedLocation={null}
        onStartPickLocation={vi.fn()}
        onCaseCreated={onCaseCreated}
      />,
    );
    fireEvent.click(screen.getByText('Submit & Open Escalation'));
    expect(await screen.findByText(/API is not configured/)).toBeInTheDocument();
    expect(onCaseCreated).not.toHaveBeenCalled();
  });

  it('switches escalation timer profiles', () => {
    renderReport();
    expect(screen.getByText(/Demo timers/)).toBeInTheDocument();
    fireEvent.click(screen.getByText('Use Real'));
    expect(screen.getByText(/Real timers/)).toBeInTheDocument();
  });
});
