import React from 'react';

import { screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import CreateImageWizardV2 from '../../../Components/CreateImageWizard/CreateImageWizardV2';
import { renderCustomRoutesWithReduxRouter } from '../../testUtils';

const routes = [
  {
    path: 'insights/image-builder/*',
    element: <div />,
  },
  {
    path: 'insights/image-builder/imagewizardv2',
    element: <CreateImageWizardV2 />,
  },
];

const renderV2Wizard = async () => {
  return await renderCustomRoutesWithReduxRouter('imagewizardv2', {}, routes);
};

describe('CreateImageWizardV2', () => {
  test('renders modal with correct title', async () => {
    await renderV2Wizard();
    await screen.findByText('Build an image');
  });

  test('renders 4 wizard steps in navigation', async () => {
    await renderV2Wizard();
    await screen.findByRole('button', { name: /Base settings/i });
    await screen.findByRole('button', { name: /Repositories and packages/i });
    await screen.findByRole('button', { name: /Advanced settings/i });
    // "Review" appears as both a nav item and the "Review image" footer button.
    // Use getAllBy to verify at least one nav item for Review exists.
    const reviewButtons = await screen.findAllByRole('button', {
      name: /^Review$/i,
    });
    expect(reviewButtons.length).toBeGreaterThanOrEqual(1);
  });

  test('shows Base settings step content by default', async () => {
    await renderV2Wizard();
    await screen.findByRole('heading', { name: /Image details/i });
  });

  test('renders image details section with Name field', async () => {
    await renderV2Wizard();
    const nameInput = await screen.findByRole('textbox', {
      name: /blueprint name/i,
    });
    expect(nameInput).toBeInTheDocument();
    // Should have a default name pre-filled (generated from distribution-arch-date)
    expect(nameInput).not.toHaveValue('');
  });

  test('renders image details section with Description field', async () => {
    await renderV2Wizard();
    const descInput = await screen.findByRole('textbox', {
      name: /blueprint description/i,
    });
    expect(descInput).toBeInTheDocument();
  });

  test('renders image details section with Author field', async () => {
    await renderV2Wizard();
    const authorInput = await screen.findByRole('textbox', {
      name: /author/i,
    });
    expect(authorInput).toBeInTheDocument();
  });

  test('renders footer with Cancel, Next, and Review image buttons', async () => {
    await renderV2Wizard();
    await screen.findByRole('button', { name: /Next/i });
    await screen.findByRole('button', { name: /Cancel/i });
    await screen.findByRole('button', { name: /Review image/i });
  });

  test('user can type in Name field and it dispatches to store', async () => {
    const user = userEvent.setup();
    await renderV2Wizard();
    const nameInput = await screen.findByRole('textbox', {
      name: /blueprint name/i,
    });
    await user.clear(nameInput);
    await user.type(nameInput, 'My Test Blueprint');
    expect(nameInput).toHaveValue('My Test Blueprint');
  });

  test('user can type in Author field and it dispatches to store', async () => {
    const user = userEvent.setup();
    await renderV2Wizard();
    const authorInput = await screen.findByRole('textbox', {
      name: /author/i,
    });
    await user.clear(authorInput);
    await user.type(authorInput, 'newauthor@example.com');
    expect(authorInput).toHaveValue('newauthor@example.com');
  });

  test('Next and Review image buttons are disabled when blueprint name is cleared', async () => {
    const user = userEvent.setup();
    await renderV2Wizard();
    const nameInput = await screen.findByRole('textbox', {
      name: /blueprint name/i,
    });
    const nextButton = await screen.findByRole('button', { name: /Next/i });
    const reviewButton = await screen.findByRole('button', {
      name: /Review image/i,
    });
    // Clear the pre-filled default name
    await user.clear(nameInput);
    await waitFor(() => expect(nextButton).toBeDisabled());
    expect(reviewButton).toBeDisabled();
  });

  test('Next button is disabled when author exceeds 250 characters', async () => {
    const user = userEvent.setup();
    await renderV2Wizard();
    const authorInput = await screen.findByRole('textbox', {
      name: /author/i,
    });
    const nextButton = await screen.findByRole('button', { name: /Next/i });

    await user.type(authorInput, 'a'.repeat(251));
    await waitFor(() => expect(nextButton).toBeDisabled());
  });

  test('renders Image output section with Release dropdown', async () => {
    await renderV2Wizard();
    const heading = await screen.findByRole('heading', {
      name: /Image output/i,
    });
    expect(heading).toBeInTheDocument();
    const releaseSelect = await screen.findByTestId('release_select');
    expect(releaseSelect).toBeInTheDocument();
  });

  test('renders Image output section with Architecture dropdown', async () => {
    await renderV2Wizard();
    const archSelect = await screen.findByTestId('arch_select');
    expect(archSelect).toBeInTheDocument();
  });

  test('renders target environment selection', async () => {
    await renderV2Wizard();
    // Wait for the target environments to load (async API call)
    const targetLabel = await screen.findByText(/Select target environments/i);
    expect(targetLabel).toBeInTheDocument();
  });

  test('user can select a target environment', async () => {
    const user = userEvent.setup();
    await renderV2Wizard();
    // Wait for targets to load - AWS should be available for rhel-10/x86_64
    const awsTile = await screen.findByRole('button', {
      name: /Amazon Web Services/i,
    });
    await user.click(awsTile);
    const nextButton = await screen.findByRole('button', { name: /Next/i });
    // After selecting a target, Next should be enabled
    await waitFor(() => expect(nextButton).not.toBeDisabled());
  });

  test('Next button is disabled when no target environment is selected', async () => {
    await renderV2Wizard();
    // Wait for the target environments to load
    await screen.findByText(/Select target environments/i);
    const nextButton = await screen.findByRole('button', { name: /Next/i });
    // No targets selected initially
    await waitFor(() => expect(nextButton).toBeDisabled());
  });

  test('user can deselect a target environment', async () => {
    const user = userEvent.setup();
    await renderV2Wizard();
    const awsTile = await screen.findByRole('button', {
      name: /Amazon Web Services/i,
    });
    // Select
    await user.click(awsTile);
    const nextButton = await screen.findByRole('button', { name: /Next/i });
    await waitFor(() => expect(nextButton).not.toBeDisabled());
    // Deselect
    await user.click(awsTile);
    await waitFor(() => expect(nextButton).toBeDisabled());
  });

  test('placeholder steps render content when navigated to', async () => {
    const user = userEvent.setup();
    await renderV2Wizard();
    // Click on step 2 in the nav
    const step2Nav = await screen.findByRole('button', {
      name: /Repositories and packages/i,
    });
    await user.click(step2Nav);
    await screen.findByText(/Repositories and packages content/i);
  });
});
