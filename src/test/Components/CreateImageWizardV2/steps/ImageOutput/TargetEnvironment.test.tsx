import React from 'react';
import '@testing-library/jest-dom';

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import CreateImageWizard from '../../../../../Components/CreateImageWizardV2/CreateImageWizard';
import { AARCH64, RHEL_8, RHEL_9, X86_64 } from '../../../../../constants';
import { mockArchitecturesByDistro } from '../../../../fixtures/architectures';
import { server } from '../../../../mocks/server';
import {
  clickNext,
  renderCustomRoutesWithReduxRouter,
} from '../../../../testUtils';
import { render, enterBlueprintName } from '../../wizardTestUtils';

const routes = [
  {
    path: 'insights/image-builder/imagewizard/:composeId?',
    element: <CreateImageWizard />,
  },
];
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
    isBeta: () => true,
    isProd: () => true,
    getEnvironment: () => 'prod',
  }),
}));

beforeAll(() => {
  // scrollTo is not defined in jsdom
  window.HTMLElement.prototype.scrollTo = function () {};
});

afterEach(() => {
  jest.clearAllMocks();
  server.resetHandlers();
});

const clickToReview = async () => {
  await clickNext();
  await userEvent.click(
    await screen.findByRole('radio', { name: /Register later/ })
  );
  await clickNext(); // skip Registration
  await clickNext(); // skip OSCAP
  await clickNext(); // skip FSC
  await clickNext(); // skip Repositories
  await clickNext(); // skip Packages
  await enterBlueprintName();
  await clickNext(); // skip Details
};

describe('Check that the target filtering is in accordance to mock content', () => {
  test('rhel9 x86_64', async () => {
    const user = userEvent.setup();
    await renderCustomRoutesWithReduxRouter('imagewizard', {}, routes);

    // select x86_64
    const archMenu = screen.getAllByRole('button', {
      name: /options menu/i,
    })[1];
    await user.click(archMenu);
    await user.click(await screen.findByRole('option', { name: 'x86_64' }));

    // make sure this test is in SYNC with the mocks
    let images_types: string[] = []; // type is `string[]` and not `ImageType[]` because in imageBuilderAPI ArchitectureItem['image_types'] is type string
    mockArchitecturesByDistro(RHEL_9).forEach((elem) => {
      if (elem.arch === X86_64) {
        images_types = elem.image_types;
      }
    });
    expect(images_types).toContain('aws');
    expect(images_types).toContain('gcp');
    expect(images_types).toContain('azure');
    expect(images_types).toContain('guest-image');
    expect(images_types).toContain('image-installer');
    expect(images_types).toContain('vsphere');
    expect(images_types).toContain('vsphere-ova');
    expect(images_types).not.toContain('wsl');
    // make sure the UX conforms to the mocks
    await waitFor(async () => await screen.findByTestId('upload-aws'));
    await screen.findByTestId('upload-google');
    await screen.findByTestId('upload-azure');
    await screen.findByTestId('checkbox-guest-image');
    await screen.findByTestId('checkbox-image-installer');
    await screen.findByText(/vmware vsphere/i);
    await screen.findByText(/open virtualization format \(\.ova\)/i);
    expect(
      screen.queryByText(/wsl - windows subsystem for linux \(\.tar\.gz\)/i)
    ).not.toBeInTheDocument();
  });

  test('rhel8 x86_64', async () => {
    const user = userEvent.setup();
    await renderCustomRoutesWithReduxRouter('imagewizard', {}, routes);

    // select rhel8
    const releaseMenu = screen.getAllByRole('button', {
      name: /options menu/i,
    })[0];
    await user.click(releaseMenu);
    await user.click(
      await screen.findByRole('option', {
        name: /Red Hat Enterprise Linux \(RHEL\) 8/,
      })
    );

    // select x86_64
    const archMenu = screen.getAllByRole('button', {
      name: /options menu/i,
    })[1];
    await user.click(archMenu);
    await user.click(await screen.findByRole('option', { name: 'x86_64' }));

    // make sure this test is in SYNC with the mocks
    let images_types: string[] = [];
    mockArchitecturesByDistro(RHEL_8).forEach((elem) => {
      if (elem.arch === X86_64) {
        images_types = elem.image_types;
      }
    });
    expect(images_types).toContain('aws');
    expect(images_types).toContain('gcp');
    expect(images_types).toContain('azure');
    expect(images_types).toContain('guest-image');
    expect(images_types).toContain('image-installer');
    expect(images_types).toContain('vsphere');
    expect(images_types).toContain('vsphere-ova');
    expect(images_types).toContain('wsl');
    // make sure the UX conforms to the mocks
    await waitFor(async () => await screen.findByTestId('upload-aws'));
    await screen.findByTestId('upload-google');
    await screen.findByTestId('upload-azure');
    await screen.findByTestId('checkbox-guest-image');
    await screen.findByTestId('checkbox-image-installer');
    await screen.findByText(/vmware vsphere/i);
    await screen.findByText(/open virtualization format \(\.ova\)/i);
    await screen.findByText(/wsl - windows subsystem for linux \(\.tar\.gz\)/i);
  });

  test('rhel9 aarch64', async () => {
    const user = userEvent.setup();
    await renderCustomRoutesWithReduxRouter('imagewizard', {}, routes);

    // select aarch64
    const archMenu = screen.getAllByRole('button', {
      name: /options menu/i,
    })[1];
    await user.click(archMenu);
    await user.click(await screen.findByRole('option', { name: 'aarch64' }));

    // make sure this test is in SYNC with the mocks
    let images_types: string[] = [];
    mockArchitecturesByDistro(RHEL_9).forEach((elem) => {
      if (elem.arch === AARCH64) {
        images_types = elem.image_types;
      }
    });
    expect(images_types).toContain('aws');
    expect(images_types).not.toContain('gcp');
    expect(images_types).not.toContain('azure');
    expect(images_types).toContain('guest-image');
    expect(images_types).toContain('image-installer');
    expect(images_types).not.toContain('vsphere');
    expect(images_types).not.toContain('vsphere-ova');
    expect(images_types).not.toContain('wsl');
    // make sure the UX conforms to the mocks
    await waitFor(async () => await screen.findByTestId('upload-aws'));
    expect(screen.queryByTestId('upload-google')).not.toBeInTheDocument();
    expect(screen.queryByTestId('upload-azure')).not.toBeInTheDocument();
    await screen.findByTestId('checkbox-guest-image');
    await screen.findByTestId('checkbox-image-installer');
    expect(screen.queryByText(/vmware vsphere/i)).not.toBeInTheDocument();
    expect(
      screen.queryByText(/open virtualization format \(\.ova\)/i)
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/wsl - windows subsystem for linux \(\.tar\.gz\)/i)
    ).not.toBeInTheDocument();
  });

  test('rhel8 aarch64', async () => {
    const user = userEvent.setup();
    await renderCustomRoutesWithReduxRouter('imagewizard', {}, routes);

    // select rhel8
    const releaseMenu = screen.getAllByRole('button', {
      name: /options menu/i,
    })[0];
    await user.click(releaseMenu);
    await user.click(
      await screen.findByRole('option', {
        name: /Red Hat Enterprise Linux \(RHEL\) 8/,
      })
    );

    // select x86_64
    const archMenu = screen.getAllByRole('button', {
      name: /options menu/i,
    })[1];
    await user.click(archMenu);
    await user.click(await screen.findByRole('option', { name: 'aarch64' }));

    // make sure this test is in SYNC with the mocks
    let images_types: string[] = [];
    mockArchitecturesByDistro(RHEL_8).forEach((elem) => {
      if (elem.arch === AARCH64) {
        images_types = elem.image_types;
      }
    });
    expect(images_types).toContain('aws');
    expect(images_types).not.toContain('gcp');
    expect(images_types).not.toContain('azure');
    expect(images_types).toContain('guest-image');
    expect(images_types).toContain('image-installer');
    expect(images_types).not.toContain('vsphere');
    expect(images_types).not.toContain('vsphere-ova');
    expect(images_types).not.toContain('wsl');
    // make sure the UX conforms to the mocks
    await waitFor(async () => await screen.findByTestId('upload-aws'));
    expect(screen.queryByTestId('upload-google')).not.toBeInTheDocument();
    expect(screen.queryByTestId('upload-azure')).not.toBeInTheDocument();
    await screen.findByTestId('checkbox-guest-image');
    await screen.findByTestId('checkbox-image-installer');
    expect(screen.queryByText(/vmware vsphere/i)).not.toBeInTheDocument();
    expect(
      screen.queryByText(/open virtualization format \(\.ova\)/i)
    ).not.toBeInTheDocument();
    expect(
      screen.queryByText(/wsl - windows subsystem for linux \(\.tar\.gz\)/i)
    ).not.toBeInTheDocument();
  });
});

describe('Check step consistency', () => {
  test('going back and forth with selected options only keeps the one compatible', async () => {
    const user = userEvent.setup();
    await renderCustomRoutesWithReduxRouter('imagewizard', {}, routes);

    // select x86_64
    const archMenu = screen.getAllByRole('button', {
      name: /options menu/i,
    })[1];
    await user.click(archMenu);
    await user.click(await screen.findByRole('option', { name: 'x86_64' }));
    await waitFor(async () => await screen.findByTestId('upload-aws'));
    // select GCP, it's available for x86_64
    await user.click(await screen.findByTestId('upload-google'));
    const next = await screen.findByRole('button', { name: /Next/ });
    await waitFor(() => expect(next).toBeEnabled());
    // Change to aarch
    await user.click(archMenu);
    await user.click(await screen.findByRole('option', { name: 'aarch64' }));
    await waitFor(async () => await screen.findByTestId('upload-aws'));
    // GCP not being compatible with arch, the next button is disabled
    await waitFor(() => expect(next).toBeDisabled());
    // clicking on AWS the user can go next
    await user.click(await screen.findByTestId('upload-aws'));
    await waitFor(() => expect(next).toBeEnabled());
    // and going back to x86_64 the user should keep the next button visible
    await user.click(archMenu);
    await user.click(await screen.findByRole('option', { name: 'x86_64' }));
    await waitFor(() => expect(next).toBeEnabled());
  });
});

describe('set release using query parameter', () => {
  test('rhel 9 by default (no query parameter)', async () => {
    await render();
    await screen.findByText('Red Hat Enterprise Linux (RHEL) 9');
  });

  test('rhel 9 by default (invalid query parameter)', async () => {
    await render({ release: 'rhel9001' });
    await screen.findByText('Red Hat Enterprise Linux (RHEL) 9');
  });

  test('rhel 8 (query parameter provided)', async () => {
    await render({ release: 'rhel8' });
    await screen.findByText('Red Hat Enterprise Linux (RHEL) 8');
  });
});

describe('set architecture using query parameter', () => {
  test('x86_64 by default (no query parameter)', async () => {
    await render();
    await screen.findByText('x86_64');
  });

  test('x86_64 by default (invalid query parameter)', async () => {
    await render({ arch: 'arm' });
    await screen.findByText('x86_64');
  });

  test('aarch64 (query parameter provided)', async () => {
    await render({ arch: 'aarch64' });
    await screen.findByText('aarch64');
  });
});

describe('set target using query parameter', () => {
  test('no target by default (no query parameter)', async () => {
    await render();
    const nextButton = await screen.findByRole('button', { name: /Next/ });
    expect(nextButton).toBeDisabled();
  });

  test('no target by default (invalid query parameter)', async () => {
    await render({ target: 'azure' });
    const nextButton = await screen.findByRole('button', { name: /Next/ });
    expect(nextButton).toBeDisabled();
  });

  test('image-installer (query parameter provided)', async () => {
    await render({ target: 'iso' });
    await clickToReview();
    const targetExpandable = await screen.findByRole('button', {
      name: /Target environments/,
    });
    await userEvent.click(targetExpandable);
    await screen.findByText('Bare metal - Installer (.iso)');
  });

  test('guest-installer (query parameter provided)', async () => {
    await render({ target: 'qcow2' });
    await clickToReview();
    const targetExpandable = await screen.findByRole('button', {
      name: /Target environments/,
    });
    await userEvent.click(targetExpandable);
    await screen.findByText('Virtualization - Guest image (.qcow2)');
  });
});
