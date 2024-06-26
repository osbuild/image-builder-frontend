import { screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import {
  CREATE_BLUEPRINT,
  EDIT_BLUEPRINT,
  RHEL_9,
} from '../../../../../constants';
import {
  CreateBlueprintRequest,
  ImageRequest,
} from '../../../../../store/imageBuilderApi';
import { mockBlueprintIds } from '../../../../fixtures/blueprints';
import { registrationCreateBlueprintRequest } from '../../../../fixtures/editMode';
import { clickNext } from '../../../../testUtils';
import {
  enterBlueprintName,
  renderCreateMode,
  interceptBlueprintRequest,
  goToRegistrationStep,
  clickRegisterLater,
  openAndDismissSaveAndBuildModal,
  renderEditMode,
  interceptEditBlueprintRequest,
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

const selectActivationKey = async () => {
  const activationKeyDropdown = await screen.findByRole('textbox', {
    name: 'Select activation key',
  });
  await userEvent.click(activationKeyDropdown);
  const activationKey = await screen.findByRole('option', {
    name: 'name0',
  });
  await userEvent.click(activationKey);
};

const clickShowAdditionalConnectionOptions = async () => {
  const link = await screen.findByText('Show additional connection options');
  await userEvent.click(link);
};

const deselectEnableRemoteRemediations = async () => {
  const checkBox = await screen.findByRole('checkbox', {
    name: 'Enable remote remediations and system management with automation',
  });
  await userEvent.click(checkBox);
};

const deselectPredictiveAnalytics = async () => {
  const checkBox = await screen.findByRole('checkbox', {
    name: 'Enable predictive analytics and management capabilities',
  });
  await userEvent.click(checkBox);
};

const goToReviewStep = async () => {
  await clickNext();
  await clickNext();
  await clickNext();
  await clickNext();
  await clickNext();
  await clickNext();
  await clickNext();
  await enterBlueprintName();
  await clickNext();
};

describe('registration request generated correctly', () => {
  const imageRequest: ImageRequest = {
    architecture: 'x86_64',
    image_type: 'guest-image',
    upload_request: {
      options: {},
      type: 'aws.s3',
    },
  };

  const blueprintRequest: CreateBlueprintRequest = {
    name: 'Red Velvet',
    description: '',
    distribution: RHEL_9,
    image_requests: [imageRequest],
    customizations: {},
  };

  test('register + insights + rhc', async () => {
    await renderCreateMode();
    await goToRegistrationStep();
    await selectActivationKey();
    await goToReviewStep();
    // informational modal pops up in the first test only as it's tied
    // to a 'imageBuilder.saveAndBuildModalSeen' variable in localStorage
    await openAndDismissSaveAndBuildModal();
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    const expectedSubscription = {
      'activation-key': 'name0',
      insights: true,
      rhc: true,
      organization: 5,
      'server-url': 'subscription.rhsm.redhat.com',
      'base-url': 'https://cdn.redhat.com/',
    };
    const expectedRequest = {
      ...blueprintRequest,
      customizations: { subscription: expectedSubscription },
    };

    expect(receivedRequest).toEqual(expectedRequest);
  });

  test('register + insights', async () => {
    await renderCreateMode();
    await goToRegistrationStep();
    await clickShowAdditionalConnectionOptions();
    await deselectEnableRemoteRemediations();
    await selectActivationKey();
    await goToReviewStep();
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    const expectedSubscription = {
      'activation-key': 'name0',
      insights: true,
      rhc: false,
      organization: 5,
      'server-url': 'subscription.rhsm.redhat.com',
      'base-url': 'https://cdn.redhat.com/',
    };
    const expectedRequest = {
      ...blueprintRequest,
      customizations: { subscription: expectedSubscription },
    };

    expect(receivedRequest).toEqual(expectedRequest);
  });

  test('register', async () => {
    await renderCreateMode();
    await goToRegistrationStep();
    await clickShowAdditionalConnectionOptions();
    await deselectPredictiveAnalytics();
    await selectActivationKey();
    await goToReviewStep();
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    const expectedSubscription = {
      'activation-key': 'name0',
      insights: false,
      rhc: false,
      organization: 5,
      'server-url': 'subscription.rhsm.redhat.com',
      'base-url': 'https://cdn.redhat.com/',
    };
    const expectedRequest = {
      ...blueprintRequest,
      customizations: { subscription: expectedSubscription },
    };

    expect(receivedRequest).toEqual(expectedRequest);
  });

  test('register Later', async () => {
    await renderCreateMode();
    await goToRegistrationStep();
    await clickShowAdditionalConnectionOptions();
    await clickRegisterLater();
    await goToReviewStep();
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    const expectedRequest = {
      ...blueprintRequest,
      customizations: {},
    };

    await waitFor(() => {
      expect(receivedRequest).toEqual(expectedRequest);
    });
  });
});

describe('Registration edit mode', () => {
  test('edit mode works', async () => {
    const id = mockBlueprintIds['registration'];
    await renderEditMode(id);

    // starts on review step
    const receivedRequest = await interceptEditBlueprintRequest(
      `${EDIT_BLUEPRINT}/${id}`
    );
    const expectedRequest = registrationCreateBlueprintRequest;
    expect(receivedRequest).toEqual(expectedRequest);
  });
});
