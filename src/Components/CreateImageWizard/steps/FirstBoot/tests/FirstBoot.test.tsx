import { screen } from '@testing-library/react';

import { FIRST_BOOT_SERVICE } from '@/constants';
import { createUser, waitForAction } from '@/test/testUtils';

import { renderFirstBootStep, uploadScript } from './helpers';

const VALID_SCRIPT = `#!/bin/bash
echo "Hello, World!"`;

const SCRIPT_WITHOUT_SHEBANG = `echo "Hello, World!"`;

const CRLF_SCRIPT = '#!/bin/bash\r\necho "line1"\r\necho "line2"';
const LF_SCRIPT = '#!/bin/bash\necho "line1"\necho "line2"';

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
        screen.getByText(/Add a custom script to be executed/i),
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

    test('displays helper text for supported script types', async () => {
      renderFirstBootStep();

      expect(
        await screen.findByText(
          /Supports bash shell, python, or Ansible playbooks/i,
        ),
      ).toBeInTheDocument();
    });
  });

  describe('Script Validation', () => {
    test('shows error for script without shebang', async () => {
      renderFirstBootStep();
      const user = createUser();

      await uploadScript(user, SCRIPT_WITHOUT_SHEBANG);

      expect(await screen.findByText(/Missing shebang/i)).toBeInTheDocument();
    });

    test('accepts valid script with shebang', async () => {
      renderFirstBootStep();
      const user = createUser();

      await uploadScript(user, VALID_SCRIPT);

      expect(screen.queryByText(/Missing shebang/i)).not.toBeInTheDocument();
    });
  });

  describe('Initial State', () => {
    test('displays empty state with Start from scratch button', async () => {
      renderFirstBootStep();

      expect(
        await screen.findByRole('button', { name: /Start from scratch/i }),
      ).toBeInTheDocument();
    });

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

  describe('File Upload Component', () => {
    test('displays file upload with placeholder text', async () => {
      renderFirstBootStep();

      expect(
        await screen.findByPlaceholderText(/Drag and drop a file or upload/i),
      ).toBeInTheDocument();
    });

    test('displays upload button', async () => {
      renderFirstBootStep();

      const uploadButton = await screen.findByRole('button', {
        name: 'Upload',
      });
      expect(uploadButton).toBeInTheDocument();
    });
  });

  describe('Custom Controls', () => {
    test('displays revert button', async () => {
      renderFirstBootStep({
        firstBoot: { script: VALID_SCRIPT },
      });

      expect(
        await screen.findByRole('button', { name: /Revert changes/i }),
      ).toBeInTheDocument();
    });

    test('revert restores uploaded script', async () => {
      const { store } = renderFirstBootStep();
      const user = createUser();

      await uploadScript(user, VALID_SCRIPT);

      await waitForAction(() => {
        expect(store.getState().wizard.firstBoot.script).toBe(VALID_SCRIPT);
      });

      const revertButton = screen.getByRole('button', {
        name: /Revert changes/i,
      });
      await waitForAction(() => user.click(revertButton));

      await waitForAction(() => {
        expect(store.getState().wizard.firstBoot.script).toBe(VALID_SCRIPT);
      });
    });
  });

  describe('State Updates', () => {
    test('updates store when script is uploaded', async () => {
      const { store } = renderFirstBootStep();
      const user = createUser();

      expect(store.getState().wizard.firstBoot.script).toBe('');

      await uploadScript(user, VALID_SCRIPT);

      await waitForAction(() => {
        expect(store.getState().wizard.firstBoot.script).toBe(VALID_SCRIPT);
      });
    });

    test('adds first boot service when script is uploaded', async () => {
      const { store } = renderFirstBootStep();
      const user = createUser();

      await uploadScript(user, VALID_SCRIPT);

      await waitForAction(() => {
        expect(store.getState().wizard.services.enabled).toContain(
          FIRST_BOOT_SERVICE,
        );
      });
    });

    test('normalizes CRLF line endings to LF', async () => {
      const { store } = renderFirstBootStep();
      const user = createUser();

      await uploadScript(user, CRLF_SCRIPT);

      await waitForAction(() => {
        const storedScript = store.getState().wizard.firstBoot.script;
        expect(storedScript).toBe(LF_SCRIPT);
        expect(storedScript).not.toContain('\r\n');
      });
    });
  });
});
