import { screen, waitFor, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { CREATE_BLUEPRINT, EDIT_BLUEPRINT } from '../../../../../constants';
import { CreateBlueprintRequest } from '../../../../../store/imageBuilderApi';
import { mockBlueprintIds } from '../../../../fixtures/blueprints';
import { complianceCreateBlueprintRequest } from '../../../../fixtures/editMode';
import {
  clickNext,
  clickRegisterLater,
  goToReview,
  interceptBlueprintRequest,
  interceptEditBlueprintRequest,
  openAndDismissSaveAndBuildModal,
  renderCreateMode,
  renderEditMode,
  selectRhel9,
} from '../../wizardTestUtils';

// Overwrite
vi.mock('@unleash/proxy-client-react', () => ({
  useUnleashContext: () => vi.fn(),
  useFlag: vi.fn((flag) => {
    switch (flag) {
      case 'image-builder.compliance.enabled':
        return true;
      case 'image-builder.aap.enabled':
        return true;
      default:
        return false;
    }
  }),
}));

const goToComplianceStep = async () => {
  const user = userEvent.setup();
  await selectRhel9(); // Compliance is not available for RHEL 10 yet
  const guestImageCheckBox = await screen.findByRole('checkbox', {
    name: /virtualization guest image checkbox/i,
  });
  await waitFor(() => user.click(guestImageCheckBox));
  await clickNext(); // Registration
  await clickRegisterLater();
  await clickNext(); // Compliance
  await screen.findByRole('heading', { name: /Compliance/ });
  const button = await screen.findByRole('button', {
    name: /Compliance policies/,
  });
  await waitFor(() => user.click(button));
  // wait until all policies are loaded
  await screen.findByText('None');
};

const selectPolicy = async () => {
  const user = userEvent.setup();

  const policyMenu = await screen.findByText('None');
  await waitFor(() => user.click(policyMenu));

  const cisl2 = await screen.findByRole('option', {
    name: /CIS workstation l2/i,
  });
  await waitFor(() => user.click(cisl2));

  const profile_id = await screen.findByTestId('oscap-profile-info-ref-id');
  expect(profile_id).toHaveTextContent('content_profile_cis_workstation_l2');
};

const clickRevisitButton = async () => {
  const user = userEvent.setup();
  const expandable = await screen.findByTestId('compliance-detail-expandable');
  const revisitButton =
    await within(expandable).findByTestId('revisit-compliance');
  await waitFor(() => user.click(revisitButton));
};

describe('Compliance', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('add a policy', async () => {
    await renderCreateMode();
    await goToComplianceStep();
    await selectPolicy();
    await goToReview('Compliance test');
    await openAndDismissSaveAndBuildModal();

    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);
    const expectedRequest: CreateBlueprintRequest = {
      ...complianceCreateBlueprintRequest,
      name: 'Compliance test',
    };

    await waitFor(() => {
      expect(receivedRequest).toEqual(expectedRequest);
    });
  });

  test('revisit step button on Review works', async () => {
    await renderCreateMode();
    await goToComplianceStep();
    await selectPolicy();
    await goToReview('Compliance test');
    await screen.findByRole('heading', { name: /Review/ });
    await clickRevisitButton();
    await screen.findByRole('heading', { name: /Compliance/ });
  });
});

describe('Compliance edit mode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('edit mode works', async () => {
    const id = mockBlueprintIds['compliance'];
    await renderEditMode(id);
    await screen.findByRole('heading', { name: /Review/ });

    // starts on review step
    const receivedRequest = await interceptEditBlueprintRequest(
      `${EDIT_BLUEPRINT}/${id}`,
    );
    const expectedRequest = complianceCreateBlueprintRequest;
    expect(receivedRequest).toEqual(expectedRequest);
  });

  test('fsc and packages get populated on edit', async () => {
    const user = userEvent.setup();
    const id = mockBlueprintIds['compliance'];
    await renderEditMode(id);

    // check that the FSC contains a /tmp partition
    const fscBtns = await screen.findAllByRole('button', {
      name: /file system configuration/i,
    });
    user.click(fscBtns[0]);
    await screen.findByRole('heading', { name: /file system configuration/i });
    await screen.findByText('/tmp');
    // check that the Packages contain neovim package
    const packagesNavBtn = await screen.findByRole('button', {
      name: /additional packages/i,
    });
    user.click(packagesNavBtn);
    await screen.findByRole('heading', {
      name: /Additional packages/i,
    });
    const selectedBtn = await screen.findByRole('button', {
      name: /Selected/i,
    });
    user.click(selectedBtn);
    await screen.findByText('emacs');

    expect(screen.queryByText('aide')).not.toBeInTheDocument();
  });
});
