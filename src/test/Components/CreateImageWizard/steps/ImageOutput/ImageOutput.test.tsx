// NOTE: Ready for migration
// These edit mode tests verify the round-trip: API Response → mapRequestToState() →
// Redux State → mapRequestFromState() → API Request. They could be replaced by unit
// tests for the request mapper functions (mapRequestToState/mapRequestFromState) which
// would be faster and more focused than full integration tests.
import { screen, waitFor, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { CreateBlueprintRequest } from '@/store/api/backend';

import {
  CREATE_BLUEPRINT,
  EDIT_BLUEPRINT,
  RHEL_10,
} from '../../../../../constants';
import { mockBlueprintIds } from '../../../../fixtures/blueprints';
import {
  aarch64CreateBlueprintRequest,
  centos9CreateBlueprintRequest,
  rhel8CreateBlueprintRequest,
  rhel9CreateBlueprintRequest,
  x86_64CreateBlueprintRequest,
} from '../../../../fixtures/editMode';
import {
  blueprintRequest,
  enterBlueprintName,
  goToReview,
  interceptBlueprintRequest,
  interceptEditBlueprintRequest,
  renderCreateMode,
  renderEditMode,
  selectGuestImageTarget,
} from '../../wizardTestUtils';

describe('Image output edit mode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('edit mode works - rhel9', async () => {
    const id = mockBlueprintIds['rhel9'];
    await renderEditMode(id);

    // starts on review step
    const receivedRequest = await interceptEditBlueprintRequest(
      `${EDIT_BLUEPRINT}/${id}`,
    );
    const expectedRequest = rhel9CreateBlueprintRequest;
    expect(receivedRequest).toEqual(expectedRequest);
  });

  test('edit mode works - rhel8', async () => {
    const id = mockBlueprintIds['rhel8'];
    await renderEditMode(id);

    // starts on review step
    const receivedRequest = await interceptEditBlueprintRequest(
      `${EDIT_BLUEPRINT}/${id}`,
    );
    const expectedRequest = rhel8CreateBlueprintRequest;
    expect(receivedRequest).toEqual(expectedRequest);
  });

  test('edit mode works - centos9', async () => {
    const id = mockBlueprintIds['centos9'];
    await renderEditMode(id);

    // starts on review step
    const receivedRequest = await interceptEditBlueprintRequest(
      `${EDIT_BLUEPRINT}/${id}`,
    );
    const expectedRequest = centos9CreateBlueprintRequest;
    expect(receivedRequest).toEqual(expectedRequest);
  });

  test('edit mode works - x86_64', async () => {
    const id = mockBlueprintIds['x86_64'];
    await renderEditMode(id);

    // starts on review step
    const receivedRequest = await interceptEditBlueprintRequest(
      `${EDIT_BLUEPRINT}/${id}`,
    );
    const expectedRequest = x86_64CreateBlueprintRequest;
    expect(receivedRequest).toEqual(expectedRequest);
  });

  test('edit mode works - aarch64', async () => {
    const id = mockBlueprintIds['aarch64'];
    await renderEditMode(id);

    // starts on review step
    const receivedRequest = await interceptEditBlueprintRequest(
      `${EDIT_BLUEPRINT}/${id}`,
    );
    const expectedRequest = aarch64CreateBlueprintRequest;
    expect(receivedRequest).toEqual(expectedRequest);
  });
});

const selectNetworkInstaller = async () => {
  const user = userEvent.setup();
  const checkbox = await screen.findByRole('checkbox', {
    name: /Network installer checkbox/i,
  });
  await waitFor(() => user.click(checkbox));
  return checkbox;
};

describe('Network installer target', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('selecting network-installer shows alert and disables other checkboxes', async () => {
    await renderCreateMode();
    const networkInstallerCheckbox = await selectNetworkInstaller();

    await screen.findByText(
      /This image type requires specific, minimal configuration for remote installation/i,
    );
    const guestImageCheckbox = await screen.findByRole('checkbox', {
      name: /Virtualization guest image/i,
    });
    expect(guestImageCheckbox).toBeDisabled();

    const bareMetalCheckbox = await screen.findByRole('checkbox', {
      name: /Bare metal installer/i,
    });
    expect(bareMetalCheckbox).toBeDisabled();

    expect(networkInstallerCheckbox).toBeChecked();
    expect(networkInstallerCheckbox).toBeEnabled();
  });

  test('selecting another target first disables network-installer', async () => {
    await renderCreateMode();
    await selectGuestImageTarget();

    const networkInstallerCheckbox = await screen.findByRole('checkbox', {
      name: /Network installer checkbox/i,
    });
    expect(networkInstallerCheckbox).toBeDisabled();
  });

  test('selecting network-installer only shows base settings and review steps', async () => {
    await renderCreateMode();
    await selectNetworkInstaller();

    const navigation = await screen.findByRole('navigation', {
      name: /wizard steps/i,
    });

    const stepButtons = within(navigation).getAllByRole('button');
    expect(stepButtons).toHaveLength(2);

    expect(
      within(navigation).getByRole('button', { name: /base settings/i }),
    ).toBeInTheDocument();
    expect(
      within(navigation).getByRole('button', { name: /review/i }),
    ).toBeInTheDocument();
  });

  test('can create a blueprint with network-installer', async () => {
    await renderCreateMode();
    await selectNetworkInstaller();
    await enterBlueprintName('Red Velvet');

    await goToReview();

    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    const expectedRequest: CreateBlueprintRequest = {
      ...blueprintRequest,
      distribution: RHEL_10,
      customizations: {},
      image_requests: [
        {
          architecture: 'x86_64',
          image_type: 'network-installer',
          upload_request: {
            options: {},
            type: 'aws.s3',
          },
        },
      ],
    };

    expect(receivedRequest).toEqual(expectedRequest);
  });
});
