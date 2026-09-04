import React, { type ComponentProps } from 'react';

import { render, screen } from '@testing-library/react';

import type { ValidationResult } from '@/store/slices/wizard/types';
import {
  clickWithWait,
  createUser,
  keyboardWithWait,
  typeWithWait,
} from '@/test/testUtils';

import TextInputGroup from '../TextInputGroup';

// Mirrors the real validators: flags format violations and duplicates.
const validator = (values: string[]): ValidationResult => {
  const issues: ValidationResult = [];
  const seen = new Set<string>();
  values.forEach((value) => {
    if (!/^[a-z]+$/.test(value)) {
      issues.push({ message: 'Invalid value', kind: 'format', value });
    }
    if (seen.has(value)) {
      issues.push({ message: 'Duplicate value', kind: 'duplicate', value });
    }
    seen.add(value);
  });
  return issues;
};

const onAdd = vi.fn();
const onRemove = vi.fn();

const renderComponent = (
  props: Partial<ComponentProps<typeof TextInputGroup>> = {},
) => {
  const defaultProps: ComponentProps<typeof TextInputGroup> = {
    ariaLabel: 'Add kernel argument',
    placeholder: 'Add kernel argument',
    validator,
    items: [],
    onAdd,
    onRemove,
  };

  return render(<TextInputGroup {...defaultProps} {...props} />);
};

describe('TextInputGroup', () => {
  beforeEach(() => {
    onAdd.mockClear();
    onRemove.mockClear();
  });

  test('adds a valid value via the Add button and clears the input', async () => {
    renderComponent();
    const user = createUser();

    const input = screen.getByPlaceholderText('Add kernel argument');
    await typeWithWait(user, input, 'quiet');
    await clickWithWait(user, screen.getByRole('button', { name: 'Add' }));

    expect(onAdd).toHaveBeenCalledWith('quiet');
    expect(input).toHaveValue('');
  });

  test('adds a valid value when pressing Enter', async () => {
    renderComponent();
    const user = createUser();

    await typeWithWait(
      user,
      screen.getByPlaceholderText('Add kernel argument'),
      'splash{Enter}',
    );

    expect(onAdd).toHaveBeenCalledWith('splash');
  });

  test('trims surrounding whitespace before adding', async () => {
    renderComponent();
    const user = createUser();

    await typeWithWait(
      user,
      screen.getByPlaceholderText('Add kernel argument'),
      '  quiet  {Enter}',
    );

    expect(onAdd).toHaveBeenCalledWith('quiet');
  });

  test('does not add empty input via the button or Enter', async () => {
    renderComponent();
    const user = createUser();

    const input = screen.getByPlaceholderText('Add kernel argument');
    await clickWithWait(user, screen.getByRole('button', { name: 'Add' }));
    await clickWithWait(user, input);
    await keyboardWithWait(user, '{Enter}');

    expect(onAdd).not.toHaveBeenCalled();
  });

  test('shows a validation error and does not add an invalid value', async () => {
    renderComponent();
    const user = createUser();

    await typeWithWait(
      user,
      screen.getByPlaceholderText('Add kernel argument'),
      'BAD',
    );
    await clickWithWait(user, screen.getByRole('button', { name: 'Add' }));

    expect(screen.getByText('Invalid value')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Add kernel argument'),
    ).toHaveAccessibleDescription(/Invalid value/);
    expect(onAdd).not.toHaveBeenCalled();
  });

  test('clears the validation error when the input changes', async () => {
    renderComponent();
    const user = createUser();

    const input = screen.getByPlaceholderText('Add kernel argument');
    await typeWithWait(user, input, 'BAD');
    await clickWithWait(user, screen.getByRole('button', { name: 'Add' }));
    expect(screen.getByText('Invalid value')).toBeInTheDocument();

    await typeWithWait(user, input, 'x');
    expect(screen.queryByText('Invalid value')).not.toBeInTheDocument();
  });

  test('validates items already present in the store (blueprint restore)', () => {
    renderComponent({ items: [{ value: 'BAD', required: false }] });

    expect(screen.getByText('Invalid value')).toBeInTheDocument();
  });

  test('removes a non-required chip', async () => {
    renderComponent({ items: [{ value: 'quiet', required: false }] });
    const user = createUser();

    await clickWithWait(
      user,
      screen.getByRole('button', { name: 'Remove quiet' }),
    );

    expect(onRemove).toHaveBeenCalledWith('quiet');
  });

  test('renders required items without a remove button', () => {
    renderComponent({ items: [{ value: 'audit', required: true }] });

    expect(screen.getByText('audit')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Remove audit' }),
    ).not.toBeInTheDocument();
  });

  test('gives the add button a label distinct from the input', () => {
    renderComponent();

    const input = screen.getByPlaceholderText('Add kernel argument');
    const addButton = screen.getByRole('button', { name: 'Add' });

    expect(input).not.toBe(addButton);
    expect(addButton).toHaveAccessibleName('Add');
  });

  test('associates the helper text with the input via aria-describedby', () => {
    renderComponent();

    expect(
      screen.getByPlaceholderText('Add kernel argument'),
    ).toHaveAccessibleDescription('Press Enter or click Add.');
  });
});
