import '@testing-library/jest-dom';

import {
  act,
  screen,
  waitFor,
  waitForElementToBeRemoved,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import api from '../../../api.js';
import { RHEL_8 } from '../../../constants.js';
import { mockComposesEmpty } from '../../fixtures/composes.js';
import {
  mockPkgResultAlpha,
  mockPkgResultAll,
  mockPkgResultPartial,
} from '../../fixtures/packages.js';
import { renderWithReduxRouter } from '../../testUtils';

let store = undefined;
let router = undefined;

// Mocking getComposes is necessary because in many tests we call navigate()
// to navigate to the images table (via useNavigate hook), which will in turn
// result in a call to getComposes. If it is not mocked, tests fail due to MSW
// being unable to resolve that endpoint.
jest
  .spyOn(api, 'getComposes')
  .mockImplementation(() => Promise.resolve(mockComposesEmpty));

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

function getBackButton() {
  const back = screen.getByRole('button', { name: /Back/ });
  return back;
}

function getNextButton() {
  const next = screen.getByRole('button', { name: /Next/ });
  return next;
}

function getCancelButton() {
  const cancel = screen.getByRole('button', { name: /Cancel/ });
  return cancel;
}

function verifyCancelButton(cancel, router) {
  cancel.click();
  expect(router.state.location.pathname).toBe('/insights/image-builder');
}

const searchForAvailablePackages = async (searchbox, searchTerm) => {
  const user = userEvent.setup();
  await user.type(searchbox, searchTerm);
  await act(async () => {
    screen
      .getByRole('button', { name: /search button for available packages/i })
      .click();
  });
};

const searchForChosenPackages = async (searchbox, searchTerm) => {
  const user = userEvent.setup();
  if (!searchTerm) {
    await user.clear(searchbox);
  } else {
    await user.type(searchbox, searchTerm);
  }
};

beforeAll(() => {
  // scrollTo is not defined in jsdom
  window.HTMLElement.prototype.scrollTo = function () {};
});

afterEach(() => {
  jest.clearAllMocks();
  router = undefined;
});

describe('Create Image Wizard', () => {
  test('renders component', () => {
    renderWithReduxRouter('imagewizard', {});
    // check heading
    screen.getByRole('heading', { name: /Create image/ });

    screen.getByRole('button', { name: 'Image output' });
    screen.getByRole('button', { name: 'Register' });
    screen.getByRole('button', { name: 'File system configuration' });
    screen.getByRole('button', { name: 'Content' });
    screen.getByRole('button', { name: 'Additional Red Hat packages' });
    screen.getByRole('button', { name: 'Name image' });
    screen.getByRole('button', { name: 'Review' });
  });
});

describe('Step Image output', () => {
  const user = userEvent.setup();
  const setUp = () => {
    ({ router } = renderWithReduxRouter('imagewizard', {}));

    const imageOutputLink = screen.getByRole('button', {
      name: 'Image output',
    });

    // select aws as upload destination
    const awsTile = screen.getByTestId('upload-aws');
    awsTile.click();

    // load from sidebar
    imageOutputLink.click();
  };

  test('clicking Next loads Upload to AWS', () => {
    setUp();

    getNextButton().click();

    screen.getByText('AWS account ID');
  });

  test('clicking Cancel loads landing page', () => {
    setUp();

    const cancel = getCancelButton();
    verifyCancelButton(cancel, router);
  });

  test('target environment is required', () => {
    setUp();

    const destination = screen.getByTestId('target-select');
    const required = within(destination).getByText('*');
    expect(destination).toBeEnabled();
    expect(destination).toContainElement(required);
  });

  test('selecting and deselecting a tile disables the next button', () => {
    setUp();

    const awsTile = screen.getByTestId('upload-aws');
    // this has already been clicked once in the setup function
    awsTile.click(); // deselect

    const googleTile = screen.getByTestId('upload-google');
    googleTile.click(); // select
    googleTile.click(); // deselect

    const azureTile = screen.getByTestId('upload-azure');
    azureTile.click(); // select
    azureTile.click(); // deselect

    expect(getNextButton()).toBeDisabled();
  });

  test('expect only RHEL releases before expansion', async () => {
    setUp();

    const releaseMenu = screen.getByRole('button', {
      name: /options menu/i,
    });
    await user.click(releaseMenu);

    await screen.findByRole('option', {
      name: 'Red Hat Enterprise Linux (RHEL) 8',
    });
    await screen.findByRole('option', {
      name: 'Red Hat Enterprise Linux (RHEL) 9',
    });
    await screen.findByRole('button', {
      name: 'Show options for further development of RHEL',
    });

    await user.click(releaseMenu);
  });

  test('expect all releases after expansion', async () => {
    setUp();

    const releaseMenu = screen.getByRole('button', {
      name: /options menu/i,
    });
    await user.click(releaseMenu);

    const showOptionsButton = screen.getByRole('button', {
      name: 'Show options for further development of RHEL',
    });
    await user.click(showOptionsButton);

    await screen.findByRole('option', {
      name: 'Red Hat Enterprise Linux (RHEL) 8',
    });
    await screen.findByRole('option', {
      name: 'Red Hat Enterprise Linux (RHEL) 9',
    });
    await screen.findByRole('option', {
      name: 'CentOS Stream 8',
    });
    await screen.findByRole('option', {
      name: 'CentOS Stream 9',
    });

    expect(showOptionsButton).not.toBeInTheDocument();

    await user.click(releaseMenu);
  });

  test('CentOS acknowledgement appears', async () => {
    setUp();

    const releaseMenu = screen.getByRole('button', {
      name: /options menu/i,
    });
    await user.click(releaseMenu);

    const showOptionsButton = screen.getByRole('button', {
      name: 'Show options for further development of RHEL',
    });
    await user.click(showOptionsButton);

    const centOSButton = screen.getByRole('option', {
      name: 'CentOS Stream 9',
    });
    await user.click(centOSButton);

    await screen.findByText(
      'CentOS Stream builds are intended for the development of future versions of RHEL and are not supported for production workloads or other use cases.'
    );
  });
});

describe('Step Upload to AWS', () => {
  const user = userEvent.setup();
  const setUp = () => {
    ({ router } = renderWithReduxRouter('imagewizard', {}));

    // select aws as upload destination
    const awsTile = screen.getByTestId('upload-aws');
    awsTile.click();

    getNextButton().click();

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Target environment - Amazon Web Services'
    );
  };

  test('clicking Next loads Registration', async () => {
    setUp();

    await user.type(screen.getByTestId('aws-account-id'), '012345678901');
    getNextButton().click();

    await screen.findByRole('textbox', {
      name: 'Select activation key',
    });

    screen.getByText('Automatically register and enable advanced capabilities');
  });

  test('clicking Back loads Release', () => {
    setUp();

    getBackButton().click();

    screen.getByTestId('upload-aws');
  });

  test('clicking Cancel loads landing page', () => {
    setUp();

    const cancel = getCancelButton();
    verifyCancelButton(cancel, router);
  });

  test('the aws account id fieldis shown and required', () => {
    setUp();

    const accessKeyId = screen.getByTestId('aws-account-id');
    expect(accessKeyId).toHaveValue('');
    expect(accessKeyId).toBeEnabled();
    // expect(accessKeyId).toBeRequired(); // DDf does not support required value
  });
});

describe('Step Upload to Google', () => {
  const user = userEvent.setup();
  const setUp = () => {
    ({ router } = renderWithReduxRouter('imagewizard', {}));

    // select aws as upload destination
    const awsTile = screen.getByTestId('upload-google');
    awsTile.click();

    getNextButton().click();

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Target environment - Google Cloud Platform'
    );
  };

  test('clicking Next loads Registration', async () => {
    setUp();

    await user.type(screen.getByTestId('input-google-email'), 'test@test.com');
    getNextButton().click();

    await screen.findByRole('textbox', {
      name: 'Select activation key',
    });

    screen.getByText('Automatically register and enable advanced capabilities');
  });

  test('clicking Back loads Release', () => {
    setUp();

    getBackButton().click();

    screen.getByTestId('upload-google');
  });

  test('clicking Cancel loads landing page', () => {
    setUp();

    const cancel = getCancelButton();
    verifyCancelButton(cancel, router);
  });

  test('the google account id field is shown and required', () => {
    setUp();

    const accessKeyId = screen.getByTestId('input-google-email');
    expect(accessKeyId).toHaveValue('');
    expect(accessKeyId).toBeEnabled();
    // expect(accessKeyId).toBeRequired(); // DDf does not support required value
  });

  test('the google email field must be a valid email', async () => {
    setUp();

    await user.type(screen.getByTestId('input-google-email'), 'a');
    expect(getNextButton()).toHaveClass('pf-m-disabled');
    expect(getNextButton()).toBeDisabled();
    await user.type(screen.getByTestId('input-google-email'), 'test@test.com');
    expect(getNextButton()).not.toHaveClass('pf-m-disabled');
    expect(getNextButton()).toBeEnabled();
  });
});

describe('Step Upload to Azure', () => {
  const user = userEvent.setup();
  const setUp = () => {
    ({ router } = renderWithReduxRouter('imagewizard', {}));

    // select aws as upload destination
    const awsTile = screen.getByTestId('upload-azure');
    awsTile.click();
    getNextButton().click();

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Target environment - Microsoft Azure'
    );
  };

  test('clicking Next loads Registration', async () => {
    setUp();
    // Randomly generated GUID
    await user.type(
      screen.getByTestId('azure-tenant-id'),
      'b8f86d22-4371-46ce-95e7-65c415f3b1e2'
    );
    await user.type(
      screen.getByTestId('azure-subscription-id'),
      '60631143-a7dc-4d15-988b-ba83f3c99711'
    );
    await user.type(
      screen.getByTestId('azure-resource-group'),
      'testResourceGroup'
    );

    getNextButton().click();

    await screen.findByRole('textbox', {
      name: 'Select activation key',
    });

    screen.getByText('Automatically register and enable advanced capabilities');
  });

  test('clicking Back loads Release', () => {
    setUp();

    getBackButton().click();

    screen.getByTestId('upload-azure');
  });

  test('clicking Cancel loads landing page', () => {
    setUp();

    const cancel = getCancelButton();
    verifyCancelButton(cancel, router);
  });

  test('the azure upload fields are shown and required', () => {
    setUp();

    const tenantId = screen.getByTestId('azure-tenant-id');
    expect(tenantId).toHaveValue('');
    expect(tenantId).toBeEnabled();
    // expect(tenantId).toBeRequired(); // DDf does not support required value

    const subscription = screen.getByTestId('azure-subscription-id');
    expect(subscription).toHaveValue('');
    expect(subscription).toBeEnabled();
    // expect(subscription).toBeRequired(); // DDf does not support required value

    const resourceGroup = screen.getByTestId('azure-resource-group');
    expect(resourceGroup).toHaveValue('');
    expect(resourceGroup).toBeEnabled();
    // expect(resourceGroup).toBeRequired(); // DDf does not support required value
  });
});

describe('Step Registration', () => {
  const user = userEvent.setup();
  const setUp = async () => {
    ({ router } = renderWithReduxRouter('imagewizard', {}));

    // select aws as upload destination
    const awsTile = screen.getByTestId('upload-aws');
    awsTile.click();

    getNextButton().click();
    await user.type(screen.getByTestId('aws-account-id'), '012345678901');

    getNextButton().click();

    await screen.findByRole('textbox', {
      name: 'Select activation key',
    });
  };

  test('clicking Next loads file system configuration', async () => {
    await setUp();

    const registerLaterRadio = screen.getByTestId('registration-radio-later');
    await user.click(registerLaterRadio);

    getNextButton().click();

    screen.getByRole('heading', { name: /file system configuration/i });
  });

  test('clicking Back loads Upload to AWS', async () => {
    await setUp();

    getBackButton().click();

    screen.getByText('AWS account ID');
  });

  test('clicking Cancel loads landing page', async () => {
    await setUp();

    const cancel = getCancelButton();
    verifyCancelButton(cancel, router);
  });

  test('should allow registering with rhc', async () => {
    await setUp();

    const activationKeyDropdown = await screen.findByRole('textbox', {
      name: 'Select activation key',
    });
    await user.click(activationKeyDropdown);
    const activationKey = await screen.findByRole('option', {
      name: 'name0',
    });
    await user.click(activationKey);
    screen.getByDisplayValue('name0');

    screen.getByRole('button', { name: /Next/ }).click();
    screen.getByRole('button', { name: /Next/ }).click();
    screen.getByRole('button', { name: /Next/ }).click();
    screen.getByRole('button', { name: /Next/ }).click();
    const review = screen.getByTestId('review-registration');
    expect(review).toHaveTextContent(
      'Register with Red Hat Subscription Manager (RHSM)'
    );
    expect(review).toHaveTextContent('Connect to Red Hat Insights');
    expect(review).toHaveTextContent(
      'Use remote host configuration (RHC) utility'
    );
    screen.getAllByText('012345678901');
  });

  test('should allow registering without rhc', async () => {
    await setUp();

    await user.click(screen.getByTestId('registration-additional-options'));
    await user.click(screen.getByTestId('registration-checkbox-rhc'));

    // going back and forward when rhc isn't selected should keep additional options shown
    screen.getByRole('button', { name: /Back/ }).click();
    await screen.findByTestId('aws-account-id');
    screen.getByRole('button', { name: /Next/ }).click();
    screen.getByTestId('registration-checkbox-insights');
    screen.getByTestId('registration-checkbox-rhc');

    const activationKeyDropdown = await screen.findByRole('textbox', {
      name: 'Select activation key',
    });
    await user.click(activationKeyDropdown);
    const activationKey = await screen.findByRole('option', {
      name: 'name0',
    });
    await user.click(activationKey);
    screen.getByDisplayValue('name0');

    screen.getByRole('button', { name: /Next/ }).click();
    screen.getByRole('button', { name: /Next/ }).click();
    screen.getByRole('button', { name: /Next/ }).click();
    screen.getByRole('button', { name: /Next/ }).click();
    const review = screen.getByTestId('review-registration');
    expect(review).toHaveTextContent(
      'Register with Red Hat Subscription Manager (RHSM)'
    );
    expect(review).toHaveTextContent('Connect to Red Hat Insights');
    screen.getAllByText('012345678901');
    expect(review).not.toHaveTextContent(
      'Use remote host configuration (RHC) utility'
    );
  });

  test('should allow registering without insights or rhc', async () => {
    await setUp();

    await user.click(screen.getByTestId('registration-additional-options'));
    await user.click(screen.getByTestId('registration-checkbox-insights'));

    // going back and forward when neither rhc or insights is selected should keep additional options shown
    screen.getByRole('button', { name: /Back/ }).click();
    await screen.findByTestId('aws-account-id');
    screen.getByRole('button', { name: /Next/ }).click();
    screen.getByTestId('registration-checkbox-insights');
    screen.getByTestId('registration-checkbox-rhc');

    const activationKeyDropdown = await screen.findByRole('textbox', {
      name: 'Select activation key',
    });
    await user.click(activationKeyDropdown);
    const activationKey = await screen.findByRole('option', {
      name: 'name0',
    });
    await user.click(activationKey);
    screen.getByDisplayValue('name0');

    screen.getByRole('button', { name: /Next/ }).click();
    screen.getByRole('button', { name: /Next/ }).click();
    screen.getByRole('button', { name: /Next/ }).click();
    screen.getByRole('button', { name: /Next/ }).click();
    screen.getByTestId('registration-expandable').click();
    const review = screen.getByTestId('review-registration');
    expect(review).toHaveTextContent(
      'Register with Red Hat Subscription Manager (RHSM)'
    );
    screen.getAllByText('012345678901');
    expect(review).not.toHaveTextContent('Connect to Red Hat Insights');
    expect(review).not.toHaveTextContent(
      'Use remote host configuration (RHC) utility'
    );
  });

  test('should hide input fields when clicking Register the system later', async () => {
    await setUp();
    const p1 = waitForElementToBeRemoved(() => [
      screen.getByTestId('subscription-activation-key'),
    ]);

    // click the later radio button which should remove any input fields
    screen.getByTestId('registration-radio-later').click();

    await p1;

    screen.getByRole('button', { name: /Next/ }).click();
    screen.getByRole('button', { name: /Next/ }).click();
    screen.getByRole('button', { name: /Next/ }).click();
    screen.getByRole('button', { name: /Next/ }).click();
    screen.getByText('Register the system later');
  });

  test('registering with rhc implies registering with insights', async () => {
    await setUp();
    await user.click(screen.getByTestId('registration-additional-options'));

    await user.click(screen.getByTestId('registration-checkbox-insights'));
    expect(screen.getByTestId('registration-checkbox-rhc')).not.toBeChecked();

    await user.click(screen.getByTestId('registration-checkbox-rhc'));
    expect(screen.getByTestId('registration-checkbox-insights')).toBeChecked();
  });
});

describe('Step File system configuration', () => {
  const user = userEvent.setup();
  const setUp = async () => {
    ({ router } = renderWithReduxRouter('imagewizard', {}));

    // select aws as upload destination
    const awsTile = screen.getByTestId('upload-aws');
    awsTile.click();
    getNextButton().click();

    // aws step
    await user.type(screen.getByTestId('aws-account-id'), '012345678901');
    getNextButton().click();
    // skip registration
    await screen.findByRole('textbox', {
      name: 'Select activation key',
    });

    const registerLaterRadio = screen.getByTestId('registration-radio-later');
    await user.click(registerLaterRadio);
    getNextButton().click();
  };

  test('Error validation occurs upon clicking next button', async () => {
    await setUp();

    const nextButton = getNextButton();

    const manuallyConfigurePartitions = screen.getByText(
      /manually configure partitions/i
    );
    manuallyConfigurePartitions.click();

    const addPartition = await screen.findByTestId('file-system-add-partition');

    // Create duplicate partitions
    addPartition.click();
    addPartition.click();

    expect(nextButton).toBeEnabled();

    // Clicking next causes errors to appear
    nextButton.click();

    const mountPointWarning = screen.getByRole('heading', {
      name: /danger alert: duplicate mount points: all mount points must be unique\. remove the duplicate or choose a new mount point\./i,
      hidden: true,
    });

    const mountPointAlerts = screen.getAllByRole('heading', {
      name: /danger alert: duplicate mount point\./i,
    });

    const tbody = screen.getByTestId('file-system-configuration-tbody');
    const rows = within(tbody).getAllByRole('row');
    expect(rows).toHaveLength(3);

    // Change mountpoint of final row to /var, resolving errors
    within(rows[2]).getAllByRole('button', { name: 'Options menu' })[0].click();
    within(rows[2]).getByRole('option', { name: '/var' }).click();

    await waitFor(() => expect(mountPointWarning).not.toBeInTheDocument());
    await waitFor(() => expect(mountPointAlerts[0]).not.toBeInTheDocument());
    await waitFor(() => expect(mountPointAlerts[1]).not.toBeInTheDocument());
    await waitFor(() => expect(nextButton).toBeEnabled());
  });
});

describe('Step Packages', () => {
  const user = userEvent.setup();
  const setUp = async () => {
    ({ router } = renderWithReduxRouter('imagewizard', {}));

    // select aws as upload destination
    const awsTile = screen.getByTestId('upload-aws');
    awsTile.click();
    getNextButton().click();

    // aws step
    await user.type(screen.getByTestId('aws-account-id'), '012345678901');
    getNextButton().click();
    // skip registration
    await screen.findByRole('textbox', {
      name: 'Select activation key',
    });

    const registerLaterRadio = screen.getByTestId('registration-radio-later');
    await user.click(registerLaterRadio);
    getNextButton().click();

    // skip fsc
    getNextButton().click();
  };

  test('clicking Next loads Image name', async () => {
    await setUp();

    getNextButton().click();

    screen.getByRole('heading', {
      name: 'Name image',
    });
  });

  test('clicking Back loads file system configuration', async () => {
    await setUp();

    const back = screen.getByRole('button', { name: /Back/ });
    back.click();

    screen.getByRole('heading', { name: /file system configuration/i });
  });

  test('clicking Cancel loads landing page', async () => {
    await setUp();

    const cancel = getCancelButton();
    verifyCancelButton(cancel, router);
  });

  test('should display search bar and button', async () => {
    await setUp();

    await user.type(screen.getByTestId('search-available-pkgs-input'), 'test');

    screen.getByRole('button', {
      name: 'Search button for available packages',
    });
  });

  test('should display default state', async () => {
    await setUp();

    screen.getByText('Search above to add additionalpackages to your image');
    screen.getByText('No packages added');
  });

  test('search results should be sorted with most relevant results first', async () => {
    await setUp();

    const searchbox = screen.getAllByRole('textbox')[0]; // searching by id doesn't update the input ref

    expect(searchbox).toBeDisabled();
    await waitFor(() => expect(searchbox).toBeEnabled());
    searchbox.click();

    await searchForAvailablePackages(searchbox, 'test');

    const availablePackagesList = screen.getByTestId('available-pkgs-list');
    const availablePackagesItems = within(availablePackagesList).getAllByRole(
      'option'
    );
    expect(availablePackagesItems).toHaveLength(3);
    const [firstItem, secondItem, thirdItem] = availablePackagesItems;
    expect(firstItem).toHaveTextContent('testsummary for test package');
    expect(secondItem).toHaveTextContent('testPkgtest package summary');
    expect(thirdItem).toHaveTextContent('lib-testlib-test package summary');
  });

  test('search results should be sorted after selecting them and then deselecting them', async () => {
    await setUp();

    const searchbox = screen.getAllByRole('textbox')[0]; // searching by id doesn't update the input ref

    expect(searchbox).toBeDisabled();
    await waitFor(() => expect(searchbox).toBeEnabled());
    searchbox.click();

    await searchForAvailablePackages(searchbox, 'test');

    screen.getByTestId('available-pkgs-testPkg').click();
    screen.getByRole('button', { name: /Add selected/ }).click();

    screen.getByTestId('selected-pkgs-testPkg').click();
    screen.getByRole('button', { name: /Remove selected/ }).click();

    const availablePackagesList = screen.getByTestId('available-pkgs-list');
    const availablePackagesItems = within(availablePackagesList).getAllByRole(
      'option'
    );
    expect(availablePackagesItems).toHaveLength(3);
    const [firstItem, secondItem, thirdItem] = availablePackagesItems;
    expect(firstItem).toHaveTextContent('testsummary for test package');
    expect(secondItem).toHaveTextContent('testPkgtest package summary');
    expect(thirdItem).toHaveTextContent('lib-testlib-test package summary');
  });

  test('search results should be sorted after adding and then removing all packages', async () => {
    await setUp();

    const searchbox = screen.getAllByRole('textbox')[0]; // searching by id doesn't update the input ref

    expect(searchbox).toBeDisabled();
    await waitFor(() => expect(searchbox).toBeEnabled());
    searchbox.click();

    await searchForAvailablePackages(searchbox, 'test');

    screen.getByRole('button', { name: /Add all/ }).click();
    screen.getByRole('button', { name: /Remove all/ }).click();

    const availablePackagesList = screen.getByTestId('available-pkgs-list');
    const availablePackagesItems = within(availablePackagesList).getAllByRole(
      'option'
    );
    expect(availablePackagesItems).toHaveLength(3);
    const [firstItem, secondItem, thirdItem] = availablePackagesItems;
    expect(firstItem).toHaveTextContent('testsummary for test package');
    expect(secondItem).toHaveTextContent('testPkgtest package summary');
    expect(thirdItem).toHaveTextContent('lib-testlib-test package summary');
  });

  test('removing a single package updates the state correctly', async () => {
    await setUp();

    const searchbox = screen.getAllByRole('textbox')[0]; // searching by id doesn't update the input ref

    expect(searchbox).toBeDisabled();
    await waitFor(() => expect(searchbox).toBeEnabled());
    searchbox.click();

    await searchForAvailablePackages(searchbox, 'test');
    screen.getByRole('button', { name: /Add all/ }).click();

    // remove a single package
    screen.getByTestId('selected-pkgs-lib-test').click();
    screen.getByRole('button', { name: /Remove selected/ }).click();

    // skip name page
    screen.getByRole('button', { name: /Next/ }).click();

    // review page
    screen.getByRole('button', { name: /Next/ }).click();

    // await screen.findByTestId('chosen-packages-count');
    let chosen = await screen.findByTestId('chosen-packages-count');
    expect(chosen).toHaveTextContent('2');

    // remove another package
    screen.getByRole('button', { name: /Back/ }).click();
    screen.getByRole('button', { name: /Back/ }).click();
    await screen.findByTestId('search-available-pkgs-input');
    screen.getByRole('option', { name: /summary for test package/ }).click();
    screen.getByRole('button', { name: /Remove selected/ }).click();

    // review page
    screen.getByRole('button', { name: /Next/ }).click();
    screen.getByRole('button', { name: /Next/ }).click();

    // await screen.findByTestId('chosen-packages-count');
    chosen = await screen.findByTestId('chosen-packages-count');
    expect(chosen).toHaveTextContent('1');
  });

  test('should display empty available state on failed search', async () => {
    await setUp();

    const searchbox = screen.getAllByRole('textbox')[0]; // searching by id doesn't update the input ref

    expect(searchbox).toBeDisabled();
    await waitFor(() => expect(searchbox).toBeEnabled());
    searchbox.click();

    await searchForAvailablePackages(searchbox, 'asdf');
    screen.getByText('No results found');
  });

  test('should display empty available state on failed search after a successful search', async () => {
    await setUp();

    const searchbox = screen.getAllByRole('textbox')[0]; // searching by id doesn't update the input ref

    expect(searchbox).toBeDisabled();
    await waitFor(() => expect(searchbox).toBeEnabled());
    searchbox.click();

    await searchForAvailablePackages(searchbox, 'test');

    screen
      .getByRole('button', { name: /clear available packages search/i })
      .click();

    await searchForAvailablePackages(searchbox, 'asdf');

    screen.getByText('No results found');
  });

  test('should display empty chosen state on failed search', async () => {
    await setUp();

    const searchboxAvailable = screen.getAllByRole('textbox')[0]; // searching by id doesn't update the input ref
    const searchboxChosen = screen.getAllByRole('textbox')[1];

    expect(searchboxAvailable).toBeDisabled();
    await waitFor(() => expect(searchboxAvailable).toBeEnabled());
    searchboxAvailable.click();
    await searchForAvailablePackages(searchboxAvailable, 'test');

    screen.getByRole('button', { name: /Add all/ }).click();

    searchboxChosen.click();
    await user.type(searchboxChosen, 'asdf');

    expect(screen.getAllByText('No packages found').length === 2);
    // We need to clear this input in order to not have sideeffects on other tests
    await searchForChosenPackages(searchboxChosen, '');
  });

  test('should display warning when over hundred results were found', async () => {
    await setUp();

    const searchbox = screen.getAllByRole('textbox')[0]; // searching by id doesn't update the input ref

    expect(searchbox).toBeDisabled();
    await waitFor(() => expect(searchbox).toBeEnabled());
    searchbox.click();

    const getPackages = jest
      .spyOn(api, 'getPackages')
      .mockImplementation((distribution, architecture, search, limit) => {
        return limit
          ? Promise.resolve(mockPkgResultAll)
          : Promise.resolve(mockPkgResultPartial);
      });

    await searchForAvailablePackages(searchbox, 'testPkg');
    expect(getPackages).toHaveBeenCalledTimes(2);

    screen.getByText('Over 100 results found. Refine your search.');
    screen.getByText('Too many results to display');
  });

  test('should display an exact match if found regardless of too many results', async () => {
    await setUp();

    const searchbox = screen.getAllByRole('textbox')[0]; // searching by id doesn't update the input ref

    expect(searchbox).toBeDisabled();
    await waitFor(() => expect(searchbox).toBeEnabled());
    searchbox.click();

    const getPackages = jest
      .spyOn(api, 'getPackages')
      .mockImplementation((distribution, architecture, search, limit) => {
        return limit
          ? Promise.resolve(mockPkgResultAll)
          : Promise.resolve(mockPkgResultPartial);
      });

    await searchForAvailablePackages(searchbox, 'testPkg-128');
    expect(getPackages).toHaveBeenCalledTimes(2);

    const availablePackagesList = screen.getByTestId('available-pkgs-list');
    const availablePackagesItems = within(availablePackagesList).getByRole(
      'option'
    );
    expect(availablePackagesItems).toBeInTheDocument();
    screen.getByText('Exact match');
    screen.getByText('testPkg-128');
    screen.getByText('Too many results to display');
  });

  test('search results should be sorted alphabetically', async () => {
    await setUp();

    const searchbox = screen.getAllByRole('textbox')[0]; // searching by id doesn't update the input ref

    expect(searchbox).toBeDisabled();
    await waitFor(() => expect(searchbox).toBeEnabled());
    searchbox.click();

    const getPackages = jest
      .spyOn(api, 'getPackages')
      .mockImplementation(() => Promise.resolve(mockPkgResultAlpha));

    await searchForAvailablePackages(searchbox, 'test');
    expect(getPackages).toHaveBeenCalledTimes(1);

    const availablePackagesList = screen.getByTestId('available-pkgs-list');
    const availablePackagesItems = within(availablePackagesList).getAllByRole(
      'option'
    );
    expect(availablePackagesItems).toHaveLength(3);

    const [firstItem, secondItem, thirdItem] = availablePackagesItems;
    expect(firstItem).toHaveTextContent('testsummary for test package');
    expect(secondItem).toHaveTextContent('lib-testlib-test package summary');
    expect(thirdItem).toHaveTextContent('Z-testZ-test package summary');
  });

  test('available packages can be reset', async () => {
    await setUp();

    const searchbox = screen.getAllByRole('textbox')[0];

    expect(searchbox).toBeDisabled();
    await waitFor(() => expect(searchbox).toBeEnabled());
    searchbox.click();

    await searchForAvailablePackages(searchbox, 'test');

    const availablePackagesList = screen.getByTestId('available-pkgs-list');
    const availablePackagesItems = within(availablePackagesList).getAllByRole(
      'option'
    );
    expect(availablePackagesItems).toHaveLength(3);

    screen
      .getByRole('button', { name: /clear available packages search/i })
      .click();

    screen.getByText('Search above to add additionalpackages to your image');
  });

  test('chosen packages can be reset after filtering', async () => {
    await setUp();

    const availableSearchbox = screen.getAllByRole('textbox')[0];

    expect(availableSearchbox).toBeDisabled();
    await waitFor(() => expect(availableSearchbox).toBeEnabled());
    availableSearchbox.click();

    await searchForAvailablePackages(availableSearchbox, 'test');

    const availablePackagesList = screen.getByTestId('available-pkgs-list');
    const availablePackagesItems = within(availablePackagesList).getAllByRole(
      'option'
    );
    expect(availablePackagesItems).toHaveLength(3);

    screen.getByRole('button', { name: /Add all/ }).click();

    const chosenPackagesList = screen.getByTestId('chosen-pkgs-list');
    let chosenPackagesItems = within(chosenPackagesList).getAllByRole('option');
    expect(chosenPackagesItems).toHaveLength(3);

    const chosenSearchbox = screen.getAllByRole('textbox')[1];
    chosenSearchbox.click();
    await searchForChosenPackages(chosenSearchbox, 'lib');
    chosenPackagesItems = await within(chosenPackagesList).findAllByRole(
      'option'
    );
    // eslint-disable-next-line jest-dom/prefer-in-document
    expect(chosenPackagesItems).toHaveLength(1);

    screen
      .getByRole('button', { name: /clear chosen packages search/i })
      .click();
    chosenPackagesItems = within(chosenPackagesList).getAllByRole('option');
    expect(chosenPackagesItems).toHaveLength(3);
  });
});

describe('Step Details', () => {
  const user = userEvent.setup();
  const setUp = async () => {
    ({ router } = renderWithReduxRouter('imagewizard', {}));

    // select aws as upload destination
    const awsTile = screen.getByTestId('upload-aws');
    awsTile.click();
    getNextButton().click();

    // aws step
    await user.type(screen.getByTestId('aws-account-id'), '012345678901');
    getNextButton().click();
    // skip registration
    await screen.findByRole('textbox', {
      name: 'Select activation key',
    });

    const registerLaterRadio = screen.getByTestId('registration-radio-later');
    await user.click(registerLaterRadio);
    getNextButton().click();

    // skip fsc
    getNextButton().click();
    // skip packages
    getNextButton().click();
  };

  test('image name invalid for more than 100 chars', async () => {
    await setUp();

    // Enter image name
    const nameInput = screen.getByRole('textbox', {
      name: 'Image name',
    });
    // 101 character name
    const invalidName = 'a'.repeat(101);
    await user.type(nameInput, invalidName);
    expect(getNextButton()).toHaveClass('pf-m-disabled');
    expect(getNextButton()).toBeDisabled();
    await user.clear(nameInput);
    await user.type(nameInput, 'validName');
    expect(getNextButton()).not.toHaveClass('pf-m-disabled');
    expect(getNextButton()).toBeEnabled();
  });
});

describe('Step Review', () => {
  const user = userEvent.setup();
  const setUp = async () => {
    ({ router } = renderWithReduxRouter('imagewizard', {}));

    // select aws as upload destination
    const awsTile = screen.getByTestId('upload-aws');
    awsTile.click();
    getNextButton().click();

    // aws step
    await user.type(screen.getByTestId('aws-account-id'), '012345678901');
    getNextButton().click();

    await screen.findByRole('textbox', {
      name: 'Select activation key',
    });

    // skip registration
    const registerLaterRadio = screen.getByTestId('registration-radio-later');
    await user.click(registerLaterRadio);
    getNextButton().click();

    // skip fsc
    getNextButton().click();

    // skip packages
    getNextButton().click();
    // skip name
    getNextButton().click();
  };

  // eslint-disable-next-line no-unused-vars
  const setUpCentOS = async () => {
    ({ router } = renderWithReduxRouter('imagewizard', {}));

    const releaseMenu = screen.getByRole('button', {
      name: /options menu/i,
    });
    await user.click(releaseMenu);

    const showOptionsButton = screen.getByRole('button', {
      name: 'Show options for further development of RHEL',
    });
    await user.click(showOptionsButton);

    const centos = screen.getByRole('option', {
      name: 'CentOS Stream 8',
    });
    await user.click(centos);

    // select aws as upload destination
    const awsTile = screen.getByTestId('upload-aws');
    awsTile.click();
    await user.click(getNextButton());

    // aws step
    await user.type(screen.getByTestId('aws-account-id'), '012345678901');
    await user.click(getNextButton());

    // skip fsc
    await user.click(getNextButton());

    // skip packages
    await user.click(getNextButton());
    // skip name
    await user.click(getNextButton());
  };

  test('has 3 buttons', async () => {
    await setUp();

    screen.getByRole('button', { name: /Create/ });
    screen.getByRole('button', { name: /Back/ });
    screen.getByRole('button', { name: /Cancel/ });
  });

  test('clicking Back loads Image name', async () => {
    await setUp();

    const back = screen.getByRole('button', { name: /Back/ });
    back.click();

    screen.getByRole('heading', {
      name: 'Name image',
    });
  });

  test('clicking Cancel loads landing page', async () => {
    await setUp();

    const cancel = screen.getByRole('button', { name: /Cancel/ });
    verifyCancelButton(cancel, router);
  });

  test('has Registration expandable section for rhel', async () => {
    await setUp();

    const targetExpandable = screen.getByTestId(
      'target-environments-expandable'
    );
    const registrationExpandable = screen.getByTestId(
      'registration-expandable'
    );
    const contentExpandable = screen.getByTestId('content-expandable');
    const fscExpandable = screen.getByTestId(
      'file-system-configuration-expandable'
    );

    await user.click(targetExpandable);
    screen.getByText('AWS');
    await user.click(registrationExpandable);
    screen.getByText('Register the system later');
    await user.click(contentExpandable);
    screen.getByText('Additional Red Hatand 3rd party packages');
    await user.click(fscExpandable);
    screen.getByText('Configuration type');
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

    await user.click(targetExpandable);
    screen.getByText('AWS');
    await user.click(contentExpandable);
    screen.getByText('Additional Red Hatand 3rd party packages');
    await user.click(fscExpandable);
    screen.getByText('Configuration type');
  });
});

describe('Click through all steps', () => {
  const user = userEvent.setup();
  const setUp = async () => {
    ({ router, store } = renderWithReduxRouter('imagewizard', {}));
  };

  test('with valid values', async () => {
    await setUp();

    // select image output
    const releaseMenu = screen.getByRole('button', {
      name: /options menu/i,
    });
    await user.click(releaseMenu);
    const releaseOption = screen.getByRole('option', {
      name: 'Red Hat Enterprise Linux (RHEL) 8',
    });
    await user.click(releaseOption);

    await user.click(screen.getByTestId('upload-aws'));
    await user.click(screen.getByTestId('upload-azure'));
    await user.click(screen.getByTestId('upload-google'));
    await user.click(screen.getByTestId('checkbox-vmware'));
    await user.click(screen.getByTestId('checkbox-guest-image'));
    await user.click(screen.getByTestId('checkbox-image-installer'));

    screen.getByRole('button', { name: /Next/ }).click();
    await user.type(screen.getByTestId('aws-account-id'), '012345678901');
    screen.getByRole('button', { name: /Next/ }).click();

    await user.type(screen.getByTestId('input-google-email'), 'test@test.com');
    screen.getByRole('button', { name: /Next/ }).click();

    // Randomly generated GUID
    await user.type(
      screen.getByTestId('azure-tenant-id'),
      'b8f86d22-4371-46ce-95e7-65c415f3b1e2'
    );
    await user.type(
      screen.getByTestId('azure-subscription-id'),
      '60631143-a7dc-4d15-988b-ba83f3c99711'
    );
    await user.type(
      screen.getByTestId('azure-resource-group'),
      'testResourceGroup'
    );
    screen.getByRole('button', { name: /Next/ }).click();

    // registration
    const registrationRadio = screen.getByTestId('registration-radio-now');
    await user.click(registrationRadio);

    const activationKeyDropdown = await screen.findByRole('textbox', {
      name: 'Select activation key',
    });
    await user.click(activationKeyDropdown);
    const activationKey = await screen.findByRole('option', {
      name: 'name0',
    });
    await user.click(activationKey);
    screen.getByDisplayValue('name0');

    getNextButton().click();

    // fsc
    screen.getByRole('heading', {
      name: /file system configuration/i,
    });
    screen.getByTestId('file-system-config-radio-manual').click();
    const ap = await screen.findByTestId('file-system-add-partition');
    ap.click();
    ap.click();
    const tbody = screen.getByTestId('file-system-configuration-tbody');
    const rows = within(tbody).getAllByRole('row');
    expect(rows).toHaveLength(3);
    getNextButton().click();
    // set mountpoint of final row to /var/tmp
    within(rows[2]).getAllByRole('button', { name: 'Options menu' })[0].click();
    within(rows[2]).getByRole('option', { name: '/var' }).click();
    await waitForElementToBeRemoved(() =>
      screen.queryAllByRole('heading', {
        name: 'Danger alert: Duplicate mount point.',
      })
    );
    await user.type(
      within(rows[2]).getByRole('textbox', {
        name: 'Mount point suffix text input',
      }),
      '/tmp'
    );

    // set size of the final row to 100 MiB
    await user.type(
      within(rows[2]).getByRole('textbox', { name: 'Size text input' }),
      '{backspace}100'
    );
    within(rows[2]).getAllByRole('button', { name: 'Options menu' })[1].click();
    within(rows[2]).getByRole('option', { name: 'MiB' }).click();
    getNextButton().click();

    screen.getByText(
      /Images built with Image Builder include all required packages/i
    );

    const searchbox = screen.getAllByRole('textbox')[0]; // searching by id doesn't update the input ref

    expect(searchbox).toBeDisabled();
    await waitFor(() => expect(searchbox).toBeEnabled());

    await searchForAvailablePackages(searchbox, 'test');
    screen
      .getByRole('option', { name: /test summary for test package/ })
      .click();
    screen.getByRole('button', { name: /Add selected/ }).click();
    getNextButton().click();

    // Enter image name
    const nameInput = screen.getByRole('textbox', {
      name: 'Image name',
    });
    await user.type(nameInput, 'MyImageName');
    getNextButton().click();

    // review
    const targetEnvironmentsExpandable = await screen.findByTestId(
      'target-environments-expandable'
    );
    targetEnvironmentsExpandable.click();
    await screen.findAllByText('AWS');
    await screen.findAllByText('GCP');
    await screen.findByText('VMWare (.vmdk)');
    await screen.findByText('Virtualization - Guest image (.qcow2)');
    await screen.findByText('Bare metal - Installer (.iso)');

    const imageDetailsExpandable = await screen.findByTestId(
      'image-details-expandable'
    );
    imageDetailsExpandable.click();
    await screen.findByText('MyImageName');

    const registrationExpandable = await screen.findByTestId(
      'registration-expandable'
    );
    registrationExpandable.click();
    await screen.findByText('name0');
    await screen.findByText('Self-Support');
    await screen.findByText('Production');
    const review = screen.getByTestId('review-registration');
    expect(review).toHaveTextContent(
      'Use remote host configuration (RHC) utility'
    );
    screen.getByTestId('repositories-popover-button').click();
    const repotbody = await screen.findByTestId(
      'additional-repositories-table'
    );
    expect(within(repotbody).getAllByRole('row')).toHaveLength(3);

    screen.getByTestId('file-system-configuration-popover').click();
    const revtbody = await screen.findByTestId(
      'file-system-configuration-tbody-review'
    );
    expect(within(revtbody).getAllByRole('row')).toHaveLength(3);

    // mock the backend API
    const ids = [];
    const composeImage = jest
      .spyOn(api, 'composeImage')
      .mockImplementation((body) => {
        let id;
        if (body.image_requests[0].upload_request.type === 'aws') {
          expect(body).toEqual({
            distribution: RHEL_8,
            image_name: 'MyImageName',
            image_requests: [
              {
                architecture: 'x86_64',
                image_type: 'aws',
                upload_request: {
                  type: 'aws',
                  options: {
                    share_with_accounts: ['012345678901'],
                  },
                },
              },
            ],
            customizations: {
              filesystem: [
                {
                  mountpoint: '/',
                  min_size: 10737418240,
                },
                {
                  mountpoint: '/home',
                  min_size: 1073741824,
                },
                {
                  mountpoint: '/var/tmp',
                  min_size: 104857600,
                },
              ],
              packages: ['test'],
              subscription: {
                'activation-key': 'name0',
                insights: true,
                rhc: true,
                organization: 5,
                'server-url': 'subscription.rhsm.redhat.com',
                'base-url': 'https://cdn.redhat.com/',
              },
            },
          });
          id = 'edbae1c2-62bc-42c1-ae0c-3110ab718f56';
        } else if (body.image_requests[0].upload_request.type === 'gcp') {
          expect(body).toEqual({
            distribution: RHEL_8,
            image_name: 'MyImageName',
            image_requests: [
              {
                architecture: 'x86_64',
                image_type: 'gcp',
                upload_request: {
                  type: 'gcp',
                  options: {
                    share_with_accounts: ['user:test@test.com'],
                  },
                },
              },
            ],
            customizations: {
              filesystem: [
                {
                  mountpoint: '/',
                  min_size: 10737418240,
                },
                {
                  mountpoint: '/home',
                  min_size: 1073741824,
                },
                {
                  mountpoint: '/var/tmp',
                  min_size: 104857600,
                },
              ],
              packages: ['test'],
              subscription: {
                'activation-key': 'name0',
                insights: true,
                rhc: true,
                organization: 5,
                'server-url': 'subscription.rhsm.redhat.com',
                'base-url': 'https://cdn.redhat.com/',
              },
            },
          });
          id = 'edbae1c2-62bc-42c1-ae0c-3110ab718f57';
        } else if (body.image_requests[0].upload_request.type === 'azure') {
          expect(body).toEqual({
            distribution: RHEL_8,
            image_name: 'MyImageName',
            image_requests: [
              {
                architecture: 'x86_64',
                image_type: 'azure',
                upload_request: {
                  type: 'azure',
                  options: {
                    tenant_id: 'b8f86d22-4371-46ce-95e7-65c415f3b1e2',
                    subscription_id: '60631143-a7dc-4d15-988b-ba83f3c99711',
                    resource_group: 'testResourceGroup',
                  },
                },
              },
            ],
            customizations: {
              filesystem: [
                {
                  mountpoint: '/',
                  min_size: 10737418240,
                },
                {
                  mountpoint: '/home',
                  min_size: 1073741824,
                },
                {
                  mountpoint: '/var/tmp',
                  min_size: 104857600,
                },
              ],
              packages: ['test'],
              subscription: {
                'activation-key': 'name0',
                insights: true,
                rhc: true,
                organization: 5,
                'server-url': 'subscription.rhsm.redhat.com',
                'base-url': 'https://cdn.redhat.com/',
              },
            },
          });
          id = 'edbae1c2-62bc-42c1-ae0c-3110ab718f58';
        } else if (body.image_requests[0].image_type === 'vsphere') {
          expect(body).toEqual({
            distribution: RHEL_8,
            image_name: 'MyImageName',
            image_requests: [
              {
                architecture: 'x86_64',
                image_type: 'vsphere',
                upload_request: {
                  type: 'aws.s3',
                  options: {},
                },
              },
            ],
            customizations: {
              filesystem: [
                {
                  mountpoint: '/',
                  min_size: 10737418240,
                },
                {
                  mountpoint: '/home',
                  min_size: 1073741824,
                },
                {
                  mountpoint: '/var/tmp',
                  min_size: 104857600,
                },
              ],
              packages: ['test'],
              subscription: {
                'activation-key': 'name0',
                insights: true,
                rhc: true,
                organization: 5,
                'server-url': 'subscription.rhsm.redhat.com',
                'base-url': 'https://cdn.redhat.com/',
              },
            },
          });
          id = 'edbae1c2-62bc-42c1-ae0c-3110ab718f59';
        } else if (body.image_requests[0].image_type === 'guest-image') {
          expect(body).toEqual({
            distribution: RHEL_8,
            image_name: 'MyImageName',
            image_requests: [
              {
                architecture: 'x86_64',
                image_type: 'guest-image',
                upload_request: {
                  type: 'aws.s3',
                  options: {},
                },
              },
            ],
            customizations: {
              filesystem: [
                {
                  mountpoint: '/',
                  min_size: 10737418240,
                },
                {
                  mountpoint: '/home',
                  min_size: 1073741824,
                },
                {
                  mountpoint: '/var/tmp',
                  min_size: 104857600,
                },
              ],
              packages: ['test'],
              subscription: {
                'activation-key': 'name0',
                insights: true,
                rhc: true,
                organization: 5,
                'server-url': 'subscription.rhsm.redhat.com',
                'base-url': 'https://cdn.redhat.com/',
              },
            },
          });
          id = 'edbae1c2-62bc-42c1-ae0c-3110ab718f5a';
        } else if (body.image_requests[0].image_type === 'image-installer') {
          expect(body).toEqual({
            distribution: RHEL_8,
            image_name: 'MyImageName',
            image_requests: [
              {
                architecture: 'x86_64',
                image_type: 'image-installer',
                upload_request: {
                  type: 'aws.s3',
                  options: {},
                },
              },
            ],
            customizations: {
              filesystem: [
                {
                  mountpoint: '/',
                  min_size: 10737418240,
                },
                {
                  mountpoint: '/home',
                  min_size: 1073741824,
                },
                {
                  mountpoint: '/var/tmp',
                  min_size: 104857600,
                },
              ],
              packages: ['test'],
              subscription: {
                'activation-key': 'name0',
                insights: true,
                rhc: true,
                organization: 5,
                'server-url': 'subscription.rhsm.redhat.com',
                'base-url': 'https://cdn.redhat.com/',
              },
            },
          });
          id = 'edbae1c2-62bc-42c1-ae0c-3110ab718f5b';
        }

        ids.unshift(id);
        return Promise.resolve({ id });
      });

    const create = screen.getByRole('button', { name: /Create/ });
    create.click();

    // API request sent to backend
    await expect(composeImage).toHaveBeenCalledTimes(6);

    // returns back to the landing page
    await waitFor(() =>
      expect(router.state.location.pathname).toBe('/insights/image-builder')
    );
    expect(store.getState().composes.allIds).toEqual(ids);
    // set test timeout of 20 seconds
  }, 20000);
});

describe('Keyboard accessibility', () => {
  const user = userEvent.setup();
  const setUp = async () => {
    ({ router } = renderWithReduxRouter('imagewizard', {}));
  };

  const clickNext = () => {
    const next = screen.getByRole('button', { name: /Next/ });
    next.click();
  };

  const selectAllEnvironments = () => {
    const awsTile = screen.getByTestId('upload-aws');
    awsTile.click();
    const googleTile = screen.getByTestId('upload-google');
    googleTile.click();
    const azureTile = screen.getByTestId('upload-azure');
    azureTile.click();
    const virtualizationCheckbox = screen.getByRole('checkbox', {
      name: /virtualization guest image checkbox/i,
    });
    virtualizationCheckbox.click();
  };

  const fillAzureInputs = async () => {
    await user.type(
      screen.getByTestId('azure-tenant-id'),
      'b8f86d22-4371-46ce-95e7-65c415f3b1e2'
    );
    await user.type(
      screen.getByTestId('azure-subscription-id'),
      '60631143-a7dc-4d15-988b-ba83f3c99711'
    );
    await user.type(
      screen.getByTestId('azure-resource-group'),
      'testResourceGroup'
    );
  };

  test('autofocus on each step first input element', async () => {
    setUp();

    // Image output
    selectAllEnvironments();
    clickNext();

    // Target environment aws
    const awsInput = screen.getByRole('textbox', { name: /aws account id/i });
    expect(awsInput).toHaveFocus();
    await user.type(awsInput, '012345678901');
    clickNext();

    // Target environment google
    const googleAccountRadio = screen.getByRole('radio', {
      name: /google account/i,
    });
    expect(googleAccountRadio).toHaveFocus();
    await user.type(screen.getByTestId('input-google-email'), 'test@test.com');
    clickNext();

    // Target environment azure
    const tenantIDInput = screen.getByTestId('azure-tenant-id');
    expect(tenantIDInput).toHaveFocus();
    await fillAzureInputs();
    clickNext();

    // Registration
    await screen.findByText(
      'Automatically register and enable advanced capabilities'
    );
    const registerRadio = screen.getByTestId('registration-radio-now');
    expect(registerRadio).toHaveFocus();
    await screen.findByRole('textbox', {
      name: 'Select activation key',
    });
    // skip registration
    const registerLaterRadio = screen.getByTestId('registration-radio-later');
    await user.click(registerLaterRadio);

    clickNext();

    // File system configuration
    clickNext();

    // Packages
    let availablePackagesInput;
    // eslint-disable-next-line testing-library/no-unnecessary-act
    await act(async () => {
      const view = screen.getByTestId('search-available-pkgs-input');

      availablePackagesInput = within(view).getByRole('textbox', {
        name: /search input/i,
      });
    });
    expect(availablePackagesInput).toBeDisabled();
    await waitFor(() => expect(availablePackagesInput).toBeEnabled());
    expect(availablePackagesInput).toHaveFocus();
    clickNext();

    // Name
    const nameInput = screen.getByRole('textbox', { name: /image name/i });
    expect(nameInput).toHaveFocus();
    clickNext();
  });

  test('pressing Esc closes the wizard', async () => {
    setUp();
    // wizard needs to be interacted with for the esc key to work
    const awsTile = screen.getByTestId('upload-aws');
    await user.click(awsTile);
    await user.keyboard('{escape}');
    expect(router.state.location.pathname).toBe('/insights/image-builder');
  });

  test('pressing Enter does not advance the wizard', async () => {
    setUp();
    const awsTile = screen.getByTestId('upload-aws');
    await user.click(awsTile);
    await user.keyboard('{enter}');
    screen.getByRole('heading', {
      name: /image output/i,
    });
  });

  test('target environment tiles are keyboard selectable', async () => {
    const testTile = async (tile) => {
      tile.focus();
      await user.keyboard('{space}');
      expect(tile).toHaveClass('pf-m-selected');
      await user.keyboard('{space}');
      expect(tile).not.toHaveClass('pf-m-selected');
    };

    setUp();
    clickNext();

    testTile(screen.getByTestId('upload-aws'));
    testTile(screen.getByTestId('upload-google'));
    testTile(screen.getByTestId('upload-azure'));
  });
});
