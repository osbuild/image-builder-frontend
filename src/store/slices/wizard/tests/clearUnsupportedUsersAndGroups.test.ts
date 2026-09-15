import { describe, expect, it } from 'vitest';

import {
  clearUsersAndGroups,
  initialState,
  type WizardState,
} from '@/store/slices/wizard';
import {
  createListenerApi,
  createMockState,
} from '@/store/slices/wizard/tests/mockWizardState';

import { clearUnsupportedUsersAndGroups } from '../listeners';

const createState = (imageTypes: WizardState['output']['imageTypes']) =>
  createMockState({
    output: {
      ...initialState.output,
      imageTypes,
    },
  });

describe('clearUnsupportedUsersAndGroups', () => {
  it.each(['network-installer', 'bootable-container-iso'])(
    'clears users and groups for %s',
    (imageType) => {
      const listenerApi = createListenerApi(
        createState([imageType as WizardState['output']['imageTypes'][number]]),
      );

      clearUnsupportedUsersAndGroups({} as never, listenerApi as never);

      expect(listenerApi.dispatch).toHaveBeenCalledWith(clearUsersAndGroups());
    },
  );

  it('keeps users and groups for a supported image type', () => {
    const listenerApi = createListenerApi(createState(['aws']));

    clearUnsupportedUsersAndGroups({} as never, listenerApi as never);

    expect(listenerApi.dispatch).not.toHaveBeenCalled();
  });

  it('does nothing when no image type is selected', () => {
    const listenerApi = createListenerApi(createState([]));

    clearUnsupportedUsersAndGroups({} as never, listenerApi as never);

    expect(listenerApi.dispatch).not.toHaveBeenCalled();
  });
});
