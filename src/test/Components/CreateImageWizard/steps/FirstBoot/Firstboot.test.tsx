// NOTE: Needs Playwright coverage before deletion
// Playwright coverage: NONE - needs new playwright/Customizations/FirstBoot.spec.ts
// Unit test coverage: src/Components/CreateImageWizard/steps/FirstBoot/tests/
// Gaps to cover in Playwright:
//   - Create blueprint with first boot script
//   - Edit blueprint with first boot script
//   - OpenSCAP + FirstBoot integration (services merged correctly)
//   - dos2unix conversion (CRLF -> LF)
//   - Removing first boot script removes the enabled service
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
  clickRegisterLater,
  clickReviewImage,
  enterBlueprintName,
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
  await clickRegisterLater();
  await goToStep(/Advanced settings/);
};

const selectSimplifiedOscapProfile = async () => {
  const user = userEvent.setup();
  const openscapRadio = await screen.findByRole('radio', {
    name: /use a default openscap profile/i,
  });
  await user.click(openscapRadio);
  const openScapSelect = await screen.findByTestId('profileSelect');
  const typeahead = await within(openScapSelect).findByRole('textbox', {
    name: /type to filter/i,
  });
  await waitFor(() => user.click(typeahead));
  await waitFor(() => user.type(typeahead, 'simplified'));

  const simplifiedProfile = await screen.findByRole('option', {
    name: /simplified profile/i,
  });
  await waitFor(() => user.click(simplifiedProfile));
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
  const heading = screen.getByRole('heading', { name: 'Advanced settings' });
  // eslint-disable-next-line testing-library/no-node-access
  const card = heading.closest('.pf-v6-c-card') as HTMLElement;
  const editButton = within(card).getByRole('button', { name: /Edit/i });
  await waitFor(() => user.click(editButton));
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
    await clickReviewImage();
    await screen.findByRole('heading', {
      name: /Review image configuration/i,
    });
  });

  test('should validate shebang', async () => {
    await renderCreateMode();
    await goToFirstBootStep();
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
    await screen.findByRole('heading', { name: /Advanced settings/ });
  });
});

describe('First boot request generated correctly', () => {
  test('with no OpenSCAP profile selected', async () => {
    await renderCreateMode();
    await selectRhel9();
    await enterBlueprintName();
    await clickRegisterLater();
    await goToFirstBootStep();
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
    await enterBlueprintName();
    await clickRegisterLater();
    await selectSimplifiedOscapProfile();
    await goToStep(/First boot/);
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
    await enterBlueprintName();
    await goToOscapStep();
    await selectSimplifiedOscapProfile();
    await goToStep(/First boot/);
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

    await waitFor(() =>
      user.click(
        screen.getByRole('button', {
          name: /Base settings/i,
        }),
      ),
    );
    await screen.findByRole('heading', { name: /Base settings/i });
    await enterBlueprintName();

    await waitFor(() =>
      user.click(
        screen.getByRole('button', {
          name: /Advanced settings/i,
        }),
      ),
    );
    await screen.findByRole('heading', { name: /Advanced settings/i });

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
