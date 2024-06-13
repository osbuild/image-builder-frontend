import { screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { CREATE_BLUEPRINT, EDIT_BLUEPRINT } from '../../../../../constants';
import { CreateBlueprintRequest } from '../../../../../store/imageBuilderApi';
import { mockBlueprintIds } from '../../../../fixtures/blueprints';
import {
  expectedCustomRepositories,
  expectedPayloadRepositories,
  snapshotCreateBlueprintRequest,
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

const goToSnapshotStep = async () => {
  const guestImageCheckBox = await screen.findByRole('checkbox', {
    name: /virtualization guest image checkbox/i,
  });
  await userEvent.click(guestImageCheckBox);
  await clickNext(); // Registration
  await clickRegisterLater();
  await clickNext(); // OpenSCAP
  await clickNext(); // File System
  await clickNext();
};

const goToReviewStep = async () => {
  await clickNext(); // Repositories step
  await clickNext(); // Additional packages
  await clickNext();
  await clickNext(); // Details
  await enterBlueprintName();
  await clickNext();
};

const selectFirstRepository = async () => {
  await userEvent.click(
    await screen.findByRole('checkbox', { name: /select row 0/i })
  );
};

const selectUseSnapshot = async () => {
  await userEvent.click(
    await screen.findByRole('radio', { name: /Use a snapshot/i })
  );
};

const updateDatePickerWithValue = async (date: string) => {
  await userEvent.type(
    await screen.findByRole('textbox', { name: /Date picker/i }),
    date
  );
};

const clickContentDropdown = async () => {
  await userEvent.click(await screen.findByTestId('content-expandable'));
};

const getSnapshotMethodElement = async () =>
  await screen.findByRole('button', { name: /Snapshot method/i });

describe('repository snapshot tab - ', () => {
  test('select use a snapshot with 1 repo selected', async () => {
    await renderCreateMode();
    await goToSnapshotStep();
    await selectUseSnapshot();
    await updateDatePickerWithValue('04/22/2024');
    await clickNext(); // To repositories step
    await selectFirstRepository();
    await goToReviewStep();
    await clickContentDropdown();

    const snapshotMethodElement = await getSnapshotMethodElement();
    // Check date was recorded correctly
    expect(snapshotMethodElement).toHaveTextContent('State as of 04/22/2024');
    // Check that the button is clickable (has 1 repo selected)
    expect(snapshotMethodElement).toHaveAttribute('aria-disabled', 'false');

    // informational modal pops up in the first test only as it's tied
    // to a 'imageBuilder.saveAndBuildModalSeen' variable in localStorage
    await openAndDismissSaveAndBuildModal();

    // Check the date was passed correctly to the blueprint
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);
    blueprintRequest.image_requests[0].snapshot_date = '2024-04-22';

    const expectedRequest: CreateBlueprintRequest = {
      ...blueprintRequest,
      customizations: {
        custom_repositories: expectedCustomRepositories,
        payload_repositories: expectedPayloadRepositories,
      },
    };

    expect(receivedRequest).toEqual(expectedRequest);
  });

  test('select use a snapshot with no repos selected', async () => {
    await renderCreateMode();
    await goToSnapshotStep();
    await selectUseSnapshot();
    await updateDatePickerWithValue('04/22/2024');
    await clickNext(); // To repositories step
    await goToReviewStep();
    await clickContentDropdown();

    const snapshotMethodElement = await getSnapshotMethodElement();
    // Check date was recorded correctly
    expect(snapshotMethodElement).toHaveTextContent('No repositories selected');
    // Check that the button is clickable (has 1 repo selected)
    await waitFor(() => {
      expect(snapshotMethodElement).toHaveAttribute('aria-disabled', 'true');
    });
  });
});

describe('Snapshot edit mode', () => {
  test('edit mode works', async () => {
    const id = mockBlueprintIds['snapshot'];
    await renderEditMode(id);

    // starts on review step
    const receivedRequest = await interceptEditBlueprintRequest(
      `${EDIT_BLUEPRINT}/${id}`
    );
    const expectedRequest = snapshotCreateBlueprintRequest;
    expect(receivedRequest).toEqual(expectedRequest);
  });
});
