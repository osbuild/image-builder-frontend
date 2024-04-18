import { screen, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import {
  CREATE_BLUEPRINT,
  UNIT_GIB,
  UNIT_KIB,
  UNIT_MIB,
} from '../../../../../constants';
import { clickNext } from '../../../../testUtils';
import {
  blueprintRequest,
  clickRegisterLater,
  enterBlueprintName,
  interceptBlueprintRequest,
  renderCreateMode,
} from '../../wizardTestUtils';

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

const goToFileSystemConfigurationStep = async () => {
  const guestImageCheckBox = await screen.findByRole('checkbox', {
    name: /virtualization guest image checkbox/i,
  });
  await userEvent.click(guestImageCheckBox);
  await clickNext(); // Registration
  await clickRegisterLater();
  await clickNext(); // OpenSCAP
  await clickNext(); // File System
};

const clickManuallyConfigurePartitions = async () => {
  const button = await screen.findByText(/manually configure partitions/i);
  await userEvent.click(button);
};

const addPartition = async () => {
  const button = await screen.findByRole('button', { name: /add partition/i });
  await userEvent.click(button);
};

const customizePartition = async () => {
  const row = await getRow(2);
  const minSize = await within(row).findByRole('textbox', {
    name: /mountpoint suffix/i,
  });
  await userEvent.type(minSize, 'cakerecipes');
};

const getRow = async (row: number) => {
  const table = await screen.findByTestId('fsc-table');
  const rows = await within(table).findAllByRole('row');
  return rows[row];
};

const changePartitionSize = async () => {
  const row = await getRow(1);
  const minSize = await within(row).findByRole('textbox', {
    name: /minimum partition size/i,
  });
  await userEvent.type(minSize, '{backspace}5');
};

const changePartitionUnitsToKiB = async () => {
  const row = await getRow(1);
  const units = await within(row).findAllByRole('button', {
    name: /options menu/i,
  });
  await userEvent.click(units[1]);
  const mibibytes = await screen.findByText('KiB');
  await userEvent.click(mibibytes);
};

const changePartitionUnitsToMiB = async () => {
  const row = await getRow(1);
  const units = await within(row).findAllByRole('button', {
    name: /options menu/i,
  });
  await userEvent.click(units[1]);
  const mibibytes = await screen.findByText('MiB');
  await userEvent.click(mibibytes);
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
  test('10 GiB / correct', async () => {
    await renderCreateMode();
    await goToFileSystemConfigurationStep();
    await clickManuallyConfigurePartitions();
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

    expect(receivedRequest).toEqual(expectedRequest);
  });
});
