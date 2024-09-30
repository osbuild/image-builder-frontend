import { screen, waitFor, within } from '@testing-library/react';
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
import {
  clickNext,
  clickReviewAndFinish,
  goToOscapStep,
  //getNextButton,
} from '../../wizardTestUtils';
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

const goToFirstBootStep = async (): Promise<void> => {
  const user = userEvent.setup();
  const guestImageCheckBox = await screen.findByRole('checkbox', {
    name: /virtualization guest image checkbox/i,
  });
  await waitFor(() => user.click(guestImageCheckBox));
  await clickNext(); // Registration
  await clickRegisterLater();
  await clickNext(); // OpenSCAP
  await clickNext(); // File System
  await clickNext(); // Custom repositories
  await clickNext(); // Additional packages
  await clickNext(); // Snapshot
  await clickNext(); // First Boot
};

const selectSimplifiedOscapProfile = async () => {
  const user = userEvent.setup();
  const selectProfileDropdown = await screen.findByRole('textbox', {
    name: /select a profile/i,
  });
  await waitFor(() => user.click(selectProfileDropdown));

  const simplifiedProfile = await screen.findByText(/Simplified profile/i);
  await waitFor(() => user.click(simplifiedProfile));
};

const goFromOscapToFirstBoot = async () => {
  await clickNext();
  await clickNext();
  await clickNext();
  await clickNext();
  await clickNext();
};

const openCodeEditor = async (): Promise<void> => {
  const user = userEvent.setup();
  const startBtn = await screen.findByRole('button', {
    name: /Start from scratch/i,
  });
  await waitFor(() => user.click(startBtn));
};

const uploadFile = async (): Promise<void> => {
  const user = userEvent.setup();
  const fileInput: HTMLElement | null =
    // eslint-disable-next-line testing-library/no-node-access
    document.querySelector('input[type="file"]');

  if (fileInput) {
    const file = new File([SCRIPT], 'script.sh', { type: 'text/x-sh' });
    await waitFor(() => user.upload(fileInput, file));
  }
};

const goToReviewStep = async (): Promise<void> => {
  await clickNext(); // Details
  await enterBlueprintName();
  await clickNext(); // Review
};

const clickRevisitButton = async () => {
  const user = userEvent.setup();
  const expandable = await screen.findByTestId('firstboot-expandable');
  const revisitButton = await within(expandable).findByTestId(
    'revisit-first-boot'
  );
  await waitFor(() => user.click(revisitButton));
};

describe('First Boot step', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should render First Boot step', async () => {
    await renderCreateMode();
    await goToFirstBootStep();
    await screen.findByText('First boot configuration');
  });

  test('clicking Review and finish leads to Details', async () => {
    await renderCreateMode();
    await goToFirstBootStep();
    await clickReviewAndFinish();
    await screen.findByRole('heading', {
      name: 'Details',
    });
  });

  // test('should validate shebang', async () => {
  //   await renderCreateMode();
  //   await goToFirstBootStep();
  //   await openCodeEditor();
  //   const editor = await screen.findByRole('textbox');
  //   await userEvent.type(editor, 'echo "Hello, world!"');
  //   expect(await screen.findByText('Missing shebang')).toBeInTheDocument();
  //   expect(await getNextButton()).toBeDisabled();

  //   await userEvent.clear(editor);
  //   await userEvent.type(editor, '#!/bin/bash');
  //   expect(screen.queryByText('Missing shebang')).not.toBeInTheDocument();
  //   expect(await getNextButton()).toBeEnabled();
  // });

  test('revisit step button on Review works', async () => {
    await renderCreateMode();
    await goToFirstBootStep();
    await goToReviewStep();
    await clickRevisitButton();
    await screen.findByRole('heading', { name: /First boot/ });
  });
});

describe('First boot request generated correctly', () => {
  test('with no OpenSCAP profile selected', async () => {
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

  test('with an OpenSCAP profile', async () => {
    await renderCreateMode();
    await goToOscapStep();
    await selectSimplifiedOscapProfile();
    await goFromOscapToFirstBoot();
    await openCodeEditor();
    await uploadFile();
    await goToReviewStep();
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    // request created with both OpenSCAP and first boot customization
    const expectedRequest = {
      ...blueprintRequest,
      customizations: {
        filesystem: [{ min_size: 10737418240, mountpoint: '/' }],
        openscap: {
          profile_id: 'xccdf_org.ssgproject.content_profile_standard',
        },
        files: firstBootData,
        // services need to contain both serviced included in the OpenSCAP profile
        // and the first boot script
        services: { enabled: ['crond', 'emacs-service', FIRST_BOOT_SERVICE] },
      },
    };

    await waitFor(() => {
      expect(receivedRequest).toEqual(expectedRequest);
    });
  });
});

describe('First Boot edit mode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

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
