import React, { type ComponentProps } from 'react';

import { fireEvent, screen } from '@testing-library/react';

import type { ValidationIssue, ValidationResult } from '@/store/slices/wizard';
import { renderWithRedux } from '@/test/testUtils';

import { ValidatedTextInput } from '../ValidatedTextInput';

const requiredValidator = (value: string): ValidationResult<string> => ({
  data: value === '' ? undefined : value,
  errors: value === '' ? [{ message: 'Required', kind: 'format', value }] : [],
});

const warning: ValidationIssue = {
  message: 'Potential issue',
  kind: 'format',
  value: 'warning-value',
};

const duplicate: ValidationIssue = {
  message: 'Duplicate name',
  kind: 'duplicate',
  value: 'taken-name',
};

const onChange = vi.fn();
const onCommit = vi.fn();

const renderComponent = (
  props: Partial<ComponentProps<typeof ValidatedTextInput>> = {},
) => {
  const defaultProps: ComponentProps<typeof ValidatedTextInput> = {
    ariaLabel: 'Name',
    value: '',
    validator: requiredValidator,
    onChange,
    onCommit,
  };

  return renderWithRedux(<ValidatedTextInput {...defaultProps} {...props} />);
};

describe('ValidatedTextInput', () => {
  beforeEach(() => {
    onChange.mockClear();
    onCommit.mockClear();
  });

  it('does not show validation errors before interaction', () => {
    renderComponent();

    expect(screen.queryByText('Required')).not.toBeInTheDocument();
  });

  it('shows validation errors after blur without committing invalid data', () => {
    renderComponent();

    const input = screen.getByRole('textbox', { name: 'Name' });
    fireEvent.blur(input);

    expect(screen.getByText('Required')).toBeInTheDocument();
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAccessibleDescription(/Required/);
    expect(onCommit).not.toHaveBeenCalled();
  });

  it('masks password inputs except while focused', () => {
    renderComponent({ value: 'secret', kind: 'password' });

    const input = screen.getByLabelText('Name');

    expect(input).toHaveAttribute('type', 'password');
    fireEvent.focus(input);
    expect(input).toHaveAttribute('type', 'text');
    fireEvent.blur(input);
    expect(input).toHaveAttribute('type', 'password');
  });

  it('calls the supplied onFocus handler', () => {
    const onFocus = vi.fn();
    renderComponent({ onFocus });

    fireEvent.focus(screen.getByLabelText('Name'));

    expect(onFocus).toHaveBeenCalledTimes(1);
  });

  it('tracks pending input after a value change, not on focus', () => {
    const { store } = renderComponent({ value: 'valid-name' });
    const input = screen.getByRole('textbox', { name: 'Name' });

    fireEvent.focus(input);
    expect(store.getState().wizard.validation.pendingInputs).toEqual([]);

    fireEvent.change(input, { target: { value: 'updated-name' } });

    expect(onChange).toHaveBeenCalledWith(expect.anything(), 'updated-name');
    expect(store.getState().wizard.validation.pendingInputs).toHaveLength(1);
  });

  it('removes pending input when unmounted', () => {
    const { store, unmount } = renderComponent({ value: 'valid-name' });
    const input = screen.getByRole('textbox', { name: 'Name' });

    fireEvent.change(input, { target: { value: 'updated-name' } });
    expect(store.getState().wizard.validation.pendingInputs).toHaveLength(1);

    unmount();

    expect(store.getState().wizard.validation.pendingInputs).toEqual([]);
  });

  it('commits validated data on blur', () => {
    renderComponent({ value: 'valid-name' });

    fireEvent.blur(screen.getByRole('textbox', { name: 'Name' }));

    expect(onCommit).toHaveBeenCalledWith('valid-name');
  });

  it('commits duplicates so either side of the conflict can resolve it', () => {
    renderComponent({
      value: 'taken-name',
      validator: (value) => ({ data: value, errors: [duplicate] }),
    });

    const input = screen.getByRole('textbox', { name: 'Name' });
    fireEvent.blur(input);

    expect(onCommit).toHaveBeenCalledWith('taken-name');
    expect(screen.getByText('Duplicate name')).toBeInTheDocument();
    expect(input).toHaveAttribute('aria-invalid', 'true');
  });

  it('does not commit when a duplicate accompanies a format error', () => {
    renderComponent({
      value: 'taken name',
      validator: (value) => ({
        data: value,
        errors: [duplicate, { message: 'Invalid name', kind: 'format', value }],
      }),
    });

    fireEvent.blur(screen.getByRole('textbox', { name: 'Name' }));

    expect(onCommit).not.toHaveBeenCalled();
  });

  it('does not commit errors that are not marked as duplicates', () => {
    renderComponent({
      value: 'some-name',
      validator: (value) => ({ data: value, errors: [{ message: 'Unknown' }] }),
    });

    fireEvent.blur(screen.getByRole('textbox', { name: 'Name' }));

    expect(onCommit).not.toHaveBeenCalled();
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

  it('clears pending input when the clear button is clicked', () => {
    const handleClear = vi.fn();
    const { store } = renderComponent({
      value: 'existing-name',
      validator: () => ({
        errors: [{ message: 'Invalid', kind: 'format' }],
      }),
      handleClear,
    });
    const input = screen.getByRole('textbox', { name: 'Name' });

    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'invalid-draft' } });
    expect(store.getState().wizard.validation.pendingInputs).toHaveLength(1);

    fireEvent.click(screen.getByRole('button', { name: 'Clear input' }));

    expect(handleClear).toHaveBeenCalledTimes(1);
    expect(store.getState().wizard.validation.pendingInputs).toEqual([]);
  });
});
