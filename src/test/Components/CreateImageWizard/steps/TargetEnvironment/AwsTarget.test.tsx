import React from 'react';

import type { Router as RemixRouter } from '@remix-run/router';
import { screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';

import CreateImageWizard from '../../../../../Components/CreateImageWizard/CreateImageWizard';
import {
  CREATE_BLUEPRINT,
  EDIT_BLUEPRINT,
  PROVISIONING_API,
} from '../../../../../constants';
import {
  CreateBlueprintRequest,
  ImageRequest,
} from '../../../../../store/imageBuilderApi';
import { mockBlueprintIds } from '../../../../fixtures/blueprints';
import { awsCreateBlueprintRequest } from '../../../../fixtures/editMode';
import { server } from '../../../../mocks/server';
import { renderCustomRoutesWithReduxRouter } from '../../../../testUtils';
import {
  clickBack,
  clickNext,
  getNextButton,
  verifyCancelButton,
} from '../../wizardTestUtils';
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

const goToAwsStep = async () => {
  await clickNext();
};

const goToReview = async () => {
  await clickNext(); // Register
  await clickRegisterLater();
  await clickNext(); // OpenSCAP
  await clickNext(); // File system customization
  await clickNext(); // Snapshot repositories
  await clickNext(); // Custom repositories
  await clickNext(); // Additional packages
  await clickNext(); // Details
  await clickNext(); // FirstBoot
  await enterBlueprintName();
  await clickNext(); // Review
};

const selectAwsTarget = async () => {
  const user = userEvent.setup();
  await renderCreateMode();
  const awsCard = await screen.findByTestId('upload-aws');
  await waitFor(() => user.click(awsCard));
  await clickNext();
};

const deselectAwsAndSelectGuestImage = async () => {
  const user = userEvent.setup();
  const awsCard = await screen.findByTestId('upload-aws');
  await waitFor(() => user.click(awsCard));
  const guestImageCheckbox = await screen.findByRole('checkbox', {
    name: /virtualization guest image checkbox/i,
  });
  await waitFor(async () => user.click(guestImageCheckbox));
};

const selectSource = async () => {
  const user = userEvent.setup();
  const sourceTexbox = await screen.findByRole('textbox', {
    name: /select source/i,
  });
  await waitFor(async () => user.click(sourceTexbox));

  const sourceOption = await screen.findByRole('option', {
    name: /my_source/i,
  });
  await waitFor(async () => user.click(sourceOption));
};

const enterAccountId = async () => {
  const user = userEvent.setup();
  const manualOption = await screen.findByText(
    /manually enter an account id\./i
  );
  await waitFor(async () => user.click(manualOption));

  const awsAccountIdTextbox = await screen.findByRole('textbox', {
    name: 'aws account id',
  });
  await waitFor(async () => user.type(awsAccountIdTextbox, '123123123123'));
};

let router: RemixRouter | undefined = undefined;
const routes = [
  {
    path: 'insights/image-builder/*',
    element: <div />,
  },
  {
    path: 'insights/image-builder/imagewizard/:composeId?',
    element: <CreateImageWizard />,
  },
];

const getSourceDropdown = async () => {
  const sourceDropdown = await screen.findByRole('textbox', {
    name: /select source/i,
  });
  await waitFor(() => expect(sourceDropdown).toBeEnabled());

  return sourceDropdown;
};

const switchToAWSManual = async () => {
  const user = userEvent.setup();
  const manualRadio = await screen.findByRole('radio', {
    name: /manually enter an account id\./i,
  });
  await waitFor(() => user.click(manualRadio));
  return manualRadio;
};

describe('Step Upload to AWS', () => {
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

    await screen.findByRole('heading', {
      name: 'Target environment - Amazon Web Services',
    });
  };

  test('clicking Next loads Registration', async () => {
    await setUp();

    await switchToAWSManual();
    const awsAccountId = await screen.findByRole('textbox', {
      name: 'aws account id',
    });
    await waitFor(async () => user.type(awsAccountId, '012345678901'));
    await clickNext();

    await screen.findByRole('textbox', {
      name: 'Select activation key',
    });

    await screen.findByText(
      'Automatically register and enable advanced capabilities'
    );
  });

  test('clicking Back loads Release', async () => {
    await setUp();

    await clickBack();

    await screen.findByTestId('upload-aws');
  });

  test('clicking Cancel loads landing page', async () => {
    await setUp();

    await verifyCancelButton(router);
  });

  test('component renders error state correctly', async () => {
    server.use(
      http.get(`${PROVISIONING_API}/sources`, () => {
        return new HttpResponse(null, { status: 500 });
      })
    );
    await setUp();
    await screen.findByText(
      /sources cannot be reached, try again later or enter an aws account id manually\./i
    );
  });

  test('validation works', async () => {
    await setUp();
    const nextButton = await getNextButton();

    expect(nextButton).toHaveClass('pf-m-disabled');

    const manualOption = await screen.findByRole('radio', {
      name: /manually enter an account id\./i,
    });
    await waitFor(async () => user.click(manualOption));

    expect(nextButton).toHaveClass('pf-m-disabled');

    const awsAccId = await screen.findByRole('textbox', {
      name: 'aws account id',
    });
    expect(awsAccId).toHaveValue('');
    expect(awsAccId).toBeEnabled();
    await waitFor(() => user.type(awsAccId, '012345678901'));

    expect(nextButton).not.toHaveClass('pf-m-disabled');

    const sourceRadio = await screen.findByRole('radio', {
      name: /use an account configured from sources\./i,
    });

    user.click(sourceRadio);

    await waitFor(() => expect(nextButton).toHaveClass('pf-m-disabled'));

    const sourceDropdown = await getSourceDropdown();
    user.click(sourceDropdown);

    const source = await screen.findByRole('option', {
      name: /my_source/i,
    });
    user.click(source);

    await waitFor(() => expect(nextButton).not.toHaveClass('pf-m-disabled'));
  });

  test('compose request share_with_sources field is correct', async () => {
    await setUp();

    const sourceDropdown = await getSourceDropdown();
    user.click(sourceDropdown);

    const source = await screen.findByRole('option', {
      name: /my_source/i,
    });
    user.click(source);

    // click through to review step
    await goToReview();
    // informational modal pops up in the first test only as it's tied
    // to a 'imageBuilder.saveAndBuildModalSeen' variable in localStorage
    await openAndDismissSaveAndBuildModal();

    const createBlueprintBtn = await screen.findByRole('button', {
      name: /Create blueprint/,
    });

    user.click(createBlueprintBtn);

    // returns back to the landing page
    await waitFor(() =>
      expect(router?.state.location.pathname).toBe('/insights/image-builder')
    );
    // set test timeout of 10 seconds
  }, 10000);
});

describe('aws image type request generated correctly', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('using a source', async () => {
    await selectAwsTarget();
    await goToAwsStep();
    await selectSource();
    await goToReview();
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    const expectedImageRequest: ImageRequest = {
      architecture: 'x86_64',
      image_type: 'aws',
      upload_request: {
        options: {
          share_with_sources: ['123'],
        },
        type: 'aws',
      },
    };

    const expectedRequest: CreateBlueprintRequest = {
      ...blueprintRequest,
      image_requests: [expectedImageRequest],
    };

    expect(receivedRequest).toEqual(expectedRequest);
  });

  test('using an account id', async () => {
    await selectAwsTarget();
    await goToAwsStep();
    await enterAccountId();
    await goToReview();
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    const expectedImageRequest: ImageRequest = {
      architecture: 'x86_64',
      image_type: 'aws',
      upload_request: {
        options: {
          share_with_accounts: ['123123123123'],
        },
        type: 'aws',
      },
    };

    const expectedRequest: CreateBlueprintRequest = {
      ...blueprintRequest,
      image_requests: [expectedImageRequest],
    };

    expect(receivedRequest).toEqual(expectedRequest);
  });

  test('after selecting and deselecting aws', async () => {
    await selectAwsTarget();
    await goToAwsStep();
    await selectSource();
    await clickBack();
    await deselectAwsAndSelectGuestImage();
    await goToReview();
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    await waitFor(() => {
      expect(receivedRequest).toEqual(blueprintRequest);
    });
  });
});

describe('AWS edit mode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('edit mode works', async () => {
    const id = mockBlueprintIds['aws'];
    await renderEditMode(id);

    // starts on review step
    const receivedRequest = await interceptEditBlueprintRequest(
      `${EDIT_BLUEPRINT}/${id}`
    );
    const expectedRequest = awsCreateBlueprintRequest;
    expect(receivedRequest).toEqual(expectedRequest);
  });
});
