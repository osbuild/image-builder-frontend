import React from 'react';
import '@testing-library/jest-dom';

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';

import CreateImageWizard from '../../../Components/CreateImageWizard/CreateImageWizard';
import ShareImageModal from '../../../Components/ShareImageModal/ShareImageModal';
import { PROVISIONING_API } from '../../../constants.js';
import { server } from '../../mocks/server.js';
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
    isBeta: () => false,
    isProd: () => true,
    getEnvironment: () => 'prod',
  }),
}));

describe('Step Upload to Azure', () => {
  beforeAll(() => {
    // scrollTo is not defined in jsdom
    window.HTMLElement.prototype.scrollTo = function () {};
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const user = userEvent.setup();

  const setUp = async () => {
    renderCustomRoutesWithReduxRouter('imagewizard', {}, routes);
    // select Azure as upload destination
    await user.click(screen.getByTestId('upload-azure'));

    await clickNext();

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Target environment - Microsoft Azure'
    );
  };

  test('component renders error state correctly', async () => {
    setUp();
    server.use(
      rest.get(`${PROVISIONING_API}/sources`, (req, res, ctx) =>
        res(ctx.status(500))
      )
    );

    await screen.findByText(
      /Sources cannot be reached, try again later or enter an account info for upload manually\./i
    );
    //
  });
  // set test timeout on 10 seconds
}, 15000);
