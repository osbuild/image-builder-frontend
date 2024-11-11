import type { Router as RemixRouter } from '@remix-run/router';
import { screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import {
  clickBack,
  clickNext,
  verifyCancelButton,
} from '../../wizardTestUtils';
import { clickRegisterLater, renderCreateMode } from '../../wizardTestUtils';

let router: RemixRouter | undefined = undefined;

const goToTimezoneStep = async () => {
  const user = userEvent.setup();
  const guestImageCheckBox = await screen.findByRole('checkbox', {
    name: /virtualization guest image checkbox/i,
  });
  await waitFor(() => user.click(guestImageCheckBox));
  await clickNext(); // Registration
  await clickRegisterLater();
  await clickNext(); // OpenSCAP
  await clickNext(); // File system configuration
  await clickNext(); // Snapshots
  await clickNext(); // Custom repositories
  await clickNext(); // Additional packages
  await clickNext(); // Users
  await clickNext(); // Timezone
};

describe('Step Timezone', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    router = undefined;
  });

  test('clicking Next loads First Boot', async () => {
    await renderCreateMode();
    await goToTimezoneStep();
    await clickNext();
    await screen.findByRole('heading', {
      name: 'First boot configuration',
    });
  });

  test('clicking Back loads Users', async () => {
    await renderCreateMode();
    await goToTimezoneStep();
    await clickBack();
    await screen.findByRole('heading', { name: 'Users' });
  });

  test('clicking Cancel loads landing page', async () => {
    await renderCreateMode();
    await goToTimezoneStep();
    await verifyCancelButton(router);
  });
});

// TO DO 'Step Timezone' -> 'revisit step button on Review works'
// TO DO 'Timezone request generated correctly'
// TO DO 'Timezone edit mode'
