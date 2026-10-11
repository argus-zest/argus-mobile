/** @vitest-environment jsdom */
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { CasesScreen } from './CasesScreen';
import { MOCK_MOBILE_CASES } from '../mocks/data';

function renderCases() {
  return render(
    <CasesScreen
      initialCases={MOCK_MOBILE_CASES}
      activeCaseId={null}
      onSelectCase={vi.fn()}
      isMock
      refreshSignal={0}
    />,
  );
}

describe('CasesScreen (offline preview)', () => {
  it('lists seeded cases with backend status chips', () => {
    renderCases();
    expect(screen.getByText('CS-SEED01')).toBeInTheDocument();
    expect(screen.getByText('AWAITING_FIX')).toBeInTheDocument();
    expect(screen.getByText('ESCALATED_DM')).toBeInTheDocument();
    expect(screen.getAllByText('SEEDED').length).toBeGreaterThan(0);
  });

  it('marks data as an offline preview, never live', () => {
    renderCases();
    expect(screen.getByText('MOCK DATA')).toBeInTheDocument();
    expect(screen.getByText(/offline preview/)).toBeInTheDocument();
  });

  it('expands a 4-rung ladder on selection', () => {
    const onSelectCase = vi.fn();
    render(
      <CasesScreen
        initialCases={MOCK_MOBILE_CASES}
        activeCaseId="CS-SEED01"
        onSelectCase={onSelectCase}
        isMock
        refreshSignal={0}
      />,
    );
    expect(screen.getByText('4-Rung Escalation Ladder')).toBeInTheDocument();
    expect(screen.getByText('Executive Engineer')).toBeInTheDocument();
    expect(screen.getByText('District Magistrate')).toBeInTheDocument();
  });

  it('requires a repair photo before claiming a fix', async () => {
    render(
      <CasesScreen
        initialCases={MOCK_MOBILE_CASES}
        activeCaseId="CS-SEED01"
        onSelectCase={vi.fn()}
        isMock
        refreshSignal={0}
      />,
    );
    fireEvent.click(screen.getByText('Verify Repair & Close Case'));
    expect(await screen.findByText('Attach a repair photo to verify the fix.')).toBeInTheDocument();
  });

  it('shows an empty state when there are no cases', () => {
    render(
      <CasesScreen
        initialCases={[]}
        activeCaseId={null}
        onSelectCase={vi.fn()}
        isMock
        refreshSignal={0}
      />,
    );
    expect(screen.getByText('No cases yet')).toBeInTheDocument();
  });
});
