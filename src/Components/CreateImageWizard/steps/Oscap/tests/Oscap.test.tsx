import React from 'react';

import { screen, within } from '@testing-library/react';

import { initialState } from '@/store/slices/wizard';
import { clickWithWait, createUser, renderWithRedux } from '@/test/testUtils';

import { createDefaultFetchHandler, fetchMock } from './mocks';

import OscapStep from '../index';

fetchMock.enableMocks();

beforeEach(() => {
  fetchMock.mockResponse(createDefaultFetchHandler);
});

afterEach(() => {
  fetchMock.resetMocks();
});

describe('Oscap Component', () => {
  describe('Profile selector', () => {
    test('profile dropdown opens and closes on toggle click', async () => {
      renderWithRedux(<OscapStep />, {
        output: {
          ...initialState.output,
          imageTypes: ['guest-image'],
        },
        compliance: {
          type: 'openscap',
          profileID: undefined,
          policyID: undefined,
          policyTitle: undefined,
          fips: { enabled: false },
        },
      });
      const user = createUser();

      const openscapRadio = await screen.findByRole('radio', {
        name: /Use a default OpenSCAP profile/i,
      });
      await clickWithWait(user, openscapRadio);

      const profileSelect = await screen.findByTestId('profileSelect');
      expect(profileSelect).toHaveTextContent('Select a profile');

      await clickWithWait(user, profileSelect);
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });
  });

  describe('Compliance type radio buttons', () => {
    test('"No additional policy or profile" is selected by default', async () => {
      renderWithRedux(<OscapStep />);

      const noneRadio = await screen.findByRole('radio', {
        name: /No additional policy or profile/i,
      });
      expect(noneRadio).toBeChecked();

      const complianceRadio = screen.getByRole('radio', {
        name: /Use a custom compliance policy/i,
      });
      expect(complianceRadio).not.toBeChecked();

      const openscapRadio = screen.getByRole('radio', {
        name: /Use a default OpenSCAP profile/i,
      });
      expect(openscapRadio).not.toBeChecked();
    });

    test('switching to compliance enables the policy selector', async () => {
      renderWithRedux(<OscapStep />);
      const user = createUser();

      const complianceRadio = await screen.findByRole('radio', {
        name: /Use a custom compliance policy/i,
      });
      await clickWithWait(user, complianceRadio);

      expect(complianceRadio).toBeChecked();
      expect(
        screen.getByRole('radio', {
          name: /No additional policy or profile/i,
        }),
      ).not.toBeChecked();
    });

    test('switching to openscap enables the profile selector', async () => {
      renderWithRedux(<OscapStep />, {
        output: { ...initialState.output, imageTypes: ['guest-image'] },
      });
      const user = createUser();

      const openscapRadio = await screen.findByRole('radio', {
        name: /Use a default OpenSCAP profile/i,
      });
      await clickWithWait(user, openscapRadio);

      expect(openscapRadio).toBeChecked();
      expect(
        screen.getByRole('radio', {
          name: /No additional policy or profile/i,
        }),
      ).not.toBeChecked();

      expect(screen.getByTestId('profileSelect')).toBeInTheDocument();
    });

    test('switching back to none from openscap deselects profile', async () => {
      renderWithRedux(<OscapStep />, {
        output: {
          ...initialState.output,
          imageTypes: ['guest-image'],
        },
        compliance: {
          type: 'openscap',
          profileID: undefined,
          policyID: undefined,
          policyTitle: undefined,
          fips: { enabled: false },
        },
      });
      const user = createUser();

      const noneRadio = await screen.findByRole('radio', {
        name: /No additional policy or profile/i,
      });
      await clickWithWait(user, noneRadio);

      expect(noneRadio).toBeChecked();
      expect(
        screen.getByRole('radio', {
          name: /Use a default OpenSCAP profile/i,
        }),
      ).not.toBeChecked();
    });
  });

  describe('Profile details popover', () => {
    test('shows profile customizations', async () => {
      renderWithRedux(<OscapStep />, {
        output: {
          ...initialState.output,
          imageTypes: ['guest-image'],
        },
        compliance: {
          type: 'openscap',
          profileID: 'xccdf_org.ssgproject.content_profile_cis_workstation_l1',
          policyID: undefined,
          policyTitle: undefined,
          fips: { enabled: false },
        },
      });
      const user = createUser();

      const viewDetailsButton = await screen.findByRole('button', {
        name: /View details/i,
      });
      await clickWithWait(user, viewDetailsButton);

      const popover = await screen.findByRole('dialog');

      expect(within(popover).getByText('Added packages')).toBeInTheDocument();
      expect(
        within(popover).getByText('Included partitioning'),
      ).toBeInTheDocument();
      expect(within(popover).getByText('Kernel arguments')).toBeInTheDocument();
      expect(within(popover).getByText('Systemd services')).toBeInTheDocument();
      expect(within(popover).getByText('Enabled services')).toBeInTheDocument();
      expect(within(popover).getByText('Masked services')).toBeInTheDocument();
    });
  });
});
