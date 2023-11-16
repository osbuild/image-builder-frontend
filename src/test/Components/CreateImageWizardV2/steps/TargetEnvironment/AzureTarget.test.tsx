import React from 'react';
import '@testing-library/jest-dom';

import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import CreateImageWizard from '../../../../../Components/CreateImageWizardV2/CreateImageWizard';
import { server } from '../../../../mocks/server';
import {
  clickNext,
  renderCustomRoutesWithReduxRouter,
} from '../../../../testUtils';

const routes = [
  {
    path: 'insights/image-builder/imagewizard/:composeId?',
    element: <CreateImageWizard />,
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

beforeAll(() => {
  // scrollTo is not defined in jsdom
  window.HTMLElement.prototype.scrollTo = function () {};
});

afterEach(() => {
  jest.clearAllMocks();
  server.resetHandlers();
});

describe('Check the Azure Target step', () => {
  test('Check that selecting a source sets up the azure account id, subscription id and allows the user to select a resource group', async () => {
    const user = userEvent.setup();
    await renderCustomRoutesWithReduxRouter('imagewizard', {}, routes);
    // select azure as upload destination
    await user.click(await screen.findByTestId('upload-azure'));
    await screen.findByRole('heading', { name: 'Image output' });
    // go to the azure target page
    await clickNext();

    // enter a source
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
    // check that selecting a source sets up correctly the accountId and
    // subscriptionId account id
    expect(
      await screen.findByRole('textbox', {
        name: /azure tenant guid/i,
      })
    ).toHaveValue('2fd7c95c-0d63-4e81-b914-3fbd5288daf7');
    expect(
      await screen.findByRole('textbox', {
        name: /subscription id/i,
      })
    ).toHaveValue('dfb83267-e016-4429-ae6e-b0768bf36d65');

    // The user can then select a group
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
    // check that the user can click next
    expect(await screen.findByRole('button', { name: /Next/ })).toBeEnabled();
  });

  test('Check that selecting a source, then switching to manual and back to the source cleans up the fields', async () => {
    const user = userEvent.setup();
    await renderCustomRoutesWithReduxRouter('imagewizard', {}, routes);
    // select azure as upload destination
    await user.click(await screen.findByTestId('upload-azure'));
    await screen.findByRole('heading', { name: 'Image output' });
    // go to the azure target page
    await clickNext();

    // enter a source
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
    // check that the user can click next
    expect(await screen.findByRole('button', { name: /Next/ })).toBeEnabled();
    // click to manual
    await user.click(
      await screen.findByRole('radio', {
        name: /manually enter the account information\./i,
      })
    );
    // click to sources
    await user.click(
      await screen.findByRole('radio', {
        name: /use an account configured from sources\./i,
      })
    );
    // account id and subscriptionId must be empty
    expect(
      await screen.findByRole('textbox', {
        name: /azure tenant guid/i,
      })
    ).toHaveValue('');
    expect(
      await screen.findByRole('textbox', {
        name: /subscription id/i,
      })
    ).toHaveValue('');
    // check that the user can't click next
    expect(await screen.findByRole('button', { name: /Next/ })).toBeDisabled();
  });

  test('Check entering wrong data in manual mode prevents the user to get through', async () => {
    const user = userEvent.setup();
    await renderCustomRoutesWithReduxRouter('imagewizard', {}, routes);
    // select azure as upload destination
    await user.click(await screen.findByTestId('upload-azure'));
    await screen.findByRole('heading', { name: 'Image output' });
    // go to the azure target page
    await clickNext();

    // click to manual
    await user.click(
      await screen.findByRole('radio', {
        name: /manually enter the account information\./i,
      })
    );
    // entering wrong data doesn't allow the user to get to the next step
    await user.type(
      await screen.findByRole('textbox', {
        name: /azure tenant id/i,
      }),
      'aaaaaaaaaaaa'
    );
    await user.type(
      await screen.findByRole('textbox', {
        name: /azure subscription id/i,
      }),
      'aaaaaaaaaaaa'
    );
    await user.type(
      await screen.findByRole('textbox', {
        name: /azure resource group/i,
      }),
      'aaaaaaaaaaaa'
    );
    // check that the user can't click next
    expect(await screen.findByRole('button', { name: /Next/ })).toBeDisabled();
  });

  test('Check entering correct data in manual mode allows the user to get through', async () => {
    const user = userEvent.setup();
    await renderCustomRoutesWithReduxRouter('imagewizard', {}, routes);
    // select azure as upload destination
    await user.click(await screen.findByTestId('upload-azure'));
    await screen.findByRole('heading', { name: 'Image output' });
    // go to the azure target page
    await clickNext();

    // click to manual
    await user.click(
      await screen.findByRole('radio', {
        name: /manually enter the account information\./i,
      })
    );
    // entering wrong data doesn't allow the user to get to the next step
    await user.type(
      await screen.findByRole('textbox', {
        name: /azure tenant id/i,
      }),
      '2fd7c95c-0d63-4e81-b914-3fbd5288daf7'
    );
    await user.type(
      await screen.findByRole('textbox', {
        name: /azure subscription id/i,
      }),
      '2fd7c95c-0d63-4e81-b914-3fbd5288daf7'
    );
    await user.type(
      await screen.findByRole('textbox', {
        name: /azure resource group/i,
      }),
      'aaaaaaaaaaaa'
    );
    // check that the user can't click next
    expect(await screen.findByRole('button', { name: /Next/ })).toBeEnabled();
  });
});
