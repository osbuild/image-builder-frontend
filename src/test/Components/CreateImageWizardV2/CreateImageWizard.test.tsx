import React from 'react';

import '@testing-library/jest-dom';

import type { Router as RemixRouter } from '@remix-run/router';
import {
  screen,
  waitFor,
  //   waitForElementToBeRemoved,
  within,
} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { rest } from 'msw';

import CreateImageWizard from '../../../Components/CreateImageWizardV2/CreateImageWizard';
import ShareImageModal from '../../../Components/ShareImageModal/ShareImageModal';
import {
  //   IMAGE_BUILDER_API,
  PROVISIONING_API,
  //   RHEL_8,
  //   RHSM_API,
} from '../../../constants.js';
import { server } from '../../mocks/server.js';
import {
  clickBack,
  clickNext,
  getNextButton,
  renderCustomRoutesWithReduxRouter,
  verifyCancelButton,
} from '../../testUtils';

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
    isBeta: () => false,
    isProd: () => true,
    getEnvironment: () => 'prod',
  }),
}));

// jest.mock('@unleash/proxy-client-react', () => ({
//   useUnleashContext: () => jest.fn(),
//   useFlag: jest.fn((flag) =>
//     flag === 'image-builder.enable-content-sources' ? true : false
//   ),
// }));

// const searchForAvailablePackages = async (searchbox, searchTerm) => {
//   const user = userEvent.setup();
//   await user.type(searchbox, searchTerm);
//   await user.click(
//     await screen.findByRole('button', {
//       name: /search button for available packages/i,
//     })
//   );
// };

const switchToAWSManual = async () => {
  const user = userEvent.setup();
  const manualRadio = screen.getByRole('radio', {
    name: /manually enter an account id\./i,
  });
  await user.click(manualRadio);
  return manualRadio;
};

const getSourceDropdown = async () => {
  const sourceDropdown = screen.getByRole('textbox', {
    name: /select source/i,
  });
  await waitFor(() => expect(sourceDropdown).toBeEnabled());

  return sourceDropdown;
};

beforeAll(() => {
  // scrollTo is not defined in jsdom
  window.HTMLElement.prototype.scrollTo = function () {};
});

afterEach(() => {
  jest.clearAllMocks();
  router = undefined;
  server.resetHandlers();
});

describe('Create Image Wizard', () => {
  test('renders component', () => {
    renderCustomRoutesWithReduxRouter('imagewizard', {}, routes);
    // check heading
    screen.getByRole('heading', { name: /Image Builder/ });

    screen.getByRole('button', { name: 'Image output' });
    // screen.getByRole('button', { name: 'Register' });
    // screen.getByRole('button', { name: 'File system configuration' });
    // screen.getByRole('button', { name: 'Content' });
    // screen.getByRole('button', { name: 'Additional Red Hat packages' });
    // screen.getByRole('button', { name: 'Custom repositories' });
    // screen.getByRole('button', { name: 'Details' });
    // screen.getByRole('button', { name: 'Review' });
  });
});

describe('Step Image output', () => {
  const user = userEvent.setup();
  const setUp = async () => {
    ({ router } = await renderCustomRoutesWithReduxRouter(
      'imagewizard',
      {},
      routes
    ));

    // select aws as upload destination
    await user.click(await screen.findByTestId('upload-aws'));

    await screen.findByRole('heading', { name: 'Image output' });
  };

  test('clicking Next loads Upload to AWS', async () => {
    await setUp();

    await clickNext();

    await switchToAWSManual();
    await screen.findByText('AWS account ID');
  });

  test('clicking Cancel loads landing page', async () => {
    await setUp();
    await clickNext();

    await verifyCancelButton(router);
  });

  test('target environment is required', async () => {
    await setUp();

    const destination = await screen.findByTestId('target-select');
    const required = await within(destination).findByText('*');
    expect(destination).toBeEnabled();
    expect(destination).toContainElement(required);
  });

  test('selecting and deselecting a tile disables the next button', async () => {
    await setUp();
    const nextButton = await getNextButton();

    const awsTile = screen.getByTestId('upload-aws');
    // this has already been clicked once in the setup function
    await user.click(awsTile); // deselect

    const googleTile = screen.getByTestId('upload-google');
    await user.click(googleTile); // select
    await user.click(googleTile); // deselect

    const azureTile = screen.getByTestId('upload-azure');
    await user.click(azureTile); // select
    await user.click(azureTile); // deselect

    await waitFor(() => expect(nextButton).toBeDisabled());
  });

  test('expect only RHEL releases before expansion', async () => {
    await setUp();

    const releaseMenu = screen.getAllByRole('button', {
      name: /options menu/i,
    })[0];
    await user.click(releaseMenu);

    await screen.findByRole('option', {
      name: /Red Hat Enterprise Linux \(RHEL\) 8/,
    });
    await screen.findByRole('option', {
      name: /Red Hat Enterprise Linux \(RHEL\) 9/,
    });
    await screen.findByRole('button', {
      name: 'Show options for further development of RHEL',
    });

    await user.click(releaseMenu);
  });

  test('expect all releases after expansion', async () => {
    await setUp();

    const releaseMenu = screen.getAllByRole('button', {
      name: /options menu/i,
    })[0];
    await user.click(releaseMenu);

    const showOptionsButton = screen.getByRole('button', {
      name: 'Show options for further development of RHEL',
    });
    await user.click(showOptionsButton);

    await screen.findByRole('option', {
      name: /Red Hat Enterprise Linux \(RHEL\) 8/,
    });
    await screen.findByRole('option', {
      name: /Red Hat Enterprise Linux \(RHEL\) 9/,
    });
    await screen.findByRole('option', {
      name: 'CentOS Stream 8',
    });
    await screen.findByRole('option', {
      name: 'CentOS Stream 9',
    });

    expect(showOptionsButton).not.toBeInTheDocument();

    await user.click(releaseMenu);
  });

  test('release lifecycle chart appears only when RHEL 8 is chosen', async () => {
    await setUp();

    const releaseMenu = screen.getAllByRole('button', {
      name: /options menu/i,
    })[0];
    await user.click(releaseMenu);

    await user.click(
      await screen.findByRole('option', {
        name: /Red Hat Enterprise Linux \(RHEL\) 9/,
      })
    );
    expect(
      screen.queryByTestId('release-lifecycle-chart')
    ).not.toBeInTheDocument();

    await user.click(releaseMenu);

    await user.click(
      await screen.findByRole('option', {
        name: /Red Hat Enterprise Linux \(RHEL\) 8/,
      })
    );
    expect(
      await screen.findByTestId('release-lifecycle-chart')
    ).toBeInTheDocument();
  });

  test('CentOS acknowledgement appears', async () => {
    await setUp();

    const releaseMenu = screen.getAllByRole('button', {
      name: /options menu/i,
    })[0];
    await user.click(releaseMenu);

    const showOptionsButton = screen.getByRole('button', {
      name: 'Show options for further development of RHEL',
    });
    await user.click(showOptionsButton);

    const centOSButton = screen.getByRole('option', {
      name: 'CentOS Stream 9',
    });
    await user.click(centOSButton);

    await screen.findByText(
      'CentOS Stream builds are intended for the development of future versions of RHEL and are not supported for production workloads or other use cases.'
    );
  });
});

describe('Step Upload to AWS', () => {
  const user = userEvent.setup();
  const setUp = async () => {
    ({ router } = await renderCustomRoutesWithReduxRouter(
      'imagewizard',
      {},
      routes
    ));

    // select aws as upload destination
    await waitFor(
      async () => await user.click(await screen.findByTestId('upload-aws'))
    );

    await clickNext();

    await screen.findByRole('heading', {
      name: 'Target environment - Amazon Web Services',
    });
  };

  // test('clicking Next loads Registration', async () => {
  //   await setUp();

  //   await switchToAWSManual();
  //   await user.type(
  //     await screen.findByTestId('aws-account-id'),
  //     '012345678901'
  //   );
  //   await clickNext();

  //   await screen.findByRole('textbox', {
  //     name: 'Select activation key',
  //   });

  //   screen.getByText('Automatically register and enable advanced capabilities');
  // });

  test('clicking Back loads Release', async () => {
    await setUp();

    await clickBack();

    screen.getByTestId('upload-aws');
  });

  test('clicking Cancel loads landing page', async () => {
    await setUp();

    await verifyCancelButton(router);
  });

  test('component renders error state correctly', async () => {
    server.use(
      rest.get(`${PROVISIONING_API}/sources`, (req, res, ctx) =>
        res(ctx.status(500))
      )
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

    await user.click(
      screen.getByRole('radio', { name: /manually enter an account id\./i })
    );

    expect(nextButton).toHaveClass('pf-m-disabled');

    const awsAccId = await screen.findByRole('textbox', {
      name: 'aws account id',
    });
    expect(awsAccId).toHaveValue('');
    expect(awsAccId).toBeEnabled();
    await user.type(awsAccId, '012345678901');

    expect(nextButton).not.toHaveClass('pf-m-disabled');

    await user.click(
      screen.getByRole('radio', {
        name: /use an account configured from sources\./i,
      })
    );

    await waitFor(() => expect(nextButton).toHaveClass('pf-m-disabled'));

    const sourceDropdown = await getSourceDropdown();
    await user.click(sourceDropdown);

    const source = await screen.findByRole('option', {
      name: /my_source/i,
    });
    await user.click(source);

    await waitFor(() => expect(nextButton).not.toHaveClass('pf-m-disabled'));
  });

  // test('compose request share_with_sources field is correct', async () => {
  //   await setUp();

  //   const sourceDropdown = await getSourceDropdown();
  //   await user.click(sourceDropdown);

  //   const source = await screen.findByRole('option', {
  //     name: /my_source/i,
  //   });
  //   await user.click(source);

  //   await clickNext();

  //   // registration
  //   await screen.findByRole('textbox', {
  //     name: 'Select activation key',
  //   });

  //   const registerLaterRadio = screen.getByLabelText('Register later');
  //   await user.click(registerLaterRadio);

  //   // click through to review step
  //   await clickNext();
  //   await clickNext();
  //   await clickNext();
  //   await clickNext();
  //   await clickNext();

  //   await user.click(screen.getByRole('button', { name: /Create/ }));

  //   // returns back to the landing page
  //   await waitFor(() =>
  //     expect(router.state.location.pathname).toBe('/insights/image-builder')
  //   );
  //   // set test timeout of 10 seconds
  // }, 10000);
});

describe('Step Upload to Google', () => {
  const user = userEvent.setup();
  const setUp = async () => {
    ({ router } = await renderCustomRoutesWithReduxRouter(
      'imagewizard',
      {},
      routes
    ));

    // select gcp as upload destination
    await waitFor(
      async () => await user.click(await screen.findByTestId('upload-google'))
    );

    await clickNext();

    await screen.findByRole('heading', {
      name: 'Target environment - Google Cloud Platform',
    });
  };

  // test('clicking Next loads Registration', async () => {
  //   await setUp();

  //   const shareRadioButton = await screen.findByRole('radio', {
  //     name: /share image with a google account/i,
  //   });
  //   await user.click(shareRadioButton);

  //   const googleEmailInput = await screen.findByTestId('input-google-email');

  //   await user.type(googleEmailInput, 'test@test.com');
  //   await clickNext();

  //   await screen.findByRole('textbox', {
  //     name: 'Select activation key',
  //   });

  // screen.getByText('Automatically register and enable advanced capabilities');
  // });

  test('clicking Back loads Release', async () => {
    await setUp();

    await clickBack();

    screen.getByTestId('upload-google');
  });

  test('clicking Cancel loads landing page', async () => {
    await setUp();

    await verifyCancelButton(router);
  });

  test('the google account id field is shown and required', async () => {
    await setUp();

    const principalInput = await screen.findByTestId('principal');
    expect(principalInput).toHaveValue('');
    expect(principalInput).toBeEnabled();
  });

  test('the google email field must be a valid email', async () => {
    await setUp();

    await user.type(await screen.findByTestId('principal'), 'a');
    expect(await getNextButton()).toHaveClass('pf-m-disabled');
    expect(await getNextButton()).toBeDisabled();
    await user.type(await screen.findByTestId('principal'), 'test@test.com');
    expect(await getNextButton()).not.toHaveClass('pf-m-disabled');
    expect(await getNextButton()).toBeEnabled();
  });
});

// describe('Step Registration', () => {
//   const user = userEvent.setup();
//   const setUp = async () => {
//     ({ router } = await renderCustomRoutesWithReduxRouter(
//       'imagewizard',
//       {},
//       routes
//     ));

//     // select aws as upload destination
//     await waitFor(
//       async () => await user.click(await screen.findByTestId('upload-aws'))
//     );

//     await clickNext();
//     await user.click(
//       screen.getByRole('radio', { name: /manually enter an account id\./i })
//     );
//     await user.type(screen.getByTestId('aws-account-id'), '012345678901');
//     await clickNext();

//     await screen.findByRole('textbox', {
//       name: 'Select activation key',
//     });
//   };

//   test('clicking Next loads file system configuration', async () => {
//     await setUp();

//     const registerLaterRadio = screen.getByTestId('registration-radio-later');
//     await user.click(registerLaterRadio);

//     await clickNext();

//     await screen.findByRole('heading', {
//       name: 'File system configuration',
//     });
//   });

//   test('clicking Back loads Upload to AWS', async () => {
//     await setUp();

//     await clickBack();

//     await user.click(
//       screen.getByRole('radio', { name: /manually enter an account id\./i })
//     );
//     screen.getByText('AWS account ID');
//   });

//   test('clicking Cancel loads landing page', async () => {
//     await setUp();

//     await verifyCancelButton(router);
//   });

//   test('activation key dropdown empty state', async () => {
//     server.use(
//       rest.get(`${RHSM_API}/activation_keys`, (req, res, ctx) =>
//         res(ctx.status(200), ctx.json({ body: [] }))
//       )
//     );
//     await setUp();
//     const activationKeyDropdown = await screen.findByRole('textbox', {
//       name: 'Select activation key',
//     });
//     await user.click(activationKeyDropdown);
//     await screen.findByText('No activation keys found');
//   });

//   test('should allow registering with rhc', async () => {
//     await setUp();

//     const activationKeyDropdown = await screen.findByRole('textbox', {
//       name: 'Select activation key',
//     });
//     await user.click(activationKeyDropdown);
//     const activationKey = await screen.findByRole('option', {
//       name: 'name0',
//     });
//     await user.click(activationKey);
//     screen.getByDisplayValue('name0');

//     await clickNext();
//     await clickNext();
//     await clickNext();
//     await clickNext();
//     await clickNext();
//     const review = screen.getByTestId('review-registration');
//     expect(review).toHaveTextContent(
//       'Register with Red Hat Subscription Manager (RHSM)'
//     );
//     expect(review).toHaveTextContent('Connect to Red Hat Insights');
//     expect(review).toHaveTextContent(
//       'Use remote host configuration (rhc) utility'
//     );
//     screen.getAllByText('012345678901');
//   });

//   test('should allow registering without rhc', async () => {
//     await setUp();

//     await user.click(screen.getByTestId('registration-additional-options'));
//     await user.click(screen.getByTestId('registration-checkbox-rhc'));

//     // going back and forward when rhc isn't selected should keep additional options shown
//     await clickBack();
//     await screen.findByTestId('aws-account-id');
//     await clickNext();
//     screen.getByTestId('registration-checkbox-insights');
//     screen.getByTestId('registration-checkbox-rhc');

//     const activationKeyDropdown = await screen.findByRole('textbox', {
//       name: 'Select activation key',
//     });
//     await user.click(activationKeyDropdown);
//     const activationKey = await screen.findByRole('option', {
//       name: 'name0',
//     });
//     await user.click(activationKey);
//     screen.getByDisplayValue('name0');

//     await clickNext();
//     await clickNext();
//     await clickNext();
//     await clickNext();
//     await clickNext();
//     const review = screen.getByTestId('review-registration');
//     expect(review).toHaveTextContent(
//       'Register with Red Hat Subscription Manager (RHSM)'
//     );
//     expect(review).toHaveTextContent('Connect to Red Hat Insights');
//     screen.getAllByText('012345678901');
//     expect(review).not.toHaveTextContent(
//       'Use remote host configuration (rhc) utility'
//     );
//   });

//   test('should allow registering without insights or rhc', async () => {
//     await setUp();

//     await user.click(screen.getByTestId('registration-additional-options'));
//     await user.click(screen.getByTestId('registration-checkbox-insights'));

//     // going back and forward when neither rhc or insights is selected should keep additional options shown
//     await clickBack();
//     await screen.findByTestId('aws-account-id');
//     await clickNext();
//     screen.getByTestId('registration-checkbox-insights');
//     screen.getByTestId('registration-checkbox-rhc');

//     const activationKeyDropdown = await screen.findByRole('textbox', {
//       name: 'Select activation key',
//     });
//     await user.click(activationKeyDropdown);
//     const activationKey = await screen.findByRole('option', {
//       name: 'name0',
//     });
//     await user.click(activationKey);
//     screen.getByDisplayValue('name0');

//     await clickNext();
//     await clickNext();
//     await clickNext();
//     await clickNext();
//     await clickNext();
//     const review = screen.getByTestId('review-registration');
//     expect(review).toHaveTextContent(
//       'Register with Red Hat Subscription Manager (RHSM)'
//     );
//     screen.getAllByText('012345678901');
//     expect(review).not.toHaveTextContent('Connect to Red Hat Insights');
//     expect(review).not.toHaveTextContent(
//       'Use remote host configuration (rhc) utility'
//     );
//   });

//   test('should hide input fields when clicking Register the system later', async () => {
//     await setUp();
//     const removeKeyInformation = waitForElementToBeRemoved(() => [
//       screen.getByTestId('subscription-activation-key'),
//     ]);

//     // click the later radio button which should remove any input fields
//     await user.click(screen.getByTestId('registration-radio-later'));

//     await removeKeyInformation;

//     await clickNext();
//     await clickNext();
//     await clickNext();
//     await clickNext();
//     await clickNext();
//     screen.getByText('Register the system later');
//   });

//   test('registering with rhc implies registering with insights', async () => {
//     await setUp();
//     await user.click(screen.getByTestId('registration-additional-options'));

//     await user.click(screen.getByTestId('registration-checkbox-insights'));
//     expect(screen.getByTestId('registration-checkbox-rhc')).not.toBeChecked();

//     await user.click(screen.getByTestId('registration-checkbox-rhc'));
//     expect(screen.getByTestId('registration-checkbox-insights')).toBeChecked();
//   });
// });

// describe('Step File system configuration', () => {
//   const user = userEvent.setup();
//   const setUp = async () => {
//     ({ router } = await renderCustomRoutesWithReduxRouter(
//       'imagewizard',
//       {},
//       routes
//     ));

//     // select aws as upload destination
//     await waitFor(
//       async () => await user.click(await screen.findByTestId('upload-aws'))
//     );
//     await clickNext();

//     // aws step
//     await switchToAWSManual();
//     await user.type(
//       await screen.findByTestId('aws-account-id'),
//       '012345678901'
//     );
//     await clickNext();
//     // skip registration
//     await screen.findByRole('textbox', {
//       name: 'Select activation key',
//     });

//     const registerLaterRadio = screen.getByTestId('registration-radio-later');
//     await user.click(registerLaterRadio);
//     await clickNext();
//   };

//   test('Error validation occurs upon clicking next button', async () => {
//     await setUp();

//     const manuallyConfigurePartitions = screen.getByText(
//       /manually configure partitions/i
//     );
//     await user.click(manuallyConfigurePartitions);

//     const addPartition = await screen.findByTestId('file-system-add-partition');

//     // Create duplicate partitions
//     await user.click(addPartition);
//     await user.click(addPartition);

//     expect(await getNextButton()).toBeEnabled();

//     // Clicking next causes errors to appear
//     await clickNext();

//     const mountPointWarning = screen.getByRole('heading', {
//       name: /danger alert: duplicate mount points: all mount points must be unique\. remove the duplicate or choose a new mount point\./i,
//       hidden: true,
//     });

//     const mountPointAlerts = screen.getAllByRole('heading', {
//       name: /danger alert: duplicate mount point\./i,
//     });

//     const tbody = screen.getByTestId('file-system-configuration-tbody');
//     const rows = within(tbody).getAllByRole('row');
//     expect(rows).toHaveLength(3);

//     // Change mountpoint of final row to /var, resolving errors
//     const mountPointOptions = within(rows[2]).getAllByRole('button', {
//       name: 'Options menu',
//     })[0];
//     await user.click(mountPointOptions);
//     const varButton = await within(rows[2]).findByRole('option', {
//       name: '/var',
//     });
//     await user.click(varButton);

//     await waitFor(() => expect(mountPointWarning).not.toBeInTheDocument());
//     await waitFor(() => expect(mountPointAlerts[0]).not.toBeInTheDocument());
//     await waitFor(() => expect(mountPointAlerts[1]).not.toBeInTheDocument());
//     expect(await getNextButton()).toBeEnabled();
//   });
// });

// describe('Step Details', () => {
//   const user = userEvent.setup();
//   const setUp = async () => {
//     ({ router } = await renderCustomRoutesWithReduxRouter(
//       'imagewizard',
//       {},
//       routes
//     ));

//     // select aws as upload destination
//     await waitFor(
//       async () => await user.click(await screen.findByTestId('upload-aws'))
//     );
//     await clickNext();

//     // aws step
//     await switchToAWSManual();
//     await user.type(
//       await screen.findByTestId('aws-account-id'),
//       '012345678901'
//     );
//     await clickNext();
//     // skip registration
//     await screen.findByRole('textbox', {
//       name: 'Select activation key',
//     });

//     const registerLaterRadio = screen.getByTestId('registration-radio-later');
//     await user.click(registerLaterRadio);
//     await clickNext();

//     // skip fsc
//     await clickNext();
//     // skip packages
//     await clickNext();
//     // skip repositories
//     await clickNext();
//   };

//   test('image name invalid for more than 63 chars', async () => {
//     await setUp();

//     // Enter image name
//     const nameInput = screen.getByRole('textbox', {
//       name: 'Image Name',
//     });
//     // 64 character name
//     const invalidName = 'a'.repeat(64);
//     await user.type(nameInput, invalidName);
//     expect(await getNextButton()).toHaveClass('pf-m-disabled');
//     expect(await getNextButton()).toBeDisabled();
//     await user.clear(nameInput);

//     await user.type(nameInput, 'valid-name');
//     expect(await getNextButton()).not.toHaveClass('pf-m-disabled');
//     expect(await getNextButton()).toBeEnabled();

//     // Enter description image
//     const descriptionInput = screen.getByRole('textbox', {
//       name: /description/i,
//     });

//     const invalidDescription = 'a'.repeat(251);
//     await user.type(descriptionInput, invalidDescription);

//     expect(await getNextButton()).toHaveClass('pf-m-disabled');
//     expect(await getNextButton()).toBeDisabled();
//     await user.clear(descriptionInput);
//     await user.type(descriptionInput, 'valid-description');

//     expect(await getNextButton()).not.toHaveClass('pf-m-disabled');
//     expect(await getNextButton()).toBeEnabled();
//   });
// });

// describe('Step Review', () => {
//   const user = userEvent.setup();
//   const setUp = async () => {
//     ({ router } = await renderCustomRoutesWithReduxRouter(
//       'imagewizard',
//       {},
//       routes
//     ));

//     // select aws as upload destination
//     await waitFor(
//       async () => await user.click(await screen.findByTestId('upload-aws'))
//     );
//     await clickNext();

//     // aws step
//     await switchToAWSManual();
//     await user.type(
//       await screen.findByTestId('aws-account-id'),
//       '012345678901'
//     );
//     await clickNext();

//     await screen.findByRole('textbox', {
//       name: 'Select activation key',
//     });

//     // skip registration
//     const registerLaterRadio = screen.getByTestId('registration-radio-later');
//     await user.click(registerLaterRadio);

//     await clickNext();
//     // skip fsc
//     await clickNext();
//     // skip packages
//     await clickNext();
//     // skip repositories
//     await clickNext();
//     // skip name
//     await clickNext();
//   };

//   const setUpCentOS = async () => {
//     ({ router } = renderCustomRoutesWithReduxRouter('imagewizard', {}, routes));

//     const releaseMenu = screen.getAllByRole('button', {
//       name: /options menu/i,
//     })[0];
//     await user.click(releaseMenu);

//     const showOptionsButton = screen.getByRole('button', {
//       name: 'Show options for further development of RHEL',
//     });
//     await user.click(showOptionsButton);

//     const centos = screen.getByRole('option', {
//       name: 'CentOS Stream 8',
//     });
//     await user.click(centos);

//     // select aws as upload destination
//     await waitFor(
//       async () => await user.click(await screen.findByTestId('upload-aws'))
//     );
//     await clickNext();

//     // aws step
//     await switchToAWSManual();
//     await user.type(
//       await screen.findByTestId('aws-account-id'),
//       '012345678901'
//     );
//     await clickNext();
//     // skip fsc
//     await clickNext();
//     // skip packages
//     await clickNext();
//     // skip repositories
//     await clickNext();
//     // skip name
//     await clickNext();
//   };

//   test('has 3 buttons', async () => {
//     await setUp();

//     screen.getByRole('button', { name: /Create/ });
//     screen.getByRole('button', { name: /Back/ });
//     screen.getByRole('button', { name: /Cancel/ });
//   });

//   test('clicking Back loads Image name', async () => {
//     await setUp();

//     await clickBack();

//     screen.getByRole('heading', {
//       name: 'Details',
//     });
//   });

//   test('clicking Cancel loads landing page', async () => {
//     await setUp();

//     await verifyCancelButton(router);
//   });

//   test('has Registration expandable section for rhel', async () => {
//     await setUp();

//     const targetExpandable = screen.getByTestId(
//       'target-environments-expandable'
//     );
//     const registrationExpandable = screen.getByTestId(
//       'registration-expandable'
//     );
//     const contentExpandable = screen.getByTestId('content-expandable');
//     const fscExpandable = screen.getByTestId(
//       'file-system-configuration-expandable'
//     );

//     await user.click(targetExpandable);
//     screen.getByText('AWS');
//     await user.click(registrationExpandable);
//     screen.getByText('Register the system later');
//     await user.click(contentExpandable);
//     screen.getByText('Additional Red Hatand 3rd party packages');
//     await user.click(fscExpandable);
//     screen.getByText('Configuration type');
//   });

//   test('has no Registration expandable for centos', async () => {
//     await setUpCentOS();

//     const targetExpandable = await screen.findByTestId(
//       'target-environments-expandable'
//     );
//     const contentExpandable = await screen.findByTestId('content-expandable');
//     const fscExpandable = await screen.findByTestId(
//       'file-system-configuration-expandable'
//     );
//     expect(
//       screen.queryByTestId('registration-expandable')
//     ).not.toBeInTheDocument();

//     await user.click(targetExpandable);
//     screen.getByText('AWS');
//     await user.click(contentExpandable);
//     screen.getByText('Additional Red Hatand 3rd party packages');
//     await user.click(fscExpandable);
//     screen.getByText('Configuration type');
//   });
// });

// describe('Click through all steps', () => {
//   const user = userEvent.setup();
//   const setUp = async () => {
//     ({ router } = await renderCustomRoutesWithReduxRouter(
//       'imagewizard',
//       {},
//       routes
//     ));
//   };

//   test('with valid values', async () => {
//     await setUp();

//     // select image output
//     await waitFor(
//       async () => await user.click(await screen.findByTestId('upload-aws'))
//     );
//     const releaseMenu = screen.getAllByRole('button', {
//       name: /options menu/i,
//     })[0];
//     await user.click(releaseMenu);
//     const releaseOption = screen.getByRole('option', {
//       name: /Red Hat Enterprise Linux \(RHEL\) 8/,
//     });
//     await user.click(releaseOption);

//     await waitFor(() => screen.findByTestId('upload-aws'));
//     await user.click(screen.getByTestId('upload-azure'));
//     await user.click(screen.getByTestId('upload-google'));
//     await user.click(screen.getByTestId('checkbox-vmware'));
//     await user.click(screen.getByTestId('checkbox-guest-image'));
//     await user.click(screen.getByTestId('checkbox-image-installer'));

//     await clickNext();
//     await user.click(
//       screen.getByRole('radio', { name: /manually enter an account id\./i })
//     );
//     await user.type(screen.getByTestId('aws-account-id'), '012345678901');
//     await clickNext();

//     await user.click(screen.getByTestId('account-sharing'));

//     await user.type(screen.getByTestId('input-google-email'), 'test@test.com');

//     await user.click(await screen.findByTestId('account-sharing'));
//     await clickNext();

//     await user.click(screen.getByTestId('azure-radio-manual'));
//     // Randomly generated GUID
//     await user.type(
//       screen.getByTestId('azure-tenant-id-manual'),
//       'b8f86d22-4371-46ce-95e7-65c415f3b1e2'
//     );
//     await user.type(
//       screen.getByTestId('azure-subscription-id-manual'),
//       '60631143-a7dc-4d15-988b-ba83f3c99711'
//     );
//     await user.type(
//       screen.getByTestId('azure-resource-group-manual'),
//       'testResourceGroup'
//     );
//     await clickNext();

//     // registration
//     const activationKeyDropdown = await screen.findByRole('textbox', {
//       name: 'Select activation key',
//     });
//     await user.click(activationKeyDropdown);
//     const activationKey = await screen.findByRole('option', {
//       name: 'name0',
//     });
//     await user.click(activationKey);
//     screen.getByDisplayValue('name0');

//     await clickNext();

//     // fsc
//     const fscToggle = await screen.findByTestId(
//       'file-system-config-radio-manual'
//     );
//     await user.click(fscToggle);
//     const addPartition = await screen.findByTestId('file-system-add-partition');
//     await user.click(addPartition);
//     await user.click(addPartition);

//     const tbody = screen.getByTestId('file-system-configuration-tbody');
//     const rows = within(tbody).getAllByRole('row');
//     await waitFor(() => expect(rows).toHaveLength(3));
//     await clickNext();

//     // set mountpoint of final row to /var/tmp
//     const mountPointMenu = within(rows[2]).getAllByRole('button', {
//       name: 'Options menu',
//     })[0];
//     await user.click(mountPointMenu);

//     const varButton = await within(rows[2]).findByRole('option', {
//       name: '/var',
//     });
//     await user.click(varButton);
//     expect(
//       screen.queryByRole('heading', {
//         name: 'Danger alert: Duplicate mount point.',
//       })
//     ).not.toBeInTheDocument();
//     await user.type(
//       within(rows[2]).getByRole('textbox', {
//         name: 'Mount point suffix text input',
//       }),
//       '/tmp'
//     );

//     // set size of the final row to 100 MiB
//     await user.type(
//       within(rows[2]).getByRole('textbox', { name: 'Size text input' }),
//       '{backspace}100'
//     );
//     const unitMenu = within(rows[2]).getAllByRole('button', {
//       name: 'Options menu',
//     })[1];
//     await user.click(unitMenu);

//     const mibButton = await within(rows[2]).findByRole('option', {
//       name: 'MiB',
//     });
//     await user.click(mibButton);
//     await clickNext();

//     screen.getByText(
//       /Images built with Image Builder include all required packages/i
//     );

//     const searchbox = screen.getAllByRole('textbox')[0]; // searching by id doesn't update the input ref

//     await waitFor(() => expect(searchbox).toBeEnabled());

//     await searchForAvailablePackages(searchbox, 'test');
//     await user.click(
//       await screen.findByRole('option', {
//         name: /test summary for test package/,
//       })
//     );
//     await user.click(screen.getByRole('button', { name: /Add selected/ }));
//     await clickNext();

//     // Custom repositories
//     await user.click(
//       await screen.findByRole('checkbox', { name: /select row 0/i })
//     );
//     await user.click(
//       await screen.findByRole('checkbox', { name: /select row 1/i })
//     );

//     await clickNext();
//     // Custom packages
//     await clickNext();

//     // Enter image name
//     const nameInput = screen.getByRole('textbox', {
//       name: 'Image Name',
//     });

//     await user.type(nameInput, 'my-image-name');

//     // Enter description for image
//     const descriptionInput = screen.getByRole('textbox', {
//       name: /Description/,
//     });
//     await user.type(
//       descriptionInput,
//       'this is a perfect description for image'
//     );
//     await clickNext();

//     // review
//     const targetEnvironmentsExpandable = await screen.findByTestId(
//       'target-environments-expandable'
//     );
//     await user.click(targetEnvironmentsExpandable);
//     await screen.findAllByText('AWS');
//     await screen.findAllByText('GCP');
//     await screen.findByText('VMware vSphere (.ova)');
//     await screen.findByText('Virtualization - Guest image (.qcow2)');
//     await screen.findByText('Bare metal - Installer (.iso)');

//     const registrationExpandable = await screen.findByTestId(
//       'registration-expandable'
//     );
//     await user.click(registrationExpandable);
//     const review = screen.getByTestId('review-registration');
//     expect(review).toHaveTextContent(
//       'Use remote host configuration (rhc) utility'
//     );

//     const imageDetailsExpandable = await screen.findByTestId(
//       'image-details-expandable'
//     );
//     await user.click(imageDetailsExpandable);
//     await screen.findByText('my-image-name');
//     await screen.findByText('this is a perfect description for image');

//     await screen.findByText('name0');
//     await screen.findByText('Self-Support');
//     await screen.findByText('Production');

//     await user.click(screen.getByTestId('repositories-popover-button'));
//     const repotbody = await screen.findByTestId(
//       'additional-repositories-table'
//     );
//     expect(within(repotbody).getAllByRole('row')).toHaveLength(3);

//     await user.click(screen.getByTestId('file-system-configuration-popover'));
//     const revtbody = await screen.findByTestId(
//       'file-system-configuration-tbody-review'
//     );
//     expect(within(revtbody).getAllByRole('row')).toHaveLength(3);

//     // mock the backend API
//     const payload_repos = [
//       {
//         baseurl: 'http://yum.theforeman.org/releases/3.4/el8/x86_64/',
//         check_gpg: true,
//         check_repo_gpg: false,
//         gpgkey:
//           '-----BEGIN PGP PUBLIC KEY BLOCK-----\n\nmQINBGN9300BEAC1FLODu0cL6saMMHa7yJY1JZUc+jQUI/HdECQrrsTaPXlcc7nM\nykYMMv6amPqbnhH/R5BW2Ano+OMse+PXtUr0NXU4OcvxbnnXkrVBVUf8mXI9DzLZ\njw8KoD+4/s0BuzO78zAJF5uhuyHMAK0ll9v0r92kK45Fas9iZTfRFcqFAzvgjScf\n5jeBnbRs5U3UTz9mtDy802mk357o1A8BD0qlu3kANDpjLbORGWdAj21A6sMJDYXy\nHS9FBNV54daNcr+weky2L9gaF2yFjeu2rSEHCSfkbWfpSiVUx/bDTj7XS6XDOuJT\nJqvGS8jHqjHAIFBirhCA4cY/jLKxWyMr5N6IbXpPAYgt8/YYz2aOYVvdyB8tZ1u1\nkVsMYSGcvTBexZCn1cDkbO6I+waIlsc0uxGqUGBKF83AVYCQqOkBjF1uNnu9qefE\nkEc9obr4JZsAgnisboU25ss5ZJddKlmFMKSi66g4S5ChLEPFq7MB06PhLFioaD3L\nEXza7XitoW5VBwr0BSVKAHMC0T2xbm70zY06a6gQRlvr9a10lPmv4Tptc7xgQReg\nu1TlFPbrkGJ0d8O6vHQRAd3zdsNaVr4gX0Tg7UYiqT9ZUkP7hOc8PYXQ28hHrHTB\nA63MTq0aiPlJ/ivTuX8M6+Bi25dIV6N6IOUi/NQKIYxgovJCDSdCAAM0fQARAQAB\ntCFMdWNhcyBHYXJmaWVsZCA8bHVjYXNAcmVkaGF0LmNvbT6JAlcEEwEIAEEWIQTO\nQZeiHnXqdjmfUURc6PeuecS2PAUCY33fTQIbAwUJA8JnAAULCQgHAgIiAgYVCgkI\nCwIEFgIDAQIeBwIXgAAKCRBc6PeuecS2PCk3D/9jW7xrBB/2MQFKd5l+mNMFyKwc\nL9M/M5RFI9GaQRo55CwnPb0nnxOJR1V5GzZ/YGii53H2ose65CfBOE2L/F/RvKF0\nH9S9MInixlahzzKtV3TpDoZGk5oZIHEMuPmPS4XaHggolrzExY0ib0mQuBBE/uEV\n/HlyHEunBKPhTkAe+6Q+2dl22SUuVfWr4Uzlp65+DkdN3M37WI1a3Suhnef3rOSM\nV6puUzWRR7qcYs5C2In87AcYPn92P5ur1y/C32r8Ftg3fRWnEzI9QfRG52ojNOLK\nyGQ8ZC9PGe0q7VFcF7ridT/uzRU+NVKldbJg+rvBnszb1MjNuR7rUQHyvGmbsUVQ\nRCsgdovkee3lP4gfZHzk2SSLVSo0+NJRNaM90EmPk14Pgi/yfRSDGBVvLBbEanYI\nv1ZtdIPRyKi+/IaMOu/l7nayM/8RzghdU+0f1FAif5qf9nXuI13P8fqcqfu67gNd\nkh0UUF1XyR5UHHEZQQDqCuKEkZJ/+27jYlsG1ZiLb1odlIWoR44RP6k5OJl0raZb\nyLXbAfpITsXiJJBpCam9P9+XR5VSfgkqp5hIa7J8piN3DoMpoExg4PPQr6PbLAJy\nOUCOnuB7yYVbj0wYuMXTuyrcBHh/UymQnS8AMpQoEkCLWS/A/Hze/pD23LgiBoLY\nXIn5A2EOAf7t2IMSlA==\n=OanT\n-----END PGP PUBLIC KEY BLOCK-----',
//         rhsm: false,
//       },
//       {
//         baseurl:
//           'http://mirror.stream.centos.org/SIGs/8/kmods/x86_64/packages-main/',
//         check_gpg: false,
//         rhsm: false,
//       },
//     ];

//     const custom_repos = [
//       {
//         baseurl: ['http://yum.theforeman.org/releases/3.4/el8/x86_64/'],
//         check_gpg: true,
//         check_repo_gpg: false,
//         gpgkey: [
//           '-----BEGIN PGP PUBLIC KEY BLOCK-----\n\nmQINBGN9300BEAC1FLODu0cL6saMMHa7yJY1JZUc+jQUI/HdECQrrsTaPXlcc7nM\nykYMMv6amPqbnhH/R5BW2Ano+OMse+PXtUr0NXU4OcvxbnnXkrVBVUf8mXI9DzLZ\njw8KoD+4/s0BuzO78zAJF5uhuyHMAK0ll9v0r92kK45Fas9iZTfRFcqFAzvgjScf\n5jeBnbRs5U3UTz9mtDy802mk357o1A8BD0qlu3kANDpjLbORGWdAj21A6sMJDYXy\nHS9FBNV54daNcr+weky2L9gaF2yFjeu2rSEHCSfkbWfpSiVUx/bDTj7XS6XDOuJT\nJqvGS8jHqjHAIFBirhCA4cY/jLKxWyMr5N6IbXpPAYgt8/YYz2aOYVvdyB8tZ1u1\nkVsMYSGcvTBexZCn1cDkbO6I+waIlsc0uxGqUGBKF83AVYCQqOkBjF1uNnu9qefE\nkEc9obr4JZsAgnisboU25ss5ZJddKlmFMKSi66g4S5ChLEPFq7MB06PhLFioaD3L\nEXza7XitoW5VBwr0BSVKAHMC0T2xbm70zY06a6gQRlvr9a10lPmv4Tptc7xgQReg\nu1TlFPbrkGJ0d8O6vHQRAd3zdsNaVr4gX0Tg7UYiqT9ZUkP7hOc8PYXQ28hHrHTB\nA63MTq0aiPlJ/ivTuX8M6+Bi25dIV6N6IOUi/NQKIYxgovJCDSdCAAM0fQARAQAB\ntCFMdWNhcyBHYXJmaWVsZCA8bHVjYXNAcmVkaGF0LmNvbT6JAlcEEwEIAEEWIQTO\nQZeiHnXqdjmfUURc6PeuecS2PAUCY33fTQIbAwUJA8JnAAULCQgHAgIiAgYVCgkI\nCwIEFgIDAQIeBwIXgAAKCRBc6PeuecS2PCk3D/9jW7xrBB/2MQFKd5l+mNMFyKwc\nL9M/M5RFI9GaQRo55CwnPb0nnxOJR1V5GzZ/YGii53H2ose65CfBOE2L/F/RvKF0\nH9S9MInixlahzzKtV3TpDoZGk5oZIHEMuPmPS4XaHggolrzExY0ib0mQuBBE/uEV\n/HlyHEunBKPhTkAe+6Q+2dl22SUuVfWr4Uzlp65+DkdN3M37WI1a3Suhnef3rOSM\nV6puUzWRR7qcYs5C2In87AcYPn92P5ur1y/C32r8Ftg3fRWnEzI9QfRG52ojNOLK\nyGQ8ZC9PGe0q7VFcF7ridT/uzRU+NVKldbJg+rvBnszb1MjNuR7rUQHyvGmbsUVQ\nRCsgdovkee3lP4gfZHzk2SSLVSo0+NJRNaM90EmPk14Pgi/yfRSDGBVvLBbEanYI\nv1ZtdIPRyKi+/IaMOu/l7nayM/8RzghdU+0f1FAif5qf9nXuI13P8fqcqfu67gNd\nkh0UUF1XyR5UHHEZQQDqCuKEkZJ/+27jYlsG1ZiLb1odlIWoR44RP6k5OJl0raZb\nyLXbAfpITsXiJJBpCam9P9+XR5VSfgkqp5hIa7J8piN3DoMpoExg4PPQr6PbLAJy\nOUCOnuB7yYVbj0wYuMXTuyrcBHh/UymQnS8AMpQoEkCLWS/A/Hze/pD23LgiBoLY\nXIn5A2EOAf7t2IMSlA==\n=OanT\n-----END PGP PUBLIC KEY BLOCK-----',
//         ],
//         id: 'dbad4dfc-1547-45f8-b5af-1d7fec0476c6',
//         name: '13lk3',
//       },
//       {
//         baseurl: [
//           'http://mirror.stream.centos.org/SIGs/8/kmods/x86_64/packages-main/',
//         ],
//         check_gpg: false,
//         id: '9cf1d45d-aa06-46fe-87ea-121845cc6bbb',
//         name: '2lmdtj',
//       },
//     ];

//     const cust = {
//       filesystem: [
//         {
//           mountpoint: '/',
//           min_size: 10737418240,
//         },
//         {
//           mountpoint: '/home',
//           min_size: 1073741824,
//         },
//         {
//           mountpoint: '/var/tmp',
//           min_size: 104857600,
//         },
//       ],
//       custom_repositories: custom_repos,
//       payload_repositories: payload_repos,
//       packages: ['test'],
//       subscription: {
//         'activation-key': 'name0',
//         insights: true,
//         rhc: true,
//         organization: 5,
//         'server-url': 'subscription.rhsm.redhat.com',
//         'base-url': 'https://cdn.redhat.com/',
//       },
//     };

//     const expectedComposeReqs = {
//       aws: {
//         distribution: RHEL_8,
//         image_name: 'my-image-name',
//         image_description: 'this is a perfect description for image',
//         image_requests: [
//           {
//             architecture: 'x86_64',
//             image_type: 'aws',
//             upload_request: {
//               type: 'aws',
//               options: {
//                 share_with_accounts: ['012345678901'],
//               },
//             },
//           },
//         ],
//         client_id: 'ui',
//         customizations: cust,
//       },
//       gcp: {
//         distribution: RHEL_8,
//         image_name: 'my-image-name',
//         image_description: 'this is a perfect description for image',
//         image_requests: [
//           {
//             architecture: 'x86_64',
//             image_type: 'gcp',
//             upload_request: {
//               type: 'gcp',
//               options: {
//                 share_with_accounts: ['user:test@test.com'],
//               },
//             },
//           },
//         ],
//         client_id: 'ui',
//         customizations: cust,
//       },
//       azure: {
//         distribution: RHEL_8,
//         image_name: 'my-image-name',
//         image_description: 'this is a perfect description for image',
//         image_requests: [
//           {
//             architecture: 'x86_64',
//             image_type: 'azure',
//             upload_request: {
//               type: 'azure',
//               options: {
//                 tenant_id: 'b8f86d22-4371-46ce-95e7-65c415f3b1e2',
//                 subscription_id: '60631143-a7dc-4d15-988b-ba83f3c99711',
//                 resource_group: 'testResourceGroup',
//               },
//             },
//           },
//         ],
//         client_id: 'ui',
//         customizations: cust,
//       },
//       'vsphere-ova': {
//         distribution: RHEL_8,
//         image_name: 'my-image-name',
//         image_description: 'this is a perfect description for image',
//         image_requests: [
//           {
//             architecture: 'x86_64',
//             image_type: 'vsphere-ova',
//             upload_request: {
//               type: 'aws.s3',
//               options: {},
//             },
//           },
//         ],
//         client_id: 'ui',
//         customizations: cust,
//       },
//       'guest-image': {
//         distribution: RHEL_8,
//         image_name: 'my-image-name',
//         image_description: 'this is a perfect description for image',
//         image_requests: [
//           {
//             architecture: 'x86_64',
//             image_type: 'guest-image',
//             upload_request: {
//               type: 'aws.s3',
//               options: {},
//             },
//           },
//         ],
//         client_id: 'ui',
//         customizations: cust,
//       },
//       'image-installer': {
//         distribution: RHEL_8,
//         image_name: 'my-image-name',
//         image_description: 'this is a perfect description for image',
//         image_requests: [
//           {
//             architecture: 'x86_64',
//             image_type: 'image-installer',
//             upload_request: {
//               type: 'aws.s3',
//               options: {},
//             },
//           },
//         ],
//         client_id: 'ui',
//         customizations: cust,
//       },
//     };

//     let timesCalled = 0;
//     const receivedComposeReqs = {};

//     server.use(
//       rest.post(`${IMAGE_BUILDER_API}/compose`, (req, res, ctx) => {
//         timesCalled += 1;
//         receivedComposeReqs[req.body.image_requests[0].image_type] = req.body;
//         return res(
//           ctx.status(201),
//           ctx.json({
//             id: 'edbae1c2-62bc-42c1-ae0c-3110ab718f5b',
//           })
//         );
//       })
//     );
//     await user.click(screen.getByRole('button', { name: /Create/ }));

//     expect(receivedComposeReqs).toEqual(expectedComposeReqs);
//     expect(timesCalled).toEqual(6);

//     // returns back to the landing page
//     await waitFor(() =>
//       expect(router.state.location.pathname).toBe('/insights/image-builder')
//     );

//     // set test timeout of 20 seconds
//   }, 20000);
// });

// describe('Keyboard accessibility', () => {
//   const user = userEvent.setup();
//   const setUp = async () => {
//     ({ router } = await renderCustomRoutesWithReduxRouter(
//       'imagewizard',
//       {},
//       routes
//     ));
//     await clickNext();
//   };

//   const selectAllEnvironments = async () => {
//     await waitFor(
//       async () => await user.click(await screen.findByTestId('upload-aws'))
//     );
//     await user.click(screen.getByTestId('upload-google'));
//     await user.click(screen.getByTestId('upload-azure'));
//     await user.click(
//       screen.getByRole('checkbox', {
//         name: /virtualization guest image checkbox/i,
//       })
//     );
//   };

//   test('autofocus on each step first input element', async () => {
//     await setUp();

//     // Image output
//     await selectAllEnvironments();
//     await clickNext();

//     // Target environment aws
//     expect(screen.getByTestId('aws-radio-source')).toHaveFocus();
//     const awsSourceDropdown = await getSourceDropdown();
//     await user.click(awsSourceDropdown);
//     const awsSource = await screen.findByRole('option', {
//       name: /my_source/i,
//     });
//     await user.click(awsSource);

//     await clickNext();

//     // Target environment google
//     await user.click(await screen.findByTestId('account-sharing'));
//     expect(await screen.findByTestId('account-sharing')).toHaveFocus();
//     await user.type(
//       await screen.findByTestId('input-google-email'),
//       'test@test.com'
//     );
//     await clickNext();

//     // Target environment azure
//     expect(screen.getByTestId('azure-radio-source')).toHaveFocus();
//     const azureSourceDropdown = await getSourceDropdown();
//     await user.click(azureSourceDropdown);
//     const azureSource = await screen.findByRole('option', {
//       name: /azureSource1/i,
//     });
//     await user.click(azureSource);

//     const resourceGroupDropdown = await screen.findByRole('textbox', {
//       name: /select resource group/i,
//     });
//     await user.click(resourceGroupDropdown);
//     await user.click(screen.getByLabelText('Resource group myResourceGroup1'));
//     await clickNext();

//     // Registration
//     await screen.findByText(
//       'Automatically register and enable advanced capabilities'
//     );
//     const registerRadio = screen.getByTestId('registration-radio-now');
//     expect(registerRadio).toHaveFocus();
//     await screen.findByRole('textbox', {
//       name: 'Select activation key',
//     });
//     // skip registration
//     const registerLaterRadio = screen.getByTestId('registration-radio-later');
//     await user.click(registerLaterRadio);

//     await clickNext();

//     // File system configuration
//     await clickNext();

//     // Packages
//     const view = screen.getByTestId('search-available-pkgs-input');

//     const availablePackagesInput = within(view).getByRole('textbox', {
//       name: /search input/i,
//     });
//     await waitFor(() => expect(availablePackagesInput).toBeEnabled());
//     expect(availablePackagesInput).toHaveFocus();
//     await clickNext();

//     // TODO: what should have focus on Custom Repos step?
//     await clickNext();

//     // Name
//     const nameInput = screen.getByRole('textbox', { name: /image name/i });
//     expect(nameInput).toHaveFocus();
//     await clickNext();
//   });

//   test('pressing Esc closes the wizard', async () => {
//     await setUp();
//     // wizard needs to be interacted with for the esc key to work
//     await waitFor(
//       async () => await user.click(await screen.findByTestId('upload-aws'))
//     );
//     await user.keyboard('{escape}');
//     expect(router.state.location.pathname).toBe('/insights/image-builder');
//   });

//   test('pressing Enter does not advance the wizard', async () => {
//     await setUp();
//     await waitFor(
//       async () => await user.click(await screen.findByTestId('upload-aws'))
//     );
//     await user.keyboard('{enter}');
//     screen.getByRole('heading', {
//       name: /image output/i,
//     });
//   });

//   test('target environment tiles are keyboard selectable', async () => {
//     const testTile = async (tile) => {
//       tile.focus();
//       await user.keyboard('{space}');
//       expect(tile).toHaveClass('pf-m-selected');
//       await user.keyboard('{space}');
//       expect(tile).not.toHaveClass('pf-m-selected');
//     };

//     await setUp();
//     await clickNext();

//     await waitFor(() => screen.findByTestId('upload-aws'));
//     testTile(screen.getByTestId('upload-aws'));
//     testTile(screen.getByTestId('upload-google'));
//     testTile(screen.getByTestId('upload-azure'));
//   });
// });
