import { screen } from '@testing-library/react';

import { createUser } from '@/test/testUtils';

import { renderBlueprintMode, toggleBlueprintMode } from './helpers';

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

    test('updates distribution when switching to image mode', async () => {
      const { store } = renderBlueprintMode();
      const user = createUser();

      await toggleBlueprintMode(user, 'image');

      expect(store.getState().wizard.distribution).toBe('image-mode');
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
});
