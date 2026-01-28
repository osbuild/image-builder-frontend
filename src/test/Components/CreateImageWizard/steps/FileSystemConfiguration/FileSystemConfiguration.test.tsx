import { screen, waitFor, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import {
  CREATE_BLUEPRINT,
  EDIT_BLUEPRINT,
  UNIT_GIB,
  UNIT_KIB,
  UNIT_MIB,
} from '../../../../../constants';
import { mockBlueprintIds } from '../../../../fixtures/blueprints';
import {
  diskCreateBlueprintRequest,
  fscCreateBlueprintRequest,
} from '../../../../fixtures/editMode';
import {
  blueprintRequest,
  clickNext,
  clickRegisterLater,
  clickReviewAndFinish,
  getNextButton,
  goToReview,
  goToStep,
  interceptBlueprintRequest,
  interceptEditBlueprintRequest,
  openAndDismissSaveAndBuildModal,
  renderCreateMode,
  renderEditMode,
} from '../../wizardTestUtils';

const selectGuestImage = async () => {
  const user = userEvent.setup();
  const guestImageCheckBox = await screen.findByRole('checkbox', {
    name: /virtualization guest image checkbox/i,
  });
  await waitFor(() => user.click(guestImageCheckBox));
};

const selectImageInstaller = async () => {
  const user = userEvent.setup();
  const imageInstallerCheckbox = await screen.findByRole('checkbox', {
    name: /Bare metal installer/i,
  });
  await waitFor(() => user.click(imageInstallerCheckbox));
};

const goToFileSystemConfigurationStep = async () => {
  await clickNext(); // Registration
  await clickRegisterLater();
  await goToStep(/File system configuration/);
};

const clickManuallyConfigurePartitions = async () => {
  const user = userEvent.setup();
  const button = await screen.findByText(/Basic filesystem partitioning/i);
  await waitFor(() => user.click(button));
};

const addPartition = async () => {
  const user = userEvent.setup();
  const button = await screen.findByRole('button', { name: /add partition/i });
  await waitFor(() => user.click(button));
};

const customizePartition = async () => {
  const user = userEvent.setup();
  const row = await getRow(2);
  const minSize = await within(row).findByRole('textbox', {
    name: /Mountpoint subpath/i,
  });
  await waitFor(() => user.type(minSize, 'cakerecipes'));
};

const getRow = async (row: number) => {
  const rows = await screen.findAllByRole('row');
  return rows[row];
};

const changePartitionSize = async () => {
  const user = userEvent.setup();
  const row = await getRow(1);
  const minSize = await within(row).findByRole('textbox', {
    name: /minimum partition size/i,
  });
  await waitFor(() => user.type(minSize, '{backspace}5'));
};

const changePartitionUnitsToKiB = async () => {
  const user = userEvent.setup();
  const row = await getRow(1);
  const units = await within(row).findByText('GiB');
  await waitFor(() => user.click(units));
  const kibOption = await screen.findByRole('option', { name: 'KiB' });
  await waitFor(() => user.click(kibOption));
};

const changePartitionUnitsToMiB = async () => {
  const user = userEvent.setup();
  const row = await getRow(1);
  const units = await within(row).findByText('GiB');
  await waitFor(() => user.click(units));
  const mibOption = await screen.findByRole('option', { name: 'MiB' });
  await waitFor(() => user.click(mibOption));
};

const clickRevisitButton = async () => {
  const user = userEvent.setup();
  const expandable = await screen.findByTestId(
    'file-system-configuration-expandable',
  );
  const revisitButton = await within(expandable).findByTestId(
    'revisit-file-system',
  );
  await waitFor(() => user.click(revisitButton));
};

describe('Step File system configuration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const user = userEvent.setup();

  test('clicking Review and finish leads to Review', async () => {
    await renderCreateMode();
    await selectGuestImage();
    await goToFileSystemConfigurationStep();
    await clickReviewAndFinish();
    await screen.findByRole('heading', {
      name: /Review/i,
    });
  });

  test('button Review and finish is disabled for invalid state', async () => {
    await renderCreateMode();
    await selectGuestImage();
    await goToFileSystemConfigurationStep();
    await clickManuallyConfigurePartitions();

    await addPartition();
    await addPartition();

    // Create a duplicate mount point so the step is invalid
    const rows = await screen.findAllByRole('row');
    rows.shift();
    const thirdRowMountPoint = await within(rows[2]).findByText('/var');
    await waitFor(() => user.click(thirdRowMountPoint));
    const homeOption = await screen.findByRole('option', { name: /\/home/i });
    await waitFor(() => user.click(homeOption));

    await clickReviewAndFinish();
    expect(
      await screen.findByRole('button', { name: /Review and finish/ }),
    ).toBeDisabled();
  });

  test('error validation occurs upon clicking next button', async () => {
    await renderCreateMode();
    await selectGuestImage();
    await goToFileSystemConfigurationStep();
    await clickManuallyConfigurePartitions();

    // Add two partitions
    await addPartition();
    await addPartition();

    const rows = await screen.findAllByRole('row');
    rows.shift(); // remove table header
    expect(rows).toHaveLength(3);

    // Create a duplicate by changing the third row from /var to /home
    const thirdRowMountPoint = await within(rows[2]).findByText('/var');
    await waitFor(() => user.click(thirdRowMountPoint));
    const homeOption = await screen.findByRole('option', { name: /\/home/i });
    await waitFor(() => user.click(homeOption));

    // Can't click next because duplicate mount point error appears
    await clickNext();
    expect(await getNextButton()).toBeDisabled();
    const mountPointAlerts = screen.getAllByRole('heading', {
      name: /danger alert: duplicate mount point/i,
    });
    expect(mountPointAlerts.length).toBeGreaterThanOrEqual(1);

    // Change mount point of final row back to /var, resolving errors
    const thirdRowMountPointAgain = await within(rows[2]).findByText('/home');
    await waitFor(() => user.click(thirdRowMountPointAgain));
    const varOption = await screen.findByRole('option', {
      name: /\/var/i,
    });
    await waitFor(() => user.click(varOption));
    await waitFor(() => {
      const alerts = screen.queryAllByRole('heading', {
        name: /danger alert: duplicate mount point/i,
      });
      expect(alerts).toHaveLength(0);
    });
    expect(await getNextButton()).toBeEnabled();
  });

  test('file system step is hidden for ISO targets only', async () => {
    await renderCreateMode();
    await selectImageInstaller();
    await clickNext(); // Registration
    await clickRegisterLater();
    // The file system configuration step should not be visible in the nav
    // when only ISO target is selected, as filesystem customization is not supported
    expect(
      screen.queryByRole('button', { name: /File system configuration/ }),
    ).not.toBeInTheDocument();
  });

  test('manual partitioning is shown for ISO target and other target', async () => {
    await renderCreateMode();
    await selectImageInstaller();
    await selectGuestImage();
    await goToFileSystemConfigurationStep();
    await clickManuallyConfigurePartitions();

    await screen.findByText('Configure partitions');
  });

  test('revisit step button on Review works', async () => {
    await renderCreateMode();
    await selectGuestImage();
    await goToFileSystemConfigurationStep();
    await goToReview();
    await clickRevisitButton();
    await screen.findByRole('heading', { name: /File system configuration/ });
  });
});

describe('File system configuration request generated correctly', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('10 GiB / correct', async () => {
    await renderCreateMode();
    await selectGuestImage();
    await goToFileSystemConfigurationStep();
    await clickManuallyConfigurePartitions();
    await goToReview();
    // informational modal pops up in the first test only as it's tied
    // to a 'imageBuilder.saveAndBuildModalSeen' variable in localStorage
    await openAndDismissSaveAndBuildModal();
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    const expectedRequest = {
      ...blueprintRequest,
      customizations: {
        ...blueprintRequest.customizations,
        filesystem: [
          {
            min_size: 10 * UNIT_GIB,
            mountpoint: '/',
          },
        ],
      },
    };

    expect(receivedRequest).toEqual(expectedRequest);
  });

  test('15 GiB / correct', async () => {
    await renderCreateMode();
    await selectGuestImage();
    await goToFileSystemConfigurationStep();
    await clickManuallyConfigurePartitions();
    await changePartitionSize();
    await goToReview();
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    const expectedRequest = {
      ...blueprintRequest,
      customizations: {
        ...blueprintRequest.customizations,
        filesystem: [
          {
            min_size: 15 * UNIT_GIB,
            mountpoint: '/',
          },
        ],
      },
    };

    expect(receivedRequest).toEqual(expectedRequest);
  });

  test('MiB / correct', async () => {
    await renderCreateMode();
    await selectGuestImage();
    await goToFileSystemConfigurationStep();
    await clickManuallyConfigurePartitions();
    await changePartitionUnitsToMiB();
    await goToReview();
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    const expectedRequest = {
      ...blueprintRequest,
      customizations: {
        ...blueprintRequest.customizations,
        filesystem: [
          {
            min_size: 10 * UNIT_MIB,
            mountpoint: '/',
          },
        ],
      },
    };

    expect(receivedRequest).toEqual(expectedRequest);
  });

  test('KiB / correct', async () => {
    await renderCreateMode();
    await selectGuestImage();
    await goToFileSystemConfigurationStep();
    await clickManuallyConfigurePartitions();
    await changePartitionUnitsToKiB();
    await goToReview();
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    const expectedRequest = {
      ...blueprintRequest,
      customizations: {
        ...blueprintRequest.customizations,
        filesystem: [
          {
            min_size: 10 * UNIT_KIB,
            mountpoint: '/',
          },
        ],
      },
    };

    expect(receivedRequest).toEqual(expectedRequest);
  });

  test('/home correct', async () => {
    await renderCreateMode();
    await selectGuestImage();
    await goToFileSystemConfigurationStep();
    await clickManuallyConfigurePartitions();
    await addPartition();
    await goToReview();
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    const expectedRequest = {
      ...blueprintRequest,
      customizations: {
        ...blueprintRequest.customizations,
        filesystem: [
          {
            min_size: 10 * UNIT_GIB,
            mountpoint: '/',
          },
          {
            min_size: 1 * UNIT_GIB,
            mountpoint: '/home',
          },
        ],
      },
    };

    expect(receivedRequest).toEqual(expectedRequest);
  });

  test('/home/cakerecipes correct', async () => {
    await renderCreateMode();
    await selectGuestImage();
    await goToFileSystemConfigurationStep();
    await clickManuallyConfigurePartitions();
    await addPartition();
    await customizePartition();
    await goToReview();
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    const expectedRequest = {
      ...blueprintRequest,
      customizations: {
        ...blueprintRequest.customizations,
        filesystem: [
          {
            min_size: 10 * UNIT_GIB,
            mountpoint: '/',
          },
          {
            min_size: 1 * UNIT_GIB,
            mountpoint: '/home/cakerecipes',
          },
        ],
      },
    };

    await waitFor(() => {
      expect(receivedRequest).toEqual(expectedRequest);
    });
  });
});

describe('File system configuration edit mode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('filesystem edit mode works', async () => {
    const id = mockBlueprintIds['fsc'];
    await renderEditMode(id);

    // starts on review step
    const receivedRequest = await interceptEditBlueprintRequest(
      `${EDIT_BLUEPRINT}/${id}`,
    );
    const expectedRequest = fscCreateBlueprintRequest;
    expect(receivedRequest).toEqual(expectedRequest);
  });

  test('disk edit mode works', async () => {
    const id = mockBlueprintIds['disk'];
    await renderEditMode(id);

    // starts on review step
    const receivedRequest = await interceptEditBlueprintRequest(
      `${EDIT_BLUEPRINT}/${id}`,
    );
    const expectedRequest = diskCreateBlueprintRequest;
    expect(receivedRequest).toEqual(expectedRequest);
  });
});
