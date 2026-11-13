import React, { type ComponentProps } from 'react';

import { fireEvent, screen } from '@testing-library/react';

import type { ValidationResult } from '@/store/slices/wizard';
import { renderWithRedux } from '@/test/testUtils';

import { ValidatedTextArea } from '../ValidatedTextArea';

const requiredValidator = (value: string): ValidationResult<string> => ({
  data: value === '' ? undefined : value,
  errors: value === '' ? [{ message: 'Required', kind: 'format', value }] : [],
});

const onCommit = vi.fn();
const onClear = vi.fn();

const renderComponent = (
  props: Partial<ComponentProps<typeof ValidatedTextArea>> = {},
) => {
  const defaultProps: ComponentProps<typeof ValidatedTextArea> = {
    ariaLabel: 'Registration command',
    value: 'valid command',
    validator: requiredValidator,
    onCommit,
  };

  return renderWithRedux(<ValidatedTextArea {...defaultProps} {...props} />);
};

describe('ValidatedTextArea', () => {
  beforeEach(() => {
    onCommit.mockClear();
    onClear.mockClear();
  });

  it('shows validation errors after blur without committing invalid data', () => {
    renderComponent({ value: '' });

    const input = screen.getByRole('textbox', { name: 'Registration command' });
    expect(screen.queryByText('Required')).not.toBeInTheDocument();

    fireEvent.blur(input);

    expect(screen.getByText('Required')).toBeInTheDocument();
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription(/Required/);
    expect(onCommit).not.toHaveBeenCalled();
  });

  it('commits validated data on blur', () => {
    renderComponent();

    fireEvent.blur(
      screen.getByRole('textbox', { name: 'Registration command' }),
    );

    expect(onCommit).toHaveBeenCalledWith('valid command');
  });

  it('clears an empty value on blur', () => {
    renderComponent({ value: '', onClear });

    fireEvent.blur(
      screen.getByRole('textbox', { name: 'Registration command' }),
    );

    expect(onClear).toHaveBeenCalledTimes(1);
    expect(onCommit).not.toHaveBeenCalled();
  });
});
