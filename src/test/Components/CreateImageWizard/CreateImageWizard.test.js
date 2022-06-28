import '@testing-library/jest-dom';

import React from 'react';
import {
  screen,
  waitFor,
  waitForElementToBeRemoved,
  within,
  act,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithReduxRouter } from '../../testUtils';
import CreateImageWizard from '../../../Components/CreateImageWizard/CreateImageWizard';
import api from '../../../api.js';
import { RHEL_8 } from '../../../constants.js';

let history = undefined;
let store = undefined;

function verifyButtons() {
  // these buttons exist everywhere
  const next = screen.getByRole('button', { name: /Next/ });
  const back = screen.getByRole('button', { name: /Back/ });
  const cancel = screen.getByRole('button', { name: /Cancel/ });

  return [next, back, cancel];
}

function verifyCancelButton(cancel, history) {
  cancel.click();

  expect(history.location.pathname).toBe('/');
}

// packages
const mockPkgResult = {
  meta: { count: 3 },
  links: { first: '', last: '' },
  data: [
    {
      name: 'testPkg',
      summary: 'test package summary',
      version: '1.0',
    },
    {
      name: 'lib-test',
      summary: 'lib-test package summary',
      version: '1.0',
    },
    {
      name: 'test',
      summary: 'summary for test package',
      version: '1.0',
    },
  ],
};

const mockPkgResultAlpha = {
  meta: { count: 3 },
  links: { first: '', last: '' },
  data: [
    {
      name: 'lib-test',
      summary: 'lib-test package summary',
      version: '1.0',
    },
    {
      name: 'Z-test',
      summary: 'Z-test package summary',
      version: '1.0',
    },
    {
      name: 'test',
      summary: 'summary for test package',
      version: '1.0',
    },
  ],
};

const mockPkgResultPartial = {
  meta: { count: 132 },
  links: { first: '', last: '' },
  data: new Array(100).fill().map((_, i) => {
    return {
      name: 'testPkg-' + i,
      summary: 'test package summary',
      version: '1.0',
    };
  }),
};

const mockPkgResultAll = {
  meta: { count: 132 },
  links: { first: '', last: '' },
  data: new Array(132).fill().map((_, i) => {
    return {
      name: 'testPkg-' + i,
      summary: 'test package summary',
      version: '1.0',
    };
  }),
};

const mockPkgResultEmpty = {
  meta: { count: 0 },
  links: { first: '', last: '' },
  data: null,
};

const searchForAvailablePackages = async (searchbox, searchTerm) => {
  userEvent.type(searchbox, searchTerm);
  await act(async () => {
    screen
      .getByRole('button', { name: /search button for available packages/i })
      .click();
  });
};

const searchForChosenPackages = async (searchbox, searchTerm) => {
  if (!searchTerm) {
    userEvent.clear(searchbox);
  } else {
    userEvent.type(searchbox, searchTerm);
  }
};

// mock the insights dependency
beforeAll(() => {
  // scrollTo is not defined in jsdom
  window.HTMLElement.prototype.scrollTo = function () {};

  // mock the activation key api call
  const mockActivationKeys = [{ name: 'name0' }, { name: 'name1' }];
  jest
    .spyOn(api, 'getActivationKeys')
    .mockImplementation(() => Promise.resolve(mockActivationKeys));

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
      isBeta: () => {
        return true;
      },
      isProd: () => {
        return true;
      },
    },
  };
});

afterEach(() => {
  jest.clearAllMocks();
  history = undefined;
});

// restore global mock
afterAll(() => {
  global.insights = undefined;
});

describe('Create Image Wizard', () => {
  test('renders component', () => {
    renderWithReduxRouter(<CreateImageWizard />);
    // check heading
    screen.getByRole('heading', { name: /Create image/ });

    screen.getByRole('button', { name: 'Image output' });
    screen.getByRole('button', { name: 'Packages' });
    screen.getByRole('button', { name: 'Name image' });
    screen.getByRole('button', { name: 'Review' });
  });
});

describe('Step Image output', () => {
  const setUp = () => {
    history = renderWithReduxRouter(<CreateImageWizard />).history;

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

    const [next, ,] = verifyButtons();
    next.click();

    screen.getByText('AWS account ID');
  });

  test('clicking Cancel loads landing page', () => {
    setUp();

    const [, , cancel] = verifyButtons();
    verifyCancelButton(cancel, history);
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

    const [next, ,] = verifyButtons();

    const awsTile = screen.getByTestId('upload-aws');
    // this has already been clicked once in the setup function
    awsTile.click(); // deselect

    const googleTile = screen.getByTestId('upload-google');
    googleTile.click(); // select
    googleTile.click(); // deselect

    const azureTile = screen.getByTestId('upload-azure');
    azureTile.click(); // select
    azureTile.click(); // deselect

    expect(next).toBeDisabled();
  });

  test('expect only RHEL releases before expansion', async () => {
    setUp();

    const releaseMenu = screen.getByRole('button', {
      name: /options menu/i,
    });
    userEvent.click(releaseMenu);

    await screen.findByRole('option', {
      name: 'Red Hat Enterprise Linux (RHEL) 8',
    });
    await screen.findByRole('option', {
      name: 'Red Hat Enterprise Linux (RHEL) 9',
    });
    await screen.findByRole('button', {
      name: 'Show options for further development of RHEL',
    });

    userEvent.click(releaseMenu);
  });

  test('expect all releases after expansion', async () => {
    setUp();

    const releaseMenu = screen.getByRole('button', {
      name: /options menu/i,
    });
    userEvent.click(releaseMenu);

    const showOptionsButton = screen.getByRole('button', {
      name: 'Show options for further development of RHEL',
    });
    userEvent.click(showOptionsButton);

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

    userEvent.click(releaseMenu);
  });

  test('clear button resets to initial state (unexpanded)', async () => {
    setUp();

    const releaseMenu = screen.getByRole('button', {
      name: /options menu/i,
    });
    userEvent.click(releaseMenu);

    const showOptionsButton = screen.getByRole('button', {
      name: 'Show options for further development of RHEL',
    });
    userEvent.click(showOptionsButton);

    const clearAllButton = screen.getByRole('button', {
      name: /clear all/i,
    });
    userEvent.click(clearAllButton);

    await screen.findByRole('option', {
      name: 'Red Hat Enterprise Linux (RHEL) 8',
    });
    await screen.findByRole('option', {
      name: 'Red Hat Enterprise Linux (RHEL) 9',
    });
    await screen.findByRole('button', {
      name: 'Show options for further development of RHEL',
    });

    userEvent.click(releaseMenu);
  });

  test('CentOS acknowledgement appears', async () => {
    setUp();

    const releaseMenu = screen.getByRole('button', {
      name: /options menu/i,
    });
    userEvent.click(releaseMenu);

    const showOptionsButton = screen.getByRole('button', {
      name: 'Show options for further development of RHEL',
    });
    userEvent.click(showOptionsButton);

    const centOSButton = screen.getByRole('option', {
      name: 'CentOS Stream 9',
    });
    userEvent.click(centOSButton);

    await screen.findByText(
      'CentOS Stream builds may only be used for the development of RHEL-Next.'
    );
  });
});

describe('Step Upload to AWS', () => {
  const setUp = () => {
    history = renderWithReduxRouter(<CreateImageWizard />).history;
    const [next, ,] = verifyButtons();

    // select aws as upload destination
    const awsTile = screen.getByTestId('upload-aws');
    awsTile.click();

    next.click();

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Target environment - Amazon Web Service'
    );
  };

  test('clicking Next loads Registration', async () => {
    setUp();

    userEvent.type(screen.getByTestId('aws-account-id'), '012345678901');
    const [next, ,] = verifyButtons();
    next.click();

    await screen.findByRole('textbox', {
      name: 'Select activation key',
    });

    screen.getByText('Register images with Red Hat');
  });

  test('clicking Back loads Release', () => {
    setUp();

    const [, back] = verifyButtons();
    back.click();

    screen.getByTestId('upload-aws');
  });

  test('clicking Cancel loads landing page', () => {
    setUp();

    const [, , cancel] = verifyButtons();
    verifyCancelButton(cancel, history);
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
  const setUp = () => {
    history = renderWithReduxRouter(<CreateImageWizard />).history;
    const [next, ,] = verifyButtons();

    // select aws as upload destination
    const awsTile = screen.getByTestId('upload-google');
    awsTile.click();

    next.click();

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Target environment - Google Cloud Platform'
    );
  };

  test('clicking Next loads Registration', async () => {
    setUp();

    userEvent.type(screen.getByTestId('input-google-email'), 'test@test.com');
    const [next, ,] = verifyButtons();
    next.click();

    await screen.findByRole('textbox', {
      name: 'Select activation key',
    });

    screen.getByText('Register images with Red Hat');
  });

  test('clicking Back loads Release', () => {
    setUp();

    const [, back] = verifyButtons();
    back.click();

    screen.getByTestId('upload-google');
  });

  test('clicking Cancel loads landing page', () => {
    setUp();

    const [, , cancel] = verifyButtons();
    verifyCancelButton(cancel, history);
  });

  test('the google account id field is shown and required', () => {
    setUp();

    const accessKeyId = screen.getByTestId('input-google-email');
    expect(accessKeyId).toHaveValue('');
    expect(accessKeyId).toBeEnabled();
    // expect(accessKeyId).toBeRequired(); // DDf does not support required value
  });

  test('the google email field must be a valid email', () => {
    setUp();

    const [next, ,] = verifyButtons();
    userEvent.type(screen.getByTestId('input-google-email'), 'a');
    expect(next).toHaveClass('pf-m-disabled');
    expect(next).toBeDisabled();
    userEvent.type(screen.getByTestId('input-google-email'), 'test@test.com');
    expect(next).not.toHaveClass('pf-m-disabled');
    expect(next).toBeEnabled();
  });
});

describe('Step Upload to Azure', () => {
  const setUp = () => {
    history = renderWithReduxRouter(<CreateImageWizard />).history;
    const [next, ,] = verifyButtons();

    // select aws as upload destination
    const awsTile = screen.getByTestId('upload-azure');
    awsTile.click();
    next.click();

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Target environment - Microsoft Azure'
    );
  };

  test('clicking Next loads Registration', async () => {
    setUp();
    // Randomly generated GUID
    userEvent.type(
      screen.getByTestId('azure-tenant-id'),
      'b8f86d22-4371-46ce-95e7-65c415f3b1e2'
    );
    userEvent.type(
      screen.getByTestId('azure-subscription-id'),
      '60631143-a7dc-4d15-988b-ba83f3c99711'
    );
    userEvent.type(
      screen.getByTestId('azure-resource-group'),
      'testResourceGroup'
    );

    const [next, ,] = verifyButtons();
    next.click();

    await screen.findByRole('textbox', {
      name: 'Select activation key',
    });

    screen.getByText('Register images with Red Hat');
  });

  test('clicking Back loads Release', () => {
    setUp();

    const [, back] = verifyButtons();
    back.click();

    screen.getByTestId('upload-azure');
  });

  test('clicking Cancel loads landing page', () => {
    setUp();

    const [, , cancel] = verifyButtons();
    verifyCancelButton(cancel, history);
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
  const setUp = async () => {
    history = renderWithReduxRouter(<CreateImageWizard />).history;
    const [next, ,] = verifyButtons();

    // select aws as upload destination
    const awsTile = screen.getByTestId('upload-aws');
    awsTile.click();

    next.click();
    userEvent.type(screen.getByTestId('aws-account-id'), '012345678901');

    next.click();

    await screen.findByRole('textbox', {
      name: 'Select activation key',
    });
  };

  test('clicking Next loads file system configuration', async () => {
    await setUp();

    const registerLaterRadio = screen.getByLabelText('Register later');
    userEvent.click(registerLaterRadio);

    const [next, ,] = verifyButtons();
    next.click();

    screen.getByTestId('fsc-paritioning-toggle');
  });

  test('clicking Back loads Upload to AWS', async () => {
    await setUp();

    const [, back] = verifyButtons();
    back.click();

    screen.getByText('AWS account ID');
  });

  test('clicking Cancel loads landing page', async () => {
    await setUp();

    const [, , cancel] = verifyButtons();
    verifyCancelButton(cancel, history);
  });

  test('should allow registering with insights', async () => {
    await setUp();

    const registrationRadio = screen.getByLabelText(
      'Register and connect image instances with Red Hat'
    );
    userEvent.click(registrationRadio);

    const activationKeyDropdown = await screen.findByRole('textbox', {
      name: 'Select activation key',
    });
    userEvent.click(activationKeyDropdown);
    const activationKey = await screen.findByRole('option', {
      name: 'name0',
    });
    userEvent.click(activationKey);
    screen.getByDisplayValue('name0');

    screen.getByRole('button', { name: /Next/ }).click();
    screen.getByRole('button', { name: /Next/ }).click();
    screen.getByRole('button', { name: /Next/ }).click();
    screen.getByRole('button', { name: /Next/ }).click();
    await waitFor(() => {
      screen.getByText('Register with Subscriptions and Red Hat Insights');
      screen.getAllByText('012345678901');
    });
  });

  test('should allow registering without insights', async () => {
    await setUp();

    const registrationRadio = screen.getByLabelText(
      'Register image instances only'
    );
    userEvent.click(registrationRadio);

    const activationKeyDropdown = await screen.findByRole('textbox', {
      name: 'Select activation key',
    });
    userEvent.click(activationKeyDropdown);
    const activationKey = await screen.findByRole('option', {
      name: 'name0',
    });
    userEvent.click(activationKey);
    screen.getByDisplayValue('name0');

    screen.getByRole('button', { name: /Next/ }).click();
    screen.getByRole('button', { name: /Next/ }).click();
    screen.getByRole('button', { name: /Next/ }).click();
    screen.getByRole('button', { name: /Next/ }).click();
    await waitFor(() => {
      screen.getByText('Register with Subscriptions');
      screen.getAllByText('012345678901');
    });
  });

  test('should hide input fields when clicking Register the system later', async () => {
    await setUp();
    // first check the other radio button which causes extra widgets to be shown
    const registrationRadio = screen.getByLabelText(
      'Register and connect image instances with Red Hat'
    );
    userEvent.click(registrationRadio);

    const p1 = waitForElementToBeRemoved(() => [
      screen.getByTestId('subscription-activation-key'),
    ]);

    // then click the later radio button which should remove any input fields
    const registerLaterRadio = screen.getByLabelText('Register later');
    userEvent.click(registerLaterRadio);

    await p1;

    screen.getByRole('button', { name: /Next/ }).click();
    screen.getByRole('button', { name: /Next/ }).click();
    screen.getByRole('button', { name: /Next/ }).click();
    screen.getByRole('button', { name: /Next/ }).click();
    screen.getByText('Register the system later');
  });
});

describe('Step Packages', () => {
  const setUp = async () => {
    history = renderWithReduxRouter(<CreateImageWizard />).history;
    const [next, ,] = verifyButtons();

    // select aws as upload destination
    const awsTile = screen.getByTestId('upload-aws');
    awsTile.click();
    next.click();

    // aws step
    userEvent.type(screen.getByTestId('aws-account-id'), '012345678901');
    next.click();
    // skip registration
    await screen.findByRole('textbox', {
      name: 'Select activation key',
    });

    const registerLaterRadio = screen.getByLabelText('Register later');
    userEvent.click(registerLaterRadio);
    next.click();

    // skip fsc
    next.click();
  };

  test('clicking Next loads Image name', async () => {
    await setUp();

    const [next, ,] = verifyButtons();
    next.click();

    screen.getByRole('heading', {
      name: 'Name image',
    });
  });

  test('clicking Back loads file system configuration', async () => {
    await setUp();

    const back = screen.getByRole('button', { name: /Back/ });
    back.click();

    screen.getByTestId('fsc-paritioning-toggle');
  });

  test('clicking Cancel loads landing page', async () => {
    await setUp();

    const [, , cancel] = verifyButtons();
    verifyCancelButton(cancel, history);
  });

  test('should display search bar and button', async () => {
    await setUp();

    userEvent.type(screen.getByTestId('search-available-pkgs-input'), 'test');

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

    searchbox.click();

    const getPackages = jest
      .spyOn(api, 'getPackages')
      .mockImplementation(() => Promise.resolve(mockPkgResult));

    await searchForAvailablePackages(searchbox, 'test');
    expect(getPackages).toHaveBeenCalledTimes(1);

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

    searchbox.click();

    const getPackages = jest
      .spyOn(api, 'getPackages')
      .mockImplementation(() => Promise.resolve(mockPkgResult));

    await searchForAvailablePackages(searchbox, 'test');
    expect(getPackages).toHaveBeenCalledTimes(1);

    screen
      .getByRole('option', { name: /testPkg test package summary/ })
      .click();
    screen.getByRole('button', { name: /Add selected/ }).click();

    screen
      .getByRole('option', { name: /testPkg test package summary/ })
      .click();
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

    searchbox.click();

    const getPackages = jest
      .spyOn(api, 'getPackages')
      .mockImplementation(() => Promise.resolve(mockPkgResult));

    await searchForAvailablePackages(searchbox, 'test');
    expect(getPackages).toHaveBeenCalledTimes(1);

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
    searchbox.click();
    const getPackages = jest
      .spyOn(api, 'getPackages')
      .mockImplementation(() => Promise.resolve(mockPkgResult));

    await searchForAvailablePackages(searchbox, 'test');
    expect(getPackages).toHaveBeenCalledTimes(1);
    screen.getByRole('button', { name: /Add all/ }).click();

    // remove a single package
    screen
      .getByRole('option', { name: /lib-test lib-test package summary/ })
      .click();
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

    searchbox.click();

    const getPackages = jest
      .spyOn(api, 'getPackages')
      .mockImplementation(() => Promise.resolve(mockPkgResultEmpty));

    await searchForAvailablePackages(searchbox, 'asdf');
    expect(getPackages).toHaveBeenCalledTimes(1);
    screen.getByText('No packages found');
  });

  test('should display empty available state on failed search after a successful search', async () => {
    await setUp();

    const searchbox = screen.getAllByRole('textbox')[0]; // searching by id doesn't update the input ref

    searchbox.click();

    let getPackages = jest
      .spyOn(api, 'getPackages')
      .mockImplementation(() => Promise.resolve(mockPkgResult));

    await searchForAvailablePackages(searchbox, 'test');

    getPackages = jest
      .spyOn(api, 'getPackages')
      .mockImplementation(() => Promise.resolve(mockPkgResultEmpty));

    await searchForAvailablePackages(searchbox, 'asdf');

    expect(getPackages).toHaveBeenCalledTimes(2);
    screen.getByText('No packages found');
  });

  test('should display empty chosen state on failed search', async () => {
    await setUp();

    const searchboxAvailable = screen.getAllByRole('textbox')[0]; // searching by id doesn't update the input ref
    const searchboxChosen = screen.getAllByRole('textbox')[1];

    const getPackages = jest
      .spyOn(api, 'getPackages')
      .mockImplementation(() => Promise.resolve(mockPkgResult));

    searchboxAvailable.click();
    await searchForAvailablePackages(searchboxAvailable, 'test');
    expect(getPackages).toHaveBeenCalledTimes(1);

    screen.getByRole('button', { name: /Add all/ }).click();

    searchboxChosen.click();
    userEvent.type(searchboxChosen, 'asdf');

    expect(screen.getAllByText('No packages found').length === 2);
    // We need to clear this input in order to not have sideeffects on other tests
    await searchForChosenPackages(searchboxChosen, '');
  });

  test('should filter chosen packages from available list', async () => {
    await setUp();

    const searchboxAvailable = screen.getAllByRole('textbox')[0];
    const availablePackagesList = screen.getByTestId('available-pkgs-list');
    const chosenPackagesList = screen.getByTestId('chosen-pkgs-list');

    const getPackages = jest
      .spyOn(api, 'getPackages')
      .mockImplementation(() => Promise.resolve(mockPkgResult));

    searchboxAvailable.click();
    await searchForAvailablePackages(searchboxAvailable, 'test');
    expect(getPackages).toHaveBeenCalledTimes(1);

    let availablePackagesItems = within(availablePackagesList).getAllByRole(
      'option'
    );
    expect(availablePackagesItems).toHaveLength(3);

    screen
      .getByRole('option', { name: /testPkg test package summary/ })
      .click();
    screen.getByRole('button', { name: /Add selected/ }).click();

    availablePackagesItems = within(availablePackagesList).getAllByRole(
      'option'
    );
    expect(availablePackagesItems).toHaveLength(2);

    let chosenPackagesItems = within(chosenPackagesList).getAllByRole('option');
    // Knowing if it is in document isn't enough. We want a specific length of 1 so ignore rule.
    // eslint-disable-next-line jest-dom/prefer-in-document
    expect(chosenPackagesItems).toHaveLength(1);

    searchboxAvailable.click();
    await searchForAvailablePackages(searchboxAvailable, 'test');
    expect(getPackages).toHaveBeenCalledTimes(2);

    availablePackagesItems = within(availablePackagesList).getAllByRole(
      'option'
    );
    chosenPackagesItems = within(chosenPackagesList).getAllByRole('option');
    expect(availablePackagesItems).toHaveLength(2);
    // Knowing if it is in document isn't enough. We want a specific length of 1 so ignore rule.
    // eslint-disable-next-line jest-dom/prefer-in-document
    expect(chosenPackagesItems).toHaveLength(1);
    within(chosenPackagesList).getByRole('option', {
      name: /testPkg test package summary/,
    });
  });

  test('should get all packages, regardless of api default limit', async () => {
    await setUp();

    const searchbox = screen.getAllByRole('textbox')[0]; // searching by id doesn't update the input ref

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

    const availablePackagesList = screen.getByTestId('available-pkgs-list');
    const availablePackagesItems = within(availablePackagesList).getAllByRole(
      'option'
    );
    expect(availablePackagesItems).toHaveLength(132);
  });

  test('search results should be sorted alphabetically', async () => {
    await setUp();

    const searchbox = screen.getAllByRole('textbox')[0]; // searching by id doesn't update the input ref

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

    searchbox.click();

    const getPackages = jest
      .spyOn(api, 'getPackages')
      .mockImplementation(() => Promise.resolve(mockPkgResult));

    await searchForAvailablePackages(searchbox, 'test');
    expect(getPackages).toHaveBeenCalledTimes(1);

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

    availableSearchbox.click();

    const getPackages = jest
      .spyOn(api, 'getPackages')
      .mockImplementation(() => Promise.resolve(mockPkgResult));

    await searchForAvailablePackages(availableSearchbox, 'test');
    expect(getPackages).toHaveBeenCalledTimes(1);

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
    await searchForChosenPackages(chosenSearchbox, 'Pkg');
    chosenPackagesItems = within(chosenPackagesList).getAllByRole('option');
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
  const setUp = async () => {
    history = renderWithReduxRouter(<CreateImageWizard />).history;
    const [next, ,] = verifyButtons();

    // select aws as upload destination
    const awsTile = screen.getByTestId('upload-aws');
    awsTile.click();
    next.click();

    // aws step
    userEvent.type(screen.getByTestId('aws-account-id'), '012345678901');
    next.click();
    // skip registration
    await screen.findByRole('textbox', {
      name: 'Select activation key',
    });

    const registerLaterRadio = screen.getByLabelText('Register later');
    userEvent.click(registerLaterRadio);
    next.click();

    // skip fsc
    next.click();
    // skip packages
    next.click();
  };

  test('image name invalid for more than 100 chars', async () => {
    await setUp();

    const [next, ,] = verifyButtons();

    // Enter image name
    const nameInput = screen.getByRole('textbox', {
      name: 'Image name',
    });
    // 101 character name
    const invalidName = 'a'.repeat(101);
    userEvent.type(nameInput, invalidName);
    expect(next).toHaveClass('pf-m-disabled');
    expect(next).toBeDisabled();
    userEvent.clear(nameInput);
    userEvent.type(nameInput, 'validName');
    expect(next).not.toHaveClass('pf-m-disabled');
    expect(next).toBeEnabled();
  });
});

describe('Step Review', () => {
  const setUp = async () => {
    history = renderWithReduxRouter(<CreateImageWizard />).history;
    const [next, ,] = verifyButtons();

    // select aws as upload destination
    const awsTile = screen.getByTestId('upload-aws');
    awsTile.click();
    next.click();

    // aws step
    userEvent.type(screen.getByTestId('aws-account-id'), '012345678901');
    next.click();

    await screen.findByRole('textbox', {
      name: 'Select activation key',
    });

    // skip registration
    const registerLaterRadio = screen.getByLabelText('Register later');
    userEvent.click(registerLaterRadio);
    next.click();

    // skip fsc
    next.click();

    // skip packages
    next.click();
    // skip name
    next.click();
  };

  // eslint-disable-next-line no-unused-vars
  const setUpCentOS = () => {
    history = renderWithReduxRouter(<CreateImageWizard />).history;

    const [next, ,] = verifyButtons();

    const releaseMenu = screen.getByRole('button', {
      name: /options menu/i,
    });
    userEvent.click(releaseMenu);

    const showOptionsButton = screen.getByRole('button', {
      name: 'Show options for further development of RHEL',
    });
    userEvent.click(showOptionsButton);

    const centos = screen.getByRole('option', {
      name: 'CentOS Stream 8',
    });
    userEvent.click(centos);

    // select aws as upload destination
    const awsTile = screen.getByTestId('upload-aws');
    awsTile.click();
    next.click();

    // aws step
    userEvent.type(screen.getByTestId('aws-account-id'), '012345678901');
    next.click();

    // skip fsc
    next.click();

    // skip packages
    next.click();
    // skip name
    next.click();
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
    verifyCancelButton(cancel, history);
  });

  test('has three tabs for rhel', async () => {
    await setUp();

    const buttonTarget = screen.getByTestId('tab-target');
    const buttonRegistration = screen.getByTestId('tab-registration');
    const buttonSystem = screen.getByTestId('tab-system');

    userEvent.click(buttonTarget);
    screen.getByRole('heading', {
      name: 'Amazon Web Services',
    });
    userEvent.click(buttonRegistration);
    screen.getByText('Register the system later');
    userEvent.click(buttonSystem);
    screen.getByRole('heading', {
      name: 'Packages',
    });
    screen.getByRole('heading', {
      name: 'File system configuration',
    });
  });

  test('has two tabs for centos', () => {
    setUpCentOS();

    const buttonTarget = screen.getByTestId('tab-target');
    const buttonSystem = screen.getByTestId('tab-system');
    expect(screen.queryByTestId('tab-registration')).not.toBeInTheDocument();

    userEvent.click(buttonTarget);
    screen.getByRole('heading', {
      name: 'Amazon Web Services',
    });
    userEvent.click(buttonSystem);
    screen.getByRole('heading', {
      name: 'Packages',
    });
    screen.getByRole('heading', {
      name: 'File system configuration',
    });
  });

  test('can pass location to recreate on review step', () => {
    const initialLocation = {
      state: {
        composeRequest: {
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
          customizations: {},
        },
        initialStep: 'review',
      },
    };
    history = renderWithReduxRouter(
      <CreateImageWizard />,
      {},
      initialLocation
    ).history;
    screen.getByText(
      'Review the information and click "Create image" to create the image using the following criteria.'
    );
    screen.getByText('Virtualization - Guest image');
    screen.getByText('Register the system later');
    screen.getByText('MyImageName');
  });
});

describe('Click through all steps', () => {
  const setUp = async () => {
    const view = renderWithReduxRouter(<CreateImageWizard />);
    history = view.history;
    store = view.reduxStore;
  };

  test('with valid values', async () => {
    await setUp();

    const next = screen.getByRole('button', { name: /Next/ });

    // select image output
    const releaseMenu = screen.getByRole('button', {
      name: /options menu/i,
    });
    userEvent.click(releaseMenu);
    const releaseOption = screen.getByRole('option', {
      name: 'Red Hat Enterprise Linux (RHEL) 8',
    });
    userEvent.click(releaseOption);

    userEvent.click(screen.getByTestId('upload-aws'));
    userEvent.click(screen.getByTestId('upload-azure'));
    userEvent.click(screen.getByTestId('upload-google'));
    userEvent.click(screen.getByTestId('checkbox-vmware'));
    userEvent.click(screen.getByTestId('checkbox-guest-image'));
    userEvent.click(screen.getByTestId('checkbox-image-installer'));

    screen.getByRole('button', { name: /Next/ }).click();
    userEvent.type(screen.getByTestId('aws-account-id'), '012345678901');
    screen.getByRole('button', { name: /Next/ }).click();

    userEvent.type(screen.getByTestId('input-google-email'), 'test@test.com');
    screen.getByRole('button', { name: /Next/ }).click();

    // Randomly generated GUID
    userEvent.type(
      screen.getByTestId('azure-tenant-id'),
      'b8f86d22-4371-46ce-95e7-65c415f3b1e2'
    );
    userEvent.type(
      screen.getByTestId('azure-subscription-id'),
      '60631143-a7dc-4d15-988b-ba83f3c99711'
    );
    userEvent.type(
      screen.getByTestId('azure-resource-group'),
      'testResourceGroup'
    );
    screen.getByRole('button', { name: /Next/ }).click();

    // registration
    const mockActivationKeys = [
      { id: '0', name: 'name0' },
      { id: 1, name: 'name1' },
    ];
    jest
      .spyOn(api, 'getActivationKeys')
      .mockImplementation(() => Promise.resolve(mockActivationKeys));

    const registrationRadio = screen.getByLabelText(
      'Register and connect image instances with Red Hat'
    );
    userEvent.click(registrationRadio);

    const activationKeyDropdown = await screen.findByRole('textbox', {
      name: 'Select activation key',
    });
    userEvent.click(activationKeyDropdown);
    const activationKey = await screen.findByRole('option', {
      name: 'name0',
    });
    userEvent.click(activationKey);
    screen.getByDisplayValue('name0');

    next.click();

    // fsc
    const toggle = await screen.findByTestId(
      'file-system-config-toggle-manual'
    );
    within(toggle).getByRole('button').click();
    const ap = await screen.findByTestId('file-system-add-partition');
    ap.click();
    ap.click();
    const tbody = screen.getByTestId('file-system-configuration-tbody');
    const rows = within(tbody).getAllByRole('row');
    expect(rows).toHaveLength(3);
    // set mountpoint of final row to /var/tmp
    within(rows[2]).getAllByRole('button', { name: 'Options menu' })[0].click();
    within(rows[2]).getByRole('option', { name: '/var' }).click();
    await waitForElementToBeRemoved(() =>
      screen.queryAllByRole('heading', {
        name: 'Danger alert: Duplicate mount point.',
      })
    );
    userEvent.type(
      within(rows[2]).getByRole('textbox', {
        name: 'Mount point suffix text input',
      }),
      '/tmp'
    );

    // set size of the final row to 100 MiB
    userEvent.type(
      within(rows[2]).getByRole('textbox', { name: 'Size text input' }),
      '{backspace}100'
    );
    within(rows[2]).getAllByRole('button', { name: 'Options menu' })[1].click();
    within(rows[2]).getByRole('option', { name: 'MiB' }).click();
    next.click();

    // packages
    const getPackages = jest
      .spyOn(api, 'getPackages')
      .mockImplementation(() => Promise.resolve(mockPkgResult));

    screen.getByText(
      'Add optional additional packages to your image by searching available packages.'
    );
    await searchForAvailablePackages(
      screen.getByTestId('search-available-pkgs-input'),
      'test'
    );
    expect(getPackages).toHaveBeenCalledTimes(1);
    screen
      .getByRole('option', { name: /testPkg test package summary/ })
      .click();
    screen.getByRole('button', { name: /Add selected/ }).click();
    next.click();

    // Enter image name
    const nameInput = screen.getByRole('textbox', {
      name: 'Image name',
    });
    userEvent.type(nameInput, 'MyImageName');
    next.click();

    // review
    await screen.findByText(
      'Review the information and click "Create image" to create the image using the following criteria.'
    );
    await screen.findAllByText('Amazon Web Services');
    await screen.findAllByText('Google Cloud Platform');
    await screen.findByText('VMWare');
    await screen.findByText('Virtualization - Guest image');
    await screen.findByText('Bare metal - Installer');
    await screen.findByText('Register with Subscriptions and Red Hat Insights');
    await screen.findByText('MyImageName');

    screen.getByTestId('file-system-configuration-popover').click();
    const revtbody = await screen.findByTestId(
      'file-system-configuration-tbody-review'
    );
    expect(within(revtbody).getAllByRole('row')).toHaveLength(3);

    await waitFor(() => {
      const id = screen.getByTestId('organization-id');
      within(id).getByText(5);
    });
    // mock the backend API
    let ids = [];
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
                image_type: 'ami',
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
              packages: ['testPkg'],
              subscription: {
                'activation-key': 'name0',
                insights: true,
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
              packages: ['testPkg'],
              subscription: {
                'activation-key': 'name0',
                insights: true,
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
                image_type: 'vhd',
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
              packages: ['testPkg'],
              subscription: {
                'activation-key': 'name0',
                insights: true,
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
              packages: ['testPkg'],
              subscription: {
                'activation-key': 'name0',
                insights: true,
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
              packages: ['testPkg'],
              subscription: {
                'activation-key': 'name0',
                insights: true,
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
              packages: ['testPkg'],
              subscription: {
                'activation-key': 'name0',
                insights: true,
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
    await waitFor(() => expect(history.location.pathname).toBe('/'));
    expect(store.getStore().getState().composes.allIds).toEqual(ids);
    // set test timeout of 10 seconds
  }, 10000);
});

describe('Keyboard accessibility', () => {
  const setUp = async () => {
    const view = renderWithReduxRouter(
      <CreateImageWizard />,
      {},
      '/imagewizard'
    );
    history = view.history;
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

  const fillAzureInputs = () => {
    userEvent.type(
      screen.getByTestId('azure-tenant-id'),
      'b8f86d22-4371-46ce-95e7-65c415f3b1e2'
    );
    userEvent.type(
      screen.getByTestId('azure-subscription-id'),
      '60631143-a7dc-4d15-988b-ba83f3c99711'
    );
    userEvent.type(
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
    userEvent.type(awsInput, '012345678901');
    clickNext();

    // Target environment google
    const googleAccountRadio = screen.getByRole('radio', {
      name: /google account/i,
    });
    expect(googleAccountRadio).toHaveFocus();
    userEvent.type(screen.getByTestId('input-google-email'), 'test@test.com');
    clickNext();

    // Target environment azure
    const tenantIDInput = screen.getByTestId('azure-tenant-id');
    expect(tenantIDInput).toHaveFocus();
    fillAzureInputs();
    clickNext();

    // Registration
    const registerRadio = screen.getByRole('radio', {
      name: /register and connect image instances with red hat/i,
    });
    expect(registerRadio).toHaveFocus();
    await screen.findByRole('textbox', {
      name: 'Select activation key',
    });
    // skip registration
    const registerLaterRadio = screen.getByLabelText('Register later');
    userEvent.click(registerLaterRadio);

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
    expect(availablePackagesInput).toHaveFocus();
    clickNext();

    // Name
    const nameInput = screen.getByRole('textbox', { name: /image name/i });
    expect(nameInput).toHaveFocus();
    clickNext();

    // Review
    const targetEnvironmentTab = screen.getByTestId('tab-target');
    expect(targetEnvironmentTab).toHaveFocus();
  });

  test('pressing Esc closes the wizard', async () => {
    setUp();
    // wizard needs to be interacted with for the esc key to work
    const awsTile = screen.getByTestId('upload-aws');
    userEvent.click(awsTile);
    userEvent.keyboard('{esc}');
    expect(history.location.pathname).toBe('/');
  });

  test('pressing Enter does not advance the wizard', async () => {
    setUp();
    const awsTile = screen.getByTestId('upload-aws');
    userEvent.click(awsTile);
    userEvent.keyboard('{enter}');
    screen.getByRole('heading', {
      name: /image output/i,
    });
  });

  test('target environment tiles are keyboard selectable', async () => {
    const testTile = (tile) => {
      tile.focus();
      userEvent.keyboard('{space}');
      expect(tile).toHaveClass('pf-m-selected');
      userEvent.keyboard('{space}');
      expect(tile).not.toHaveClass('pf-m-selected');
    };

    setUp();
    clickNext();

    testTile(screen.getByTestId('upload-aws'));
    testTile(screen.getByTestId('upload-google'));
    testTile(screen.getByTestId('upload-azure'));
  });
});
