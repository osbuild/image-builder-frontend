import { fireEvent, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';

import { initialState } from '@/store/slices/wizard';
import { createUser } from '@/test/testUtils';

import { renderBlueprintMode, toggleBlueprintMode } from './helpers';

const mockGetHostDistro = vi.fn();

vi.mock('@/store/api/backend', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/store/api/backend')>();
  return {
    ...actual,
    getHostDistro: () => mockGetHostDistro(),
  };
});

describe('BlueprintMode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetHostDistro.mockResolvedValue('rhel-10');
  });

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
      renderBlueprintMode({
        details: {
          ...initialState.details,
          blueprint: { ...initialState.details.blueprint, mode: 'image' },
        },
      });

      expect(
        await screen.findByText(
          /rhel image mode treats the entire operating system as a single, immutable/i,
        ),
      ).toBeInTheDocument();
    });

    test('can switch back to package mode', async () => {
      renderBlueprintMode({
        details: {
          ...initialState.details,
          blueprint: { ...initialState.details.blueprint, mode: 'image' },
        },
      });
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

      expect(store.getState().wizard.details.blueprint.mode).toBe('package');

      await toggleBlueprintMode(user, 'image');

      expect(store.getState().wizard.details.blueprint.mode).toBe('image');
    });

    test('does not change distribution when switching to image mode', async () => {
      const { store } = renderBlueprintMode();
      const user = createUser();
      const distributionBefore = store.getState().wizard.output.distribution;

      await toggleBlueprintMode(user, 'image');

      expect(store.getState().wizard.output.distribution).toBe(
        distributionBefore,
      );
    });

    test('updates store when switching to package mode', async () => {
      const { store } = renderBlueprintMode({
        details: {
          ...initialState.details,
          blueprint: { ...initialState.details.blueprint, mode: 'image' },
        },
      });
      const user = createUser();

      await toggleBlueprintMode(user, 'package');

      expect(store.getState().wizard.details.blueprint.mode).toBe('package');
    });

    test('renders with pre-populated image mode from state', async () => {
      renderBlueprintMode({
        details: {
          ...initialState.details,
          blueprint: { ...initialState.details.blueprint, mode: 'image' },
        },
      });

      const imageModeButton = await screen.findByRole('button', {
        name: /image mode/i,
      });
      expect(imageModeButton).toHaveAttribute('aria-pressed', 'true');
    });
  });

  describe('Host distro gating', () => {
    // The toggle is re-parented into the tooltip wrapper once the host
    // distro fetch resolves, so queries must run inside the waits.
    test('enables image mode on a RHEL 10 host', async () => {
      renderBlueprintMode();

      const imageModeButton = await screen.findByRole('button', {
        name: /image mode/i,
      });
      expect(imageModeButton).toBeEnabled();
      expect(
        screen.queryByTestId('image-mode-toggle-wrapper'),
      ).not.toBeInTheDocument();
    });

    test('disables image mode on a Fedora host', async () => {
      mockGetHostDistro.mockResolvedValue('fedora-43');

      renderBlueprintMode();

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /image mode/i }),
        ).toBeDisabled();
      });
    });

    test('disables image mode on a CentOS Stream host', async () => {
      mockGetHostDistro.mockResolvedValue('centos-10');

      renderBlueprintMode();

      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /image mode/i }),
        ).toBeDisabled();
      });
    });

    test('shows a coming soon tooltip on non-RHEL hosts', async () => {
      mockGetHostDistro.mockResolvedValue('fedora-43');

      renderBlueprintMode();

      const wrapper = await screen.findByTestId('image-mode-toggle-wrapper');
      fireEvent.mouseEnter(wrapper);

      expect(
        await screen.findByText(
          /image mode is currently available only on rhel 10 hosts/i,
        ),
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          /support for centos stream and fedora is coming soon/i,
        ),
      ).toBeInTheDocument();
    });
  });
});
