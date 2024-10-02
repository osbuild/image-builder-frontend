import React from 'react';

import { screen, waitFor, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import CreateImageWizard from '../../../../../Components/CreateImageWizard/CreateImageWizard';
import ShareImageModal from '../../../../../Components/ShareImageModal/ShareImageModal';
import { CREATE_BLUEPRINT, EDIT_BLUEPRINT } from '../../../../../constants';
import { CreateBlueprintRequest } from '../../../../../store/imageBuilderApi';
import { mockBlueprintIds } from '../../../../fixtures/blueprints';
import {
  baseCreateBlueprintRequest,
  expectedFilesystemCisL2,
  expectedKernelCisL2,
  expectedOpenscapCisL2,
  expectedPackagesCisL2,
  expectedServicesCisL2,
  oscapCreateBlueprintRequest,
} from '../../../../fixtures/editMode';
import { renderCustomRoutesWithReduxRouter } from '../../../../testUtils';
import {
  enterBlueprintName,
  interceptBlueprintRequest,
  interceptEditBlueprintRequest,
  openAndDismissSaveAndBuildModal,
  renderCreateMode,
  renderEditMode,
} from '../../wizardTestUtils';
import {
  clickNext,
  clickReviewAndFinish,
  goToOscapStep,
} from '../../wizardTestUtils';

const selectProfile = async () => {
  const user = userEvent.setup();
  const selectProfileDropdown = await screen.findByRole('textbox', {
    name: /select a profile/i,
  });
  await waitFor(() => user.click(selectProfileDropdown));

  const cis1Profile = await screen.findByText(
    /cis red hat enterprise linux 8 benchmark for level 1 - workstation/i
  );
  await waitFor(() => user.click(cis1Profile));
};

const selectDifferentProfile = async () => {
  const user = userEvent.setup();
  const selectProfileDropdown = await screen.findByRole('textbox', {
    name: /select a profile/i,
  });
  await waitFor(() => user.click(selectProfileDropdown));

  const cis2Profile = await screen.findByText(
    /cis red hat enterprise linux 8 benchmark for level 2 - workstation/i
  );
  await waitFor(() => user.click(cis2Profile));
};

const selectNone = async () => {
  const user = userEvent.setup();
  const selectProfileDropdown = await screen.findByRole('textbox', {
    name: /select a profile/i,
  });
  await waitFor(() => user.click(selectProfileDropdown));

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

const clickRevisitButton = async () => {
  const user = userEvent.setup();
  const expandable = await screen.findByTestId('oscap-detail-expandable');
  const revisitButton = await within(expandable).findByTestId(
    'revisit-openscap'
  );
  await waitFor(() => user.click(revisitButton));
};

const routes = [
  {
    path: 'insights/image-builder/*',
    element: <div />,
  },
  {
    path: 'insights/image-builder/imagewizard/:composeId?',
    element: <CreateImageWizard />,
  },
  {
    path: 'insights/image-builder/share/:composeId',
    element: <ShareImageModal />,
  },
];

const selectRhel8 = async () => {
  const user = userEvent.setup();
  await waitFor(async () =>
    user.click(
      screen.getAllByRole('button', {
        name: /options menu/i,
      })[0]
    )
  );
  const rhel8 = await screen.findByRole('option', {
    name: /red hat enterprise linux \(rhel\) 8/i,
  });
  await waitFor(async () => user.click(rhel8));
};

const clickFromImageOutputToOpenScap = async () => {
  const user = userEvent.setup();
  await clickNext();
  await waitFor(async () =>
    user.click(await screen.findByTestId('automatically-register-checkbox'))
  );
  await clickNext(); // skip registration
};

describe('Step Compliance', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const user = userEvent.setup();
  const setup = async () => {
    renderCustomRoutesWithReduxRouter('imagewizard', {}, routes);
  };
  test('create an image with None oscap profile', async () => {
    await setup();

    // select aws as upload destination
    const uploadAws = await screen.findByTestId('upload-aws');
    user.click(uploadAws);
    await clickNext();

    // aws step
    const manualOption = await screen.findByRole('radio', {
      name: /manually enter an account id\./i,
    });
    await waitFor(() => user.click(manualOption));
    const awsAccountId = await screen.findByRole('textbox', {
      name: 'aws account id',
    });
    await waitFor(() => user.type(awsAccountId, '012345678901'));

    await clickNext();
    // skip registration
    const registrationCheckbox = await screen.findByTestId(
      'automatically-register-checkbox'
    );

    user.click(registrationCheckbox);
    await clickNext();

    // Now we should be in the Compliance step
    await screen.findByRole('heading', { name: /OpenSCAP/i });

    const selectProfile = await screen.findByRole('textbox', {
      name: /select a profile/i,
    });

    user.click(selectProfile);
    const noneProfile = await screen.findByText(/none/i);
    user.click(noneProfile);

    // check that the FSC does not contain a /tmp partition
    await clickNext();
    await screen.findByRole('heading', { name: /File system configuration/i });
    expect(
      screen.queryByRole('cell', {
        name: /tmp/i,
      })
    ).not.toBeInTheDocument();

    await clickNext(); // skip RepositorySnapshot
    await clickNext(); // skip Repositories

    // check that there are no Packages contained when selecting the "None" profile option
    await clickNext();
    await screen.findByRole('heading', {
      name: /Additional packages/i,
    });
    await screen.findByText(
      /Search above to add additionalpackages to your image/
    );
  });

  test('create an image with an oscap profile', async () => {
    await setup();

    // select aws as upload destination
    const uploadAws = await screen.findByTestId('upload-aws');

    user.click(uploadAws);
    await clickNext();

    // aws step
    const manualOption = await screen.findByRole('radio', {
      name: /manually enter an account id\./i,
    });

    await waitFor(() => user.click(manualOption));

    await waitFor(async () =>
      user.type(
        await screen.findByRole('textbox', {
          name: 'aws account id',
        }),
        '012345678901'
      )
    );
    await clickNext();
    // skip registration
    const registrationCheckbox = await screen.findByTestId(
      'automatically-register-checkbox'
    );

    user.click(registrationCheckbox);
    await clickNext();

    // Now we should be at the OpenSCAP step
    await screen.findByRole('heading', { name: /OpenSCAP/i });

    const selectProfile = await screen.findByRole('textbox', {
      name: /select a profile/i,
    });
    user.click(selectProfile);

    const cis1Profile = await screen.findByText(
      /cis red hat enterprise linux 8 benchmark for level 1 - workstation/i
    );
    user.click(cis1Profile);
    await screen.findByText(/kernel arguments:/i);
    await screen.findByText(/audit_backlog_limit=8192 audit=1/i);
    await screen.findByText(/disabled services:/i);
    await screen.findByText(
      /rpcbind autofs nftables nfs-server emacs-service/i
    );
    await screen.findByText(/enabled services:/i);
    await screen.findByText(/crond/i);

    // check that the FSC contains a /tmp partition
    await clickNext();
    await screen.findByRole('heading', { name: /File system configuration/i });
    await screen.findByText(/tmp/i);

    await clickNext(); // skip RepositorySnapshots
    await clickNext(); // skip Repositories

    // check that the Packages contains correct packages
    await clickNext();
    await screen.findByRole('heading', {
      name: /Additional packages/i,
    });
    const selected = await screen.findByText(/Selected/);
    user.click(selected);
    await screen.findByText(/aide/i);
    await screen.findByText(/neovim/i);
  });

  test('OpenSCAP dropdown is disabled for WSL targets only', async () => {
    await setup();
    await selectRhel8();
    const wslCheckbox = await screen.findByTestId('checkbox-wsl');
    user.click(wslCheckbox);
    await clickFromImageOutputToOpenScap();
    await screen.findByText(
      /OpenSCAP profiles are not compatible with WSL images/i
    );
    expect(
      await screen.findByRole('textbox', { name: /select a profile/i })
    ).toBeDisabled();
  });

  test('Alert displayed and OpenSCAP dropdown enabled when targets include WSL', async () => {
    await setup();
    await selectRhel8();
    const imageInstallerCheckbox = await screen.findByTestId(
      'checkbox-image-installer'
    );

    user.click(imageInstallerCheckbox);
    const wslCheckbox = await screen.findByTestId('checkbox-wsl');

    user.click(wslCheckbox);
    await clickFromImageOutputToOpenScap();
    await screen.findByText(
      /OpenSCAP profiles are not compatible with WSL images/i
    );
    await waitFor(() => {
      expect(
        screen.getByRole('textbox', { name: /select a profile/i })
      ).toBeEnabled();
    });
  });
});

describe('Step Compliance', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('clicking Review and finish leads to Details', async () => {
    await renderCreateMode();
    await goToOscapStep();
    await clickReviewAndFinish();
    await screen.findByRole('heading', {
      name: 'Details',
    });
  });
});

describe('OpenSCAP', () => {
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
    await waitFor(() => {
      expect(receivedRequest).toEqual(expectedRequest);
    });
  });

  test('remove a profile', { retry: 3, timeout: 20000 }, async () => {
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
    await waitFor(() => {
      expect(receivedRequest).toEqual(expectedRequest);
    });
  });

  test('change profile', { retry: 3, timeout: 20000 }, async () => {
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

  test('revisit step button on Review works', async () => {
    await renderCreateMode();
    await goToOscapStep();
    await selectProfile();
    await goToReviewStep();
    await clickRevisitButton();
    await screen.findByRole('heading', { name: /OpenSCAP/ });
  });
});

describe('OpenSCAP edit mode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const user = userEvent.setup();
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

  test('fsc and packages get populated on edit', async () => {
    const id = mockBlueprintIds['oscap'];
    await renderEditMode(id);

    // check that the FSC contains a /tmp partition
    const fscBtns = await screen.findAllByRole('button', {
      name: /file system configuration/i,
    });
    user.click(fscBtns[0]);
    await screen.findByRole('heading', { name: /file system configuration/i });
    await screen.findByText('/tmp');
    // check that the Packages contain neovim package
    const packagesNavBtn = await screen.findByRole('button', {
      name: /additional packages/i,
    });
    user.click(packagesNavBtn);
    await screen.findByRole('heading', {
      name: /Additional packages/i,
    });
    const selectedBtn = await screen.findByRole('button', {
      name: /Selected/i,
    });
    user.click(selectedBtn);
    await screen.findByText('neovim');
  });
});
