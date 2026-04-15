import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { renderCreateMode } from './wizardTestUtils';

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
    await screen.findByRole('heading', { name: /Build an image/ });

    // check navigation
    await screen.findByRole('button', { name: 'Base settings' });
    await screen.findByRole('button', { name: 'Repositories and packages' });
    await screen.findByRole('button', { name: 'Advanced settings' });
    await screen.findByRole('button', { name: 'Review' });
  });
});

describe('Keyboard accessibility', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const user = userEvent.setup();

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
