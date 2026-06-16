import React from 'react';

import { screen } from '@testing-library/react';

import {
  clickWithWait,
  createUser,
  renderWithRedux,
  typeWithWait,
} from '@/test/testUtils';

import OscapStep from '../index';

describe('Oscap Component', () => {
  describe('Form submission', () => {
    test('pressing Enter in profile search does not trigger page reload', async () => {
      renderWithRedux(<OscapStep />, {
        compliance: {
          type: 'openscap',
          profileID: undefined,
          policyID: undefined,
          policyTitle: undefined,
          fips: { enabled: false },
        },
      });
      const user = createUser();

      const profileSearchInput =
        await screen.findByPlaceholderText('Select a profile');
      await typeWithWait(user, profileSearchInput, 'cis{Enter}');

      expect(profileSearchInput).toBeInTheDocument();
      expect(profileSearchInput).toHaveValue('cis');
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
      renderWithRedux(<OscapStep />);
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

      expect(
        screen.getByPlaceholderText('Select a profile'),
      ).toBeInTheDocument();
    });

    test('switching back to none from openscap deselects profile', async () => {
      renderWithRedux(<OscapStep />, {
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
});
