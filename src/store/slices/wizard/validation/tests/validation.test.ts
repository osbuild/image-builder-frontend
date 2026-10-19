import { describe, expect, it } from 'vitest';

import { clearPendingInputs, validationSlice } from '../slice';
import { initialState } from '../state';

describe('validation reducers', () => {
  it('clears all pending inputs without changing error visibility', () => {
    const state = {
      ...initialState,
      forceShowErrors: true,
      pendingInputs: ['hostname', 'username'],
    };

    expect(validationSlice.reducer(state, clearPendingInputs())).toEqual({
      forceShowErrors: true,
      pendingInputs: [],
    });
  });
});
