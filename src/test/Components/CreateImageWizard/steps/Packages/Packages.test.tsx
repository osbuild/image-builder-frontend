import { Router as RemixRouter } from '@remix-run/router/dist/router';
import { screen, waitFor, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

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
import {
  clickBack,
  clickNext,
  clickReviewAndFinish,
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

const router: RemixRouter | undefined = undefined;

const selectGuestImageTarget = async () => {
  const user = userEvent.setup();
  const guestImageCheckBox = await screen.findByRole('checkbox', {
    name: /virtualization guest image checkbox/i,
  });
  await waitFor(() => user.click(guestImageCheckBox));
};

const goToPackagesStep = async () => {
  await selectGuestImageTarget();
  await clickNext(); // Registration
  await clickRegisterLater();
  await clickNext(); // OpenSCAP
  await clickNext(); // File system configuration
  await clickNext(); // Repository snapshot/Repeatable builds
  await clickNext(); // Custom repositories
  await clickNext(); // Additional packages
};

const goToReviewStep = async () => {
  await clickNext(); // Users
  await clickNext(); // Timezone
  await clickNext(); // Locale
  await clickNext(); // Hostname
  await clickNext(); // Kernel
  await clickNext(); // Firewall
  await clickNext(); // Services
  await clickNext(); // First Boot
  await clickNext(); // Details
  await enterBlueprintName();
  await clickNext(); // Review
};

const typeIntoSearchBox = async (searchTerm: string) => {
  const user = userEvent.setup();
  const searchbox = await screen.findByRole('textbox', {
    name: /search packages/i,
  });
  await waitFor(() => user.type(searchbox, searchTerm));
};

const clearSearchInput = async () => {
  const user = userEvent.setup();
  const pkgSearch = await screen.findByRole('textbox', {
    name: /search packages/i,
  });
  await waitFor(() => user.clear(pkgSearch));
};

const getAllCheckboxes = async () => {
  const pkgTable = await screen.findByTestId('packages-table');
  await screen.findAllByTestId('package-row');

  const checkboxes = await within(pkgTable).findAllByRole('checkbox', {
    name: /select row/i,
  });

  return checkboxes;
};

const getRows = async () => {
  const packagesTable = await screen.findByTestId('packages-table');
  return await within(packagesTable).findAllByTestId('package-row');
};

const comparePackageSearchResults = async () => {
  const availablePackages = await getRows();

  await waitFor(() => expect(availablePackages).toHaveLength(3));

  expect(availablePackages[0]).toHaveTextContent('test');
  expect(availablePackages[1]).toHaveTextContent('test-lib');
  expect(availablePackages[2]).toHaveTextContent('testPkg');
};

const clickFirstPackageCheckbox = async () => {
  const user = userEvent.setup();
  const row0Checkbox = await screen.findByRole('checkbox', {
    name: /select row 0/i,
  });
  await waitFor(() => user.click(row0Checkbox));
};

const clickSecondPackageCheckbox = async () => {
  const user = userEvent.setup();
  const row1Checkbox = await screen.findByRole('checkbox', {
    name: /select row 1/i,
  });
  await waitFor(() => user.click(row1Checkbox));
};

const clickThirdPackageCheckbox = async () => {
  const user = userEvent.setup();
  const row2Checkbox = await screen.findByRole('checkbox', {
    name: /select row 2/i,
  });
  await waitFor(() => user.click(row2Checkbox));
};

const toggleSelected = async () => {
  const user = userEvent.setup();
  const selected = await screen.findByRole('button', { name: /selected/i });
  await waitFor(() => user.click(selected));
};

const openIncludedPackagesPopover = async () => {
  const user = userEvent.setup();
  const popoverBtn = await screen.findByRole('button', {
    name: /About included packages/i,
  });
  await waitFor(() => user.click(popoverBtn));
};

const checkRecommendationsEmptyState = async () => {
  await screen.findByRole('button', {
    name: /Recommended Red Hat packages/,
  });

  await screen.findByText('Select packages to generate recommendations.');
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

const deselectRecommendation = async () => {
  const user = userEvent.setup();
  const row1Checkbox = await screen.findByRole('checkbox', {
    name: /select row 0/i,
  });
  await waitFor(async () => user.click(row1Checkbox));
};

const clickRevisitButton = async () => {
  const user = userEvent.setup();
  const expandable = await screen.findByTestId('content-expandable');
  const revisitButton = await within(expandable).findByTestId(
    'revisit-custom-repositories'
  );
  await waitFor(() => user.click(revisitButton));
  await waitFor(() =>
    expect(
      screen.queryByRole('button', { name: /Create blueprint/ })
    ).not.toBeInTheDocument()
  );
};

describe('Step Packages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const user = userEvent.setup();

  test('clicking Next loads Users', async () => {
    await renderCreateMode();
    await goToPackagesStep();
    await clickNext();
    await screen.findByRole('heading', {
      name: 'Users',
    });
  });

  test('clicking Back loads Custom repositories', async () => {
    await renderCreateMode();
    await goToPackagesStep();
    await clickBack();
    await screen.findByRole('heading', {
      name: 'Custom repositories',
    });
  });

  test('clicking Cancel loads landing page', async () => {
    await renderCreateMode();
    await goToPackagesStep();
    await verifyCancelButton(router);
  });

  test('clicking Review and finish leads to Review', async () => {
    await renderCreateMode();
    await goToPackagesStep();
    await clickReviewAndFinish();
    await screen.findByRole('heading', {
      name: /Review/i,
    });
  });

  test('should display search bar and toggle buttons', async () => {
    await renderCreateMode();
    await goToPackagesStep();
    await typeIntoSearchBox('test');
    await screen.findByRole('button', {
      name: /Available/,
    });
    await screen.findByRole('button', {
      name: /Selected/,
    });
  });

  test('should display default state', async () => {
    await renderCreateMode();
    await goToPackagesStep();
    await screen.findByText(
      'Search above to add additionalpackages to your image.'
    );
  });

  test('search results should be sorted with most relevant results first', async () => {
    await renderCreateMode();
    await goToPackagesStep();
    await selectCustomRepo();
    await typeIntoSearchBox('test');
    await screen.findByRole('cell', { name: /test-lib/ }); // wait until packages get rendered
    await comparePackageSearchResults();
  });

  test('selected packages are sorted the same way as available packages', async () => {
    await renderCreateMode();
    await goToPackagesStep();
    await selectCustomRepo();
    await typeIntoSearchBox('test');
    await screen.findByRole('cell', { name: /test-lib/ }); // wait until packages get rendered

    // select all packages
    await clickFirstPackageCheckbox();
    await clickSecondPackageCheckbox();
    await clickThirdPackageCheckbox();

    await toggleSelected();
    const availablePackages = await getRows();
    await waitFor(() => expect(availablePackages).toHaveLength(3));

    expect(availablePackages[0]).toHaveTextContent('test');
    expect(availablePackages[1]).toHaveTextContent('test-lib');
    expect(availablePackages[2]).toHaveTextContent('testPkg');
  });

  test('selected packages persist throughout steps', async () => {
    await renderCreateMode();
    await goToPackagesStep();
    await typeIntoSearchBox('test');
    await screen.findByRole('cell', { name: /test-lib/ }); // wait until packages get rendered

    const checkboxes = await getAllCheckboxes();
    let firstPkgCheckbox = checkboxes[0] as HTMLInputElement;

    expect(firstPkgCheckbox.checked).toEqual(false);
    user.click(firstPkgCheckbox);
    await waitFor(() => expect(firstPkgCheckbox.checked).toEqual(true));
    await clickNext();
    await clickBack();
    firstPkgCheckbox = checkboxes[0] as HTMLInputElement;
    expect(firstPkgCheckbox.checked).toEqual(true);
  });

  //  test('Removing packages should not immediately remove them, only uncheck checkboxes', async () => {
  //    await renderCreateMode();
  //    await goToPackagesStep();
  //    await typeIntoSearchBox('test');
  //
  //    const checkboxes = await getAllCheckboxes();
  //    const firstPkgCheckbox = checkboxes[0] as HTMLInputElement;
  //    const secondPkgCheckbox = checkboxes[1] as HTMLInputElement;
  //    const thirdPkgCheckbox = checkboxes[2] as HTMLInputElement;
  //
  //    // Select multiple packages
  //    expect(firstPkgCheckbox.checked).toBe(false);
  //    expect(secondPkgCheckbox.checked).toBe(false);
  //    expect(thirdPkgCheckbox.checked).toBe(false);
  //    user.click(firstPkgCheckbox);
  //    user.click(secondPkgCheckbox);
  //    user.click(thirdPkgCheckbox);
  //    await waitFor(() => expect(firstPkgCheckbox.checked).toBe(true));
  //    await waitFor(() => expect(secondPkgCheckbox.checked).toBe(true));
  //    await waitFor(() => expect(thirdPkgCheckbox.checked).toBe(true));
  //
  //    await toggleSelected();
  //
  //    // Deselect packages
  //    user.click(firstPkgCheckbox);
  //    await waitFor(() => expect(firstPkgCheckbox.checked).toBe(false));
  //    user.click(secondPkgCheckbox);
  //    await waitFor(() => expect(secondPkgCheckbox.checked).toBe(false));
  //
  //    // Ensure packages remain but are unchecked
  //    const packageRows = await getRows();
  //    expect(packageRows.length).toBeGreaterThan(2);
  //
  //    // Toggle next and back
  //    await clickNext();
  //    await clickBack();
  //    await toggleSelected();
  //
  //    // Ensure packages are removed
  //    const updatedRows = await getRows();
  //    expect(updatedRows.length).toBe(1);
  //  });

  test('should display empty available state on failed search', async () => {
    await renderCreateMode();
    await goToPackagesStep();
    await typeIntoSearchBox('asdf');
    await screen.findByText('No results found');
  });

  test('should display too short', async () => {
    await renderCreateMode();
    await goToPackagesStep();
    await typeIntoSearchBox('t');
    await screen.findByText('The search value is too short');
  });

  //  test('should display relevant results in selected first', async () => {
  //    await renderCreateMode();
  //    await goToPackagesStep();
  //    await selectCustomRepo();
  //    await typeIntoSearchBox('test');
  //
  //    const checkboxes = await getAllCheckboxes();
  //
  //    user.click(checkboxes[0]);
  //    user.click(checkboxes[1]);
  //
  //    await clearSearchInput();
  //    await typeIntoSearchBox('mock');
  //    await screen.findByText(/mock-lib/);
  //
  //    user.click(checkboxes[0]);
  //    user.click(checkboxes[1]);
  //
  //    await toggleSelected();
  //    await clearSearchInput();
  //    await typeIntoSearchBox('test');
  //
  //    await toggleSelected();
  //    const availablePackages = await getRows();
  //    expect(availablePackages[0]).toHaveTextContent('test');
  //    expect(availablePackages[1]).toHaveTextContent('test-lib');
  //  });

  test('should display recommendations', async () => {
    await renderCreateMode();
    await goToPackagesStep();
    await checkRecommendationsEmptyState();
    await typeIntoSearchBox('test');
    await clickFirstPackageCheckbox();

    await screen.findByText('recommendedPackage1');
    await screen.findByText('recommendedPackage2');
    await screen.findByText('recommendedPackage3');
  });

  test('allow to add recommendations to selected', async () => {
    await renderCreateMode();
    await goToPackagesStep();
    await checkRecommendationsEmptyState();
    await typeIntoSearchBox('test');
    await clickFirstPackageCheckbox();
    await addSingleRecommendation();
    await toggleSelected();

    const pkgTable = await screen.findByTestId('packages-table');
    await within(pkgTable).findByText('recommendedPackage1');
  });

  test('revisit step button on Review works', async () => {
    await renderCreateMode();
    await goToPackagesStep();
    await typeIntoSearchBox('test');
    await clickFirstPackageCheckbox();
    await goToReviewStep();
    await clickRevisitButton();
    await screen.findByRole('heading', { name: /Custom repositories/ });
  });

  describe('Pagination', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    test('itemcount correct after search', async () => {
      await renderCreateMode();
      await goToPackagesStep();
      await selectCustomRepo();
      await typeIntoSearchBox('test'); // search for 'test' package
      await clickFirstPackageCheckbox(); // select

      // the pagination in the top right
      const top = await screen.findByTestId('packages-pagination-top');
      expect(top).toHaveTextContent('of 3');
      const bottom = await screen.findByTestId('packages-pagination-bottom');
      expect(bottom).toHaveTextContent('of 3');
    });

    test('itemcount correct after toggling selected', async () => {
      await renderCreateMode();
      await goToPackagesStep();
      await typeIntoSearchBox('test'); // search for 'test' package
      await clickFirstPackageCheckbox(); // select
      await toggleSelected();

      // the pagination in the top right
      const top = await screen.findByTestId('packages-pagination-top');
      expect(top).toHaveTextContent('of 1');
      const bottom = await screen.findByTestId('packages-pagination-bottom');
      expect(bottom).toHaveTextContent('of 1');
    });

    test('itemcount correct after clearing search input', async () => {
      await renderCreateMode();
      await goToPackagesStep();
      await typeIntoSearchBox('test'); // search for 'test' package
      await clickFirstPackageCheckbox(); // select
      await clearSearchInput();

      // the pagination in the top right
      const top = await screen.findByTestId('packages-pagination-top');
      expect(top).toHaveTextContent('of 0');
      const bottom = await screen.findByTestId('packages-pagination-bottom');
      expect(bottom).toHaveTextContent('of 0');
    });
  });

  describe('Package groups', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    test('included packages popover', async () => {
      await renderCreateMode();
      await goToPackagesStep();
      await typeIntoSearchBox('@grouper'); // search for '@grouper' package group
      await clickFirstPackageCheckbox(); // select
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

  describe('Modules', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    test('modules get rendered with one stream on each line', async () => {
      await renderCreateMode();
      await goToPackagesStep();
      await selectCustomRepo();
      await typeIntoSearchBox('testModule');
      await screen.findByText('1.22');
      const rows = await screen.findAllByRole('row');
      rows.shift();
      expect(rows).toHaveLength(2);
      expect(rows[0]).toHaveTextContent('1.24');
      expect(rows[1]).toHaveTextContent('1.22');
      expect(rows[0]).toHaveTextContent('May 2027');
      expect(rows[1]).toHaveTextContent('May 2025');
    });

    test('only one stream gets selected, other should be disabled', async () => {
      const user = userEvent.setup();

      await renderCreateMode();
      await goToPackagesStep();
      await selectCustomRepo();
      await typeIntoSearchBox('testModule');

      const firstAppStreamRow = await screen.findByRole('checkbox', {
        name: /select row 0/i,
      });
      await waitFor(() => user.click(firstAppStreamRow));

      const secondAppStreamRow = await screen.findByRole('checkbox', {
        name: /select row 1/i,
      });
      expect(secondAppStreamRow).toBeDisabled();
      expect(secondAppStreamRow).not.toBeChecked();
    });
  });
});

describe('Packages request generated correctly', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  const user = userEvent.setup();

  test('with custom packages', async () => {
    await renderCreateMode();
    await goToPackagesStep();
    await typeIntoSearchBox('test'); // search for 'test' package
    await clickFirstPackageCheckbox(); // select
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
    await typeIntoSearchBox('test'); // search for 'test' package
    await clickFirstPackageCheckbox(); // select
    await clickFirstPackageCheckbox(); // deselect
    await goToReviewStep();
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    const expectedRequest = blueprintRequest;

    expect(receivedRequest).toEqual(expectedRequest);
  });

  test('with module', async () => {
    await renderCreateMode();
    await goToPackagesStep();
    await typeIntoSearchBox('testModule'); // search for 'test' package
    const moduleCheckbox = await screen.findByRole('checkbox', {
      name: /select row 0/i,
    });
    await waitFor(() => user.click(moduleCheckbox));
    await goToReviewStep();
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    const expectedRequest: CreateBlueprintRequest = {
      ...blueprintRequest,
      customizations: {
        packages: ['testModule'],
        enabled_modules: [{ name: 'testModule', stream: '1.24' }],
      },
    };

    expect(receivedRequest).toEqual(expectedRequest);
  });

  test('deselecting a module removes it from the request', async () => {
    await renderCreateMode();
    await goToPackagesStep();
    await typeIntoSearchBox('testModule'); // search for 'test' package
    const moduleCheckbox = await screen.findByRole('checkbox', {
      name: /select row 0/i,
    });
    await waitFor(() => user.click(moduleCheckbox)); // select
    await toggleSelected();
    await clickFirstPackageCheckbox(); // deselect
    await goToReviewStep();
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    const expectedRequest = blueprintRequest;

    expect(receivedRequest).toEqual(expectedRequest);
  });

  test('with custom groups', async () => {
    await renderCreateMode();
    await goToPackagesStep();
    await typeIntoSearchBox('@grouper'); // search for '@grouper' package group
    await clickFirstPackageCheckbox(); // select
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
    await typeIntoSearchBox('@grouper'); // search for '@grouper' package group
    await clickFirstPackageCheckbox(); // select
    await toggleSelected();
    await clickFirstPackageCheckbox(); // deselect
    await goToReviewStep();

    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);
    const expectedRequest = blueprintRequest;
    expect(receivedRequest).toEqual(expectedRequest);
  });

  describe('Package recommendations', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    test('selecting single recommendation adds it to the request', async () => {
      await renderCreateMode();
      await goToPackagesStep();
      await typeIntoSearchBox('test'); // search for 'test' package
      await clickFirstPackageCheckbox(); // select
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
      await typeIntoSearchBox('test'); // search for 'test' package
      await clickFirstPackageCheckbox(); // select
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
      await typeIntoSearchBox('test'); // search for 'test' package
      await clickFirstPackageCheckbox(); // select
      await addSingleRecommendation();
      await toggleSelected();
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
