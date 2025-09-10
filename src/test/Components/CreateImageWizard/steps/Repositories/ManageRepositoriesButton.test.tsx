import React from 'react';

import { configureStore } from '@reduxjs/toolkit';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';

import ManageRepositoriesButton from '../../../../../Components/CreateImageWizard/steps/Repositories/components/ManageRepositoriesButton';
import {
  onPremMiddleware,
  onPremReducer,
  serviceMiddleware,
  serviceReducer,
} from '../../../../../store';

const user = userEvent.setup();

// Mock environment variable
const originalEnv = process.env;

const createTestStore = () => {
  const mw = process.env.IS_ON_PREMISE ? onPremMiddleware : serviceMiddleware;
  const red = process.env.IS_ON_PREMISE ? onPremReducer : serviceReducer;
  return configureStore({
    reducer: red,
    middleware: mw,
  });
};

const renderWithStore = (component: React.ReactElement) => {
  const store = createTestStore();
  return render(<Provider store={store}>{component}</Provider>);
};

beforeEach(() => {
  vi.resetModules();
  process.env = { ...originalEnv };
});

afterEach(() => {
  process.env = originalEnv;
});

describe('ManageRepositoriesButton', () => {
  test('renders external link for hosted service', () => {
    process.env.IS_ON_PREMISE = undefined;
    renderWithStore(<ManageRepositoriesButton />);

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
    renderWithStore(<ManageRepositoriesButton />);

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
    renderWithStore(<ManageRepositoriesButton />);

    // Modal should not be visible initially
    expect(
      screen.queryByRole('dialog', { name: /manage custom repositories/i }),
    ).not.toBeInTheDocument();
  });
});
