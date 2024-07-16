import React from 'react';
import '@testing-library/jest-dom';

import type { Router as RemixRouter } from '@remix-run/router';
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
    isProd: () => true,
    getEnvironment: () => 'prod',
  }),
}));

vi.mock('@unleash/proxy-client-react', () => ({
  useUnleashContext: () => vi.fn(),
  useFlag: vi.fn(() => false),
}));

// The router is just initiliazed here, it's assigned a value in the tests
let router: RemixRouter | undefined = undefined;

const getSourceDropdown = async () => {
  const sourceDropdown = await screen.findByRole('textbox', {
    name: /select source/i,
  });
  // Wait for isSuccess === true, dropdown is disabled while isSuccess === false
  await waitFor(() => expect(sourceDropdown).toBeEnabled());
  return sourceDropdown;
};

describe('Step Upload to Azure', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    router = undefined;
  });

  const user = userEvent.setup();
  const setUp = async () => {
    ({ router } = await renderCustomRoutesWithReduxRouter(
      'imagewizard',
      {},
      routes
    ));
    // select Azure as upload destination
    const uploadAzure = await screen.findByTestId('upload-azure');
    user.click(uploadAzure);

    await clickNext();

    await screen.findByRole('heading', {
      name: 'Target environment - Microsoft Azure',
    });
  };

  test('clicking Next loads Registration', async () => {
    await setUp();
    const manualOption = await screen.findByText(
      /manually enter the account information\./i
    );
    await waitFor(() => user.click(manualOption));
    // Randomly generated GUID
    const tenantGuid = await screen.findByRole('textbox', {
      name: /azure tenant guid/i,
    });
    await waitFor(() =>
      user.type(tenantGuid, 'b8f86d22-4371-46ce-95e7-65c415f3b1e2')
    );
    const subscriptionId = await screen.findByRole('textbox', {
      name: /subscription id/i,
    });
    await waitFor(() =>
      user.type(subscriptionId, '60631143-a7dc-4d15-988b-ba83f3c99711')
    );
    const resourceGroup = await screen.findByRole('textbox', {
      name: /resource group/i,
    });
    await waitFor(() => user.type(resourceGroup, 'testResourceGroup'));
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

    await screen.findByTestId('upload-azure');
  });

  test('clicking Cancel loads landing page', async () => {
    await setUp();
    await verifyCancelButton(router);
  });

  test('azure step basics works', async () => {
    await setUp();
    const nextButton = await getNextButton();

    const manualOption = await screen.findByText(
      /manually enter the account information\./i
    );
    await waitFor(() => user.click(manualOption));

    const tenantId = screen.getByRole('textbox', {
      name: /azure tenant guid/i,
    });
    expect(tenantId).toHaveValue('');
    expect(tenantId).toBeEnabled();
    await waitFor(
      async () =>
        await user.type(tenantId, 'c983c2cd-94d7-44e1-9c6e-9cfa3a40995f')
    );
    const subscription = screen.getByRole('textbox', {
      name: /subscription id/i,
    });
    expect(subscription).toHaveValue('');
    expect(subscription).toBeEnabled();
    await waitFor(
      async () =>
        await user.type(subscription, 'f8f200aa-6234-4bfb-86c2-163d33dffc0c')
    );
    const resourceGroup = screen.getByRole('textbox', {
      name: /resource group/i,
    });
    expect(resourceGroup).toHaveValue('');
    expect(resourceGroup).toBeEnabled();
    await waitFor(async () => await user.type(resourceGroup, 'testGroup'));

    expect(nextButton).not.toHaveClass('pf-m-disabled');

    await waitFor(async () =>
      user.click(
        await screen.findByRole('radio', {
          name: /use an account configured from sources\./i,
        })
      )
    );

    await waitFor(() => expect(nextButton).toHaveClass('pf-m-disabled'));

    const sourceDropdown = await getSourceDropdown();

    // manual values should be cleared out
    expect(
      screen.getByRole('textbox', {
        name: /azure tenant guid/i,
      })
    ).toHaveValue('');

    expect(
      screen.getByRole('textbox', {
        name: /subscription id/i,
      })
    ).toHaveValue('');

    await waitFor(() => user.click(sourceDropdown));

    await waitFor(async () =>
      user.click(
        await screen.findByRole('option', {
          name: /azureSource1/i,
        })
      )
    );
    // wait for fetching the upload info
    await waitFor(() =>
      expect(
        screen.getByRole('textbox', {
          name: /azure tenant guid/i,
        })
      ).not.toHaveValue('')
    );

    await waitFor(async () =>
      user.click(
        await screen.findByRole('textbox', {
          name: /select resource group/i,
        })
      )
    );
    const groups = screen.getAllByLabelText(/^Resource group/);
    expect(groups).toHaveLength(2);
    await waitFor(async () =>
      user.click(
        await screen.findByLabelText('Resource group myResourceGroup1')
      )
    );

    expect(nextButton).not.toHaveClass('pf-m-disabled');
  }, 10000);

  test('handles change of selected Source', async () => {
    await setUp();

    const sourceDropdown = await getSourceDropdown();
    await waitFor(() => user.click(sourceDropdown));
    await waitFor(async () =>
      user.click(
        await screen.findByRole('option', {
          name: /azureSource1/i,
        })
      )
    );

    await waitFor(() =>
      expect(
        screen.getByRole('textbox', {
          name: /azure tenant guid/i,
        })
      ).not.toHaveValue('')
    );

    await waitFor(() => user.click(sourceDropdown));
    await waitFor(async () =>
      user.click(
        await screen.findByRole('option', {
          name: /azureSource2/i,
        })
      )
    );
    await waitFor(() => {
      expect(
        screen.getByRole('textbox', {
          name: /azure tenant guid/i,
        })
      ).toHaveValue('73d5694c-7a28-417e-9fca-55840084f508');
    });

    await waitFor(async () =>
      user.click(
        await screen.findByRole('textbox', {
          name: /select resource group/i,
        })
      )
    );
    const groups = await screen.findByLabelText(/^Resource group/);
    expect(groups).toBeInTheDocument();
    expect(
      await screen.findByLabelText('Resource group theirGroup2')
    ).toBeVisible();
  });

  test('component renders error state correctly', async () => {
    server.use(
      rest.get(`${PROVISIONING_API}/sources`, (req, res, ctx) =>
        res(ctx.status(500))
      )
    );

    await setUp();

    await screen.findByText(
      /Sources cannot be reached, try again later or enter an account info for upload manually\./i
    );
    // set test timeout to 15 seconds
  }, 15000);
});
