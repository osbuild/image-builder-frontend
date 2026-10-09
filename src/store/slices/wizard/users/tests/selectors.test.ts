import { describe, expect, it } from 'vitest';

import { createMockState } from '@/store/slices/wizard/tests/mockWizardState';

import { selectNonEmptyUsers } from '../selectors';
import { initialState } from '../state';

describe('user selectors', () => {
  it('filters users with only whitespace credentials', () => {
    const state = createMockState({
      users: {
        ...initialState,
        users: [
          {
            name: '',
            password: '   ',
            ssh_key: '\t  ',
            groups: [],
            hasPassword: false,
          },
        ],
      },
    });

    expect(selectNonEmptyUsers(state)).toEqual([]);
  });
});
