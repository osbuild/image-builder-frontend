import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { CREATE_BLUEPRINT } from '../../../../../constants';
import { CreateBlueprintRequest } from '../../../../../store/imageBuilderApi';
import { clickNext } from '../../../../testUtils';
import {
  blueprintRequest,
  clickRegisterLater,
  enterBlueprintName,
  interceptBlueprintRequest,
  render,
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

const goToPackagesStep = async () => {
  const bareMetalCheckBox = await screen.findByRole('checkbox', {
    name: /bare metal installer checkbox/i,
  });
  await userEvent.click(bareMetalCheckBox);
  await clickNext(); // Registration
  await clickRegisterLater();
  await clickNext(); // OpenSCAP
  await clickNext(); // File System
  await clickNext(); // Custom repositories
  await clickNext(); // Additional packages
};

const goToReviewStep = async () => {
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

const openRecommendationsExpandable = async () => {
  await userEvent.click(
    await screen.findByRole('button', { name: /recommended red hat packages/i })
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
  const expectedPackages: string[] = ['test'];

  test('with custom packages', async () => {
    await render();
    await goToPackagesStep();
    await searchForPackage();
    await selectFirstPackage();
    await goToReviewStep();
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
    await render();
    await goToPackagesStep();
    await searchForPackage();
    await selectFirstPackage();
    await deselectFirstPackage();
    await goToReviewStep();
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    const expectedRequest = blueprintRequest;

    expect(receivedRequest).toEqual(expectedRequest);
  });
});

describe('package recommendations', () => {
  const expectedSinglePackageRecommendation: string[] = [
    'test', // recommendations are generated only when some packages have been selected
    'recommendedPackage1',
  ];

  const expectedAllPackageRecommendations: string[] = [
    'test', // recommendations are generated only when some packages have been selected
    'recommendedPackage1',
    'recommendedPackage2',
    'recommendedPackage3',
    'recommendedPackage4',
    'recommendedPackage5',
  ];

  const expectedPackagesWithoutRecommendations: string[] = ['test'];

  test('selecting single recommendation adds it to the request', async () => {
    await render();
    await goToPackagesStep();
    await searchForPackage();
    await selectFirstPackage();
    await openRecommendationsExpandable();
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
    await render();
    await goToPackagesStep();
    await searchForPackage();
    await selectFirstPackage();
    await openRecommendationsExpandable();
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
    await render();
    await goToPackagesStep();
    await searchForPackage();
    await selectFirstPackage();
    await openRecommendationsExpandable();
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

    expect(receivedRequest).toEqual(expectedRequest);
  });
});
