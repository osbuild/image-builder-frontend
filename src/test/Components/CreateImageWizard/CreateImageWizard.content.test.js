import React from 'react';

import '@testing-library/jest-dom';

import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import api from '../../../api.js';
import CreateImageWizard from '../../../Components/CreateImageWizard/CreateImageWizard';
import ShareImageModal from '../../../Components/ShareImageModal/ShareImageModal';
import {
  mockPkgResultAlpha,
  mockPkgResultAlphaContentSources,
  mockPkgResultAll,
  mockPkgResultPartial,
} from '../../fixtures/packages';
import {
  clickBack,
  clickNext,
  renderCustomRoutesWithReduxRouter,
  renderWithReduxRouter,
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

let router = undefined;

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

const searchForAvailablePackages = async (searchbox, searchTerm) => {
  const user = userEvent.setup();
  await user.type(searchbox, searchTerm);
  await user.click(
    await screen.findByRole('button', {
      name: /search button for available packages/i,
    })
  );
};

const searchForChosenPackages = async (searchbox, searchTerm) => {
  const user = userEvent.setup();
  if (!searchTerm) {
    await user.clear(searchbox);
  } else {
    await user.type(searchbox, searchTerm);
  }
};

let mockContentSourcesEnabled;
jest.mock('@unleash/proxy-client-react', () => ({
  useUnleashContext: () => jest.fn(),
  useFlag: jest.fn((flag) =>
    flag === 'image-builder.enable-content-sources'
      ? mockContentSourcesEnabled
      : false
  ),
}));

beforeAll(() => {
  // scrollTo is not defined in jsdom
  window.HTMLElement.prototype.scrollTo = function () {};
  mockContentSourcesEnabled = true;
});

afterEach(() => {
  jest.clearAllMocks();
  mockContentSourcesEnabled = true;
});

describe('Step Packages', () => {
  describe('without Content Sources', () => {
    const user = userEvent.setup();
    const setUp = async () => {
      mockContentSourcesEnabled = false;

      ({ router } = await renderCustomRoutesWithReduxRouter(
        'imagewizard',
        {},
        routes
      ));

      // select aws as upload destination
      await user.click(await screen.findByTestId('upload-aws'));
      await clickNext();

      // aws step
      await user.click(
        await screen.findByRole('radio', {
          name: /manually enter an account id\./i,
        })
      );
      await user.type(
        await screen.findByTestId('aws-account-id'),
        '012345678901'
      );
      await clickNext();
      // skip registration
      await screen.findByRole('textbox', {
        name: 'Select activation key',
      });

      await user.click(await screen.findByTestId('registration-radio-later'));
      await clickNext();
      // skip fsc
      await clickNext();
    };

    test('clicking Next loads Image name', async () => {
      await setUp();

      await clickNext();

      await screen.findByRole('heading', {
        name: 'Details',
      });
    });

    test('clicking Back loads file system configuration', async () => {
      await setUp();

      await clickBack();

      await screen.findByRole('heading', {
        name: /file system configuration/i,
      });
    });

    test('clicking Cancel loads landing page', async () => {
      await setUp();

      await verifyCancelButton(router);
    });

    test('should display search bar and button', async () => {
      await setUp();

      await user.type(
        await screen.findByTestId('search-available-pkgs-input'),
        'test'
      );

      await screen.findByRole('button', {
        name: 'Search button for available packages',
      });
    });

    test('should display default state', async () => {
      await setUp();

      await screen.findByText(
        'Search above to add additionalpackages to your image'
      );
      await screen.findByText('No packages added');
    });

    test('search results should be sorted with most relevant results first', async () => {
      await setUp();

      const searchbox = screen.getAllByRole('textbox')[0]; // searching by id doesn't update the input ref

      await waitFor(() => expect(searchbox).toBeEnabled());
      await user.click(searchbox);

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

      await waitFor(() => expect(searchbox).toBeEnabled());
      await user.click(searchbox);

      await searchForAvailablePackages(searchbox, 'test');

      await user.click(await screen.findByTestId('available-pkgs-testPkg'));
      await user.click(
        await screen.findByRole('button', { name: /Add selected/ })
      );

      await user.click(await screen.findByTestId('selected-pkgs-testPkg'));
      await user.click(
        await screen.findByRole('button', { name: /Remove selected/ })
      );

      const availablePackagesList = await screen.findByTestId(
        'available-pkgs-list'
      );
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

      await waitFor(() => expect(searchbox).toBeEnabled());
      await user.click(searchbox);

      await searchForAvailablePackages(searchbox, 'test');

      await user.click(await screen.findByRole('button', { name: /Add all/ }));
      await user.click(
        await screen.findByRole('button', { name: /Remove all/ })
      );

      const availablePackagesList = await screen.findByTestId(
        'available-pkgs-list'
      );
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

      await waitFor(() => expect(searchbox).toBeEnabled());
      await user.click(searchbox);

      await searchForAvailablePackages(searchbox, 'test');
      await user.click(await screen.findByRole('button', { name: /Add all/ }));

      // remove a single package
      await user.click(await screen.findByTestId('selected-pkgs-lib-test'));
      await user.click(
        await screen.findByRole('button', { name: /Remove selected/ })
      );

      // skip name page
      clickNext();

      // review page
      clickNext();

      let chosen = await screen.findByTestId('chosen-packages-count');
      expect(chosen).toHaveTextContent('2');

      // remove another package
      clickBack();
      clickBack();
      await screen.findByTestId('search-available-pkgs-input');
      await user.click(
        await screen.findByRole('option', {
          name: /summary for test package/,
        })
      );
      await user.click(
        await screen.findByRole('button', { name: /Remove selected/ })
      );

      // review page
      clickNext();
      clickNext();

      chosen = await screen.findByTestId('chosen-packages-count');
      expect(chosen).toHaveTextContent('1');
    });

    test('should display empty available state on failed search', async () => {
      await setUp();

      const searchbox = screen.getAllByRole('textbox')[0]; // searching by id doesn't update the input ref

      await waitFor(() => expect(searchbox).toBeEnabled());
      await user.click(searchbox);

      await searchForAvailablePackages(searchbox, 'asdf');
      await screen.findByText('No results found');
    });

    test('should display empty available state on failed search after a successful search', async () => {
      await setUp();

      const searchbox = screen.getAllByRole('textbox')[0]; // searching by id doesn't update the input ref

      await waitFor(() => expect(searchbox).toBeEnabled());
      await user.click(searchbox);

      await searchForAvailablePackages(searchbox, 'test');

      await user.click(
        await screen.findByRole('button', {
          name: /clear available packages search/i,
        })
      );

      await searchForAvailablePackages(searchbox, 'asdf');

      await screen.findByText('No results found');
    });

    test('should display empty chosen state on failed search', async () => {
      await setUp();

      const searchboxAvailable = screen.getAllByRole('textbox')[0]; // searching by id doesn't update the input ref
      const searchboxChosen = screen.getAllByRole('textbox')[1];

      await waitFor(() => expect(searchboxAvailable).toBeEnabled());
      await user.click(searchboxAvailable);
      await searchForAvailablePackages(searchboxAvailable, 'test');

      await user.click(await screen.findByRole('button', { name: /Add all/ }));

      await user.click(searchboxChosen);
      await user.type(searchboxChosen, 'asdf');

      expect(await screen.findByText('No packages found')).toBeInTheDocument();
      // We need to clear this input in order to not have sideeffects on other tests
      await searchForChosenPackages(searchboxChosen, '');
    });

    test('should display warning when over hundred results were found', async () => {
      await setUp();

      const searchbox = screen.getAllByRole('textbox')[0]; // searching by id doesn't update the input ref

      await waitFor(() => expect(searchbox).toBeEnabled());
      await user.click(searchbox);

      const getPackages = jest
        .spyOn(api, 'getPackages')
        .mockImplementation((distribution, architecture, search, limit) => {
          return limit
            ? Promise.resolve(mockPkgResultAll)
            : Promise.resolve(mockPkgResultPartial);
        });

      await searchForAvailablePackages(searchbox, 'testPkg');
      await waitFor(() => expect(getPackages).toHaveBeenCalledTimes(2));

      await screen.findByText('Over 100 results found. Refine your search.');
      await screen.findByText('Too many results to display');
    });

    test('should display an exact match if found regardless of too many results', async () => {
      await setUp();

      const searchbox = screen.getAllByRole('textbox')[0]; // searching by id doesn't update the input ref

      await waitFor(() => expect(searchbox).toBeEnabled());
      await user.click(searchbox);

      const getPackages = jest
        .spyOn(api, 'getPackages')
        .mockImplementation((distribution, architecture, search, limit) => {
          return limit
            ? Promise.resolve(mockPkgResultAll)
            : Promise.resolve(mockPkgResultPartial);
        });

      await searchForAvailablePackages(searchbox, 'testPkg-128');
      await waitFor(() => expect(getPackages).toHaveBeenCalledTimes(2));

      const availablePackagesList = await screen.findByTestId(
        'available-pkgs-list'
      );
      const availablePackagesItems = await within(
        availablePackagesList
      ).findByRole('option');
      expect(availablePackagesItems).toBeInTheDocument();
      await screen.findByText('Exact match');
      await screen.findByText('testPkg-128');
      await screen.findByText('Too many results to display');
    });

    test('search results should be sorted alphabetically', async () => {
      await setUp();

      const searchbox = screen.getAllByRole('textbox')[0]; // searching by id doesn't update the input ref

      await waitFor(() => expect(searchbox).toBeEnabled());
      await user.click(searchbox);

      const getPackages = jest
        .spyOn(api, 'getPackages')
        .mockImplementation(() => Promise.resolve(mockPkgResultAlpha));

      await searchForAvailablePackages(searchbox, 'test');
      await waitFor(() => expect(getPackages).toHaveBeenCalledTimes(1));

      const availablePackagesList = await screen.findByTestId(
        'available-pkgs-list'
      );
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

      await waitFor(() => expect(searchbox).toBeEnabled());
      await user.click(searchbox);

      await searchForAvailablePackages(searchbox, 'test');

      const availablePackagesList = await screen.findByTestId(
        'available-pkgs-list'
      );
      const availablePackagesItems = await within(
        availablePackagesList
      ).findAllByRole('option');
      expect(availablePackagesItems).toHaveLength(3);

      await user.click(
        await screen.findByRole('button', {
          name: /clear available packages search/i,
        })
      );

      await screen.findByText(
        'Search above to add additionalpackages to your image'
      );
    });

    test('chosen packages can be reset after filtering', async () => {
      await setUp();

      const availableSearchbox = screen.getAllByRole('textbox')[0];

      await waitFor(() => expect(availableSearchbox).toBeEnabled());
      await user.click(availableSearchbox);

      await searchForAvailablePackages(availableSearchbox, 'test');

      const availablePackagesList = await screen.findByTestId(
        'available-pkgs-list'
      );
      const availablePackagesItems = await within(
        availablePackagesList
      ).findAllByRole('option');
      await waitFor(() => expect(availablePackagesItems).toHaveLength(3));

      await user.click(await screen.findByRole('button', { name: /Add all/ }));

      const chosenPackagesList = await screen.findByTestId('chosen-pkgs-list');
      let chosenPackagesItems = await within(chosenPackagesList).findAllByRole(
        'option'
      );
      await waitFor(() => expect(chosenPackagesItems).toHaveLength(3));

      const chosenSearchbox = screen.getAllByRole('textbox')[1];
      await user.click(chosenSearchbox);
      await searchForChosenPackages(chosenSearchbox, 'lib');
      chosenPackagesItems = await within(chosenPackagesList).findAllByRole(
        'option'
      );
      expect(chosenPackagesItems).toHaveLength(1);

      await user.click(
        await screen.findByRole('button', {
          name: /clear chosen packages search/i,
        })
      );
      chosenPackagesItems = await within(chosenPackagesList).findAllByRole(
        'option'
      );
      await waitFor(() => expect(chosenPackagesItems).toHaveLength(3));
    });
  });

  describe('with Content Sources', () => {
    const user = userEvent.setup();
    const setUp = async () => {
      ({ router } = renderCustomRoutesWithReduxRouter(
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
      await user.click(
        await screen.findByRole('radio', {
          name: /manually enter an account id\./i,
        })
      );
      await user.type(
        await screen.findByTestId('aws-account-id'),
        '012345678901'
      );
      await clickNext();
      // skip registration
      await screen.findByRole('textbox', {
        name: 'Select activation key',
      });

      const registerLaterRadio = await screen.findByTestId(
        'registration-radio-later'
      );
      await user.click(registerLaterRadio);
      await clickNext();
      // skip fsc
      await clickNext();
    };

    test('search results should be sorted with most relevant results first', async () => {
      await setUp();

      const view = await screen.findByTestId('search-available-pkgs-input');

      const searchbox = await within(view).findByRole('textbox', {
        name: /search input/i,
      });

      await waitFor(() => expect(searchbox).toBeEnabled());
      await user.click(searchbox);

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

      await waitFor(() => expect(searchbox).toBeEnabled());
      await user.click(searchbox);

      await searchForAvailablePackages(searchbox, 'test');

      await user.click(await screen.findByTestId('available-pkgs-testPkg'));
      await user.click(
        await screen.findByRole('button', { name: /Add selected/ })
      );

      await user.click(await screen.findByTestId('selected-pkgs-testPkg'));
      await user.click(
        await screen.findByRole('button', { name: /Remove selected/ })
      );

      const availablePackagesList = await screen.findByTestId(
        'available-pkgs-list'
      );
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

      await waitFor(() => expect(searchbox).toBeEnabled());
      await user.click(searchbox);

      await searchForAvailablePackages(searchbox, 'test');

      await user.click(await screen.findByRole('button', { name: /Add all/ }));
      await user.click(
        await screen.findByRole('button', { name: /Remove all/ })
      );

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

    test('removing a single package updates the state correctly', async () => {
      await setUp();

      const searchbox = screen.getAllByRole('textbox')[0]; // searching by id doesn't update the input ref

      await waitFor(() => expect(searchbox).toBeEnabled());
      await user.click(searchbox);

      await searchForAvailablePackages(searchbox, 'test');
      await user.click(await screen.findByRole('button', { name: /Add all/ }));

      // remove a single package
      await user.click(await screen.findByTestId('selected-pkgs-lib-test'));
      await user.click(
        await screen.findByRole('button', { name: /Remove selected/ })
      );
      // skip Custom repositories page
      clickNext();

      // skip name page
      clickNext();

      // review page
      clickNext();

      const chosen = await screen.findByTestId('chosen-packages-count');
      expect(chosen).toHaveTextContent('2');
    });

    test('should display empty available state on failed search', async () => {
      await setUp();

      const searchbox = screen.getAllByRole('textbox')[0]; // searching by id doesn't update the input ref

      await waitFor(() => expect(searchbox).toBeEnabled());
      await user.click(searchbox);

      await searchForAvailablePackages(searchbox, 'asdf');

      await screen.findByText('No results found');
    });

    test('should display empty chosen state on failed search', async () => {
      await setUp();

      const searchboxAvailable = screen.getAllByRole('textbox')[0]; // searching by id doesn't update the input ref
      const searchboxChosen = screen.getAllByRole('textbox')[1];

      await waitFor(() => expect(searchboxAvailable).toBeEnabled());
      await user.click(searchboxAvailable);
      await searchForAvailablePackages(searchboxAvailable, 'test');

      await user.click(await screen.findByRole('button', { name: /Add all/ }));

      await user.click(searchboxChosen);
      await user.type(searchboxChosen, 'asdf');

      expect(await screen.findByText('No packages found')).toBeInTheDocument();
      // We need to clear this input in order to not have sideeffects on other tests
      await searchForChosenPackages(searchboxChosen, '');
    });

    test('search results should be sorted alphabetically', async () => {
      await setUp();

      const searchbox = screen.getAllByRole('textbox')[0]; // searching by id doesn't update the input ref

      await waitFor(() => expect(searchbox).toBeEnabled());
      await user.click(searchbox);

      const getPackages = jest
        .spyOn(api, 'getPackagesContentSources')
        .mockImplementation(() =>
          Promise.resolve(mockPkgResultAlphaContentSources)
        );

      await searchForAvailablePackages(searchbox, 'test');
      await waitFor(() => expect(getPackages).toHaveBeenCalledTimes(1));

      const availablePackagesList = await screen.findByTestId(
        'available-pkgs-list'
      );
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

      await waitFor(() => expect(searchbox).toBeEnabled());
      await user.click(searchbox);

      await searchForAvailablePackages(searchbox, 'test');

      const availablePackagesList = await screen.findByTestId(
        'available-pkgs-list'
      );
      const availablePackagesItems = await within(
        availablePackagesList
      ).findAllByRole('option');
      expect(availablePackagesItems).toHaveLength(3);

      await user.click(
        await screen.findByRole('button', {
          name: /clear available packages search/i,
        })
      );

      await screen.findByText(
        'Search above to add additionalpackages to your image'
      );
    });

    test('chosen packages can be reset after filtering', async () => {
      await setUp();

      const availableSearchbox = screen.getAllByRole('textbox')[0];

      await waitFor(() => expect(availableSearchbox).toBeEnabled());
      await user.click(availableSearchbox);

      await searchForAvailablePackages(availableSearchbox, 'test');

      const availablePackagesList = await screen.findByTestId(
        'available-pkgs-list'
      );
      const availablePackagesItems = await within(
        availablePackagesList
      ).findAllByRole('option');
      expect(availablePackagesItems).toHaveLength(3);

      await user.click(await screen.findByRole('button', { name: /Add all/ }));

      const chosenPackagesList = await screen.findByTestId('chosen-pkgs-list');
      let chosenPackagesItems = await within(chosenPackagesList).findAllByRole(
        'option'
      );
      expect(chosenPackagesItems).toHaveLength(3);

      const chosenSearchbox = screen.getAllByRole('textbox')[1];
      await user.click(chosenSearchbox);
      await searchForChosenPackages(chosenSearchbox, 'lib');
      chosenPackagesItems = within(chosenPackagesList).getAllByRole('option');
      expect(chosenPackagesItems).toHaveLength(1);

      await user.click(
        await screen.findByRole('button', {
          name: /clear chosen packages search/i,
        })
      );
      chosenPackagesItems = await within(chosenPackagesList).findAllByRole(
        'option'
      );
      await waitFor(() => expect(chosenPackagesItems).toHaveLength(3));
    });
  });
});

describe('Step Custom repositories', () => {
  const user = userEvent.setup();
  const setUp = async () => {
    ({ router } = renderCustomRoutesWithReduxRouter('imagewizard', {}, routes));

    // select aws as upload destination
    await user.click(await screen.findByTestId('upload-aws'));
    await clickNext();

    // aws step
    await user.click(
      await screen.findByRole('radio', {
        name: /manually enter an account id\./i,
      })
    );
    await user.type(
      await screen.findByTestId('aws-account-id'),
      '012345678901'
    );

    await clickNext();
    // skip registration
    await screen.findByRole('textbox', {
      name: 'Select activation key',
    });

    await user.click(await screen.findByLabelText('Register later'));
    await clickNext();
    // skip fsc
    await clickNext();
    // skip packages
    await clickNext();
  };

  test('selected repositories stored in and retrieved from form state', async () => {
    await setUp();

    const getFirstRepoCheckbox = async () =>
      await screen.findByRole('checkbox', {
        name: /select row 0/i,
      });
    let firstRepoCheckbox = await getFirstRepoCheckbox();

    expect(firstRepoCheckbox.checked).toEqual(false);
    await user.click(firstRepoCheckbox);
    await waitFor(() => expect(firstRepoCheckbox.checked).toEqual(true));

    await clickNext();
    await clickBack();

    firstRepoCheckbox = await getFirstRepoCheckbox();
    await waitFor(() => expect(firstRepoCheckbox.checked).toEqual(true));
  });

  test('correct number of repositories is fetched', async () => {
    await setUp();

    await user.click(
      await screen.findByRole('button', {
        name: /^select$/i,
      })
    );

    await screen.findByText(/select all \(1015 items\)/i);
  });

  test('filter works', async () => {
    await setUp();

    await user.type(
      await screen.findByRole('textbox', { name: /search repositories/i }),
      '2zmya'
    );

    const table = await screen.findByTestId('repositories-table');
    const { getAllByRole } = within(table);
    const getRows = () => getAllByRole('row');

    let rows = getRows();
    // remove first row from list since it is just header labels
    rows.shift();

    expect(rows).toHaveLength(1);

    // clear filter
    await user.click(await screen.findByRole('button', { name: /reset/i }));

    rows = getRows();
    // remove first row from list since it is just header labels
    rows.shift();

    await waitFor(() => expect(rows).toHaveLength(10));
  });

  test('press on Selected button to see selected repositories list', async () => {
    await setUp();

    const getFirstRepoCheckbox = async () =>
      await screen.findByRole('checkbox', {
        name: /select row 0/i,
      });
    const firstRepoCheckbox = await getFirstRepoCheckbox();

    expect(firstRepoCheckbox.checked).toEqual(false);
    await user.click(firstRepoCheckbox);
    expect(firstRepoCheckbox.checked).toEqual(true);

    const getSelectedButton = async () =>
      await screen.findByRole('button', {
        name: /selected repositories/i,
      });

    const selectedButton = await getSelectedButton();
    await user.click(selectedButton);

    expect(firstRepoCheckbox.checked).toEqual(true);

    await clickNext();
    clickBack();
    expect(firstRepoCheckbox.checked).toEqual(true);
  });

  test('press on All button to see all repositories list', async () => {
    await setUp();

    const getFirstRepoCheckbox = async () =>
      await screen.findByRole('checkbox', {
        name: /select row 0/i,
      });
    const firstRepoCheckbox = await getFirstRepoCheckbox();

    const getSecondRepoCheckbox = async () =>
      await screen.findByRole('checkbox', {
        name: /select row 1/i,
      });
    const secondRepoCheckbox = await getSecondRepoCheckbox();

    expect(firstRepoCheckbox.checked).toEqual(false);
    expect(secondRepoCheckbox.checked).toEqual(false);
    await user.click(firstRepoCheckbox);
    expect(firstRepoCheckbox.checked).toEqual(true);
    expect(secondRepoCheckbox.checked).toEqual(false);

    const getAllButton = async () =>
      await screen.findByRole('button', {
        name: /all repositories/i,
      });

    const allButton = await getAllButton();
    await user.click(allButton);

    expect(firstRepoCheckbox.checked).toEqual(true);
    expect(secondRepoCheckbox.checked).toEqual(false);

    await clickNext();
    clickBack();

    expect(firstRepoCheckbox.checked).toEqual(true);
    expect(secondRepoCheckbox.checked).toEqual(false);
  });

  test('press on Selected button to see selected repositories list at the second page and filter checked repo', async () => {
    await setUp();

    const getFirstRepoCheckbox = async () =>
      await screen.findByRole('checkbox', {
        name: /select row 0/i,
      });

    const firstRepoCheckbox = await getFirstRepoCheckbox();

    const getNextPageButton = async () =>
      await screen.findByRole('button', {
        name: /go to next page/i,
      });

    const nextPageButton = await getNextPageButton();

    expect(firstRepoCheckbox.checked).toEqual(false);
    await user.click(firstRepoCheckbox);
    expect(firstRepoCheckbox.checked).toEqual(true);

    await user.click(nextPageButton);

    const getSelectedButton = async () =>
      await screen.findByRole('button', {
        name: /selected repositories/i,
      });

    const selectedButton = await getSelectedButton();
    await user.click(selectedButton);

    expect(firstRepoCheckbox.checked).toEqual(true);

    await user.type(
      await screen.findByRole('textbox', { name: /search repositories/i }),
      '13lk3'
    );

    expect(firstRepoCheckbox.checked).toEqual(true);

    await clickNext();
    clickBack();
    expect(firstRepoCheckbox.checked).toEqual(true);
    await user.click(firstRepoCheckbox);
    expect(firstRepoCheckbox.checked).toEqual(false);
  });
});

describe('On Recreate', () => {
  const user = userEvent.setup();
  const setUp = async () => {
    ({ router } = renderWithReduxRouter(
      'imagewizard/hyk93673-8dcc-4a61-ac30-e9f4940d8346'
    ));
  };

  const setUpUnavailableRepo = async () => {
    ({ router } = renderWithReduxRouter(
      'imagewizard/b7193673-8dcc-4a5f-ac30-e9f4940d8346'
    ));
  };

  test('with valid repositories', async () => {
    await setUp();

    await screen.findByRole('heading', { name: /review/i });
    expect(
      screen.queryByText('Previously added custom repository unavailable')
    ).not.toBeInTheDocument();

    const createImageButton = await screen.findByRole('button', {
      name: /create image/i,
    });
    await waitFor(() => expect(createImageButton).toBeEnabled());

    await user.click(
      await screen.findByRole('button', { name: /custom repositories/i })
    );

    await screen.findByRole('heading', { name: /custom repositories/i });
    expect(
      screen.queryByText('Previously added custom repository unavailable')
    ).not.toBeInTheDocument();

    const table = await screen.findByTestId('repositories-table');

    const { getAllByRole } = within(table);
    const rows = getAllByRole('row');

    const availableRepo = rows[1].cells[1];
    expect(availableRepo).toHaveTextContent(
      '13lk3http://yum.theforeman.org/releases/3.4/el8/x86_64/'
    );

    const availableRepoCheckbox = await screen.findByRole('checkbox', {
      name: /select row 0/i,
    });
    await waitFor(() => expect(availableRepoCheckbox).toBeEnabled());
  });

  test('with repositories that are no longer available', async () => {
    await setUpUnavailableRepo();

    await screen.findByRole('heading', { name: /review/i });
    await screen.findByText('Previously added custom repository unavailable');

    const createImageButton = await screen.findByRole('button', {
      name: /create image/i,
    });
    expect(createImageButton).toBeDisabled();

    await user.click(
      await screen.findByRole('button', { name: /custom repositories/i })
    );

    await screen.findByRole('heading', { name: /custom repositories/i });
    await screen.findByText('Previously added custom repository unavailable');

    const table = await screen.findByTestId('repositories-table');

    const { getAllByRole } = within(table);
    const rows = getAllByRole('row');

    const unavailableRepo = rows[1].cells[1];
    expect(unavailableRepo).toHaveTextContent(
      'Repository with the following url is no longer available:http://unreachable.link.to.repo.org/x86_64/'
    );

    const unavailableRepoCheckbox = await screen.findByRole('checkbox', {
      name: /select row 0/i,
    });
    expect(unavailableRepoCheckbox).toBeDisabled();
  });
});
