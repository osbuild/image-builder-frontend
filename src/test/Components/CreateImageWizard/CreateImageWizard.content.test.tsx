import React from 'react';

import type { Router as RemixRouter } from '@remix-run/router';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import CreateImageWizard from '../../../Components/CreateImageWizard/CreateImageWizard';
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
];

// The router is just initiliazed here, it's assigned a value in the tests
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

let mockContentSourcesEnabled: boolean;

vi.mock('@unleash/proxy-client-react', () => ({
  useUnleashContext: () => vi.fn(),
  useFlag: vi.fn((flag) => {
    switch (flag) {
      case 'image-builder.enable-content-sources':
        return mockContentSourcesEnabled;
      case 'image-builder.pkgrecs.enabled':
        return true;
      default:
        return false;
    }
  }),
}));

const typeIntoSearchBox = async (searchTerm: string) => {
  const user = userEvent.setup();
  const searchbox = await screen.findByRole('textbox', {
    name: /search packages/i,
  });

  await waitFor(() => user.click(searchbox));
  await waitFor(() => user.type(searchbox, searchTerm));
};

const clearSearchBox = async () => {
  const user = userEvent.setup();
  const searchbox = await screen.findByRole('textbox', {
    name: /search packages/i,
  });

  await waitFor(() => user.click(searchbox));
  await waitFor(() => user.clear(searchbox));
};

const getAllCheckboxes = async () => {
  const pkgTable = await screen.findByTestId('packages-table');
  await screen.findAllByTestId('package-row');

  const checkboxes = await within(pkgTable).findAllByRole('checkbox', {
    name: /select row/i,
  });

  return checkboxes;
};

const toggleSelected = async () => {
  const user = userEvent.setup();
  const selected = await screen.findByRole('button', { name: /selected/i });
  await waitFor(async () => user.click(selected));
};

const checkRecommendationsEmptyState = async () => {
  await screen.findByRole('button', {
    name: /Recommended Red Hat packages/,
  });

  await screen.findByText('Select packages to generate recommendations.');
};

export const selectCustomRepo = async () => {
  const user = userEvent.setup();
  await clickBack();
  const customRepoCheckbox = await screen.findByRole('checkbox', {
    name: /select row 0/i,
  });

  user.click(customRepoCheckbox);
  await clickNext();
};

describe('Step Packages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockContentSourcesEnabled = true;
  });

  const user = userEvent.setup();
  const setUp = async () => {
    mockContentSourcesEnabled = false;

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
    // skip registration
    await screen.findByRole('textbox', {
      name: 'Select activation key',
    });

    const registerLater = await screen.findByTestId('registration-radio-later');
    user.click(registerLater);

    await clickNext();
    // skip OpenSCAP
    await clickNext();
    // skip snapshots
    await clickNext();
    // skip Repositories
    await clickNext();
    // skip fsc
    await clickNext();
  };

  test('clicking Next loads Image name', async () => {
    await setUp();

    await clickNext();
    await clickNext();

    await screen.findByRole('heading', {
      name: 'Details',
    });
  });

  test('clicking Back loads repositories', async () => {
    await setUp();

    await clickBack();

    await screen.findByRole('heading', {
      name: /Custom repositories/i,
    });
  });

  test('clicking Cancel loads landing page', async () => {
    await setUp();

    await verifyCancelButton(router);
  });

  test('should display search bar and toggle buttons', async () => {
    await setUp();

    await typeIntoSearchBox('test');

    await screen.findByRole('button', {
      name: /available/i,
    });
    await screen.findByRole('button', {
      name: /selected/i,
    });
  });

  test('should display default state', async () => {
    await setUp();

    await screen.findByText(
      'Search above to add additionalpackages to your image.'
    );
  });

  test('should display an exact match if found regardless of too many results', async () => {
    await setUp();

    await typeIntoSearchBox('testPkg-123');

    await screen.findByTestId('exact-match-row');

    await screen.findByRole('heading', {
      name: /too many results to display/i,
    });
  });

  test('search results should be sorted with most relevant results first', async () => {
    await setUp();

    await selectCustomRepo();
    await typeIntoSearchBox('test');

    const packagesTable = await screen.findByTestId('packages-table');

    const getRows = async () =>
      await within(packagesTable).findAllByTestId('package-row');
    const availablePackages = await getRows();

    await waitFor(() => expect(availablePackages).toHaveLength(6));

    expect(availablePackages[0]).toHaveTextContent('test');
    expect(availablePackages[1]).toHaveTextContent('test-sources');
    expect(availablePackages[2]).toHaveTextContent('testPkg');
    expect(availablePackages[3]).toHaveTextContent('testPkg-sources');
    expect(availablePackages[4]).toHaveTextContent('lib-test');
    expect(availablePackages[5]).toHaveTextContent('lib-test-sources');
  });

  test('selected packages are sorted the same way as available packages', async () => {
    await setUp();

    await selectCustomRepo();
    await typeIntoSearchBox('test');

    const checkboxes = await getAllCheckboxes();

    for (const checkbox in checkboxes) {
      user.click(checkboxes[checkbox]);
    }

    await toggleSelected();

    const packagesTable = await screen.findByTestId('packages-table');

    const getRows = async () =>
      await within(packagesTable).findAllByTestId('package-row');
    const availablePackages = await getRows();

    await waitFor(() => expect(availablePackages).toHaveLength(6));

    expect(availablePackages[0]).toHaveTextContent('test');
    expect(availablePackages[1]).toHaveTextContent('test-sources');
    expect(availablePackages[2]).toHaveTextContent('testPkg');
    expect(availablePackages[3]).toHaveTextContent('testPkg-sources');
    expect(availablePackages[4]).toHaveTextContent('lib-test');
    expect(availablePackages[5]).toHaveTextContent('lib-test-sources');
  });

  test('selected packages persist throughout steps', async () => {
    await setUp();

    await typeIntoSearchBox('test');
    const pkgTable = await screen.findByTestId('packages-table');
    await screen.findAllByTestId('package-row');

    const getFirstPkgCheckbox = async () =>
      await within(pkgTable).findByRole('checkbox', {
        name: /select row 0/i,
      });
    let firstPkgCheckbox = (await getFirstPkgCheckbox()) as HTMLInputElement;

    expect(firstPkgCheckbox.checked).toEqual(false);
    user.click(firstPkgCheckbox);
    await waitFor(() => expect(firstPkgCheckbox.checked).toEqual(true));

    await clickNext();
    await clickBack();

    firstPkgCheckbox = (await getFirstPkgCheckbox()) as HTMLInputElement;
    expect(firstPkgCheckbox.checked).toEqual(true);
  });

  test('should display empty available state on failed search', async () => {
    await setUp();

    await typeIntoSearchBox('asdf');

    await screen.findByText('No results found');
  });

  test('should display too many results state for more than 100 results', async () => {
    await setUp();

    await typeIntoSearchBox('te');

    await screen.findByText('Too many results to display');
  });

  test('should display too short', async () => {
    await setUp();

    await typeIntoSearchBox('t');

    await screen.findByText('The search value is too short');
  });

  test('should display relevant results in selected first', async () => {
    await setUp();

    await selectCustomRepo();
    await typeIntoSearchBox('test');

    const checkboxes = await getAllCheckboxes();

    user.click(checkboxes[0]);
    user.click(checkboxes[1]);

    await clearSearchBox();
    await typeIntoSearchBox('mock');

    // wait for debounce
    await waitFor(
      () => {
        expect(screen.getByText(/mockPkg/)).toBeInTheDocument();
      },
      {
        timeout: 1500,
      }
    );

    user.click(checkboxes[0]);
    user.click(checkboxes[1]);

    await toggleSelected();

    await clearSearchBox();
    await typeIntoSearchBox('test');

    const packagesTable = await screen.findByTestId('packages-table');

    const getRows = async () =>
      await within(packagesTable).findAllByTestId('package-row');
    const availablePackages = await getRows();

    expect(availablePackages[0]).toHaveTextContent('test');
    expect(availablePackages[1]).toHaveTextContent('test-sources');
  });

  test('should display recommendations', async () => {
    await setUp();

    await checkRecommendationsEmptyState();
    await typeIntoSearchBox('test');

    const checkboxes = await getAllCheckboxes();

    user.click(checkboxes[0]);

    await screen.findByText('recommendedPackage1');
    await screen.findByText('recommendedPackage2');
    await screen.findByText('recommendedPackage3');
  });

  test('allow to add recommendations to selected', async () => {
    await setUp();

    await checkRecommendationsEmptyState();

    const pkgTable = await screen.findByTestId('packages-table');

    await typeIntoSearchBox('test');

    const checkboxes = await getAllCheckboxes();

    user.click(checkboxes[0]);

    const addRecButtons = await screen.findAllByTestId(
      'add-recommendation-button'
    );

    user.click(addRecButtons[0]);

    const selected = await screen.findByRole('button', { name: /Selected/ });
    user.click(selected);

    await within(pkgTable).findByText('recommendedPackage1');
  });
});

describe('Step Custom repositories', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockContentSourcesEnabled = true;
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
    const manualOption = await screen.findByRole('radio', {
      name: /manually enter an account id\./i,
    });
    await waitFor(() => user.click(manualOption));
    await waitFor(async () =>
      user.type(
        await screen.findByRole('textbox', {
          name: 'aws account id',
        }),
        '012345678901'
      )
    );

    await clickNext();
    // skip registration
    await screen.findByRole('textbox', {
      name: 'Select activation key',
    });

    const registerLater = await screen.findByLabelText('Register later');

    user.click(registerLater);
    await clickNext();
    // skip OpenSCAP
    await clickNext();
    // skip fsc
    await clickNext();
    // skip snapshots
    await clickNext();
  };

  test('selected repositories stored in and retrieved from form state', async () => {
    await setUp();

    const getFirstRepoCheckbox = async () =>
      await screen.findByRole('checkbox', {
        name: /select row 0/i,
      });
    let firstRepoCheckbox = (await getFirstRepoCheckbox()) as HTMLInputElement;

    expect(firstRepoCheckbox.checked).toEqual(false);
    user.click(firstRepoCheckbox);
    await waitFor(() => expect(firstRepoCheckbox.checked).toEqual(true));

    await clickNext();
    await clickBack();

    firstRepoCheckbox = (await getFirstRepoCheckbox()) as HTMLInputElement;
    await waitFor(() => expect(firstRepoCheckbox.checked).toEqual(true));
  }, 30000);

  test('correct number of repositories is fetched', async () => {
    await setUp();

    const select = await screen.findByRole('button', {
      name: /^select$/i,
    });

    user.click(select);

    await screen.findByText(/select page \(10 items\)/i);
  });

  test('press on Selected button to see selected repositories list', async () => {
    await setUp();

    const getFirstRepoCheckbox = async () =>
      await screen.findByRole('checkbox', {
        name: /select row 0/i,
      });
    const firstRepoCheckbox =
      (await getFirstRepoCheckbox()) as HTMLInputElement;

    expect(firstRepoCheckbox.checked).toEqual(false);
    user.click(firstRepoCheckbox);
    await waitFor(() => expect(firstRepoCheckbox.checked).toEqual(true));

    const getSelectedButton = async () =>
      await screen.findByRole('button', {
        name: /selected repositories/i,
      });

    const selectedButton = await getSelectedButton();
    user.click(selectedButton);

    expect(firstRepoCheckbox.checked).toEqual(true);

    await clickNext();
    await clickBack();
    await waitFor(() => expect(firstRepoCheckbox.checked).toEqual(true));
  });

  test('press on All button to see all repositories list', async () => {
    await setUp();

    const getFirstRepoCheckbox = async () =>
      await screen.findByRole('checkbox', {
        name: /select row 0/i,
      });
    const firstRepoCheckbox =
      (await getFirstRepoCheckbox()) as HTMLInputElement;

    const getSecondRepoCheckbox = async () =>
      await screen.findByRole('checkbox', {
        name: /select row 1/i,
      });
    const secondRepoCheckbox =
      (await getSecondRepoCheckbox()) as HTMLInputElement;

    expect(firstRepoCheckbox.checked).toEqual(false);
    expect(secondRepoCheckbox.checked).toEqual(false);
    user.click(firstRepoCheckbox);
    await waitFor(() => expect(firstRepoCheckbox.checked).toEqual(true));
    expect(secondRepoCheckbox.checked).toEqual(false);

    const getAllButton = async () =>
      await screen.findByRole('button', {
        name: /all repositories/i,
      });

    const allButton = await getAllButton();
    user.click(allButton);

    expect(firstRepoCheckbox.checked).toEqual(true);
    expect(secondRepoCheckbox.checked).toEqual(false);

    await clickNext();
    await clickBack();

    expect(firstRepoCheckbox.checked).toEqual(true);
    await waitFor(() => expect(secondRepoCheckbox.checked).toEqual(false));
  });

  //   test('press on Selected button to see selected repositories list at the second page and filter checked repo', async () => {
  //     await setUp();

  //     const getFirstRepoCheckbox = async () =>
  //       await screen.findByRole('checkbox', {
  //         name: /select row 0/i,
  //       });

  //     const firstRepoCheckbox =
  //       (await getFirstRepoCheckbox()) as HTMLInputElement;

  //     const getNextPageButton = async () =>
  //       await screen.findAllByRole('button', {
  //         name: /go to next page/i,
  //       });

  //     const nextPageButton = await getNextPageButton();

  //     expect(firstRepoCheckbox.checked).toEqual(false);
  //     await user.click(firstRepoCheckbox);
  //     expect(firstRepoCheckbox.checked).toEqual(true);

  //     await user.click(nextPageButton[0]);

  //     const getSelectedButton = async () =>
  //       await screen.findByRole('button', {
  //         name: /selected repositories/i,
  //       });

  //     const selectedButton = await getSelectedButton();
  //     await user.click(selectedButton);

  //     expect(firstRepoCheckbox.checked).toEqual(true);

  //     await user.type(
  //       await screen.findByRole('textbox', { name: /search repositories/i }),
  //       '13lk3'
  //     );

  //     expect(firstRepoCheckbox.checked).toEqual(true);

  //     await clickNext();
  //     clickBack();
  //     expect(firstRepoCheckbox.checked).toEqual(true);
  //     await user.click(firstRepoCheckbox);
  //     await waitFor(() => expect(firstRepoCheckbox.checked).toEqual(false));
  //   }, 30000);
});
//
// describe('On Recreate', () => {
//   const user = userEvent.setup();
//   const setUp = async () => {
//     ({ router } = renderWithReduxRouter(
//       'imagewizard/hyk93673-8dcc-4a61-ac30-e9f4940d8346'
//     ));
//   };
//
//   const setUpUnavailableRepo = async () => {
//     ({ router } = renderWithReduxRouter(
//       'imagewizard/b7193673-8dcc-4a5f-ac30-e9f4940d8346'
//     ));
//   };
//
//   test('with valid repositories', async () => {
//     await setUp();
//
//     await screen.findByRole('heading', { name: /review/i });
//     expect(
//       screen.queryByText('Previously added custom repository unavailable')
//     ).not.toBeInTheDocument();
//
//     const createImageButton = await screen.findByRole('button', {
//       name: /create image/i,
//     });
//     await waitFor(() => expect(createImageButton).toBeEnabled());
//
//     await user.click(
//       await screen.findByRole('button', { name: /custom repositories/i })
//     );
//
//     await screen.findByRole('heading', { name: /custom repositories/i });
//     expect(
//       screen.queryByText('Previously added custom repository unavailable')
//     ).not.toBeInTheDocument();
//
//     const table = await screen.findByTestId('repositories-table');
//
//     const { getAllByRole } = within(table);
//     const rows = getAllByRole('row');
//
//     const availableRepo = rows[1].cells[1];
//     expect(availableRepo).toHaveTextContent(
//       '13lk3http://yum.theforeman.org/releases/3.4/el8/x86_64/'
//     );
//
//     const availableRepoCheckbox = await screen.findByRole('checkbox', {
//       name: /select row 0/i,
//     });
//     expect(availableRepoCheckbox).toBeEnabled();
//   });
//
//   test('with repositories that are no longer available', async () => {
//     await setUpUnavailableRepo();
//
//     await screen.findByRole('heading', { name: /review/i });
//     await screen.findByText('Previously added custom repository unavailable');
//
//     const createImageButton = await screen.findByRole('button', {
//       name: /create image/i,
//     });
//     expect(createImageButton).toBeDisabled();
//
//     await user.click(
//       await screen.findByRole('button', { name: /custom repositories/i })
//     );
//
//     await screen.findByRole('heading', { name: /custom repositories/i });
//     await screen.findByText('Previously added custom repository unavailable');
//
//     const table = await screen.findByTestId('repositories-table');
//
//     const { getAllByRole } = within(table);
//     const rows = getAllByRole('row');
//
//     const unavailableRepo = rows[1].cells[1];
//     expect(unavailableRepo).toHaveTextContent(
//       'Repository with the following url is no longer available:http://unreachable.link.to.repo.org/x86_64/'
//     );
//
//     const unavailableRepoCheckbox = await screen.findByRole('checkbox', {
//       name: /select row 0/i,
//     });
//     expect(unavailableRepoCheckbox).toBeDisabled();
//   });
// });
//
