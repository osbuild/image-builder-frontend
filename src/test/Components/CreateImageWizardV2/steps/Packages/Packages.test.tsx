import { screen, waitFor } from '@testing-library/react';
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
    isBeta: () => true,
    isProd: () => true,
    getEnvironment: () => 'prod',
  }),
}));

jest.mock('@unleash/proxy-client-react', () => ({
  useUnleashContext: () => jest.fn(),
  useFlag: jest.fn((flag) =>
    flag === 'image-builder.pkgrecs.enabled' ? true : false
  ),
}));

const goToPackagesStep = async () => {
  const guestImageCheckBox = await screen.findByRole('checkbox', {
    name: /virtualization guest image checkbox/i,
  });
  await userEvent.click(guestImageCheckBox);
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
  const searchBox = await screen.findByRole('textbox', {
    name: /search packages/i,
  });
  await userEvent.type(searchBox, 'test');
};

const searchForGroup = async () => {
  const searchBox = await screen.findByRole('textbox', {
    name: /search packages/i,
  });
  await userEvent.type(searchBox, '@grouper');
};

const selectFirstPackage = async () => {
  await userEvent.click(
    await screen.findByRole('checkbox', { name: /select row 0/i })
  );
};

const deselectFirstPackage = async () => {
  await userEvent.click(
    await screen.findByRole('checkbox', { name: /select row 0/i })
  );
};

const addSingleRecommendation = async () => {
  const addPackageButtons = await screen.findAllByText(/add package/i);
  await userEvent.click(addPackageButtons[0]);
};

const addAllRecommendations = async () => {
  await userEvent.click(await screen.findByText(/add all packages/i));
};

const switchToSelected = async () => {
  await userEvent.click(
    await screen.findByRole('button', { name: /selected \(\d*\)/i })
  );
};

const deselectRecommendation = async () => {
  await userEvent.click(
    await screen.findByRole('checkbox', { name: /select row 1/i })
  );
};

describe('packages request generated correctly', () => {
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
