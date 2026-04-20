import React from 'react';

import { screen } from '@testing-library/react';

import { createUser, renderWithRedux, typeWithWait } from '@/test/testUtils';

import OscapStep from '../index';

describe('Oscap Component', () => {
  describe('Form submission', () => {
    test('pressing Enter in profile search does not trigger page reload', async () => {
      renderWithRedux(<OscapStep />, {
        compliance: {
          complianceType: 'openscap',
          profileID: undefined,
          policyID: undefined,
          policyTitle: undefined,
        },
      });
      const user = createUser();

      const profileSearchInput = await screen.findByPlaceholderText('None');
      await typeWithWait(user, profileSearchInput, 'cis{Enter}');

      expect(profileSearchInput).toBeInTheDocument();
      expect(profileSearchInput).toHaveValue('cis');
    });
  });
});
