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
import { clickNext } from '../../../../testUtils';
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
