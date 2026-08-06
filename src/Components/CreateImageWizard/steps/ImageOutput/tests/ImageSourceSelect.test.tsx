import React from 'react';

import { screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

import {
  initialState,
  selectDistribution,
  selectImageSource as selectImageSourceState,
} from '@/store/slices/wizard';
import { clickWithWait, createUser, renderWithRedux } from '@/test/testUtils';

import { openImageSourceSelect, renderImageSourceSelect } from './helpers';
import {
  mockBootcDistributions,
  mockBootcDistributionsMultipleTypes,
  mockBootcDistributionsNoRhel10,
  mockBootcDistributionsWithMinorVersions,
} from './mocks';

import ImageSourceSelect from '../components/ImageSourceSelect';

const mockRefetch = vi.fn();
const mockUseGetDistributionsQuery = vi.fn();
const mockPullImage = vi.fn();

vi.mock('@/store/api/backend', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/store/api/backend')>();
  return {
    ...actual,
    useGetDistributionsQuery: (...args: unknown[]) =>
      mockUseGetDistributionsQuery(...args),
    useGetRegistryAuthStatusQuery: () => ({
      data: { status: 'authenticated', username: 'testuser' },
      isLoading: false,
      isError: false,
      error: undefined,
    }),
    useGetImageExistsQuery: () => ({
      data: true,
      isLoading: false,
      isError: false,
    }),
    usePullImageMutation: () => [
      mockPullImage,
      { isLoading: false, isError: false },
    ],
  };
});

const renderHostedImageSourceSelect = () => {
  return renderWithRedux(<ImageSourceSelect />, {
    details: {
      ...initialState.details,
      blueprint: { ...initialState.details.blueprint, mode: 'image' },
    },
  });
};

describe('ImageSourceSelect', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseGetDistributionsQuery.mockReturnValue({
      data: mockBootcDistributions,
      isLoading: false,
      isError: false,
      refetch: mockRefetch,
    });
  });

  describe('Rendering', () => {
    test('displays image source label with required indicator', async () => {
      renderImageSourceSelect();

      expect(await screen.findByText('Image source')).toBeInTheDocument();
      // On-prem renders two required FormGroups (Release + Image source)
      const requiredMarkers = screen.getAllByText('*');
      expect(requiredMarkers.length).toBeGreaterThanOrEqual(1);
    });

    test('displays official and local image source cards', async () => {
      renderImageSourceSelect();

      expect(
        await screen.findByText('Official Red Hat images'),
      ).toBeInTheDocument();
      expect(screen.getByText('Local images')).toBeInTheDocument();
      expect(screen.queryByText('Custom images')).not.toBeInTheDocument();
      expect(screen.queryByText('No login')).not.toBeInTheDocument();
    });

    test('does not auto-select an image on-prem', async () => {
      const { store } = renderImageSourceSelect();

      await screen.findByText('Image source');

      expect(selectImageSourceState(store.getState())).toBeUndefined();
    });
  });

  describe('Official images', () => {
    test('displays official images in dropdown', async () => {
      renderImageSourceSelect();
      const user = createUser();

      await openImageSourceSelect(user);

      const options = await screen.findAllByRole('option', {
        name: /red hat enterprise linux \(rhel\) 10.3/i,
      });
      expect(options).toHaveLength(2);
    });

    test('updates redux state when selecting an image', async () => {
      const { store } = renderImageSourceSelect();
      const user = createUser();

      await openImageSourceSelect(user);
      const option = await screen.findByRole('option', {
        name: /red hat enterprise linux \(rhel\) 10.3.*guest image/i,
      });
      await clickWithWait(user, option);

      await waitFor(() => {
        expect(selectImageSourceState(store.getState())).toBe(
          'registry.redhat.io/rhel10/rhel-kvm:latest',
        );
        expect(selectDistribution(store.getState())).toBe('rhel-10.3');
      });
    });
  });

  describe('Local images', () => {
    const renderLocalImageSource = () => {
      return renderImageSourceSelect({
        output: {
          ...initialState.output,
          imageSourceType: 'local',
        },
      });
    };

    test('displays coming soon note instead of an image dropdown', async () => {
      renderLocalImageSource();

      expect(
        await screen.findByText(/local image support is coming soon/i),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/cockpit image builder 10\.4/i),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: /select an official image/i }),
      ).not.toBeInTheDocument();
    });

    test('displays the image-builder CLI example', async () => {
      renderLocalImageSource();

      expect(
        await screen.findByDisplayValue(
          'image-builder build qcow2 --bootc-ref localhost/my-derived-image:latest',
        ),
      ).toBeInTheDocument();
    });

    test('selecting the local card shows the coming soon note', async () => {
      renderImageSourceSelect();
      const user = createUser();

      const localCard = await screen.findByRole('radio', {
        name: /local images/i,
      });
      await clickWithWait(user, localCard);

      expect(
        await screen.findByText(/local image support is coming soon/i),
      ).toBeInTheDocument();
    });
  });

  describe('Hosted (non on-premise)', () => {
    test('does not display source type cards', async () => {
      renderHostedImageSourceSelect();

      await screen.findByText('Image source');

      expect(screen.queryByText('Local images')).not.toBeInTheDocument();
      expect(
        screen.queryByText('Official Red Hat images'),
      ).not.toBeInTheDocument();
    });

    test('displays hosted error message when query fails', async () => {
      mockUseGetDistributionsQuery.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        refetch: mockRefetch,
      });

      renderHostedImageSourceSelect();

      expect(
        await screen.findByRole('heading', {
          name: /error loading bootc images/i,
        }),
      ).toBeInTheDocument();
      expect(screen.getByText(/please try again later/i)).toBeInTheDocument();
    });

    test('auto-selects the first rhel-10 distribution', async () => {
      const { store } = renderHostedImageSourceSelect();

      await waitFor(() => {
        expect(selectImageSourceState(store.getState())).toBe(
          'registry.redhat.io/rhel10/rhel-bootc:rhel-10',
        );
      });
    });

    test('falls back to first distribution when no rhel-10 is available', async () => {
      mockUseGetDistributionsQuery.mockReturnValue({
        data: mockBootcDistributionsNoRhel10,
        isLoading: false,
        isError: false,
        refetch: mockRefetch,
      });

      const { store } = renderHostedImageSourceSelect();

      await waitFor(() => {
        expect(selectImageSourceState(store.getState())).toBe(
          'registry.redhat.io/rhel9/rhel-bootc:rhel-9',
        );
      });
    });
  });

  describe('Distribution filtering and deduplication', () => {
    test('hosted filters out minor versions', async () => {
      mockUseGetDistributionsQuery.mockReturnValue({
        data: mockBootcDistributionsWithMinorVersions,
        isLoading: false,
        isError: false,
        refetch: mockRefetch,
      });

      renderHostedImageSourceSelect();
      const user = createUser();

      const toggle = await screen.findByRole('button', {
        name: /red hat enterprise linux \(rhel\) 10/i,
      });
      await clickWithWait(user, toggle);

      const options = screen.getAllByRole('option');
      expect(options).toHaveLength(2);
      expect(options[0]).toHaveTextContent(
        'Red Hat Enterprise Linux (RHEL) 10',
      );
      expect(options[1]).toHaveTextContent('Red Hat Enterprise Linux (RHEL) 9');
    });

    test('hosted deduplicates distributions by name', async () => {
      mockUseGetDistributionsQuery.mockReturnValue({
        data: mockBootcDistributionsMultipleTypes,
        isLoading: false,
        isError: false,
        refetch: mockRefetch,
      });

      renderHostedImageSourceSelect();
      const user = createUser();

      const toggle = await screen.findByRole('button', {
        name: /red hat enterprise linux \(rhel\) 10/i,
      });
      await clickWithWait(user, toggle);

      const options = screen.getAllByRole('option', {
        name: /red hat enterprise linux \(rhel\) 10/i,
      });
      expect(options).toHaveLength(1);
    });
  });
});
