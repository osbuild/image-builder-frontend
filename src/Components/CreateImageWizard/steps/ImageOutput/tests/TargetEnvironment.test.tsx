import { screen } from '@testing-library/react';

import { RHEL_10 } from '@/constants';
import { Distributions } from '@/store/api/backend';
import { selectImageTypes } from '@/store/slices/wizard';
import { server } from '@/test/mocks/server';
import {
  clickWithWait,
  composeHandlers,
  createArchitecturesHandler,
  createUser,
  fetchMock,
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

fetchMock.enableMocks();

beforeAll(() => {
  server.close();
});

afterAll(() => {
  server.listen();
});

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
      renderTargetEnvironment({ imageTypes: ['network-installer'] });

      await screen.findByRole('checkbox', { name: /Network installer/i });

      expect(
        screen.getByRole('checkbox', { name: /Virtualization guest image/i }),
      ).toBeDisabled();
      expect(
        screen.getByRole('checkbox', { name: /Bare metal installer/i }),
      ).toBeDisabled();
    });

    test('shows info alert when network installer is selected', async () => {
      renderTargetEnvironment({ imageTypes: ['network-installer'] });

      expect(
        await screen.findByText(
          /This image type requires specific, minimal configuration/i,
        ),
      ).toBeInTheDocument();
    });

    test('disables network installer when other targets are selected', async () => {
      renderTargetEnvironment({ imageTypes: ['guest-image'] });

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
      blueprintMode: 'image',
      distribution: RHEL_10 as Distributions,
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
