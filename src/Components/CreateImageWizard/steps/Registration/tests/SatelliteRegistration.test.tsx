import { act, screen } from '@testing-library/react';

import {
  emptySatelliteState,
  initialState,
  setForceShowErrors,
} from '@/store/slices/wizard';
import {
  clearWithWait,
  clickWithWait,
  createUser,
  tabWithWait,
  typeWithWait,
} from '@/test/testUtils';

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
    test('shows a required certificate error when wizard validation is triggered', async () => {
      const { store } = renderRegistrationStep({
        registration: {
          type: 'register-satellite',
          satellite: {
            ...emptySatelliteState,
            command: VALID_SATELLITE_COMMAND,
          },
        },
      });
      const certificateInput = await screen.findByRole('textbox', {
        name: /file upload/i,
      });

      expect(
        screen.getByText(/upload a certificate file/i),
      ).toBeInTheDocument();
      expect(certificateInput).not.toHaveAttribute('aria-invalid', 'true');

      act(() => {
        store.dispatch(setForceShowErrors());
      });

      expect(
        screen.getByText(/valid certificate must be present/i),
      ).toBeInTheDocument();
      expect(certificateInput).toHaveAttribute('aria-invalid', 'true');
    });

    test('shows loaded certificate when certificate exists in state', async () => {
      renderRegistrationStep({
        registration: {
          ...initialState.registration,
          type: 'register-satellite',
          satellite: {
            ...emptySatelliteState,
            caCerts: [VALID_CERTIFICATE],
          },
        },
      });

      expect(
        await screen.findByText(/CA certificate loaded/i),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('textbox', { name: /read only filename/i }),
      ).toHaveValue('CA detected');
    });

    test('stores a valid certificate entered into the empty editor', async () => {
      const { store } = renderRegistrationStep({
        registration: {
          ...initialState.registration,
          type: 'register-satellite',
          satellite: {
            ...emptySatelliteState,
            command: VALID_SATELLITE_COMMAND,
          },
        },
      });
      const user = createUser();
      const certificateInput = screen.getByRole('textbox', {
        name: /file upload/i,
      });

      await clickWithWait(user, certificateInput);
      await typeWithWait(user, certificateInput, VALID_CERTIFICATE);
      await tabWithWait(user);

      const caCerts = store.getState().wizard.registration.satellite?.caCerts;
      expect(caCerts).toHaveLength(1);
      expect(caCerts?.[0]).toContain(VALID_CERTIFICATE.split('\n')[1]);
    });

    test('keeps invalid edits pending until a valid certificate is entered', async () => {
      const { store } = renderRegistrationStep({
        registration: {
          ...initialState.registration,
          type: 'register-satellite',
          satellite: {
            ...emptySatelliteState,
            command: VALID_SATELLITE_COMMAND,
            caCerts: [VALID_CERTIFICATE],
          },
        },
      });
      const user = createUser();
      const certificateInput = screen.getByRole('textbox', {
        name: /file upload/i,
      });

      await clickWithWait(user, certificateInput);
      await clearWithWait(user, certificateInput);
      await typeWithWait(user, certificateInput, 'invalid certificate');

      expect(
        screen.queryByText(/No valid certificate format found/i),
      ).not.toBeInTheDocument();

      await tabWithWait(user);

      expect(
        await screen.findByText(/No valid certificate format found/i),
      ).toBeInTheDocument();
      expect(certificateInput).toHaveValue('invalid certificate');
      expect(store.getState().wizard.registration.satellite?.caCerts).toEqual([
        VALID_CERTIFICATE,
      ]);
      expect(store.getState().wizard.validation.pendingInputs).toHaveLength(1);

      await clickWithWait(user, certificateInput);
      await clearWithWait(user, certificateInput);
      await typeWithWait(user, certificateInput, VALID_CERTIFICATE);
      await tabWithWait(user);

      expect(
        await screen.findByText('CA certificate loaded'),
      ).toBeInTheDocument();
      expect(store.getState().wizard.validation.pendingInputs).toHaveLength(0);
      expect(
        store.getState().wizard.registration.satellite?.caCerts,
      ).toHaveLength(1);
    });
  });

  describe('Mode Switching', () => {
    test('persists satellite command when switching modes', async () => {
      renderRegistrationStep({
        registration: {
          ...initialState.registration,
          type: 'register-satellite',
          satellite: {
            ...emptySatelliteState,
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
