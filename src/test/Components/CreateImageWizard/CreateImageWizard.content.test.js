import React from 'react';

import '@testing-library/jest-dom';

import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import api from '../../../api.js';
import CreateImageWizard from '../../../Components/CreateImageWizard/CreateImageWizard';
import ShareImageModal from '../../../Components/ShareImageModal/ShareImageModal';
import { mockComposesEmpty } from '../../fixtures/composes';
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

// Mocking getComposes is necessary because in many tests we call navigate()
// to navigate to the images table (via useNavigate hook), which will in turn
// result in a call to getComposes. If it is not mocked, tests fail due to MSW
// being unable to resolve that endpoint.
jest
  .spyOn(api, 'getComposes')
  .mockImplementation(() => Promise.resolve(mockComposesEmpty));

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

      ({ router } = renderCustomRoutesWithReduxRouter(
        'imagewizard',
        {},
        routes
      ));

      // select aws as upload destination
      const awsTile = screen.getByTestId('upload-aws');
      await act(async () => {
        awsTile.click();
        await clickNext();
      });

      // aws step
      const manualRadio = screen.getByRole('radio', {
        name: /manually enter an account id\./i,
      });
      manualRadio.click();
      const aai = screen.getByTestId('aws-account-id');
      await act(async () => {
        await user.type(aai, '012345678901');
        await clickNext();
      });
      // skip registration
      await screen.findByRole('textbox', {
        name: 'Select activation key',
      });

      const registerLaterRadio = screen.getByTestId('registration-radio-later');
      await act(async () => {
        await user.click(registerLaterRadio);
        await clickNext();
        // skip fsc
        await clickNext();
      });
    };

    test('clicking Next loads Image name', async () => {
      await setUp();

      await act(async () => {
        await clickNext();
      });

      screen.getByRole('heading', {
        name: 'Details',
      });
    });

    test('clicking Back loads file system configuration', async () => {
      await setUp();

      await act(async () => {
        await clickBack();
      });

      screen.getByRole('heading', { name: /file system configuration/i });
    });

    test('clicking Cancel loads landing page', async () => {
      await setUp();

      await verifyCancelButton(router);
    });

    test('should display search bar and button', async () => {
      await setUp();

      const sapi = screen.getByTestId('search-available-pkgs-input');
      await act(async () => {
        await user.type(sapi, 'test');
      });

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

      await waitFor(() => expect(searchbox).toBeEnabled());
      await act(async () => {
        searchbox.click();
      });

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

      await waitFor(() => expect(searchbox).toBeEnabled());
      await act(async () => {
        searchbox.click();
      });

      await searchForAvailablePackages(searchbox, 'test');

      const apt = screen.getByTestId('available-pkgs-testPkg');
      await act(async () => {
        apt.click();
      });
      const bas = screen.getByRole('button', { name: /Add selected/ });
      await act(async () => {
        bas.click();
      });

      const spt = screen.getByTestId('selected-pkgs-testPkg');
      await act(async () => {
        spt.click();
      });
      const brs = screen.getByRole('button', { name: /Remove selected/ });
      await act(async () => {
        brs.click();
      });

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

      await waitFor(() => expect(searchbox).toBeEnabled());
      await act(async () => {
        searchbox.click();
      });

      await searchForAvailablePackages(searchbox, 'test');

      const baa = screen.getByRole('button', { name: /Add all/ });
      await act(async () => {
        baa.click();
      });
      const bra = screen.getByRole('button', { name: /Remove all/ });
      await act(async () => {
        bra.click();
      });

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

      await waitFor(() => expect(searchbox).toBeEnabled());
      await act(async () => {
        searchbox.click();
      });

      await searchForAvailablePackages(searchbox, 'test');
      const baa = screen.getByRole('button', { name: /Add all/ });
      await act(async () => {
        baa.click();
      });

      // remove a single package
      const splt = screen.getByTestId('selected-pkgs-lib-test');
      await act(async () => {
        splt.click();
      });
      const brs = screen.getByRole('button', { name: /Remove selected/ });
      await act(async () => {
        brs.click();
      });

      // skip name page
      const bn1 = screen.getByRole('button', { name: /Next/ });
      await act(async () => {
        bn1.click();
      });

      // review page
      const bn2 = screen.getByRole('button', { name: /Next/ });
      await act(async () => {
        bn2.click();
      });

      // await screen.findByTestId('chosen-packages-count');
      let chosen = await screen.findByTestId('chosen-packages-count');
      expect(chosen).toHaveTextContent('2');

      // remove another package
      const bb1 = screen.getByRole('button', { name: /Back/ });
      await act(async () => {
        bb1.click();
      });
      const bb2 = screen.getByRole('button', { name: /Back/ });
      await act(async () => {
        bb2.click();
      });
      await screen.findByTestId('search-available-pkgs-input');
      const op = screen.getByRole('option', {
        name: /summary for test package/,
      });
      await act(async () => {
        op.click();
      });
      const brs2 = screen.getByRole('button', { name: /Remove selected/ });
      await act(async () => {
        brs2.click();
      });

      // review page
      const n1 = screen.getByRole('button', { name: /Next/ });
      await act(async () => {
        n1.click();
      });
      const n2 = screen.getByRole('button', { name: /Next/ });
      await act(async () => {
        n2.click();
      });

      // await screen.findByTestId('chosen-packages-count');
      chosen = await screen.findByTestId('chosen-packages-count');
      expect(chosen).toHaveTextContent('1');
    });

    test('should display empty available state on failed search', async () => {
      await setUp();

      const searchbox = screen.getAllByRole('textbox')[0]; // searching by id doesn't update the input ref

      await waitFor(() => expect(searchbox).toBeEnabled());
      await act(async () => {
        searchbox.click();
      });

      await searchForAvailablePackages(searchbox, 'asdf');
      screen.getByText('No results found');
    });

    test('should display empty available state on failed search after a successful search', async () => {
      await setUp();

      const searchbox = screen.getAllByRole('textbox')[0]; // searching by id doesn't update the input ref

      await waitFor(() => expect(searchbox).toBeEnabled());
      await act(async () => {
        searchbox.click();
      });

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

      await waitFor(() => expect(searchboxAvailable).toBeEnabled());
      searchboxAvailable.click();
      await searchForAvailablePackages(searchboxAvailable, 'test');

      screen.getByRole('button', { name: /Add all/ }).click();

      searchboxChosen.click();
      await user.type(searchboxChosen, 'asdf');

      expect(screen.getByText('No packages found')).toBeInTheDocument();
      // We need to clear this input in order to not have sideeffects on other tests
      await searchForChosenPackages(searchboxChosen, '');
    });

    test('should display warning when over hundred results were found', async () => {
      await setUp();

      const searchbox = screen.getAllByRole('textbox')[0]; // searching by id doesn't update the input ref

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
      let chosenPackagesItems =
        within(chosenPackagesList).getAllByRole('option');
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

  describe('with Content Sources', () => {
    const user = userEvent.setup();
    const setUp = async () => {
      ({ router } = renderCustomRoutesWithReduxRouter(
        'imagewizard',
        {},
        routes
      ));

      // select aws as upload destination
      const awsTile = screen.getByTestId('upload-aws');
      await act(async () => {
        awsTile.click();
        await clickNext();
      });

      // aws step
      await user.click(
        screen.getByRole('radio', { name: /manually enter an account id\./i })
      );
      await user.type(screen.getByTestId('aws-account-id'), '012345678901');
      await act(async () => {
        await clickNext();
      });
      // skip registration
      await screen.findByRole('textbox', {
        name: 'Select activation key',
      });

      const registerLaterRadio = screen.getByTestId('registration-radio-later');
      await user.click(registerLaterRadio);
      await act(async () => {
        await clickNext();

        // skip fsc
        await clickNext();
      });
    };

    test('search results should be sorted with most relevant results first', async () => {
      await setUp();

      const view = await screen.findByTestId('search-available-pkgs-input');

      const searchbox = within(view).getByRole('textbox', {
        name: /search input/i,
      });

      //const searchbox = screen.getAllByRole('textbox')[0]; // searching by id doesn't update the input ref

      await waitFor(() => expect(searchbox).toBeEnabled());
      await act(async () => {
        searchbox.click();
      });

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
      await act(async () => {
        searchbox.click();
      });

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

      await waitFor(() => expect(searchbox).toBeEnabled());
      searchbox.click();

      await searchForAvailablePackages(searchbox, 'asdf');

      await screen.findByText('No results found');
    });

    test('should display empty chosen state on failed search', async () => {
      await setUp();

      const searchboxAvailable = screen.getAllByRole('textbox')[0]; // searching by id doesn't update the input ref
      const searchboxChosen = screen.getAllByRole('textbox')[1];

      await waitFor(() => expect(searchboxAvailable).toBeEnabled());
      searchboxAvailable.click();
      await searchForAvailablePackages(searchboxAvailable, 'test');

      screen.getByRole('button', { name: /Add all/ }).click();

      searchboxChosen.click();
      await user.type(searchboxChosen, 'asdf');

      expect(screen.getByText('No packages found')).toBeInTheDocument();
      // We need to clear this input in order to not have sideeffects on other tests
      await searchForChosenPackages(searchboxChosen, '');
    });

    test('search results should be sorted alphabetically', async () => {
      await setUp();

      const searchbox = screen.getAllByRole('textbox')[0]; // searching by id doesn't update the input ref

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
      let chosenPackagesItems =
        within(chosenPackagesList).getAllByRole('option');
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
});

describe('Step Custom repositories', () => {
  const user = userEvent.setup();
  const setUp = async () => {
    ({ router } = renderCustomRoutesWithReduxRouter('imagewizard', {}, routes));

    // select aws as upload destination
    const awsTile = screen.getByTestId('upload-aws');
    await act(async () => {
      awsTile.click();
      await clickNext();
    });

    // aws step
    await user.click(
      screen.getByRole('radio', { name: /manually enter an account id\./i })
    );
    await user.type(screen.getByTestId('aws-account-id'), '012345678901');
    await act(async () => {
      await clickNext();
    });
    // skip registration
    await screen.findByRole('textbox', {
      name: 'Select activation key',
    });

    const registerLaterRadio = screen.getByLabelText('Register later');
    await user.click(registerLaterRadio);
    await act(async () => {
      await clickNext();

      // skip fsc
      await clickNext();

      // skip packages
      await clickNext();
    });
  };

  test('selected repositories stored in and retrieved from form state', async () => {
    await setUp();

    const getFirstRepoCheckbox = () =>
      screen.findByRole('checkbox', {
        name: /select row 0/i,
      });
    let firstRepoCheckbox = await getFirstRepoCheckbox();

    expect(firstRepoCheckbox.checked).toEqual(false);
    await user.click(firstRepoCheckbox);
    expect(firstRepoCheckbox.checked).toEqual(true);

    await act(async () => {
      await clickNext();
      clickBack();
    });

    firstRepoCheckbox = await getFirstRepoCheckbox();
    expect(firstRepoCheckbox.checked).toEqual(true);
  });

  test('correct number of repositories is fetched', async () => {
    await setUp();

    const selectButton = await screen.findByRole('button', {
      name: /select/i,
    });
    await user.click(selectButton);

    screen.getByText(/select all \(1015 items\)/i);
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
    screen.getByRole('button', { name: /reset/i }).click();

    rows = getRows();
    // remove first row from list since it is just header labels
    rows.shift();

    expect(rows).toHaveLength(10);
  });
});
