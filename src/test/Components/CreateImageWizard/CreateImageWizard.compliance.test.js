import React from 'react';

import '@testing-library/jest-dom';

import { screen, waitFor, within } from '@testing-library/react';
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

let router = undefined;

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
  test('create an image with an oscap profile', async () => {
    const user = userEvent.setup();
    ({ router } = renderCustomRoutesWithReduxRouter('imagewizard', {}, routes));

    // select aws as upload destination
    await user.click(await screen.findByTestId('upload-aws'));
    await clickNext();

    // aws step
    await user.click(
      screen.getByRole('radio', { name: /manually enter an account id\./i })
    );
    await user.type(screen.getByTestId('aws-account-id'), '012345678901');

    await clickNext();
    // skip registration
    await user.click(screen.getByLabelText('Register later'));
    await clickNext();

    // Now we should be in the Compliance step
    await screen.findByRole('heading', { name: /OpenSCAP Compliance/i });
    expect(
      await screen.findByRole('radio', { name: /do not add a profile/i })
    ).toBeChecked();
    await user.click(
      await screen.findByRole('radio', { name: 'Add a profile' })
    );
    expect(
      await screen.findByRole('radio', { name: 'Add a profile' })
    ).toBeChecked();
    await user.click(
      await screen.findByRole('textbox', { name: /select a profile/i })
    );
    await user.click(
      await screen.findByRole('option', {
        name: /xccdf_org\.ssgproject\.content_profile_cis_workstation/i,
      })
    );

    // check that the FSC contains a /tmp partition
    await clickNext();
    await screen.findByRole('heading', { name: /File system configuration/i });
    await screen.findByText('/tmp');

    // check that the Packages contain a nftable package
    await clickNext();
    await screen.findByRole('heading', {
      name: /Additional Red Hat packages/i,
    });
    await screen.findByText('nftables');
  });
});

describe('On Recreate', () => {
  const setup = async () => {
    ({ router } = renderWithReduxRouter(
      'imagewizard/1679d95b-8f1d-4982-8c53-8c2afa4ab04c'
    ));
  };
  test('with oscap profile', async () => {
    const user = userEvent.setup();
    await setup();

    await screen.findByRole('heading', { name: /review/i });
    const createImageButton = await screen.findByRole('button', {
      name: /create image/i,
    });
    await waitFor(() => expect(createImageButton).toBeEnabled());

    // check that the FSC contains a /tmp partition
    const navigation = await screen.findByRole('navigation');
    await user.click(
      await within(navigation).findByRole('button', {
        name: /file system configuration/i,
      })
    );
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
