import React from 'react';

import '@testing-library/jest-dom';

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import CreateImageWizard from '../../../Components/CreateImageWizard/CreateImageWizard';
import ShareImageModal from '../../../Components/ShareImageModal/ShareImageModal';
import { clickNext, renderCustomRoutesWithReduxRouter } from '../../testUtils';

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
    isProd: () => false,
    getEnvironment: () => 'stage',
  }),
}));

vi.mock('@unleash/proxy-client-react', () => ({
  useUnleashContext: () => vi.fn(),
  useFlag: vi.fn((flag) =>
    flag === 'image-builder.wizard.oscap.enabled' ? true : false
  ),
}));

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
    user.click(await screen.findByLabelText('Register later'))
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
    const registerLater = await screen.findByLabelText('Register later');

    user.click(registerLater);
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
    const registerLater = await screen.findByLabelText('Register later');

    user.click(registerLater);
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
    expect(
      await screen.findByRole('textbox', { name: /select a profile/i })
    ).toBeEnabled();
  });
});

//
// TO DO - check if the correct version of Wizard is tested
//
//describe('On Recreate', () => {
//  const setup = async () => {
//   renderWithReduxRouter('imagewizard/1679d95b-8f1d-4982-8c53-8c2afa4ab04c');
// };
// test('with oscap profile', async () => {
//   const user = userEvent.setup();
//   await setup();
//  await screen.findByRole('button', {
//     name: /review/i,
//   });
//  const createImageButton = await screen.findByRole('button', {
//    name: /create image/i,
//   });
//   await waitFor(() => expect(createImageButton).toBeEnabled());

// check that the FSC contains a /tmp partition
// There are two buttons with the same name but cannot easily select the DDF rendered sidenav.
// The sidenav will be the first node found out of all buttons.
//  const buttonsFSC = await screen.findAllByRole('button', {
//     name: /file system configuration/i,
//   });
//   await user.click(buttonsFSC[0]);
//   await screen.findByRole('heading', { name: /file system configuration/i });
//   await screen.findByText('/tmp');

// check that the Packages contain a nftable package
//   await clickNext();
//   await screen.findByRole('heading', {
//     name: /Additional Red Hat packages/i,
//   });
//   await screen.findByText('nftables');
// });
//});
