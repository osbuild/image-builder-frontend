import type { Router as RemixRouter } from '@remix-run/router';
import { screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { CREATE_BLUEPRINT } from '../../../../../constants';
import {
  blueprintRequest,
  clickBack,
  clickNext,
  enterBlueprintName,
  getNextButton,
  interceptBlueprintRequest,
  openAndDismissSaveAndBuildModal,
  verifyCancelButton,
} from '../../wizardTestUtils';
import { clickRegisterLater, renderCreateMode } from '../../wizardTestUtils';

let router: RemixRouter | undefined = undefined;

const goToHostnameStep = async () => {
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
};

const goToReviewStep = async () => {
  await clickNext(); // First boot script
  await clickNext(); // Details
  await enterBlueprintName();
  await clickNext(); // Review
};

const enterHostname = async (hostname: string) => {
  const user = userEvent.setup();
  const hostnameInput = await screen.findByPlaceholderText(/Add a hostname/i);
  await waitFor(() => user.type(hostnameInput, hostname));
};

const clearHostname = async () => {
  const user = userEvent.setup();
  const hostnameInput = await screen.findByPlaceholderText(/Add a hostname/i);
  await waitFor(() => user.clear(hostnameInput));
};

describe('Step Hostname', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    router = undefined;
  });

  test('clicking Next loads First boot script', async () => {
    await renderCreateMode();
    await goToHostnameStep();
    await clickNext();
    await screen.findByRole('heading', {
      name: 'First boot configuration',
    });
  });

  test('clicking Back loads Locale', async () => {
    await renderCreateMode();
    await goToHostnameStep();
    await clickBack();
    await screen.findByRole('heading', { name: 'Locale' });
  });

  test('clicking Cancel loads landing page', async () => {
    await renderCreateMode();
    await goToHostnameStep();
    await verifyCancelButton(router);
  });

  test('validation works', async () => {
    await renderCreateMode();
    await goToHostnameStep();

    // with empty hostname input
    const nextButton = await getNextButton();
    expect(nextButton).toBeEnabled();

    // invalid name
    await enterHostname('-invalid-hostname-');
    expect(nextButton).toBeDisabled();
    await clickNext(); // dummy click to blur and render error (doesn't render when pristine)
    await screen.findByText(/Invalid hostname/);

    // valid name
    await clearHostname();
    await enterHostname('valid-hostname');
    expect(nextButton).toBeEnabled();
    expect(screen.queryByText(/Invalid hostname/)).not.toBeInTheDocument();
  });
});

describe('Hostname request generated correctly', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
  });

  test('with valid hostname', async () => {
    await renderCreateMode();
    await goToHostnameStep();
    await enterHostname('hostname');
    await goToReviewStep();
    // informational modal pops up in the first test only as it's tied
    // to a 'imageBuilder.saveAndBuildModalSeen' variable in localStorage
    await openAndDismissSaveAndBuildModal();
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    const expectedRequest = {
      ...blueprintRequest,
      customizations: {
        hostname: 'hostname',
      },
    };

    await waitFor(() => {
      expect(receivedRequest).toEqual(expectedRequest);
    });
  });
});

// TO DO 'Step Hostname' -> 'revisit step button on Review works'
// TO DO 'Hostname edit mode'
