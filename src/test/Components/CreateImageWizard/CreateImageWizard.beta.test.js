import '@testing-library/jest-dom';
import React from 'react';

import {
  act,
  screen,
  waitFor,
  waitForElementToBeRemoved,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';

import api from '../../../api.js';
import CreateImageWizard from '../../../Components/CreateImageWizard/CreateImageWizard';
import {
  RHEL_8,
  RHEL_9,
  PROVISIONING_SOURCES_ENDPOINT,
} from '../../../constants.js';
import { mockRepositoryResults } from '../../fixtures/repositories';
import { server } from '../../mocks/server.js';
import { renderWithReduxRouter } from '../../testUtils';

let history = undefined;
let store = undefined;

function getBackButton() {
  const back = screen.getByRole('button', { name: /Back/ });
  return back;
}

function getNextButton() {
  const next = screen.getByRole('button', { name: /Next/ });
  return next;
}

const mockPkgResultAlphaContentSources = [
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
];

const mockRepositoryResponsePartial = {
  data: new Array(100).fill().map((_, i) => {
    return {
      uuid: '9cf1d45d-aa06-46fe-87ea-121845cc6bbb',
      name: '2lmdtj',
      url:
        'http://mirror.stream.centos.org/SIGs/9/kmods/x86_64/packages-main/' +
        i,
      distribution_versions: ['any'],
      distribution_arch: 'any',
      account_id: '6416440',
      org_id: '13476545',
      last_introspection_time: '2022-11-23 00:00:12.714873 +0000 UTC',
      last_success_introspection_time: '2022-11-23 00:00:12.714873 +0000 UTC',
      last_update_introspection_time: '2022-11-18 08:00:10.119093 +0000 UTC',
      last_introspection_error: '',
      package_count: 21,
      status: 'Valid',
      gpg_key: '',
      metadata_verification: false,
    };
  }),
  meta: {
    limit: 100,
    offset: 0,
    count: 132,
  },
  links: {
    first: '/api/content-sources/v1/repositories/?limit=100&offset=0',
    last: '/api/content-sources/v1/repositories/?limit=100&offset=0',
  },
};

const mockRepositoryResponseAll = {
  data: new Array(132).fill().map((_, i) => {
    return {
      uuid: '9cf1d45d-aa06-46fe-87ea-121845cc6bbb',
      name: '2lmdtj',
      url:
        'http://mirror.stream.centos.org/SIGs/9/kmods/x86_64/packages-main/' +
        i,
      distribution_versions: ['any'],
      distribution_arch: 'any',
      account_id: '6416440',
      org_id: '13476545',
      last_introspection_time: '2022-11-23 00:00:12.714873 +0000 UTC',
      last_success_introspection_time: '2022-11-23 00:00:12.714873 +0000 UTC',
      last_update_introspection_time: '2022-11-18 08:00:10.119093 +0000 UTC',
      last_introspection_error: '',
      package_count: 21,
      status: 'Valid',
      gpg_key: '',
      metadata_verification: false,
    };
  }),
  meta: {
    limit: 132,
    offset: 0,
    count: 132,
  },
  links: {
    first: '/api/content-sources/v1/repositories/?limit=132&offset=0',
    last: '/api/content-sources/v1/repositories/?limit=132&offset=0',
  },
};

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

// mock the insights dependency
beforeAll(() => {
  // scrollTo is not defined in jsdom
  window.HTMLElement.prototype.scrollTo = function () {};

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
      getEnvironment: () => {
        return 'prod';
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
    screen.getByRole('button', { name: 'Register' });
    screen.getByRole('button', { name: 'File system configuration' });
    screen.getByRole('button', { name: 'Content' });
    screen.getByRole('button', { name: 'Additional Red Hat packages' });
    screen.getByRole('button', { name: 'Custom repositories' });
    screen.getByRole('button', { name: 'Name image' });
    screen.getByRole('button', { name: 'Review' });
  });
});

describe('Step Upload to AWS', () => {
  const user = userEvent.setup();
  const setUp = () => {
    const view = renderWithReduxRouter(<CreateImageWizard />);
    history = view.history;
    store = view.store;

    // select aws as upload destination
    const awsTile = screen.getByTestId('upload-aws');
    awsTile.click();

    getNextButton().click();

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Target environment - Amazon Web Services'
    );
  };

  test('component renders error state correctly', async () => {
    setUp();
    server.use(
      rest.get(
        'http://localhost'.concat(PROVISIONING_SOURCES_ENDPOINT),
        (req, res, ctx) => res(ctx.status(500))
      )
    );

    await screen.findByText(
      /sources cannot be reached, try again later or enter an aws account id manually\./i
    );
    //
  });

  test('validation works', async () => {
    setUp();

    expect(getNextButton()).toHaveClass('pf-m-disabled');

    await user.click(
      screen.getByRole('radio', { name: /manually enter an account id\./i })
    );

    expect(getNextButton()).toHaveClass('pf-m-disabled');

    await user.type(screen.getByTestId('aws-account-id'), '012345678901');

    expect(getNextButton()).not.toHaveClass('pf-m-disabled');

    screen
      .getByRole('radio', { name: /use an account configured from sources\./i })
      .click();

    expect(getNextButton()).toHaveClass('pf-m-disabled');

    const sourceDropdown = screen.getByRole('textbox', {
      name: /select source/i,
    });
    // Wait for isSuccess === true, dropdown is disabled while isSuccess === false
    await waitFor(() => expect(sourceDropdown).toBeEnabled());
    sourceDropdown.click();

    const source = await screen.findByRole('option', {
      name: /my_source 123456789012/i,
    });
    source.click();

    expect(getNextButton()).not.toHaveClass('pf-m-disabled');
  });

  test('compose request share_with_sources field is correct', async () => {
    setUp();

    const sourceDropdown = screen.getByRole('textbox', {
      name: /select source/i,
    });
    // Wait for isSuccess === true, dropdown is disabled while isSuccess === false
    await waitFor(() => expect(sourceDropdown).toBeEnabled());
    sourceDropdown.click();

    const source = await screen.findByRole('option', {
      name: /my_source/i,
    });
    source.click();

    getNextButton().click();

    // registration
    await screen.findByRole('textbox', {
      name: 'Select activation key',
    });

    const registerLaterRadio = screen.getByLabelText('Register later');
    await user.click(registerLaterRadio);

    // click through to review step
    getNextButton().click();
    getNextButton().click();
    getNextButton().click();
    getNextButton().click();
    getNextButton().click();

    const composeImage = jest
      .spyOn(api, 'composeImage')
      .mockImplementation((body) => {
        expect(body).toEqual({
          distribution: RHEL_9,
          image_name: undefined,
          customizations: {
            packages: undefined,
          },
          image_requests: [
            {
              architecture: 'x86_64',
              image_type: 'aws',
              upload_request: {
                type: 'aws',
                options: {
                  share_with_sources: ['123'],
                },
              },
            },
          ],
        });
        const id = 'edbae1c2-62bc-42c1-ae0c-3110ab718f5a';
        return Promise.resolve({ id });
      });

    const create = screen.getByRole('button', { name: /Create/ });
    create.click();

    // API request sent to backend
    expect(composeImage).toHaveBeenCalledTimes(1);

    // returns back to the landing page
    await waitFor(() =>
      expect(history.location.pathname).toBe('/insights/image-builder')
    );
    expect(store.getState().composes.allIds).toEqual([
      'edbae1c2-62bc-42c1-ae0c-3110ab718f5a',
    ]);
    // set test timeout of 10 seconds
  }, 10000);
});

describe('Step Packages', () => {
  const user = userEvent.setup();
  const setUp = async () => {
    history = renderWithReduxRouter(<CreateImageWizard />).history;

    // select aws as upload destination
    const awsTile = screen.getByTestId('upload-aws');
    awsTile.click();
    getNextButton().click();

    // aws step
    screen
      .getByRole('radio', { name: /manually enter an account id\./i })
      .click();
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

  test('search results should be sorted with most relevant results first', async () => {
    await setUp();

    const searchbox = screen.getAllByRole('textbox')[0]; // searching by id doesn't update the input ref

    expect(searchbox).toBeDisabled();
    await waitFor(() => expect(searchbox).toBeEnabled());
    searchbox.click();

    await searchForAvailablePackages(searchbox, 'test');

    const availablePackagesList = await screen.findByTestId(
      'available-pkgs-list'
    );
    const availablePackagesItems = await within(
      availablePackagesList
    ).findAllByRole('option');
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
    // skip Custom repositories page
    screen.getByRole('button', { name: /Next/ }).click();

    // skip name page
    screen.getByRole('button', { name: /Next/ }).click();

    // review page
    screen.getByRole('button', { name: /Next/ }).click();

    // await screen.findByTestId('chosen-packages-count');
    const chosen = await screen.findByTestId('chosen-packages-count');
    expect(chosen).toHaveTextContent('2');
  });

  test('should display empty available state on failed search', async () => {
    await setUp();

    const searchbox = screen.getAllByRole('textbox')[0]; // searching by id doesn't update the input ref

    expect(searchbox).toBeDisabled();
    await waitFor(() => expect(searchbox).toBeEnabled());
    searchbox.click();

    await searchForAvailablePackages(searchbox, 'asdf');

    await screen.findByText('No results found');
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

  test('search results should be sorted alphabetically', async () => {
    await setUp();

    const searchbox = screen.getAllByRole('textbox')[0]; // searching by id doesn't update the input ref

    expect(searchbox).toBeDisabled();
    await waitFor(() => expect(searchbox).toBeEnabled());
    searchbox.click();

    const getPackages = jest
      .spyOn(api, 'getPackagesContentSources')
      .mockImplementation(() =>
        Promise.resolve(mockPkgResultAlphaContentSources)
      );

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

describe('Step Custom repositories', () => {
  const user = userEvent.setup();
  const setUp = async () => {
    history = renderWithReduxRouter(<CreateImageWizard />).history;

    // select aws as upload destination
    const awsTile = screen.getByTestId('upload-aws');
    awsTile.click();
    getNextButton().click();

    // aws step
    screen
      .getByRole('radio', { name: /manually enter an account id\./i })
      .click();
    await user.type(screen.getByTestId('aws-account-id'), '012345678901');
    getNextButton().click();
    // skip registration
    await screen.findByRole('textbox', {
      name: 'Select activation key',
    });

    const registerLaterRadio = screen.getByLabelText('Register later');
    await user.click(registerLaterRadio);
    getNextButton().click();

    // skip fsc
    getNextButton().click();

    // skip packages
    getNextButton().click();
  };

  test('show only valid (successful) repositories', async () => {
    jest
      .spyOn(api, 'getRepositories')
      .mockImplementation(() => Promise.resolve(mockRepositoryResults));

    await setUp();

    // Display all repositories on one page
    screen.getByRole('button', { name: /items per page/i }).click();
    screen.getByRole('menuitem', { name: /100 per page/i }).click();

    // gnome-shell-extensions should not be present
    const table = await screen.findByTestId('repositories-table');
    const { getAllByRole } = within(table);
    const rows = getAllByRole('row');

    // remove first row from list since it is just header labels
    rows.shift();

    // mockRepositoryResults has 21 repositories, gnome-shell-extensions status is
    // 'Invalid' and it should not appear in table
    expect(rows).toHaveLength(20);
    expect(table).not.toHaveTextContent('gnome-shell-extensions');
  });

  test('selected packages stored in and retrieved from form state', async () => {
    jest
      .spyOn(api, 'getRepositories')
      .mockImplementation(() => Promise.resolve(mockRepositoryResults));

    await setUp();

    const getFirstRepoCheckbox = () =>
      screen.getByRole('checkbox', {
        name: /select row 0/i,
      });
    let firstRepoCheckbox = getFirstRepoCheckbox();

    expect(firstRepoCheckbox.checked).toEqual(false);
    await user.click(firstRepoCheckbox);
    expect(firstRepoCheckbox.checked).toEqual(true);

    getNextButton().click();
    getBackButton().click();

    firstRepoCheckbox = getFirstRepoCheckbox();
    expect(firstRepoCheckbox.checked).toEqual(true);
  });

  test('all repositories are fetched when number of repositories is greater than API limit', async () => {
    jest.spyOn(api, 'getRepositories').mockImplementation((limit) => {
      return limit
        ? Promise.resolve(mockRepositoryResponseAll)
        : Promise.resolve(mockRepositoryResponsePartial);
    });

    await setUp();
    screen
      .getByRole('button', {
        name: /select/i,
      })
      .click();

    screen.getByText(/select all \(132 items\)/i);
  });

  test('filter works', async () => {
    jest
      .spyOn(api, 'getRepositories')
      .mockImplementation(() => Promise.resolve(mockRepositoryResults));
    await setUp();

    await user.type(
      screen.getByRole('textbox', { name: /search repositories/i }),
      '2'
    );

    // gnome-shell-extensions is invalid and should not be present
    const table = await screen.findByTestId('repositories-table');
    const { getAllByRole } = within(table);
    const getRows = () => getAllByRole('row');

    let rows = getRows();
    // remove first row from list since it is just header labels
    rows.shift();

    expect(rows).toHaveLength(4);

    // clear filter
    screen.getByRole('button', { name: /reset/i }).click();

    rows = getRows();
    // remove first row from list since it is just header labels
    rows.shift();

    expect(rows).toHaveLength(10);
  });
});

describe('Click through all steps', () => {
  const user = userEvent.setup();

  jest
    .spyOn(api, 'getRepositories')
    .mockImplementation(() => Promise.resolve(mockRepositoryResults));

  const setUp = async () => {
    const view = renderWithReduxRouter(<CreateImageWizard />);
    history = view.history;
    store = view.store;
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
    screen
      .getByRole('radio', { name: /manually enter an account id\./i })
      .click();
    await user.type(screen.getByTestId('aws-account-id'), '012345678901');
    screen.getByRole('button', { name: /Next/ }).click();

    await user.type(screen.getByTestId('input-google-email'), 'test@test.com');
    screen.getByRole('button', { name: /Next/ }).click();

    screen.getByTestId('azure-radio-manual').click();
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
    screen.getByRole('button', { name: /Next/ }).click();

    // registration
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
    (await screen.findByTestId('file-system-config-radio-manual')).click();
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

    // Custom repositories
    await user.click(screen.getByRole('checkbox', { name: /select row 0/i }));
    await user.click(screen.getByRole('checkbox', { name: /select row 1/i }));
    getNextButton().click();

    // Custom packages
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

    const registrationExpandable = await screen.findByTestId(
      'registration-expandable'
    );
    registrationExpandable.click();
    const review = screen.getByTestId('review-registration');
    expect(review).toHaveTextContent(
      'Use remote host configuration (RHC) utility'
    );

    const imageDetailsExpandable = await screen.findByTestId(
      'image-details-expandable'
    );
    imageDetailsExpandable.click();
    await screen.findByText('MyImageName');

    await screen.findByText('name0');
    await screen.findByText('Self-Support');
    await screen.findByText('Production');

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
    const customizations = {
      payload_repositories: [
        {
          baseurl: 'http://yum.theforeman.org/releases/3.4/el8/x86_64/',
          check_gpg: true,
          gpgkey:
            '-----BEGIN PGP PUBLIC KEY BLOCK-----\n\nmQINBGN9300BEAC1FLODu0cL6saMMHa7yJY1JZUc+jQUI/HdECQrrsTaPXlcc7nM\nykYMMv6amPqbnhH/R5BW2Ano+OMse+PXtUr0NXU4OcvxbnnXkrVBVUf8mXI9DzLZ\njw8KoD+4/s0BuzO78zAJF5uhuyHMAK0ll9v0r92kK45Fas9iZTfRFcqFAzvgjScf\n5jeBnbRs5U3UTz9mtDy802mk357o1A8BD0qlu3kANDpjLbORGWdAj21A6sMJDYXy\nHS9FBNV54daNcr+weky2L9gaF2yFjeu2rSEHCSfkbWfpSiVUx/bDTj7XS6XDOuJT\nJqvGS8jHqjHAIFBirhCA4cY/jLKxWyMr5N6IbXpPAYgt8/YYz2aOYVvdyB8tZ1u1\nkVsMYSGcvTBexZCn1cDkbO6I+waIlsc0uxGqUGBKF83AVYCQqOkBjF1uNnu9qefE\nkEc9obr4JZsAgnisboU25ss5ZJddKlmFMKSi66g4S5ChLEPFq7MB06PhLFioaD3L\nEXza7XitoW5VBwr0BSVKAHMC0T2xbm70zY06a6gQRlvr9a10lPmv4Tptc7xgQReg\nu1TlFPbrkGJ0d8O6vHQRAd3zdsNaVr4gX0Tg7UYiqT9ZUkP7hOc8PYXQ28hHrHTB\nA63MTq0aiPlJ/ivTuX8M6+Bi25dIV6N6IOUi/NQKIYxgovJCDSdCAAM0fQARAQAB\ntCFMdWNhcyBHYXJmaWVsZCA8bHVjYXNAcmVkaGF0LmNvbT6JAlcEEwEIAEEWIQTO\nQZeiHnXqdjmfUURc6PeuecS2PAUCY33fTQIbAwUJA8JnAAULCQgHAgIiAgYVCgkI\nCwIEFgIDAQIeBwIXgAAKCRBc6PeuecS2PCk3D/9jW7xrBB/2MQFKd5l+mNMFyKwc\nL9M/M5RFI9GaQRo55CwnPb0nnxOJR1V5GzZ/YGii53H2ose65CfBOE2L/F/RvKF0\nH9S9MInixlahzzKtV3TpDoZGk5oZIHEMuPmPS4XaHggolrzExY0ib0mQuBBE/uEV\n/HlyHEunBKPhTkAe+6Q+2dl22SUuVfWr4Uzlp65+DkdN3M37WI1a3Suhnef3rOSM\nV6puUzWRR7qcYs5C2In87AcYPn92P5ur1y/C32r8Ftg3fRWnEzI9QfRG52ojNOLK\nyGQ8ZC9PGe0q7VFcF7ridT/uzRU+NVKldbJg+rvBnszb1MjNuR7rUQHyvGmbsUVQ\nRCsgdovkee3lP4gfZHzk2SSLVSo0+NJRNaM90EmPk14Pgi/yfRSDGBVvLBbEanYI\nv1ZtdIPRyKi+/IaMOu/l7nayM/8RzghdU+0f1FAif5qf9nXuI13P8fqcqfu67gNd\nkh0UUF1XyR5UHHEZQQDqCuKEkZJ/+27jYlsG1ZiLb1odlIWoR44RP6k5OJl0raZb\nyLXbAfpITsXiJJBpCam9P9+XR5VSfgkqp5hIa7J8piN3DoMpoExg4PPQr6PbLAJy\nOUCOnuB7yYVbj0wYuMXTuyrcBHh/UymQnS8AMpQoEkCLWS/A/Hze/pD23LgiBoLY\nXIn5A2EOAf7t2IMSlA==\n=OanT\n-----END PGP PUBLIC KEY BLOCK-----',
          rhsm: false,
        },
        {
          baseurl:
            'http://mirror.stream.centos.org/SIGs/9/kmods/x86_64/packages-main/',
          rhsm: false,
        },
      ],
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
    };

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
            customizations: customizations,
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
            customizations: customizations,
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
            customizations: customizations,
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
            customizations: customizations,
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
            customizations: customizations,
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
            customizations: customizations,
          });
          id = 'edbae1c2-62bc-42c1-ae0c-3110ab718f5b';
        }

        ids.unshift(id);
        return Promise.resolve({ id });
      });

    const create = screen.getByRole('button', { name: /Create/ });
    create.click();

    // API request sent to backend
    expect(composeImage).toHaveBeenCalledTimes(6);

    // returns back to the landing page
    await waitFor(() =>
      expect(history.location.pathname).toBe('/insights/image-builder')
    );
    expect(store.getState().composes.allIds).toEqual(ids);
    // set test timeout of 10 seconds
  }, 10000);
});
