import React from 'react';

import '@testing-library/jest-dom';

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import CreateImageWizard from '../../../Components/CreateImageWizardV2/CreateImageWizard';
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
    isProd: () => false,
    getEnvironment: () => 'stage',
  }),
}));

jest.mock('@unleash/proxy-client-react', () => ({
  useUnleashContext: () => jest.fn(),
  useFlag: jest.fn((flag) =>
    flag === 'image-builder.wizard.oscap.enabled' ? true : false
  ),
}));

beforeAll(() => {
  // scrollTo is not defined in jsdom
  window.HTMLElement.prototype.scrollTo = function () {};
});

afterEach(() => {
  jest.clearAllMocks();
});

const selectRhel8 = async () => {
  await userEvent.click(
    screen.getAllByRole('button', {
      name: /options menu/i,
    })[0]
  );
  const rhel8 = await screen.findByRole('option', {
    name: /red hat enterprise linux \(rhel\) 8/i,
  });
  await userEvent.click(rhel8);
};

const clickFromImageOutputToOpenScap = async () => {
  await clickNext();
  await userEvent.click(await screen.findByLabelText('Register later'));
  await clickNext(); // skip registration
};

describe('Step Compliance', () => {
  const user = userEvent.setup();
  const setup = async () => {
    renderCustomRoutesWithReduxRouter('imagewizard', {}, routes);
  };
  test('create an image with None oscap profile', async () => {
    await setup();

    // select aws as upload destination
    await user.click(await screen.findByTestId('upload-aws'));
    await clickNext();

    // aws step
    await user.click(
      await screen.findByRole('radio', {
        name: /manually enter an account id\./i,
      })
    );
    await user.type(
      await screen.findByRole('textbox', {
        name: 'aws account id',
      }),
      '012345678901'
    );

    await clickNext();
    // skip registration
    await user.click(await screen.findByLabelText('Register later'));
    await clickNext();

    // Now we should be in the Compliance step
    await screen.findByRole('heading', { name: /OpenSCAP/i });

    await user.click(
      await screen.findByRole('textbox', { name: /select a profile/i })
    );
    await user.click(await screen.findByText(/none/i));

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
    await user.click(await screen.findByTestId('upload-aws'));
    await clickNext();

    // aws step
    await user.click(
      await screen.findByRole('radio', {
        name: /manually enter an account id\./i,
      })
    );

    await user.type(
      await screen.findByRole('textbox', {
        name: 'aws account id',
      }),
      '012345678901'
    );

    await clickNext();
    // skip registration
    await user.click(await screen.findByLabelText('Register later'));
    await clickNext();

    // Now we should be at the OpenSCAP step
    await screen.findByRole('heading', { name: /OpenSCAP/i });

    await user.click(
      await screen.findByRole('textbox', {
        name: /select a profile/i,
      })
    );

    await user.click(
      await screen.findByText(
        /cis red hat enterprise linux 8 benchmark for level 1 - workstation/i
      )
    );
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
    await user.click(await screen.findByText(/Selected/));
    await screen.findByText(/aide/i);
    await screen.findByText(/neovim/i);
  });

  test('OpenSCAP dropdown is disabled for WSL targets only', async () => {
    await setup();
    await selectRhel8();
    await user.click(await screen.findByTestId('checkbox-wsl'));
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
    await user.click(await screen.findByTestId('checkbox-image-installer'));
    await user.click(await screen.findByTestId('checkbox-wsl'));
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
