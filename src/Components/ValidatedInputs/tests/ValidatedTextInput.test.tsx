import React, { type ComponentProps } from 'react';

import { fireEvent, screen } from '@testing-library/react';
import { Provider } from 'react-redux';

import type { ValidationIssue, ValidationResult } from '@/store/slices/wizard';
import {
  renderWithRedux,
  type WizardStateOverrides,
} from '@/test/testUtils/renderUtils';

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

const onChange = vi.fn();
const onCommit = vi.fn();

const renderComponent = (
  props: Partial<ComponentProps<typeof ValidatedTextInput>> = {},
  wizardState: WizardStateOverrides = {},
) => {
  const defaultProps: ComponentProps<typeof ValidatedTextInput> = {
    ariaLabel: 'Name',
    value: '',
    validator: requiredValidator,
    onChange,
    onCommit,
  };

  const view = renderWithRedux(
    <ValidatedTextInput {...defaultProps} {...props} />,
    wizardState,
  );

  return {
    ...view,
    rerender: (nextProps: Partial<ComponentProps<typeof ValidatedTextInput>>) =>
      view.rerender(
        <Provider store={view.store}>
          <ValidatedTextInput {...defaultProps} {...props} {...nextProps} />
        </Provider>,
      ),
  };
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

  it('registers invalid input and clears the blocker when corrected', () => {
    const { store, rerender } = renderComponent();

    expect(store.getState().wizard.validation.pendingInputs).toHaveLength(1);

    rerender({ value: 'valid-name' });

    expect(store.getState().wizard.validation.pendingInputs).toEqual([]);
    expect(onCommit).not.toHaveBeenCalled();
  });

  it('does not block navigation while disabled', () => {
    const { store, rerender } = renderComponent({ isDisabled: true });

    expect(store.getState().wizard.validation.pendingInputs).toEqual([]);

    rerender({ isDisabled: false });
    expect(store.getState().wizard.validation.pendingInputs).toHaveLength(1);

    rerender({ isDisabled: true });
    expect(store.getState().wizard.validation.pendingInputs).toEqual([]);
  });

  it('removes only its own blocker when an input unmounts', () => {
    const first = (
      <ValidatedTextInput
        key='first'
        ariaLabel='First'
        value=''
        validator={requiredValidator}
        onCommit={onCommit}
      />
    );
    const second = (
      <ValidatedTextInput
        key='second'
        ariaLabel='Second'
        value=''
        validator={requiredValidator}
        onCommit={onCommit}
      />
    );
    const { store, rerender, unmount } = renderWithRedux(
      <>
        {first}
        {second}
      </>,
    );
    const pending = store.getState().wizard.validation.pendingInputs;
    expect(pending).toHaveLength(2);

    rerender(
      <Provider store={store}>
        <>{second}</>
      </Provider>,
    );
    expect(store.getState().wizard.validation.pendingInputs).toEqual([
      pending[1],
    ]);

    unmount();
    expect(store.getState().wizard.validation.pendingInputs).toEqual([]);
  });

  it('reveals pristine errors when the wizard requests them', () => {
    renderComponent(
      {},
      { validation: { forceShowErrors: true, pendingInputs: [] } },
    );

    expect(screen.getByText('Required')).toBeInTheDocument();
    expect(screen.getByRole('textbox', { name: 'Name' })).toHaveAttribute(
      'aria-invalid',
      'true',
    );
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

  it('commits validated data on blur', () => {
    const { store } = renderComponent({ value: 'valid-name' });

    fireEvent.blur(screen.getByRole('textbox', { name: 'Name' }));

    expect(onCommit).toHaveBeenCalledWith('valid-name');
    expect(store.getState().wizard.validation.pendingInputs).toEqual([]);
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
    const { store } = renderComponent({
      validator: () => ({ errors: [], warnings: [warning] }),
    });

    const input = screen.getByRole('textbox', { name: 'Name' });

    expect(screen.getByText('Potential issue')).toBeInTheDocument();
    expect(screen.getByText(/warning status/)).toBeInTheDocument();
    expect(input).not.toHaveAttribute('aria-invalid');
    expect(input).toHaveAccessibleDescription(/Potential issue/);
    expect(store.getState().wizard.validation.pendingInputs).toEqual([]);
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
