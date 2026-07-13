import React from 'react';

import { render, screen } from '@testing-library/react';
import { useVariant } from '@unleash/proxy-client-react';

import ServiceUnavailableAlert from '../ServiceUnavailableAlert';

type PayloadData = {
  title?: string;
  body?: string;
  variant?: string;
};

const mockVariant = (payloadData?: PayloadData) => {
  vi.mocked(useVariant).mockReturnValue({
    name: 'image-builder.service-unavailable',
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

describe('Service Unavailable Alert', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test('renders with default message when no payload provided', () => {
    mockVariant();

    render(<ServiceUnavailableAlert />);

    expect(
      screen.getByText(/The Image Builder service is currently unavailable/i),
    ).toBeInTheDocument();
  });

  test('renders with custom title and body from payload', () => {
    mockVariant({
      title: 'Something broke',
      body: 'Something went very very bad',
      variant: 'warning',
    });

    render(<ServiceUnavailableAlert />);

    expect(screen.getByText(/Something broke/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Something went very very bad/i),
    ).toBeInTheDocument();
  });

  test('uses danger variant by default', () => {
    mockVariant();

    render(<ServiceUnavailableAlert />);

    const heading = screen.getByRole('heading', {
      name: /Danger alert:/i,
    });
    expect(heading).toBeInTheDocument();
  });

  test('applies custom variant from payload', () => {
    mockVariant({
      title: 'Something broke',
      variant: 'warning',
    });

    render(<ServiceUnavailableAlert />);

    const heading = screen.getByRole('heading', {
      name: /Warning alert:/i,
    });
    expect(heading).toBeInTheDocument();
  });

  test('falls back to danger variant for invalid variant value', () => {
    mockVariant({
      title: 'Something broke',
      variant: 'invalid-variant',
    });

    render(<ServiceUnavailableAlert />);

    const heading = screen.getByRole('heading', {
      name: /Danger alert:/i,
    });
    expect(heading).toBeInTheDocument();
  });
});
