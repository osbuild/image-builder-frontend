import React from 'react';

import { screen } from '@testing-library/react';

import { createUser, renderWithRedux, typeWithWait } from '@/test/testUtils';

import Aws from '../index';

describe('AWS Component', () => {
  describe('Form submission', () => {
    test('pressing Enter in AWS account ID input does not trigger page reload', async () => {
      const { store } = renderWithRedux(<Aws />, {
        imageTypes: ['aws'],
      });
      const user = createUser();

      const accountIdInput = await screen.findByRole('textbox', {
        name: /aws account id/i,
      });
      await typeWithWait(user, accountIdInput, '123456789012{Enter}');

      expect(accountIdInput).toBeInTheDocument();
      expect(store.getState().wizard.aws.accountId).toBe('123456789012');
    });
  });
});
