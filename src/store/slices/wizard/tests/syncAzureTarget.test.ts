import { describe, expect, it } from 'vitest';

import {
  changeImageTypes,
  initialState,
  reinitializeAzure,
  type WizardState,
} from '@/store/slices/wizard';
import {
  createListenerApi,
  createMockState,
} from '@/store/slices/wizard/tests/mockWizardState';

import { syncAzureTarget } from '../listeners';

const createState = (
  imageTypes: WizardState['output']['imageTypes'],
  azure: WizardState['cloudProviders']['azure'],
) =>
  createMockState({
    cloudProviders: { ...initialState.cloudProviders, azure },
    output: { ...initialState.output, imageTypes },
  });

describe('syncAzureTarget', () => {
  it('resets Azure when the target is removed', () => {
    const azure: WizardState['cloudProviders']['azure'] = {
      tenantId: 'tenant-id',
      subscriptionId: 'subscription-id',
      resourceGroup: 'resource-group',
      hyperVGeneration: 'V1',
    };
    const previousState = createState(['azure'], azure);
    const listenerApi = createListenerApi(createState(['guest-image'], azure));
    listenerApi.getOriginalState.mockReturnValue(previousState);

    syncAzureTarget(changeImageTypes(['guest-image']), listenerApi as never);

    expect(listenerApi.dispatch).toHaveBeenCalledWith(reinitializeAzure());
  });

  it.each([
    {
      description: 'Azure remains selected',
      previousImageTypes: ['azure'],
      imageTypes: ['azure'],
    },
    {
      description: 'Azure was not selected',
      previousImageTypes: ['guest-image'],
      imageTypes: ['guest-image'],
    },
  ] as const)(
    'does not reset Azure when $description',
    ({ previousImageTypes, imageTypes }) => {
      const azure = {
        ...initialState.cloudProviders.azure,
        tenantId: 'tenant-id',
      };
      const previousState = createState([...previousImageTypes], azure);
      const listenerApi = createListenerApi(
        createState([...imageTypes], azure),
      );
      listenerApi.getOriginalState.mockReturnValue(previousState);

      syncAzureTarget(changeImageTypes([...imageTypes]), listenerApi as never);

      expect(listenerApi.dispatch).not.toHaveBeenCalled();
    },
  );
});
