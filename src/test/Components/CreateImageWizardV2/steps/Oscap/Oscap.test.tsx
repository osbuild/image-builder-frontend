import { screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import nodeFetch, { Request, Response } from 'node-fetch';

import { CREATE_BLUEPRINT, EDIT_BLUEPRINT } from '../../../../../constants';
import { CreateBlueprintRequest } from '../../../../../store/imageBuilderApi';
import { mockBlueprintIds } from '../../../../fixtures/blueprints';
import {
  baseCreateBlueprintRequest,
  oscapCreateBlueprintRequest,
} from '../../../../fixtures/editMode';
import { clickNext } from '../../../../testUtils';
import {
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

const goToOscapStep = async () => {
  const user = userEvent.setup();
  const guestImageCheckBox = await screen.findByRole('checkbox', {
    name: /virtualization guest image checkbox/i,
  });
  await waitFor(() => user.click(guestImageCheckBox));
  await clickNext(); // Registration
  await clickRegisterLater();
  await clickNext(); // OpenSCAP
};

const selectProfile = async () => {
  const user = userEvent.setup();
  const selectProfileDropdown = await screen.findByRole('textbox', {
    name: /select a profile/i,
  });
  await waitFor(async () => user.click(selectProfileDropdown));

  const cis1Profile = await screen.findByText(
    /cis red hat enterprise linux 8 benchmark for level 1 - workstation/i
  );
  await waitFor(async () => user.click(cis1Profile));
};

const selectDifferentProfile = async () => {
  const user = userEvent.setup();
  const selectProfileDropdown = await screen.findByRole('textbox', {
    name: /select a profile/i,
  });
  await waitFor(async () => user.click(selectProfileDropdown));

  const cis2Profile = await screen.findByText(
    /cis red hat enterprise linux 8 benchmark for level 2 - workstation/i
  );
  await waitFor(async () => user.click(cis2Profile));
};

const selectNone = async () => {
  const user = userEvent.setup();
  const selectProfileDropdown = await screen.findByRole('textbox', {
    name: /select a profile/i,
  });
  await waitFor(async () => user.click(selectProfileDropdown));

  await waitFor(async () => user.click(await screen.findByText(/none/i)));
};

const goToReviewStep = async () => {
  await clickNext(); // File system configuration
  await clickNext(); // Snapshot repositories
  await clickNext(); // Custom repositories
  await clickNext(); // Additional packages
  await clickNext(); // FirstBoot
  await clickNext(); // Details
  await enterBlueprintName('Oscap test');
  await clickNext(); // Review
};

const expectedOpenscapCisL2 = {
  profile_id: 'xccdf_org.ssgproject.content_profile_cis_workstation_l2',
};

const expectedPackagesCisL2 = ['aide', 'emacs'];

const expectedServicesCisL2 = {
  enabled: ['crond', 'emacs-service'],
  masked: ['nfs-server', 'neovim-service'],
};

const expectedKernelCisL2 = {
  append: 'audit_backlog_limit=8192 audit=2',
};

const expectedFilesystemCisL2 = [
  { min_size: 10737418240, mountpoint: '/' },
  { min_size: 1073741824, mountpoint: '/tmp' },
  { min_size: 1073741824, mountpoint: '/app' },
];

describe('oscap', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('add a profile', async () => {
    await renderCreateMode();
    await goToOscapStep();
    await selectProfile();
    await goToReviewStep();
    // informational modal pops up in the first test only as it's tied
    // to a 'imageBuilder.saveAndBuildModalSeen' variable in localStorage
    await openAndDismissSaveAndBuildModal();

    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    const expectedRequest: CreateBlueprintRequest = {
      ...oscapCreateBlueprintRequest,
      name: 'Oscap test',
    };

    expect(receivedRequest).toEqual(expectedRequest);
  });

  test('remove a profile', async () => {
    await renderCreateMode();
    await goToOscapStep();
    await selectProfile();
    await selectNone();
    await goToReviewStep();

    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    const expectedRequest: CreateBlueprintRequest = {
      ...baseCreateBlueprintRequest,
      name: 'Oscap test',
    };

    expect(receivedRequest).toEqual(expectedRequest);
  });

  test('change profile', async () => {
    await renderCreateMode();
    await goToOscapStep();
    await selectProfile();
    await selectDifferentProfile();
    await goToReviewStep();

    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    const expectedRequest: CreateBlueprintRequest = {
      ...baseCreateBlueprintRequest,
      customizations: {
        packages: expectedPackagesCisL2,
        openscap: expectedOpenscapCisL2,
        services: expectedServicesCisL2,
        kernel: expectedKernelCisL2,
        filesystem: expectedFilesystemCisL2,
      },
      name: 'Oscap test',
    };

    await waitFor(() => {
      expect(receivedRequest).toEqual(expectedRequest);
    });
  });
});

describe('OpenSCAP edit mode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('edit mode works', async () => {
    const id = mockBlueprintIds['oscap'];
    await renderEditMode(id);

    // starts on review step
    const receivedRequest = await interceptEditBlueprintRequest(
      `${EDIT_BLUEPRINT}/${id}`
    );
    const expectedRequest = oscapCreateBlueprintRequest;
    expect(receivedRequest).toEqual(expectedRequest);
  });
});
