import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import {
  clickNext,
  enterResourceGroup,
  enterSubscriptionId,
  enterTenantGuid,
  renderCreateMode,
} from './wizardTestUtils';

const getSourceDropdown = async () => {
  const sourceDropdown = await screen.findByPlaceholderText(/select source/i);
  await waitFor(() => expect(sourceDropdown).toBeEnabled());

  return sourceDropdown;
};

const selectSourcesOption = async () => {
  const user = userEvent.setup();
  const sourcesOption = await screen.findByRole('radio', {
    name: /use an account configured from sources\./i,
  });
  await waitFor(async () => user.click(sourcesOption));
};

const selectAllEnvironments = async () => {
  const user = userEvent.setup();

  await waitFor(() =>
    user.click(screen.getByRole('checkbox', { name: /Amazon Web Services/i })),
  );
  await waitFor(() =>
    user.click(screen.getByRole('checkbox', { name: /Google Cloud/i })),
  );
  await waitFor(() =>
    user.click(screen.getByRole('checkbox', { name: /Microsoft Azure/i })),
  );
  await waitFor(() =>
    user.click(
      screen.getByRole('checkbox', { name: /Virtualization guest image/i }),
    ),
  );
};

const testCheckbox = async (checkbox: HTMLElement) => {
  const user = userEvent.setup();

  checkbox.focus();
  await waitFor(() => user.keyboard(' '));
  expect(checkbox).toBeChecked();
};

describe('Create Image Wizard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders component', async () => {
    await renderCreateMode();

    // check heading
    await screen.findByRole('heading', { name: /Image builder/ });

    // check navigation
    await screen.findByRole('button', { name: 'Image output' });
    await screen.findByRole('button', { name: 'Optional steps' });
    await screen.findByRole('button', { name: 'File system configuration' });
    await screen.findByRole('button', { name: 'Additional packages' });
    await screen.findByRole('button', { name: 'Groups and users' });
    await screen.findByRole('button', { name: 'Timezone' });
    await screen.findByRole('button', { name: 'Locale' });
    await screen.findByRole('button', { name: 'Hostname' });
    await screen.findByRole('button', { name: 'Kernel' });
    await screen.findByRole('button', { name: 'Firewall' });
    await screen.findByRole('button', { name: 'Systemd services' });
    await screen.findByRole('button', { name: 'Details' });
    await screen.findByRole('button', { name: 'Review' });
    if (!process.env.IS_ON_PREMISE) {
      await screen.findByRole('button', { name: /Register/ });
      await screen.findByRole('button', { name: 'Security' });
      await screen.findByRole('button', { name: 'Repeatable build' });
      await screen.findByRole('button', { name: 'Repositories' });
      await screen.findByRole('button', {
        name: 'First boot script configuration',
      });
    }
  });
});

describe('Keyboard accessibility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const user = userEvent.setup();

  test('autofocus on each step first input element', async () => {
    await renderCreateMode();

    // Image output - select environments and fill cloud configs (all inline now)
    await selectAllEnvironments();

    // AWS config (inline on Image output step)
    await selectSourcesOption();
    const awsSourceDropdown = await getSourceDropdown();
    await waitFor(() => user.click(awsSourceDropdown));
    const awsSource = await screen.findByRole('option', {
      name: /my_source/i,
    });
    await waitFor(() => user.click(awsSource));

    // Google config (inline on Image output step)
    await waitFor(async () =>
      user.type(
        await screen.findByRole('textbox', { name: /google principal/i }),
        'test@test.com',
      ),
    );

    // Azure config (inline on Image output step)
    await enterTenantGuid();
    await enterSubscriptionId();
    await enterResourceGroup();
    await clickNext();

    // Registration
    await screen.findByText(
      'Automatically register to Red Hat Hybrid Cloud Console and enable advanced capabilities.',
    );
    //const registrationCheckbox = await screen.findByRole('radio', {
    //  name: /Automatically register to Red Hat Hybrid Cloud Console and enable advanced capabilities./i,
    //});
    //expect(registrationCheckbox).toHaveFocus();
    await screen.findByPlaceholderText('Select activation key');
    await clickNext();

    // TODO: Focus on textbox on Security step
    await clickNext();

    //File system configuration
    await clickNext();

    // TODO: Focus on textbox on Custom Repos step
    await clickNext();

    // TODO: Focus on textbox on Packages step
    await clickNext();
    await clickNext();
    // TODO: Focus on textbox on Details step
    await clickNext();
  });

  test('pressing Enter does not advance the wizard', async () => {
    await renderCreateMode();
    await waitFor(async () =>
      user.click(
        await screen.findByRole('checkbox', { name: /Amazon Web Services/i }),
      ),
    );
    await waitFor(() => user.keyboard('{enter}'));
    await screen.findByRole('heading', {
      name: /image output/i,
    });
  });

  test('target environment checkboxes are keyboard selectable', async () => {
    await renderCreateMode();

    await testCheckbox(
      await screen.findByRole('checkbox', { name: /Amazon Web Services/i }),
    );
    await testCheckbox(
      await screen.findByRole('checkbox', { name: /Google Cloud/i }),
    );
    await testCheckbox(
      await screen.findByRole('checkbox', { name: /Microsoft Azure/i }),
    );
  });
});
