import { screen, waitFor, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import {
  CREATE_BLUEPRINT,
  EDIT_BLUEPRINT,
  FIRST_BOOT_SERVICE,
  RHEL_9,
} from '../../../../../constants';
import { mockBlueprintIds } from '../../../../fixtures/blueprints';
import {
  baseCreateBlueprintRequest,
  firstBootCreateBlueprintRequest,
  firstBootData,
  SCRIPT,
  SCRIPT_DOS,
  SCRIPT_WITHOUT_SHEBANG,
} from '../../../../fixtures/editMode';
import {
  blueprintRequest,
  clickNext,
  clickRegisterLater,
  clickReviewAndFinish,
  getNextButton,
  goToOscapStep,
  goToReview,
  goToStep,
  interceptBlueprintRequest,
  interceptEditBlueprintRequest,
  openAndDismissSaveAndBuildModal,
  renderCreateMode,
  renderEditMode,
  selectGuestImageTarget,
  selectRhel9,
} from '../../wizardTestUtils';

const goToFirstBootStep = async (): Promise<void> => {
  const user = userEvent.setup();
  const guestImageCheckBox = await screen.findByRole('checkbox', {
    name: /virtualization guest image checkbox/i,
  });
  await waitFor(() => user.click(guestImageCheckBox));
  await clickNext(); // Registration
  await clickRegisterLater();
  await goToStep(/First boot/);
};

const selectSimplifiedOscapProfile = async () => {
  const user = userEvent.setup();
  const openscapRadio = await screen.findByRole('radio', {
    name: /use a default openscap profile/i,
  });
  await user.click(openscapRadio);
  const typeahead = await screen.findByRole('textbox', {
    name: /type to filter/i,
  });
  await waitFor(() => user.click(typeahead));
  await waitFor(() => user.type(typeahead, 'simplified'));

  const simplifiedProfile = await screen.findByRole('option', {
    name: /simplified profile/i,
  });
  await waitFor(() => user.click(simplifiedProfile));
};

const openCodeEditor = async (): Promise<void> => {
  const user = userEvent.setup();
  const startBtn = await screen.findByRole('button', {
    name: /Start from scratch/i,
  });
  await waitFor(() => user.click(startBtn));
};

const uploadFile = async (scriptName: string): Promise<void> => {
  const user = userEvent.setup();
  const fileInput: HTMLElement | null =
    // eslint-disable-next-line testing-library/no-node-access
    document.querySelector('input[type="file"]');

  if (fileInput) {
    const file = new File([scriptName], 'script.sh', { type: 'text/x-sh' });
    await waitFor(() => user.upload(fileInput, file));
  }
};

const clickRevisitButton = async () => {
  const user = userEvent.setup();
  const expandable = await screen.findByTestId('firstboot-expandable');
  const revisitButton =
    await within(expandable).findByTestId('revisit-first-boot');
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

  test('clicking Review and finish leads to Review', async () => {
    await renderCreateMode();
    await goToFirstBootStep();
    await clickReviewAndFinish();
    await screen.findByRole('heading', {
      name: /Review/i,
    });
  });

  test('should validate shebang', async () => {
    await renderCreateMode();
    await goToFirstBootStep();
    await openCodeEditor();
    await uploadFile(SCRIPT_WITHOUT_SHEBANG);
    expect(await screen.findByText(/Missing shebang/i)).toBeInTheDocument();
    expect(await getNextButton()).toBeDisabled();
    await uploadFile(SCRIPT);
    expect(screen.queryByText(/Missing shebang/i)).not.toBeInTheDocument();
    expect(await getNextButton()).toBeEnabled();
  });

  test('revisit step button on Review works', async () => {
    await renderCreateMode();
    await goToFirstBootStep();
    await goToReview();
    await clickRevisitButton();
    await screen.findByRole('heading', { name: /First boot/ });
  });
});

describe('First boot request generated correctly', () => {
  test('with no OpenSCAP profile selected', async () => {
    await renderCreateMode();
    await selectRhel9();
    await goToFirstBootStep();
    await openCodeEditor();
    await uploadFile(SCRIPT);
    await goToReview();
    // informational modal pops up in the first test only as it's tied
    // to a 'imageBuilder.saveAndBuildModalSeen' variable in localStorage
    await openAndDismissSaveAndBuildModal();
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    const expectedRequest = {
      ...blueprintRequest,
      distribution: RHEL_9, // overrides default RHEL 10 to make OpenSCAP available
      customizations: {
        ...blueprintRequest.customizations,
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
    await selectRhel9();
    await selectGuestImageTarget();
    await goToOscapStep();
    await selectSimplifiedOscapProfile();
    await goToStep(/First boot/);
    await openCodeEditor();
    await uploadFile(SCRIPT);
    await goToReview();
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    // request created with both OpenSCAP and first boot customization
    const expectedRequest = {
      ...blueprintRequest,
      distribution: RHEL_9, // overrides default RHEL 10 to make OpenSCAP available
      customizations: {
        ...blueprintRequest.customizations,
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

  test('dos2unix', async () => {
    await renderCreateMode();
    await selectRhel9();
    await selectGuestImageTarget();
    await goToOscapStep();
    await selectSimplifiedOscapProfile();
    await goToStep(/First boot/);
    await openCodeEditor();
    await uploadFile(SCRIPT_DOS);
    await goToReview();
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    // request created with both OpenSCAP and first boot customization
    const expectedRequest = {
      ...blueprintRequest,
      distribution: RHEL_9, // overrides default RHEL 10 to make OpenSCAP available
      customizations: {
        ...blueprintRequest.customizations,
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
      `${EDIT_BLUEPRINT}/${id}`,
    );
    const expectedRequest = firstBootCreateBlueprintRequest;
    expect(receivedRequest).toEqual(expectedRequest);
  });

  test('enabled service gets removed when first boot script is removed', async () => {
    const user = userEvent.setup();
    const id = mockBlueprintIds['firstBoot'];
    await renderEditMode(id);

    // navigate to the First Boot step
    const firstBootNavItem = await screen.findAllByRole('button', {
      name: /first boot/i,
    });
    await waitFor(() => user.click(firstBootNavItem[0]));

    // upload empty script file and go to Review
    await uploadFile(``);
    await goToReview();

    const receivedRequest = await interceptEditBlueprintRequest(
      `${EDIT_BLUEPRINT}/${id}`,
    );
    // both the enabled service and files should be removed
    // leaving the base blueprint request
    const expectedRequest = baseCreateBlueprintRequest;
    expect(receivedRequest).toEqual(expectedRequest);
  });
});
