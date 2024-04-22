import React from 'react';

import '@testing-library/jest-dom';

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import CreateImageWizard from '../../../Components/CreateImageWizard/CreateImageWizard';
import ShareImageModal from '../../../Components/ShareImageModal/ShareImageModal';
import {
  clickNext,
  renderCustomRoutesWithReduxRouter,
  renderWithReduxRouter,
} from '../../testUtils';

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
      await screen.findByTestId('aws-account-id'),
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

    // check that there are no Packages contained when selecting the "None" profile option
    await clickNext();
    await screen.findByRole('heading', {
      name: /Additional Red Hat packages/i,
    });
    await screen.findByText(/no packages added/i);
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
      await screen.findByTestId('aws-account-id'),
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
    await screen.findByText(/nfs-server/i);
    await screen.findByText(/enabled services:/i);
    await screen.findByText(/crond/i);

    // check that the FSC contains a /tmp partition
    await clickNext();
    await screen.findByRole('heading', { name: /File system configuration/i });
    await screen.findByText(/tmp/i);

    // check that the Packages contains correct packages
    await clickNext();

    await screen.findByRole('heading', {
      name: /Additional Red Hat packages/i,
    });
    await screen.findByText(/aide/i);
    await screen.findByText(/neovim/i);
  });
});

describe('On Recreate', () => {
  const setup = async () => {
    renderWithReduxRouter('imagewizard/1679d95b-8f1d-4982-8c53-8c2afa4ab04c');
  };
  test('with oscap profile', async () => {
    const user = userEvent.setup();
    await setup();
    await screen.findByRole('button', {
      name: /review/i,
    });
    const createImageButton = await screen.findByRole('button', {
      name: /create image/i,
    });
    await waitFor(() => expect(createImageButton).toBeEnabled());

    // check that the FSC contains a /tmp partition
    // There are two buttons with the same name but cannot easily select the DDF rendered sidenav.
    // The sidenav will be the first node found out of all buttons.
    const buttonsFSC = await screen.findAllByRole('button', {
      name: /file system configuration/i,
    });
    await user.click(buttonsFSC[0]);
    await screen.findByRole('heading', { name: /file system configuration/i });
    await screen.findByText('/tmp');

    // check that the Packages contain a nftable package
    await clickNext();
    await screen.findByRole('heading', {
      name: /Additional Red Hat packages/i,
    });
    await screen.findByText('nftables');
  });
});
