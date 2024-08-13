import React from 'react';

import { Router as RemixRouter } from '@remix-run/router/dist/router';
import { screen, waitFor, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import CreateImageWizard from '../../../../../Components/CreateImageWizard/CreateImageWizard';
import { CREATE_BLUEPRINT, EDIT_BLUEPRINT } from '../../../../../constants';
import { CreateBlueprintRequest } from '../../../../../store/imageBuilderApi';
import { mockBlueprintIds } from '../../../../fixtures/blueprints';
import {
  expectedAllPackageRecommendations,
  expectedPackages,
  expectedPackagesWithoutRecommendations,
  expectedSinglePackageRecommendation,
  packagesCreateBlueprintRequest,
} from '../../../../fixtures/editMode';
import { renderCustomRoutesWithReduxRouter } from '../../../../testUtils';
import {
  clickBack,
  clickNext,
  verifyCancelButton,
} from '../../wizardTestUtils';
import { selectCustomRepo } from '../../wizardTestUtils';
import {
  blueprintRequest,
  clickRegisterLater,
  enterBlueprintName,
  interceptBlueprintRequest,
  interceptEditBlueprintRequest,
  openAndDismissSaveAndBuildModal,
  renderCreateMode,
  renderEditMode,
} from '../../wizardTestUtils';

const goToPackagesStep = async () => {
  const user = userEvent.setup();
  const guestImageCheckBox = await screen.findByRole('checkbox', {
    name: /virtualization guest image checkbox/i,
  });
  await waitFor(() => user.click(guestImageCheckBox));
  await clickNext(); // Registration
  await clickRegisterLater();
  await clickNext(); // OpenSCAP
  await clickNext(); // File System
  await clickNext(); // Snapshots
  await clickNext(); // Custom repositories
  await clickNext(); // Additional packages
};

const goToReviewStep = async () => {
  await clickNext(); // First Boot
  await clickNext(); // Details
  await enterBlueprintName();
  await clickNext(); // Review
};

const searchForPackage = async () => {
  const user = userEvent.setup();
  const searchBox = await screen.findByRole('textbox', {
    name: /search packages/i,
  });
  await waitFor(() => user.type(searchBox, 'test'));
};

const searchForGroup = async () => {
  const user = userEvent.setup();
  const searchBox = await screen.findByRole('textbox', {
    name: /search packages/i,
  });
  await waitFor(() => user.type(searchBox, '@grouper'));
};

const getRowsIn = async () => {
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
};

const clearSearchInput = async () => {
  const user = userEvent.setup();
  const clearSearchBtn = await screen.findByRole('button', {
    name: /clear-package-search/i,
  });
  await waitFor(() => user.click(clearSearchBtn));
};

const selectFirstPackage = async () => {
  const user = userEvent.setup();
  const row0Checkbox = await screen.findByRole('checkbox', {
    name: /select row 0/i,
  });
  await waitFor(async () => user.click(row0Checkbox));
};

const deselectFirstPackage = async () => {
  const user = userEvent.setup();
  const row0Checkbox = await screen.findByRole('checkbox', {
    name: /select row 0/i,
  });
  await waitFor(async () => user.click(row0Checkbox));
};

const addSingleRecommendation = async () => {
  const user = userEvent.setup();
  const addPackageButtons = await screen.findAllByText(/add package/i);
  await waitFor(() => user.click(addPackageButtons[0]));
};

const addAllRecommendations = async () => {
  const user = userEvent.setup();
  const addAllBtn = await screen.findByText(/add all packages/i);
  await waitFor(async () => user.click(addAllBtn));
};

const switchToSelected = async () => {
  const user = userEvent.setup();
  const selectedBtn = await screen.findByRole('button', {
    name: /selected \(\d*\)/i,
  });
  await waitFor(async () => user.click(selectedBtn));
};

const deselectRecommendation = async () => {
  const user = userEvent.setup();
  const row1Checkbox = await screen.findByRole('checkbox', {
    name: /select row 1/i,
  });
  await waitFor(async () => user.click(row1Checkbox));
};

const openIncludedPackagesPopover = async () => {
  const user = userEvent.setup();
  const popoverBtn = await screen.findByRole('button', {
    name: /About included packages/i,
  });
  await waitFor(() => user.click(popoverBtn));
};

describe('packages request generated correctly', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('with custom packages', async () => {
    await renderCreateMode();
    await goToPackagesStep();
    await searchForPackage();
    await selectFirstPackage();
    await goToReviewStep();
    // informational modal pops up in the first test only as it's tied
    // to a 'imageBuilder.saveAndBuildModalSeen' variable in localStorage
    await openAndDismissSaveAndBuildModal();
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    const expectedRequest: CreateBlueprintRequest = {
      ...blueprintRequest,
      customizations: {
        packages: expectedPackages,
      },
    };

    expect(receivedRequest).toEqual(expectedRequest);
  });

  test('deselecting a package removes it from the request', async () => {
    await renderCreateMode();
    await goToPackagesStep();
    await searchForPackage();
    await selectFirstPackage();
    await deselectFirstPackage();
    await goToReviewStep();
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    const expectedRequest = blueprintRequest;

    expect(receivedRequest).toEqual(expectedRequest);
  });

  test('with custom groups', async () => {
    await renderCreateMode();
    await goToPackagesStep();
    await searchForGroup();
    await selectFirstPackage();
    await goToReviewStep();

    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    const expectedRequest: CreateBlueprintRequest = {
      ...blueprintRequest,
      customizations: {
        packages: ['@grouper'],
      },
    };
    expect(receivedRequest).toEqual(expectedRequest);
  });

  test('deselecting a group removes it from the request', async () => {
    await renderCreateMode();
    await goToPackagesStep();
    await searchForGroup();
    await selectFirstPackage();
    await switchToSelected();
    await deselectFirstPackage();
    await goToReviewStep();

    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);
    const expectedRequest = blueprintRequest;
    expect(receivedRequest).toEqual(expectedRequest);
  });
});

describe('package recommendations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('selecting single recommendation adds it to the request', async () => {
    await renderCreateMode();
    await goToPackagesStep();
    await searchForPackage();
    await selectFirstPackage();
    await addSingleRecommendation();
    await goToReviewStep();
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    const expectedRequest: CreateBlueprintRequest = {
      ...blueprintRequest,
      customizations: {
        packages: expectedSinglePackageRecommendation,
      },
    };

    expect(receivedRequest).toEqual(expectedRequest);
  });

  test('clicking "Add all packages" adds all recommendations to the request', async () => {
    await renderCreateMode();
    await goToPackagesStep();
    await searchForPackage();
    await selectFirstPackage();
    await addAllRecommendations();
    await goToReviewStep();
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    const expectedRequest: CreateBlueprintRequest = {
      ...blueprintRequest,
      customizations: {
        packages: expectedAllPackageRecommendations,
      },
    };

    expect(receivedRequest).toEqual(expectedRequest);
  });

  test('deselecting a package recommendation removes it from the request', async () => {
    await renderCreateMode();
    await goToPackagesStep();
    await searchForPackage();
    await selectFirstPackage();
    await addSingleRecommendation();
    await switchToSelected();
    await deselectRecommendation();
    await goToReviewStep();
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    const expectedRequest: CreateBlueprintRequest = {
      ...blueprintRequest,
      customizations: {
        packages: expectedPackagesWithoutRecommendations,
      },
    };

    await waitFor(() => {
      expect(receivedRequest).toEqual(expectedRequest);
    });
  });
});

describe('Packages edit mode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('edit mode works', async () => {
    const id = mockBlueprintIds['packages'];
    await renderEditMode(id);

    // starts on review step
    const receivedRequest = await interceptEditBlueprintRequest(
      `${EDIT_BLUEPRINT}/${id}`
    );
    const expectedRequest = packagesCreateBlueprintRequest;
    expect(receivedRequest).toEqual(expectedRequest);
  });
});

describe('pagination on packages step', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('itemcount correct after search', async () => {
    await renderCreateMode();
    await goToPackagesStep();
    await selectCustomRepo();
    await searchForPackage();
    await selectFirstPackage();
    // the pagination in the top right
    const top = await screen.findByTestId('packages-pagination-top');
    expect(top).toHaveTextContent('of 6');
    const bottom = await screen.findByTestId('packages-pagination-bottom');
    expect(bottom).toHaveTextContent('of 6');
  });

  test('itemcount correct after toggling selected', async () => {
    await renderCreateMode();
    await goToPackagesStep();
    await searchForPackage();
    await selectFirstPackage();
    await switchToSelected();

    // the pagination in the top right
    const top = await screen.findByTestId('packages-pagination-top');
    expect(top).toHaveTextContent('of 1');
    const bottom = await screen.findByTestId('packages-pagination-bottom');
    expect(bottom).toHaveTextContent('of 1');
  });

  test('itemcount correct after clearing search input', async () => {
    await renderCreateMode();
    await goToPackagesStep();
    await searchForPackage();
    await selectFirstPackage();
    await clearSearchInput();

    // the pagination in the top right
    const top = await screen.findByTestId('packages-pagination-top');
    expect(top).toHaveTextContent('of 0');
    const bottom = await screen.findByTestId('packages-pagination-bottom');
    expect(bottom).toHaveTextContent('of 0');
  });
});

describe('package groups on packages step', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('included packages popover', async () => {
    await renderCreateMode();
    await goToPackagesStep();
    await searchForGroup();
    await selectFirstPackage();
    await openIncludedPackagesPopover();

    const table = await screen.findByTestId('group-included-packages-table');
    const rows = await within(table).findAllByRole('row');
    expect(rows).toHaveLength(2);

    const firstRowCells = await within(rows[0]).findAllByRole('cell');
    expect(firstRowCells[0]).toHaveTextContent('fish1');
    const secondRowCells = await within(rows[1]).findAllByRole('cell');
    await waitFor(() => expect(secondRowCells[0]).toHaveTextContent('fish2'));
  });
});

const getAllCheckboxes = async () => {
  const pkgTable = await screen.findByTestId('packages-table');
  await screen.findAllByTestId('package-row');

  const checkboxes = await within(pkgTable).findAllByRole('checkbox', {
    name: /select row/i,
  });

  return checkboxes;
};

let router: RemixRouter | undefined = undefined;
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

const typeIntoSearchBox = async (searchTerm: string) => {
  const user = userEvent.setup();
  const searchbox = await screen.findByRole('textbox', {
    name: /search packages/i,
  });

  await waitFor(() => user.click(searchbox));
  await waitFor(() => user.type(searchbox, searchTerm));
};

const checkRecommendationsEmptyState = async () => {
  await screen.findByRole('button', {
    name: /Recommended Red Hat packages/,
  });

  await screen.findByText('Select packages to generate recommendations.');
};

const clearSearchBox = async () => {
  const user = userEvent.setup();
  const searchbox = await screen.findByRole('textbox', {
    name: /search packages/i,
  });

  await waitFor(() => user.click(searchbox));
  await waitFor(() => user.clear(searchbox));
};

const toggleSelected = async () => {
  const user = userEvent.setup();
  const selected = await screen.findByRole('button', { name: /selected/i });
  await waitFor(async () => user.click(selected));
};

describe('Step Packages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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

    const registrationCheckbox = await screen.findByTestId(
      'automatically-register-checkbox'
    );
    user.click(registrationCheckbox);

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

    await getRowsIn();
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

    await getRowsIn();
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
