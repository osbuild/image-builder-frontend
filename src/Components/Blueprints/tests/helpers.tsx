import React from 'react';

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderWithRedux } from '@/test/testUtils';

import { ImportBlueprintModal } from '../ImportBlueprintModal';

export const renderImportModal = () => {
  const setShowImportModal = vi.fn();
  return renderWithRedux(
    <ImportBlueprintModal setShowImportModal={setShowImportModal} isOpen />,
  );
};

export const uploadBlueprintFile = async (
  filename: string,
  content: string,
) => {
  const user = userEvent.setup();
  const fileInput: HTMLElement | null =
    // PatternFly FileUpload doesn't expose the file input via Testing Library queries
    // eslint-disable-next-line testing-library/no-node-access
    document.querySelector('input[type="file"]');

  if (!fileInput) {
    throw new Error('File input not found');
  }

  const file = new File([content], filename, {
    type: filename.endsWith('.toml') ? 'text/plain' : 'application/json',
  });
  await waitFor(() => user.upload(fileInput, file));
};

export const getReviewButton = async () =>
  screen.findByRole('button', { name: /review and finish/i });

export const expectReviewButtonDisabled = async () => {
  const reviewButton = await getReviewButton();
  await waitFor(() => expect(reviewButton).toBeDisabled());
};

export const expectReviewButtonEnabled = async () => {
  const reviewButton = await getReviewButton();
  await waitFor(() => expect(reviewButton).toBeEnabled());
};

export const expectInvalidFormatError = async () => {
  const helperText = await screen.findByText(
    /not compatible with the blueprints format\./i,
  );
  expect(helperText).toBeInTheDocument();
};
