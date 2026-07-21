import React, { type ComponentProps } from 'react';

import { render, screen } from '@testing-library/react';

import {
  clickWithWait,
  createUser,
  keyboardWithWait,
  typeWithWait,
} from '@/test/testUtils';

import LabelInput from '../LabelInput';
import type { StepValidation } from '../utilities/useValidation';

const { dispatchMock } = vi.hoisted(() => ({
  dispatchMock: vi.fn(),
}));

vi.mock('@/store/hooks', () => ({
  useAppDispatch: () => dispatchMock,
}));

const stepValidation: StepValidation = {
  errors: {},
  disabledNext: false,
};

const renderLabelInput = (
  props: Partial<ComponentProps<typeof LabelInput>> = {},
) => {
  const defaultProps: ComponentProps<typeof LabelInput> = {
    ariaLabel: 'Label input',
    placeholder: 'Add label',
    validator: (value) => /^[a-z-]+$/.test(value),
    list: [],
    item: 'Item',
    addAction: (value) => ({ type: 'test/add', payload: value }),
    removeAction: (value) => ({ type: 'test/remove', payload: value }),
    stepValidation,
    fieldName: 'groups',
  };

  return render(<LabelInput {...defaultProps} {...props} />);
};

describe('LabelInput', () => {
  beforeEach(() => {
    dispatchMock.mockClear();
  });

  test('does not dispatch for empty input via Add button or Enter', async () => {
    renderLabelInput();
    const user = createUser();

    const input = screen.getByPlaceholderText('Add label');
    const addButton = screen.getByRole('button', { name: 'Add' });

    await clickWithWait(user, addButton);
    await clickWithWait(user, input);
    await keyboardWithWait(user, '{Enter}');

    expect(dispatchMock).not.toHaveBeenCalled();
  });

  test('dispatches add action when clicking Add with a valid value', async () => {
    renderLabelInput();
    const user = createUser();

    const input = screen.getByPlaceholderText('Add label');
    await typeWithWait(user, input, 'admins');
    await clickWithWait(user, screen.getByRole('button', { name: 'Add' }));

    expect(dispatchMock).toHaveBeenCalledWith({
      type: 'test/add',
      payload: 'admins',
    });
    expect(input).toHaveValue('');
  });

  test('dispatches add action when pressing Enter with a valid value', async () => {
    renderLabelInput();
    const user = createUser();

    const input = screen.getByPlaceholderText('Add label');
    await typeWithWait(user, input, 'wheel{Enter}');

    expect(dispatchMock).toHaveBeenCalledWith({
      type: 'test/add',
      payload: 'wheel',
    });
    expect(input).toHaveValue('');
  });

  test('shows duplicate error when an item already exists', async () => {
    renderLabelInput({ list: ['admins'] });
    const user = createUser();

    await typeWithWait(
      user,
      screen.getByPlaceholderText('Add label'),
      'admins',
    );
    await clickWithWait(user, screen.getByRole('button', { name: 'Add' }));

    expect(screen.getByText('Item already exists.')).toBeInTheDocument();
    expect(dispatchMock).not.toHaveBeenCalled();
  });

  test('shows field-specific validation error for invalid input', async () => {
    renderLabelInput({
      validator: () => false,
      fieldName: 'groups',
    });
    const user = createUser();

    await typeWithWait(
      user,
      screen.getByPlaceholderText('Add label'),
      'invalid value',
    );
    await clickWithWait(user, screen.getByRole('button', { name: 'Add' }));

    expect(
      screen.getByText('Expected format: <group-name>. Example: admin'),
    ).toBeInTheDocument();
    expect(dispatchMock).not.toHaveBeenCalled();
  });

  test('dispatches remove action when removing a chip', async () => {
    renderLabelInput({ list: ['admins'] });
    const user = createUser();

    await clickWithWait(
      user,
      screen.getByRole('button', { name: 'Remove admins' }),
    );

    expect(dispatchMock).toHaveBeenCalledWith({
      type: 'test/remove',
      payload: 'admins',
    });
  });
});
