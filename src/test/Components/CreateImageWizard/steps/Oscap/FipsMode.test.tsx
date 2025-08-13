import { screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { CREATE_BLUEPRINT } from '../../../../../constants';
import { CreateBlueprintRequest } from '../../../../../store/imageBuilderApi';
import { baseCreateBlueprintRequest } from '../../../../fixtures/editMode';
import {
  clickNext,
  clickRegisterLater,
  goToReview,
  interceptBlueprintRequest,
  openAndDismissSaveAndBuildModal,
  renderCreateMode,
  selectRhel9,
} from '../../wizardTestUtils';

vi.mock('@unleash/proxy-client-react', () => ({
  useUnleashContext: () => vi.fn(),
  useFlag: vi.fn((flag) => {
    switch (flag) {
      case 'image-builder.compliance.enabled':
        return true;
      default:
        return false;
    }
  }),
}));

const goToComplianceStep = async () => {
  const user = userEvent.setup();
  await selectRhel9();
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
  await screen.findByText('None');
};

const selectStigPolicy = async () => {
  const user = userEvent.setup();

  const policyMenu = await screen.findByText('None');
  await waitFor(() => user.click(policyMenu));

  const stigPolicy = await screen.findByRole('option', {
    name: /stig gui/i,
  });
  await waitFor(() => user.click(stigPolicy));

  const profile_id = await screen.findByTestId('oscap-profile-info-ref-id');
  expect(profile_id).toHaveTextContent('content_profile_stig_gui');
};

const getFipsCheckbox = async () => {
  return await screen.findByRole('checkbox', {
    name: /enable fips mode/i,
  });
};

const toggleFipsCheckbox = async () => {
  const user = userEvent.setup();
  const fipsCheckbox = await getFipsCheckbox();
  await waitFor(() => user.click(fipsCheckbox));
  return fipsCheckbox;
};

describe('FIPS Mode Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('FIPS checkbox is present and functional', async () => {
    await renderCreateMode();
    await goToComplianceStep();

    const fipsCheckbox = await getFipsCheckbox();

    expect(fipsCheckbox).toBeInTheDocument();
    expect(fipsCheckbox).not.toBeChecked();

    await toggleFipsCheckbox();
    expect(fipsCheckbox).toBeChecked();
    await screen.findByText(
      /enable fips 140-2 compliant cryptographic algorithms/i,
    );
  });

  test('FIPS checkbox is automatically enabled when selecting STIG GUI profile', async () => {
    await renderCreateMode();
    await goToComplianceStep();

    const fipsCheckbox = await getFipsCheckbox();
    expect(fipsCheckbox).not.toBeChecked();

    await selectStigPolicy();
    await waitFor(() => {
      expect(fipsCheckbox).toBeChecked();
    });
  });

  test('FIPS setting included in blueprint when manually enabled', async () => {
    await renderCreateMode();
    await goToComplianceStep();

    await toggleFipsCheckbox();
    await goToReview('FIPS test');
    await openAndDismissSaveAndBuildModal();

    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    const expectedRequest: CreateBlueprintRequest = {
      ...baseCreateBlueprintRequest,
      name: 'FIPS test',
      customizations: {
        ...baseCreateBlueprintRequest.customizations,
        fips: {
          enabled: true,
        },
      },
    };

    await waitFor(() => {
      expect(receivedRequest).toEqual(expectedRequest);
    });
  });
});
