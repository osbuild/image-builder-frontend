import { screen, waitFor, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { CREATE_BLUEPRINT, EDIT_BLUEPRINT } from '../../../../../constants';
import { CreateBlueprintRequest } from '../../../../../store/imageBuilderApi';
import { yyyyMMddFormat } from '../../../../../Utilities/time';
import { mockBlueprintIds } from '../../../../fixtures/blueprints';
import {
  expectedCustomRepositories,
  expectedPayloadRepositories,
  snapshotCreateBlueprintRequest,
} from '../../../../fixtures/editMode';
import {
  blueprintRequest,
  clickNext,
  clickRegisterLater,
  clickReviewAndFinish,
  getNextButton,
  goToReview,
  goToStep,
  interceptBlueprintRequest,
  interceptEditBlueprintRequest,
  openAndDismissSaveAndBuildModal,
  renderCreateMode,
  renderEditMode,
} from '../../wizardTestUtils';

const goToSnapshotStep = async () => {
  const user = userEvent.setup();
  const guestImageCheckBox = await screen.findByRole('checkbox', {
    name: /virtualization guest image checkbox/i,
  });
  await waitFor(async () => user.click(guestImageCheckBox));
  await clickNext(); // Registration
  await clickRegisterLater();
  await goToStep(/Repeatable build/);
};

const clickRevisitButton = async () => {
  const user = userEvent.setup();
  const expandable = await screen.findByTestId('content-expandable');
  const revisitButton = await within(expandable).findByTestId(
    'revisit-custom-repositories',
  );
  await waitFor(() => user.click(revisitButton));
};

const searchForRepository = async (repo: string) => {
  const user = userEvent.setup();
  const search = await screen.findByLabelText('Filter repositories');
  await waitFor(() => user.type(search, repo));
  await waitFor(() => expect(screen.getByText(repo)).toBeInTheDocument);
};

const selectFirstRepository = async () => {
  const user = userEvent.setup();
  const row0Checkbox = await screen.findByRole('checkbox', {
    name: /select row 0/i,
  });
  await waitFor(async () => user.click(row0Checkbox));
};

const clickBulkSelect = async () => {
  const user = userEvent.setup();
  const bulkSelectCheckbox = await screen.findByRole('checkbox', {
    name: /select all/i,
  });
  await waitFor(async () => user.click(bulkSelectCheckbox));
};

const selectUseSnapshot = async () => {
  const user = userEvent.setup();
  const snapshotRadio = await screen.findByRole('radio', {
    name: /Enable repeatable build/i,
  });
  await waitFor(async () => user.click(snapshotRadio));
};

const updateDatePickerWithValue = async (date: string) => {
  const user = userEvent.setup();
  const dateTextbox = await screen.findByRole('textbox', {
    name: /Date picker/i,
  });
  await waitFor(async () => user.clear(dateTextbox));
  await waitFor(async () => user.type(dateTextbox, date));
};

const datePickerValue = async () => {
  const dateTextbox = await screen.findByRole('textbox', {
    name: /Date picker/i,
  });
  return (dateTextbox as HTMLInputElement).value;
};

const clickContentDropdown = async () => {
  const user = userEvent.setup();
  const contentExpandable = await screen.findByTestId('content-expandable');
  await waitFor(async () => user.click(contentExpandable));
};

const getSnapshotMethodElement = async () =>
  await screen.findByRole('button', { name: /Snapshot method/i });

const clickReset = async () => {
  const user = userEvent.setup();
  const resetButton = await screen.findByRole('button', {
    name: /Reset/i,
  });
  await waitFor(async () => user.click(resetButton));
};

const selectUseTemplate = async () => {
  const user = userEvent.setup();
  const templateRadio = await screen.findByRole('radio', {
    name: /Use a content template/i,
  });
  await waitFor(async () => user.click(templateRadio));
};

const selectFirstTemplate = async () => {
  const user = userEvent.setup();
  const row0Radio = await screen.findByRole('radio', {
    name: /select row 0/i,
  });
  await waitFor(async () => user.click(row0Radio));
};

describe('repository snapshot tab - ', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('clicking Review and finish leads to Review', async () => {
    await renderCreateMode();
    await goToSnapshotStep();
    await clickReviewAndFinish();
    await screen.findByRole('heading', {
      name: /Review/i,
    });
  });

  test('button Review and finish is disabled for invalid state', async () => {
    await renderCreateMode();
    await goToSnapshotStep();
    await selectUseSnapshot();
    await updateDatePickerWithValue('2024-00-00');
    expect(
      await screen.findByRole('button', { name: /Review and finish/ }),
    ).toBeDisabled();
  });

  test('select use a snapshot with 1 repo selected', async () => {
    await renderCreateMode();
    await goToSnapshotStep();
    await selectUseSnapshot();
    await updateDatePickerWithValue('2024-04-22');

    await clickNext(); // To repositories step
    await selectFirstRepository();
    await goToReview();
    await clickContentDropdown();

    const snapshotMethodElement = await getSnapshotMethodElement();
    // Check date was recorded correctly
    expect(snapshotMethodElement).toHaveTextContent('State as of 2024-04-22');
    // Check that the button is clickable (has 1 repo selected)
    expect(snapshotMethodElement).toBeEnabled();

    // informational modal pops up in the first test only as it's tied
    // to a 'imageBuilder.saveAndBuildModalSeen' variable in localStorage
    await openAndDismissSaveAndBuildModal();

    // Check the date was passed correctly to the blueprint
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);
    blueprintRequest.image_requests[0].snapshot_date =
      '2024-04-22T00:00:00.000Z';

    const expectedRequest: CreateBlueprintRequest = {
      ...blueprintRequest,
      customizations: {
        custom_repositories: expectedCustomRepositories,
        payload_repositories: expectedPayloadRepositories,
      },
    };

    expect(receivedRequest).toEqual(expectedRequest);
  });

  test('select use a snapshot with no repos selected', async () => {
    await renderCreateMode();
    await goToSnapshotStep();
    await selectUseSnapshot();
    await updateDatePickerWithValue('2024-04-22');
    await clickNext(); // To repositories step
    await goToReview();
    await clickContentDropdown();

    const snapshotMethodElement = await getSnapshotMethodElement();
    // Check date was recorded correctly
    expect(snapshotMethodElement).toHaveTextContent('State as of 2024-04-22');
    // Check that the button is clickable (has 1 repo selected)
    await waitFor(() => {
      expect(snapshotMethodElement).toBeDisabled();
    });
  });

  test('select is disabled for non-snapshot repository', async () => {
    await renderCreateMode();
    await goToSnapshotStep();
    await selectUseSnapshot();
    await updateDatePickerWithValue('2024-04-22');
    await clickNext(); // To repositories step
    await searchForRepository('nosnapshot');

    const row0Checkbox = await screen.findByRole('checkbox', {
      name: /select row 0/i,
    });
    expect(row0Checkbox).toBeDisabled();

    const bulkSelectCheckbox = await screen.findByRole('checkbox', {
      name: /select all/i,
    });
    // eslint-disable-next-line testing-library/no-node-access
    expect(bulkSelectCheckbox.closest('div')).toHaveClass('pf-m-disabled');
  });

  test('button Reset works to empty the snapshot date', async () => {
    await renderCreateMode();
    await goToSnapshotStep();
    await selectUseSnapshot();
    await updateDatePickerWithValue('2024-04-22');
    // Check the Next button is enabled
    const nextBtn = await screen.findByRole('button', { name: /Next/i });
    await waitFor(() => {
      expect(nextBtn).toBeEnabled();
    });
    // reset fills in the current date, so it should not be disabled
    await clickReset();
    // works even for invalid values
    await updateDatePickerWithValue('xxx');
    await waitFor(() => {
      expect(nextBtn).toBeDisabled();
    });
    await clickReset();
    await waitFor(() => {
      expect(nextBtn).toBeEnabled();
    });

    const dateStr = yyyyMMddFormat(new Date());
    expect(await datePickerValue()).toBe(dateStr);
  });

  test('select using bulk select works ', async () => {
    await renderCreateMode();
    await goToSnapshotStep();
    await selectUseSnapshot();
    await updateDatePickerWithValue('2024-04-22');
    await clickNext(); // To repositories step
    await searchForRepository('01-test-valid-repo');

    // wait until there's only 1 repository on the page
    await waitFor(async () => {
      const rows = screen.getAllByRole('row');
      // header row + repo row
      expect(rows).toHaveLength(2);
    });

    await clickBulkSelect();
    await goToReview();

    // Check the date was passed correctly to the blueprint
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);
    blueprintRequest.image_requests[0].snapshot_date =
      '2024-04-22T00:00:00.000Z';

    const expectedRequest: CreateBlueprintRequest = {
      ...blueprintRequest,
      customizations: {
        custom_repositories: expectedCustomRepositories,
        payload_repositories: expectedPayloadRepositories,
      },
    };

    expect(receivedRequest).toEqual(expectedRequest);
  });

  test('revisit step button on Review works', async () => {
    await renderCreateMode();
    await goToSnapshotStep();
    await selectUseSnapshot();
    await updateDatePickerWithValue('2024-04-22');
    await clickNext();
    await goToReview();
    await clickRevisitButton();
    await screen.findByRole('heading', { name: /Custom repositories/i });
  });

  test('select use a content template', async () => {
    await renderCreateMode();
    await goToSnapshotStep();
    await selectUseTemplate();
    const nextBtn = await getNextButton();
    await waitFor(() => {
      expect(nextBtn).toBeDisabled();
    });
    await selectFirstTemplate();
    await waitFor(() => {
      expect(nextBtn).toBeEnabled();
    });
    await clickNext();
    await goToReview();
    await screen.findByText(/Use a content template/);
  });
});

describe('Snapshot edit mode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('edit mode works', async () => {
    const id = mockBlueprintIds['snapshot'];
    await renderEditMode(id);

    // starts on review step
    const receivedRequest = await interceptEditBlueprintRequest(
      `${EDIT_BLUEPRINT}/${id}`,
    );
    const expectedRequest = snapshotCreateBlueprintRequest;
    expect(receivedRequest).toEqual(expectedRequest);
  });
});
