import React from 'react';

import { render, screen } from '@testing-library/react';
import { useVariant } from '@unleash/proxy-client-react';

import { createUser } from '@/test/testUtils';
import { clickWithWait } from '@/test/testUtils/userEvents';

import SingleTargetAlert from '../SingleTargetAlert';

type PayloadData = {
  title?: string;
  body?: string;
  localStorageKey?: string;
};

const mockVariant = (payloadData?: PayloadData) => {
  vi.mocked(useVariant).mockReturnValue({
    name: 'image-builder.single-target-migration',
    enabled: true,
    payload: payloadData
      ? {
          type: 'json',
          value: JSON.stringify(payloadData),
        }
      : {
          type: 'json',
          value: JSON.stringify(''),
        },
  });
};

describe('Single Target Alert', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('does not render when no payload is provided', () => {
    mockVariant();

    render(<SingleTargetAlert />);

    expect(
      screen.queryByTestId('single-target-migration-banner'),
    ).not.toBeInTheDocument();
  });

  test('renders with title and body from payload', async () => {
    const user = createUser();
    mockVariant({
      title: 'Single target images coming soon',
      body: 'Image Builder will transition to single-target images.',
      localStorageKey: 'imageBuilder.singleTargetMigration',
    });

    render(<SingleTargetAlert />);

    expect(
      screen.getByText('Single target images coming soon'),
    ).toBeInTheDocument();

    await clickWithWait(
      user,
      screen.getByRole('button', { name: /warning alert details/i }),
    );

    expect(
      screen.getByText(
        'Image Builder will transition to single-target images.',
      ),
    ).toBeInTheDocument();
  });

  test('renders as a warning alert', () => {
    mockVariant({
      title: 'Single target images coming soon',
      body: 'Details about the change.',
      localStorageKey: 'imageBuilder.singleTargetMigration',
    });

    render(<SingleTargetAlert />);

    const heading = screen.getByRole('heading', {
      name: /Warning alert:/i,
    });
    expect(heading).toBeInTheDocument();
  });

  test('permanently dismisses alert via "Do not show me this again"', async () => {
    const user = createUser();
    mockVariant({
      title: 'Single target images coming soon',
      body: 'Details about the change.',
      localStorageKey: 'imageBuilder.singleTargetMigration',
    });

    render(<SingleTargetAlert />);

    await clickWithWait(user, screen.getByText("Don't show me this again"));

    expect(
      screen.queryByTestId('single-target-migration-banner'),
    ).not.toBeInTheDocument();
    expect(
      window.localStorage.getItem('imageBuilder.singleTargetMigration'),
    ).toBe('true');
  });

  test('temporarily dismisses alert via close button', async () => {
    const user = createUser();
    mockVariant({
      title: 'Single target images coming soon',
      body: 'Details about the change.',
      localStorageKey: 'imageBuilder.singleTargetMigration',
    });

    render(<SingleTargetAlert />);

    await clickWithWait(user, screen.getByRole('button', { name: /close/i }));

    expect(
      screen.queryByTestId('single-target-migration-banner'),
    ).not.toBeInTheDocument();
    expect(
      window.localStorage.getItem('imageBuilder.singleTargetMigration'),
    ).toBeNull();
  });

  test('does not render when previously dismissed via localStorage', () => {
    window.localStorage.setItem('imageBuilder.singleTargetMigration', 'true');

    mockVariant({
      title: 'Single target images coming soon',
      body: 'Details about the change.',
      localStorageKey: 'imageBuilder.singleTargetMigration',
    });

    render(<SingleTargetAlert />);

    expect(
      screen.queryByTestId('single-target-migration-banner'),
    ).not.toBeInTheDocument();
  });

  test('does not render when payload is malformed JSON', () => {
    vi.mocked(useVariant).mockReturnValue({
      name: 'image-builder.single-target-migration',
      enabled: true,
      payload: {
        type: 'json',
        value: 'not valid json{{{',
      },
    });

    render(<SingleTargetAlert />);

    expect(
      screen.queryByTestId('single-target-migration-banner'),
    ).not.toBeInTheDocument();
  });
});
