import { screen, waitFor } from '@testing-library/react';

import { AARCH64, X86_64 } from '@/constants';
import { selectArchitecture } from '@/store/slices/wizard';
import { clickWithWait, createUser } from '@/test/testUtils';

import {
  openArchSelect,
  renderArchSelect,
  renderArchSelectOnPrem,
  selectArch,
} from './helpers';

describe('ArchSelect', () => {
  test('renders with default x86_64 architecture', () => {
    renderArchSelect();

    const toggle = screen.getByTestId('arch_select');
    expect(toggle).toHaveTextContent(X86_64);
  });

  test('shows required indicator', () => {
    renderArchSelect();

    expect(screen.getByText('Architecture')).toBeInTheDocument();
    expect(screen.getByText('*')).toBeInTheDocument();
  });

  test('renders with aarch64 architecture when set in state', () => {
    renderArchSelect({ architecture: AARCH64 });

    const toggle = screen.getByTestId('arch_select');
    expect(toggle).toHaveTextContent(AARCH64);
  });

  test('opens dropdown and shows both architecture options', async () => {
    const user = createUser();
    renderArchSelect();

    await openArchSelect(user);

    expect(screen.getByRole('option', { name: X86_64 })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: AARCH64 })).toBeInTheDocument();
  });

  test('selects aarch64 and updates redux state', async () => {
    const user = createUser();
    const { store } = renderArchSelect();

    await selectArch(user, AARCH64);

    expect(selectArchitecture(store.getState())).toBe(AARCH64);

    const toggle = screen.getByTestId('arch_select');
    expect(toggle).toHaveTextContent(AARCH64);
  });

  test('selects x86_64 after switching from aarch64', async () => {
    const user = createUser();
    const { store } = renderArchSelect({ architecture: AARCH64 });

    await selectArch(user, X86_64);

    expect(selectArchitecture(store.getState())).toBe(X86_64);

    const toggle = screen.getByTestId('arch_select');
    expect(toggle).toHaveTextContent(X86_64);
  });

  test('closes dropdown after selection', async () => {
    const user = createUser();
    renderArchSelect();

    await openArchSelect(user);
    expect(screen.getByRole('listbox')).toBeInTheDocument();

    const option = await screen.findByRole('option', { name: AARCH64 });
    await clickWithWait(user, option);

    await waitFor(() => {
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });

  describe('on-prem (no cross-arch build)', () => {
    test('only shows the current architecture option', async () => {
      const user = createUser();
      renderArchSelectOnPrem();

      await openArchSelect(user);

      expect(screen.getByRole('option', { name: X86_64 })).toBeInTheDocument();
      expect(
        screen.queryByRole('option', { name: AARCH64 }),
      ).not.toBeInTheDocument();
    });

    test('only shows aarch64 when that is the current arch', async () => {
      const user = createUser();
      renderArchSelectOnPrem({ architecture: AARCH64 });

      await openArchSelect(user);

      expect(screen.getByRole('option', { name: AARCH64 })).toBeInTheDocument();
      expect(
        screen.queryByRole('option', { name: X86_64 }),
      ).not.toBeInTheDocument();
    });
  });
});
