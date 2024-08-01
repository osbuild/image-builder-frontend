import React from 'react';

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import CreateImageWizard from '../../../../../Components/CreateImageWizard/CreateImageWizard';
import {
  AARCH64,
  CENTOS_9,
  CREATE_BLUEPRINT,
  EDIT_BLUEPRINT,
  RHEL_8,
  RHEL_9,
  X86_64,
} from '../../../../../constants';
import {
  CreateBlueprintRequest,
  ImageRequest,
} from '../../../../../store/imageBuilderApi';
import { mockArchitecturesByDistro } from '../../../../fixtures/architectures';
import { mockBlueprintIds } from '../../../../fixtures/blueprints';
import {
  aarch64CreateBlueprintRequest,
  centos9CreateBlueprintRequest,
  rhel8CreateBlueprintRequest,
  rhel9CreateBlueprintRequest,
  x86_64CreateBlueprintRequest,
} from '../../../../fixtures/editMode';
import {
  clickNext,
  renderCustomRoutesWithReduxRouter,
} from '../../../../testUtils';
import {
  blueprintRequest,
  clickRegisterLater,
  enterBlueprintName,
  goToRegistrationStep,
  imageRequest,
  interceptBlueprintRequest,
  interceptEditBlueprintRequest,
  openAndDismissSaveAndBuildModal,
  renderCreateMode,
  renderEditMode,
} from '../../wizardTestUtils';

const routes = [
  {
    path: 'insights/image-builder/imagewizard/:composeId?',
    element: <CreateImageWizard />,
  },
];

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
      case 'image-builder.wsl.enabled':
        return true;
      default:
        return false;
    }
  }),
}));

const openReleaseMenu = async () => {
  const user = userEvent.setup();
  const releaseMenu = screen.getAllByRole('button', {
    name: /options menu/i,
  })[0];
  await waitFor(() => user.click(releaseMenu));
};

const openArchitectureMenu = async () => {
  const user = userEvent.setup();
  const releaseMenu = screen.getAllByRole('button', {
    name: /options menu/i,
  })[1];
  await waitFor(() => user.click(releaseMenu));
};

const clickShowOptions = async () => {
  const user = userEvent.setup();
  const showOptions = await screen.findByRole('button', {
    name: /show options for further development of rhel/i,
  });
  await waitFor(() => user.click(showOptions));
};

const selectRhel8 = async () => {
  const user = userEvent.setup();
  await openReleaseMenu();
  const rhel8 = await screen.findByRole('option', {
    name: /red hat enterprise linux \(rhel\) 8 full support ends: may 2024 \| maintenance support ends: may 2029/i,
  });
  await waitFor(() => user.click(rhel8));
};

const selectRhel9 = async () => {
  const user = userEvent.setup();
  await openReleaseMenu();
  const rhel9 = await screen.findByRole('option', {
    name: /red hat enterprise linux \(rhel\) 9 full support ends: may 2027 \| maintenance support ends: may 2032/i,
  });
  await waitFor(() => user.click(rhel9));
};

const selectCentos9 = async () => {
  const user = userEvent.setup();
  await openReleaseMenu();
  await clickShowOptions();
  const centos9 = await screen.findByRole('option', {
    name: 'CentOS Stream 9',
  });
  await waitFor(() => user.click(centos9));
};

const selectX86_64 = async () => {
  const user = userEvent.setup();
  await openArchitectureMenu();
  const x86_64 = await screen.findByRole('option', {
    name: 'x86_64',
  });
  await waitFor(() => user.click(x86_64));
};

const selectAarch64 = async () => {
  const user = userEvent.setup();
  await openArchitectureMenu();
  const aarch64 = await screen.findByRole('option', {
    name: 'aarch64',
  });
  await waitFor(() => user.click(aarch64));
};

const goToReviewStep = async () => {
  await clickNext(); // Register
  await clickRegisterLater();
  await clickNext(); // OpenSCAP
  await clickNext(); // File system customization
  await clickNext(); // Snapshots
  await clickNext(); // Custom repositories
  await clickNext(); // Additional packages
  await clickNext(); // First boot
  await clickNext(); // Details
  await enterBlueprintName();
  await clickNext(); // Review
};

describe('Check that the target filtering is in accordance to mock content', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('rhel9 x86_64', async () => {
    const user = userEvent.setup();
    await renderCustomRoutesWithReduxRouter('imagewizard', {}, routes);

    // select x86_64
    const archMenu = screen.getAllByRole('button', {
      name: /options menu/i,
    })[1];
    user.click(archMenu);
    const x86_64Option = await screen.findByRole('option', { name: 'x86_64' });
    user.click(x86_64Option);

    // make sure this test is in SYNC with the mocks
    let images_types: string[] = []; // type is `string[]` and not `ImageType[]` because in imageBuilderAPI ArchitectureItem['image_types'] is type string
    mockArchitecturesByDistro(RHEL_9).forEach((elem) => {
      if (elem.arch === X86_64) {
        images_types = elem.image_types;
      }
    });
    expect(images_types).toContain('aws');
    expect(images_types).toContain('gcp');
    expect(images_types).toContain('azure');
    expect(images_types).toContain('guest-image');
    expect(images_types).toContain('image-installer');
    expect(images_types).toContain('vsphere');
    expect(images_types).toContain('vsphere-ova');
    expect(images_types).not.toContain('wsl');
    // make sure the UX conforms to the mocks
    await screen.findByTestId('upload-aws');
    await screen.findByTestId('upload-google');
    await screen.findByTestId('upload-azure');
    await screen.findByTestId('checkbox-guest-image');
    await screen.findByTestId('checkbox-image-installer');
    await screen.findByText(/vmware vsphere/i);
    await screen.findByText(/open virtualization format \(\.ova\)/i);
    expect(
      screen.queryByText(/wsl - windows subsystem for linux \(\.tar\.gz\)/i)
    ).not.toBeInTheDocument();
  });

  test('rhel8 x86_64', async () => {
    const user = userEvent.setup();
    await renderCustomRoutesWithReduxRouter('imagewizard', {}, routes);

    // select rhel8
    const releaseMenu = screen.getAllByRole('button', {
      name: /options menu/i,
    })[0];
    user.click(releaseMenu);
    const rhel8Option = await screen.findByRole('option', {
      name: /Red Hat Enterprise Linux \(RHEL\) 8/,
    });

    user.click(rhel8Option);

    // select x86_64
    const archMenu = screen.getAllByRole('button', {
      name: /options menu/i,
    })[1];
    user.click(archMenu);
    const x86_64Option = await screen.findByRole('option', { name: 'x86_64' });
    user.click(x86_64Option);

    // make sure this test is in SYNC with the mocks
    let images_types: string[] = [];
    mockArchitecturesByDistro(RHEL_8).forEach((elem) => {
      if (elem.arch === X86_64) {
        images_types = elem.image_types;
      }
    });
    expect(images_types).toContain('aws');
    expect(images_types).toContain('gcp');
    expect(images_types).toContain('azure');
    expect(images_types).toContain('guest-image');
    expect(images_types).toContain('image-installer');
    expect(images_types).toContain('vsphere');
    expect(images_types).toContain('vsphere-ova');
    expect(images_types).toContain('wsl');
    // make sure the UX conforms to the mocks
    await screen.findByTestId('upload-aws');
    await screen.findByTestId('upload-google');
    await screen.findByTestId('upload-azure');
    await screen.findByTestId('checkbox-guest-image');
    await screen.findByTestId('checkbox-image-installer');
    await screen.findByText(/vmware vsphere/i);
    await screen.findByText(/open virtualization format \(\.ova\)/i);
    await screen.findByText(/wsl - windows subsystem for linux \(\.tar\.gz\)/i);
  });

  test('rhel9 aarch64', async () => {
    const user = userEvent.setup();
    await renderCustomRoutesWithReduxRouter('imagewizard', {}, routes);

    // select aarch64
    const archMenu = screen.getAllByRole('button', {
      name: /options menu/i,
    })[1];
    user.click(archMenu);
    const aarch64Option = await screen.findByRole('option', {
      name: 'aarch64',
    });
    user.click(aarch64Option);

    // make sure this test is in SYNC with the mocks
    let images_types: string[] = [];
    mockArchitecturesByDistro(RHEL_9).forEach((elem) => {
      if (elem.arch === AARCH64) {
        images_types = elem.image_types;
      }
    });
    expect(images_types).toContain('aws');
    expect(images_types).not.toContain('gcp');
    expect(images_types).not.toContain('azure');
    expect(images_types).toContain('guest-image');
    expect(images_types).toContain('image-installer');
    expect(images_types).not.toContain('vsphere');
    expect(images_types).not.toContain('vsphere-ova');
    expect(images_types).not.toContain('wsl');
    // make sure the UX conforms to the mocks
    await screen.findByTestId('upload-aws');
    await waitFor(() =>
      expect(screen.queryByTestId('upload-google')).not.toBeInTheDocument()
    );
    expect(screen.queryByTestId('upload-azure')).not.toBeInTheDocument();
    await screen.findByTestId('checkbox-guest-image');
    await screen.findByTestId('checkbox-image-installer');
    expect(screen.queryByText(/vmware vsphere/i)).not.toBeInTheDocument();
    expect(
      screen.queryByText(/open virtualization format \(\.ova\)/i)
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/wsl - windows subsystem for linux \(\.tar\.gz\)/i)
    ).not.toBeInTheDocument();
  });

  test('rhel8 aarch64', async () => {
    const user = userEvent.setup();
    await renderCustomRoutesWithReduxRouter('imagewizard', {}, routes);

    // select rhel8
    const releaseMenu = screen.getAllByRole('button', {
      name: /options menu/i,
    })[0];
    user.click(releaseMenu);
    const rhel8Option = await screen.findByRole('option', {
      name: /Red Hat Enterprise Linux \(RHEL\) 8/,
    });
    user.click(rhel8Option);

    // select x86_64
    const archMenu = screen.getAllByRole('button', {
      name: /options menu/i,
    })[1];
    user.click(archMenu);
    const aarch64Option = await screen.findByRole('option', {
      name: 'aarch64',
    });
    user.click(aarch64Option);

    // make sure this test is in SYNC with the mocks
    let images_types: string[] = [];
    mockArchitecturesByDistro(RHEL_8).forEach((elem) => {
      if (elem.arch === AARCH64) {
        images_types = elem.image_types;
      }
    });
    expect(images_types).toContain('aws');
    expect(images_types).not.toContain('gcp');
    expect(images_types).not.toContain('azure');
    expect(images_types).toContain('guest-image');
    expect(images_types).toContain('image-installer');
    expect(images_types).not.toContain('vsphere');
    expect(images_types).not.toContain('vsphere-ova');
    expect(images_types).not.toContain('wsl');
    // make sure the UX conforms to the mocks
    await screen.findByTestId('upload-aws');
    await waitFor(() =>
      expect(screen.queryByTestId('upload-google')).not.toBeInTheDocument()
    );
    expect(screen.queryByTestId('upload-azure')).not.toBeInTheDocument();
    await screen.findByTestId('checkbox-guest-image');
    await screen.findByTestId('checkbox-image-installer');
    expect(screen.queryByText(/vmware vsphere/i)).not.toBeInTheDocument();
    expect(
      screen.queryByText(/open virtualization format \(\.ova\)/i)
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/wsl - windows subsystem for linux \(\.tar\.gz\)/i)
    ).not.toBeInTheDocument();
  });
});

describe('Check step consistency', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('going back and forth with selected options only keeps the one compatible', async () => {
    const user = userEvent.setup();
    await renderCustomRoutesWithReduxRouter('imagewizard', {}, routes);

    // select x86_64
    const archMenu = screen.getAllByRole('button', {
      name: /options menu/i,
    })[1];
    user.click(archMenu);
    let x86_64Option = await screen.findByRole('option', { name: 'x86_64' });
    user.click(x86_64Option);
    await screen.findByTestId('upload-aws');
    // select GCP, it's available for x86_64
    const uploadGcpBtn = await screen.findByTestId('upload-google');
    user.click(uploadGcpBtn);
    const next = await screen.findByRole('button', { name: /Next/ });
    await waitFor(() => expect(next).toBeEnabled());
    // Change to aarch
    user.click(archMenu);
    const aarch64Option = await screen.findByRole('option', {
      name: 'aarch64',
    });
    user.click(aarch64Option);
    await screen.findByTestId('upload-aws');
    // GCP not being compatible with arch, the next button is disabled
    await waitFor(() => expect(next).toBeDisabled());
    // clicking on AWS the user can go next
    const uploadAwsBtn = await screen.findByTestId('upload-aws');
    user.click(uploadAwsBtn);
    await waitFor(() => expect(next).toBeEnabled());
    // and going back to x86_64 the user should keep the next button visible
    user.click(archMenu);
    x86_64Option = await screen.findByRole('option', { name: 'x86_64' });
    user.click(x86_64Option);
    await waitFor(() => expect(next).toBeEnabled());
  });
});

describe('set release using query parameter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('rhel 9 by default (no query parameter)', async () => {
    await renderCreateMode();
    await screen.findByText('Red Hat Enterprise Linux (RHEL) 9');
  });

  test('rhel 9 by default (invalid query parameter)', async () => {
    await renderCreateMode({ release: 'rhel9001' });
    await screen.findByText('Red Hat Enterprise Linux (RHEL) 9');
  });

  test('rhel 8 (query parameter provided)', async () => {
    await renderCreateMode({ release: 'rhel8' });
    await screen.findByText('Red Hat Enterprise Linux (RHEL) 8');
  });
});

describe('set architecture using query parameter', () => {
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

describe('set target using query parameter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const user = userEvent.setup();
  test('no target by default (no query parameter)', async () => {
    await renderCreateMode();
    const nextButton = await screen.findByRole('button', { name: /Next/ });
    await waitFor(() => expect(nextButton).toBeDisabled());
  });

  test('no target by default (invalid query parameter)', async () => {
    await renderCreateMode({ target: 'azure' });
    const nextButton = await screen.findByRole('button', { name: /Next/ });
    await waitFor(() => expect(nextButton).toBeDisabled());
  });

  test('image-installer (query parameter provided)', async () => {
    await renderCreateMode({ target: 'iso' });
    expect(await screen.findByTestId('checkbox-image-installer')).toBeChecked();
    await goToReviewStep();
    const targetExpandable = await screen.findByTestId(
      'target-environments-expandable'
    );
    user.click(targetExpandable);
    await screen.findByText('Bare metal - Installer (.iso)');
  });

  test('guest-image (query parameter provided)', async () => {
    await renderCreateMode({ target: 'qcow2' });
    expect(await screen.findByTestId('checkbox-guest-image')).toBeChecked();
    await goToReviewStep();
    const targetExpandable = await screen.findByTestId(
      'target-environments-expandable'
    );
    user.click(targetExpandable);
    await screen.findByText('Virtualization - Guest image (.qcow2)');
  });
});

describe('distribution request generated correctly', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('rhel-8', async () => {
    await renderCreateMode();
    await selectRhel8();
    await goToRegistrationStep();
    await goToReviewStep();
    // informational modal pops up in the first test only as it's tied
    // to a 'imageBuilder.saveAndBuildModalSeen' variable in localStorage
    await openAndDismissSaveAndBuildModal();
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    const expectedRequest: CreateBlueprintRequest = {
      ...blueprintRequest,
      distribution: RHEL_8,
    };

    expect(receivedRequest).toEqual(expectedRequest);
  });

  test('rhel-9', async () => {
    await renderCreateMode();
    await selectRhel9();
    await goToRegistrationStep();
    await goToReviewStep();
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    const expectedRequest: CreateBlueprintRequest = {
      ...blueprintRequest,
      distribution: RHEL_9,
    };

    expect(receivedRequest).toEqual(expectedRequest);
  });

  test('centos-9', async () => {
    await renderCreateMode();
    await selectCentos9();
    await goToRegistrationStep();
    await goToReviewStep();
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    const expectedRequest: CreateBlueprintRequest = {
      ...blueprintRequest,
      distribution: CENTOS_9,
    };

    expect(receivedRequest).toEqual(expectedRequest);
  });
});

describe('architecture request generated correctly', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('x86_64', async () => {
    await renderCreateMode();
    await selectX86_64();
    await goToRegistrationStep();
    await goToReviewStep();
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    const expectedImageRequest: ImageRequest = {
      ...imageRequest,
      architecture: X86_64,
    };
    const expectedRequest: CreateBlueprintRequest = {
      ...blueprintRequest,
      image_requests: [expectedImageRequest],
    };

    expect(receivedRequest).toEqual(expectedRequest);
  });

  test('aarch64', async () => {
    await renderCreateMode();
    await selectAarch64();
    await goToRegistrationStep();
    await goToReviewStep();
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    const expectedImageRequest: ImageRequest = {
      ...imageRequest,
      architecture: AARCH64,
    };
    const expectedRequest: CreateBlueprintRequest = {
      ...blueprintRequest,
      image_requests: [expectedImageRequest],
    };

    expect(receivedRequest).toEqual(expectedRequest);
  });
});

describe('Image Output edit mode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('edit mode works - rhel9', async () => {
    const id = mockBlueprintIds['rhel9'];
    await renderEditMode(id);

    // starts on review step
    const receivedRequest = await interceptEditBlueprintRequest(
      `${EDIT_BLUEPRINT}/${id}`
    );
    const expectedRequest = rhel9CreateBlueprintRequest;
    expect(receivedRequest).toEqual(expectedRequest);
  });
  test('edit mode works - rhel8', async () => {
    const id = mockBlueprintIds['rhel8'];
    await renderEditMode(id);

    // starts on review step
    const receivedRequest = await interceptEditBlueprintRequest(
      `${EDIT_BLUEPRINT}/${id}`
    );
    const expectedRequest = rhel8CreateBlueprintRequest;
    expect(receivedRequest).toEqual(expectedRequest);
  });
  test('edit mode works - centos9', async () => {
    const id = mockBlueprintIds['centos9'];
    await renderEditMode(id);

    // starts on review step
    const receivedRequest = await interceptEditBlueprintRequest(
      `${EDIT_BLUEPRINT}/${id}`
    );
    const expectedRequest = centos9CreateBlueprintRequest;
    expect(receivedRequest).toEqual(expectedRequest);
  });
  test('edit mode works - x86_64', async () => {
    const id = mockBlueprintIds['x86_64'];
    await renderEditMode(id);

    // starts on review step
    const receivedRequest = await interceptEditBlueprintRequest(
      `${EDIT_BLUEPRINT}/${id}`
    );
    const expectedRequest = x86_64CreateBlueprintRequest;
    expect(receivedRequest).toEqual(expectedRequest);
  });
  test('edit mode works - aarch64', async () => {
    const id = mockBlueprintIds['aarch64'];
    await renderEditMode(id);

    // starts on review step
    const receivedRequest = await interceptEditBlueprintRequest(
      `${EDIT_BLUEPRINT}/${id}`
    );
    const expectedRequest = aarch64CreateBlueprintRequest;
    expect(receivedRequest).toEqual(expectedRequest);
  });
});
