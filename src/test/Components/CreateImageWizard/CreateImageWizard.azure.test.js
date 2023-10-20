import React from 'react';
import '@testing-library/jest-dom';

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';

import CreateImageWizard from '../../../Components/CreateImageWizard/CreateImageWizard';
import ShareImageModal from '../../../Components/ShareImageModal/ShareImageModal';
import { PROVISIONING_API } from '../../../constants';
import { server } from '../../mocks/server';
import {
  clickBack,
  clickNext,
  getNextButton,
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

let router = undefined;

beforeAll(() => {
  // scrollTo is not defined in jsdom
  window.HTMLElement.prototype.scrollTo = function () {};
});

afterEach(() => {
  jest.clearAllMocks();
  router = undefined;
  server.resetHandlers();
});

const getSourceDropdown = async () => {
  const sourceDropdown = await screen.findByRole('textbox', {
    name: /select source/i,
  });
  // Wait for isSuccess === true, dropdown is disabled while isSuccess === false
  await waitFor(() => expect(sourceDropdown).toBeEnabled());
  return sourceDropdown;
};

describe('Step Upload to Azure', () => {
  const user = userEvent.setup();
  const setUp = async () => {
    ({ router } = await renderCustomRoutesWithReduxRouter(
      'imagewizard',
      {},
      routes
    ));
    // select Azure as upload destination
    await user.click(await screen.findByTestId('upload-azure'));

    await clickNext();

    await screen.findByRole('heading', {
      name: 'Target environment - Microsoft Azure',
    });
  };

  test('clicking Next loads Registration', async () => {
    await setUp();

    await user.click(await screen.findByTestId('azure-radio-manual'));
    // Randomly generated GUID
    await user.type(
      screen.getByTestId('azure-tenant-id-manual'),
      'b8f86d22-4371-46ce-95e7-65c415f3b1e2'
    );
    await user.type(
      screen.getByTestId('azure-subscription-id-manual'),
      '60631143-a7dc-4d15-988b-ba83f3c99711'
    );
    await user.type(
      screen.getByTestId('azure-resource-group-manual'),
      'testResourceGroup'
    );
    await clickNext();

    await screen.findByRole('textbox', {
      name: 'Select activation key',
    });

    await screen.findByText(
      'Automatically register and enable advanced capabilities'
    );
  });

  test('clicking Back loads Release', async () => {
    await setUp();

    await clickBack();

    screen.getByTestId('upload-azure');
  });

  test('clicking Cancel loads landing page', async () => {
    await setUp();

    await verifyCancelButton(router);
  });

  test('azure step basics works', async () => {
    await setUp();
    const nextButton = await getNextButton();

    expect(nextButton).toHaveClass('pf-m-disabled');
    expect(screen.getByTestId('azure-radio-source')).toBeChecked();

    await user.click(screen.getByTestId('azure-radio-manual'));
    expect(screen.getByTestId('azure-radio-manual')).toBeChecked();

    expect(nextButton).toHaveClass('pf-m-disabled');

    const tenantId = screen.getByTestId('azure-tenant-id-manual');
    expect(tenantId).toHaveValue('');
    expect(tenantId).toBeEnabled();
    await user.type(tenantId, 'c983c2cd-94d7-44e1-9c6e-9cfa3a40995f');
    const subscription = screen.getByTestId('azure-subscription-id-manual');
    expect(subscription).toHaveValue('');
    expect(subscription).toBeEnabled();
    await user.type(subscription, 'f8f200aa-6234-4bfb-86c2-163d33dffc0c');
    const resourceGroup = screen.getByTestId('azure-resource-group-manual');
    expect(resourceGroup).toHaveValue('');
    expect(resourceGroup).toBeEnabled();
    await user.type(resourceGroup, 'testGroup');

    expect(nextButton).not.toHaveClass('pf-m-disabled');

    user.click(screen.getByTestId('azure-radio-source'));

    await waitFor(() => expect(nextButton).toHaveClass('pf-m-disabled'));

    const sourceDropdown = await getSourceDropdown();

    // manual values should be cleared out
    expect(screen.getByTestId('azure-tenant-id-source')).toHaveValue('');
    expect(screen.getByTestId('azure-subscription-id-source')).toHaveValue('');

    user.click(sourceDropdown);

    user.click(
      await screen.findByRole('option', {
        name: /azureSource1/i,
      })
    );
    // wait for fetching the upload info
    await waitFor(() =>
      expect(screen.getByTestId('azure-tenant-id-source')).not.toHaveValue('')
    );

    await user.click(
      screen.getByRole('textbox', {
        name: /select resource group/i,
      })
    );
    const groups = screen.getAllByLabelText(/^Resource group/);
    expect(groups).toHaveLength(2);
    await user.click(screen.getByLabelText('Resource group myResourceGroup1'));

    expect(nextButton).not.toHaveClass('pf-m-disabled');
  }, 10000);

  test('handles change of selected Source', async () => {
    setUp();

    const sourceDropdown = await getSourceDropdown();

    user.click(sourceDropdown);
    user.click(
      await screen.findByRole('option', {
        name: /azureSource1/i,
      })
    );
    await waitFor(() =>
      expect(screen.getByTestId('azure-tenant-id-source')).not.toHaveValue('')
    );

    user.click(sourceDropdown);
    user.click(
      await screen.findByRole('option', {
        name: /azureSource2/i,
      })
    );
    await waitFor(() =>
      expect(screen.getByTestId('azure-tenant-id-source')).toHaveValue(
        '73d5694c-7a28-417e-9fca-55840084f508'
      )
    );

    await user.click(
      screen.getByRole('textbox', {
        name: /select resource group/i,
      })
    );
    const groups = screen.getByLabelText(/^Resource group/);
    expect(groups).toBeInTheDocument();
    expect(screen.getByLabelText('Resource group theirGroup2')).toBeVisible();
  });

  test('component renders error state correctly', async () => {
    server.use(
      rest.get(`${PROVISIONING_API}/sources`, (req, res, ctx) =>
        res(ctx.status(500))
      )
    );

    setUp();

    await screen.findByText(
      /Sources cannot be reached, try again later or enter an account info for upload manually\./i
    );
    //
  });

  // set test timeout to 15 seconds
}, 15000);
