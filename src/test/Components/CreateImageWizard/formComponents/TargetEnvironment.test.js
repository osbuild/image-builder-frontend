import React from 'react';
import '@testing-library/jest-dom';

import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import CreateImageWizard from '../../../../Components/CreateImageWizard/CreateImageWizard';
import { AARCH64, RHEL_8, RHEL_9, X86_64 } from '../../../../constants';
import { mockArchitecturesByDistro } from '../../../fixtures/architectures';
import { server } from '../../../mocks/server';
import { renderCustomRoutesWithReduxRouter } from '../../../testUtils';

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
    let images_types = [];
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
      screen.getByRole('option', {
        name: 'Red Hat Enterprise Linux (RHEL) 8',
      })
    );

    // select x86_64
    const archMenu = screen.getAllByRole('button', {
      name: /options menu/i,
    })[1];
    await user.click(archMenu);
    await user.click(await screen.findByRole('option', { name: 'x86_64' }));

    // make sure this test is in SYNC with the mocks
    let images_types = [];
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
    let images_types = [];
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
      screen.getByRole('option', {
        name: 'Red Hat Enterprise Linux (RHEL) 8',
      })
    );

    // select x86_64
    const archMenu = screen.getAllByRole('button', {
      name: /options menu/i,
    })[1];
    await user.click(archMenu);
    await user.click(await screen.findByRole('option', { name: 'aarch64' }));

    // make sure this test is in SYNC with the mocks
    let images_types = [];
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
    await user.click(screen.getByTestId('upload-google'));
    const next = await screen.findByRole('button', { name: /Next/ });
    await waitFor(() => expect(next).toBeEnabled());
    // Change to aarch
    await user.click(archMenu);
    await user.click(await screen.findByRole('option', { name: 'aarch64' }));
    await waitFor(async () => await screen.findByTestId('upload-aws'));
    // GCP not being compatible with arch, the next button is disabled
    await waitFor(() => expect(next).toBeDisabled());
    // clicking on AWS the user can go next
    await user.click(screen.getByTestId('upload-aws'));
    await waitFor(() => expect(next).toBeEnabled());
    // and going back to x86_64 the user should keep the next button visible
    await user.click(archMenu);
    await user.click(await screen.findByRole('option', { name: 'x86_64' }));
    await waitFor(() => expect(next).toBeEnabled());
  });
});
