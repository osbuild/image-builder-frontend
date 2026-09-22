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

import { clickTargetRadio, renderTargetEnvironment } from './helpers';
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

    test('shows public cloud targets as radios in create mode', async () => {
      renderTargetEnvironment();

      expect(
        await screen.findByRole('radio', { name: /Amazon Web Services/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('radio', { name: /Google Cloud/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('radio', { name: /Microsoft Azure/i }),
      ).toBeInTheDocument();
    });

    test('shows other target options as radios in create mode', async () => {
      renderTargetEnvironment();

      await screen.findByRole('radio', { name: /Amazon Web Services/i });

      expect(
        screen.getByRole('radio', { name: /Virtualization.*Guest image/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('radio', { name: /Bare metal.*Installer/i }),
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

  describe('Single-target selection (create mode)', () => {
    test('selecting a radio adds the target to image types', async () => {
      const user = createUser();
      const { store } = renderTargetEnvironment();

      await clickTargetRadio(user, /Amazon Web Services/i);
      expect(selectImageTypes(store.getState())).toEqual(['aws']);
    });

    test('selecting a different radio replaces the previous selection', async () => {
      const user = createUser();
      const { store } = renderTargetEnvironment();

      await clickTargetRadio(user, /Amazon Web Services/i);
      expect(selectImageTypes(store.getState())).toEqual(['aws']);

      await clickTargetRadio(user, /Google Cloud/i);
      expect(selectImageTypes(store.getState())).toEqual(['gcp']);
    });

    test('radio shows checked state when selected', async () => {
      const user = createUser();
      renderTargetEnvironment();

      const radio = await screen.findByRole('radio', {
        name: /Amazon Web Services/i,
      });

      await clickTargetRadio(user, /Amazon Web Services/i);

      expect(radio).toBeChecked();
    });

    test('shows singular helper text', async () => {
      renderTargetEnvironment();

      expect(
        await screen.findByText('Select a target environment.'),
      ).toBeInTheDocument();
    });
  });

  describe('Edit mode', () => {
    test('renders radios when editing a single-target blueprint', async () => {
      renderTargetEnvironment({
        output: {
          ...initialState.output,
          imageTypes: ['aws'],
        },
      });

      expect(
        await screen.findByRole('radio', { name: /Amazon Web Services/i }),
      ).toBeInTheDocument();
      expect(screen.queryAllByRole('checkbox')).toHaveLength(0);
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

    test('renders network installer as a radio option', async () => {
      renderTargetEnvironment();

      expect(
        await screen.findByRole('radio', { name: /Network.*Installer/i }),
      ).toBeInTheDocument();
    });

    test('selecting network installer replaces other targets', async () => {
      const user = createUser();
      const { store } = renderTargetEnvironment({
        output: {
          ...initialState.output,
          imageTypes: ['guest-image'],
        },
      });

      await clickTargetRadio(user, /Network.*Installer/i);
      expect(selectImageTypes(store.getState())).toEqual(['network-installer']);
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
