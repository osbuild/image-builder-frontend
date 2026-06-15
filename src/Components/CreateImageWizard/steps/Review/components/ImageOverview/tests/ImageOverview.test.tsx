import React from 'react';

import { screen } from '@testing-library/react';

import { RHEL_10, X86_64 } from '@/constants';
import { renderWithRedux } from '@/test/testUtils';

import { adminUser, userGroups } from '../../AdvancedSettings/tests/mocks';
import { createDefaultRestrictions } from '../../tests/helpers';
import ImageOverview from '../index';

describe('ImageOverview', () => {
  test('renders the card with image overview title', () => {
    renderWithRedux(
      <ImageOverview restrictions={createDefaultRestrictions()} />,
    );

    expect(screen.getByText('Image overview')).toBeInTheDocument();
  });

  test('displays the blueprint name', () => {
    renderWithRedux(
      <ImageOverview restrictions={createDefaultRestrictions()} />,
      {
        details: {
          blueprintName: 'my-test-blueprint',
          blueprintDescription: '',
          isCustomName: true,
        },
      },
    );

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('my-test-blueprint')).toBeInTheDocument();
  });

  test('displays the blueprint description', () => {
    renderWithRedux(
      <ImageOverview restrictions={createDefaultRestrictions()} />,
      {
        details: {
          blueprintName: 'test-blueprint',
          blueprintDescription: 'This is a test description',
          isCustomName: true,
        },
      },
    );

    expect(screen.getByText('Details')).toBeInTheDocument();
    expect(screen.getByText('This is a test description')).toBeInTheDocument();
  });

  test('displays the base release for package mode', () => {
    renderWithRedux(
      <ImageOverview restrictions={createDefaultRestrictions()} />,
      {
        distribution: RHEL_10,
        blueprintMode: 'package',
      },
    );

    expect(screen.getByText('Base release')).toBeInTheDocument();
    expect(
      screen.getByText('Red Hat Enterprise Linux (RHEL) 10'),
    ).toBeInTheDocument();
  });

  test('displays the architecture', () => {
    renderWithRedux(
      <ImageOverview restrictions={createDefaultRestrictions()} />,
      {
        architecture: X86_64,
      },
    );

    expect(screen.getByText('Architecture')).toBeInTheDocument();
    expect(screen.getByText(X86_64)).toBeInTheDocument();
  });

  test('displays target environments heading', () => {
    renderWithRedux(
      <ImageOverview restrictions={createDefaultRestrictions()} />,
    );

    expect(screen.getByText('Target environments')).toBeInTheDocument();
  });

  describe('Private clouds', () => {
    test('displays vsphere when selected', () => {
      renderWithRedux(
        <ImageOverview restrictions={createDefaultRestrictions()} />,
        {
          imageTypes: ['vsphere'],
        },
      );

      expect(screen.getByText('Private cloud')).toBeInTheDocument();
      expect(screen.getByText('VMware vSphere (.vmdk)')).toBeInTheDocument();
    });

    test('displays vsphere-ova when selected', () => {
      renderWithRedux(
        <ImageOverview restrictions={createDefaultRestrictions()} />,
        {
          imageTypes: ['vsphere-ova'],
        },
      );

      expect(screen.getByText('Private cloud')).toBeInTheDocument();
      expect(screen.getByText('VMware vSphere (.ova)')).toBeInTheDocument();
    });

    test('displays multiple private clouds when selected', () => {
      renderWithRedux(
        <ImageOverview restrictions={createDefaultRestrictions()} />,
        {
          imageTypes: ['vsphere', 'vsphere-ova'],
        },
      );

      expect(screen.getByText('VMware vSphere (.vmdk)')).toBeInTheDocument();
      expect(screen.getByText('VMware vSphere (.ova)')).toBeInTheDocument();
    });

    test('does not display private cloud section when none selected', () => {
      renderWithRedux(
        <ImageOverview restrictions={createDefaultRestrictions()} />,
        {
          imageTypes: ['aws'],
        },
      );

      expect(screen.queryByText('Private cloud')).not.toBeInTheDocument();
    });
  });

  describe('Public clouds', () => {
    test('displays AWS details when selected', () => {
      renderWithRedux(
        <ImageOverview restrictions={createDefaultRestrictions()} />,
        {
          imageTypes: ['aws'],
          aws: {
            accountId: '123456789012',
            shareMethod: 'manual',
            source: undefined,
            region: 'us-west-2',
          },
        },
      );

      expect(screen.getByText('Public cloud')).toBeInTheDocument();
      expect(screen.getByText('Amazon Web Services')).toBeInTheDocument();
      expect(
        screen.getByText(/Shared with account: 123456789012/),
      ).toBeInTheDocument();
      expect(screen.getByText(/Region: us-west-2/)).toBeInTheDocument();
    });

    test('displays GCP details when selected', () => {
      renderWithRedux(
        <ImageOverview restrictions={createDefaultRestrictions()} />,
        {
          imageTypes: ['gcp'],
          gcp: {
            accountType: 'user',
            email: 'test@example.com',
          },
        },
      );

      expect(screen.getByText('Google Cloud')).toBeInTheDocument();
      expect(
        screen.getByText(/Account type: Google account/),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Principal: test@example.com/),
      ).toBeInTheDocument();
    });

    test('displays Azure details when selected', () => {
      renderWithRedux(
        <ImageOverview restrictions={createDefaultRestrictions()} />,
        {
          imageTypes: ['azure'],
          azure: {
            tenantId: 'tenant-123',
            subscriptionId: 'sub-456',
            resourceGroup: 'my-resource-group',
            hyperVGeneration: 'V2',
          },
        },
      );

      expect(screen.getByText('Microsoft Azure')).toBeInTheDocument();
      expect(screen.getByText(/Tenant ID: tenant-123/)).toBeInTheDocument();
      expect(screen.getByText(/Subscription ID: sub-456/)).toBeInTheDocument();
      expect(
        screen.getByText(/Resource group: my-resource-group/),
      ).toBeInTheDocument();
    });

    test('displays OCI when selected', () => {
      renderWithRedux(
        <ImageOverview restrictions={createDefaultRestrictions()} />,
        {
          imageTypes: ['oci'],
        },
      );

      expect(
        screen.getByText('Oracle Cloud Infrastructure'),
      ).toBeInTheDocument();
    });

    test('does not display public cloud section when none selected', () => {
      renderWithRedux(
        <ImageOverview restrictions={createDefaultRestrictions()} />,
        {
          imageTypes: ['vsphere'],
        },
      );

      expect(screen.queryByText('Public cloud')).not.toBeInTheDocument();
    });
  });

  describe('Miscellaneous formats', () => {
    test('displays guest-image when selected', () => {
      renderWithRedux(
        <ImageOverview restrictions={createDefaultRestrictions()} />,
        {
          imageTypes: ['guest-image'],
        },
      );

      expect(screen.getByText('Miscellaneous formats')).toBeInTheDocument();
      expect(screen.getByText('Virtualization (.qcow2)')).toBeInTheDocument();
    });

    test('displays image-installer when selected', () => {
      renderWithRedux(
        <ImageOverview restrictions={createDefaultRestrictions()} />,
        {
          imageTypes: ['image-installer'],
        },
      );

      expect(screen.getByText('Baremetal (.iso)')).toBeInTheDocument();
    });

    test('displays wsl when selected', () => {
      renderWithRedux(
        <ImageOverview restrictions={createDefaultRestrictions()} />,
        {
          imageTypes: ['wsl'],
        },
      );

      expect(
        screen.getByText('Windows Subsystem for Linux (.tar.gz)'),
      ).toBeInTheDocument();
    });

    test('displays multiple misc formats when selected', () => {
      renderWithRedux(
        <ImageOverview restrictions={createDefaultRestrictions()} />,
        {
          imageTypes: ['guest-image', 'image-installer', 'wsl'],
        },
      );

      expect(screen.getByText('Virtualization (.qcow2)')).toBeInTheDocument();
      expect(screen.getByText('Baremetal (.iso)')).toBeInTheDocument();
      expect(
        screen.getByText('Windows Subsystem for Linux (.tar.gz)'),
      ).toBeInTheDocument();
    });

    test('does not display misc formats section when none selected', () => {
      renderWithRedux(
        <ImageOverview restrictions={createDefaultRestrictions()} />,
        {
          imageTypes: ['aws'],
        },
      );

      expect(
        screen.queryByText('Miscellaneous formats'),
      ).not.toBeInTheDocument();
    });
  });

  describe('Users', () => {
    test('renders users + groups section when users are required', () => {
      renderWithRedux(
        <ImageOverview
          restrictions={createDefaultRestrictions({
            users: { required: true },
          })}
        />,
        {
          imageTypes: ['guest-image'],
          users: [adminUser],
          userGroups: userGroups,
        },
      );

      expect(screen.getByText('Users')).toBeInTheDocument();
      expect(screen.getByText('admin')).toBeInTheDocument();
      expect(screen.getByText('User groups')).toBeInTheDocument();
      expect(screen.getByText('developers')).toBeInTheDocument();
    });

    test('does not render users section when users are not required', () => {
      renderWithRedux(
        <ImageOverview restrictions={createDefaultRestrictions()} />,
        {
          imageTypes: ['guest-image'],
          users: [adminUser],
          userGroups: userGroups,
        },
      );

      expect(screen.queryByText('Users')).not.toBeInTheDocument();
      expect(screen.queryByText('User groups')).not.toBeInTheDocument();
    });
  });
});
