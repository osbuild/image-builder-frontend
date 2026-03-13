import { screen } from '@testing-library/react';

import { initialState } from '@/store/slices/wizard';
import { server } from '@/test/mocks/server';
import { createUser } from '@/test/testUtils';

import {
  clearBlueprintName,
  enterBlueprintDescription,
  enterBlueprintName,
  renderDetailsStep,
} from './helpers';
import {
  createDefaultFetchHandler,
  createFetchHandler,
  duplicateBlueprintsResponse,
  fetchMock,
} from './mocks';

fetchMock.enableMocks();

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

describe('Details Component', () => {
  describe('Rendering', () => {
    test('displays step title and description', async () => {
      renderDetailsStep();

      expect(
        await screen.findByRole('heading', { name: /Details/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Enter a name to identify your blueprint/i),
      ).toBeInTheDocument();
    });

    test('displays blueprint name input field', async () => {
      renderDetailsStep();

      expect(
        await screen.findByRole('textbox', { name: /blueprint name/i }),
      ).toBeInTheDocument();
    });

    test('displays blueprint description input field', async () => {
      renderDetailsStep();

      expect(
        await screen.findByRole('textbox', { name: /blueprint description/i }),
      ).toBeInTheDocument();
    });

    test('displays helper text for name requirements', async () => {
      renderDetailsStep();

      expect(
        await screen.findByText(
          /The name can be 2-100 characters with at least two letters or numbers/i,
        ),
      ).toBeInTheDocument();
    });
  });

  describe('Name Validation', () => {
    test('shows error for empty name', async () => {
      renderDetailsStep({
        details: {
          ...initialState.details,
          blueprintName: 'Initial Name',
        },
      });
      const user = createUser();

      await clearBlueprintName(user);

      expect(
        await screen.findByText(/Blueprint name is required/i),
      ).toBeInTheDocument();
    });

    test('shows error for name with only spaces', async () => {
      renderDetailsStep();
      const user = createUser();

      await enterBlueprintName(user, '   ');

      expect(
        await screen.findByText(/Invalid blueprint name/i),
      ).toBeInTheDocument();
    });

    test('shows error for name that is too short (1 character)', async () => {
      renderDetailsStep();
      const user = createUser();

      await enterBlueprintName(user, 'a');

      expect(
        await screen.findByText(/Invalid blueprint name/i),
      ).toBeInTheDocument();
    });

    test('shows error for name that is too long (101 characters)', async () => {
      renderDetailsStep();
      const user = createUser();

      const longName = 'a'.repeat(101);
      await enterBlueprintName(user, longName);

      expect(
        await screen.findByText(/Invalid blueprint name/i),
      ).toBeInTheDocument();
    });

    test('accepts valid name with minimum length (2 characters)', async () => {
      renderDetailsStep();
      const user = createUser();

      await enterBlueprintName(user, 'ab');

      expect(
        screen.queryByText(/Invalid blueprint name/i),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText(/Blueprint name is required/i),
      ).not.toBeInTheDocument();
    });

    test('accepts valid name with maximum length (100 characters)', async () => {
      renderDetailsStep();
      const user = createUser();

      const maxName = 'a'.repeat(100);
      await enterBlueprintName(user, maxName);

      expect(
        screen.queryByText(/Invalid blueprint name/i),
      ).not.toBeInTheDocument();
    });

    test('accepts name with special characters and emojis', async () => {
      renderDetailsStep();
      const user = createUser();

      await enterBlueprintName(user, 'Red Velvet 🤣');

      expect(
        screen.queryByText(/Invalid blueprint name/i),
      ).not.toBeInTheDocument();
    });
  });

  describe('Name Uniqueness', () => {
    test('shows error when name already exists', async () => {
      fetchMock.mockResponse(
        createFetchHandler({
          blueprintsResponse: duplicateBlueprintsResponse,
        }),
      );

      renderDetailsStep();
      const user = createUser();

      await enterBlueprintName(user, 'Existing Blueprint');

      expect(
        await screen.findByText(/Blueprint with this name already exists/i),
      ).toBeInTheDocument();
    });

    test('allows duplicate name in edit mode when editing same blueprint', async () => {
      fetchMock.mockResponse(
        createFetchHandler({
          blueprintsResponse: duplicateBlueprintsResponse,
        }),
      );

      // When editing, the blueprintId matches the returned blueprint's id
      renderDetailsStep({
        blueprintId: 'existing-blueprint-id',
        details: {
          ...initialState.details,
          blueprintName: 'Existing Blueprint',
        },
      });

      // In edit mode, the same name is allowed since we're editing the same blueprint
      await screen.findByRole('textbox', { name: /blueprint name/i });

      expect(
        screen.queryByText(/Blueprint with this name already exists/i),
      ).not.toBeInTheDocument();
    });
  });

  describe('Description Validation', () => {
    test('shows error for description that is too long (251 characters)', async () => {
      renderDetailsStep({
        details: {
          ...initialState.details,
          blueprintName: 'Valid Name',
        },
      });
      const user = createUser();

      const longDescription = 'a'.repeat(251);
      await enterBlueprintDescription(user, longDescription);

      expect(
        await screen.findByText(/Description is too long/i),
      ).toBeInTheDocument();
    });

    test('accepts description with maximum length (250 characters)', async () => {
      renderDetailsStep({
        details: {
          ...initialState.details,
          blueprintName: 'Valid Name',
        },
      });
      const user = createUser();

      const maxDescription = 'a'.repeat(250);
      await enterBlueprintDescription(user, maxDescription);

      expect(
        screen.queryByText(/Description is too long/i),
      ).not.toBeInTheDocument();
    });

    test('description is optional', async () => {
      renderDetailsStep({
        details: {
          ...initialState.details,
          blueprintName: 'Valid Name',
        },
      });

      expect(
        screen.queryByText(/Description is too long/i),
      ).not.toBeInTheDocument();
    });
  });

  describe('Initial State', () => {
    test('renders with pre-populated name from state', async () => {
      renderDetailsStep({
        details: {
          ...initialState.details,
          blueprintName: 'My Custom Blueprint',
        },
      });

      const input = await screen.findByRole('textbox', {
        name: /blueprint name/i,
      });
      expect(input).toHaveValue('My Custom Blueprint');
    });

    test('renders with pre-populated description from state', async () => {
      renderDetailsStep({
        details: {
          ...initialState.details,
          blueprintDescription: 'A detailed description',
        },
      });

      const input = await screen.findByRole('textbox', {
        name: /blueprint description/i,
      });
      expect(input).toHaveValue('A detailed description');
    });
  });

  describe('State Updates', () => {
    test('updates store when name is changed', async () => {
      const { store } = renderDetailsStep();
      const user = createUser();

      await enterBlueprintName(user, 'New Blueprint Name');

      const state = store.getState();
      expect(state.wizard.details.blueprintName).toBe('New Blueprint Name');
    });

    test('updates store when description is changed', async () => {
      const { store } = renderDetailsStep();
      const user = createUser();

      await enterBlueprintDescription(user, 'New description');

      const state = store.getState();
      expect(state.wizard.details.blueprintDescription).toBe('New description');
    });

    test('sets isCustomName when name is changed', async () => {
      const { store } = renderDetailsStep();
      const user = createUser();

      expect(store.getState().wizard.details.isCustomName).toBe(false);

      await enterBlueprintName(user, 'Custom Name');

      expect(store.getState().wizard.details.isCustomName).toBe(true);
    });
  });
});
