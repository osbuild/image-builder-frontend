import type { Router as RemixRouter } from '@remix-run/router';
import { screen, waitFor, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { CREATE_BLUEPRINT, EDIT_BLUEPRINT } from '../../../../../constants';
import { mockBlueprintIds } from '../../../../fixtures/blueprints';
import { hostnameCreateBlueprintRequest } from '../../../../fixtures/editMode';
import {
  blueprintRequest,
  clickBack,
  clickNext,
  clickRegisterLater,
  getNextButton,
  goToReview,
  goToStep,
  interceptBlueprintRequest,
  interceptEditBlueprintRequest,
  openAndDismissSaveAndBuildModal,
  renderCreateMode,
  renderEditMode,
  verifyCancelButton,
} from '../../wizardTestUtils';

let router: RemixRouter | undefined = undefined;

const goToHostnameStep = async () => {
  const user = userEvent.setup();
  const guestImageCheckBox = await screen.findByRole('checkbox', {
    name: /virtualization guest image checkbox/i,
  });
  await waitFor(() => user.click(guestImageCheckBox));

  if (!process.env.IS_ON_PREMISE) {
    await clickNext(); // Registration
    await clickRegisterLater();
  }
  await goToStep(/Hostname/);
};

const enterHostname = async (hostname: string) => {
  const user = userEvent.setup({ delay: null });
  const hostnameInput = await screen.findByPlaceholderText(/Add a hostname/i);
  await waitFor(() => user.type(hostnameInput, hostname));
};

const clearHostname = async () => {
  const user = userEvent.setup();
  const hostnameInput = await screen.findByPlaceholderText(/Add a hostname/i);
  await waitFor(() => user.clear(hostnameInput));
};

const clickRevisitButton = async () => {
  const user = userEvent.setup();
  const expandable = await screen.findByTestId('hostname-expandable');
  const revisitButton =
    await within(expandable).findByTestId('revisit-hostname');
  await waitFor(() => user.click(revisitButton));
};

describe('Step Hostname', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    router = undefined;
  });

  test('clicking Next loads Kernel', async () => {
    await renderCreateMode();
    await goToHostnameStep();
    await clickNext();
    await screen.findByRole('heading', {
      name: 'Kernel',
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

  test('hostname is invalid for more than 64 chars', async () => {
    await renderCreateMode();
    await goToHostnameStep();
    const nextButton = await getNextButton();

    // enter invalid hostname
    const invalidHostname = 'a'.repeat(65);
    await enterHostname(invalidHostname);
    expect(nextButton).toBeDisabled();

    // enter valid hostname
    await clearHostname();
    expect(nextButton).toBeEnabled();
  });

  test('revisit step button on Review works', async () => {
    await renderCreateMode();
    await goToHostnameStep();
    await enterHostname('hostname');
    await goToReview();
    await clickRevisitButton();
    await screen.findByRole('heading', { name: /Hostname/ });
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
    await goToReview();
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

describe('Hostname edit mode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('edit mode works', async () => {
    const id = mockBlueprintIds['hostname'];
    await renderEditMode(id);

    // starts on review step
    const receivedRequest = await interceptEditBlueprintRequest(
      `${EDIT_BLUEPRINT}/${id}`,
    );
    const expectedRequest = hostnameCreateBlueprintRequest;
    expect(receivedRequest).toEqual(expectedRequest);
  });
});
