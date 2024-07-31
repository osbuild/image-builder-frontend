import React from 'react';

import type { Router as RemixRouter } from '@remix-run/router';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import {
  clickBack,
  clickNext,
  verifyCancelButton,
  enterBlueprintName,
} from './wizardTestUtils';

import CreateImageWizard from '../../../Components/CreateImageWizard/CreateImageWizard';
import ShareImageModal from '../../../Components/ShareImageModal/ShareImageModal';
import { renderCustomRoutesWithReduxRouter } from '../../testUtils';

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

const getSourceDropdown = async () => {
  const sourceDropdown = await screen.findByRole('textbox', {
    name: /select source/i,
  });
  await waitFor(() => expect(sourceDropdown).toBeEnabled());

  return sourceDropdown;
};

describe('Create Image Wizard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    router = undefined;
  });

  test('renders component', async () => {
    renderCustomRoutesWithReduxRouter('imagewizard', {}, routes);
    // check heading
    await screen.findByRole('heading', { name: /Images/ });

    await screen.findByRole('button', { name: 'Image output' });
    await screen.findByRole('button', { name: 'Register' });
    await screen.findByRole('button', { name: 'File system configuration' });
    await screen.findByRole('button', { name: 'Content' });
    await screen.findByRole('button', { name: 'Custom repositories' });
    await screen.findByRole('button', { name: 'Additional packages' });
    await screen.findByRole('button', { name: 'Details' });
    await screen.findByRole('button', { name: 'Review' });
  });
});

//describe('Step Details', () => {
//  beforeEach(() => {
//    vi.clearAllMocks();
//    router = undefined;
//  });
//
//  const user = userEvent.setup();
//  const setUp = async () => {
//    ({ router } = await renderCustomRoutesWithReduxRouter(
//      'imagewizard',
//      {},
//      routes
//    ));
//
//    // select aws as upload destination
//    const uploadAws = await screen.findByTestId('upload-aws');
//    user.click(uploadAws);
//    await clickNext();
//
//    // aws step
//    await switchToAWSManual();
//    const awsAccountId = await screen.findByRole('textbox', {
//      name: 'aws account id',
//    });
//
//    await waitFor(() => user.type(awsAccountId, '012345678901'));
//
//    await clickNext();
//    // skip registration
//    await screen.findByRole('textbox', {
//      name: 'Select activation key',
//    });
//
//    const registerLaterRadio = screen.getByTestId('registration-radio-later');
//    user.click(registerLaterRadio);
//    await clickNext();
//    // skip oscap
//    await clickNext();
//    // skip repositories
//    await clickNext();
//    // skip packages
//    await clickNext();
//    // skip fsc
//    await clickNext();
//    // skip snapshot
//    await clickNext();
//    //skip firstBoot
//    await clickNext();
//  };
//
//  test('image name invalid for more than 100 chars and description for 250', async () => {
//    await setUp();
//
//    // Enter image name
//    const invalidName = 'a'.repeat(101);
//    await enterBlueprintName(invalidName);
//    expect(await getNextButton()).toHaveClass('pf-m-disabled');
//    expect(await getNextButton()).toBeDisabled();
//    const nameInput = await screen.findByRole('textbox', {
//      name: /blueprint name/i,
//    });
//    await waitFor(() => user.clear(nameInput));
//
//    await enterBlueprintName();
//
//    expect(await getNextButton()).not.toHaveClass('pf-m-disabled');
//    expect(await getNextButton()).toBeEnabled();
//
//    // Enter description image
//    const descriptionInput = await screen.findByRole('textbox', {
//      name: /description/i,
//    });
//
//    const invalidDescription = 'a'.repeat(251);
//    await waitFor(() => user.type(descriptionInput, invalidDescription));
//
//    expect(await getNextButton()).toHaveClass('pf-m-disabled');
//    expect(await getNextButton()).toBeDisabled();
//    await waitFor(() => user.clear(descriptionInput));
//    await waitFor(() => user.type(descriptionInput, 'valid-description'));
//
//    expect(await getNextButton()).not.toHaveClass('pf-m-disabled');
//    expect(await getNextButton()).toBeEnabled();
//  }, 20000);
//});

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

describe('Keyboard accessibility', () => {
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
    await clickNext();
  };

  const selectAllEnvironments = async () => {
    await waitFor(
      async () => await user.click(await screen.findByTestId('upload-aws'))
    );
    await waitFor(async () =>
      user.click(await screen.findByTestId('upload-google'))
    );
    await waitFor(async () =>
      user.click(await screen.findByTestId('upload-azure'))
    );
    await waitFor(async () =>
      user.click(
        await screen.findByRole('checkbox', {
          name: /virtualization guest image checkbox/i,
        })
      )
    );
  };

  test('autofocus on each step first input element', async () => {
    await setUp();

    // Image output
    await selectAllEnvironments();
    await clickNext();

    // Target environment aws
    expect(
      await screen.findByRole('radio', {
        name: /use an account configured from sources\./i,
      })
    ).toHaveFocus();
    const awsSourceDropdown = await getSourceDropdown();
    await waitFor(() => user.click(awsSourceDropdown));
    const awsSource = await screen.findByRole('option', {
      name: /my_source/i,
    });
    await waitFor(() => user.click(awsSource));

    await clickNext();

    // Target environment google
    expect(
      await screen.findByRole('radio', {
        name: /share image with a google account/i,
      })
    ).toHaveFocus();
    await waitFor(async () =>
      user.type(
        await screen.findByRole('textbox', { name: /google principal/i }),
        'test@test.com'
      )
    );
    await clickNext();

    // Target environment azure
    expect(
      await screen.findByRole('radio', {
        name: /use an account configured from sources\./i,
      })
    ).toHaveFocus();
    const azureSourceDropdown = await getSourceDropdown();
    await waitFor(() => user.click(azureSourceDropdown));
    const azureSource = await screen.findByRole('option', {
      name: /azureSource1/i,
    });
    await waitFor(() => user.click(azureSource));

    const resourceGroupDropdown = await screen.findByRole('textbox', {
      name: /select resource group/i,
    });
    await waitFor(() => user.click(resourceGroupDropdown));
    await waitFor(async () =>
      user.click(
        await screen.findByLabelText('Resource group myResourceGroup1')
      )
    );
    await clickNext();

    // Registration
    await screen.findByText(
      'Automatically register and enable advanced capabilities'
    );
    const registrationCheckbox = await screen.findByTestId(
      'automatically-register-checkbox'
    );
    expect(registrationCheckbox).toHaveFocus();
    await screen.findByRole('textbox', {
      name: 'Select activation key',
    });
    await clickNext();

    // TODO: Focus on textbox on OpenSCAP step
    await clickNext();

    //File system configuration
    await clickNext();

    // TODO: Focus on textbox on Custom Repos step
    await clickNext();

    // TODO: Focus on textbox on Packages step
    await clickNext();
    await clickNext();
    // TODO: Focus on textbox on Details step
    await clickNext();
  }, 20000);

  test('pressing Enter does not advance the wizard', async () => {
    await setUp();
    await waitFor(
      async () => await user.click(await screen.findByTestId('upload-aws'))
    );
    await waitFor(() => user.keyboard('{enter}'));
    await screen.findByRole('heading', {
      name: /image output/i,
    });
  });

  //  test('target environment tiles are keyboard selectable', async () => {
  //    const testTile = async (tile: HTMLElement) => {
  //      tile.focus();
  //      await user.keyboard('{space}');
  //      expect(tile).toHaveClass('pf-m-selected');
  //      await user.keyboard('{space}');
  //      expect(tile).not.toHaveClass('pf-m-selected');
  //    };
  //
  //    await setUp();
  //    await clickNext();
  //
  //    await waitFor(() => screen.findByTestId('upload-aws'));
  //    testTile(await screen.findByTestId('upload-aws'));
  //    testTile(await screen.findByTestId('upload-google'));
  //    testTile(await screen.findByTestId('upload-azure'));
  //  });
});
