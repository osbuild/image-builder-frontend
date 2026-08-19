import React from 'react';

import { screen } from '@testing-library/react';

import { initialState, type SupportedImageTypes } from '@/store/slices/wizard';
import { renderWithRedux } from '@/test/testUtils';

import NoUsersAlert from '../NoUsersAlert';

const testUser = {
  name: 'testuser',
  password: '',
  ssh_key: '',
  isAdministrator: false,
  groups: [],
  hasPassword: false,
};

const renderForTargets = (
  imageTypes: SupportedImageTypes[],
  users = initialState.system.users,
) =>
  renderWithRedux(<NoUsersAlert />, {
    output: { ...initialState.output, imageTypes },
    system: { ...initialState.system, users },
  });

describe('NoUsersAlert', () => {
  test.each<SupportedImageTypes>([
    'aws',
    'ami',
    'azure',
    'vhd',
    'gcp',
    'oci',
    'vsphere',
    'vsphere-ova',
    'guest-image',
  ])('points %s at launch-time provisioning', async (imageType) => {
    renderForTargets([imageType]);

    expect(await screen.findByText(/no users added/i)).toBeInTheDocument();
    expect(screen.getByText(/cloud-init/i)).toBeInTheDocument();
  });

  test.each<SupportedImageTypes>(['image-installer', 'wsl'])(
    'tells %s that setup will ask for a user',
    async (imageType) => {
      renderForTargets([imageType]);

      expect(await screen.findByText(/no users added/i)).toBeInTheDocument();
      expect(
        screen.getByText(/asked to create one the first time/i),
      ).toBeInTheDocument();
    },
  );

  test('warns firmly for PXE, which has no way to add a user later', async () => {
    renderForTargets(['pxe-tar-xz']);

    expect(
      await screen.findByText(/no way to add one later/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/will not be able to log in at all/i),
    ).toBeInTheDocument();
  });

  test('uses the firmest message when targets are mixed', async () => {
    renderForTargets(['guest-image', 'pxe-tar-xz', 'image-installer']);

    expect(
      await screen.findByText(/no way to add one later/i),
    ).toBeInTheDocument();
  });

  test.each<SupportedImageTypes>([
    'bootable-container-iso',
    'network-installer',
  ])('does not warn for %s, which does not support users', (imageType) => {
    renderForTargets([imageType]);

    expect(screen.queryByText(/no users added/i)).not.toBeInTheDocument();
  });

  test('does not warn when a user is configured', () => {
    renderForTargets(['guest-image'], [testUser]);

    expect(screen.queryByText(/no users added/i)).not.toBeInTheDocument();
  });

  test('does not warn before a target is selected', () => {
    renderForTargets([]);

    expect(screen.queryByText(/no users added/i)).not.toBeInTheDocument();
  });
});
