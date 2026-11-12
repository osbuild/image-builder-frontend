import { screen } from '@testing-library/react';

import { initialState } from '@/store/slices/wizard';
import { createUser } from '@/test/testUtils';

import { renderRegistrationStep, selectSatelliteRegistration } from './helpers';
import { VALID_CERTIFICATE, VALID_SATELLITE_COMMAND } from './mocks';

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
