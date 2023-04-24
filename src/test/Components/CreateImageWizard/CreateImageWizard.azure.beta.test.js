import '@testing-library/jest-dom';

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';

import api from '../../../api.js';
import { PROVISIONING_SOURCES_ENDPOINT } from '../../../constants.js';
import { mockRepositoryResults } from '../../fixtures/repositories';
import { server } from '../../mocks/server.js';
import { renderWithReduxRouter } from '../../testUtils';

describe('Step Upload to Azure', () => {
  const getNextButton = () => {
    const next = screen.getByRole('button', { name: /Next/ });
    return next;
  };

  const getSourceDropdown = async () => {
    const sourceDropdown = screen.getByRole('textbox', {
      name: /select source/i,
    });
    // Wait for isSuccess === true, dropdown is disabled while isSuccess === false
    await waitFor(() => expect(sourceDropdown).toBeEnabled());

    return sourceDropdown;
  };

  beforeAll(() => {
    // scrollTo is not defined in jsdom
    window.HTMLElement.prototype.scrollTo = function () {};

    jest
      .spyOn(api, 'getRepositories')
      .mockImplementation(() => Promise.resolve(mockRepositoryResults));

    global.insights = {
      chrome: {
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
        isPreview: () => {
          return true;
        },
        isProd: () => {
          return true;
        },
        getEnvironment: () => {
          return 'prod';
        },
      },
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // restore global mock
  afterAll(() => {
    global.insights = undefined;
  });

  const user = userEvent.setup();
  const setUp = async () => {
    renderWithReduxRouter('imagewizard', {});
    // select aws as upload destination
    const azureTile = screen.getByTestId('upload-azure');
    azureTile.click();

    getNextButton().click();

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Target environment - Microsoft Azure'
    );
  };

  test('azure step basics works', async () => {
    setUp();

    expect(getNextButton()).toHaveClass('pf-m-disabled');
    expect(screen.getByTestId('azure-radio-source')).toBeChecked();

    await user.click(screen.getByTestId('azure-radio-manual'));
    expect(screen.getByTestId('azure-radio-manual')).toBeChecked();

    expect(getNextButton()).toHaveClass('pf-m-disabled');

    await user.type(
      screen.getByTestId('azure-tenant-id-manual'),
      'c983c2cd-94d7-44e1-9c6e-9cfa3a40995f'
    );
    await user.type(
      screen.getByTestId('azure-subscription-id-manual'),
      'f8f200aa-6234-4bfb-86c2-163d33dffc0c'
    );
    await user.type(
      screen.getByTestId('azure-resource-group-manual'),
      'testGroup'
    );

    expect(getNextButton()).not.toHaveClass('pf-m-disabled');

    screen.getByTestId('azure-radio-source').click();

    expect(getNextButton()).toHaveClass('pf-m-disabled');

    const sourceDropdown = await getSourceDropdown();

    // manual values should be cleared out
    expect(screen.getByTestId('azure-tenant-id-source')).toHaveValue('');
    expect(screen.getByTestId('azure-subscription-id-source')).toHaveValue('');

    sourceDropdown.click();

    const source = await screen.findByRole('option', {
      name: /azureSource1/i,
    });
    source.click();
    // wait for fetching the upload info
    await waitFor(() =>
      expect(screen.getByTestId('azure-tenant-id-source')).not.toHaveValue('')
    );

    const resourceGroupDropdown = screen.getByRole('textbox', {
      name: /select resource group/i,
    });
    await user.click(resourceGroupDropdown);
    const groups = screen.getAllByLabelText(/^Resource group/);
    expect(groups).toHaveLength(2);
    await user.click(screen.getByLabelText('Resource group myResourceGroup1'));

    expect(getNextButton()).not.toHaveClass('pf-m-disabled');
  }, 10000);

  test('handles change of selected Source', async () => {
    setUp();

    const sourceDropdown = await getSourceDropdown();

    sourceDropdown.click();
    const source = await screen.findByRole('option', {
      name: /azureSource1/i,
    });
    source.click();
    await waitFor(() =>
      expect(screen.getByTestId('azure-tenant-id-source')).not.toHaveValue('')
    );

    sourceDropdown.click();
    const source2 = await screen.findByRole('option', {
      name: /azureSource2/i,
    });
    source2.click();
    await waitFor(() =>
      expect(screen.getByTestId('azure-tenant-id-source')).toHaveValue(
        '73d5694c-7a28-417e-9fca-55840084f508'
      )
    );

    const resourceGroupDropdown = screen.getByRole('textbox', {
      name: /select resource group/i,
    });
    await user.click(resourceGroupDropdown);
    const groups = screen.getByLabelText(/^Resource group/);
    expect(groups).toBeInTheDocument();
    expect(screen.getByLabelText('Resource group theirGroup2')).toBeVisible();
  });

  test('component renders error state correctly', async () => {
    setUp();
    server.use(
      rest.get(
        'http://localhost'.concat(PROVISIONING_SOURCES_ENDPOINT),
        (req, res, ctx) => res(ctx.status(500))
      )
    );

    await screen.findByText(
      /Sources cannot be reached, try again later or enter an account info for upload manually\./i
    );
    //
  });
  // set test timeout on 10 seconds
}, 15000);
