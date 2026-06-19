import React from 'react';

import { screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

import {
  combinedInitialState as initialState,
  selectDistribution,
  selectImageSource as selectImageSourceState,
} from '@/store/slices/wizard';
import { clickWithWait, createUser, renderWithRedux } from '@/test/testUtils';

import {
  clickRefreshImageSources,
  openImageSourceSelect,
  renderImageSourceSelect,
  togglePullInfoSection,
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

vi.mock('@/store/api/backend', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/store/api/backend')>();
  return {
    ...actual,
    useGetDistributionsQuery: (...args: unknown[]) =>
      mockUseGetDistributionsQuery(...args),
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
      expect(screen.getByText('*')).toBeInTheDocument();
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

    test('displays the selected distribution name in the toggle', async () => {
      renderImageSourceSelect();

      expect(
        await screen.findByRole('button', {
          name: /red hat enterprise linux \(rhel\) 10/i,
        }),
      ).toBeInTheDocument();
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

    test('displays loading text and disabled toggle', async () => {
      renderImageSourceSelect();

      const toggle = await screen.findByRole('button', {
        name: /loading bootc images/i,
      });
      expect(toggle).toBeDisabled();
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

    test('does not display pull info section when error', async () => {
      renderImageSourceSelect();

      await screen.findByRole('heading', {
        name: /error loading bootc images/i,
      });

      expect(
        screen.queryByRole('button', {
          name: /information about pulling images/i,
        }),
      ).not.toBeInTheDocument();
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

    test('displays "No bootc images available" in dropdown', async () => {
      renderImageSourceSelect();
      const user = createUser();

      await openImageSourceSelect(user);

      expect(
        await screen.findByRole('option', {
          name: /no bootc images available/i,
        }),
      ).toBeInTheDocument();
    });

    test('auto-expands pull info section when no images', async () => {
      renderImageSourceSelect();

      expect(
        await screen.findByRole('button', {
          name: /hide information about pulling images/i,
        }),
      ).toBeInTheDocument();
    });

    test('displays warning alert when no images found', async () => {
      renderImageSourceSelect();

      expect(
        await screen.findByRole('heading', { name: /no images found/i }),
      ).toBeInTheDocument();
    });
  });

  describe('Image Selection', () => {
    test('displays available distributions in dropdown', async () => {
      renderImageSourceSelect();
      const user = createUser();

      // The component auto-selects rhel-10, so the toggle shows the name
      // rather than the placeholder. Click the toggle to open the list.
      const toggle = await screen.findByRole('button', {
        name: /red hat enterprise linux \(rhel\) 10/i,
      });
      await clickWithWait(user, toggle);

      expect(
        await screen.findByRole('option', {
          name: /red hat enterprise linux \(rhel\) 10/i,
        }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('option', {
          name: /red hat enterprise linux \(rhel\) 9/i,
        }),
      ).toBeInTheDocument();
    });

    test('updates redux state when selecting a distribution', async () => {
      const { store } = renderImageSourceSelect();
      const user = createUser();

      // Wait for auto-select to finish
      await waitFor(() => {
        expect(selectImageSourceState(store.getState())).toBe(
          'registry.redhat.io/rhel10/rhel-bootc:rhel-10',
        );
      });

      // Open and select rhel-9
      const toggle = await screen.findByRole('button', {
        name: /red hat enterprise linux \(rhel\) 10/i,
      });
      await clickWithWait(user, toggle);
      const option = await screen.findByRole('option', {
        name: /red hat enterprise linux \(rhel\) 9/i,
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

      const toggle = await screen.findByRole('button', {
        name: /red hat enterprise linux \(rhel\) 10/i,
      });
      await clickWithWait(user, toggle);
      expect(screen.getByRole('listbox')).toBeInTheDocument();

      const option = await screen.findByRole('option', {
        name: /red hat enterprise linux \(rhel\) 9/i,
      });
      await clickWithWait(user, option);

      await waitFor(() => {
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      });
    });
  });

  describe('On-premise pull info', () => {
    test('displays expandable pull info section', async () => {
      renderImageSourceSelect();

      expect(
        await screen.findByRole('button', {
          name: /show information about pulling images/i,
        }),
      ).toBeInTheDocument();
    });

    test('expands pull info section when clicked', async () => {
      renderImageSourceSelect();
      const user = createUser();

      await togglePullInfoSection(user);

      expect(
        await screen.findByRole('button', {
          name: /hide information about pulling images/i,
        }),
      ).toBeInTheDocument();
    });

    test('displays pull command in expanded section', async () => {
      renderImageSourceSelect();
      const user = createUser();

      await togglePullInfoSection(user);

      expect(await screen.findByText(/sudo podman pull/i)).toBeInTheDocument();
    });

    test('displays info alert when images are available', async () => {
      renderImageSourceSelect();
      const user = createUser();

      await togglePullInfoSection(user);

      expect(
        await screen.findByRole('heading', {
          name: /note on pulling images/i,
        }),
      ).toBeInTheDocument();
    });

    test('collapses section when clicked again', async () => {
      renderImageSourceSelect();
      const user = createUser();

      await togglePullInfoSection(user);
      await togglePullInfoSection(user);

      expect(
        await screen.findByRole('button', {
          name: /show information about pulling images/i,
        }),
      ).toBeInTheDocument();
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
    test('does not display pull info section', async () => {
      renderHostedImageSourceSelect();

      // Wait for the component to render
      await screen.findByText('Image source');

      expect(
        screen.queryByRole('button', {
          name: /information about pulling images/i,
        }),
      ).not.toBeInTheDocument();
    });

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

    test('displays all distro names including non-RHEL in dropdown', async () => {
      renderImageSourceSelect();
      const user = createUser();

      const toggle = await screen.findByRole('button', {
        name: /red hat enterprise linux \(rhel\) 10/i,
      });
      await clickWithWait(user, toggle);

      expect(
        screen.getByRole('option', {
          name: /red hat enterprise linux \(rhel\) 10/i,
        }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('option', { name: /fedora 44/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('option', { name: /centos stream 10/i }),
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

      // Wait for auto-select
      await waitFor(() => {
        expect(selectImageSourceState(store.getState())).toBe(
          'registry.redhat.io/rhel10/rhel-bootc:rhel-10',
        );
      });

      const toggle = await screen.findByRole('button', {
        name: /red hat enterprise linux \(rhel\) 10/i,
      });
      await clickWithWait(user, toggle);
      const fedoraOption = await screen.findByRole('option', {
        name: /fedora 44/i,
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

      const toggle = await screen.findByRole('button', {
        name: /red hat enterprise linux \(rhel\) 10/i,
      });
      await clickWithWait(user, toggle);
      const centosOption = await screen.findByRole('option', {
        name: /centos stream 10/i,
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

      const toggle = await screen.findByRole('button', {
        name: /red hat enterprise linux \(rhel\) 10/i,
      });
      await clickWithWait(user, toggle);
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
    test('on-prem shows all distributions including minor versions', async () => {
      mockUseGetDistributionsQuery.mockReturnValue({
        data: mockBootcDistributionsWithMinorVersions,
        isLoading: false,
        isError: false,
        refetch: mockRefetch,
      });

      renderImageSourceSelect();
      const user = createUser();

      const toggle = await screen.findByRole('button', {
        name: /red hat enterprise linux \(rhel\) 10/i,
      });
      await clickWithWait(user, toggle);

      const options = screen.getAllByRole('option');
      expect(options).toHaveLength(3);
      expect(options[0]).toHaveTextContent(
        'Red Hat Enterprise Linux (RHEL) 10',
      );
      expect(options[1]).toHaveTextContent(
        'Red Hat Enterprise Linux (RHEL) 10.1',
      );
      expect(options[2]).toHaveTextContent('Red Hat Enterprise Linux (RHEL) 9');
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
