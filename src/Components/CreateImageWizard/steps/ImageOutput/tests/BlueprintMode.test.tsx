import { screen } from '@testing-library/react';

import { AARCH64, RHEL_10, RHEL_9, X86_64 } from '@/constants';
import { createUser } from '@/test/testUtils';

import {
  renderBlueprintMode,
  renderBlueprintModeHosted,
  toggleBlueprintMode,
} from './helpers';

describe('BlueprintMode', () => {
  describe('Rendering', () => {
    test('displays image type label', async () => {
      renderBlueprintMode();

      expect(await screen.findByText(/image type/i)).toBeInTheDocument();
    });

    test('displays package mode button', async () => {
      renderBlueprintMode();

      expect(
        await screen.findByRole('button', { name: /package mode/i }),
      ).toBeInTheDocument();
    });

    test('displays image mode button', async () => {
      renderBlueprintMode();

      expect(
        await screen.findByRole('button', { name: /image mode/i }),
      ).toBeInTheDocument();
    });

    test('package mode is selected by default', async () => {
      renderBlueprintMode();

      const packageModeButton = await screen.findByRole('button', {
        name: /package mode/i,
      });
      expect(packageModeButton).toHaveAttribute('aria-pressed', 'true');
    });

    test('displays package mode description when package mode selected', async () => {
      renderBlueprintMode();

      expect(
        await screen.findByText(
          /rhel in package mode is a system managed by individually installing/i,
        ),
      ).toBeInTheDocument();
    });

    test('shows required indicator', async () => {
      renderBlueprintMode();

      expect(await screen.findByText('Image type')).toBeInTheDocument();
      expect(screen.getByText('*')).toBeInTheDocument();
    });
  });

  describe('Mode Selection', () => {
    test('can select image mode', async () => {
      renderBlueprintMode();
      const user = createUser();

      await toggleBlueprintMode(user, 'image');

      const imageModeButton = await screen.findByRole('button', {
        name: /image mode/i,
      });
      expect(imageModeButton).toHaveAttribute('aria-pressed', 'true');
    });

    test('displays image mode description when image mode selected', async () => {
      renderBlueprintMode({ blueprintMode: 'image' });

      expect(
        await screen.findByText(
          /rhel image mode treats the entire operating system as a single, immutable/i,
        ),
      ).toBeInTheDocument();
    });

    test('can switch back to package mode', async () => {
      renderBlueprintMode({ blueprintMode: 'image' });
      const user = createUser();

      await toggleBlueprintMode(user, 'package');

      const packageModeButton = await screen.findByRole('button', {
        name: /package mode/i,
      });
      expect(packageModeButton).toHaveAttribute('aria-pressed', 'true');
    });
  });

  describe('Redux State', () => {
    test('updates store when switching to image mode', async () => {
      const { store } = renderBlueprintMode();
      const user = createUser();

      expect(store.getState().wizard.blueprintMode).toBe('package');

      await toggleBlueprintMode(user, 'image');

      expect(store.getState().wizard.blueprintMode).toBe('image');
    });

    test('does not change distribution when switching to image mode', async () => {
      const { store } = renderBlueprintMode();
      const user = createUser();
      const distributionBefore = store.getState().wizard.distribution;

      await toggleBlueprintMode(user, 'image');

      expect(store.getState().wizard.distribution).toBe(distributionBefore);
    });

    test('updates store when switching to package mode', async () => {
      const { store } = renderBlueprintMode({ blueprintMode: 'image' });
      const user = createUser();

      await toggleBlueprintMode(user, 'package');

      expect(store.getState().wizard.blueprintMode).toBe('package');
    });

    test('renders with pre-populated image mode from state', async () => {
      renderBlueprintMode({ blueprintMode: 'image' });

      const imageModeButton = await screen.findByRole('button', {
        name: /image mode/i,
      });
      expect(imageModeButton).toHaveAttribute('aria-pressed', 'true');
    });
  });

  describe('Hosted platform behavior', () => {
    test('restores previous distribution when switching back to package mode', async () => {
      const { store } = renderBlueprintModeHosted({ distribution: RHEL_9 });
      const user = createUser();

      // Switch to image mode (saves previous distro)
      await toggleBlueprintMode(user, 'image');
      // Switch back to package mode (restores previous distro)
      await toggleBlueprintMode(user, 'package');

      expect(store.getState().wizard.distribution).toBe(RHEL_9);
    });

    test('restores previous architecture when switching back to package mode', async () => {
      const { store } = renderBlueprintModeHosted({ architecture: AARCH64 });
      const user = createUser();

      await toggleBlueprintMode(user, 'image');
      // Image mode forces x86_64
      expect(store.getState().wizard.architecture).toBe(X86_64);

      await toggleBlueprintMode(user, 'package');
      // Package mode restores previous arch
      expect(store.getState().wizard.architecture).toBe(AARCH64);
    });

    test('sets default image source when switching to image mode', async () => {
      const { store } = renderBlueprintModeHosted();
      const user = createUser();

      await toggleBlueprintMode(user, 'image');

      expect(store.getState().wizard.imageSource).toBeDefined();
    });

    test('forces x86_64 architecture when switching to image mode', async () => {
      const { store } = renderBlueprintModeHosted({ architecture: AARCH64 });
      const user = createUser();

      await toggleBlueprintMode(user, 'image');

      expect(store.getState().wizard.architecture).toBe(X86_64);
    });
  });

  describe('On-prem platform behavior', () => {
    test('does not save or restore previous selections', async () => {
      const { store } = renderBlueprintMode({ distribution: RHEL_9 });
      const user = createUser();

      await toggleBlueprintMode(user, 'image');
      await toggleBlueprintMode(user, 'package');

      // On-prem uses the default distro (RHEL_10 from state), not previous
      expect(store.getState().wizard.distribution).toBe(RHEL_10);
    });

    test('does not set default image source when switching to image mode', async () => {
      const { store } = renderBlueprintMode();
      const user = createUser();

      await toggleBlueprintMode(user, 'image');

      expect(store.getState().wizard.imageSource).toBeUndefined();
    });

    test('does not change architecture when switching to image mode', async () => {
      const { store } = renderBlueprintMode({ architecture: AARCH64 });
      const user = createUser();

      await toggleBlueprintMode(user, 'image');

      // On-prem doesn't force x86_64
      expect(store.getState().wizard.architecture).toBe(AARCH64);
    });
  });
});
