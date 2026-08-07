import React from 'react';

import { render, screen } from '@testing-library/react';

import { createUser } from '@/test/testUtils';
import { clickWithWait } from '@/test/testUtils/userEvents';

import SingleTargetAlert from '../SingleTargetAlert';
import useHasMultiTargetBlueprints from '../useHasMultiTargetBlueprints';

const STORAGE_KEY = 'imageBuilder.singleTargetMigration.dismissed';

vi.mock('../useHasMultiTargetBlueprints', () => ({
  default: vi.fn(() => ({ hasMultiTarget: true, isLoading: false })),
}));

describe('Single Target Alert', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.mocked(useHasMultiTargetBlueprints).mockReturnValue({
      hasMultiTarget: true,
      isLoading: false,
    });
  });

  test('renders with title and body', async () => {
    const user = createUser();

    render(<SingleTargetAlert />);

    expect(
      screen.getByText(
        'Blueprints are transitioning to single image target environments.',
      ),
    ).toBeInTheDocument();

    await clickWithWait(
      user,
      screen.getByRole('button', { name: /warning alert details/i }),
    );

    expect(
      screen.getByText(
        /Existing multi-target blueprints will be migrated to single-target configurations/,
      ),
    ).toBeInTheDocument();
  });

  test('renders as a warning alert', () => {
    render(<SingleTargetAlert />);

    const heading = screen.getByRole('heading', {
      name: /Warning alert:/i,
    });
    expect(heading).toBeInTheDocument();
  });

  test('permanently dismisses alert via "Do not show me this again"', async () => {
    const user = createUser();

    render(<SingleTargetAlert />);

    await clickWithWait(user, screen.getByText("Don't show me this again"));

    expect(
      screen.queryByTestId('single-target-migration-banner'),
    ).not.toBeInTheDocument();
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe('true');
  });

  test('temporarily dismisses alert via close button', async () => {
    const user = createUser();

    render(<SingleTargetAlert />);

    await clickWithWait(user, screen.getByRole('button', { name: /close/i }));

    expect(
      screen.queryByTestId('single-target-migration-banner'),
    ).not.toBeInTheDocument();
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  test('does not render when previously dismissed via localStorage', () => {
    window.localStorage.setItem(STORAGE_KEY, 'true');

    render(<SingleTargetAlert />);

    expect(
      screen.queryByTestId('single-target-migration-banner'),
    ).not.toBeInTheDocument();
  });

  test('does not render when no multi-target blueprints exist', () => {
    vi.mocked(useHasMultiTargetBlueprints).mockReturnValue({
      hasMultiTarget: false,
      isLoading: false,
    });

    render(<SingleTargetAlert />);

    expect(
      screen.queryByTestId('single-target-migration-banner'),
    ).not.toBeInTheDocument();
  });

  test('does not render while loading', () => {
    vi.mocked(useHasMultiTargetBlueprints).mockReturnValue({
      hasMultiTarget: false,
      isLoading: true,
    });

    render(<SingleTargetAlert />);

    expect(
      screen.queryByTestId('single-target-migration-banner'),
    ).not.toBeInTheDocument();
  });
});
