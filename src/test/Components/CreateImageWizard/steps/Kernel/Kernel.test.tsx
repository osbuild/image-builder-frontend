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

const goToReviewStep = async () => {
  await clickNext(); // First boot script
  await clickNext(); // Details
  await enterBlueprintName();
  await clickNext(); // Review
};

const enterKernelName = async (kernelName: string) => {
  const user = userEvent.setup();
  const kernelNameInput = await screen.findByPlaceholderText(
    /Add a kernel name/i
  );
  await waitFor(() => user.type(kernelNameInput, kernelName));
};

const clearKernelName = async () => {
  const user = userEvent.setup();
  const kernelNameInput = await screen.findByPlaceholderText(
    /Add a kernel name/i
  );
  await waitFor(() => user.clear(kernelNameInput));
};

describe('Step Kernel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    router = undefined;
  });

  test('clicking Next loads Firewall', async () => {
    await renderCreateMode();
    await goToKernelStep();
    await clickNext();
    await screen.findByRole('heading', {
      name: 'Firewall',
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

  test('validation works', async () => {
    await renderCreateMode();
    await goToKernelStep();

    // with empty kernel name input
    const nextButton = await getNextButton();
    expect(nextButton).toBeEnabled();

    // invalid name
    await enterKernelName('INVALID/NAME');
    expect(nextButton).toBeDisabled();
    await clickNext(); // dummy click to blur and render error (doesn't render when pristine)
    await screen.findByText(/Invalid kernel name/);

    // valid name
    await clearKernelName();
    await enterKernelName('valid-kernel-name');
    expect(nextButton).toBeEnabled();
    expect(screen.queryByText(/Invalid kernel name/)).not.toBeInTheDocument();
  });
});

describe('Kernel request generated correctly', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
  });

  test('with valid kernel name', async () => {
    await renderCreateMode();
    await goToKernelStep();
    await enterKernelName('kernel-name');
    await goToReviewStep();
    // informational modal pops up in the first test only as it's tied
    // to a 'imageBuilder.saveAndBuildModalSeen' variable in localStorage
    await openAndDismissSaveAndBuildModal();
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    const expectedRequest = {
      ...blueprintRequest,
      customizations: {
        kernel: {
          name: 'kernel-name',
        },
      },
    };

    await waitFor(() => {
      expect(receivedRequest).toEqual(expectedRequest);
    });
  });
});

// TO DO 'Kernel step' -> 'revisit step button on Review works'
// TO DO 'Kernel request generated correctly' -> 'with valid kernel append'
// TO DO 'Kernel request generated correctly' -> 'with valid kernel name and kernel append'
// TO DO 'Kernel edit mode'
