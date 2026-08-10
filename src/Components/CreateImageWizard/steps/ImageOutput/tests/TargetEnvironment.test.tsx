import React from 'react';

import { screen } from '@testing-library/react';
import { vi } from 'vitest';

import { RHEL_10 } from '@/constants';
import { Distributions } from '@/store/api/backend';
import {
  initialState,
  selectImageSource,
  selectImageTypes,
} from '@/store/slices/wizard';
import {
  clickWithWait,
  composeHandlers,
  createArchitecturesHandler,
  createUser,
  fetchMock,
  renderWithRedux,
  type WizardStateOverrides,
} from '@/test/testUtils';

import { clickTargetCheckbox, renderTargetEnvironment } from './helpers';
import {
  createCustomArchitecturesHandler,
  createDefaultFetchHandler,
  createDistributionsHandler,
  mockArchitecturesBoth,
  mockArchitecturesWithNetworkInstaller,
  mockBootcDistributions,
  mockBootcDistributionsMultipleTypes,
  setupErrorHandler,
} from './mocks';

import TargetEnvironment from '../components/TargetEnvironment';

fetchMock.enableMocks();

beforeEach(() => {
  fetchMock.mockResponse(createDefaultFetchHandler());
});

afterEach(() => {
  fetchMock.resetMocks();
});

describe('TargetEnvironment', () => {
  describe('Rendering', () => {
    test('renders target environment form group', async () => {
      renderTargetEnvironment();

      expect(
        await screen.findByRole('group', { name: /target environments/i }),
      ).toBeInTheDocument();
    });

    test('shows public cloud targets for x86_64', async () => {
      renderTargetEnvironment();

      expect(
        await screen.findByRole('checkbox', { name: /Amazon Web Services/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('checkbox', { name: /Google Cloud/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('checkbox', { name: /Microsoft Azure/i }),
      ).toBeInTheDocument();
    });

    test('shows other target options', async () => {
      renderTargetEnvironment();

      await screen.findByRole('checkbox', { name: /Amazon Web Services/i });

      expect(
        screen.getByRole('checkbox', { name: /Virtualization guest image/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('checkbox', { name: /Bare metal installer/i }),
      ).toBeInTheDocument();
    });

    test('shows required indicator', async () => {
      renderTargetEnvironment();

      const formGroup = await screen.findByRole('group', {
        name: /target environments/i,
      });
      expect(formGroup).toHaveTextContent('*');
    });
  });

  describe('Target selection', () => {
    test('clicking AWS checkbox properly adds and removes aws from image types', async () => {
      const user = createUser();
      const { store } = renderTargetEnvironment();

      await clickTargetCheckbox(user, /Amazon Web Services/i);
      expect(selectImageTypes(store.getState())).toContain('aws');

      await clickTargetCheckbox(user, /Amazon Web Services/i);
      expect(selectImageTypes(store.getState())).not.toContain('aws');
    });

    test('clicking Google Cloud checkbox adds gcp to image types', async () => {
      const user = createUser();
      const { store } = renderTargetEnvironment();

      await clickTargetCheckbox(user, /Google Cloud/i);

      expect(selectImageTypes(store.getState())).toContain('gcp');
    });

    test('clicking Azure checkbox adds azure to image types', async () => {
      const user = createUser();
      const { store } = renderTargetEnvironment();

      await clickTargetCheckbox(user, /Microsoft Azure/i);

      expect(selectImageTypes(store.getState())).toContain('azure');
    });

    test('clicking guest image checkbox properly addd and removes guest-image from image types', async () => {
      const user = createUser();
      const { store } = renderTargetEnvironment();

      await screen.findByRole('checkbox', { name: /Amazon Web Services/i });
      await clickTargetCheckbox(user, /Virtualization guest image/i);
      expect(selectImageTypes(store.getState())).toContain('guest-image');

      await clickTargetCheckbox(user, /Virtualization guest image/i);
      expect(selectImageTypes(store.getState())).not.toContain('guest-image');
    });

    test('clicking bare metal checkbox adds image-installer to image types', async () => {
      const user = createUser();
      const { store } = renderTargetEnvironment();

      await screen.findByRole('checkbox', { name: /Amazon Web Services/i });
      await clickTargetCheckbox(user, /Bare metal installer/i);

      expect(selectImageTypes(store.getState())).toContain('image-installer');
    });

    test('can select multiple targets', async () => {
      const user = createUser();
      const { store } = renderTargetEnvironment();

      await clickTargetCheckbox(user, /Amazon Web Services/i);
      await clickTargetCheckbox(user, /Google Cloud/i);
      await clickTargetCheckbox(user, /Virtualization guest image/i);

      const imageTypes = selectImageTypes(store.getState());
      expect(imageTypes).toContain('aws');
      expect(imageTypes).toContain('gcp');
      expect(imageTypes).toContain('guest-image');
    });
  });

  describe('Visual state', () => {
    test('checkbox shows checked state when selected', async () => {
      const user = createUser();
      renderTargetEnvironment();

      await screen.findByRole('checkbox', { name: /Amazon Web Services/i });
      const checkbox = screen.getByRole('checkbox', {
        name: /Virtualization guest image/i,
      });

      await clickTargetCheckbox(user, /Virtualization guest image/i);

      expect(checkbox).toBeChecked();
    });
  });

  describe('Network installer behavior', () => {
    beforeEach(() => {
      fetchMock.mockResponse(
        createCustomArchitecturesHandler({
          'rhel-10': mockArchitecturesWithNetworkInstaller,
        }),
      );
    });

    test('disables other targets when network installer is selected', async () => {
      renderTargetEnvironment({
        output: {
          ...initialState.output,
          imageTypes: ['network-installer'],
        },
      });

      await screen.findByRole('checkbox', { name: /Network installer/i });

      expect(
        screen.getByRole('checkbox', { name: /Virtualization guest image/i }),
      ).toBeDisabled();
      expect(
        screen.getByRole('checkbox', { name: /Bare metal installer/i }),
      ).toBeDisabled();
    });

    test('shows info alert when network installer is selected', async () => {
      renderTargetEnvironment({
        output: {
          ...initialState.output,
          imageTypes: ['network-installer'],
        },
      });

      expect(
        await screen.findByText(
          /This image type requires specific, minimal configuration/i,
        ),
      ).toBeInTheDocument();
    });

    test('disables network installer when other targets are selected', async () => {
      renderTargetEnvironment({
        output: {
          ...initialState.output,
          imageTypes: ['guest-image'],
        },
      });

      const networkInstallerCheckbox = await screen.findByRole('checkbox', {
        name: /Network installer/i,
      });

      expect(networkInstallerCheckbox).toBeDisabled();
    });

    test('network installer checkbox is enabled when no other targets selected', async () => {
      renderTargetEnvironment();

      const networkInstallerCheckbox = await screen.findByRole('checkbox', {
        name: /Network installer/i,
      });

      expect(networkInstallerCheckbox).toBeEnabled();
    });
  });

  describe('Loading and error states', () => {
    test('displays loading spinner while fetching architectures', async () => {
      fetchMock.mockResponse(() => new Promise(() => {}));

      renderTargetEnvironment();

      expect(
        await screen.findByText(/loading target environments/i),
      ).toBeInTheDocument();
    });

    test('displays error alert when fetching architectures fails', async () => {
      setupErrorHandler();

      renderTargetEnvironment();

      expect(
        await screen.findByText(/couldn't be loaded/i),
      ).toBeInTheDocument();
    });
  });

  describe('Image mode', () => {
    const imageModeOverrides: WizardStateOverrides = {
      details: {
        ...initialState.details,
        blueprint: { ...initialState.details.blueprint, mode: 'image' },
      },
      output: {
        ...initialState.output,
        distribution: RHEL_10 as Distributions,
      },
    };

    const createImageModeHandler = (
      distributions: typeof mockBootcDistributions,
    ) => {
      return composeHandlers(
        createDistributionsHandler(distributions),
        createArchitecturesHandler({
          architectures: {
            'rhel-10': mockArchitecturesBoth,
          },
        }),
      );
    };

    beforeEach(() => {
      fetchMock.mockResponse(createImageModeHandler(mockBootcDistributions));
    });

    test('renders radio buttons instead of checkboxes', async () => {
      renderTargetEnvironment(imageModeOverrides);

      expect(
        await screen.findByRole('radio', {
          name: /Virtualization.*Guest image/i,
        }),
      ).toBeInTheDocument();

      expect(screen.queryAllByRole('checkbox')).toHaveLength(0);
    });

    test('derives target environments from distributions data', async () => {
      fetchMock.mockResponse(
        createImageModeHandler(mockBootcDistributionsMultipleTypes),
      );

      renderTargetEnvironment(imageModeOverrides);

      expect(
        await screen.findByRole('radio', {
          name: /Virtualization.*Guest image/i,
        }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('radio', { name: /Amazon Web Services/i }),
      ).toBeInTheDocument();
    });

    test('selecting a radio replaces the previous selection', async () => {
      fetchMock.mockResponse(
        createImageModeHandler(mockBootcDistributionsMultipleTypes),
      );

      const user = createUser();
      const { store } = renderTargetEnvironment(imageModeOverrides);

      const guestRadio = await screen.findByRole('radio', {
        name: /Virtualization.*Guest image/i,
      });
      await clickWithWait(user, guestRadio);
      expect(selectImageTypes(store.getState())).toEqual(['guest-image']);

      const awsRadio = screen.getByRole('radio', {
        name: /Amazon Web Services/i,
      });
      await clickWithWait(user, awsRadio);
      expect(selectImageTypes(store.getState())).toEqual(['aws']);
    });

    // On-prem image mode always offers the official image environments,
    // independent of whether an image is selected yet.
    const renderOnPremTargetEnvironment = (
      outputOverrides: Partial<typeof initialState.output> = {},
    ) => {
      return renderWithRedux(
        <TargetEnvironment />,
        {
          ...imageModeOverrides,
          output: {
            ...initialState.output,
            distribution: RHEL_10 as Distributions,
            imageSource: 'registry.redhat.io/rhel10/rhel-bootc-kvm:latest',
            imageTypes: ['guest-image'],
            ...outputOverrides,
          },
        },
        {
          preloadedState: {
            env: { isOnPremise: true },
          },
        },
      );
    };

    test('offers every official image type on-prem', async () => {
      renderOnPremTargetEnvironment();

      expect(
        await screen.findByRole('radio', {
          name: /Virtualization.*Guest image/i,
        }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('radio', { name: /Amazon Web Services/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('radio', { name: /Container installer/i }),
      ).toBeInTheDocument();
    });

    test('offers the same environments when no image is selected', async () => {
      renderOnPremTargetEnvironment({
        imageSource: undefined,
        imageTypes: [],
      });

      expect(
        await screen.findByRole('radio', {
          name: /Virtualization.*Guest image/i,
        }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('radio', { name: /Amazon Web Services/i }),
      ).toBeInTheDocument();
    });

    test('selecting a radio selects the matching official image', async () => {
      // The image selection in the output slice only ships on-prem
      vi.stubEnv('IS_ON_PREMISE', 'true');

      const user = createUser();
      const { store } = renderOnPremTargetEnvironment({
        imageSource: undefined,
        imageTypes: [],
      });

      const guestRadio = await screen.findByRole('radio', {
        name: /Virtualization.*Guest image/i,
      });
      await clickWithWait(user, guestRadio);

      expect(selectImageTypes(store.getState())).toEqual(['guest-image']);
      expect(selectImageSource(store.getState())).toBe(
        'registry.redhat.io/rhel10/rhel-bootc-kvm:latest',
      );

      vi.unstubAllEnvs();
    });

    test('selecting a radio switches the official image to the sibling type', async () => {
      // The image selection in the output slice only ships on-prem
      vi.stubEnv('IS_ON_PREMISE', 'true');

      const user = createUser();
      const { store } = renderOnPremTargetEnvironment();

      const awsRadio = await screen.findByRole('radio', {
        name: /Amazon Web Services/i,
      });
      await clickWithWait(user, awsRadio);

      expect(selectImageTypes(store.getState())).toEqual(['aws']);
      expect(selectImageSource(store.getState())).toBe(
        'registry.redhat.io/rhel10/rhel-bootc-aws:latest',
      );

      vi.unstubAllEnvs();
    });

    test('shows loading state while fetching distributions', async () => {
      fetchMock.mockResponse(() => new Promise(() => {}));

      renderTargetEnvironment(imageModeOverrides);

      expect(
        await screen.findByText(/loading target environments/i),
      ).toBeInTheDocument();
    });

    test('shows error state when distributions fetch fails', async () => {
      setupErrorHandler();

      renderTargetEnvironment(imageModeOverrides);

      expect(
        await screen.findByText(/couldn't be loaded/i),
      ).toBeInTheDocument();
    });
  });
});
