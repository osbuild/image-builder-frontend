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
    // Wait for targets to load - use guest-image which doesn't require additional config
    const guestImageCheckbox = await screen.findByRole('checkbox', {
      name: /Virtualization guest image checkbox/i,
    });
    await user.click(guestImageCheckbox);
    const nextButton = await screen.findByRole('button', { name: /Next/i });
    // After selecting a target that doesn't require config, Next should be enabled
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
    const guestImageCheckbox = await screen.findByRole('checkbox', {
      name: /Virtualization guest image checkbox/i,
    });
    // Select
    await user.click(guestImageCheckbox);
    const nextButton = await screen.findByRole('button', { name: /Next/i });
    await waitFor(() => expect(nextButton).not.toBeDisabled());
    // Deselect
    await user.click(guestImageCheckbox);
    await waitFor(() => expect(nextButton).toBeDisabled());
  });

  test('When AWS is selected, AWS config form renders inline', async () => {
    const user = userEvent.setup();
    await renderV2Wizard();
    const awsTile = await screen.findByRole('button', {
      name: /Amazon Web Services/i,
    });
    await user.click(awsTile);
    // AWS config form fields should appear inline with share method radio buttons
    await screen.findByText(/Share method/i);
    await screen.findByRole('radio', {
      name: /Use an account configured from Sources/i,
    });
    await screen.findByRole('radio', {
      name: /Manually enter an account ID/i,
    });
  });

  test('When AWS manual share is selected, account ID field appears', async () => {
    const user = userEvent.setup();
    await renderV2Wizard();
    const awsTile = await screen.findByRole('button', {
      name: /Amazon Web Services/i,
    });
    await user.click(awsTile);
    const manualRadio = await screen.findByRole('radio', {
      name: /Manually enter an account ID/i,
    });
    await user.click(manualRadio);
    // Account ID field should appear
    await screen.findByRole('textbox', { name: /aws account id/i });
  });

  test('AWS config disappears when AWS target is deselected', async () => {
    const user = userEvent.setup();
    await renderV2Wizard();
    const awsTile = await screen.findByRole('button', {
      name: /Amazon Web Services/i,
    });
    // Select
    await user.click(awsTile);
    await screen.findByText(/Share method/i);
    // Deselect
    await user.click(awsTile);
    await waitFor(() =>
      expect(screen.queryByText(/Share method/i)).not.toBeInTheDocument()
    );
  });

  test('When GCP is selected, GCP config form renders inline', async () => {
    const user = userEvent.setup();
    await renderV2Wizard();
    const gcpTile = await screen.findByRole('button', {
      name: /Google Cloud/i,
    });
    await user.click(gcpTile);
    // GCP config form fields should appear inline with share method radio buttons
    await screen.findByText(/Select image sharing/i);
    await screen.findByRole('radio', {
      name: /Share image with a Google account/i,
    });
    await screen.findByRole('radio', {
      name: /Share image with Red Hat Lightspeed only/i,
    });
  });

  test('When GCP share with Google is selected, principal field appears', async () => {
    const user = userEvent.setup();
    await renderV2Wizard();
    const gcpTile = await screen.findByRole('button', {
      name: /Google Cloud/i,
    });
    await user.click(gcpTile);
    // "Share with Google account" should be checked by default
    const shareWithGoogleRadio = await screen.findByRole('radio', {
      name: /Share image with a Google account/i,
    });
    expect(shareWithGoogleRadio).toBeChecked();
    // Account type radios and principal field should appear
    await screen.findByRole('radio', { name: /^Google account$/i });
    await screen.findByRole('radio', { name: /^Service account$/i });
    await screen.findByRole('radio', { name: /^Google group$/i });
    await screen.findByRole('radio', { name: /^Google Workspace domain$/i });
    await screen.findByRole('textbox', { name: /google principal/i });
  });

  test('When Azure is selected, Azure config form renders inline', async () => {
    const user = userEvent.setup();
    await renderV2Wizard();
    const azureTile = await screen.findByRole('button', {
      name: /Microsoft Azure/i,
    });
    await user.click(azureTile);
    // Azure config form fields should appear inline with all required fields
    await screen.findByRole('textbox', { name: /Azure tenant GUID/i });
    await screen.findByText(/Authorize Image Builder/i);
    await screen.findByRole('textbox', { name: /subscription id/i });
    await screen.findByRole('textbox', { name: /resource group/i });
  });

  test('Next button disabled when AWS is selected but config is incomplete', async () => {
    const user = userEvent.setup();
    await renderV2Wizard();
    const awsTile = await screen.findByRole('button', {
      name: /Amazon Web Services/i,
    });
    await user.click(awsTile);
    const nextButton = await screen.findByRole('button', { name: /Next/i });
    // AWS requires either a valid source or a manually entered account ID.
    // With no config provided, Next should stay disabled.
    await waitFor(() => expect(nextButton).toBeDisabled());
  });

  test('Next button is disabled when Azure is selected with empty required fields', async () => {
    const user = userEvent.setup();
    await renderV2Wizard();
    const azureTile = await screen.findByRole('button', {
      name: /Microsoft Azure/i,
    });
    await user.click(azureTile);
    const nextButton = await screen.findByRole('button', { name: /Next/i });
    // Azure requires tenant GUID, subscription ID, and resource group.
    // All empty by default, so Next should remain disabled.
    await waitFor(() => expect(nextButton).toBeDisabled());
  });

  test('Next button enabled when Azure config is fully filled', async () => {
    const user = userEvent.setup();
    await renderV2Wizard();
    const azureTile = await screen.findByRole('button', {
      name: /Microsoft Azure/i,
    });
    await user.click(azureTile);

    // Fill in all required Azure fields with valid values
    const tenantGuidInput = await screen.findByRole('textbox', {
      name: /Azure tenant GUID/i,
    });
    await user.type(tenantGuidInput, 'b8ab5893-3001-44e9-9171-00008833be51');

    const subscriptionIdInput = await screen.findByRole('textbox', {
      name: /subscription id/i,
    });
    await user.type(subscriptionIdInput, '68f78fb7-ffc4-499b-bb78-c36b4840ce41');

    const resourceGroupInput = await screen.findByRole('textbox', {
      name: /resource group/i,
    });
    await user.type(resourceGroupInput, 'testResourceGroup');

    const nextButton = await screen.findByRole('button', { name: /Next/i });
    // With all valid fields filled, Next should become enabled
    await waitFor(() => expect(nextButton).not.toBeDisabled());
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

  test('Register section renders with heading and registration radio buttons', async () => {
    await renderV2Wizard();
    const registerHeadings = await screen.findAllByRole('heading', {
      name: /Register/i,
    });
    const h2 = registerHeadings.find((el) => el.tagName === 'H2');
    expect(h2).toBeInTheDocument();

    // PF6 Radio with body prop doesn't expose label as accessible name,
    // so use findByText (matches existing wizard test pattern)
    await screen.findByText(
      'Automatically register to Red Hat Hybrid Cloud Console and enable advanced capabilities.',
    );
    await screen.findByRole('radio', { name: /Register later/i });
  });

  test('Enable repeatable build section renders with snapshot options', async () => {
    await renderV2Wizard();
    const heading = await screen.findByRole('heading', {
      name: /Enable repeatable build/i,
    });
    expect(heading).toBeInTheDocument();

    await screen.findByRole('radio', { name: /Disable repeatable build/i });
    await screen.findByRole('radio', { name: /Enable repeatable build/i });
  });

  test('Compliance section renders with FIPS toggle', async () => {
    await renderV2Wizard();
    const fipsToggle = await screen.findByRole('switch', {
      name: /Enable FIPS mode/i,
    });
    expect(fipsToggle).toBeInTheDocument();
  });

  test('User can toggle FIPS switch', async () => {
    const user = userEvent.setup();
    await renderV2Wizard();
    const fipsToggle = await screen.findByRole('switch', {
      name: /Enable FIPS mode/i,
    });
    expect(fipsToggle).not.toBeChecked();
    await user.click(fipsToggle);
    expect(fipsToggle).toBeChecked();
  });

  test('Select image blueprint section renders with dropdown defaulting to None', async () => {
    const user = userEvent.setup();
    await renderV2Wizard();
    const heading = await screen.findByRole('heading', {
      name: /Select image blueprint/i,
    });
    expect(heading).toBeInTheDocument();

    await screen.findByText(
      /In order to see the image configuration in this dropdown/i,
    );

    // The dropdown toggle should show "None" as default
    const toggle = await screen.findByRole('button', { name: /None/i });
    expect(toggle).toBeInTheDocument();

    // Verify dropdown opens and shows the "None" option
    await user.click(toggle);
    const noneOption = await screen.findByRole('option', { name: /None/i });
    expect(noneOption).toBeInTheDocument();
  });
});
