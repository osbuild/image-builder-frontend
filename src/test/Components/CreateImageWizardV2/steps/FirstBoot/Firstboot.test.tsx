import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import {
  CREATE_BLUEPRINT,
  FIRST_BOOT_SERVICE,
  FIRST_BOOT_SERVICE_DATA,
} from '../../../../../constants';
import { File as ImageBuilderFile } from '../../../../../store/imageBuilderApi';
import { clickNext } from '../../../../testUtils';
import {
  blueprintRequest,
  clickRegisterLater,
  enterBlueprintName,
  interceptBlueprintRequest,
  renderCreateMode,
} from '../../wizardTestUtils';

import '@testing-library/jest-dom';

jest.mock('@redhat-cloud-services/frontend-components/useChrome', () => ({
  useChrome: () => ({
    auth: {
      getUser: () => {
        return {
          identity: {
            internal: {
              org_id: 5,
            },
          },
        };
      },
    },
    isBeta: () => true,
    isProd: () => true,
    getEnvironment: () => 'prod',
  }),
}));

const goToFirstBootStep = async (): Promise<void> => {
  const guestImageCheckBox = await screen.findByRole('checkbox', {
    name: /virtualization guest image checkbox/i,
  });
  await userEvent.click(guestImageCheckBox);
  await clickNext();
  await clickNext(); // Registration
  await clickRegisterLater();
  await clickNext(); // OpenSCAP
  await clickNext(); // File System
  await clickNext(); // Custom repositories
  await clickNext(); // Additional packages
  await clickNext(); // Snapshot
  await clickNext(); // First Boot
};

const openCodeEditor = async (): Promise<void> => {
  const startBtn = await screen.findByRole('button', {
    name: /Start from scratch/i,
  });
  await userEvent.click(startBtn);
};

const uploadFile = async (): Promise<void> => {
  const fileInput: HTMLElement | null =
    // eslint-disable-next-line testing-library/no-node-access
    document.querySelector('input[type="file"]');

  if (fileInput) {
    const file = new File([SCRIPT], 'script.sh', { type: 'text/x-sh' });
    await userEvent.upload(fileInput, file);
  }
};

const goToReviewStep = async (): Promise<void> => {
  await clickNext(); // Details
  await enterBlueprintName();
  await clickNext(); // Review
};

const SCRIPT = `#!/bin/bash
systemctl enable cockpit.socket`;

const BASE64_SCRIPT = btoa(SCRIPT);
const firstBootData: ImageBuilderFile[] = [
  {
    path: '/etc/systemd/system/custom-first-boot.service',
    data: FIRST_BOOT_SERVICE_DATA,
    data_encoding: 'base64',
    ensure_parents: true,
  },
  {
    path: '/usr/local/sbin/custom-first-boot',
    data: BASE64_SCRIPT,
    data_encoding: 'base64',
    mode: '0774',
    ensure_parents: true,
  },
];

describe('First Boot step', () => {
  test('should render First Boot step', async () => {
    await renderCreateMode();
    await goToFirstBootStep();
    expect(screen.getByText('First boot configuration')).toBeInTheDocument();
  });
  describe('validate first boot request ', () => {
    test('should validate first boot request', async () => {
      await renderCreateMode();
      await goToFirstBootStep();
      await openCodeEditor();
      await uploadFile();
      await goToReviewStep();
      const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

      const expectedRequest = {
        ...blueprintRequest,
        customizations: {
          files: firstBootData,
          services: { enabled: [FIRST_BOOT_SERVICE] },
        },
      };

      expect(receivedRequest).toEqual(expectedRequest);
    });
  });
});
