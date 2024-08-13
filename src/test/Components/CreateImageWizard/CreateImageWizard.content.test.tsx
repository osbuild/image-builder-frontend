import React from 'react';

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { clickBack, clickNext } from './wizardTestUtils';

import CreateImageWizard from '../../../Components/CreateImageWizard/CreateImageWizard';
import { renderCustomRoutesWithReduxRouter } from '../../testUtils';

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

describe('Step Custom repositories', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const user = userEvent.setup();
  const setUp = async () => {
    await renderCustomRoutesWithReduxRouter('imagewizard', {}, routes);

    // select aws as upload destination
    const uploadAws = await screen.findByTestId('upload-aws');
    user.click(uploadAws);
    await clickNext();

    // aws step
    const manualOption = await screen.findByRole('radio', {
      name: /manually enter an account id\./i,
    });
    await waitFor(() => user.click(manualOption));
    await waitFor(async () =>
      user.type(
        await screen.findByRole('textbox', {
          name: 'aws account id',
        }),
        '012345678901'
      )
    );

    await clickNext();
    // skip registration
    await screen.findByRole('textbox', {
      name: 'Select activation key',
    });

    const registrationCheckbox = await screen.findByTestId(
      'automatically-register-checkbox'
    );

    user.click(registrationCheckbox);
    await clickNext();
    // skip OpenSCAP
    await clickNext();
    // skip fsc
    await clickNext();
    // skip snapshots
    await clickNext();
  };

  test('selected repositories stored in and retrieved from form state', async () => {
    await setUp();

    const getFirstRepoCheckbox = async () =>
      await screen.findByRole('checkbox', {
        name: /select row 0/i,
      });
    let firstRepoCheckbox = (await getFirstRepoCheckbox()) as HTMLInputElement;

    expect(firstRepoCheckbox.checked).toEqual(false);
    user.click(firstRepoCheckbox);
    await waitFor(() => expect(firstRepoCheckbox.checked).toEqual(true));

    await clickNext();
    await clickBack();

    firstRepoCheckbox = (await getFirstRepoCheckbox()) as HTMLInputElement;
    await waitFor(() => expect(firstRepoCheckbox.checked).toEqual(true));
  }, 30000);

  test('correct number of repositories is fetched', async () => {
    await setUp();

    const select = await screen.findByRole('button', {
      name: /^select$/i,
    });

    user.click(select);

    await screen.findByText(/select page \(10 items\)/i);
  });

  test('press on Selected button to see selected repositories list', async () => {
    await setUp();

    const getFirstRepoCheckbox = async () =>
      await screen.findByRole('checkbox', {
        name: /select row 0/i,
      });
    const firstRepoCheckbox =
      (await getFirstRepoCheckbox()) as HTMLInputElement;

    expect(firstRepoCheckbox.checked).toEqual(false);
    user.click(firstRepoCheckbox);
    await waitFor(() => expect(firstRepoCheckbox.checked).toEqual(true));

    const getSelectedButton = async () =>
      await screen.findByRole('button', {
        name: /selected repositories/i,
      });

    const selectedButton = await getSelectedButton();
    user.click(selectedButton);

    expect(firstRepoCheckbox.checked).toEqual(true);

    await clickNext();
    await clickBack();
    await waitFor(() => expect(firstRepoCheckbox.checked).toEqual(true));
  });

  test('press on All button to see all repositories list', async () => {
    await setUp();

    const getFirstRepoCheckbox = async () =>
      await screen.findByRole('checkbox', {
        name: /select row 0/i,
      });
    const firstRepoCheckbox =
      (await getFirstRepoCheckbox()) as HTMLInputElement;

    const getSecondRepoCheckbox = async () =>
      await screen.findByRole('checkbox', {
        name: /select row 1/i,
      });
    const secondRepoCheckbox =
      (await getSecondRepoCheckbox()) as HTMLInputElement;

    expect(firstRepoCheckbox.checked).toEqual(false);
    expect(secondRepoCheckbox.checked).toEqual(false);
    user.click(firstRepoCheckbox);
    await waitFor(() => expect(firstRepoCheckbox.checked).toEqual(true));
    expect(secondRepoCheckbox.checked).toEqual(false);

    const getAllButton = async () =>
      await screen.findByRole('button', {
        name: /all repositories/i,
      });

    const allButton = await getAllButton();
    user.click(allButton);

    expect(firstRepoCheckbox.checked).toEqual(true);
    expect(secondRepoCheckbox.checked).toEqual(false);

    await clickNext();
    await clickBack();

    expect(firstRepoCheckbox.checked).toEqual(true);
    await waitFor(() => expect(secondRepoCheckbox.checked).toEqual(false));
  });

  //   test('press on Selected button to see selected repositories list at the second page and filter checked repo', async () => {
  //     await setUp();

  //     const getFirstRepoCheckbox = async () =>
  //       await screen.findByRole('checkbox', {
  //         name: /select row 0/i,
  //       });

  //     const firstRepoCheckbox =
  //       (await getFirstRepoCheckbox()) as HTMLInputElement;

  //     const getNextPageButton = async () =>
  //       await screen.findAllByRole('button', {
  //         name: /go to next page/i,
  //       });

  //     const nextPageButton = await getNextPageButton();

  //     expect(firstRepoCheckbox.checked).toEqual(false);
  //     await user.click(firstRepoCheckbox);
  //     expect(firstRepoCheckbox.checked).toEqual(true);

  //     await user.click(nextPageButton[0]);

  //     const getSelectedButton = async () =>
  //       await screen.findByRole('button', {
  //         name: /selected repositories/i,
  //       });

  //     const selectedButton = await getSelectedButton();
  //     await user.click(selectedButton);

  //     expect(firstRepoCheckbox.checked).toEqual(true);

  //     await user.type(
  //       await screen.findByRole('textbox', { name: /search repositories/i }),
  //       '13lk3'
  //     );

  //     expect(firstRepoCheckbox.checked).toEqual(true);

  //     await clickNext();
  //     clickBack();
  //     expect(firstRepoCheckbox.checked).toEqual(true);
  //     await user.click(firstRepoCheckbox);
  //     await waitFor(() => expect(firstRepoCheckbox.checked).toEqual(false));
  //   }, 30000);
});
//
// describe('On Recreate', () => {
//   const user = userEvent.setup();
//   const setUp = async () => {
//     ({ router } = renderCustomRoutesWithReduxRouter(
//       'imagewizard/hyk93673-8dcc-4a61-ac30-e9f4940d8346'
//     ));
//   };
//
//   const setUpUnavailableRepo = async () => {
//     ({ router } = renderCustomRoutesWithReduxRouter(
//       'imagewizard/b7193673-8dcc-4a5f-ac30-e9f4940d8346'
//     ));
//   };
//
//   test('with valid repositories', async () => {
//     await setUp();
//
//     await screen.findByRole('heading', { name: /review/i });
//     expect(
//       screen.queryByText('Previously added custom repository unavailable')
//     ).not.toBeInTheDocument();
//
//     const createImageButton = await screen.findByRole('button', {
//       name: /create image/i,
//     });
//     await waitFor(() => expect(createImageButton).toBeEnabled());
//
//     await user.click(
//       await screen.findByRole('button', { name: /custom repositories/i })
//     );
//
//     await screen.findByRole('heading', { name: /custom repositories/i });
//     expect(
//       screen.queryByText('Previously added custom repository unavailable')
//     ).not.toBeInTheDocument();
//
//     const table = await screen.findByTestId('repositories-table');
//
//     const { getAllByRole } = within(table);
//     const rows = getAllByRole('row');
//
//     const availableRepo = rows[1].cells[1];
//     expect(availableRepo).toHaveTextContent(
//       '13lk3http://yum.theforeman.org/releases/3.4/el8/x86_64/'
//     );
//
//     const availableRepoCheckbox = await screen.findByRole('checkbox', {
//       name: /select row 0/i,
//     });
//     expect(availableRepoCheckbox).toBeEnabled();
//   });
//
//   test('with repositories that are no longer available', async () => {
//     await setUpUnavailableRepo();
//
//     await screen.findByRole('heading', { name: /review/i });
//     await screen.findByText('Previously added custom repository unavailable');
//
//     const createImageButton = await screen.findByRole('button', {
//       name: /create image/i,
//     });
//     expect(createImageButton).toBeDisabled();
//
//     await user.click(
//       await screen.findByRole('button', { name: /custom repositories/i })
//     );
//
//     await screen.findByRole('heading', { name: /custom repositories/i });
//     await screen.findByText('Previously added custom repository unavailable');
//
//     const table = await screen.findByTestId('repositories-table');
//
//     const { getAllByRole } = within(table);
//     const rows = getAllByRole('row');
//
//     const unavailableRepo = rows[1].cells[1];
//     expect(unavailableRepo).toHaveTextContent(
//       'Repository with the following url is no longer available:http://unreachable.link.to.repo.org/x86_64/'
//     );
//
//     const unavailableRepoCheckbox = await screen.findByRole('checkbox', {
//       name: /select row 0/i,
//     });
//     expect(unavailableRepoCheckbox).toBeDisabled();
//   });
// });
//
