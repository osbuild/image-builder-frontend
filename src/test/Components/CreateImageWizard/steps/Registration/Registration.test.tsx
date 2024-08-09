import React from 'react';

import { Router as RemixRouter } from '@remix-run/router/dist/router';
import {
  screen,
  waitFor,
  waitForElementToBeRemoved,
} from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';

import CreateImageWizard from '../../../../../Components/CreateImageWizard/CreateImageWizard';
import ShareImageModal from '../../../../../Components/ShareImageModal/ShareImageModal';
import {
  CREATE_BLUEPRINT,
  EDIT_BLUEPRINT,
  RHEL_9,
  RHSM_API,
} from '../../../../../constants';
import {
  CreateBlueprintRequest,
  ImageRequest,
} from '../../../../../store/imageBuilderApi';
import { mockBlueprintIds } from '../../../../fixtures/blueprints';
import { registrationCreateBlueprintRequest } from '../../../../fixtures/editMode';
import { server } from '../../../../mocks/server';
import { renderCustomRoutesWithReduxRouter } from '../../../../testUtils';
import {
  clickBack,
  clickNext,
  verifyCancelButton,
} from '../../wizardTestUtils';
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

const selectActivationKey = async () => {
  const user = userEvent.setup();
  const activationKeyDropdown = await screen.findByRole('textbox', {
    name: 'Select activation key',
  });
  await waitFor(() => user.click(activationKeyDropdown));
  const activationKey = await screen.findByRole('option', {
    name: 'name0',
  });
  await waitFor(() => user.click(activationKey));
};

const clickShowAdditionalConnectionOptions = async () => {
  const user = userEvent.setup();
  const link = await screen.findByText('Show additional connection options');
  await waitFor(() => user.click(link));
};

const deselectEnableRemoteRemediations = async () => {
  const user = userEvent.setup();
  const checkBox = await screen.findByRole('checkbox', {
    name: 'Enable remote remediations and system management with automation',
  });
  await waitFor(() => user.click(checkBox));
};

const deselectPredictiveAnalytics = async () => {
  const user = userEvent.setup();
  const checkBox = await screen.findByRole('checkbox', {
    name: 'Enable predictive analytics and management capabilities',
  });
  await waitFor(() => user.click(checkBox));
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

const routes = [
  {
    path: 'insights/image-builder/*',
    element: <div />,
  },
  {
    path: 'insights/image-builder/imagewizard/:composeId?',
    element: <CreateImageWizard />,
  },
  {
    path: 'insights/image-builder/share /:composeId',
    element: <ShareImageModal />,
  },
];

let router: RemixRouter | undefined = undefined;

describe('Step Registration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    router = undefined;
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

    await screen.findByRole('textbox', {
      name: 'Select activation key',
    });
  };

  test('clicking Next loads file system configuration', async () => {
    await setUp();

    const registerLaterRadio = await screen.findByTestId(
      'registration-radio-later'
    );
    user.click(registerLaterRadio);

    await clickNext();
    await clickNext();

    await screen.findByRole('heading', {
      name: 'File system configuration',
    });
  });

  test('clicking Back loads Upload to AWS', async () => {
    await setUp();

    await clickBack();

    const manualOption = await screen.findByRole('radio', {
      name: /manually enter an account id\./i,
    });
    await waitFor(async () => user.click(manualOption));
    await screen.findByText('AWS account ID');
  });

  test('clicking Cancel loads landing page', async () => {
    await setUp();

    await verifyCancelButton(router);
  });

  test('activation key dropdown empty state', async () => {
    server.use(
      http.get(`${RHSM_API}/activation_keys`, () =>
        HttpResponse.json({ body: [] })
      )
    );
    await setUp();
    const activationKeyDropdown = await screen.findByRole('textbox', {
      name: 'Select activation key',
    });
    user.click(activationKeyDropdown);
    await screen.findByText('No activation keys found');
  });

  test('should allow registering with rhc', async () => {
    await setUp();

    const activationKeyDropdown = await screen.findByRole('textbox', {
      name: 'Select activation key',
    });
    user.click(activationKeyDropdown);
    const activationKey = await screen.findByRole('option', {
      name: 'name0',
    });
    user.click(activationKey);
    await screen.findByDisplayValue('name0');

    await goToReviewStep();
    const review = await screen.findByTestId('review-registration');
    expect(review).toHaveTextContent(
      'Register with Red Hat Subscription Manager (RHSM)'
    );
    expect(review).toHaveTextContent('Connect to Red Hat Insights');
    expect(review).toHaveTextContent(
      'Use remote host configuration (rhc) utility'
    );
    screen.getAllByText('012345678901');
  });

  test('should allow registering without rhc', async () => {
    await setUp();

    const showOptions = await screen.findByTestId(
      'registration-additional-options'
    );

    user.click(showOptions);
    const rhcCheckbox = await screen.findByTestId('registration-checkbox-rhc');
    await waitFor(async () => user.click(rhcCheckbox));

    // going back and forward when rhc isn't selected should keep additional options shown
    await clickBack();
    await screen.findByRole('textbox', {
      name: 'aws account id',
    });
    await clickNext();
    await screen.findByTestId('registration-checkbox-insights');
    await screen.findByTestId('registration-checkbox-rhc');

    const activationKeyDropdown = await screen.findByRole('textbox', {
      name: 'Select activation key',
    });
    user.click(activationKeyDropdown);
    const activationKey = await screen.findByRole('option', {
      name: 'name0',
    });
    user.click(activationKey);
    await screen.findByDisplayValue('name0');

    await goToReviewStep();
    const review = await screen.findByTestId('review-registration');
    expect(review).toHaveTextContent(
      'Register with Red Hat Subscription Manager (RHSM)'
    );
    expect(review).toHaveTextContent('Connect to Red Hat Insights');
    screen.getAllByText('012345678901');
    expect(review).not.toHaveTextContent(
      'Use remote host configuration (rhc) utility'
    );
  });

  test('should allow registering without insights or rhc', async () => {
    await setUp();

    const showOptions = await screen.findByTestId(
      'registration-additional-options'
    );

    user.click(showOptions);
    const insightsCheckbox = await screen.findByTestId(
      'registration-checkbox-insights'
    );

    user.click(insightsCheckbox);

    // going back and forward when neither rhc or insights is selected should keep additional options shown
    await clickBack();
    await screen.findByRole('textbox', {
      name: 'aws account id',
    });
    await clickNext();
    await screen.findByTestId('registration-checkbox-insights');
    await screen.findByTestId('registration-checkbox-rhc');

    const activationKeyDropdown = await screen.findByRole('textbox', {
      name: 'Select activation key',
    });
    user.click(activationKeyDropdown);
    const activationKey = await screen.findByRole('option', {
      name: 'name0',
    });
    user.click(activationKey);
    await screen.findByDisplayValue('name0');

    await goToReviewStep();
    const review = await screen.findByTestId('review-registration');
    expect(review).toHaveTextContent(
      'Register with Red Hat Subscription Manager (RHSM)'
    );
    screen.getAllByText('012345678901');
    expect(review).not.toHaveTextContent('Connect to Red Hat Insights');
    expect(review).not.toHaveTextContent(
      'Use remote host configuration (rhc) utility'
    );
  });

  test('should hide input fields when clicking Register the system later', async () => {
    await setUp();
    const removeKeyInformation = waitForElementToBeRemoved(() => [
      screen.getByTestId('subscription-activation-key'),
    ]);

    // click the later radio button which should remove any input fields
    const manualOption = await screen.findByTestId('registration-radio-later');
    await waitFor(async () => user.click(manualOption));

    await removeKeyInformation;

    await goToReviewStep();
    await screen.findByText('Register the system later');
  });

  test('registering with rhc implies registering with insights', async () => {
    await setUp();
    const showOptions = await screen.findByTestId(
      'registration-additional-options'
    );

    user.click(showOptions);

    const insightsCheckbox = await screen.findByTestId(
      'registration-checkbox-insights'
    );

    user.click(insightsCheckbox);
    await waitFor(async () =>
      expect(
        await screen.findByTestId('registration-checkbox-rhc')
      ).not.toBeChecked()
    );

    const rhcCheckbox = await screen.findByTestId('registration-checkbox-rhc');
    user.click(rhcCheckbox);

    await waitFor(async () =>
      expect(
        await screen.findByTestId('registration-checkbox-insights')
      ).toBeChecked()
    );
  });
});

describe('registration request generated correctly', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

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
  beforeEach(() => {
    vi.clearAllMocks();
  });

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
