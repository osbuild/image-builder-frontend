import { screen } from '@testing-library/react';

import { selectImageTypes } from '@/store/slices/wizard';
import { server } from '@/test/mocks/server';
import { createUser, fetchMock } from '@/test/testUtils';

import {
  clickTargetCard,
  clickTargetCheckbox,
  renderTargetEnvironment,
} from './helpers';
import {
  createCustomArchitecturesHandler,
  createDefaultFetchHandler,
  mockArchitecturesWithNetworkInstaller,
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

      expect(await screen.findByTestId('target-select')).toBeInTheDocument();
    });

    test('shows public cloud targets for x86_64', async () => {
      renderTargetEnvironment();

      expect(
        await screen.findByRole('button', { name: /Amazon Web Services/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /Google Cloud/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /Microsoft Azure/i }),
      ).toBeInTheDocument();
    });

    test('shows other target options', async () => {
      renderTargetEnvironment();

      await screen.findByRole('button', { name: /Amazon Web Services/i });

      expect(
        screen.getByRole('checkbox', { name: /Virtualization guest image/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('checkbox', { name: /Bare metal installer/i }),
      ).toBeInTheDocument();
    });

    test('shows required indicator', async () => {
      renderTargetEnvironment();

      const formGroup = await screen.findByTestId('target-select');
      expect(formGroup).toHaveTextContent('*');
    });
  });

  describe('Target selection', () => {
    test('clicking AWS card properly adds and removes aws from image types', async () => {
      const user = createUser();
      const { store } = renderTargetEnvironment();

      await clickTargetCard(user, /Amazon Web Services/i);
      expect(selectImageTypes(store.getState())).toContain('aws');

      await clickTargetCard(user, /Amazon Web Services/i);
      expect(selectImageTypes(store.getState())).not.toContain('aws');
    });

    test('clicking Google Cloud card adds gcp to image types', async () => {
      const user = createUser();
      const { store } = renderTargetEnvironment();

      await clickTargetCard(user, /Google Cloud/i);

      expect(selectImageTypes(store.getState())).toContain('gcp');
    });

    test('clicking Azure card adds azure to image types', async () => {
      const user = createUser();
      const { store } = renderTargetEnvironment();

      await clickTargetCard(user, /Microsoft Azure/i);

      expect(selectImageTypes(store.getState())).toContain('azure');
    });

    test('clicking guest image checkbox properly addd and removes guest-image from image types', async () => {
      const user = createUser();
      const { store } = renderTargetEnvironment();

      await screen.findByRole('button', { name: /Amazon Web Services/i });
      await clickTargetCheckbox(user, /Virtualization guest image/i);
      expect(selectImageTypes(store.getState())).toContain('guest-image');

      await clickTargetCheckbox(user, /Virtualization guest image/i);
      expect(selectImageTypes(store.getState())).not.toContain('guest-image');
    });

    test('clicking bare metal checkbox adds image-installer to image types', async () => {
      const user = createUser();
      const { store } = renderTargetEnvironment();

      await screen.findByRole('button', { name: /Amazon Web Services/i });
      await clickTargetCheckbox(user, /Bare metal installer/i);

      expect(selectImageTypes(store.getState())).toContain('image-installer');
    });

    test('can select multiple targets', async () => {
      const user = createUser();
      const { store } = renderTargetEnvironment();

      await clickTargetCard(user, /Amazon Web Services/i);
      await clickTargetCard(user, /Google Cloud/i);
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

      await screen.findByRole('button', { name: /Amazon Web Services/i });
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

      await screen.findByRole('checkbox', { name: /Network - Installer/i });

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
        name: /Network - Installer/i,
      });

      expect(networkInstallerCheckbox).toBeDisabled();
    });

    test('network installer checkbox is enabled when no other targets selected', async () => {
      renderTargetEnvironment();

      const networkInstallerCheckbox = await screen.findByRole('checkbox', {
        name: /Network - Installer/i,
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
});
