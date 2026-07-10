import { screen, waitFor } from '@testing-library/react';

import { initialState } from '@/store/slices/wizard';
import { clearWithWait, clickWithWait, createUser } from '@/test/testUtils';

import {
  enterSatelliteCommand,
  renderRegistrationStep,
  selectSatelliteRegistration,
} from './helpers';
import {
  INVALID_SATELLITE_COMMAND,
  SATELLITE_COMMAND_EXPIRED_TOKEN,
  SATELLITE_COMMAND_NO_EXPIRATION,
  VALID_CERTIFICATE,
  VALID_SATELLITE_COMMAND,
} from './mocks';

describe('Satellite Registration', () => {
  describe('Rendering', () => {
    test('displays satellite registration fields when selected', async () => {
      renderRegistrationStep({
        registration: {
          ...initialState.registration,
          type: 'register-satellite',
        },
      });

      expect(
        await screen.findByRole('textbox', { name: /registration command/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: /upload/i }),
      ).toBeInTheDocument();
    });

    test('hides satellite fields for other registration modes', async () => {
      renderRegistrationStep();

      expect(
        screen.queryByRole('textbox', { name: /registration command/i }),
      ).not.toBeInTheDocument();
    });
  });

  describe('Command Validation', () => {
    test('shows error for invalid command', async () => {
      renderRegistrationStep({
        registration: {
          ...initialState.registration,
          type: 'register-satellite',
        },
      });
      const user = createUser();

      await enterSatelliteCommand(user, INVALID_SATELLITE_COMMAND);
      await clickWithWait(user, document.body);

      expect(
        await screen.findByText(/invalid or missing token/i),
      ).toBeInTheDocument();
    });

    test('shows warning for expired token', async () => {
      renderRegistrationStep({
        registration: {
          ...initialState.registration,
          type: 'register-satellite',
        },
      });
      const user = createUser();

      await enterSatelliteCommand(user, SATELLITE_COMMAND_EXPIRED_TOKEN);

      expect(
        await screen.findByText(
          /the token is already expired or will expire by next day/i,
        ),
      ).toBeInTheDocument();
    });

    test('accepts valid command with no expiration', async () => {
      renderRegistrationStep({
        registration: {
          ...initialState.registration,
          type: 'register-satellite',
        },
      });
      const user = createUser();

      await enterSatelliteCommand(user, SATELLITE_COMMAND_NO_EXPIRATION);

      await waitFor(() => {
        expect(
          screen.queryByText(/invalid or missing token/i),
        ).not.toBeInTheDocument();
        expect(
          screen.queryByText(
            /the token is already expired or will expire by next day/i,
          ),
        ).not.toBeInTheDocument();
      });
    });

    test('accepts valid command with standard token', async () => {
      renderRegistrationStep({
        registration: {
          ...initialState.registration,
          type: 'register-satellite',
        },
      });
      const user = createUser();

      await enterSatelliteCommand(user, VALID_SATELLITE_COMMAND);

      await waitFor(() => {
        expect(
          screen.queryByText(/invalid or missing token/i),
        ).not.toBeInTheDocument();
      });
    });

    test('clears error when valid command is entered after invalid', async () => {
      renderRegistrationStep({
        registration: {
          ...initialState.registration,
          type: 'register-satellite',
        },
      });
      const user = createUser();

      const commandInput = await screen.findByRole('textbox', {
        name: /registration command/i,
      });

      await enterSatelliteCommand(user, INVALID_SATELLITE_COMMAND);
      await clickWithWait(user, document.body);

      expect(
        await screen.findByText(/invalid or missing token/i),
      ).toBeInTheDocument();

      await clearWithWait(user, commandInput);
      await enterSatelliteCommand(user, VALID_SATELLITE_COMMAND);

      await waitFor(() => {
        expect(
          screen.queryByText(/invalid or missing token/i),
        ).not.toBeInTheDocument();
      });
    });
  });

  describe('Certificate Upload', () => {
    test('displays certificate upload field', async () => {
      renderRegistrationStep({
        registration: {
          ...initialState.registration,
          type: 'register-satellite',
        },
      });

      expect(
        await screen.findByRole('button', { name: /upload/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/upload a certificate file/i),
      ).toBeInTheDocument();
    });

    test('shows success message when certificate is uploaded', async () => {
      renderRegistrationStep({
        registration: {
          ...initialState.registration,
          type: 'register-satellite',
          satelliteRegistration: {
            ...initialState.registration.satelliteRegistration,
            caCert: VALID_CERTIFICATE,
          },
        },
      });

      expect(
        await screen.findByText(/certificate was uploaded/i),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('textbox', { name: /read only filename/i }),
      ).toHaveValue('CA detected');
    });
  });

  describe('Mode Switching', () => {
    test('persists satellite command when switching modes', async () => {
      renderRegistrationStep({
        registration: {
          ...initialState.registration,
          type: 'register-satellite',
          satelliteRegistration: {
            ...initialState.registration.satelliteRegistration,
            command: VALID_SATELLITE_COMMAND,
          },
        },
      });
      const user = createUser();

      await selectSatelliteRegistration(user);

      const commandInput = await screen.findByRole('textbox', {
        name: /registration command/i,
      });

      expect(commandInput).toHaveValue(VALID_SATELLITE_COMMAND);
    });
  });
});
