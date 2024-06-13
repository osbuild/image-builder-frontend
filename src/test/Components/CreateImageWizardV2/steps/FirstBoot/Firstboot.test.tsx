import { screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import {
  CREATE_BLUEPRINT,
  EDIT_BLUEPRINT,
  FIRST_BOOT_SERVICE,
} from '../../../../../constants';
import { mockBlueprintIds } from '../../../../fixtures/blueprints';
import {
  SCRIPT,
  firstBootCreateBlueprintRequest,
  firstBootData,
} from '../../../../fixtures/editMode';
import { clickNext } from '../../../../testUtils';
import {
  blueprintRequest,
  clickRegisterLater,
  enterBlueprintName,
  interceptBlueprintRequest,
  interceptEditBlueprintRequest,
  openAndDismissSaveAndBuildModal,
  renderCreateMode,
  renderEditMode,
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
      // informational modal pops up in the first test only as it's tied
      // to a 'imageBuilder.saveAndBuildModalSeen' variable in localStorage
      await openAndDismissSaveAndBuildModal();
      const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

      const expectedRequest = {
        ...blueprintRequest,
        customizations: {
          files: firstBootData,
          services: { enabled: [FIRST_BOOT_SERVICE] },
        },
      };

      await waitFor(() => {
        expect(receivedRequest).toEqual(expectedRequest);
      });
    });
  });
});

describe('First Boot edit mode', () => {
  test('edit mode works', async () => {
    const id = mockBlueprintIds['firstBoot'];
    await renderEditMode(id);

    // starts on review step
    const receivedRequest = await interceptEditBlueprintRequest(
      `${EDIT_BLUEPRINT}/${id}`
    );
    const expectedRequest = firstBootCreateBlueprintRequest;
    expect(receivedRequest).toEqual(expectedRequest);
  });
});
