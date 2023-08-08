import '@testing-library/jest-dom';

import { screen } from '@testing-library/react';
import { rest } from 'msw';

import { PROVISIONING_API } from '../../../constants.js';
import { server } from '../../mocks/server.js';
import {
  clickNext,
  renderWithReduxRouter,
} from '../../testUtils';

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

describe('Step Upload to Azure', () => {
  beforeAll(() => {
    // scrollTo is not defined in jsdom
    window.HTMLElement.prototype.scrollTo = function () {};
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const setUp = async () => {
    renderWithReduxRouter('imagewizard', {});
    // select aws as upload destination
    const azureTile = screen.getByTestId('upload-azure');
    azureTile.click();

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
