import { screen } from '@testing-library/react';

import { server } from '@/test/mocks/server';
import { createUser, tabWithWait } from '@/test/testUtils';
import { yyyyMMddFormat } from '@/Utilities/time';

import {
  checkDatePickerValue,
  checkTemplatesCount,
  clearAndFillDatePickerInput,
  clickClearDate,
  clickTodaysDate,
  fillTemplateSearch,
  openTemplateDropdown,
  renderRepeatableBuildStep,
  selectDisableRepeatableBuild,
  selectEnableRepeatableBuild,
  selectTemplate,
  selectUseAContentTemplate,
} from './helpers';
import { createDefaultFetchHandler, fetchMock } from './mocks/handlers';

fetchMock.enableMocks();

vi.mock('@/Utilities/useDebounce', () => ({
  default: <T,>(value: T): T => value,
}));

vi.mock('@/Hooks', () => ({
  useGetUser: () => ({ userData: undefined, orgId: undefined }),
}));

// Disable global MSW server for this file - we use fetch mocks instead
beforeAll(() => {
  server.close();
});

// Restore global MSW server so other tests don't break
afterAll(() => {
  server.listen();
});

beforeEach(() => {
  fetchMock.mockResponse(createDefaultFetchHandler);
});

afterEach(() => {
  fetchMock.resetMocks();
});

describe('Repeatable Build Component', () => {
  describe('Rendering', () => {
    test('displays step title and description', async () => {
      renderRepeatableBuildStep();

      expect(
        await screen.findByRole('heading', {
          name: /Enable repeatable build/i,
        }),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Create images that can be reproduced consistently/i),
      ).toBeInTheDocument();
    });

    test('displays step radios', async () => {
      renderRepeatableBuildStep();

      expect(
        await screen.findByRole('radio', { name: /Disable repeatable build/i }),
      ).toBeInTheDocument();
      expect(
        await screen.findByRole('radio', { name: /Enable repeatable build/i }),
      ).toBeInTheDocument();
      expect(
        await screen.findByRole('radio', { name: /Use a content template/i }),
      ).toBeInTheDocument();
    });
  });

  describe('Disable Repeatable Build Option', () => {
    test('does not render date picker or template dropdown', async () => {
      renderRepeatableBuildStep();

      expect(screen.queryByText(/Snapshot date/)).not.toBeInTheDocument();
      expect(
        screen.queryByRole('button', {
          name: /Select content template/i,
        }),
      ).not.toBeInTheDocument();
    });
  });

  describe('Enable Repeatable Build Option', () => {
    test('does not render template dropdown', async () => {
      renderRepeatableBuildStep();
      const user = createUser();

      await selectEnableRepeatableBuild(user);

      expect(
        screen.queryByRole('button', {
          name: /Select content template/i,
        }),
      ).not.toBeInTheDocument();
    });

    test('displays date picker and buttons', async () => {
      renderRepeatableBuildStep();
      const user = createUser();

      await selectEnableRepeatableBuild(user);

      expect(await screen.findByText(/snapshot date/i)).toBeInTheDocument();
      expect(
        await screen.findByRole('button', { name: /today's date/i }),
      ).toBeInTheDocument();
      expect(
        await screen.findByRole('button', { name: /clear date/i }),
      ).toBeInTheDocument();
    });

    test('can clear and re-fill date picker with buttons', async () => {
      renderRepeatableBuildStep();
      const user = createUser();

      await selectEnableRepeatableBuild(user);

      await clickClearDate(user);
      expect(
        await screen.findByText('Date cannot be blank'),
      ).toBeInTheDocument();
      await checkDatePickerValue('');

      await clickTodaysDate(user);
      await checkDatePickerValue(yyyyMMddFormat(new Date()));
    });

    test('shows error for invalid input', async () => {
      renderRepeatableBuildStep();
      const user = createUser();

      await selectEnableRepeatableBuild(user);

      await clearAndFillDatePickerInput(user, '*****');
      await tabWithWait(user); // needs to unfocus the input first

      expect(await screen.findByText('Invalid date')).toBeInTheDocument();
    });
  });

  describe('Use a content template', () => {
    test('does not render date picker', async () => {
      renderRepeatableBuildStep();
      const user = createUser();

      await selectUseAContentTemplate(user);

      expect(screen.queryByText(/Snapshot date/)).not.toBeInTheDocument();
    });

    test('renders template dropdown', async () => {
      renderRepeatableBuildStep();
      const user = createUser();

      await selectUseAContentTemplate(user);

      expect(
        await screen.findByRole('button', { name: /select content template/i }),
      ).toBeInTheDocument();
    });

    test('template dropdown shows search and options', async () => {
      renderRepeatableBuildStep();
      const user = createUser();

      await selectUseAContentTemplate(user);
      await openTemplateDropdown(user);

      expect(
        await screen.findByRole('textbox', {
          name: /filter content templates/i,
        }),
      ).toBeVisible();

      expect(
        await screen.findByRole('menuitem', {
          name: /template-abc snapshot date: use latest \| status: valid/i,
        }),
      ).toBeVisible();

      await checkTemplatesCount(3);

      expect(
        await screen.findByRole('menuitem', {
          name: /template-abc snapshot date: use latest \| status: valid/i,
        }),
      ).toBeVisible();
      expect(
        await screen.findByRole('menuitem', {
          name: /template-def snapshot date: use latest \| status: valid/i,
        }),
      ).toBeVisible();
      expect(
        await screen.findByRole('menuitem', {
          name: /template-xyz snapshot date: 2025-02-28 \| status: valid/i,
        }),
      ).toBeVisible();
    });

    test('template search works', async () => {
      renderRepeatableBuildStep();
      const user = createUser();

      await selectUseAContentTemplate(user);
      await openTemplateDropdown(user);

      await fillTemplateSearch(user, 'template-xyz');

      await checkTemplatesCount(1);

      expect(
        await screen.findByRole('menuitem', {
          name: /template-xyz snapshot date: 2025-02-28 \| status: valid/i,
        }),
      ).toBeVisible();
    });

    test('shows no result option with no search matches', async () => {
      renderRepeatableBuildStep();
      const user = createUser();

      await selectUseAContentTemplate(user);
      await openTemplateDropdown(user);

      await fillTemplateSearch(user, 'non-existent-template');

      expect(
        await screen.findByRole('menuitem', {
          name: /no results found/i,
        }),
      ).toBeVisible();
    });
  });

  describe('Initial State', () => {
    test('renders with pre-populated snapshot date', async () => {
      renderRepeatableBuildStep({
        snapshotting: {
          useLatest: false,
          snapshotDate: '2026-01-01',
          template: '',
          templateName: '',
        },
      });

      await checkDatePickerValue('2026-01-01');
    });

    test('renders with pre-populated template', async () => {
      renderRepeatableBuildStep({
        snapshotting: {
          useLatest: false,
          snapshotDate: '',
          template: '80b958f8-37f7-4b91-b992-c8f84c05ea2a',
          templateName: 'template-def',
        },
      });

      expect(
        await screen.findByRole('button', {
          name: /template-def/i,
        }),
      ).toBeInTheDocument();
    });
  });

  describe('State Updates', () => {
    test('updates store when Enable repeatable build is selected', async () => {
      const { store } = renderRepeatableBuildStep();
      const user = createUser();

      expect(store.getState().wizard.snapshotting.useLatest).toBe(true);
      expect(store.getState().wizard.snapshotting.snapshotDate).toBe('');
      expect(store.getState().wizard.snapshotting.template).toBe('');
      expect(store.getState().wizard.snapshotting.templateName).toBe('');

      await selectEnableRepeatableBuild(user);

      expect(store.getState().wizard.snapshotting.useLatest).toBe(false);
      expect(store.getState().wizard.snapshotting.snapshotDate).toContain(
        yyyyMMddFormat(new Date()),
      );
      expect(store.getState().wizard.snapshotting.template).toBe('');
      expect(store.getState().wizard.snapshotting.templateName).toBe('');
    });

    test('updates store when snapshot date changes', async () => {
      const { store } = renderRepeatableBuildStep();
      const user = createUser();

      expect(store.getState().wizard.snapshotting.useLatest).toBe(true);
      expect(store.getState().wizard.snapshotting.snapshotDate).toBe('');
      expect(store.getState().wizard.snapshotting.template).toBe('');
      expect(store.getState().wizard.snapshotting.templateName).toBe('');

      await selectEnableRepeatableBuild(user);
      await clearAndFillDatePickerInput(user, '2026-01-01');

      expect(store.getState().wizard.snapshotting.useLatest).toBe(false);
      expect(store.getState().wizard.snapshotting.snapshotDate).toBe(
        '2026-01-01T00:00:00.000Z',
      );
      expect(store.getState().wizard.snapshotting.template).toBe('');
      expect(store.getState().wizard.snapshotting.templateName).toBe('');
    });

    test('updates store when Use a content template is selected', async () => {
      const { store } = renderRepeatableBuildStep();
      const user = createUser();

      expect(store.getState().wizard.snapshotting.useLatest).toBe(true);
      expect(store.getState().wizard.snapshotting.snapshotDate).toBe('');
      expect(store.getState().wizard.snapshotting.template).toBe('');
      expect(store.getState().wizard.snapshotting.templateName).toBe('');

      await selectUseAContentTemplate(user);
      await selectTemplate(user, 'template-def');

      expect(store.getState().wizard.snapshotting.useLatest).toBe(false);
      expect(store.getState().wizard.snapshotting.snapshotDate).toBe('');
      expect(store.getState().wizard.snapshotting.template).toBe(
        '80b958f8-37f7-4b91-b992-c8f84c05ea2a',
      );
      expect(store.getState().wizard.snapshotting.templateName).toBe(
        'template-def',
      );
    });

    test('updates store when snapshot date is filled and repeatable build is disabled again', async () => {
      const { store } = renderRepeatableBuildStep();
      const user = createUser();

      expect(store.getState().wizard.snapshotting.useLatest).toBe(true);
      expect(store.getState().wizard.snapshotting.snapshotDate).toBe('');

      await selectEnableRepeatableBuild(user);
      await clearAndFillDatePickerInput(user, '2026-01-01');
      await selectDisableRepeatableBuild(user);

      expect(store.getState().wizard.snapshotting.useLatest).toBe(true);
      expect(store.getState().wizard.snapshotting.snapshotDate).toBe('');
    });
  });
});
