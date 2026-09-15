import React, { type ComponentProps } from 'react';

import { fireEvent, render, screen } from '@testing-library/react';

import type {
  ValidationIssue,
  ValidationResult,
} from '@/store/slices/wizard/types';

import { ValidatedTextInput } from '../ValidatedTextInput';

const requiredValidator = (value: string): ValidationResult => ({
  errors: value === '' ? [{ message: 'Required', kind: 'format', value }] : [],
});

const warning: ValidationIssue = {
  message: 'Potential issue',
  kind: 'format',
  value: 'warning-value',
};

const onChange = vi.fn();

const renderComponent = (
  props: Partial<ComponentProps<typeof ValidatedTextInput>> = {},
) => {
  const defaultProps: ComponentProps<typeof ValidatedTextInput> = {
    ariaLabel: 'Name',
    value: '',
    validator: requiredValidator,
    onChange,
  };

  return render(<ValidatedTextInput {...defaultProps} {...props} />);
};

describe('ValidatedTextInput', () => {
  beforeEach(() => {
    onChange.mockClear();
  });

  it('does not show validation errors before interaction', () => {
    renderComponent();

    expect(screen.queryByText('Required')).not.toBeInTheDocument();
  });

  it('shows validation errors after blur', () => {
    renderComponent();

    const input = screen.getByRole('textbox', { name: 'Name' });
    fireEvent.blur(input);

    expect(screen.getByText('Required')).toBeInTheDocument();
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription(/Required/);
  });

  it('shows validation errors when showErrors is true', () => {
    renderComponent({ showErrors: true });

    expect(screen.getByText('Required')).toBeInTheDocument();
  });

  it('renders helper text when there are no displayed issues', () => {
    renderComponent({ helperText: 'Use a descriptive name' });

    const input = screen.getByRole('textbox', { name: 'Name' });

    expect(screen.getByText('Use a descriptive name')).toBeInTheDocument();
    expect(input).toHaveAccessibleDescription('Use a descriptive name');
  });

  it('renders warnings returned by the validator', () => {
    renderComponent({
      validator: () => ({ errors: [], warnings: [warning] }),
    });

    const input = screen.getByRole('textbox', { name: 'Name' });

    expect(screen.getByText('Potential issue')).toBeInTheDocument();
    expect(screen.getByText(/warning status/)).toBeInTheDocument();
    expect(input).not.toHaveAttribute('aria-invalid');
    expect(input).toHaveAccessibleDescription(/Potential issue/);
  });

  it('renders helper text when warnings is an empty array', () => {
    renderComponent({
      helperText: 'Use a descriptive name',
      validator: () => ({ errors: [], warnings: [] }),
    });

    expect(screen.getByText('Use a descriptive name')).toBeInTheDocument();
  });

  it('renders errors instead of warnings', () => {
    renderComponent({
      showErrors: true,
      validator: () => ({
        errors: [{ message: 'Required', kind: 'format' }],
        warnings: [warning],
      }),
    });

    expect(screen.getByText('Required')).toBeInTheDocument();
    expect(screen.getByText(/error status/)).toBeInTheDocument();
    expect(screen.queryByText('Potential issue')).not.toBeInTheDocument();
    expect(screen.queryByText(/warning status/)).not.toBeInTheDocument();
  });

  it('calls handleClear from the clear button', () => {
    const handleClear = vi.fn();
    renderComponent({
      value: 'existing-name',
      validator: () => ({ errors: [] }),
      handleClear,
    });

    fireEvent.click(screen.getByRole('button', { name: 'Clear input' }));

    expect(handleClear).toHaveBeenCalledTimes(1);
  });
});
