import type { Router as RemixRouter } from '@remix-run/router';
import { screen, waitFor, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { CREATE_BLUEPRINT, EDIT_BLUEPRINT } from '../../../../../constants';
import { mockBlueprintIds } from '../../../../fixtures/blueprints';
import { localeCreateBlueprintRequest } from '../../../../fixtures/editMode';
import {
  blueprintRequest,
  clickBack,
  clickNext,
  clickRegisterLater,
  enterBlueprintName,
  interceptBlueprintRequest,
  interceptEditBlueprintRequest,
  openAndDismissSaveAndBuildModal,
  renderCreateMode,
  renderEditMode,
  verifyCancelButton,
} from '../../wizardTestUtils';

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
  await clickNext(); // Hostname
  await clickNext(); // Kernel
  await clickNext(); // Firewall
  await clickNext(); // Services
  await clickNext(); // First boot
  await clickNext(); // Details
  await enterBlueprintName();
  await clickNext(); // Review
};

const clearLanguageSearch = async () => {
  const user = userEvent.setup();
  const languagesDropdown = await screen.findByPlaceholderText(
    /select a language/i
  );
  await waitFor(() => user.clear(languagesDropdown));
};

const searchForLanguage = async (search: string) => {
  const user = userEvent.setup();
  const languagesDropdown = await screen.findByPlaceholderText(
    /select a language/i
  );
  await waitFor(() => user.type(languagesDropdown, search));
};

const selectLanguages = async () => {
  const user = userEvent.setup();
  await searchForLanguage('nl');
  const nlOption = await screen.findByRole('option', {
    name: 'Dutch - Netherlands (nl_NL.UTF-8)',
  });
  await waitFor(() => user.click(nlOption));

  await searchForLanguage('en');
  const enOption = await screen.findByRole('option', {
    name: 'English - United Kingdom (en_GB.UTF-8)',
  });
  await waitFor(() => user.click(enOption));
};

const searchForKeyboard = async (keyboard: string) => {
  const user = userEvent.setup({ delay: null });
  const keyboardDropdown = await screen.findByPlaceholderText(
    /select a keyboard/i
  );
  await waitFor(() => user.type(keyboardDropdown, keyboard));
};

const selectKeyboard = async () => {
  const user = userEvent.setup({ delay: null });
  const usKeyboard = await screen.findByRole('option', { name: 'us' });
  await waitFor(() => user.click(usKeyboard));
};

const clickRevisitButton = async () => {
  const user = userEvent.setup();
  const expandable = await screen.findByTestId('locale-expandable');
  const revisitButton = await within(expandable).findByTestId('revisit-locale');
  await waitFor(() => user.click(revisitButton));
};

describe('Step Locale', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    router = undefined;
  });

  test('clicking Next loads Hostname', async () => {
    await renderCreateMode();
    await goToLocaleStep();
    await clickNext();
    await screen.findByRole('heading', {
      name: 'Hostname',
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

  test('language results get sorted correctly', async () => {
    await renderCreateMode();
    await goToLocaleStep();
    await searchForLanguage('nl');
    const nlOptions = await screen.findAllByRole('option');
    expect(nlOptions[0]).toHaveTextContent('Dutch - Aruba (nl_AW.UTF-8)');
    expect(nlOptions[1]).toHaveTextContent('Dutch - Belgium (nl_BE.UTF-8)');
    expect(nlOptions[2]).toHaveTextContent('Dutch - Netherlands (nl_NL.UTF-8)');

    await clearLanguageSearch();
    await searchForLanguage('gb');
    const gbOptions = await screen.findAllByRole('option');
    expect(gbOptions[0]).toHaveTextContent('gbm - India (gbm_IN.UTF-8)');
    expect(gbOptions[1]).toHaveTextContent(
      'Cornish - United Kingdom (kw_GB.UTF-8)'
    );
    expect(gbOptions[2]).toHaveTextContent(
      'English - United Kingdom (en_GB.UTF-8)'
    );
  });

  test('keyboard search results get sorted correctly', async () => {
    await renderCreateMode();
    await goToLocaleStep();
    await searchForKeyboard('us');
    const options = await screen.findAllByRole('option');
    expect(options[0]).toHaveTextContent('us');
    expect(options[1]).toHaveTextContent('us-acentos');
    expect(options[2]).toHaveTextContent('us-alt-intl');
  });

  test('unknown option is disabled', async () => {
    await renderCreateMode();
    await goToLocaleStep();

    await searchForLanguage('foo');
    await screen.findByText(/no results found/i);
    expect(
      await screen.findByRole('option', { name: /no results found/i })
    ).toBeDisabled();
    await clearLanguageSearch();

    await searchForKeyboard('foo');
    await screen.findByText(/no results found/i);
    expect(
      await screen.findByRole('option', { name: /no results found/i })
    ).toBeDisabled();
  });

  test('revisit step button on Review works', async () => {
    await renderCreateMode();
    await goToLocaleStep();
    await searchForKeyboard('us');
    await selectKeyboard();
    await goToReviewStep();
    await clickRevisitButton();
    await screen.findByRole('heading', { name: /Locale/ });
  });
});

describe('Locale request generated correctly', () => {
  test('with languages selected', async () => {
    await renderCreateMode();
    await goToLocaleStep();
    await selectLanguages();
    await goToReviewStep();
    // informational modal pops up in the first test only as it's tied
    // to a 'imageBuilder.saveAndBuildModalSeen' variable in localStorage
    await openAndDismissSaveAndBuildModal();
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    const expectedRequest = {
      ...blueprintRequest,
      customizations: {
        locale: {
          languages: ['nl_NL.UTF-8', 'en_GB.UTF-8'],
        },
      },
    };

    await waitFor(() => {
      expect(receivedRequest).toEqual(expectedRequest);
    });
  });

  test('with keyboard selected', async () => {
    await renderCreateMode();
    await goToLocaleStep();
    await searchForKeyboard('us');
    await selectKeyboard();
    await goToReviewStep();
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

  test('with languages and keyboard selected', async () => {
    await renderCreateMode();
    await goToLocaleStep();
    await selectLanguages();
    await searchForKeyboard('us');
    await selectKeyboard();
    await goToReviewStep();
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    const expectedRequest = {
      ...blueprintRequest,
      customizations: {
        locale: {
          languages: ['nl_NL.UTF-8', 'en_GB.UTF-8'],
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
