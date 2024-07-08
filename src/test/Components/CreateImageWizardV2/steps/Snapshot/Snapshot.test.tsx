import '@testing-library/jest-dom';
import { screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import nodeFetch, { Request, Response } from 'node-fetch';

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

Object.assign(global, { fetch: nodeFetch, Request, Response });

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
  useFlag: vi.fn(() => false),
}));

const goToSnapshotStep = async () => {
  const user = userEvent.setup();
  const guestImageCheckBox = await screen.findByRole('checkbox', {
    name: /virtualization guest image checkbox/i,
  });
  await waitFor(async () => user.click(guestImageCheckBox));
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
  const user = userEvent.setup();
  const row0Checkbox = await screen.findByRole('checkbox', {
    name: /select row 0/i,
  });
  await waitFor(async () => user.click(row0Checkbox));
};

const selectUseSnapshot = async () => {
  const user = userEvent.setup();
  const snapshotRadio = await screen.findByRole('radio', {
    name: /Use a snapshot/i,
  });
  await waitFor(async () => user.click(snapshotRadio));
};

const updateDatePickerWithValue = async (date: string) => {
  const user = userEvent.setup();
  const dateTextbox = await screen.findByRole('textbox', {
    name: /Date picker/i,
  });
  await waitFor(async () => user.type(dateTextbox, date));
};

const clickContentDropdown = async () => {
  const user = userEvent.setup();
  const contentExpandable = await screen.findByTestId('content-expandable');
  await waitFor(async () => user.click(contentExpandable));
};

const getSnapshotMethodElement = async () =>
  await screen.findByRole('button', { name: /Snapshot method/i });

describe('repository snapshot tab - ', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

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
  beforeEach(() => {
    vi.clearAllMocks();
  });

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
