import React from 'react';

import { screen } from '@testing-library/react';

import { createUser, renderWithRedux, typeWithWait } from '@/test/testUtils';

import Gcp from '../index';

describe('GCP Component', () => {
  describe('Form submission', () => {
    test('pressing Enter in principal input does not trigger page reload', async () => {
      const { store } = renderWithRedux(<Gcp />, {
        imageTypes: ['gcp'],
        gcp: {
          accountType: 'user',
          email: '',
        },
      });
      const user = createUser();

      const principalInput = await screen.findByRole('textbox', {
        name: /google principal/i,
      });
      await typeWithWait(user, principalInput, 'user@example.com{Enter}');

      expect(principalInput).toBeInTheDocument();
      expect(store.getState().wizard.gcp.email).toBe('user@example.com');
    });
  });
});
