import React from 'react';

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ManageRepositoriesModal from '../../../../../Components/CreateImageWizard/steps/Repositories/components/ManageRepositoriesModal';

import { render } from '@testing-library/react';

const user = userEvent.setup();

const mockCreateRepository = jest.fn();

// Mock the hook
jest.mock('../../../../../store/contentSourcesApi', () => ({
  useCreateRepositoryMutation: () => [mockCreateRepository, { isLoading: false }],
}));

const setup = (isOpen = true) => {
  const onClose = jest.fn();
  render(<ManageRepositoriesModal isOpen={isOpen} onClose={onClose} />);
  return { onClose };
};

describe('ManageRepositoriesModal', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders modal when open', () => {
    setup();
    expect(
      screen.getByRole('dialog', { name: /manage custom repositories/i }),
    ).toBeInTheDocument();
    expect(screen.getByText('Add Repository')).toBeInTheDocument();
    expect(screen.getByLabelText('Repository Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Repository URL')).toBeInTheDocument();
    expect(screen.getByLabelText('GPG Key')).toBeInTheDocument();
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
    await user.type(screen.getByLabelText('Repository Name'), 'Test Repo');
    expect(createButton).toBeDisabled();

    // Fill URL
    await user.type(
      screen.getByLabelText('Repository URL'),
      'https://example.com/repo',
    );
    expect(createButton).toBeEnabled();
  });

  test('shows error when name and URL are missing', async () => {
    setup();
    const createButton = screen.getByRole('button', {
      name: /create repository/i,
    });

    // Clear any default values and click create
    await user.clear(screen.getByLabelText('Repository Name'));
    await user.clear(screen.getByLabelText('Repository URL'));
    await user.click(createButton);

    await waitFor(() => {
      expect(
        screen.getByText('Name and URL are required fields.'),
      ).toBeInTheDocument();
    });
  });

  test('calls onClose when cancel is clicked', async () => {
    const { onClose } = setup();
    const cancelButton = screen.getByRole('button', { name: /cancel/i });

    await user.click(cancelButton);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('fills form fields correctly', async () => {
    setup();

    const nameInput = screen.getByLabelText('Repository Name');
    const urlInput = screen.getByLabelText('Repository URL');
    const gpgKeyInput = screen.getByLabelText('GPG Key');

    await user.type(nameInput, 'Test Repository');
    await user.type(urlInput, 'https://example.com/repo/');
    await user.type(gpgKeyInput, '-----BEGIN PGP PUBLIC KEY BLOCK-----');

    expect(nameInput).toHaveValue('Test Repository');
    expect(urlInput).toHaveValue('https://example.com/repo/');
    expect(gpgKeyInput).toHaveValue('-----BEGIN PGP PUBLIC KEY BLOCK-----');
  });
});
