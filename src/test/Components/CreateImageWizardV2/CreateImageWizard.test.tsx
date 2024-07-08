import React from 'react';

import '@testing-library/jest-dom';

import type { Router as RemixRouter } from '@remix-run/router';
import {
  screen,
  waitFor,
  waitForElementToBeRemoved,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';
import nodeFetch, { Request, Response } from 'node-fetch';

import {
  enterBlueprintName,
  openAndDismissSaveAndBuildModal,
} from './wizardTestUtils';

import CreateImageWizard from '../../../Components/CreateImageWizardV2/CreateImageWizard';
import ShareImageModal from '../../../Components/ShareImageModal/ShareImageModal';
import { PROVISIONING_API, RHSM_API } from '../../../constants';
import { server } from '../../mocks/server';
import {
  clickBack,
  clickNext,
  getNextButton,
  renderCustomRoutesWithReduxRouter,
  verifyCancelButton,
} from '../../testUtils';

Object.assign(global, { fetch: nodeFetch, Request, Response });

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

const clickFromImageOutputToFsc = async () => {
  const user = userEvent.setup();
  await clickNext();
  const registerLater = await screen.findByText(/Register later/);
  await waitFor(async () => user.click(registerLater));
  await clickNext();
  await clickNext(); // skip OSCAP
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

describe('Step Image output', () => {
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
    const uploadAws = await screen.findByTestId('upload-aws');
    user.click(uploadAws);

    await screen.findByRole('heading', { name: 'Image output' });
  };

  test('clicking Next loads Upload to AWS', async () => {
    await setUp();

    await clickNext();

    await switchToAWSManual();
    await screen.findByText('AWS account ID');
  });

  test('clicking Cancel loads landing page', async () => {
    await setUp();
    await clickNext();

    await verifyCancelButton(router);
  });

  test('target environment is required', async () => {
    await setUp();

    const destination = await screen.findByTestId('target-select');
    const required = await within(destination).findByText('*');
    expect(destination).toBeEnabled();
    expect(destination).toContainElement(required);
  });

  test('selecting and deselecting a tile disables the next button', async () => {
    await setUp();
    const nextButton = await getNextButton();

    const awsTile = await screen.findByTestId('upload-aws');
    // this has already been clicked once in the setup function
    user.click(awsTile); // deselect

    const googleTile = await screen.findByTestId('upload-google');
    user.click(googleTile); // select
    user.click(googleTile); // deselect

    const azureTile = await screen.findByTestId('upload-azure');
    user.click(azureTile); // select
    user.click(azureTile); // deselect

    await waitFor(() => expect(nextButton).toBeDisabled());
  });

  test('expect only RHEL releases before expansion', async () => {
    await setUp();

    const releaseMenu = screen.getAllByRole('button', {
      name: /options menu/i,
    })[0];
    user.click(releaseMenu);

    await screen.findByRole('option', {
      name: /Red Hat Enterprise Linux \(RHEL\) 8/,
    });
    await screen.findByRole('option', {
      name: /Red Hat Enterprise Linux \(RHEL\) 9/,
    });
    await screen.findByRole('button', {
      name: 'Show options for further development of RHEL',
    });

    user.click(releaseMenu);
  });

  test('expect all releases after expansion', async () => {
    await setUp();

    const releaseMenu = screen.getAllByRole('button', {
      name: /options menu/i,
    })[0];
    user.click(releaseMenu);

    const showOptionsButton = await screen.findByRole('button', {
      name: 'Show options for further development of RHEL',
    });
    user.click(showOptionsButton);

    await screen.findByRole('option', {
      name: /Red Hat Enterprise Linux \(RHEL\) 8/,
    });
    await screen.findByRole('option', {
      name: /Red Hat Enterprise Linux \(RHEL\) 9/,
    });
    await screen.findByRole('option', {
      name: 'CentOS Stream 9',
    });

    expect(showOptionsButton).not.toBeInTheDocument();

    user.click(releaseMenu);
  });

  test('release lifecycle chart appears only when RHEL 8 is chosen', async () => {
    await setUp();

    const releaseMenu = await screen.findAllByRole('button', {
      name: /options menu/i,
    });
    user.click(releaseMenu[0]);

    const rhel8Option = await screen.findByRole('option', {
      name: /Red Hat Enterprise Linux \(RHEL\) 8/,
    });

    user.click(rhel8Option);
    await screen.findByTestId('release-lifecycle-chart');

    user.click(releaseMenu[0]);

    const rhel9Option = await screen.findByRole('option', {
      name: /Red Hat Enterprise Linux \(RHEL\) 9/,
    });

    user.click(rhel9Option);
    await waitFor(() =>
      expect(
        screen.queryByTestId('release-lifecycle-chart')
      ).not.toBeInTheDocument()
    );
  });

  test('CentOS acknowledgement appears', async () => {
    await setUp();

    const releaseMenu = screen.getAllByRole('button', {
      name: /options menu/i,
    })[0];
    user.click(releaseMenu);

    const showOptionsButton = await screen.findByRole('button', {
      name: 'Show options for further development of RHEL',
    });
    user.click(showOptionsButton);

    const centOSButton = await screen.findByRole('option', {
      name: 'CentOS Stream 9',
    });
    user.click(centOSButton);

    await screen.findByText(
      'CentOS Stream builds are intended for the development of future versions of RHEL and are not supported for production workloads or other use cases.'
    );
  });
});

describe('Step Upload to AWS', () => {
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
    const uploadAws = await screen.findByTestId('upload-aws');
    user.click(uploadAws);

    await clickNext();

    await screen.findByRole('heading', {
      name: 'Target environment - Amazon Web Services',
    });
  };

  test('clicking Next loads Registration', async () => {
    await setUp();

    await switchToAWSManual();
    const awsAccountId = await screen.findByRole('textbox', {
      name: 'aws account id',
    });
    await waitFor(async () => user.type(awsAccountId, '012345678901'));
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

    await screen.findByTestId('upload-aws');
  });

  test('clicking Cancel loads landing page', async () => {
    await setUp();

    await verifyCancelButton(router);
  });

  test('component renders error state correctly', async () => {
    server.use(
      rest.get(`${PROVISIONING_API}/sources`, (req, res, ctx) =>
        res(ctx.status(500))
      )
    );
    await setUp();
    await screen.findByText(
      /sources cannot be reached, try again later or enter an aws account id manually\./i
    );
  });

  test('validation works', async () => {
    await setUp();
    const nextButton = await getNextButton();

    expect(nextButton).toHaveClass('pf-m-disabled');

    const manualOption = await screen.findByRole('radio', {
      name: /manually enter an account id\./i,
    });
    await waitFor(async () => user.click(manualOption));

    expect(nextButton).toHaveClass('pf-m-disabled');

    const awsAccId = await screen.findByRole('textbox', {
      name: 'aws account id',
    });
    expect(awsAccId).toHaveValue('');
    expect(awsAccId).toBeEnabled();
    await waitFor(() => user.type(awsAccId, '012345678901'));

    expect(nextButton).not.toHaveClass('pf-m-disabled');

    const sourceRadio = await screen.findByRole('radio', {
      name: /use an account configured from sources\./i,
    });

    user.click(sourceRadio);

    await waitFor(() => expect(nextButton).toHaveClass('pf-m-disabled'));

    const sourceDropdown = await getSourceDropdown();
    user.click(sourceDropdown);

    const source = await screen.findByRole('option', {
      name: /my_source/i,
    });
    user.click(source);

    await waitFor(() => expect(nextButton).not.toHaveClass('pf-m-disabled'));
  });

  test('compose request share_with_sources field is correct', async () => {
    await setUp();

    const sourceDropdown = await getSourceDropdown();
    user.click(sourceDropdown);

    const source = await screen.findByRole('option', {
      name: /my_source/i,
    });
    user.click(source);

    await clickNext();

    // registration
    await screen.findByRole('textbox', {
      name: 'Select activation key',
    });

    const registerLaterRadio = await screen.findByLabelText('Register later');
    user.click(registerLaterRadio);

    // click through to review step
    await clickNext();
    await clickNext();
    await clickNext();
    await clickNext();
    await clickNext();
    await clickNext();
    await clickNext();
    await clickNext();
    await enterBlueprintName();
    await clickNext();
    // informational modal pops up in the first test only as it's tied
    // to a 'imageBuilder.saveAndBuildModalSeen' variable in localStorage
    await openAndDismissSaveAndBuildModal();

    const createBlueprintBtn = await screen.findByRole('button', {
      name: /Create blueprint/,
    });

    user.click(createBlueprintBtn);

    // returns back to the landing page
    await waitFor(() =>
      expect(router?.state.location.pathname).toBe('/insights/image-builder')
    );
    // set test timeout of 10 seconds
  }, 10000);
});

describe('Step Upload to Google', () => {
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

    // select gcp as upload destination
    const uploadGcp = await screen.findByTestId('upload-google');

    user.click(uploadGcp);

    await clickNext();

    await screen.findByRole('heading', {
      name: 'Target environment - Google Cloud Platform',
    });
  };

  test('clicking Next loads Registration', async () => {
    await setUp();

    const shareRadioButton = await screen.findByText(
      /share image with a google account/i
    );
    user.click(shareRadioButton);

    const googleEmailInput = await screen.findByTestId('principal');

    await waitFor(() => user.type(googleEmailInput, 'test@test.com'));
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

    await screen.findByTestId('upload-google');
  });

  test('clicking Cancel loads landing page', async () => {
    await setUp();

    await verifyCancelButton(router);
  });

  test('the google account id field is shown and required', async () => {
    await setUp();

    const principalInput = await screen.findByTestId('principal');
    expect(principalInput).toHaveValue('');
    expect(principalInput).toBeEnabled();
  });

  test('the google email field must be a valid email', async () => {
    await setUp();

    await waitFor(async () =>
      user.type(await screen.findByTestId('principal'), 'a')
    );
    expect(await getNextButton()).toHaveClass('pf-m-disabled');
    expect(await getNextButton()).toBeDisabled();
    await waitFor(async () =>
      user.type(await screen.findByTestId('principal'), 'test@test.com')
    );
    expect(await getNextButton()).not.toHaveClass('pf-m-disabled');
    expect(await getNextButton()).toBeEnabled();
  });
});

describe('Step Registration', () => {
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
    const uploadAws = await screen.findByTestId('upload-aws');
    user.click(uploadAws);

    await clickNext();
    const manualOption = await screen.findByRole('radio', {
      name: /manually enter an account id\./i,
    });
    await waitFor(async () => user.click(manualOption));
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
  };

  test('clicking Next loads file system configuration', async () => {
    await setUp();

    const registerLaterRadio = await screen.findByTestId(
      'registration-radio-later'
    );
    user.click(registerLaterRadio);

    await clickNext();
    await clickNext();

    await screen.findByRole('heading', {
      name: 'File system configuration',
    });
  });

  test('clicking Back loads Upload to AWS', async () => {
    await setUp();

    await clickBack();

    const manualOption = await screen.findByRole('radio', {
      name: /manually enter an account id\./i,
    });
    await waitFor(async () => user.click(manualOption));
    await screen.findByText('AWS account ID');
  });

  test('clicking Cancel loads landing page', async () => {
    await setUp();

    await verifyCancelButton(router);
  });

  test('activation key dropdown empty state', async () => {
    server.use(
      rest.get(`${RHSM_API}/activation_keys`, (req, res, ctx) =>
        res(ctx.status(200), ctx.json({ body: [] }))
      )
    );
    await setUp();
    const activationKeyDropdown = await screen.findByRole('textbox', {
      name: 'Select activation key',
    });
    user.click(activationKeyDropdown);
    await screen.findByText('No activation keys found');
  });

  test('should allow registering with rhc', async () => {
    await setUp();

    const activationKeyDropdown = await screen.findByRole('textbox', {
      name: 'Select activation key',
    });
    user.click(activationKeyDropdown);
    const activationKey = await screen.findByRole('option', {
      name: 'name0',
    });
    user.click(activationKey);
    await screen.findByDisplayValue('name0');

    await clickNext();
    await clickNext();
    await clickNext();
    await clickNext();
    await clickNext();
    await clickNext();
    await clickNext();
    await enterBlueprintName();
    await clickNext();
    const review = await screen.findByTestId('review-registration');
    expect(review).toHaveTextContent(
      'Register with Red Hat Subscription Manager (RHSM)'
    );
    expect(review).toHaveTextContent('Connect to Red Hat Insights');
    expect(review).toHaveTextContent(
      'Use remote host configuration (rhc) utility'
    );
    screen.getAllByText('012345678901');
  });

  test('should allow registering without rhc', async () => {
    await setUp();

    const showOptions = await screen.findByTestId(
      'registration-additional-options'
    );

    user.click(showOptions);
    const rhcCheckbox = await screen.findByTestId('registration-checkbox-rhc');
    await waitFor(async () => user.click(rhcCheckbox));

    // going back and forward when rhc isn't selected should keep additional options shown
    await clickBack();
    await screen.findByRole('textbox', {
      name: 'aws account id',
    });
    await clickNext();
    await screen.findByTestId('registration-checkbox-insights');
    await screen.findByTestId('registration-checkbox-rhc');

    const activationKeyDropdown = await screen.findByRole('textbox', {
      name: 'Select activation key',
    });
    user.click(activationKeyDropdown);
    const activationKey = await screen.findByRole('option', {
      name: 'name0',
    });
    user.click(activationKey);
    await screen.findByDisplayValue('name0');

    await clickNext();
    await clickNext();
    await clickNext();
    await clickNext();
    await clickNext();
    await clickNext();
    await clickNext();
    await clickNext();
    await enterBlueprintName();
    await clickNext();
    const review = await screen.findByTestId('review-registration');
    expect(review).toHaveTextContent(
      'Register with Red Hat Subscription Manager (RHSM)'
    );
    expect(review).toHaveTextContent('Connect to Red Hat Insights');
    screen.getAllByText('012345678901');
    expect(review).not.toHaveTextContent(
      'Use remote host configuration (rhc) utility'
    );
  });

  test('should allow registering without insights or rhc', async () => {
    await setUp();

    const showOptions = await screen.findByTestId(
      'registration-additional-options'
    );

    user.click(showOptions);
    const insightsCheckbox = await screen.findByTestId(
      'registration-checkbox-insights'
    );

    user.click(insightsCheckbox);

    // going back and forward when neither rhc or insights is selected should keep additional options shown
    await clickBack();
    await screen.findByRole('textbox', {
      name: 'aws account id',
    });
    await clickNext();
    await screen.findByTestId('registration-checkbox-insights');
    await screen.findByTestId('registration-checkbox-rhc');

    const activationKeyDropdown = await screen.findByRole('textbox', {
      name: 'Select activation key',
    });
    user.click(activationKeyDropdown);
    const activationKey = await screen.findByRole('option', {
      name: 'name0',
    });
    user.click(activationKey);
    await screen.findByDisplayValue('name0');

    await clickNext();
    await clickNext();
    await clickNext();
    await clickNext();
    await clickNext();
    await clickNext();
    await clickNext();
    await enterBlueprintName();
    await clickNext();
    const review = await screen.findByTestId('review-registration');
    expect(review).toHaveTextContent(
      'Register with Red Hat Subscription Manager (RHSM)'
    );
    screen.getAllByText('012345678901');
    expect(review).not.toHaveTextContent('Connect to Red Hat Insights');
    expect(review).not.toHaveTextContent(
      'Use remote host configuration (rhc) utility'
    );
  });

  test('should hide input fields when clicking Register the system later', async () => {
    await setUp();
    const removeKeyInformation = waitForElementToBeRemoved(() => [
      screen.getByTestId('subscription-activation-key'),
    ]);

    // click the later radio button which should remove any input fields
    const manualOption = await screen.findByTestId('registration-radio-later');
    await waitFor(async () => user.click(manualOption));

    await removeKeyInformation;

    await clickNext();
    await clickNext();
    await clickNext();
    await clickNext();
    await clickNext();
    await clickNext();
    await clickNext();
    await clickNext();
    await enterBlueprintName();
    await clickNext();
    await screen.findByText('Register the system later');
  });

  test('registering with rhc implies registering with insights', async () => {
    await setUp();
    const showOptions = await screen.findByTestId(
      'registration-additional-options'
    );

    user.click(showOptions);

    const insightsCheckbox = await screen.findByTestId(
      'registration-checkbox-insights'
    );

    user.click(insightsCheckbox);
    await waitFor(async () =>
      expect(
        await screen.findByTestId('registration-checkbox-rhc')
      ).not.toBeChecked()
    );

    const rhcCheckbox = await screen.findByTestId('registration-checkbox-rhc');
    user.click(rhcCheckbox);

    await waitFor(async () =>
      expect(
        await screen.findByTestId('registration-checkbox-insights')
      ).toBeChecked()
    );
  });
});

describe('Step File system configuration', () => {
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
    const uploadAws = await screen.findByTestId('upload-aws');
    user.click(uploadAws);
    await clickNext();
    // aws step
    await switchToAWSManual();
    await waitFor(() =>
      user.type(
        screen.getByRole('textbox', {
          name: /aws account id/i,
        }),
        '012345678901'
      )
    );
    await clickNext();
    // skip registration
    await screen.findByRole('textbox', {
      name: 'Select activation key',
    });
    const registerLaterRadio = await screen.findByTestId(
      'registration-radio-later'
    );
    user.click(registerLaterRadio);
    await clickNext();
    await clickNext();
  };
  test('Error validation occurs upon clicking next button', async () => {
    await setUp();
    const manuallyConfigurePartitions = await screen.findByText(
      /manually configure partitions/i
    );
    user.click(manuallyConfigurePartitions);
    const addPartition = await screen.findByTestId('file-system-add-partition');
    // Create duplicate partitions
    user.click(addPartition);
    user.click(addPartition);
    // Clicking next causes errors to appear
    await clickNext();
    expect(await getNextButton()).toBeDisabled();
    const mountPointAlerts = screen.getAllByRole('heading', {
      name: /danger alert: duplicate mount point/i,
    });
    const tbody = await screen.findByTestId('file-system-configuration-tbody');
    const rows = within(tbody).getAllByRole('row');
    expect(rows).toHaveLength(3);
    //Change mountpoint of final row to /var, resolving errors
    const mountPointOptions = within(rows[2]).getAllByRole('button', {
      name: 'Options menu',
    })[0];
    user.click(mountPointOptions);
    const varButton = await within(rows[2]).findByRole('option', {
      name: '/var',
    });
    user.click(varButton);
    await waitFor(() => expect(mountPointAlerts[0]).not.toBeInTheDocument());
    await waitFor(() => expect(mountPointAlerts[1]).not.toBeInTheDocument());
    expect(await getNextButton()).toBeEnabled();
  });

  test('Manual partitioning is hidden for ISO targets only', async () => {
    ({ router } = await renderCustomRoutesWithReduxRouter(
      'imagewizard',
      {},
      routes
    ));
    const imageInstallerCheckbox = await screen.findByTestId(
      'checkbox-image-installer'
    );

    user.click(imageInstallerCheckbox);
    await clickFromImageOutputToFsc();
    expect(
      screen.queryByText(/manually configure partitions/i)
    ).not.toBeInTheDocument();
  });

  test('Manual partitioning is shown for ISO target and other target', async () => {
    ({ router } = await renderCustomRoutesWithReduxRouter(
      'imagewizard',
      {},
      routes
    ));
    const imageInstallerCheckbox = await screen.findByTestId(
      'checkbox-image-installer'
    );

    user.click(imageInstallerCheckbox);
    const guestImageCheckBox = await screen.findByTestId(
      'checkbox-guest-image'
    );

    user.click(guestImageCheckBox);
    await clickFromImageOutputToFsc();
    const manualOption = await screen.findByText(
      /manually configure partitions/i
    );

    user.click(manualOption);
    await screen.findByText('Configure partitions');
  });
});

describe('Step Details', () => {
  const user = userEvent.setup();
  const setUp = async () => {
    ({ router } = await renderCustomRoutesWithReduxRouter(
      'imagewizard',
      {},
      routes
    ));

    // select aws as upload destination
    const uploadAws = await screen.findByTestId('upload-aws');
    user.click(uploadAws);
    await clickNext();

    // aws step
    await switchToAWSManual();
    const awsAccountId = await screen.findByRole('textbox', {
      name: 'aws account id',
    });

    await waitFor(() => user.type(awsAccountId, '012345678901'));

    await clickNext();
    // skip registration
    await screen.findByRole('textbox', {
      name: 'Select activation key',
    });

    const registerLaterRadio = screen.getByTestId('registration-radio-later');
    user.click(registerLaterRadio);
    await clickNext();
    // skip oscap
    await clickNext();
    // skip repositories
    await clickNext();
    // skip packages
    await clickNext();
    // skip fsc
    await clickNext();
    // skip snapshot
    await clickNext();
    //skip firstBoot
    await clickNext();
  };

  test('image name invalid for more than 100 chars and description for 250', async () => {
    await setUp();

    // Enter image name
    const invalidName = 'a'.repeat(101);
    await enterBlueprintName(invalidName);
    expect(await getNextButton()).toHaveClass('pf-m-disabled');
    expect(await getNextButton()).toBeDisabled();
    const nameInput = await screen.findByRole('textbox', {
      name: /blueprint name/i,
    });
    await waitFor(() => user.clear(nameInput));

    await enterBlueprintName();

    expect(await getNextButton()).not.toHaveClass('pf-m-disabled');
    expect(await getNextButton()).toBeEnabled();

    // Enter description image
    const descriptionInput = await screen.findByRole('textbox', {
      name: /description/i,
    });

    const invalidDescription = 'a'.repeat(251);
    await waitFor(() => user.type(descriptionInput, invalidDescription));

    expect(await getNextButton()).toHaveClass('pf-m-disabled');
    expect(await getNextButton()).toBeDisabled();
    await waitFor(() => user.clear(descriptionInput));
    await waitFor(() => user.type(descriptionInput, 'valid-description'));

    expect(await getNextButton()).not.toHaveClass('pf-m-disabled');
    expect(await getNextButton()).toBeEnabled();
  }, 50000);
});

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
    const registerLaterRadio = await screen.findByTestId(
      'registration-radio-later'
    );
    await waitFor(() => user.click(registerLaterRadio));

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
    const registerLaterRadio = await screen.findByTestId(
      'registration-radio-later'
    );
    await waitFor(() => user.click(registerLaterRadio));
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
    const registerRadio = await screen.findByTestId('registration-radio-now');
    expect(registerRadio).toHaveFocus();
    await screen.findByRole('textbox', {
      name: 'Select activation key',
    });
    // skip registration
    const registerLaterRadio = await screen.findByTestId(
      'registration-radio-later'
    );
    await waitFor(() => user.click(registerLaterRadio));
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

  test('target environment tiles are keyboard selectable', async () => {
    const testTile = async (tile: HTMLElement) => {
      tile.focus();
      await user.keyboard('{space}');
      expect(tile).toHaveClass('pf-m-selected');
      await user.keyboard('{space}');
      expect(tile).not.toHaveClass('pf-m-selected');
    };

    await setUp();
    await clickNext();

    await waitFor(() => screen.findByTestId('upload-aws'));
    testTile(await screen.findByTestId('upload-aws'));
    testTile(await screen.findByTestId('upload-google'));
    testTile(await screen.findByTestId('upload-azure'));
  });
});
