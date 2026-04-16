import { screen } from '@testing-library/react';

import { createUser } from '@/test/testUtils';

import {
  clearKeyboardSearch,
  clearLanguageSearch,
  clickAddLanguage,
  removeLanguageAtIndex,
  renderLocaleStep,
  searchForKeyboard,
  searchForLanguage,
  selectKeyboardOption,
  selectLanguageOption,
} from './helpers';

// Mock the large lists with smaller test data for faster tests
vi.mock('../data/languagesList', () => ({
  languagesList: [
    'nl_AW.UTF-8',
    'nl_BE.UTF-8',
    'nl_NL.UTF-8',
    'en_GB.UTF-8',
    'en_US.UTF-8',
    'de_DE.UTF-8',
    'gbm_IN.UTF-8',
    'kw_GB.UTF-8',
    'C.UTF-8',
  ],
}));

vi.mock('../data/keyboardsList', () => ({
  keyboardsList: [
    'us',
    'us-acentos',
    'us-alt-intl',
    'us-dvorak',
    'de',
    'gb',
    'fr',
  ],
}));

describe('Locale Component', () => {
  describe('Rendering', () => {
    test('displays step title and description', async () => {
      renderLocaleStep();

      expect(
        await screen.findByRole('heading', { name: /Locale/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          /Define the primary languages and keyboard settings for your image/i,
        ),
      ).toBeInTheDocument();
    });

    test('displays add language button and dropdowns', async () => {
      renderLocaleStep();

      expect(
        await screen.findByRole('button', { name: /add language/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /select a keyboard/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Search by country, language or UTF code/i),
      ).toBeInTheDocument();
    });

    test('disables Add language button while new language row is visible', async () => {
      renderLocaleStep({ locale: { languages: [], keyboard: '' } });
      const user = createUser();

      const addButton = await screen.findByRole('button', {
        name: /add language/i,
      });
      expect(addButton).toBeEnabled();

      await user.click(addButton);
      expect(addButton).toBeDisabled();

      await removeLanguageAtIndex(user, 0);
      expect(addButton).toBeEnabled();
    });
  });

  describe('Language Search', () => {
    test('filters languages by search term', async () => {
      renderLocaleStep();
      const user = createUser();

      await clickAddLanguage(user);
      await searchForLanguage(user, 'nl');

      const options = await screen.findAllByRole('menuitem');
      expect(options.length).toBeGreaterThan(0);
      expect(options[0]).toHaveTextContent('Dutch');
    });

    test('language results are sorted correctly', async () => {
      renderLocaleStep();
      const user = createUser();

      await clickAddLanguage(user);
      await searchForLanguage(user, 'nl');

      const nlOptions = await screen.findAllByRole('menuitem');
      expect(nlOptions[0]).toHaveTextContent('Dutch - Aruba (nl_AW.UTF-8)');
      expect(nlOptions[1]).toHaveTextContent('Dutch - Belgium (nl_BE.UTF-8)');
      expect(nlOptions[2]).toHaveTextContent(
        'Dutch - Netherlands (nl_NL.UTF-8)',
      );
    });

    test('shows no results for unknown language', async () => {
      renderLocaleStep();
      const user = createUser();

      await clickAddLanguage(user);
      await searchForLanguage(user, 'foo');

      expect(screen.getByText(/no results found/i)).toBeInTheDocument();
    });

    test('can clear language search', async () => {
      renderLocaleStep();
      const user = createUser();

      await clickAddLanguage(user);
      await searchForLanguage(user, 'nl');
      await screen.findAllByRole('menuitem');

      await clearLanguageSearch(user);

      expect(screen.getByLabelText(/search by name/i)).toHaveValue('');
    });
  });

  describe('Language Selection', () => {
    test('can select a language', async () => {
      renderLocaleStep({ locale: { languages: [], keyboard: '' } });
      const user = createUser();

      await clickAddLanguage(user);
      await searchForLanguage(user, 'nl');
      await selectLanguageOption(user, 'Dutch - Netherlands (nl_NL.UTF-8)');

      expect(
        screen.getByRole('button', {
          name: /remove language/i,
        }),
      ).toBeInTheDocument();
    });

    test('can select multiple languages', async () => {
      renderLocaleStep({ locale: { languages: [], keyboard: '' } });
      const user = createUser();

      await clickAddLanguage(user);
      await searchForLanguage(user, 'nl');
      await selectLanguageOption(user, 'Dutch - Netherlands (nl_NL.UTF-8)');

      await clickAddLanguage(user);
      await searchForLanguage(user, 'en');
      await selectLanguageOption(
        user,
        'English - United Kingdom (en_GB.UTF-8)',
      );

      const removeButtons = screen.getAllByRole('button', {
        name: /remove language/i,
      });
      expect(removeButtons).toHaveLength(2);
    });
  });

  describe('Keyboard Search', () => {
    test('filters keyboards by search term', async () => {
      renderLocaleStep();
      const user = createUser();

      await searchForKeyboard(user, 'us');

      const options = await screen.findAllByRole('menuitem');
      expect(options.length).toBeGreaterThan(0);
      expect(options[0]).toHaveTextContent('us');
    });

    test('keyboard results are sorted correctly', async () => {
      renderLocaleStep();
      const user = createUser();

      await searchForKeyboard(user, 'us');

      const options = await screen.findAllByRole('menuitem');
      expect(options[0]).toHaveTextContent('us');
      expect(options[1]).toHaveTextContent('us-acentos');
      expect(options[2]).toHaveTextContent('us-alt-intl');
    });

    test('shows no results for unknown keyboard', async () => {
      renderLocaleStep();
      const user = createUser();

      await searchForKeyboard(user, 'foo');

      expect(screen.getByText(/no results found/i)).toBeInTheDocument();
    });

    test('can clear keyboard search', async () => {
      renderLocaleStep();
      const user = createUser();

      await searchForKeyboard(user, 'us');
      await screen.findAllByRole('menuitem');

      await clearKeyboardSearch(user);

      expect(screen.getByLabelText(/search by name/i)).toHaveValue('');
    });
  });

  describe('Keyboard Selection', () => {
    test('can select a keyboard', async () => {
      renderLocaleStep();
      const user = createUser();

      await searchForKeyboard(user, 'us');
      await selectKeyboardOption(user, 'us');

      expect(
        await screen.findByRole('button', { name: 'us' }),
      ).toBeInTheDocument();
    });
  });

  describe('Initial State', () => {
    test('renders with pre-populated languages from state', async () => {
      renderLocaleStep({
        locale: {
          languages: ['en_US.UTF-8', 'de_DE.UTF-8'],
          keyboard: '',
        },
      });

      expect(
        screen.getByRole('button', {
          name: 'English - United States (en_US.UTF-8)',
        }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', {
          name: 'German - Germany (de_DE.UTF-8)',
        }),
      ).toBeInTheDocument();
    });

    test('renders with pre-populated keyboard from state', async () => {
      renderLocaleStep({
        locale: {
          languages: [],
          keyboard: 'de',
        },
      });

      expect(
        await screen.findByRole('button', { name: 'de' }),
      ).toBeInTheDocument();
    });
  });

  describe('State Updates', () => {
    test('updates store when language is selected', async () => {
      const { store } = renderLocaleStep({
        locale: {
          languages: [],
          keyboard: '',
        },
      });
      const user = createUser();

      expect(store.getState().wizard.locale.languages).toHaveLength(0);

      await clickAddLanguage(user);
      await searchForLanguage(user, 'nl');
      await selectLanguageOption(user, 'Dutch - Netherlands (nl_NL.UTF-8)');

      expect(store.getState().wizard.locale.languages).toContain('nl_NL.UTF-8');
    });

    test('updates store when multiple languages are selected', async () => {
      const { store } = renderLocaleStep({
        locale: {
          languages: [],
          keyboard: '',
        },
      });
      const user = createUser();

      await clickAddLanguage(user);
      await searchForLanguage(user, 'nl');
      await selectLanguageOption(user, 'Dutch - Netherlands (nl_NL.UTF-8)');

      await clickAddLanguage(user);
      await searchForLanguage(user, 'en');
      await selectLanguageOption(
        user,
        'English - United Kingdom (en_GB.UTF-8)',
      );

      const languages = store.getState().wizard.locale.languages;
      expect(languages).toContain('nl_NL.UTF-8');
      expect(languages).toContain('en_GB.UTF-8');
    });

    test('updates store when keyboard is selected', async () => {
      const { store } = renderLocaleStep({
        locale: {
          languages: [],
          keyboard: '',
        },
      });
      const user = createUser();

      expect(store.getState().wizard.locale.keyboard).toBe('');

      await searchForKeyboard(user, 'us');
      await selectKeyboardOption(user, 'us');

      expect(store.getState().wizard.locale.keyboard).toBe('us');
    });
  });

  describe('Form submission', () => {
    test('pressing Enter in keyboard search does not trigger page reload', async () => {
      renderLocaleStep();
      const user = createUser();

      await searchForKeyboard(user, 'us-dvorak{Enter}');

      expect(
        screen.getByRole('heading', { name: /Locale/i }),
      ).toBeInTheDocument();
    });

    test('pressing Enter in language search does not trigger page reload', async () => {
      renderLocaleStep();
      const user = createUser();

      await clickAddLanguage(user);
      await searchForLanguage(user, 'Dutch{Enter}');

      expect(
        screen.getByRole('heading', { name: /Locale/i }),
      ).toBeInTheDocument();
    });
  });
});
