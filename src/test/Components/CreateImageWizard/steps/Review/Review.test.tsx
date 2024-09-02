import React from 'react';

import { Router as RemixRouter } from '@remix-run/router/dist/router';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import CreateImageWizard from '../../../../../Components/CreateImageWizard/CreateImageWizard';
import ShareImageModal from '../../../../../Components/ShareImageModal/ShareImageModal';
import { renderCustomRoutesWithReduxRouter } from '../../../../testUtils';
import {
  clickBack,
  clickNext,
  enterBlueprintName,
  verifyCancelButton,
} from '../../wizardTestUtils';

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

let router: RemixRouter | undefined = undefined;

const switchToAWSManual = async () => {
  const user = userEvent.setup();
  const manualRadio = await screen.findByRole('radio', {
    name: /manually enter an account id\./i,
  });
  await waitFor(() => user.click(manualRadio));
  return manualRadio;
};

describe('Step Review', () => {
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

    // select aws as upload destination
    await waitFor(
      async () => await user.click(await screen.findByTestId('upload-aws'))
    );
    await clickNext();

    // aws step
    await switchToAWSManual();
    await waitFor(async () =>
      user.type(
        await screen.findByRole('textbox', {
          name: 'aws account id',
        }),
        '012345678901'
      )
    );
    await clickNext();
    await screen.findByRole('textbox', {
      name: 'Select activation key',
    });

    // skip registration
    const registrationCheckbox = await screen.findByTestId(
      'automatically-register-checkbox'
    );
    await waitFor(() => user.click(registrationCheckbox));

    await clickNext();
    // skip OpenScap
    await clickNext();
    // skip snpashotstep
    await clickNext();
    // skip repositories
    await clickNext();
    // skip packages
    await clickNext();
    await clickNext();
    // skip firstboot
    await clickNext();
    // skip Details
    await enterBlueprintName();
    await clickNext();
  };

  const setUpCentOS = async () => {
    ({ router } = await renderCustomRoutesWithReduxRouter(
      'imagewizard',
      {},
      routes
    ));

    const releaseMenu = screen.getAllByRole('button', {
      name: /options menu/i,
    })[0];

    await waitFor(() => user.click(releaseMenu));
    const showOptionsButton = await screen.findByRole('button', {
      name: 'Show options for further development of RHEL',
    });
    await waitFor(() => user.click(showOptionsButton));

    const centos = await screen.findByRole('option', {
      name: 'CentOS Stream 9',
    });
    await waitFor(() => user.click(centos));
    // select aws as upload destination
    await waitFor(
      async () => await user.click(await screen.findByTestId('upload-aws'))
    );
    await clickNext();

    // aws step
    await switchToAWSManual();
    await waitFor(async () =>
      user.type(
        await screen.findByRole('textbox', {
          name: 'aws account id',
        }),
        '012345678901'
      )
    );
    await clickNext();
    await screen.findByRole('textbox', {
      name: 'Select activation key',
    });
    // skip registration
    const registrationCheckbox = await screen.findByTestId(
      'automatically-register-checkbox'
    );
    await waitFor(() => user.click(registrationCheckbox));
    await clickNext();

    // skip Oscap
    await clickNext();
    // skip snpashotstep
    await clickNext();
    // skip packages
    await clickNext();
    // skip repositories
    await clickNext();
    await clickNext();
    // skip First boot
    await clickNext();
    await enterBlueprintName();
    await clickNext();
  };

  test('has 3 buttons', async () => {
    await setUp();

    await screen.findByRole('button', { name: /Create blueprint/ });
    await screen.findByRole('button', { name: /Back/ });
    await screen.findByRole('button', { name: /Cancel/ });
  });

  test('clicking Back loads Image name', async () => {
    await setUp();
    await clickBack();
    await screen.findByRole('heading', {
      name: 'Details',
    });
  });

  test('clicking Cancel loads landing page', async () => {
    await setUp();
    await verifyCancelButton(router);
  });

  test('has Registration expandable section for rhel', async () => {
    await setUp();

    const targetExpandable = await screen.findByTestId(
      'target-environments-expandable'
    );
    const contentExpandable = await screen.findByTestId('content-expandable');
    const fscExpandable = await screen.findByTestId(
      'file-system-configuration-expandable'
    );

    await within(targetExpandable).findByText('Amazon Web Services');
    await within(contentExpandable).findByText('Custom repositories');
    await within(contentExpandable).findByText('Additional packages');
    await within(fscExpandable).findByText('Configuration type');
  });
  test('has no Registration expandable for centos', async () => {
    await setUpCentOS();

    const targetExpandable = await screen.findByTestId(
      'target-environments-expandable'
    );
    const contentExpandable = await screen.findByTestId('content-expandable');
    const fscExpandable = await screen.findByTestId(
      'file-system-configuration-expandable'
    );

    expect(
      screen.queryByTestId('registration-expandable')
    ).not.toBeInTheDocument();

    await within(targetExpandable).findByText('Amazon Web Services');
    await within(contentExpandable).findByText('Custom repositories');
    await within(contentExpandable).findByText('Additional packages');
    await within(fscExpandable).findByText('Configuration type');
  });
});
