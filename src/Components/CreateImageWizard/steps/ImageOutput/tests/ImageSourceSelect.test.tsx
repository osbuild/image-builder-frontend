import React from 'react';

import { screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

import {
  initialState,
  selectDistribution,
  selectImageSource as selectImageSourceState,
} from '@/store/slices/wizard';
import { clickWithWait, createUser, renderWithRedux } from '@/test/testUtils';

import {
  clickRefreshImageSources,
  openImageSourceSelect,
  renderImageSourceSelect,
} from './helpers';
import {
  mockBootcDistributions,
  mockBootcDistributionsMixed,
  mockBootcDistributionsMultipleTypes,
  mockBootcDistributionsNoRhel10,
  mockBootcDistributionsWithMinorVersions,
} from './mocks';

import ImageSourceSelect from '../components/ImageSourceSelect';

const mockRefetch = vi.fn();
const mockUseGetDistributionsQuery = vi.fn();
const mockRegistryLogin = vi.fn().mockReturnValue({ unwrap: vi.fn() });

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
    useRegistryLoginMutation: () => [
      mockRegistryLogin,
      { isLoading: false, error: undefined },
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

    test('auto-selects the first rhel-10 distribution', async () => {
      const { store } = renderImageSourceSelect();

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

      const { store } = renderImageSourceSelect();

      await waitFor(() => {
        expect(selectImageSourceState(store.getState())).toBe(
          'registry.redhat.io/rhel9/rhel-bootc:rhel-9',
        );
      });
    });

    test('displays the selected image reference in the typeahead', async () => {
      renderImageSourceSelect();

      const input = await screen.findByRole('textbox', {
        name: /type to filter/i,
      });
      expect(input).toHaveValue('registry.redhat.io/rhel10/rhel-bootc:rhel-10');
    });
  });

  describe('Loading State', () => {
    beforeEach(() => {
      mockUseGetDistributionsQuery.mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
        refetch: mockRefetch,
      });
    });

    test('displays loading text in toggle', async () => {
      renderImageSourceSelect();

      expect(await screen.findByText(/loading images/i)).toBeInTheDocument();
    });

    test('disables refresh button when loading', async () => {
      renderImageSourceSelect();

      const refreshButton = await screen.findByRole('button', {
        name: /refresh image sources/i,
      });
      expect(refreshButton).toBeDisabled();
    });
  });

  describe('Error State', () => {
    beforeEach(() => {
      mockUseGetDistributionsQuery.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        refetch: mockRefetch,
      });
    });

    test('displays error alert when query fails', async () => {
      renderImageSourceSelect();

      expect(
        await screen.findByRole('heading', {
          name: /error loading bootc images/i,
        }),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/unable to load available bootc images/i),
      ).toBeInTheDocument();
    });

    test('displays on-prem error message mentioning podman', async () => {
      renderImageSourceSelect();

      expect(
        await screen.findByText(/ensure podman is installed/i),
      ).toBeInTheDocument();
    });

    test('displays hosted error message without podman reference', async () => {
      renderHostedImageSourceSelect();

      expect(
        await screen.findByText(/please try again later/i),
      ).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    beforeEach(() => {
      mockUseGetDistributionsQuery.mockReturnValue({
        data: [],
        isLoading: false,
        isError: false,
        refetch: mockRefetch,
      });
    });

    test('displays "No images available" in dropdown', async () => {
      renderImageSourceSelect();
      const user = createUser();

      await openImageSourceSelect(user);

      expect(
        await screen.findByRole('option', {
          name: /no images available/i,
        }),
      ).toBeInTheDocument();
    });
  });

  describe('Image Selection', () => {
    test('displays available images in dropdown', async () => {
      renderImageSourceSelect();
      const user = createUser();

      await openImageSourceSelect(user);

      expect(
        await screen.findByRole('option', {
          name: /registry.redhat.io\/rhel10\/rhel-bootc:rhel-10/i,
        }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('option', {
          name: /registry.redhat.io\/rhel9\/rhel-bootc:rhel-9/i,
        }),
      ).toBeInTheDocument();
    });

    test('updates redux state when selecting an image', async () => {
      const { store } = renderImageSourceSelect();
      const user = createUser();

      // Wait for auto-select to finish
      await waitFor(() => {
        expect(selectImageSourceState(store.getState())).toBe(
          'registry.redhat.io/rhel10/rhel-bootc:rhel-10',
        );
      });

      await openImageSourceSelect(user);
      const option = await screen.findByRole('option', {
        name: /registry.redhat.io\/rhel9\/rhel-bootc:rhel-9/i,
      });
      await clickWithWait(user, option);

      await waitFor(() => {
        expect(selectImageSourceState(store.getState())).toBe(
          'registry.redhat.io/rhel9/rhel-bootc:rhel-9',
        );
        expect(selectDistribution(store.getState())).toBe('rhel-9');
      });
    });

    test('closes dropdown after selection', async () => {
      renderImageSourceSelect();
      const user = createUser();

      await openImageSourceSelect(user);
      expect(screen.getByRole('listbox')).toBeInTheDocument();

      const option = await screen.findByRole('option', {
        name: /registry.redhat.io\/rhel9\/rhel-bootc:rhel-9/i,
      });
      await clickWithWait(user, option);

      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      });
    });
  });

  describe('On-premise refresh', () => {
    test('displays refresh button', async () => {
      renderImageSourceSelect();

      expect(
        await screen.findByRole('button', { name: /refresh image sources/i }),
      ).toBeInTheDocument();
    });

    test('calls refetch when refresh button clicked', async () => {
      renderImageSourceSelect();
      const user = createUser();

      await clickRefreshImageSources(user);

      expect(mockRefetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('Hosted (non on-premise)', () => {
    test('does not display refresh button', async () => {
      renderHostedImageSourceSelect();

      await screen.findByText('Image source');

      expect(
        screen.queryByRole('button', { name: /refresh image sources/i }),
      ).not.toBeInTheDocument();
    });
  });

  describe('Non-RHEL distributions', () => {
    beforeEach(() => {
      mockUseGetDistributionsQuery.mockReturnValue({
        data: mockBootcDistributionsMixed,
        isLoading: false,
        isError: false,
        refetch: mockRefetch,
      });
    });

    test('displays all image references including non-RHEL in dropdown', async () => {
      renderImageSourceSelect();
      const user = createUser();

      await openImageSourceSelect(user);

      expect(
        screen.getByRole('option', {
          name: /registry.redhat.io\/rhel10\/rhel-bootc:rhel-10/i,
        }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('option', {
          name: /quay.io\/fedora\/fedora-bootc:44/i,
        }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('option', {
          name: /quay.io\/centos-bootc\/centos-bootc:stream10/i,
        }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('option', {
          name: /localhost\/my-custom-image:latest/i,
        }),
      ).toBeInTheDocument();
    });

    test('selecting Fedora dispatches correct distribution and image source', async () => {
      const { store } = renderImageSourceSelect();
      const user = createUser();

      await waitFor(() => {
        expect(selectImageSourceState(store.getState())).toBe(
          'registry.redhat.io/rhel10/rhel-bootc:rhel-10',
        );
      });

      await openImageSourceSelect(user);
      const fedoraOption = await screen.findByRole('option', {
        name: /quay.io\/fedora\/fedora-bootc:44/i,
      });
      await clickWithWait(user, fedoraOption);

      await waitFor(() => {
        expect(selectImageSourceState(store.getState())).toBe(
          'quay.io/fedora/fedora-bootc:44',
        );
        expect(selectDistribution(store.getState())).toBe('fedora-44');
      });
    });

    test('selecting CentOS dispatches correct distribution and image source', async () => {
      const { store } = renderImageSourceSelect();
      const user = createUser();

      await waitFor(() => {
        expect(selectImageSourceState(store.getState())).toBe(
          'registry.redhat.io/rhel10/rhel-bootc:rhel-10',
        );
      });

      await openImageSourceSelect(user);
      const centosOption = await screen.findByRole('option', {
        name: /quay.io\/centos-bootc\/centos-bootc:stream10/i,
      });
      await clickWithWait(user, centosOption);

      await waitFor(() => {
        expect(selectImageSourceState(store.getState())).toBe(
          'quay.io/centos-bootc/centos-bootc:stream10',
        );
        expect(selectDistribution(store.getState())).toBe('centos-10');
      });
    });

    test('selecting unknown image dispatches correct distribution and image source', async () => {
      const { store } = renderImageSourceSelect();
      const user = createUser();

      await waitFor(() => {
        expect(selectImageSourceState(store.getState())).toBe(
          'registry.redhat.io/rhel10/rhel-bootc:rhel-10',
        );
      });

      await openImageSourceSelect(user);
      const customOption = await screen.findByRole('option', {
        name: /localhost\/my-custom-image:latest/i,
      });
      await clickWithWait(user, customOption);

      await waitFor(() => {
        expect(selectImageSourceState(store.getState())).toBe(
          'localhost/my-custom-image:latest',
        );
        expect(selectDistribution(store.getState())).toBe('unknown-custom');
      });
    });
  });

  describe('Distribution filtering and deduplication', () => {
    test('on-prem shows all images including minor versions', async () => {
      mockUseGetDistributionsQuery.mockReturnValue({
        data: mockBootcDistributionsWithMinorVersions,
        isLoading: false,
        isError: false,
        refetch: mockRefetch,
      });

      renderImageSourceSelect();
      const user = createUser();

      await openImageSourceSelect(user);

      const options = screen.getAllByRole('option');
      expect(options).toHaveLength(3);
      expect(options[0]).toHaveTextContent(
        'registry.redhat.io/rhel10/rhel-bootc:rhel-10',
      );
      expect(options[1]).toHaveTextContent(
        'registry.redhat.io/rhel10/rhel-bootc:rhel-10.1',
      );
      expect(options[2]).toHaveTextContent(
        'registry.redhat.io/rhel9/rhel-bootc:rhel-9',
      );
    });

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
