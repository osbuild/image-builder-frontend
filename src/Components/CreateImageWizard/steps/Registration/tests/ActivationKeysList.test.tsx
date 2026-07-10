import { screen, waitFor } from '@testing-library/react';

import { initialState } from '@/store/slices/wizard';
import { server } from '@/test/mocks/server';
import { clickWithWait, createUser } from '@/test/testUtils';

import { renderRegistrationStep } from './helpers';
import {
  createDefaultFetchHandler,
  createFetchHandler,
  fetchMock,
  mockEmptyActivationKeys,
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

describe('Activation Keys List', () => {
  describe('Rendering', () => {
    test('displays activation key select', async () => {
      renderRegistrationStep({
        registration: {
          ...initialState.registration,
          type: 'register-now-rhc',
        },
      });

      expect(
        await screen.findByPlaceholderText(/select activation key/i),
      ).toBeInTheDocument();
    });
  });

  describe('Activation Key Selection', () => {
    test('displays list of activation keys when opened', async () => {
      renderRegistrationStep({
        registration: {
          ...initialState.registration,
          type: 'register-now-rhc',
        },
      });
      const user = createUser();

      const selectToggle = await screen.findByPlaceholderText(
        /select activation key/i,
      );
      await clickWithWait(user, selectToggle);

      await waitFor(() => {
        expect(
          screen.getByRole('option', { name: /activation-key-1/i }),
        ).toBeInTheDocument();
        expect(
          screen.getByRole('option', { name: /activation-key-2/i }),
        ).toBeInTheDocument();
        expect(
          screen.getByRole('option', { name: /test-key-alpha/i }),
        ).toBeInTheDocument();
      });
    });

    test('selects an activation key', async () => {
      renderRegistrationStep({
        registration: {
          ...initialState.registration,
          type: 'register-now-rhc',
        },
      });
      const user = createUser();

      const selectToggle = await screen.findByPlaceholderText(
        /select activation key/i,
      );
      await clickWithWait(user, selectToggle);

      const option = await screen.findByRole('option', {
        name: /activation-key-1/i,
      });
      await clickWithWait(user, option);

      await waitFor(() => {
        expect(selectToggle).toHaveValue('activation-key-1');
      });
    });

    test('shows view details button for activation keys', async () => {
      renderRegistrationStep({
        registration: {
          ...initialState.registration,
          type: 'register-now-rhc',
        },
      });

      expect(
        await screen.findByRole('button', { name: /view details/i }),
      ).toBeInTheDocument();
    });

    test('toggles activation key details visibility', async () => {
      renderRegistrationStep({
        registration: {
          ...initialState.registration,
          type: 'register-now-rhc',
        },
      });
      const user = createUser();

      const viewDetailsButton = await screen.findByRole('button', {
        name: /view details/i,
      });

      expect(screen.queryByText(/Name/i)).not.toBeInTheDocument();

      await clickWithWait(user, viewDetailsButton);

      await waitFor(() => {
        expect(screen.getByText(/Name/i)).toBeInTheDocument();
      });

      await clickWithWait(user, viewDetailsButton);

      await waitFor(() => {
        expect(screen.queryByText(/Name/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Empty State', () => {
    test('handles empty activation keys list', async () => {
      fetchMock.mockResponse(
        createFetchHandler({ activationKeys: mockEmptyActivationKeys }),
      );

      renderRegistrationStep({
        registration: {
          ...initialState.registration,
          type: 'register-now-rhc',
        },
      });

      const selectToggle = await screen.findByPlaceholderText(
        /select activation key/i,
      );

      expect(selectToggle).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    test('shows error alert when activation keys fail to load', async () => {
      fetchMock.mockReject(new Error('Failed to fetch activation keys'));

      renderRegistrationStep({
        registration: {
          ...initialState.registration,
          type: 'register-now-rhc',
        },
      });

      expect(
        await screen.findByText(/activation keys unavailable/i),
      ).toBeInTheDocument();
    });
  });
});
