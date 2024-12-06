import type { Router as RemixRouter } from '@remix-run/router';
import { screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { CREATE_BLUEPRINT, EDIT_BLUEPRINT } from '../../../../../constants';
import { mockBlueprintIds } from '../../../../fixtures/blueprints';
import { localeCreateBlueprintRequest } from '../../../../fixtures/editMode';
import {
  blueprintRequest,
  clickBack,
  clickNext,
  enterBlueprintName,
  interceptBlueprintRequest,
  interceptEditBlueprintRequest,
  openAndDismissSaveAndBuildModal,
  renderEditMode,
  verifyCancelButton,
} from '../../wizardTestUtils';
import { clickRegisterLater, renderCreateMode } from '../../wizardTestUtils';

let router: RemixRouter | undefined = undefined;

const goToLocaleStep = async () => {
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
};

const goToReviewStep = async () => {
  await clickNext(); // First boot
  await clickNext(); // Details
  await enterBlueprintName();
  await clickNext(); // Review
};

const searchForKeyboard = async () => {
  const user = userEvent.setup();
  const keyboardDropdown = await screen.findByPlaceholderText(
    /select a keyboard/i
  );
  await waitFor(() => user.type(keyboardDropdown, 'us'));
};

const selectKeyboard = async () => {
  const user = userEvent.setup();
  const usKeyboard = await screen.findByRole('option', { name: 'us' });
  await waitFor(() => user.click(usKeyboard));
};

describe('Step Locale', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    router = undefined;
  });

  test('clicking Next loads First Boot', async () => {
    await renderCreateMode();
    await goToLocaleStep();
    await clickNext();
    await screen.findByRole('heading', {
      name: 'First boot configuration',
    });
  });

  test('clicking Back loads Timezone', async () => {
    await renderCreateMode();
    await goToLocaleStep();
    await clickBack();
    await screen.findByRole('heading', { name: 'Timezone' });
  });

  test('clicking Cancel loads landing page', async () => {
    await renderCreateMode();
    await goToLocaleStep();
    await verifyCancelButton(router);
  });

  test('search results get sorted correctly', async () => {
    await renderCreateMode();
    await goToLocaleStep();
    await searchForKeyboard();
    const options = await screen.findAllByRole('option');
    expect(options[0]).toHaveTextContent('us');
    expect(options[1]).toHaveTextContent('us-acentos');
    expect(options[2]).toHaveTextContent('us-alt-intl');
  });
});

describe('Locale request generated correctly', () => {
  test('with keyboard selected', async () => {
    await renderCreateMode();
    await goToLocaleStep();
    await searchForKeyboard();
    await selectKeyboard();
    await goToReviewStep();
    // informational modal pops up in the first test only as it's tied
    // to a 'imageBuilder.saveAndBuildModalSeen' variable in localStorage
    await openAndDismissSaveAndBuildModal();
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    const expectedRequest = {
      ...blueprintRequest,
      customizations: {
        locale: {
          keyboard: 'us',
        },
      },
    };

    await waitFor(() => {
      expect(receivedRequest).toEqual(expectedRequest);
    });
  });
});

describe('Locale edit mode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('edit mode works', async () => {
    const id = mockBlueprintIds['locale'];
    await renderEditMode(id);

    // starts on review step
    const receivedRequest = await interceptEditBlueprintRequest(
      `${EDIT_BLUEPRINT}/${id}`
    );
    const expectedRequest = localeCreateBlueprintRequest;
    expect(receivedRequest).toEqual(expectedRequest);
  });
});

// TO DO 'with languages selected'
// TO DO 'with languages and keyboard selected'
// TO DO 'Step Locale' -> 'revisit step button on Review works'
