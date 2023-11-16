import React from 'react';
import '@testing-library/jest-dom';

import { screen, waitFor } from '@testing-library/react';
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

describe('Check the AWS Target step', () => {
  test('Check that selecting a source sets up the aws account id', async () => {
    const user = userEvent.setup();
    await renderCustomRoutesWithReduxRouter('imagewizard', {}, routes);
    // select aws as upload destination
    await user.click(await screen.findByTestId('upload-aws'));
    await screen.findByRole('heading', { name: 'Image output' });
    // go to aws target page
    await clickNext();

    // enter a source
    await user.click(
      await screen.findByRole('combobox', {
        name: /source-typeahead-select-input/i,
      })
    );
    await user.click(
      await screen.findByRole('option', {
        name: /my_source/i,
      })
    );
    // check that selecting a source sets up correctly the aws account id
    expect(
      await screen.findByRole('textbox', {
        name: /associated account id/i,
      })
    ).toHaveValue('123456789012');
    // check that the user can click next
    expect(await screen.findByRole('button', { name: /Next/ })).toBeEnabled();
  });

  test('Check that clearing a selected source frees up the aws account id', async () => {
    const user = userEvent.setup();
    await renderCustomRoutesWithReduxRouter('imagewizard', {}, routes);
    // select aws as upload destination
    await user.click(await screen.findByTestId('upload-aws'));
    await screen.findByRole('heading', { name: 'Image output' });
    // go to aws target page
    await clickNext();

    // enter a source
    await user.click(
      await screen.findByRole('combobox', {
        name: /source-typeahead-select-input/i,
      })
    );
    await user.click(
      await screen.findByRole('option', {
        name: /my_source/i,
      })
    );
    // clear the source
    await user.click(
      await screen.findByRole('button', {
        name: /clear input value/i,
      })
    );
    // check that clearing the source removes the aws account id
    expect(
      await screen.findByRole('textbox', {
        name: /associated account id/i,
      })
    ).not.toHaveValue('123456789012');
    // check that the user can't click next
    expect(await screen.findByRole('button', { name: /Next/ })).toBeDisabled();
  });

  test('Check that switching to manual after selecting a source frees up the aws account id', async () => {
    const user = userEvent.setup();
    await renderCustomRoutesWithReduxRouter('imagewizard', {}, routes);
    // select aws as upload destination
    await user.click(await screen.findByTestId('upload-aws'));
    await screen.findByRole('heading', { name: 'Image output' });
    // go to aws target page
    await clickNext();

    // enter a source
    await user.click(
      await screen.findByRole('combobox', {
        name: /source-typeahead-select-input/i,
      })
    );
    await user.click(
      await screen.findByRole('option', {
        name: /my_source/i,
      })
    );
    // switch to manual
    await user.click(
      await screen.findByRole('radio', {
        name: /manually enter an account id\./i,
      })
    );
    expect(
      await screen.findByRole('textbox', {
        name: /AWS account id/i,
      })
    ).not.toHaveValue('123456789012');
    // check that the user can't click next
    expect(await screen.findByRole('button', { name: /Next/ })).toBeDisabled();
  });

  test('Check that manual ID validates only with 12 numbers', async () => {
    const user = userEvent.setup();
    await renderCustomRoutesWithReduxRouter('imagewizard', {}, routes);
    // select aws as upload destination
    await user.click(await screen.findByTestId('upload-aws'));
    await screen.findByRole('heading', { name: 'Image output' });
    // go to aws target page
    await clickNext();

    // enter a source
    await user.click(
      await screen.findByRole('combobox', {
        name: /source-typeahead-select-input/i,
      })
    );
    await user.click(
      await screen.findByRole('option', {
        name: /my_source/i,
      })
    );
    // switch to manual
    await user.click(
      await screen.findByRole('radio', {
        name: /manually enter an account id\./i,
      })
    );
    // entering 12 letters doesn't allow the user to proceed
    await user.type(
      await screen.findByRole('textbox', {
        name: /AWS account id/i,
      }),
      'aaaaaaaaaaaa'
    );
    // check that the user can't click next
    expect(await screen.findByRole('button', { name: /Next/ })).toBeDisabled();
    await user.clear(
      await screen.findByRole('textbox', {
        name: /AWS account id/i,
      })
    );
    // entering less than 12 numbers doesn't allow the user to proceed
    await user.type(
      await screen.findByRole('textbox', {
        name: /AWS account id/i,
      }),
      '123'
    );
    // check that the user can't click next
    expect(await screen.findByRole('button', { name: /Next/ })).toBeDisabled();
    await user.clear(
      await screen.findByRole('textbox', {
        name: /AWS account id/i,
      })
    );
    // entering exactly 12 numbers allows the user to proceed
    await user.type(
      await screen.findByRole('textbox', {
        name: /AWS account id/i,
      }),
      '123456789012'
    );
    // check that the user can't click next
    expect(await screen.findByRole('button', { name: /Next/ })).toBeEnabled();
  });

  test('Check that after manual ID setup switching to automatic clears the aws account id', async () => {
    const user = userEvent.setup();
    await renderCustomRoutesWithReduxRouter('imagewizard', {}, routes);
    // select aws as upload destination
    await user.click(await screen.findByTestId('upload-aws'));
    await screen.findByRole('heading', { name: 'Image output' });
    // go to aws target page
    await clickNext();

    // enter a source
    await user.click(
      await screen.findByRole('combobox', {
        name: /source-typeahead-select-input/i,
      })
    );
    await user.click(
      await screen.findByRole('option', {
        name: /my_source/i,
      })
    );
    // switch to manual
    await user.click(
      await screen.findByRole('radio', {
        name: /manually enter an account id\./i,
      })
    );
    // entering 12 numbers
    await user.type(
      await screen.findByRole('textbox', {
        name: /AWS account id/i,
      }),
      '123456789012'
    );
    // switch to automatic
    await user.click(
      await screen.findByRole('radio', {
        name: /use an account configured from sources\./i,
      })
    );
    // check that switching to automatic cleared up the account id text field
    expect(
      await screen.findByRole('textbox', {
        name: /associated account id/i,
      })
    ).not.toHaveValue('123456789012');
    // check that the user can't click next
    expect(await screen.findByRole('button', { name: /Next/ })).toBeDisabled();
  });
});
