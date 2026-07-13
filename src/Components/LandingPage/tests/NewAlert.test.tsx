import React from 'react';

import { render, screen } from '@testing-library/react';
import { useVariant } from '@unleash/proxy-client-react';

import { createUser } from '@/test/testUtils';
import { clickWithWait } from '@/test/testUtils/userEvents';

import { NewAlert } from '../NewAlert';

type PayloadData = {
  title?: string;
  body?: string;
  localStorageKey?: string;
};

const mockVariant = (payloadData?: PayloadData) => {
  vi.mocked(useVariant).mockReturnValue({
    name: 'image-builder.new-feature',
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

describe('New Alert', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  test('does not render when no payload is provided', () => {
    mockVariant();

    render(<NewAlert />);

    expect(
      screen.queryByTestId('new-in-image-builder-banner'),
    ).not.toBeInTheDocument();
  });

  test('renders with title and body from payload', () => {
    mockVariant({
      title: 'New feature available',
      body: 'Try out the new customizations',
      localStorageKey: 'imageBuilder.newFeature',
    });

    render(<NewAlert />);

    expect(screen.getByText('New feature available')).toBeInTheDocument();
  });

  test('permanently dismisses alert via "Do not show me this again"', async () => {
    const user = createUser();
    mockVariant({
      title: 'New feature available',
      body: 'Try out the new customizations',
      localStorageKey: 'imageBuilder.newFeature',
    });

    render(<NewAlert />);

    await clickWithWait(user, screen.getByText("Don't show me this again"));

    expect(
      screen.queryByTestId('new-in-image-builder-banner'),
    ).not.toBeInTheDocument();
    expect(window.localStorage.getItem('imageBuilder.newFeature')).toBe('true');
  });

  test('temporarily dismisses alert via close button', async () => {
    const user = createUser();
    mockVariant({
      title: 'New feature available',
      body: 'Try out the new customizations',
      localStorageKey: 'imageBuilder.newFeature',
    });

    render(<NewAlert />);

    await clickWithWait(user, screen.getByRole('button', { name: /close/i }));

    expect(
      screen.queryByTestId('new-in-image-builder-banner'),
    ).not.toBeInTheDocument();
    expect(window.localStorage.getItem('imageBuilder.newFeature')).toBeNull();
  });

  test('does not render when previously dismissed via localStorage', () => {
    window.localStorage.setItem('imageBuilder.newFeature', 'true');

    mockVariant({
      title: 'New feature available',
      body: 'Try out the new customizations',
      localStorageKey: 'imageBuilder.newFeature',
    });

    render(<NewAlert />);

    expect(
      screen.queryByTestId('new-in-image-builder-banner'),
    ).not.toBeInTheDocument();
  });

  test('does not write to localStorage when dismissing without localStorageKey', async () => {
    const user = createUser();
    const setItemSpy = vi.spyOn(Storage.prototype, 'setItem');
    mockVariant({
      title: 'New feature available',
      body: 'Try out the new customizations',
    });

    render(<NewAlert />);

    expect(screen.getByText('New feature available')).toBeInTheDocument();

    await clickWithWait(user, screen.getByText("Don't show me this again"));

    expect(
      screen.queryByTestId('new-in-image-builder-banner'),
    ).not.toBeInTheDocument();
    expect(setItemSpy).not.toHaveBeenCalled();
    setItemSpy.mockRestore();
  });

  test('does not render when payload is malformed JSON', () => {
    vi.mocked(useVariant).mockReturnValue({
      name: 'image-builder.new-feature',
      enabled: true,
      payload: {
        type: 'json',
        value: 'not valid json{{{',
      },
    });

    render(<NewAlert />);

    expect(
      screen.queryByTestId('new-in-image-builder-banner'),
    ).not.toBeInTheDocument();
  });

  test('shows body text when alert is expanded', async () => {
    const user = createUser();
    mockVariant({
      title: 'New feature available',
      body: 'Try out the new customizations',
      localStorageKey: 'imageBuilder.newFeature',
    });

    render(<NewAlert />);

    await clickWithWait(
      user,
      screen.getByRole('button', { name: /custom alert details/i }),
    );

    expect(
      screen.getByText('Try out the new customizations'),
    ).toBeInTheDocument();
  });
});
