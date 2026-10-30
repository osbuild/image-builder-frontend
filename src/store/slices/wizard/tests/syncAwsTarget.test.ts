import { describe, expect, it } from 'vitest';

import {
  changeAwsRegion,
  changeAwsShareMethod,
  changeImageTypes,
  DEFAULT_AWS_REGION,
  initialState,
  reinitializeAws,
  type WizardState,
} from '@/store/slices/wizard';
import {
  createListenerApi,
  createMockState,
} from '@/store/slices/wizard/tests/mockWizardState';

import { syncAwsTarget } from '../listeners';

const createState = (
  isOnPremise: boolean,
  imageTypes: WizardState['output']['imageTypes'],
  aws: WizardState['cloudProviders']['aws'],
) => ({
  ...createMockState({
    cloudProviders: { ...initialState.cloudProviders, aws },
    output: { ...initialState.output, imageTypes },
  }),
  env: { isOnPremise },
});

describe('syncAwsTarget', () => {
  it.each([
    { environment: 'on-prem', isOnPremise: true, shareMethod: 'onprem' },
    { environment: 'hosted', isOnPremise: false, shareMethod: 'manual' },
  ] as const)(
    'selects the $shareMethod share method for $environment AWS targets',
    ({ isOnPremise, shareMethod }) => {
      const previousState = createState(
        isOnPremise,
        ['guest-image'],
        initialState.cloudProviders.aws,
      );
      const listenerApi = createListenerApi(
        createState(isOnPremise, ['aws'], initialState.cloudProviders.aws),
      );
      listenerApi.getOriginalState.mockReturnValue(previousState);

      syncAwsTarget(changeImageTypes(['aws']), listenerApi as never);

      expect(listenerApi.dispatch).toHaveBeenCalledWith(
        changeAwsShareMethod(shareMethod),
      );
    },
  );

  it('uses the configured AWS region for on-prem targets', () => {
    const previousState = createState(
      true,
      ['guest-image'],
      initialState.cloudProviders.aws,
    );
    const state = {
      ...createState(true, ['aws'], initialState.cloudProviders.aws),
      cloudConfig: { aws: { region: 'us-east-100' } },
    };
    const listenerApi = createListenerApi(state);
    listenerApi.getOriginalState.mockReturnValue(previousState);

    syncAwsTarget(changeImageTypes(['aws']), listenerApi as never);

    expect(listenerApi.dispatch).toHaveBeenNthCalledWith(
      1,
      changeAwsShareMethod('onprem'),
    );
    expect(listenerApi.dispatch).toHaveBeenNthCalledWith(
      2,
      changeAwsRegion('us-east-100'),
    );
  });

  it('resets AWS when the target is removed', () => {
    const previousState = createState(true, ['aws'], {
      shareMethod: 'onprem',
      region: DEFAULT_AWS_REGION,
    });
    const listenerApi = createListenerApi(
      createState(
        true,
        ['guest-image'],
        previousState.wizard.cloudProviders.aws,
      ),
    );
    listenerApi.getOriginalState.mockReturnValue(previousState);

    syncAwsTarget(changeImageTypes(['guest-image']), listenerApi as never);

    expect(listenerApi.dispatch).toHaveBeenCalledWith(reinitializeAws());
  });

  it('does not clear an on-prem AWS region when AWS remains selected', () => {
    const state = createState(true, ['aws'], {
      shareMethod: 'onprem',
      region: DEFAULT_AWS_REGION,
    });
    const listenerApi = createListenerApi(state);
    listenerApi.getOriginalState.mockReturnValue(state);

    syncAwsTarget(changeImageTypes(['aws']), listenerApi as never);

    expect(listenerApi.dispatch).not.toHaveBeenCalled();
  });

  it('leaves the default AWS state unchanged when AWS is not selected', () => {
    const state = createState(
      true,
      ['guest-image'],
      initialState.cloudProviders.aws,
    );
    const listenerApi = createListenerApi(state);
    listenerApi.getOriginalState.mockReturnValue(state);

    syncAwsTarget(changeImageTypes(['guest-image']), listenerApi as never);

    expect(listenerApi.dispatch).not.toHaveBeenCalled();
  });
});
