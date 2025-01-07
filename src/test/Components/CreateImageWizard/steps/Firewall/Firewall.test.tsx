import type { Router as RemixRouter } from '@remix-run/router';
import { screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { CREATE_BLUEPRINT } from '../../../../../constants';
import {
  blueprintRequest,
  clickBack,
  clickNext,
  enterBlueprintName,
  interceptBlueprintRequest,
  openAndDismissSaveAndBuildModal,
  verifyCancelButton,
} from '../../wizardTestUtils';
import { clickRegisterLater, renderCreateMode } from '../../wizardTestUtils';

let router: RemixRouter | undefined = undefined;

const goToFirewallStep = async () => {
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
  await clickNext(); // Firewall
};

const goToReviewStep = async () => {
  await clickNext(); // Services
  await clickNext(); // First boot script
  await clickNext(); // Details
  await enterBlueprintName();
  await clickNext(); // Review
};

const addPort = async (port: string) => {
  const user = userEvent.setup();
  const portsInput = await screen.findByPlaceholderText(/add port/i);
  await waitFor(() => user.type(portsInput, port.concat(' ')));
};

describe('Step Firewall', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    router = undefined;
  });

  test('clicking Next loads Services', async () => {
    await renderCreateMode();
    await goToFirewallStep();
    await clickNext();
    await screen.findByRole('heading', {
      name: 'Systemd services',
    });
  });

  test('clicking Back loads Kernel', async () => {
    await renderCreateMode();
    await goToFirewallStep();
    await clickBack();
    await screen.findByRole('heading', { name: 'Kernel' });
  });

  test('clicking Cancel loads landing page', async () => {
    await renderCreateMode();
    await goToFirewallStep();
    await verifyCancelButton(router);
  });

  test('duplicate ports cannnot be added', async () => {
    await renderCreateMode();
    await goToFirewallStep();
    expect(screen.queryByText('Port already exists.')).not.toBeInTheDocument();
    await addPort('22:tcp');
    await addPort('22:tcp');
    await screen.findByText('Port already exists.');
  });

  test('port in an invalid format cannot be added', async () => {
    await renderCreateMode();
    await goToFirewallStep();
    expect(screen.queryByText('Invalid format.')).not.toBeInTheDocument();
    await addPort('00:wrongFormat');
    await screen.findByText('Invalid format.');
  });
});

describe('Firewall request generated correctly', () => {
  test('with ports added', async () => {
    await renderCreateMode();
    await goToFirewallStep();
    await addPort('22:tcp');
    await addPort('imap:tcp');
    await goToReviewStep();
    // informational modal pops up in the first test only as it's tied
    // to a 'imageBuilder.saveAndBuildModalSeen' variable in localStorage
    await openAndDismissSaveAndBuildModal();
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    const expectedRequest = {
      ...blueprintRequest,
      customizations: {
        firewall: {
          ports: ['22:tcp', 'imap:tcp'],
        },
      },
    };

    await waitFor(() => {
      expect(receivedRequest).toEqual(expectedRequest);
    });
  });
});

// TO DO Step Firewall -> revisit step button on Review works
// TO DO Firewall request generated correctly
// TO DO Firewall edit mode
