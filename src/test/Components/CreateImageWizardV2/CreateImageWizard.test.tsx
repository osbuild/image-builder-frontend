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
  test('renders component', () => {
    renderCustomRoutesWithReduxRouter('imagewizard', {}, routes);
    // check heading
    screen.getByRole('heading', { name: /Image Builder/ });

    screen.getByRole('button', { name: 'Image output' });
  });
});

describe('Step Image output', () => {
  test('clicking Next loads the review step with correct information about the image output', async () => {
    const user = userEvent.setup();
    await renderCustomRoutesWithReduxRouter('imagewizard', {}, routes);

    // select aws as upload destination
    await user.click(await screen.findByTestId('upload-aws'));
    await screen.findByRole('heading', { name: 'Image output' });

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
    await screen.findByRole('heading', { name: 'Review' });
    const view = screen.getByTestId('image-output-expandable');
    await user.click(await within(view).findByText(/image output/i));
    expect(await screen.findByText(/x86_64/i)).not.toBeNaN();
    expect(
      await screen.findByText(/red hat enterprise linux \(rhel\) 9/i)
    ).not.toBeNaN();
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

    await screen.findByRole('heading', { name: 'Review' });
    const view = screen.getByTestId('image-output-expandable');
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
