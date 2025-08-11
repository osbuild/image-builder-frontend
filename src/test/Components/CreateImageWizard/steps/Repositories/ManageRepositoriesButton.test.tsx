import React from 'react';

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ManageRepositoriesButton from '../../../../../Components/CreateImageWizard/steps/Repositories/components/ManageRepositoriesButton';

import { render } from '@testing-library/react';

const user = userEvent.setup();

// Mock environment variable
const originalEnv = process.env;

beforeEach(() => {
  jest.resetModules();
  process.env = { ...originalEnv };
});

afterEach(() => {
  process.env = originalEnv;
});

describe('ManageRepositoriesButton', () => {
  test('renders external link for hosted service', () => {
    process.env.IS_ON_PREMISE = undefined;
    render(<ManageRepositoriesButton />);

    const externalLink = screen.getByRole('link', {
      name: /create and manage repositories here/i,
    });
    expect(externalLink).toBeInTheDocument();
    expect(externalLink).toHaveAttribute(
      'href',
      '/insights/content/repositories',
    );
    expect(externalLink).toHaveAttribute('target', '_blank');
  });

  test('renders modal button for on-premise', async () => {
    process.env.IS_ON_PREMISE = 'true';
    render(<ManageRepositoriesButton />);

    const modalButton = screen.getByRole('button', {
      name: /add custom repository/i,
    });
    expect(modalButton).toBeInTheDocument();

    // Click the button to open modal
    await user.click(modalButton);

    // Check that modal opens
    expect(
      screen.getByRole('dialog', { name: /manage custom repositories/i }),
    ).toBeInTheDocument();
  });

  test('does not show modal initially', () => {
    process.env.IS_ON_PREMISE = 'true';
    render(<ManageRepositoriesButton />);

    // Modal should not be visible initially
    expect(
      screen.queryByRole('dialog', { name: /manage custom repositories/i }),
    ).not.toBeInTheDocument();
  });
});
