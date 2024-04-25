import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { CREATE_BLUEPRINT } from '../../../../../constants';
import { CreateBlueprintRequest } from '../../../../../store/imageBuilderApi';
import { clickNext } from '../../../../testUtils';
import {
  blueprintRequest,
  clickRegisterLater,
  enterBlueprintName,
  interceptBlueprintRequest,
  render,
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

const goToOscapStep = async () => {
  const bareMetalCheckBox = await screen.findByRole('checkbox', {
    name: /bare metal installer checkbox/i,
  });
  await userEvent.click(bareMetalCheckBox);
  await clickNext(); // Registration
  await clickRegisterLater();
  await clickNext(); // OpenSCAP
};

const selectProfile = async () => {
  await userEvent.click(
    await screen.findByRole('textbox', {
      name: /select a profile/i,
    })
  );

  await userEvent.click(
    await screen.findByText(
      /cis red hat enterprise linux 8 benchmark for level 1 - workstation/i
    )
  );
};

const selectDifferentProfile = async () => {
  await userEvent.click(
    await screen.findByRole('textbox', {
      name: /select a profile/i,
    })
  );

  await userEvent.click(
    await screen.findByText(
      /cis red hat enterprise linux 8 benchmark for level 2 - workstation/i
    )
  );
};

const selectNone = async () => {
  await userEvent.click(
    await screen.findByRole('textbox', {
      name: /select a profile/i,
    })
  );

  await userEvent.click(await screen.findByText(/none/i));
};

const goToReviewStep = async () => {
  await clickNext(); // File system configuration
  await clickNext(); // Custom repositories
  await clickNext(); // Additional packages
  await clickNext(); // Details
  await enterBlueprintName();
  await clickNext(); // Review
};

const expectedOpenscapCisL1 = {
  profile_id: 'xccdf_org.ssgproject.content_profile_cis_workstation_l1',
};

const expectedPackagesCisL1 = ['aide', 'neovim'];

const expectedServicesCisL1 = {
  enabled: ['crond', 'neovim-service'],
  disabled: ['rpcbind', 'autofs', 'nftables'],
  masked: ['nfs-server', 'emacs-service'],
};

const expectedKernelCisL1 = {
  append: 'audit_backlog_limit=8192 audit=1',
};

const expectedFilesystemCisL1 = [
  { min_size: 10737418240, mountpoint: '/' },
  { min_size: 1073741824, mountpoint: '/tmp' },
  { min_size: 1073741824, mountpoint: '/home' },
];

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
  test('add a profile', async () => {
    await render();
    await goToOscapStep();
    await selectProfile();
    await goToReviewStep();

    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    const expectedRequest: CreateBlueprintRequest = {
      ...blueprintRequest,
      customizations: {
        packages: expectedPackagesCisL1,
        openscap: expectedOpenscapCisL1,
        services: expectedServicesCisL1,
        kernel: expectedKernelCisL1,
        filesystem: expectedFilesystemCisL1,
      },
    };

    expect(receivedRequest).toEqual(expectedRequest);
  });

  test('remove a profile', async () => {
    await render();
    await goToOscapStep();
    await selectProfile();
    await selectNone();
    await goToReviewStep();

    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    const expectedRequest: CreateBlueprintRequest = {
      ...blueprintRequest,
    };

    expect(receivedRequest).toEqual(expectedRequest);
  });

  test('change profile', async () => {
    await render();
    await goToOscapStep();
    await selectProfile();
    await selectDifferentProfile();
    await goToReviewStep();

    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    const expectedRequest: CreateBlueprintRequest = {
      ...blueprintRequest,
      customizations: {
        packages: expectedPackagesCisL2,
        openscap: expectedOpenscapCisL2,
        services: expectedServicesCisL2,
        kernel: expectedKernelCisL2,
        filesystem: expectedFilesystemCisL2,
      },
    };

    expect(receivedRequest).toEqual(expectedRequest);
  });
});
