import type { Router as RemixRouter } from '@remix-run/router';
import { act, screen, waitFor, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';

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
import {
  enterBlueprintName,
  renderCreateMode,
  interceptBlueprintRequest,
  goToRegistrationStep,
  clickRegisterLater,
  renderEditMode,
  interceptEditBlueprintRequest,
  openAndDismissSaveAndBuildModal,
  clickNext,
  clickBack,
  verifyCancelButton,
  clickReviewAndFinish,
  getNextButton,
  clickRegisterSatellite,
} from '../../wizardTestUtils';

const SATELLITE_COMMAND = `
set -o pipefail && curl -sS ‘https://ec2-107-23-89.compute-1.amazonaws.com/register?activation_keys=ak&location_id=2&organization_id=1&update_packages=false’
// -H ‘Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJleHAiOjQxMDI0NDQ4MDB9.CQ6hOQJLJDfD_P5gaEIEseY5iMRLhnk7iC5ZJ4Rzno0 | bash`;

const SATELLITE_COMMAND_EXPIRED_TOKEN = `
set -o pipefail && curl -sS ‘https://ec2-107-23-89.compute-1.amazonaws.com/register?activation_keys=ak&location_id=2&organization_id=1&update_packages=false’
// -H ‘Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjo1LCJpYXQiOjE3MjM4Mzc3MjIsImp0aSI6IjBhNTU3MDM3ZDIyNzUyMDYwM2M3MWIzZDI4NGYwZjQ1NmFjYjE5NzEyNmFmNTk5NzU0NWJmODcwZDczM2RhY2YiLCJleHAiOjE3MjM4NTIxMjIsInNjb3BlIjoicmVnaXN0cmF0aW9uI2dsb2JhbCByZWdpc3RyYXRpb24jaG9zdCJ9.HsSnZEqq--MIJfP3_awn6SflEruoEm77iSWh0Pi6EW4’
//  | bash`;

const CERTIFICATE = `-----BEGIN CERTIFICATE-----
MIIDUDCCAjigAwIBAgIUIE7ftn9J9krO6TRJg8M3plAZGgEwDQYJKoZIhvcNAQEL
BQAwYjELMAkGA1UEBhMCVVMxEzARBgNVBAgMCkNhbGlmb3JuaWExFjAUBgNVBAcM
DVNhbiBGcmFuY2lzY28xETAPBgNVBAoMCFRlc3QgT3JnMRMwEQYDVQQDDAp0ZXN0
LmxvY2FsMB4XDTI1MDIwNTEzMzk0N1oXDTI2MDIwNTEzMzk0N1owYjELMAkGA1UE
BhMCVVMxEzARBgNVBAgMCkNhbGlmb3JuaWExFjAUBgNVBAcMDVNhbiBGcmFuY2lz
Y28xETAPBgNVBAoMCFRlc3QgT3JnMRMwEQYDVQQDDAp0ZXN0LmxvY2FsMIIBIjAN
BgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAy8JdVoIaWh0PO1dL7xuGUNBUx6hZ
PBYSnWpPS7lNL3Y/KHNNZhStm0ISFYcB4C/mlJN+9kMcl3CXoktZHfrkencRwhlv
9aua70fZmmjgHDn3Stm25pqrhehUzoKZPlai9eXGJfY1q52ZMjNa0dxJjt6IST8U
oAwwXrBr14dUjuMM0ZhLeLtiTAh1Eb8CnXMmVmkhoMBbMODE3Lkqr72K8kseu8Qx
6Iq96ggkwiAQr3+h2GOkqtEl6BQEbjG1CVlVMCTU3B3yJ/uDUYvqK3897PdgWkUQ
2L3dZPTWv+p8+UjaC4zVYGnM7NpJisMZPXsbA9KiqaF+bUvLLjP9budPXwIDAQAB
MA0GCSqGSIb3DQEBCwUAA4IBAQCz2uByr3Tf34zSeYhy1z6MLJR4ijcfuWhxuE7D
M5fB4I0Ua3K6+ptZDvlWuikF+5InnoU3HSfrXVPCJ1my4jsgk+c4YKPW0yVRrr6m
hS2CKZyngICWnGCIYrlXlKeNJe4j23WF7IRhsykvkpt69Vw1x99UIJBcobOx+Kw/
zB92/XFIBwOZArUmGDaiL5MnqhmFWfc6mtIELxIRKCj9LQG9y7L1JoVyqug3thgZ
CdoLGtbHXri9BSR+8ogXu4JWp0YwMHTul6AEb2kcSZHTrYj6lUkXJMsw+E5jV37G
jZKGigLMSUp2z4jT+aX+HblYHrvTbrKct23EMeJeANQzF08e
-----END CERTIFICATE-----`;

const localStorageMock = (() => {
  let store: { [key: string]: string } = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    clear: () => (store = {}),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Initiliaze the router
const router: RemixRouter | undefined = undefined;

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

const openActivationKeyDropdown = async () => {
  const user = userEvent.setup();
  const activationKeyDropdown = await screen.findByRole('textbox', {
    name: 'Select activation key',
  });
  user.click(activationKeyDropdown);
};

const selectActivationKey = async (key: string) => {
  const user = userEvent.setup();
  const activationKey = await screen.findByRole('option', {
    name: key,
  });
  user.click(activationKey);
  await screen.findByDisplayValue(key);
};

const addSatelliteRegistrationCommandViaKeyDown = async (command: string) => {
  const user = userEvent.setup();
  const satelliteRegistrationCommand = await screen.findByPlaceholderText(
    /registration command/i
  );

  await user.type(satelliteRegistrationCommand, command);
};

const uploadFile = async (scriptName: string): Promise<void> => {
  const user = userEvent.setup();
  const fileInput: HTMLElement | null =
    // eslint-disable-next-line testing-library/no-node-access
    document.querySelector('input[type="file"]');

  if (fileInput) {
    const file = new File([scriptName], 'certificate.pem', {
      type: 'application/x-pem-file',
    });
    await user.upload(fileInput, file);
  }
};

const goToReviewStep = async () => {
  await clickNext(); // Registration
  await clickNext(); // OpenSCAP
  await clickNext(); // File system configuration
  await clickNext(); // Repository snapshot/Repeatable builds
  await clickNext(); // Custom repositories
  await clickNext(); // Additional packages
  await clickNext(); // Users
  await clickNext(); // Timezone
  await clickNext(); // Locale
  await clickNext(); // Hostname
  await clickNext(); // Kernel
  await clickNext(); // Firewall
  await clickNext(); // Services
  await clickNext(); // Details
  await enterBlueprintName();
  await clickNext(); // Review
};

const clickRevisitButton = async () => {
  const user = userEvent.setup();
  const expandable = await screen.findByTestId('registration-expandable');
  const revisitButton = await within(expandable).findByTestId(
    'revisit-registration'
  );
  await waitFor(() => user.click(revisitButton));
};

describe('Step Registration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('clicking Next leads to OpenSCAP step', async () => {
    await renderCreateMode();
    await goToRegistrationStep();
    await clickRegisterLater();
    await clickNext();
    await screen.findByRole('heading', {
      name: 'OpenSCAP profile',
    });
  });

  test('clicking Back leads to Image output step', async () => {
    await renderCreateMode();
    await goToRegistrationStep();
    await clickBack();
    await screen.findByRole('heading', {
      name: 'Image output',
    });
  });

  test('clicking Cancel loads landing page', async () => {
    await renderCreateMode();
    await goToRegistrationStep();
    await verifyCancelButton(router);
  });

  test('clicking Review and finish leads to Review', async () => {
    await renderCreateMode();
    await goToRegistrationStep();
    await clickReviewAndFinish();
    await screen.findByRole('heading', {
      name: /Review/i,
    });
  });

  test('button Review and finish is disabled for invalid state', async () => {
    server.use(
      http.get(`${RHSM_API}/activation_keys`, () => {
        return new HttpResponse(null, { status: 404 });
      })
    );

    await renderCreateMode();
    await goToRegistrationStep();
    expect(
      await screen.findByRole('button', { name: /Review and finish/ })
    ).toBeDisabled();
  });

  test('default registration includes rhsm, rhc and insights', async () => {
    await renderCreateMode();
    await goToRegistrationStep();
    await openActivationKeyDropdown();
    await selectActivationKey('name0');
    await goToReviewStep();

    const review = await screen.findByTestId('review-registration');
    expect(review).toHaveTextContent(
      'Register with Red Hat Subscription Manager (RHSM)'
    );
    expect(review).toHaveTextContent('Connect to Red Hat Insights');
    expect(review).toHaveTextContent(
      'Use remote host configuration (rhc) utility'
    );
  });

  test('should disable dropdown when clicking Register the system later', async () => {
    await renderCreateMode();
    await goToRegistrationStep();
    await clickRegisterLater();

    await waitFor(() =>
      expect(
        screen.queryByTestId('selected-activation-key')
      ).not.toBeInTheDocument()
    );
    await waitFor(async () =>
      expect(
        await screen.findByRole('button', { name: /options menu/i })
      ).toBeDisabled()
    );
    await goToReviewStep();
    await screen.findByText('Register the system later');
  });

  test('revisit step button on Review works', async () => {
    await renderCreateMode();
    await goToRegistrationStep();
    await openActivationKeyDropdown();
    await selectActivationKey('name0');
    await goToReviewStep();
    await clickRevisitButton();
    await screen.findByRole('heading', {
      name: /Register systems using this image/,
    });
  });
});

describe('Registration request generated correctly', () => {
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

  test('register now', async () => {
    await renderCreateMode();
    await goToRegistrationStep();
    await clickShowAdditionalConnectionOptions();
    await deselectPredictiveAnalytics();
    await goToReviewStep();
    // informational modal pops up in the first test only as it's tied
    // to a 'imageBuilder.saveAndBuildModalSeen' variable in localStorage
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

    await waitFor(() => {
      expect(receivedRequest).toEqual(expectedRequest);
    });
  });

  test('register later', async () => {
    await renderCreateMode();
    await goToRegistrationStep();
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

  test('register with no key in local storage', async () => {
    await renderCreateMode();
    await goToRegistrationStep();

    await screen.findByDisplayValue('name0');
    await goToReviewStep();

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

    await waitFor(() => {
      expect(receivedRequest).toEqual(expectedRequest);
    });
  });

  test('register with a key in local storage', async () => {
    await renderCreateMode();
    localStorage.setItem('imageBuilder.recentActivationKey', 'name1');
    await goToRegistrationStep();

    await screen.findByDisplayValue('name1');
    await goToReviewStep();

    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);
    const expectedSubscription = {
      'activation-key': 'name1',
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

    await waitFor(() => {
      expect(receivedRequest).toEqual(expectedRequest);
    });

    // clear mocked values in localStorage so they don't affect following tests
    localStorage.clear();
  });

  test('register with satellite', async () => {
    await renderCreateMode();
    await goToRegistrationStep();
    await clickRegisterSatellite();

    const nextButton = await getNextButton();
    expect(nextButton).toBeDisabled();

    await uploadFile(CERTIFICATE);
    expect(nextButton).toBeDisabled();
    await act(async () => {
      await addSatelliteRegistrationCommandViaKeyDown(
        SATELLITE_COMMAND_EXPIRED_TOKEN
      );
    });
    const expiredTokenHelper = await screen.findByText(
      /The token is already expired or will expire by next day. Expiration date/i
    );
    await waitFor(() => expect(expiredTokenHelper).toBeInTheDocument());

    await act(async () => {
      await addSatelliteRegistrationCommandViaKeyDown(SATELLITE_COMMAND);
    });
    expect(nextButton).toBeEnabled();
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
