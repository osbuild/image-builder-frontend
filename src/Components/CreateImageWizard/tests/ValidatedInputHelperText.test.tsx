import React from 'react';

import { render, screen } from '@testing-library/react';

import type { ValidationResult } from '@/store/slices/wizard/types';

import ValidatedInputHelperText from '../ValidatedInputHelperText';

describe('ValidatedInputHelperText', () => {
  it('renders each validation error', () => {
    const errors: ValidationResult = [
      { kind: 'format', message: 'Invalid value', value: 'bad' },
      { kind: 'duplicate', message: 'Duplicate value', value: 'bad' },
    ];

    render(<ValidatedInputHelperText errors={errors} />);

    expect(screen.getByText('Invalid value')).toBeInTheDocument();
    expect(screen.getByText('Duplicate value')).toBeInTheDocument();
  });

  it('renders the helper text when there are no errors', () => {
    render(
      <ValidatedInputHelperText
        errors={[]}
        helperText='Press Enter to add an item'
      />,
    );

    expect(screen.getByText('Press Enter to add an item')).toBeInTheDocument();
  });

  it('renders nothing when there are no errors or helper text', () => {
    const { container } = render(<ValidatedInputHelperText errors={[]} />);

    expect(container).toBeEmptyDOMElement();
  });
});
