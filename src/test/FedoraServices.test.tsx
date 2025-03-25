import { screen } from '@testing-library/react';
import { waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import {
  blueprintRequest,
  clickNext,
  enterBlueprintName,
  interceptBlueprintRequest,
  interceptEditBlueprintRequest,
  renderCreateMode,
  renderEditMode,
  selectGuestImageTarget,
} from './Components/CreateImageWizard/wizardTestUtils';
import { mockBlueprintIds } from './fixtures/blueprints';
import { centos9CreateBlueprintRequest } from './fixtures/editMode';

import { CREATE_BLUEPRINT, EDIT_BLUEPRINT } from '../constants';

const goToDetailsStep = async () => {
  await clickNext(); // OpenSCAP
  await clickNext(); // File system configuration
  await clickNext(); // Users
  await clickNext(); // Timezone
  await clickNext(); // Locale
  await clickNext(); // Hostname
  await clickNext(); // Kernel
  await clickNext(); // Firewall
  await clickNext(); // Services
  await clickNext(); // Details
};

describe('Fedora Services', () => {
  beforeAll(async () => {
    vi.mock('@redhat-cloud-services/frontend-components/useChrome', () => ({
      useChrome: () => ({
        auth: {
          getUser: () => ({
            identity: {
              internal: { org_id: 5 },
            },
          }),
        },
        isBeta: () => true,
        isProd: () => true,
        getEnvironment: () => 'prod',
        getEnvironmentDetails: () => ({
          url: ['console.fedorainfracloud.org'],
        }),
      }),
      default: () => ({
        analytics: {
          track: () => 'test',
        },
        isBeta: () => true,
      }),
    }));
  });

  afterAll(() => {
    vi.resetModules();
  });

  test('edit a blueprint', async () => {
    const id = mockBlueprintIds['centos9'];
    await renderEditMode(id);
    // starts on review step
    const receivedRequest = await interceptEditBlueprintRequest(
      `${EDIT_BLUEPRINT}/${id}`
    );
    const expectedRequest = centos9CreateBlueprintRequest;
    await waitFor(() => expect(receivedRequest).toEqual(expectedRequest));
  });

  test('renders wizard with hidden steps', async () => {
    const user = userEvent.setup();
    await renderCreateMode();
    await selectGuestImageTarget();
    await goToDetailsStep();
    await enterBlueprintName('CentOS Blueprint');
    await clickNext();

    const createBlueprintBtn = await screen.findByRole('button', {
      name: 'Create blueprint',
    });
    user.click(createBlueprintBtn);
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    const expectedRequest = {
      ...blueprintRequest,
      name: 'CentOS Blueprint',
      distribution: 'centos-9',
    };

    await waitFor(() => expect(receivedRequest).toEqual(expectedRequest));
  });
});
