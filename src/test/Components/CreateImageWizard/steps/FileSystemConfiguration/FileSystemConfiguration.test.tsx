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
import { fscCreateBlueprintRequest } from '../../../../fixtures/editMode';
import { clickNext, getNextButton } from '../../wizardTestUtils';
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

const selectGuestImage = async () => {
  const user = userEvent.setup();
  const guestImageCheckBox = await screen.findByRole('checkbox', {
    name: /virtualization guest image checkbox/i,
  });
  await waitFor(() => user.click(guestImageCheckBox));
};

const selectImageInstaller = async () => {
  const user = userEvent.setup();
  const imageInstallerCheckbox = await screen.findByTestId(
    'checkbox-image-installer'
  );
  await waitFor(() => user.click(imageInstallerCheckbox));
};

const goToFileSystemConfigurationStep = async () => {
  await clickNext(); // Registration
  await clickRegisterLater();
  await clickNext(); // OpenSCAP
  await clickNext(); // File System
};

const clickManuallyConfigurePartitions = async () => {
  const user = userEvent.setup();
  const button = await screen.findByText(/manually configure partitions/i);
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
    name: /mountpoint suffix/i,
  });
  await waitFor(() => user.type(minSize, 'cakerecipes'));
};

const getRow = async (row: number) => {
  const table = await screen.findByTestId('fsc-table');
  const rows = await within(table).findAllByRole('row');
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
  const units = await within(row).findAllByRole('button', {
    name: /options menu/i,
  });
  await waitFor(() => user.click(units[1]));
  const mibibytes = await screen.findByText('KiB');
  await waitFor(() => user.click(mibibytes));
};

const changePartitionUnitsToMiB = async () => {
  const user = userEvent.setup();
  const row = await getRow(1);
  const units = await within(row).findAllByRole('button', {
    name: /options menu/i,
  });
  await waitFor(() => user.click(units[1]));
  const mibibytes = await screen.findByText('MiB');
  await waitFor(() => user.click(mibibytes));
};

const goToReviewStep = async () => {
  await clickNext();
  await clickNext();
  await clickNext();
  await clickNext();
  await clickNext();
  await enterBlueprintName();
  await clickNext();
};

const clickFromImageOutputToFsc = async () => {
  const user = userEvent.setup();
  await clickNext();
  const registerLaterCheckbox = await screen.findByTestId(
    'automatically-register-checkbox'
  );
  await waitFor(async () => user.click(registerLaterCheckbox));
  await clickNext();
  await clickNext(); // skip OSCAP
};

describe('Step File system configuration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const user = userEvent.setup();
  test('Error validation occurs upon clicking next button', async () => {
    await renderCreateMode();
    await selectGuestImage();
    await goToFileSystemConfigurationStep();
    await clickManuallyConfigurePartitions();

    // Create duplicate partitions
    await addPartition();
    await addPartition();

    // Clicking next causes errors to appear
    await clickNext();
    expect(await getNextButton()).toBeDisabled();
    const mountPointAlerts = screen.getAllByRole('heading', {
      name: /danger alert: duplicate mount point/i,
    });
    const fscTable = await screen.findByTestId(
      'file-system-configuration-tbody'
    );
    const rows = within(fscTable).getAllByRole('row');
    expect(rows).toHaveLength(3);

    //Change mountpoint of final row to /var, resolving errors
    const mountPointOptions = within(rows[2]).getAllByRole('button', {
      name: 'Options menu',
    })[0];
    user.click(mountPointOptions);
    const varButton = await within(rows[2]).findByRole('option', {
      name: '/var',
    });
    user.click(varButton);
    await waitFor(() => expect(mountPointAlerts[0]).not.toBeInTheDocument());
    await waitFor(() => expect(mountPointAlerts[1]).not.toBeInTheDocument());
    expect(await getNextButton()).toBeEnabled();
  });

  test('Manual partitioning is hidden for ISO targets only', async () => {
    await renderCreateMode();
    await selectImageInstaller();
    await clickFromImageOutputToFsc();
    expect(
      screen.queryByText(/manually configure partitions/i)
    ).not.toBeInTheDocument();
  });

  test('Manual partitioning is shown for ISO target and other target', async () => {
    await renderCreateMode();
    await selectImageInstaller();
    await selectGuestImage();
    await clickFromImageOutputToFsc();
    await clickManuallyConfigurePartitions();

    await screen.findByText('Configure partitions');
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
    await goToReviewStep();
    // informational modal pops up in the first test only as it's tied
    // to a 'imageBuilder.saveAndBuildModalSeen' variable in localStorage
    await openAndDismissSaveAndBuildModal();
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    const expectedRequest = {
      ...blueprintRequest,
      customizations: {
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
    await goToReviewStep();
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    const expectedRequest = {
      ...blueprintRequest,
      customizations: {
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
    await goToReviewStep();
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    const expectedRequest = {
      ...blueprintRequest,
      customizations: {
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
    await goToReviewStep();
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    const expectedRequest = {
      ...blueprintRequest,
      customizations: {
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
    await goToReviewStep();
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    const expectedRequest = {
      ...blueprintRequest,
      customizations: {
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
    await goToReviewStep();
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    const expectedRequest = {
      ...blueprintRequest,
      customizations: {
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

  test('edit mode works', async () => {
    const id = mockBlueprintIds['fsc'];
    await renderEditMode(id);

    // starts on review step
    const receivedRequest = await interceptEditBlueprintRequest(
      `${EDIT_BLUEPRINT}/${id}`
    );
    const expectedRequest = fscCreateBlueprintRequest;
    expect(receivedRequest).toEqual(expectedRequest);
  });
});
