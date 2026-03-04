import type { Router as RemixRouter } from '@remix-run/router';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';

import {
  CREATE_BLUEPRINT,
  EDIT_BLUEPRINT,
  IMAGE_BUILDER_API,
  RHEL_10,
} from '../../../../../constants';
import { CreateBlueprintRequest } from '../../../../../store/imageBuilderApi';
import { mockBlueprintIds } from '../../../../fixtures/blueprints';
import {
  aarch64CreateBlueprintRequest,
  centos9CreateBlueprintRequest,
  rhel8CreateBlueprintRequest,
  rhel9CreateBlueprintRequest,
  x86_64CreateBlueprintRequest,
} from '../../../../fixtures/editMode';
import { server } from '../../../../mocks/server';
import {
  blueprintRequest,
  clickNext,
  clickRegisterLater,
  enterBlueprintName,
  getNextButton,
  goToReview,
  goToStep,
  interceptBlueprintRequest,
  interceptEditBlueprintRequest,
  renderCreateMode,
  renderEditMode,
} from '../../wizardTestUtils';

// this is a weird false positive by eslint, the var is being used
// eslint-disable-next-line @typescript-eslint/no-unused-vars
let router: RemixRouter | undefined = undefined;

const selectGuestImageTarget = async () => {
  const user = userEvent.setup();
  const guestImageCheckBox = await screen.findByRole('checkbox', {
    name: /virtualization guest image checkbox/i,
  });
  await waitFor(() => user.click(guestImageCheckBox));
};

const handleRegistration = async () => {
  await clickNext(); // Registration
  await clickRegisterLater();
};

const enterNameAndGoToReviewStep = async () => {
  await enterBlueprintName();
  await clickNext(); // Review
};

describe('Step Image output', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    router = undefined;
  });

  test('alert gets rendered when fetching target environments fails', async () => {
    server.use(
      http.get(`${IMAGE_BUILDER_API}/architectures/${RHEL_10}`, () => {
        return new HttpResponse(null, { status: 404 });
      }),
    );

    await renderCreateMode();
    await screen.findByText(/Couldn't fetch target environments/);
  });
});

describe('Set release using query parameter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('rhel 10 by default (no query parameter)', async () => {
    await renderCreateMode();
    await screen.findByText('Red Hat Enterprise Linux (RHEL) 10', {
      exact: true,
    });
  });

  test('rhel 10 by default (invalid query parameter)', async () => {
    await renderCreateMode({ release: 'rhel9001' });
    await screen.findByText('Red Hat Enterprise Linux (RHEL) 10', {
      exact: true,
    });
  });

  test('rhel 8 (query parameter provided)', async () => {
    await renderCreateMode({ release: 'rhel8' });
    await screen.findByText('Red Hat Enterprise Linux (RHEL) 8');
  });

  test('rhel 9 (query parameter provided)', async () => {
    await renderCreateMode({ release: 'rhel9' });
    await screen.findByText('Red Hat Enterprise Linux (RHEL) 9');
  });
});

describe('Set architecture using query parameter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('x86_64 by default (no query parameter)', async () => {
    await renderCreateMode();
    await screen.findByText('x86_64');
  });

  test('x86_64 by default (invalid query parameter)', async () => {
    await renderCreateMode({ arch: 'arm' });
    await screen.findByText('x86_64');
  });

  test('aarch64 (query parameter provided)', async () => {
    await renderCreateMode({ arch: 'aarch64' });
    await screen.findByText('aarch64');
  });
});

describe('Set target using query parameter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const user = userEvent.setup();

  test('no target by default (no query parameter)', async () => {
    await renderCreateMode();
    const nextButton = await getNextButton();
    await waitFor(() => expect(nextButton).toBeDisabled());
  });

  test('no target by default (invalid query parameter)', async () => {
    await renderCreateMode({ target: 'azure' });
    const nextButton = await getNextButton();
    await waitFor(() => expect(nextButton).toBeDisabled());
  });

  test('image-installer (query parameter provided)', async () => {
    await renderCreateMode({ target: 'iso' });
    expect(
      await screen.findByRole('checkbox', {
        name: /Bare metal installer/i,
      }),
    ).toBeChecked();
    await handleRegistration();
    await goToStep(/Details/);
    await enterNameAndGoToReviewStep();
    const targetExpandable = await screen.findByTestId(
      'target-environments-expandable',
    );
    await waitFor(() => user.click(targetExpandable));
    await screen.findByText('Bare metal - Installer (.iso)');
  });

  test('guest-image (query parameter provided)', async () => {
    await renderCreateMode({ target: 'qcow2' });
    expect(
      await screen.findByRole('checkbox', {
        name: /Virtualization guest image/i,
      }),
    ).toBeChecked();
    await handleRegistration();
    await goToStep(/Details/);
    await enterNameAndGoToReviewStep();
    const targetExpandable = await screen.findByTestId(
      'target-environments-expandable',
    );
    await waitFor(() => user.click(targetExpandable));
    await screen.findByText('Virtualization - Guest image (.qcow2)');
  });
});

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
    name: /Network - Installer/i,
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
      name: /Network - Installer/i,
    });
    expect(networkInstallerCheckbox).toBeDisabled();
  });

  test('selecting network-installer only shows security, locale, and details steps', async () => {
    await renderCreateMode();
    await selectNetworkInstaller();

    const navigation = await screen.findByRole('navigation', {
      name: /wizard steps/i,
    });

    const stepButtons = within(navigation).getAllByRole('button');
    expect(stepButtons).toHaveLength(6);

    expect(
      within(navigation).getByRole('button', { name: /image output/i }),
    ).toBeInTheDocument();
    expect(
      within(navigation).getByRole('button', { name: /optional steps/i }),
    ).toBeInTheDocument();
    expect(
      within(navigation).getByRole('button', { name: /security/i }),
    ).toBeInTheDocument();
    expect(
      within(navigation).getByRole('button', { name: /locale/i }),
    ).toBeInTheDocument();
    expect(
      within(navigation).getByRole('button', { name: /details/i }),
    ).toBeInTheDocument();
    expect(
      within(navigation).getByRole('button', { name: /review/i }),
    ).toBeInTheDocument();
  });

  test('can create a blueprint with network-installer', async () => {
    await renderCreateMode();
    await selectNetworkInstaller();

    await goToReview();

    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    const expectedRequest: CreateBlueprintRequest = {
      ...blueprintRequest,
      distribution: RHEL_10,
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
