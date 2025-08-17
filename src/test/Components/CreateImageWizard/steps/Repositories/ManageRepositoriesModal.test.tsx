import React from 'react';

import { configureStore } from '@reduxjs/toolkit';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';

import ManageRepositoriesModal from '../../../../../Components/CreateImageWizard/steps/Repositories/components/ManageRepositoriesModal';
import { serviceMiddleware, serviceReducer } from '../../../../../store';

const user = userEvent.setup();

const mockCreateRepository = vi.fn();

// Mock the hook
vi.mock('../../../../../store/contentSourcesApi', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useCreateRepositoryMutation: () => [
      mockCreateRepository,
      { isLoading: false },
    ],
  };
});

const createTestStore = () => {
  // For this test, we'll use the service store since the mock is already set up for service API
  return configureStore({
    reducer: serviceReducer,
    middleware: serviceMiddleware,
  });
};

const setup = (isOpen = true) => {
  const onClose = vi.fn();
  const store = createTestStore();
  render(
    <Provider store={store}>
      <ManageRepositoriesModal isOpen={isOpen} onClose={onClose} />
    </Provider>,
  );
  return { onClose };
};

describe('ManageRepositoriesModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders modal when open', () => {
    setup();
    expect(
      screen.getByRole('dialog', { name: /manage custom repositories/i }),
    ).toBeInTheDocument();
    expect(screen.getByText('Add Repository')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Enter repository name'),
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('https://example.com/repo/'),
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('-----BEGIN PGP PUBLIC KEY BLOCK-----'),
    ).toBeInTheDocument();
  });

  test('does not render modal when closed', () => {
    setup(false);
    expect(
      screen.queryByRole('dialog', { name: /manage custom repositories/i }),
    ).not.toBeInTheDocument();
  });

  test('validates required fields', async () => {
    setup();
    const createButton = screen.getByRole('button', {
      name: /create repository/i,
    });

    // Button should be disabled when fields are empty
    expect(createButton).toBeDisabled();

    // Fill name but not URL
    await user.type(
      screen.getByPlaceholderText('Enter repository name'),
      'Test Repo',
    );
    expect(createButton).toBeDisabled();

    // Fill URL
    await user.type(
      screen.getByPlaceholderText('https://example.com/repo/'),
      'https://example.com/repo',
    );
    expect(createButton).toBeEnabled();
  });

  test('keeps button disabled with whitespace-only fields', async () => {
    setup();
    const nameInput = screen.getByPlaceholderText('Enter repository name');
    const urlInput = screen.getByPlaceholderText('https://example.com/repo/');
    const createButton = screen.getByRole('button', {
      name: /create repository/i,
    });

    // Initially disabled
    expect(createButton).toBeDisabled();

    // Fill with whitespace only - button should remain disabled
    await user.type(nameInput, '   ');
    await user.type(urlInput, '   ');

    // Button should still be disabled since trim() makes them empty
    expect(createButton).toBeDisabled();
  });

  test('calls onClose when cancel is clicked', async () => {
    const { onClose } = setup();
    const cancelButton = screen.getByRole('button', { name: /cancel/i });

    await user.click(cancelButton);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('fills form fields correctly', async () => {
    setup();

    const nameInput = screen.getByPlaceholderText('Enter repository name');
    const urlInput = screen.getByPlaceholderText('https://example.com/repo/');
    const gpgKeyInput = screen.getByPlaceholderText(
      '-----BEGIN PGP PUBLIC KEY BLOCK-----',
    );

    await user.type(nameInput, 'Test Repository');
    await user.type(urlInput, 'https://example.com/repo/');
    await user.type(gpgKeyInput, '-----BEGIN PGP PUBLIC KEY BLOCK-----');

    expect(nameInput).toHaveValue('Test Repository');
    expect(urlInput).toHaveValue('https://example.com/repo/');
    expect(gpgKeyInput).toHaveValue('-----BEGIN PGP PUBLIC KEY BLOCK-----');
  });
});
