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

describe('Check the GCP Target step', () => {
  test('Check that selecting sharingAccount shows the email section', async () => {
    const user = userEvent.setup();
    await renderCustomRoutesWithReduxRouter('imagewizard', {}, routes);
    // select gcp as upload destination
    await user.click(await screen.findByTestId('upload-google'));
    await screen.findByRole('heading', { name: 'Image output' });
    // go to gcp target page
    await clickNext();
    // click on share with google account
    await user.click(
      await screen.findByRole('radio', {
        name: /share image with a google account/i,
      })
    );
    expect(
      await screen.findByRole('textbox', {
        name: /gcp account email/i,
      })
    ).toBeInTheDocument();
    // ensure the user can't click next without more interactions
    expect(await screen.findByRole('button', { name: /Next/ })).toBeDisabled();
  });

  test('Check that selecting sharing with insights allows the user to directly go next', async () => {
    const user = userEvent.setup();
    await renderCustomRoutesWithReduxRouter('imagewizard', {}, routes);
    // select gcp as upload destination
    await user.click(await screen.findByTestId('upload-google'));
    await screen.findByRole('heading', { name: 'Image output' });
    // go to gcp target page
    await clickNext();
    // click on share with insights
    await user.click(
      await screen.findByRole('radio', {
        name: /share image with red hat insights only/i,
      })
    );
    expect(screen.queryByText('e-mail address')).not.toBeInTheDocument();
    // ensure the user can't click next without more interactions
    expect(await screen.findByRole('button', { name: /Next/ })).toBeEnabled();
  });

  test('Check that selecting serviceAccount, googleAccount and googleGroup proposes to enter an email address', async () => {
    const user = userEvent.setup();
    await renderCustomRoutesWithReduxRouter('imagewizard', {}, routes);
    // select gcp as upload destination
    await user.click(await screen.findByTestId('upload-google'));
    await screen.findByRole('heading', { name: 'Image output' });
    // go to gcp target page
    await clickNext();
    // check email field is visible
    expect(
      await screen.findByRole('textbox', {
        name: /gcp account email/i,
      })
    ).toBeInTheDocument();
    await user.click(
      await screen.findByRole('radio', {
        name: /service account/i,
      })
    );
    expect(
      await screen.findByRole('textbox', {
        name: /gcp account email/i,
      })
    ).toBeInTheDocument();
    await user.click(
      await screen.findByRole('radio', {
        name: /google group/i,
      })
    );
    expect(
      await screen.findByRole('textbox', {
        name: /gcp account email/i,
      })
    ).toBeInTheDocument();
    // ensure the user can't click next without more interactions
    expect(await screen.findByRole('button', { name: /Next/ })).toBeDisabled();
  });

  test('Check that selecting domain proposes to enter a domain', async () => {
    const user = userEvent.setup();
    await renderCustomRoutesWithReduxRouter('imagewizard', {}, routes);
    // select gcp as upload destination
    await user.click(await screen.findByTestId('upload-google'));
    await screen.findByRole('heading', { name: 'Image output' });
    // go to gcp target page
    await clickNext();
    // check domain field is visible
    await user.click(
      await screen.findByRole('radio', {
        name: /google workspace domain or cloud identity domain/i,
      })
    );
    expect(
      await screen.findByRole('textbox', {
        name: /google-domain/i,
      })
    ).toBeInTheDocument();
    // ensure the user can't click next without more interactions
    expect(await screen.findByRole('button', { name: /Next/ })).toBeDisabled();
  });

  test('Check email validation', async () => {
    const user = userEvent.setup();
    await renderCustomRoutesWithReduxRouter('imagewizard', {}, routes);
    // select gcp as upload destination
    await user.click(await screen.findByTestId('upload-google'));
    await screen.findByRole('heading', { name: 'Image output' });
    // go to gcp target page
    await clickNext();
    // check email field is visible
    expect(
      await screen.findByRole('textbox', {
        name: /gcp account email/i,
      })
    ).toBeInTheDocument();
    await user.type(
      await screen.findByRole('textbox', {
        name: /gcp account email/i,
      }),
      'aaaaaaaaaaaa'
    );
    // invalid address mail can't let the user click next
    expect(await screen.findByRole('button', { name: /Next/ })).toBeDisabled();
    await user.type(
      await screen.findByRole('textbox', {
        name: /gcp account email/i,
      }),
      '@aaaaaaaaaaaa.fr'
    );
    // finishing to type the address email lets the user click next
    expect(await screen.findByRole('button', { name: /Next/ })).toBeEnabled();
  });

  test('Check domain validation', async () => {
    const user = userEvent.setup();
    await renderCustomRoutesWithReduxRouter('imagewizard', {}, routes);
    // select gcp as upload destination
    await user.click(await screen.findByTestId('upload-google'));
    await screen.findByRole('heading', { name: 'Image output' });
    // go to gcp target page
    await clickNext();
    // check domain field is visible
    await user.click(
      await screen.findByRole('radio', {
        name: /google workspace domain or cloud identity domain/i,
      })
    );
    expect(
      await screen.findByRole('textbox', {
        name: /google-domain/i,
      })
    ).toBeInTheDocument();
    // ensure the user can't click next without more interactions
    expect(await screen.findByRole('button', { name: /Next/ })).toBeDisabled();
    // type some data in the domain
    await user.type(
      await screen.findByRole('textbox', {
        name: /google-domain/i,
      }),
      'aaaaaaaaaaaa'
    );
    // the user can now go next
    expect(await screen.findByRole('button', { name: /Next/ })).toBeEnabled();
  });
});
