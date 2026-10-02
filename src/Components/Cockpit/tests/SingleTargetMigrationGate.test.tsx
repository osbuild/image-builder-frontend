import React from 'react';

import { act, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { applyBlueprintSplits } from '@/store/api/backend/onprem/migrations';

import SingleTargetMigrationGate from '../SingleTargetMigrationGate';

vi.mock('@/store/api/backend/onprem/migrations', () => ({
  applyBlueprintSplits: vi.fn(),
}));

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

  it('blocks the app while another tab is migrating', async () => {
    vi.mocked(applyBlueprintSplits).mockRejectedValue(
      Object.assign(new Error('Migration already running'), {
        stage: 'locked',
      }),
    );

    render(
      <SingleTargetMigrationGate>
        <div>Blueprint list</div>
      </SingleTargetMigrationGate>,
    );

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Blueprint migration blocked',
    );
    expect(
      screen.getByText(
        'A migration lock exists. Wait for any other Cockpit tab to finish; if none is active, follow the recovery instructions before removing it.',
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', {
        name: 'Read the local recovery instructions',
      }),
    ).toHaveAttribute('href', 'single-target-migration-recovery.md');
    expect(screen.queryByText('Blueprint list')).not.toBeInTheDocument();
  });

  it('explains that planning failures happen before migration writes', async () => {
    vi.mocked(applyBlueprintSplits).mockRejectedValue(
      Object.assign(new Error('duplicate-target'), { stage: 'planning' }),
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
    expect(alert).toHaveTextContent('Migration writes have not started');
    expect(alert).toHaveTextContent('duplicate-target');
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.queryByText('Blueprint list')).not.toBeInTheDocument();
  });

  it('warns that a failed backup may be incomplete before migration writes', async () => {
    vi.mocked(applyBlueprintSplits).mockRejectedValue(
      Object.assign(new Error('backup failed'), {
        stage: 'backup',
        backupPath: '/state/cockpit-image-builder-backup-partial',
      }),
    );

    render(
      <SingleTargetMigrationGate>
        <div>Blueprint list</div>
      </SingleTargetMigrationGate>,
    );

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Migration writes have not started');
    expect(alert).toHaveTextContent('A complete backup may not exist');
    expect(alert).toHaveTextContent(
      '/state/cockpit-image-builder-backup-partial',
    );
    expect(alert).toHaveTextContent('backup failed');
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    expect(screen.queryByText('Blueprint list')).not.toBeInTheDocument();
  });

  it('shows the retained backup and recovery guide after a file-operation failure', async () => {
    vi.mocked(applyBlueprintSplits).mockRejectedValue(
      Object.assign(new Error('write failed'), {
        stage: 'migration',
        backupPath: '/state/cockpit-image-builder-backup-complete',
      }),
    );

    render(
      <SingleTargetMigrationGate>
        <div>Blueprint list</div>
      </SingleTargetMigrationGate>,
    );

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('Migration may be partial');
    expect(alert).toHaveTextContent(
      '/state/cockpit-image-builder-backup-complete',
    );
    expect(alert).toHaveTextContent('write failed');
    expect(
      screen.getByRole('link', {
        name: 'Read the local recovery instructions',
      }),
    ).toHaveAttribute('href', 'single-target-migration-recovery.md');
    expect(screen.queryByText('Blueprint list')).not.toBeInTheDocument();
  });
});
