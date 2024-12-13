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

const goToKernelStep = async () => {
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
  await clickNext(); // Locale
  await clickNext(); // Hostname
  await clickNext(); // Kernel
};

describe('Step Kernel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    router = undefined;
  });

  test('clicking Next loads First boot script', async () => {
    await renderCreateMode();
    await goToKernelStep();
    await clickNext();
    await screen.findByRole('heading', {
      name: 'First boot configuration',
    });
  });

  test('clicking Back loads Hostname', async () => {
    await renderCreateMode();
    await goToKernelStep();
    await clickBack();
    await screen.findByRole('heading', { name: 'Hostname' });
  });

  test('clicking Cancel loads landing page', async () => {
    await renderCreateMode();
    await goToKernelStep();
    await verifyCancelButton(router);
  });
});

// TO DO 'Kernel step' -> 'revisit step button on Review works'
// TO DO 'Kernel request generated correctly'
// TO DO 'Kernel edit mode'
