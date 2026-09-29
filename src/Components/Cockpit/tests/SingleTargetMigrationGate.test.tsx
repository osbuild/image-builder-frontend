import React from 'react';

import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { applyBlueprintSplits } from '@/store/api/backend/onprem/migrations/singleTarget/applyBlueprintSplits';

import SingleTargetMigrationGate from '../SingleTargetMigrationGate';

vi.mock(
  '@/store/api/backend/onprem/migrations/singleTarget/applyBlueprintSplits',
  () => ({ applyBlueprintSplits: vi.fn() }),
);

afterEach(() => vi.clearAllMocks());

describe('SingleTargetMigrationGate', () => {
  it('waits for the migration before showing its children', async () => {
    let completeMigration: () => void = () => {};
    vi.mocked(applyBlueprintSplits).mockReturnValue(
      new Promise((resolve) => {
        completeMigration = resolve;
      }),
    );

    render(
      <SingleTargetMigrationGate>
        <div>Blueprint list</div>
      </SingleTargetMigrationGate>,
    );

    expect(screen.queryByText('Blueprint list')).not.toBeInTheDocument();
    expect(
      screen.getByRole('status', { name: 'Updating blueprints' }),
    ).toHaveClass('pf-v6-c-empty-state', 'pf-m-full-height');
    expect(
      screen.getByText(
        'Updating existing blueprints to use one image target each.',
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('progressbar', { name: 'Updating blueprints' }),
    ).toHaveClass('pf-m-xl');
    await act(async () => completeMigration());
    expect(screen.getByText('Blueprint list')).toBeInTheDocument();
  });

  it('shows an error instead of the app when the migration fails', async () => {
    vi.mocked(applyBlueprintSplits).mockRejectedValue(
      new Error('could not write blueprint'),
    );

    render(
      <SingleTargetMigrationGate>
        <div>Blueprint list</div>
      </SingleTargetMigrationGate>,
    );

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveClass(
      'pf-v6-c-empty-state',
      'pf-m-full-height',
      'pf-m-danger',
    );
    expect(alert).toHaveTextContent('Blueprint migration failed');
    expect(alert).toHaveTextContent('could not write blueprint');
    expect(screen.queryByText('Blueprint list')).not.toBeInTheDocument();
  });
});
