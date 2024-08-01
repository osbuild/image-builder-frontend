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

vi.mock('@redhat-cloud-services/frontend-components/useChrome', () => ({
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

vi.mock('@unleash/proxy-client-react', () => ({
  useUnleashContext: () => vi.fn(),
  useFlag: vi.fn((flag) => {
    switch (flag) {
      case 'image-builder.firstboot.enabled':
        return true;
      case 'image-builder.snapshots.enabled':
        return true;
      default:
        return false;
    }
  }),
}));

const goToFileSystemConfigurationStep = async () => {
  const user = userEvent.setup();
  const guestImageCheckBox = await screen.findByRole('checkbox', {
    name: /virtualization guest image checkbox/i,
  });
  await waitFor(() => user.click(guestImageCheckBox));
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

describe('file system configuration request generated correctly', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('10 GiB / correct', async () => {
    await renderCreateMode();
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

describe('FSC edit mode', () => {
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
