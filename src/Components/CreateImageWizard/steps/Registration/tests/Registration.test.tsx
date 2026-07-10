import { screen, waitFor } from '@testing-library/react';

import { initialState } from '@/store/slices/wizard';
import { clearWithWait, clickWithWait, createUser } from '@/test/testUtils';

import {
  enterActivationKey,
  enterOrgId,
  renderRegistrationStep,
  selectAutomaticRegistration,
  selectRegisterLater,
  selectSatelliteRegistration,
  toggleInsights,
  toggleRhc,
} from './helpers';

describe('Registration Component', () => {
  describe('Rendering', () => {
    test('displays step title and description', async () => {
      renderRegistrationStep();

      expect(
        await screen.findByRole('heading', { name: /register/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByText(
          /configure registration settings for systems that will use this image/i,
        ),
      ).toBeInTheDocument();
    });

    test('displays registration method options', async () => {
      renderRegistrationStep();

      expect(
        await screen.findByRole('radio', {
          name: /automatically register to red hat/i,
        }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('radio', { name: /register later/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('radio', {
          name: /register for a satellite or capsule server/i,
        }),
      ).toBeInTheDocument();
    });

    test('defaults to automatic registration with insights and rhc enabled', async () => {
      renderRegistrationStep();

      const autoRegisterRadio = await screen.findByRole('radio', {
        name: /automatically register to red hat/i,
      });
      expect(autoRegisterRadio).toBeChecked();

      const insightsSwitch = screen.getByRole('switch', {
        name: /enable predictive analytics/i,
      });
      const rhcSwitch = screen.getByRole('switch', {
        name: /enable remote remediations/i,
      });

      await waitFor(() => {
        expect(insightsSwitch).toBeChecked();
        expect(rhcSwitch).toBeChecked();
      });
    });
  });

  describe('Registration Mode Selection', () => {
    test('switches to register later mode', async () => {
      renderRegistrationStep();
      const user = createUser();

      await selectRegisterLater(user);

      const registerLaterRadio = screen.getByRole('radio', {
        name: /register later/i,
      });
      expect(registerLaterRadio).toBeChecked();

      expect(
        screen.queryByRole('switch', {
          name: /enable predictive analytics/i,
        }),
      ).not.toBeChecked();
    });

    test('switches to satellite registration mode', async () => {
      renderRegistrationStep();
      const user = createUser();

      await selectSatelliteRegistration(user);

      const satelliteRadio = screen.getByRole('radio', {
        name: /register for a satellite or capsule server/i,
      });
      expect(satelliteRadio).toBeChecked();

      expect(
        await screen.findByRole('textbox', { name: /registration command/i }),
      ).toBeInTheDocument();
    });

    test('can switch back to automatic registration', async () => {
      renderRegistrationStep({
        registration: {
          ...initialState.registration,
          type: 'register-later',
        },
      });
      const user = createUser();

      await selectAutomaticRegistration(user);

      const autoRegisterRadio = screen.getByRole('radio', {
        name: /automatically register to red hat/i,
      });
      expect(autoRegisterRadio).toBeChecked();

      expect(
        await screen.findByRole('switch', {
          name: /enable predictive analytics/i,
        }),
      ).toBeInTheDocument();
    });
  });

  describe('Insights and RHC Toggles', () => {
    test('toggling insights off also disables rhc', async () => {
      renderRegistrationStep();
      const user = createUser();

      const insightsSwitch = await screen.findByRole('switch', {
        name: /enable predictive analytics/i,
      });
      const rhcSwitch = screen.getByRole('switch', {
        name: /enable remote remediations/i,
      });

      await waitFor(() => expect(insightsSwitch).toBeChecked());
      await waitFor(() => expect(rhcSwitch).toBeChecked());

      await toggleInsights(user);

      await waitFor(() => {
        expect(insightsSwitch).not.toBeChecked();
        expect(rhcSwitch).not.toBeChecked();
      });
    });

    test('toggling rhc on enables insights', async () => {
      renderRegistrationStep({
        registration: {
          ...initialState.registration,
          type: 'register-now',
        },
      });
      const user = createUser();

      const insightsSwitch = await screen.findByRole('switch', {
        name: /enable predictive analytics/i,
      });
      const rhcSwitch = screen.getByRole('switch', {
        name: /enable remote remediations/i,
      });

      await waitFor(() => {
        expect(insightsSwitch).not.toBeChecked();
        expect(rhcSwitch).not.toBeChecked();
      });

      await toggleRhc(user);

      await waitFor(() => {
        expect(insightsSwitch).toBeChecked();
        expect(rhcSwitch).toBeChecked();
      });
    });

    test('toggling rhc off keeps insights enabled', async () => {
      renderRegistrationStep();
      const user = createUser();

      const insightsSwitch = await screen.findByRole('switch', {
        name: /enable predictive analytics/i,
      });
      const rhcSwitch = screen.getByRole('switch', {
        name: /enable remote remediations/i,
      });

      await waitFor(() => {
        expect(insightsSwitch).toBeChecked();
        expect(rhcSwitch).toBeChecked();
      });

      await toggleRhc(user);

      await waitFor(() => {
        expect(insightsSwitch).toBeChecked();
        expect(rhcSwitch).not.toBeChecked();
      });
    });

    test('can enable insights independently', async () => {
      renderRegistrationStep({
        registration: {
          ...initialState.registration,
          type: 'register-now',
        },
      });
      const user = createUser();

      const insightsSwitch = await screen.findByRole('switch', {
        name: /enable predictive analytics/i,
      });
      const rhcSwitch = screen.getByRole('switch', {
        name: /enable remote remediations/i,
      });

      await waitFor(() => {
        expect(insightsSwitch).not.toBeChecked();
        expect(rhcSwitch).not.toBeChecked();
      });

      await toggleInsights(user);

      await waitFor(() => {
        expect(insightsSwitch).toBeChecked();
        expect(rhcSwitch).not.toBeChecked();
      });
    });
  });

  describe('On-Premise Manual Activation Key', () => {
    test('displays activation key and org id inputs for on-premise', async () => {
      renderRegistrationStep(
        {},
        { preloadedState: { env: { isOnPremise: true } } },
      );

      expect(
        await screen.findByRole('textbox', { name: /activation key/i }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('textbox', { name: /organization id/i }),
      ).toBeInTheDocument();
    });

    test('validates activation key is not empty', async () => {
      renderRegistrationStep(
        {},
        { preloadedState: { env: { isOnPremise: true } } },
      );
      const user = createUser();

      const activationKeyInput = await screen.findByRole('textbox', {
        name: /activation key/i,
      });

      await clearWithWait(user, activationKeyInput);
      await clickWithWait(user, document.body);

      expect(
        await screen.findByText(/the activation key cannot be empty/i),
      ).toBeInTheDocument();
    });

    test('validates organization id is numeric', async () => {
      renderRegistrationStep(
        {
          registration: {
            ...initialState.registration,
            orgId: 'abc123',
          },
        },
        { preloadedState: { env: { isOnPremise: true } } },
      );
      const user = createUser();

      await enterOrgId(user, 'abcdefghijkl');
      await clickWithWait(user, document.body);

      expect(
        await screen.findByText(/please enter a valid organization id/i),
      ).toBeInTheDocument();
    });

    test('accepts valid activation key and org id', async () => {
      renderRegistrationStep(
        {},
        { preloadedState: { env: { isOnPremise: true } } },
      );
      const user = createUser();

      await enterActivationKey(user, 'test-activation-key');
      await enterOrgId(user, '12345');

      expect(
        screen.queryByText(/the activation key cannot be empty/i),
      ).not.toBeInTheDocument();
      expect(
        screen.queryByText(/please enter a valid organization id/i),
      ).not.toBeInTheDocument();
    });
  });
});
