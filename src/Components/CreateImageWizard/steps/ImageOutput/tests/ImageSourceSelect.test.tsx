import React from 'react';

import { screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

import { initialState, selectImageSource } from '@/store/slices/wizard';
import { clickWithWait, createUser, renderWithRedux } from '@/test/testUtils';

import { renderImageSourceSelect } from './helpers';
import {
  mockBootcDistributions,
  mockBootcDistributionsMultipleTypes,
  mockBootcDistributionsNoRhel10,
  mockBootcDistributionsWithMinorVersions,
} from './mocks';

import ImageSourceSelect from '../components/ImageSourceSelect';

const KVM_REF = 'registry.redhat.io/rhel10/rhel-bootc-kvm:latest';
const AWS_REF = 'registry.redhat.io/rhel10/rhel-bootc-aws:latest';

const mockRefetch = vi.fn();
const mockUseGetDistributionsQuery = vi.fn();
const mockUseGetImageExistsQuery = vi.fn();
const mockUseGetRegistryAuthStatusQuery = vi.fn();
const mockUsePullImageMutation = vi.fn();
const mockPullImage = vi.fn();

vi.mock('@/store/api/backend', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/store/api/backend')>();
  return {
    ...actual,
    useGetDistributionsQuery: (...args: unknown[]) =>
      mockUseGetDistributionsQuery(...args),
    useGetRegistryAuthStatusQuery: (...args: unknown[]) =>
      mockUseGetRegistryAuthStatusQuery(...args),
    useGetImageExistsQuery: (...args: unknown[]) =>
      mockUseGetImageExistsQuery(...args),
    usePullImageMutation: (...args: unknown[]) =>
      mockUsePullImageMutation(...args),
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

// The image is implied by the selected target environment; these tests
// preset the resulting state (the radio interaction itself is covered
// by the TargetEnvironment and output slice tests).
const INSTALLER_REF = 'registry.redhat.io/rhel10/rhel-bootc-installer:latest';
// The installer's payload: a distinct, non-cloud-specific base image
const PLAIN_REF = 'registry.redhat.io/rhel10/rhel-bootc:latest';

const renderWithInstaller = () => {
  return renderImageSourceSelect({
    output: {
      ...initialState.output,
      imageSourceType: 'official',
      imageTypes: ['bootable-container-iso'],
      imageSource: INSTALLER_REF,
      isoPayloadReference: PLAIN_REF,
    },
  });
};

const renderWithGuestImage = () => {
  return renderImageSourceSelect({
    output: {
      ...initialState.output,
      imageSourceType: 'official',
      imageTypes: ['guest-image'],
      imageSource: KVM_REF,
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
    mockUseGetImageExistsQuery.mockReturnValue({
      data: true,
      isLoading: false,
      isError: false,
    });
    mockUseGetRegistryAuthStatusQuery.mockReturnValue({
      data: { status: 'authenticated', username: 'testuser' },
      isLoading: false,
      isError: false,
      error: undefined,
    });
    mockUsePullImageMutation.mockReturnValue([
      mockPullImage,
      { isLoading: false, isError: false },
    ]);
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
      expect(screen.queryByText('Login required')).not.toBeInTheDocument();
    });

    test('does not auto-select an image on-prem', async () => {
      const { store } = renderImageSourceSelect();

      await screen.findByText('Image source');

      expect(selectImageSource(store.getState())).toBeUndefined();
    });
  });

  describe('Official images', () => {
    test('shows a hint until a target environment is selected', async () => {
      renderImageSourceSelect();

      expect(await screen.findByText('Bootc container')).toBeInTheDocument();
      expect(
        screen.getByText(
          /select a target environment to see the container image it uses/i,
        ),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: /pull latest image/i }),
      ).not.toBeInTheDocument();
    });

    test('shows the container reference for the selected target environment', async () => {
      renderWithGuestImage();

      expect(await screen.findByDisplayValue(KVM_REF)).toBeInTheDocument();
      expect(
        screen.getByText('Red Hat Enterprise Linux (RHEL) 10.3'),
      ).toBeInTheDocument();
    });

    test('pulls the selected container', async () => {
      renderWithGuestImage();
      const user = createUser();

      const pullButton = await screen.findByRole('button', {
        name: /pull latest image/i,
      });
      await clickWithWait(user, pullButton);

      expect(mockPullImage).toHaveBeenCalledWith({ reference: KVM_REF });
    });

    // Mirrors fixedCacheKey: only the section keyed to this reference sees
    // the pull as in flight.
    const mockPullInFlightFor = (reference: string) => {
      mockUsePullImageMutation.mockImplementation(
        (options?: { fixedCacheKey?: string }) => [
          mockPullImage,
          {
            isLoading: options?.fixedCacheKey === reference,
            isError: false,
          },
        ],
      );
    };

    test('shows the pulling state for the selected image', async () => {
      mockPullInFlightFor(KVM_REF);

      renderWithGuestImage();

      expect(
        await screen.findByRole('button', { name: /pulling image/i }),
      ).toBeInTheDocument();
    });

    test("does not show another image's pull as busy", async () => {
      // A pull of the guest image is in flight while AWS is selected
      mockPullInFlightFor(KVM_REF);

      renderImageSourceSelect({
        output: {
          ...initialState.output,
          imageSourceType: 'official',
          imageTypes: ['aws'],
          imageSource: AWS_REF,
        },
      });

      expect(
        await screen.findByRole('button', { name: /pull latest image/i }),
      ).toBeInTheDocument();
      expect(
        screen.queryByRole('button', { name: /pulling image/i }),
      ).not.toBeInTheDocument();
    });

    test('shows the payload container for the installer', async () => {
      renderWithInstaller();

      expect(await screen.findByText('Payload container')).toBeInTheDocument();
      expect(screen.getByDisplayValue(INSTALLER_REF)).toBeInTheDocument();
      expect(screen.getByDisplayValue(PLAIN_REF)).toBeInTheDocument();
      expect(
        screen.getByText(/the installer deploys this base image/i),
      ).toBeInTheDocument();
    });

    test('does not show the payload container for disk images', async () => {
      renderWithGuestImage();

      await screen.findByDisplayValue(KVM_REF);

      expect(screen.queryByText('Payload container')).not.toBeInTheDocument();
    });

    test('pulls the payload container with its own pull button', async () => {
      renderWithInstaller();
      const user = createUser();

      const pullButtons = await screen.findAllByRole('button', {
        name: /pull latest image/i,
      });
      expect(pullButtons).toHaveLength(2);

      await clickWithWait(user, pullButtons[1]);

      expect(mockPullImage).toHaveBeenCalledWith({ reference: PLAIN_REF });
    });

    test('requires the payload container to be pulled', async () => {
      // The installer image exists locally but its payload does not
      mockUseGetImageExistsQuery.mockImplementation(
        (arg: { reference: string }) => ({
          data: arg.reference !== PLAIN_REF,
          isLoading: false,
          isError: false,
        }),
      );

      renderWithInstaller();

      expect(
        await screen.findByText(
          /payload container must be pulled before proceeding/i,
        ),
      ).toBeInTheDocument();
    });

    test('requires the bootc container to be pulled', async () => {
      mockUseGetImageExistsQuery.mockReturnValue({
        data: false,
        isLoading: false,
        isError: false,
      });

      renderWithGuestImage();

      expect(
        await screen.findByText(
          /bootc container must be pulled before proceeding/i,
        ),
      ).toBeInTheDocument();
    });
  });

  describe('Not logged in', () => {
    beforeEach(() => {
      mockUseGetRegistryAuthStatusQuery.mockReturnValue({
        data: { status: 'unauthenticated' },
        isLoading: false,
        isError: false,
        error: undefined,
      });
    });

    test('displays the login prompt instead of an empty state', async () => {
      renderImageSourceSelect();

      expect(
        await screen.findByText(/log in to pull the latest images/i),
      ).toBeInTheDocument();
      expect(
        screen.queryByText(/login to select an image/i),
      ).not.toBeInTheDocument();
    });

    test('still shows the selected container reference', async () => {
      renderWithGuestImage();

      expect(await screen.findByDisplayValue(KVM_REF)).toBeInTheDocument();
    });

    test('disables the pull button', async () => {
      renderWithGuestImage();
      const user = createUser();

      const pullButton = await screen.findByRole('button', {
        name: /pull latest image/i,
      });
      expect(pullButton).toHaveAttribute('aria-disabled', 'true');

      await clickWithWait(user, pullButton);
      expect(mockPullImage).not.toHaveBeenCalled();
    });

    test('points at the login when a missing image cannot be pulled', async () => {
      mockUseGetImageExistsQuery.mockReturnValue({
        data: false,
        isLoading: false,
        isError: false,
      });

      renderWithGuestImage();

      expect(
        await screen.findByText(/log in to registry\.redhat\.io to pull it/i),
      ).toBeInTheDocument();
    });

    test('login action opens the login form', async () => {
      renderImageSourceSelect();
      const user = createUser();

      const loginButton = await screen.findByRole('button', {
        name: /log in/i,
      });
      await clickWithWait(user, loginButton);

      expect(
        await screen.findByText(/log in to registry\.redhat\.io/i),
      ).toBeInTheDocument();
      expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
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
        await screen.findByText(/local images are coming soon/i),
      ).toBeInTheDocument();
      expect(screen.queryByText(/10\.4/)).not.toBeInTheDocument();
      expect(screen.queryByText('Bootc container')).not.toBeInTheDocument();
    });

    test('displays the image-builder CLI example', async () => {
      renderLocalImageSource();

      expect(
        await screen.findByDisplayValue('sudo podman login registry.redhat.io'),
      ).toBeInTheDocument();
      expect(
        screen.getByDisplayValue(
          'sudo image-builder build qcow2 --bootc-ref registry.redhat.io/rhel10/rhel-bootc',
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
        await screen.findByText(/local images are coming soon/i),
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
        expect(selectImageSource(store.getState())).toBe(
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
        expect(selectImageSource(store.getState())).toBe(
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
