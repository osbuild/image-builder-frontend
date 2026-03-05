import { screen } from '@testing-library/react';

import { createUser } from '@/test/testUtils';

import {
  addKernelArgument,
  clearKernelName,
  openKernelNameDropdown,
  removeKernelArgument,
  renderKernelStep,
  selectKernelOption,
  typeKernelName,
} from './helpers';

describe('Kernel Component', () => {
  describe('Rendering', () => {
    test('displays step title and description', async () => {
      renderKernelStep();

      expect(
        await screen.findByRole('heading', { name: /Kernel/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          /Choose a kernel package and append specific boot parameters/i,
        ),
      ).toBeInTheDocument();
    });

    test('displays kernel name dropdown and arguments input', async () => {
      renderKernelStep();

      expect(
        await screen.findByPlaceholderText(/Select default kernel/i),
      ).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText(/Add kernel argument/i),
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          /Enter additional kernel boot parameters\. Examples: nomodeset or console=ttyS0\./i,
        ),
      ).toBeInTheDocument();
    });
  });

  describe('Kernel Name Selection', () => {
    test('shows default kernel options', async () => {
      renderKernelStep();
      const user = createUser();

      await openKernelNameDropdown(user);

      expect(
        await screen.findByRole('option', { name: 'kernel' }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('option', { name: 'kernel-debug' }),
      ).toBeInTheDocument();
    });

    test('can select a kernel from dropdown', async () => {
      renderKernelStep();
      const user = createUser();

      await openKernelNameDropdown(user);
      await selectKernelOption(user, 'kernel-debug');

      const dropdown = await screen.findByPlaceholderText(
        /Select default kernel/i,
      );
      expect(dropdown).toHaveValue('kernel-debug');
    });

    test('shows custom kernel package option when typing', async () => {
      renderKernelStep();
      const user = createUser();

      await typeKernelName(user, 'my-custom-kernel');

      expect(
        screen.getByRole('option', {
          name: /Custom kernel package "my-custom-kernel"/i,
        }),
      ).toBeInTheDocument();
    });

    test('adds custom kernel to options after selection', async () => {
      renderKernelStep();
      const user = createUser();

      await typeKernelName(user, 'custom-kernel-pkg');
      await selectKernelOption(user, /Custom kernel package/i);

      expect(
        screen.getByText(/Custom kernel packages cannot be validated/i),
      ).toBeInTheDocument();

      await openKernelNameDropdown(user);
      expect(
        screen.getByRole('option', { name: 'custom-kernel-pkg' }),
      ).toBeInTheDocument();
    });

    test('shows invalid name message for invalid kernel name', async () => {
      renderKernelStep();
      const user = createUser();

      await typeKernelName(user, '-----------');

      expect(
        screen.getByRole('option', {
          name: /"-----------" is not a valid kernel package name/i,
        }),
      ).toBeInTheDocument();

      const invalidOption = screen.getByRole('option', {
        name: /is not a valid kernel package name/i,
      });
      expect(invalidOption).toBeDisabled();
    });

    test('can clear kernel name selection', async () => {
      renderKernelStep();
      const user = createUser();

      await openKernelNameDropdown(user);
      await selectKernelOption(user, 'kernel');

      const dropdown = await screen.findByPlaceholderText(
        /Select default kernel/i,
      );
      expect(dropdown).toHaveValue('kernel');

      await clearKernelName(user);
      expect(dropdown).toHaveValue('');
    });
  });

  describe('Kernel Arguments', () => {
    test('can add a kernel argument', async () => {
      renderKernelStep();
      const user = createUser();

      await addKernelArgument(user, 'nosmt=force');

      expect(screen.getByText('nosmt=force')).toBeInTheDocument();
    });

    test('can add multiple kernel arguments', async () => {
      renderKernelStep();
      const user = createUser();

      await addKernelArgument(user, 'nosmt=force');
      await addKernelArgument(user, 'page_poison=1');

      expect(screen.getByText('nosmt=force')).toBeInTheDocument();
      expect(screen.getByText('page_poison=1')).toBeInTheDocument();
    });

    test('can remove a kernel argument', async () => {
      renderKernelStep();
      const user = createUser();

      await addKernelArgument(user, 'nosmt=force');
      await screen.findByText('nosmt=force');

      await removeKernelArgument(user, 'nosmt=force');

      expect(screen.queryByText('nosmt=force')).not.toBeInTheDocument();
    });

    test('shows validation error for invalid argument', async () => {
      renderKernelStep();
      const user = createUser();

      await addKernelArgument(user, 'invalid$argument');

      expect(
        screen.getByText(/Expected format: <kernel-argument>/i),
      ).toBeInTheDocument();
    });
  });

  describe('Initial State', () => {
    test('renders with pre-populated kernel name from state', async () => {
      renderKernelStep({
        kernel: {
          name: 'kernel-debug',
          append: [],
        },
      });

      const dropdown = await screen.findByPlaceholderText(
        /Select default kernel/i,
      );
      expect(dropdown).toHaveValue('kernel-debug');
    });

    test('renders with pre-populated kernel arguments from state', async () => {
      renderKernelStep({
        kernel: {
          name: '',
          append: ['nosmt=force', 'audit=1'],
        },
      });

      expect(screen.getByText('nosmt=force')).toBeInTheDocument();
      expect(screen.getByText('audit=1')).toBeInTheDocument();
    });
  });

  describe('State Updates', () => {
    test('updates store when kernel name is selected', async () => {
      const { store } = renderKernelStep();
      const user = createUser();

      expect(store.getState().wizard.kernel.name).toBe('');

      await openKernelNameDropdown(user);
      await selectKernelOption(user, 'kernel-debug');

      expect(store.getState().wizard.kernel.name).toBe('kernel-debug');
    });

    test('updates store when kernel argument is added', async () => {
      const { store } = renderKernelStep();
      const user = createUser();

      expect(store.getState().wizard.kernel.append).toHaveLength(0);

      await addKernelArgument(user, 'nosmt=force');

      expect(store.getState().wizard.kernel.append).toContain('nosmt=force');
    });

    test('updates store when multiple kernel arguments are added', async () => {
      const { store } = renderKernelStep();
      const user = createUser();

      await addKernelArgument(user, 'nosmt=force');
      await addKernelArgument(user, 'page_poison=1');

      const append = store.getState().wizard.kernel.append;
      expect(append).toContain('nosmt=force');
      expect(append).toContain('page_poison=1');
    });

    test('updates store when kernel argument is removed', async () => {
      const { store } = renderKernelStep({
        kernel: {
          name: '',
          append: ['nosmt=force'],
        },
      });
      const user = createUser();

      expect(store.getState().wizard.kernel.append).toContain('nosmt=force');

      await removeKernelArgument(user, 'nosmt=force');

      expect(store.getState().wizard.kernel.append).not.toContain(
        'nosmt=force',
      );
    });
  });
});
