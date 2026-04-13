// NOTE: Ready for Playwright migration
// The unit tests for this component have been migrated to co-located tests.
// The remaining tests here are integration/E2E tests that should be migrated to Playwright.
import { Router as RemixRouter } from '@remix-run/router/dist/router';
import { screen, waitFor, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { CreateBlueprintRequest } from '@/store/api/backend';

import {
  CREATE_BLUEPRINT,
  EDIT_BLUEPRINT,
  RHEL_9,
} from '../../../../../constants';
import { mockBlueprintIds } from '../../../../fixtures/blueprints';
import {
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
  clickReviewImage,
  enterBlueprintName,
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
  await clickRegisterLater();
  await goToStep(/Packages/);
};

const typeIntoSearchBox = async (searchTerm: string) => {
  const user = userEvent.setup();
  const searchbox = await screen.findByRole('textbox', {
    name: /search package/i,
  });
  await waitFor(() => user.type(searchbox, searchTerm));
};

const selectFirstPkgOption = async (name: string) => {
  const user = userEvent.setup();
  const options = await screen.findAllByRole('option', {
    name: new RegExp(name, 'i'),
  });
  await waitFor(() => user.click(options[0]));
};

const openDropdown = async () => {
  const user = userEvent.setup();
  const searchbox = await screen.findByRole('textbox', {
    name: /search package/i,
  });
  await waitFor(() => user.click(searchbox));
};

const selectRecommendation = async (name: string) => {
  const user = userEvent.setup();
  const recommendedOption = await screen.findByRole('option', {
    name: new RegExp(name, 'i'),
  });
  await waitFor(() => user.click(recommendedOption));
};

const clickRevisitButton = async () => {
  const user = userEvent.setup();
  const heading = screen.getByRole('heading', {
    name: 'Repositories and packages',
  });
  // eslint-disable-next-line testing-library/no-node-access
  const card = heading.closest('.pf-v6-c-card') as HTMLElement;
  const editButton = within(card).getByRole('button', { name: /Edit/i });
  await waitFor(() => user.click(editButton));
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
      name: 'Groups',
    });
    await screen.findByRole('heading', {
      name: 'Users',
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
    await clickReviewImage();
    await screen.findByRole('heading', {
      name: /Review image configuration/i,
    });
  });

  // Note: Basic UI tests (search bar, toggle buttons, default state, search results
  // sorting, selected packages sorting) are now covered by unit tests in:
  // src/Components/CreateImageWizard/steps/Packages/tests/Packages.test.tsx
  test('selected packages persist throughout steps', async () => {
    await renderCreateMode();
    await goToPackagesStep();
    await typeIntoSearchBox('test');
    const pkgOption = await screen.findByRole('option', { name: /test-lib/ });
    await waitFor(() => user.click(pkgOption));

    expect(await screen.findByRole('cell', { name: /test-lib/ })).toBeVisible();
    await clickNext();
    await clickBack();
    expect(await screen.findByRole('cell', { name: /test-lib/ })).toBeVisible();
  });

  // Note: "no results" and "too short" tests are now covered by unit tests in:
  // src/Components/CreateImageWizard/steps/Packages/tests/Packages.test.tsx

  test('should display recommendations', async () => {
    await renderCreateMode();
    await selectRhel9(); // recommendations are not available for RHEL 10 yet
    await goToPackagesStep();
    await typeIntoSearchBox('test');
    await selectFirstPkgOption('test');
    await openDropdown();

    await screen.findByRole('option', { name: /recommendedPackage1/i });
    await screen.findByRole('option', { name: /recommendedPackage2/i });
    await screen.findByRole('option', { name: /recommendedPackage3/i });
  });

  test('allow to add recommendations to selected', async () => {
    await renderCreateMode();
    await selectRhel9(); // recommendations are not available for RHEL 10 yet
    await goToPackagesStep();
    await typeIntoSearchBox('test');
    await selectFirstPkgOption('test');
    await openDropdown();
    await selectRecommendation('recommendedPackage1');

    const pkgTable = await screen.findByTestId('packages-table');
    await within(pkgTable).findByText('recommendedPackage1');
  });

  test('revisit step button on Review works', async () => {
    await renderCreateMode();
    await goToPackagesStep();
    await typeIntoSearchBox('test');
    await selectFirstPkgOption('test');
    await goToReview();
    await clickRevisitButton();
    await screen.findByRole('heading', { name: /Repositories and packages/ });
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

      let options = await screen.findAllByRole('option');
      await waitFor(() => expect(options).toHaveLength(6));

      expect(options[0]).toHaveTextContent('alphaModule');
      expect(options[0]).toHaveTextContent('3.0');
      expect(options[1]).toHaveTextContent('alphaModule');
      expect(options[1]).toHaveTextContent('2.0');
      expect(options[2]).toHaveTextContent('betaModule');
      expect(options[2]).toHaveTextContent('4.0');
      expect(options[3]).toHaveTextContent('betaModule');
      expect(options[3]).toHaveTextContent('2.0');

      // Select betaModule with stream 2.0
      const betaModule20Option = await screen.findByRole('option', {
        name: /betaModule 2\.0/i,
      });

      await waitFor(() => user.click(betaModule20Option));
      expect(
        await screen.findByRole('cell', {
          name: /betaModule/i,
        }),
      ).toBeVisible();
      expect(
        await screen.findByRole('cell', {
          name: /2\.0/i,
        }),
      ).toBeVisible();

      // After selection, the active stream (2.0) should be prioritized
      // All modules with stream 2.0 should move to the top, maintaining alphabetical order
      await typeIntoSearchBox('sortingTest');
      options = await screen.findAllByRole('option');
      expect(options[0]).toHaveTextContent(
        /alphamodule2\.0, dec 2025, alpha module for sorting tests/i,
      );
      expect(options[1]).toHaveTextContent(
        /betamodule2\.0, jun 2025, beta module for sorting tests/i,
      );
      expect(options[2]).toHaveTextContent(
        /gammamodule2\.0, aug 2025, gamma module for sorting tests/i,
      );
      expect(options[3]).toHaveTextContent(
        /alphamodule3\.0, dec 2027, alpha module for sorting tests/i,
      );
      expect(options[4]).toHaveTextContent(
        /betamodule4\.0, jun 2028, beta module for sorting tests/i,
      );
      expect(options[5]).toHaveTextContent(
        /gammamodule1\.5, aug 2026, gamma module for sorting tests/i,
      );
    });

    test('unselecting a module does not cause jumping but may reset sort to default', async () => {
      const user = userEvent.setup();

      await renderCreateMode();
      await goToPackagesStep();
      await selectCustomRepo();
      await typeIntoSearchBox('sortingTest');
      await screen.findAllByText('betaModule');
      const betaModule20Option = await screen.findByRole('option', {
        name: /betaModule 2\.0/i,
      });
      await waitFor(() => user.click(betaModule20Option));

      await typeIntoSearchBox('sortingTest');
      const options = await screen.findAllByRole('option');
      expect(options[0]).toHaveTextContent(/alphamodule2\.0/i);
      expect(options[1]).toHaveTextContent(/betamodule2\.0/i);

      await typeIntoSearchBox('sortingTest');
      await waitFor(() => user.click(betaModule20Option));

      // The key test: the table should have a consistent, predictable order
      // Either the original alphabetical order OR the stream-sorted order
      // What we don't want is jumping around during the selection/unselection process
      await typeIntoSearchBox('sortingTest');
      expect(options).toHaveLength(6); // Still have all 6 modules
      const moduleNames = options.map((option) => {
        const match = option.textContent.match(/(\w+Module)/);
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
    await enterBlueprintName();
    await goToPackagesStep();
    await typeIntoSearchBox('test'); // search for 'test' package
    await selectFirstPkgOption('test'); // select
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
    await enterBlueprintName();
    await goToPackagesStep();
    await typeIntoSearchBox('test'); // search for 'test' package
    await selectFirstPkgOption('test'); // select
    await waitFor(async () =>
      user.click(
        await screen.findByRole('button', { name: /remove package/i }),
      ),
    );
    await goToReview();
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    const expectedRequest = blueprintRequest;

    expect(receivedRequest).toEqual(expectedRequest);
  });

  test('with module', async () => {
    await renderCreateMode();
    await enterBlueprintName();
    await goToPackagesStep();
    await typeIntoSearchBox('testModule'); // search for 'test' package
    await selectFirstPkgOption('testModule');
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
    await enterBlueprintName();
    await goToPackagesStep();
    await typeIntoSearchBox('testModule'); // search for 'test' package
    await selectFirstPkgOption('testModule');
    await waitFor(async () =>
      user.click(
        await screen.findByRole('button', { name: /remove package/i }),
      ),
    );
    await goToReview();
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    const expectedRequest = blueprintRequest;

    expect(receivedRequest).toEqual(expectedRequest);
  });

  test('with custom groups', async () => {
    await renderCreateMode();
    await enterBlueprintName();
    await goToPackagesStep();
    await waitFor(async () =>
      user.click(
        await screen.findByRole('button', { name: /individual packages/i }),
      ),
    );
    await waitFor(async () =>
      user.click(await screen.findByText(/package groups/i)),
    );
    await typeIntoSearchBox('grouper'); // search for 'grouper' package group
    await selectFirstPkgOption('grouper'); // select
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
    await enterBlueprintName();
    await goToPackagesStep();
    await waitFor(async () =>
      user.click(
        await screen.findByRole('button', { name: /individual packages/i }),
      ),
    );
    await waitFor(async () =>
      user.click(await screen.findByText(/package groups/i)),
    );
    await typeIntoSearchBox('grouper'); // search for 'grouper' package group
    await selectFirstPkgOption('grouper'); // select
    await waitFor(async () =>
      user.click(
        await screen.findByRole('button', { name: /remove package group/i }),
      ),
    );
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
      await enterBlueprintName();
      await goToPackagesStep();
      await typeIntoSearchBox('test'); // search for 'test' package
      await selectFirstPkgOption('test'); // select
      await openDropdown();
      await selectRecommendation('recommendedPackage1');

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

    test('deselecting a package recommendation removes it from the request', async () => {
      const user = userEvent.setup();
      await renderCreateMode();
      await selectRhel9(); // recommendations are not available for RHEL 10 yet
      await enterBlueprintName();
      await goToPackagesStep();
      await typeIntoSearchBox('test'); // search for 'test' package
      await selectFirstPkgOption('test'); // select
      await openDropdown();
      await selectRecommendation('recommendedPackage1');

      await waitFor(async () =>
        user.click(
          (
            await screen.findAllByRole('button', { name: /remove package/i })
          )[0],
        ),
      );
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
