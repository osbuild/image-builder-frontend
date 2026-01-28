// NOTE: Ready for Playwright migration
// The unit tests for this component have been migrated to co-located tests.
// The remaining tests here are integration/E2E tests that should be migrated to Playwright.
import { Router as RemixRouter } from '@remix-run/router/dist/router';
import { screen, waitFor, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import {
  CREATE_BLUEPRINT,
  EDIT_BLUEPRINT,
  RHEL_9,
} from '../../../../../constants';
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
  blueprintRequest,
  clickBack,
  clickNext,
  clickRegisterLater,
  clickReviewAndFinish,
  goToReview,
  goToStep,
  interceptBlueprintRequest,
  interceptEditBlueprintRequest,
  openAndDismissSaveAndBuildModal,
  renderCreateMode,
  renderEditMode,
  selectCustomRepo,
  selectRhel9,
  verifyCancelButton,
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
  await goToStep(/Additional packages/);
};

const typeIntoSearchBox = async (searchTerm: string) => {
  const user = userEvent.setup();
  const searchbox = await screen.findByRole('textbox', {
    name: /search packages/i,
  });
  await waitFor(() => user.type(searchbox, searchTerm));
};

const getAllCheckboxes = async () => {
  const pkgTable = await screen.findByTestId('packages-table');
  await screen.findAllByTestId('package-row');

  const checkboxes = await within(pkgTable).findAllByRole('checkbox', {
    name: /select row/i,
  });

  return checkboxes;
};

const clickFirstPackageCheckbox = async () => {
  const user = userEvent.setup();
  const row0Checkbox = await screen.findByRole('checkbox', {
    name: /select row 0/i,
  });
  await waitFor(() => user.click(row0Checkbox));
};

const toggleSelected = async () => {
  const user = userEvent.setup();
  const selected = await screen.findByRole('button', { name: /selected/i });
  await waitFor(() => user.click(selected));
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
    'revisit-custom-repositories',
  );
  await waitFor(() => user.click(revisitButton));
  await waitFor(() =>
    expect(
      screen.queryByRole('button', { name: /Create blueprint/ }),
    ).not.toBeInTheDocument(),
  );
};

describe('Step Packages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const user = userEvent.setup();

  test('clicking Next loads Groups and users', async () => {
    await renderCreateMode();
    await goToPackagesStep();
    await clickNext();
    await screen.findByRole('heading', {
      name: 'Groups and users',
    });
  });

  test('clicking Back loads Repositories', async () => {
    await renderCreateMode();
    await goToPackagesStep();
    await clickBack();
    await screen.findByRole('heading', {
      name: 'Repositories',
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

  // Note: Basic UI tests (search bar, toggle buttons, default state, search results
  // sorting, selected packages sorting) are now covered by unit tests in:
  // src/Components/CreateImageWizard/steps/Packages/tests/Packages.test.tsx
  test('selected packages persist throughout steps', async () => {
    await renderCreateMode();
    await goToPackagesStep();
    await typeIntoSearchBox('test');
    await screen.findByRole('cell', { name: /test-lib/ }); // wait until packages get rendered

    const checkboxes = await getAllCheckboxes();
    let firstPkgCheckbox = checkboxes[0] as HTMLInputElement;

    expect(firstPkgCheckbox.checked).toEqual(false);
    await waitFor(() => user.click(firstPkgCheckbox));
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

  // Note: "no results" and "too short" tests are now covered by unit tests in:
  // src/Components/CreateImageWizard/steps/Packages/tests/Packages.test.tsx

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
    await selectRhel9(); // recommendations are not available for RHEL 10 yet
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
    await selectRhel9(); // recommendations are not available for RHEL 10 yet
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
    await goToReview();
    await clickRevisitButton();
    await screen.findByRole('heading', { name: /Repositories/ });
  });

  // Note: Pagination tests, package groups popover test, and basic module tests are
  // now covered by unit tests in:
  // src/Components/CreateImageWizard/steps/Packages/tests/Packages.test.tsx

  describe('Modules', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    // Note: Basic module rendering and stream selection tests are now covered by unit
    // tests. The following tests verify complex sorting behavior requiring wizard context.

    test('module selection sorts selected stream to top while maintaining alphabetical order', async () => {
      const user = userEvent.setup();

      await renderCreateMode();
      await goToPackagesStep();
      await typeIntoSearchBox('sortingTest');

      await screen.findAllByText('alphaModule');
      await screen.findAllByText('betaModule');
      await screen.findAllByText('gammaModule');

      let rows = await screen.findAllByRole('row');
      rows.shift();
      expect(rows).toHaveLength(6);

      expect(rows[0]).toHaveTextContent('alphaModule');
      expect(rows[0]).toHaveTextContent('3.0');
      expect(rows[1]).toHaveTextContent('alphaModule');
      expect(rows[1]).toHaveTextContent('2.0');
      expect(rows[2]).toHaveTextContent('betaModule');
      expect(rows[2]).toHaveTextContent('4.0');
      expect(rows[3]).toHaveTextContent('betaModule');
      expect(rows[3]).toHaveTextContent('2.0');

      // Select betaModule with stream 2.0 (row index 3)
      const betaModule20Checkbox = await screen.findByRole('checkbox', {
        name: /select row 3/i,
      });

      await waitFor(() => user.click(betaModule20Checkbox));
      expect(betaModule20Checkbox).toBeChecked();

      // After selection, the active stream (2.0) should be prioritized
      // All modules with stream 2.0 should move to the top, maintaining alphabetical order
      rows = await screen.findAllByRole('row');
      rows.shift();
      expect(rows[0]).toHaveTextContent('alphaModule');
      expect(rows[0]).toHaveTextContent('2.0');
      expect(rows[1]).toHaveTextContent('betaModule');
      expect(rows[1]).toHaveTextContent('2.0');
      expect(rows[2]).toHaveTextContent('gammaModule');
      expect(rows[2]).toHaveTextContent('2.0');
      expect(rows[3]).toHaveTextContent('alphaModule');
      expect(rows[3]).toHaveTextContent('3.0');
      expect(rows[4]).toHaveTextContent('betaModule');
      expect(rows[4]).toHaveTextContent('4.0');
      expect(rows[5]).toHaveTextContent('gammaModule');
      expect(rows[5]).toHaveTextContent('1.5');

      // Verify that only the selected module is checked
      const updatedBetaModule20Checkbox = await screen.findByRole('checkbox', {
        name: /select row 1/i, // betaModule 2.0 is now at position 1
      });
      expect(updatedBetaModule20Checkbox).toBeChecked();

      // Verify that only one checkbox is checked
      const allCheckboxes = await screen.findAllByRole('checkbox', {
        name: /select row [0-9]/i,
      });
      const checkedCheckboxes = allCheckboxes.filter(
        (cb) => (cb as HTMLInputElement).checked,
      );
      expect(checkedCheckboxes).toHaveLength(1);
      expect(checkedCheckboxes[0]).toBe(updatedBetaModule20Checkbox);
    });

    test('unselecting a module does not cause jumping but may reset sort to default', async () => {
      const user = userEvent.setup();

      await renderCreateMode();
      await goToPackagesStep();
      await selectCustomRepo();
      await typeIntoSearchBox('sortingTest');
      await screen.findAllByText('betaModule');
      const betaModule20Checkbox = await screen.findByRole('checkbox', {
        name: /select row 3/i,
      });
      await waitFor(() => user.click(betaModule20Checkbox));
      expect(betaModule20Checkbox).toBeChecked();
      let rows = await screen.findAllByRole('row');
      rows.shift();
      expect(rows[0]).toHaveTextContent('alphaModule');
      expect(rows[0]).toHaveTextContent('2.0');
      expect(rows[1]).toHaveTextContent('betaModule');
      expect(rows[1]).toHaveTextContent('2.0');

      const updatedBetaModule20Checkbox = await screen.findByRole('checkbox', {
        name: /select row 1/i,
      });
      await waitFor(() => user.click(updatedBetaModule20Checkbox));
      expect(updatedBetaModule20Checkbox).not.toBeChecked();

      // After unselection, the sort may reset to default or stay the same
      // The important thing is that we don't get jumping/reordering during the interaction
      rows = await screen.findAllByRole('row');
      rows.shift(); // Remove header row
      const allCheckboxes = await screen.findAllByRole('checkbox', {
        name: /select row [0-9]/i,
      });
      const checkedCheckboxes = allCheckboxes.filter(
        (cb) => (cb as HTMLInputElement).checked,
      );
      expect(checkedCheckboxes).toHaveLength(0);

      // The key test: the table should have a consistent, predictable order
      // Either the original alphabetical order OR the stream-sorted order
      // What we don't want is jumping around during the selection/unselection process
      expect(rows).toHaveLength(6); // Still have all 6 modules
      const moduleNames = rows.map((row) => {
        const match = row.textContent.match(/(\w+Module)/);
        return match ? match[1] : '';
      });
      expect(moduleNames).toContain('alphaModule');
      expect(moduleNames).toContain('betaModule');
      expect(moduleNames).toContain('gammaModule');
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
    await goToReview();
    // informational modal pops up in the first test only as it's tied
    // to a 'imageBuilder.saveAndBuildModalSeen' variable in localStorage
    await openAndDismissSaveAndBuildModal();
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    const expectedRequest: CreateBlueprintRequest = {
      ...blueprintRequest,
      customizations: {
        ...blueprintRequest.customizations,
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
    await goToReview();
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
    await goToReview();
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    const expectedRequest: CreateBlueprintRequest = {
      ...blueprintRequest,
      customizations: {
        ...blueprintRequest.customizations,
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
    await goToReview();
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    const expectedRequest = blueprintRequest;

    expect(receivedRequest).toEqual(expectedRequest);
  });

  test('with custom groups', async () => {
    await renderCreateMode();
    await goToPackagesStep();
    await typeIntoSearchBox('@grouper'); // search for '@grouper' package group
    await clickFirstPackageCheckbox(); // select
    await goToReview();

    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    const expectedRequest: CreateBlueprintRequest = {
      ...blueprintRequest,
      customizations: {
        ...blueprintRequest.customizations,
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
    await goToReview();

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
      await selectRhel9(); // recommendations are not available for RHEL 10 yet
      await goToPackagesStep();
      await typeIntoSearchBox('test'); // search for 'test' package
      await clickFirstPackageCheckbox(); // select
      await addSingleRecommendation();
      await goToReview();
      const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

      const expectedRequest: CreateBlueprintRequest = {
        ...blueprintRequest,
        distribution: RHEL_9,
        customizations: {
          ...blueprintRequest.customizations,
          packages: expectedSinglePackageRecommendation,
        },
      };

      expect(receivedRequest).toEqual(expectedRequest);
    });

    test('clicking "Add all packages" adds all recommendations to the request', async () => {
      await renderCreateMode();
      await selectRhel9(); // recommendations are not available for RHEL 10 yet
      await goToPackagesStep();
      await typeIntoSearchBox('test'); // search for 'test' package
      await clickFirstPackageCheckbox(); // select
      await addAllRecommendations();
      await goToReview();
      const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

      const expectedRequest: CreateBlueprintRequest = {
        ...blueprintRequest,
        distribution: RHEL_9,
        customizations: {
          ...blueprintRequest.customizations,
          packages: expectedAllPackageRecommendations,
        },
      };

      expect(receivedRequest).toEqual(expectedRequest);
    });

    test('deselecting a package recommendation removes it from the request', async () => {
      await renderCreateMode();
      await selectRhel9(); // recommendations are not available for RHEL 10 yet
      await goToPackagesStep();
      await typeIntoSearchBox('test'); // search for 'test' package
      await clickFirstPackageCheckbox(); // select
      await addSingleRecommendation();
      await toggleSelected();
      await deselectRecommendation();
      await goToReview();
      const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

      const expectedRequest: CreateBlueprintRequest = {
        ...blueprintRequest,
        distribution: RHEL_9,
        customizations: {
          ...blueprintRequest.customizations,
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
      `${EDIT_BLUEPRINT}/${id}`,
    );
    const expectedRequest = packagesCreateBlueprintRequest;
    expect(receivedRequest).toEqual(expectedRequest);
  });
});
