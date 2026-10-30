import { describe, expect, it } from 'vitest';

import {
  changeImageTypes,
  initializeGcp,
  initialState,
  reinitializeGcp,
  type WizardState,
} from '@/store/slices/wizard';
import {
  createListenerApi,
  createMockState,
} from '@/store/slices/wizard/tests/mockWizardState';

import { syncGcpTarget } from '../listeners';

const createState = (
  imageTypes: WizardState['output']['imageTypes'],
  gcp: WizardState['cloudProviders']['gcp'],
) =>
  createMockState({
    cloudProviders: { ...initialState.cloudProviders, gcp },
    output: { ...initialState.output, imageTypes },
  });

describe('syncGcpTarget', () => {
  it('initializes GCP when the target is selected', () => {
    const previousState = createState(['guest-image'], undefined);
    const listenerApi = createListenerApi(createState(['gcp'], undefined));
    listenerApi.getOriginalState.mockReturnValue(previousState);

    syncGcpTarget(changeImageTypes(['gcp']), listenerApi as never);

    expect(listenerApi.dispatch).toHaveBeenCalledWith(initializeGcp());
  });

  it('resets GCP when the target is removed', () => {
    const gcp: WizardState['cloudProviders']['gcp'] = {
      accountType: 'user',
      email: 'user@example.com',
    };
    const previousState = createState(['gcp'], gcp);
    const listenerApi = createListenerApi(createState(['guest-image'], gcp));
    listenerApi.getOriginalState.mockReturnValue(previousState);

    syncGcpTarget(changeImageTypes(['guest-image']), listenerApi as never);

    expect(listenerApi.dispatch).toHaveBeenCalledWith(reinitializeGcp());
  });

  it.each([
    {
      description: 'GCP remains selected',
      previousImageTypes: ['gcp'],
      imageTypes: ['gcp'],
      gcp: { accountType: 'user', email: 'user@example.com' },
    },
    {
      description: 'GCP was not selected',
      previousImageTypes: ['guest-image'],
      imageTypes: ['guest-image'],
      gcp: undefined,
    },
  ] as const)(
    'does not reset GCP when $description',
    ({ previousImageTypes, imageTypes, gcp }) => {
      const previousState = createState([...previousImageTypes], gcp);
      const listenerApi = createListenerApi(createState([...imageTypes], gcp));
      listenerApi.getOriginalState.mockReturnValue(previousState);

      syncGcpTarget(changeImageTypes([...imageTypes]), listenerApi as never);

      expect(listenerApi.dispatch).not.toHaveBeenCalled();
    },
  );
});
