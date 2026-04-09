import React from 'react';

import { screen } from '@testing-library/react';

import { server } from '@/test/mocks/server';
import { fetchMock, renderWithRedux } from '@/test/testUtils';

import { useSecuritySummary } from '../hooks';

fetchMock.enableMocks();

const oscapHandler = ({ url, method }: { url: string; method: string }) => {
  if (url.includes('/oscap/') && method === 'GET') {
    return JSON.stringify({
      packages: [],
      services: { enabled: [], disabled: [], masked: [] },
    });
  }
  return null;
};

const TestComponent = () => {
  const { title, packages, services, kernel } = useSecuritySummary();

  return (
    <div>
      <span data-testid='title'>{title ?? 'no-title'}</span>
      <span data-testid='packages-count'>{packages.length}</span>
      <span data-testid='services-total'>{services.total}</span>
      <span data-testid='services-enabled'>{services.enabled.length}</span>
      <span data-testid='services-disabled'>{services.disabled.length}</span>
      <span data-testid='services-masked'>{services.masked.length}</span>
      <span data-testid='kernel-append'>{kernel.append.length}</span>
    </div>
  );
};

beforeAll(() => {
  server.close();
});

afterAll(() => {
  server.listen();
});

beforeEach(() => {
  fetchMock.mockResponse((req) => {
    const result = oscapHandler({ url: req.url, method: req.method });
    if (result) return result;
    throw new Error(`Unhandled fetch: ${req.method} ${req.url}`);
  });
});

afterEach(() => {
  fetchMock.resetMocks();
});

describe('useSecuritySummary', () => {
  test('returns empty values when no profile or policy is selected', () => {
    renderWithRedux(<TestComponent />, {
      compliance: {
        complianceType: 'openscap',
        profileID: undefined,
        policyID: undefined,
        policyTitle: undefined,
      },
    });

    expect(screen.getByTestId('title')).toHaveTextContent('no-title');
    expect(screen.getByTestId('packages-count')).toHaveTextContent('0');
    expect(screen.getByTestId('services-total')).toHaveTextContent('0');
    expect(screen.getByTestId('kernel-append')).toHaveTextContent('0');
  });

  test('returns policy title when compliance type is compliance', () => {
    renderWithRedux(<TestComponent />, {
      compliance: {
        complianceType: 'compliance',
        profileID: undefined,
        policyID: 'policy-123',
        policyTitle: 'My Test Policy',
      },
    });

    expect(screen.getByTestId('title')).toHaveTextContent('My Test Policy');
  });

  test('returns profile ID as fallback title when openscap profile is selected', () => {
    renderWithRedux(<TestComponent />, {
      compliance: {
        complianceType: 'openscap',
        profileID: 'xccdf_org.ssgproject.content_profile_cis',
        policyID: undefined,
        policyTitle: undefined,
      },
    });

    // Without API data, it falls back to profileId
    expect(screen.getByTestId('title')).toHaveTextContent(
      'xccdf_org.ssgproject.content_profile_cis',
    );
  });

  test('initializes services with empty arrays', () => {
    renderWithRedux(<TestComponent />, {
      compliance: {
        complianceType: 'openscap',
        profileID: undefined,
        policyID: undefined,
        policyTitle: undefined,
      },
    });

    expect(screen.getByTestId('services-enabled')).toHaveTextContent('0');
    expect(screen.getByTestId('services-disabled')).toHaveTextContent('0');
    expect(screen.getByTestId('services-masked')).toHaveTextContent('0');
  });
});
