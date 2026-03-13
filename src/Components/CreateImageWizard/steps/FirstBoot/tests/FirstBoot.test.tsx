import { screen } from '@testing-library/react';

import { initialState } from '@/store/slices/wizard';
import { createUser, waitForAction } from '@/test/testUtils';

import { openCodeEditor, renderFirstBootStep, uploadScript } from './helpers';

const VALID_SCRIPT = `#!/bin/bash
echo "Hello, World!"`;

const SCRIPT_WITHOUT_SHEBANG = `echo "Hello, World!"`;

describe('FirstBoot Component', () => {
  describe('Rendering', () => {
    test('displays step title and description', async () => {
      renderFirstBootStep();

      expect(
        await screen.findByRole('heading', {
          name: /First boot configuration/i,
        }),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Configure the image with a custom script/i),
      ).toBeInTheDocument();
    });

    test('displays security warning alert', async () => {
      renderFirstBootStep();

      expect(
        await screen.findByText(
          /Important: please do not include sensitive information/i,
        ),
      ).toBeInTheDocument();
    });

    test('displays start from scratch button initially', async () => {
      renderFirstBootStep();

      expect(
        await screen.findByRole('button', { name: /Start from scratch/i }),
      ).toBeInTheDocument();
    });
  });

  describe('Script Validation', () => {
    test('shows error for script without shebang', async () => {
      renderFirstBootStep();
      const user = createUser();

      await openCodeEditor(user);
      await uploadScript(user, SCRIPT_WITHOUT_SHEBANG);

      expect(await screen.findByText(/Missing shebang/i)).toBeInTheDocument();
    });

    test('accepts valid script with shebang', async () => {
      renderFirstBootStep();
      const user = createUser();

      await openCodeEditor(user);
      await uploadScript(user, VALID_SCRIPT);

      expect(screen.queryByText(/Missing shebang/i)).not.toBeInTheDocument();
    });
  });

  describe('Initial State', () => {
    test('does not show empty state when script is pre-populated', async () => {
      renderFirstBootStep({
        firstBoot: {
          script: VALID_SCRIPT,
        },
      });

      await screen.findByRole('heading', {
        name: /First boot configuration/i,
      });

      expect(
        screen.queryByRole('button', { name: /Start from scratch/i }),
      ).not.toBeInTheDocument();
    });
  });

  describe('Registration Message', () => {
    test('shows registration message when not using register-later', async () => {
      renderFirstBootStep({
        registration: {
          ...initialState.registration,
          registrationType: 'register-now-insights',
        },
      });

      expect(
        await screen.findByText(
          /First boot script will run after registration is done/i,
        ),
      ).toBeInTheDocument();
    });

    test('does not show registration message when using register-later', async () => {
      renderFirstBootStep({
        registration: {
          ...initialState.registration,
          registrationType: 'register-later',
        },
      });

      await screen.findByRole('heading', {
        name: /First boot configuration/i,
      });

      expect(
        screen.queryByText(
          /First boot script will run after registration is done/i,
        ),
      ).not.toBeInTheDocument();
    });
  });

  describe('State Updates', () => {
    test('updates store when script is uploaded', async () => {
      const { store } = renderFirstBootStep();
      const user = createUser();

      expect(store.getState().wizard.firstBoot.script).toBe('');

      await openCodeEditor(user);
      await uploadScript(user, VALID_SCRIPT);

      // The FileReader processes the file asynchronously, so we need to wait
      // for the state to be updated after the upload completes
      await waitForAction(() => {
        expect(store.getState().wizard.firstBoot.script).toBe(VALID_SCRIPT);
      });
    });
  });
});
