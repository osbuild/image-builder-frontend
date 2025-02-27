import type { Router as RemixRouter } from '@remix-run/router';
import { screen, waitFor, within } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';

import { CREATE_BLUEPRINT, EDIT_BLUEPRINT } from '../../../../../constants';
import { mockBlueprintIds } from '../../../../fixtures/blueprints';
import { servicesCreateBlueprintRequest } from '../../../../fixtures/editMode';
import {
  blueprintRequest,
  clickBack,
  clickNext,
  enterBlueprintName,
  interceptBlueprintRequest,
  openAndDismissSaveAndBuildModal,
  interceptEditBlueprintRequest,
  renderEditMode,
  verifyCancelButton,
} from '../../wizardTestUtils';
import { clickRegisterLater, renderCreateMode } from '../../wizardTestUtils';

let router: RemixRouter | undefined = undefined;

const goToServicesStep = async () => {
  const user = userEvent.setup();
  const guestImageCheckBox = await screen.findByRole('checkbox', {
    name: /virtualization guest image checkbox/i,
  });
  await waitFor(() => user.click(guestImageCheckBox));
  await clickNext(); // Registration
  await clickRegisterLater();
  await clickNext(); // OpenSCAP
  await clickNext(); // File system configuration
  await clickNext(); // Snapshots
  await clickNext(); // Custom repositories
  await clickNext(); // Additional packages
  await clickNext(); // Users
  await clickNext(); // Timezone
  await clickNext(); // Locale
  await clickNext(); // Hostname
  await clickNext(); // Kernel
  await clickNext(); // Firewall
  await clickNext(); // Services
};

const goToOpenSCAPStep = async () => {
  const user = userEvent.setup();
  const guestImageCheckBox = await screen.findByRole('checkbox', {
    name: /virtualization guest image checkbox/i,
  });
  await waitFor(() => user.click(guestImageCheckBox));
  await clickNext(); // Registration
  await clickRegisterLater();
  await clickNext(); // OpenSCAP
};

const goFromOpenSCAPToServices = async () => {
  await clickNext(); // File system configuration
  await clickNext(); // Snapshots
  await clickNext(); // Custom repositories
  await clickNext(); // Additional packages
  await clickNext(); // Users
  await clickNext(); // Timezone
  await clickNext(); // Locale
  await clickNext(); // Hostname
  await clickNext(); // Kernel
  await clickNext(); // Firewall
  await clickNext(); // Services
};

const goToReviewStep = async () => {
  await clickNext(); // First boot script
  await clickNext(); // Details
  await enterBlueprintName();
  await clickNext(); // Review
};

const addDisabledService = async (service: string) => {
  const user = userEvent.setup();
  const disabledServiceInput = await screen.findByPlaceholderText(
    'Add disabled service'
  );
  await waitFor(() => user.type(disabledServiceInput, service.concat(' ')));
};

const addMaskedService = async (service: string) => {
  const user = userEvent.setup();
  const maskedServiceInput = await screen.findByPlaceholderText(
    'Add masked service'
  );
  await waitFor(() => user.type(maskedServiceInput, service.concat(' ')));
};

const addEnabledService = async (service: string) => {
  const user = userEvent.setup();
  const enabledServiceInput = await screen.findByPlaceholderText(
    'Add enabled service'
  );
  await waitFor(() => user.type(enabledServiceInput, service.concat(' ')));
};

const removeService = async (service: string) => {
  const user = userEvent.setup();
  const removeServiceButton = await screen.findByRole('button', {
    name: `close ${service}`,
  });
  await waitFor(() => user.click(removeServiceButton));
};

const selectProfile = async () => {
  const user = userEvent.setup();
  const selectProfileDropdown = await screen.findByRole('textbox', {
    name: /select a profile/i,
  });
  await waitFor(() => user.click(selectProfileDropdown));

  const cis1Profile = await screen.findByText(
    /CIS Red Hat Enterprise Linux 8 Benchmark for Level 1 - Workstation/i
  );
  await waitFor(() => user.click(cis1Profile));
};

const clickRevisitButton = async () => {
  const user = userEvent.setup();
  const expandable = await screen.findByTestId('services-expandable');
  const revisitButton = await within(expandable).findByTestId(
    'revisit-services'
  );
  await waitFor(() => user.click(revisitButton));
};

describe('Step Services', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    router = undefined;
  });

  test('clicking Next loads First boot script', async () => {
    await renderCreateMode();
    await goToServicesStep();
    await clickNext();
    await screen.findByRole('heading', {
      name: 'First boot configuration',
    });
  });

  test('clicking Back loads Firewall', async () => {
    await renderCreateMode();
    await goToServicesStep();
    await clickBack();
    await screen.findByRole('heading', { name: 'Firewall' });
  });

  test('clicking Cancel loads landing page', async () => {
    await renderCreateMode();
    await goToServicesStep();
    await verifyCancelButton(router);
  });

  test('services can be added and removed', async () => {
    await renderCreateMode();
    await goToServicesStep();
    await addDisabledService('telnet');
    await addDisabledService('https');
    await removeService('telnet');
    expect(screen.queryByText('telnet')).not.toBeInTheDocument();
  });

  test('validation works', async () => {
    const user = userEvent.setup();
    await renderCreateMode();
    await goToServicesStep();
    const clearInputButtons = await screen.findAllByRole('button', {
      name: /clear input/i,
    });

    // Disabled services input
    expect(screen.queryByText('Invalid format.')).not.toBeInTheDocument();
    await addDisabledService('-------');
    expect(await screen.findByText('Invalid format.')).toBeInTheDocument();
    await waitFor(() => user.click(clearInputButtons[0]));

    // Masked services input
    expect(screen.queryByText('Invalid format.')).not.toBeInTheDocument();
    await addMaskedService('-------');
    expect(await screen.findByText('Invalid format.')).toBeInTheDocument();
    await waitFor(() => user.click(clearInputButtons[1]));

    // Enabled services input
    expect(screen.queryByText('Invalid format.')).not.toBeInTheDocument();
    await addEnabledService('-------');
    expect(await screen.findByText('Invalid format.')).toBeInTheDocument();
    await waitFor(() => user.click(clearInputButtons[2]));
  });

  test('services from OpenSCAP get added correctly and cannot be removed', async () => {
    await renderCreateMode();
    await goToOpenSCAPStep();
    await selectProfile();
    await goFromOpenSCAPToServices();
    await screen.findAllByText('Required by OpenSCAP');
    // disabled services
    await screen.findByText('nfs-server');
    await screen.findByText('emacs-service');
    expect(
      screen.queryByRole('button', { name: /close nfs-server/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /close emacs-service/i })
    ).not.toBeInTheDocument();
    // enabled services
    await screen.findByText('crond');
    await screen.findByText('neovim-service');
    expect(
      screen.queryByRole('button', { name: /close crond/i })
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: /close neovim-service/i })
    ).not.toBeInTheDocument();
  });

  test('revisit step button on Review works', async () => {
    await renderCreateMode();
    await goToServicesStep();
    await addDisabledService('telnet');
    await goToReviewStep();
    await clickRevisitButton();
    await screen.findByRole('heading', { name: /Systemd services/ });
  });
});

describe('Services request generated correctly', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
  });

  test('with services', async () => {
    await renderCreateMode();
    await goToServicesStep();
    await addDisabledService('telnet');
    await addMaskedService('nfs-server');
    await addEnabledService('httpd');
    await goToReviewStep();
    // informational modal pops up in the first test only as it's tied
    // to a 'imageBuilder.saveAndBuildModalSeen' variable in localStorage
    await openAndDismissSaveAndBuildModal();
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    const expectedRequest = {
      ...blueprintRequest,
      customizations: {
        services: {
          disabled: ['telnet'],
          masked: ['nfs-server'],
          enabled: ['httpd'],
        },
      },
    };

    await waitFor(() => {
      expect(receivedRequest).toEqual(expectedRequest);
    });
  });

  test('with added and removed services', async () => {
    await renderCreateMode();
    await goToServicesStep();
    await addDisabledService('telnet');
    await addMaskedService('nfs-server');
    await addEnabledService('httpd');
    await removeService('telnet');
    await removeService('nfs-server');
    await removeService('httpd');
    await goToReviewStep();
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    const expectedRequest = {
      ...blueprintRequest,
    };

    await waitFor(() => {
      expect(receivedRequest).toEqual(expectedRequest);
    });
  });

  test('with OpenSCAP profile that includes services', async () => {
    await renderCreateMode();
    await goToOpenSCAPStep();
    await selectProfile();
    await goFromOpenSCAPToServices();
    await goToReviewStep();
    const receivedRequest = await interceptBlueprintRequest(CREATE_BLUEPRINT);

    const expectedRequest = {
      ...blueprintRequest,
      customizations: {
        filesystem: [
          {
            min_size: 10737418240,
            mountpoint: '/',
          },
          { min_size: 1073741824, mountpoint: '/tmp' },
          { min_size: 1073741824, mountpoint: '/home' },
        ],
        openscap: {
          profile_id: 'xccdf_org.ssgproject.content_profile_cis_workstation_l1',
        },
        packages: ['aide', 'neovim'],
        kernel: {
          append: 'audit_backlog_limit=8192 audit=1',
        },
        services: {
          masked: ['nfs-server', 'emacs-service'],
          disabled: ['rpcbind', 'autofs', 'nftables'],
          enabled: ['crond', 'neovim-service'],
        },
      },
    };

    await waitFor(() => {
      expect(receivedRequest).toEqual(expectedRequest);
    });
  });
});

describe('Services edit mode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('edit mode works', async () => {
    const id = mockBlueprintIds['services'];
    await renderEditMode(id);

    // starts on review step
    const receivedRequest = await interceptEditBlueprintRequest(
      `${EDIT_BLUEPRINT}/${id}`
    );
    const expectedRequest = servicesCreateBlueprintRequest;
    expect(receivedRequest).toEqual(expectedRequest);
  });
});

// TO DO 'Services step' -> 'revisit step button on Review works'
