import React from 'react';

import '@testing-library/jest-dom';

import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import CreateImageWizard from '../../../Components/CreateImageWizardV2/CreateImageWizard';
import ShareImageModal from '../../../Components/ShareImageModal/ShareImageModal';
import { server } from '../../mocks/server.js';
import {
  clickNext,
  renderCustomRoutesWithReduxRouter,
  verifyCancelButton,
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
    path: 'insights/image-builder/share /:composeId',
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
    isProd: () => true,
    getEnvironment: () => 'prod',
  }),
}));

jest.mock('@unleash/proxy-client-react', () => ({
  useUnleashContext: () => jest.fn(),
  useFlag: jest.fn((flag) =>
    flag === 'image-builder.enable-content-sources' ? true : false
  ),
}));

beforeAll(() => {
  // scrollTo is not defined in jsdom
  window.HTMLElement.prototype.scrollTo = function () {};
});

afterEach(() => {
  jest.clearAllMocks();
  server.resetHandlers();
});

describe('Create Image Wizard', () => {
  test('renders component', async () => {
    renderCustomRoutesWithReduxRouter('imagewizard', {}, routes);
    // check heading
    await screen.findByRole('heading', { name: /Image Builder/ });

    await screen.findByRole('button', { name: 'Image output' });
  });
});

describe('Step Image output', () => {
  test('clicking Next until the review step with correct information about the image output', async () => {
    const user = userEvent.setup();
    await renderCustomRoutesWithReduxRouter('imagewizard', {}, routes);

    // select every upload target
    await user.click(await screen.findByTestId('upload-aws'));
    await user.click(await screen.findByTestId('upload-google'));
    await user.click(await screen.findByTestId('upload-azure'));
    await user.click(
      await screen.findByRole('checkbox', {
        name: /vmware checkbox/i,
      })
    );
    await user.click(
      await screen.findByRole('checkbox', {
        name: /virtualization guest image checkbox/i,
      })
    );
    await user.click(
      await screen.findByRole('radio', {
        name: /open virtualization format \(\.ova\)/i,
      })
    );
    await user.click(
      await screen.findByRole('checkbox', {
        name: /bare metal installer checkbox/i,
      })
    );

    // go to aws target page
    await clickNext();
    // enter a source to be able to click next
    await user.click(
      await screen.findByRole('combobox', {
        name: /source-typeahead-select-input/i,
      })
    );
    const source = await screen.findByRole('option', {
      name: /my_source/i,
    });
    await user.click(source);

    // go to gcp page
    await clickNext();
    //enter an email address
    await user.type(
      await screen.findByRole('textbox', {
        name: /gcp account email/i,
      }),
      'a@a.fr'
    );

    // go to azure page
    await clickNext();
    // enter a source and a resource group
    await user.click(
      await screen.findByRole('combobox', {
        name: /source-typeahead-select-input/i,
      })
    );
    await user.click(
      await screen.findByRole('option', {
        name: /azureSource1/i,
      })
    );
    await user.click(
      await screen.findByRole('combobox', {
        name: /resource-group-selecttypeahead-select-input/i,
      })
    );
    await user.click(
      await screen.findByRole('option', {
        name: /myResourceGroup1/i,
      })
    );

    // go to review page
    await clickNext();
    await screen.findByRole('heading', { name: 'Review' });
    const view = await screen.findByTestId('image-output-expandable');
    await user.click(await within(view).findByText(/image output/i));
    expect(await screen.findByText(/x86_64/i)).not.toBeNaN();
    expect(
      await screen.findByText(/red hat enterprise linux \(rhel\) 9/i)
    ).not.toBeNaN();
    // check the environment
    const targetEnvironmentsExpandable = await screen.findByTestId(
      'target-environments-expandable'
    );
    await user.click(targetEnvironmentsExpandable);
    await screen.findAllByText('AWS');
    await screen.findAllByText('GCP');
    await screen.findAllByText('Microsoft Azure');
    await screen.findByText('VMWare vSphere (.ova)');
    await screen.findByText('Virtualization - Guest image (.qcow2)');
    await screen.findByText('Bare metal - Installer (.iso)');
  });

  test('selecting rhel8 and aarch64 shows accordingly in the review step', async () => {
    const user = userEvent.setup();
    await renderCustomRoutesWithReduxRouter('imagewizard', {}, routes);

    // select rhel8
    const releaseMenu = screen.getAllByRole('button', {
      name: 'Red Hat Enterprise Linux (RHEL) 9',
    })[0];
    await user.click(releaseMenu);
    await user.click(
      await screen.findByRole('option', {
        name: 'Red Hat Enterprise Linux (RHEL) 8',
      })
    );

    // Change to aarch
    await user.selectOptions(
      await screen.findByRole('combobox', {
        name: /architecture/i,
      }),
      'aarch64'
    );

    // select aws as upload destination
    await user.click(await screen.findByTestId('upload-aws'));

    // go to aws target page
    await clickNext();
    // enter a source to be able to click next
    await user.click(
      await screen.findByRole('combobox', {
        name: /source-typeahead-select-input/i,
      })
    );
    const source = await screen.findByRole('option', {
      name: /my_source/i,
    });
    await user.click(source);

    // go to review page
    await clickNext();
    await screen.findByRole('heading', { name: 'Review' });
    const view = await screen.findByTestId('image-output-expandable');
    await user.click(await within(view).findByText(/image output/i));
    expect(await screen.findByText(/aarch64/i)).not.toBeNaN();
    expect(
      await screen.findByText(/red hat enterprise linux \(rhel\) 8/i)
    ).not.toBeNaN();
  });

  test('clicking Cancel loads landing page', async () => {
    const { router } = await renderCustomRoutesWithReduxRouter(
      'imagewizard',
      {},
      routes
    );
    await clickNext();

    await verifyCancelButton(router);
  });
});
