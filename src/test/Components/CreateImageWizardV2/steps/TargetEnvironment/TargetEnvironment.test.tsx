import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import {
  AARCH64,
  CENTOS_8,
  CENTOS_9,
  CREATE_BLUEPRINT,
  RHEL_8,
  RHEL_9,
  X86_64,
} from '../../../../../constants';
import {
  CreateBlueprintRequest,
  ImageRequest,
} from '../../../../../store/imageBuilderApi';
import { clickNext } from '../../../../testUtils';
import {
  blueprintRequest,
  clickRegisterLater,
  enterBlueprintName,
  goToRegistrationStep,
  imageRequest,
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

const openReleaseMenu = async () => {
  const releaseMenu = screen.getAllByRole('button', {
    name: /options menu/i,
  })[0];
  await userEvent.click(releaseMenu);
};

const openArchitectureMenu = async () => {
  const releaseMenu = screen.getAllByRole('button', {
    name: /options menu/i,
  })[1];
  await userEvent.click(releaseMenu);
};

const clickShowOptions = async () => {
  const showOptions = await screen.findByRole('button', {
    name: /show options for further development of rhel/i,
  });
  await userEvent.click(showOptions);
};

const selectRhel8 = async () => {
  await openReleaseMenu();
  const rhel8 = await screen.findByRole('option', {
    name: /red hat enterprise linux \(rhel\) 8 full support ends: may 2024 \| maintenance support ends: may 2029/i,
  });
  await userEvent.click(rhel8);
};

const selectRhel9 = async () => {
  await openReleaseMenu();
  const rhel9 = await screen.findByRole('option', {
    name: /red hat enterprise linux \(rhel\) 9 full support ends: may 2027 \| maintenance support ends: may 2032/i,
  });
  await userEvent.click(rhel9);
};

const selectCentos8 = async () => {
  await openReleaseMenu();
  await clickShowOptions();
  const centos8 = await screen.findByRole('option', {
    name: 'CentOS Stream 8',
  });
  await userEvent.click(centos8);
};

const selectCentos9 = async () => {
  await openReleaseMenu();
  await clickShowOptions();
  const centos9 = await screen.findByRole('option', {
    name: 'CentOS Stream 9',
  });
  await userEvent.click(centos9);
};

const selectX86_64 = async () => {
  await openArchitectureMenu();
  const x86_64 = await screen.findByRole('option', {
    name: 'x86_64',
  });
  await userEvent.click(x86_64);
};

const selectAarch64 = async () => {
  await openArchitectureMenu();
  const aarch64 = await screen.findByRole('option', {
    name: 'aarch64',
  });
  await userEvent.click(aarch64);
};

const goToReviewStep = async () => {
  await goToRegistrationStep(); // Register
  await clickRegisterLater();
  await clickNext(); // OpenSCAP
  await clickNext(); // File system customization
  await clickNext(); // Custom repositories
  await clickNext(); // Additional packages
  await clickNext(); // Details
  await enterBlueprintName();
  await clickNext(); // Review
};

describe('distribution request generated correctly', () => {
  test('rhel-8', async () => {
    await render();
    await selectRhel8();
    await goToReviewStep();
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    const expectedRequest: CreateBlueprintRequest = {
      ...blueprintRequest,
      distribution: RHEL_8,
    };

    expect(receivedRequest).toEqual(expectedRequest);
  });

  test('rhel-9', async () => {
    await render();
    await selectRhel9();
    await goToReviewStep();
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    const expectedRequest: CreateBlueprintRequest = {
      ...blueprintRequest,
      distribution: RHEL_9,
    };

    expect(receivedRequest).toEqual(expectedRequest);
  });

  test('centos-9', async () => {
    await render();
    await selectCentos9();
    await goToReviewStep();
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    const expectedRequest: CreateBlueprintRequest = {
      ...blueprintRequest,
      distribution: CENTOS_9,
    };

    expect(receivedRequest).toEqual(expectedRequest);
  });

  test('centos-8', async () => {
    await render();
    await selectCentos8();
    await goToReviewStep();
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    const expectedRequest: CreateBlueprintRequest = {
      ...blueprintRequest,
      distribution: CENTOS_8,
    };

    expect(receivedRequest).toEqual(expectedRequest);
  });
});

describe('architecture request generated correctly', () => {
  test('x86_64', async () => {
    await render();
    await selectX86_64();
    await goToReviewStep();
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    const expectedImageRequest: ImageRequest = {
      ...imageRequest,
      architecture: X86_64,
    };
    const expectedRequest: CreateBlueprintRequest = {
      ...blueprintRequest,
      image_requests: [expectedImageRequest],
    };

    expect(receivedRequest).toEqual(expectedRequest);
  });

  test('aarch64', async () => {
    await render();
    await selectAarch64();
    await goToReviewStep();
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    const expectedImageRequest: ImageRequest = {
      ...imageRequest,
      architecture: AARCH64,
    };
    const expectedRequest: CreateBlueprintRequest = {
      ...blueprintRequest,
      image_requests: [expectedImageRequest],
    };

    expect(receivedRequest).toEqual(expectedRequest);
  });
});
