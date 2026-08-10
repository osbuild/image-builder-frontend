import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { changeImageTypes, initialState } from '@/store/slices/wizard';
import {
  createListenerApi,
  createMockState,
} from '@/store/slices/wizard/tests/mockWizardState';

import { resolveOfficialImage } from '../listeners';

const KVM_REF = 'registry.redhat.io/rhel10/rhel-bootc-kvm:latest';
const AWS_REF = 'registry.redhat.io/rhel10/rhel-bootc-aws:latest';

const imageModeState = (outputOverrides = {}) =>
  createMockState({
    details: {
      ...initialState.details,
      blueprint: {
        ...initialState.details.blueprint,
        mode: 'image',
      },
    },
    output: {
      ...initialState.output,
      imageSourceType: 'official',
      ...outputOverrides,
    },
  });

describe('resolveOfficialImage', () => {
  beforeEach(() => {
    vi.stubEnv('IS_ON_PREMISE', 'true');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('selects the official image and distribution for the chosen type', () => {
    const listenerApi = createListenerApi(
      imageModeState({ imageTypes: ['guest-image'] }),
    );

    resolveOfficialImage(changeImageTypes(['guest-image']), listenerApi);

    expect(listenerApi.dispatch).toHaveBeenCalledWith({
      type: 'wizard/output/changeImageSource',
      payload: KVM_REF,
    });
    expect(listenerApi.dispatch).toHaveBeenCalledWith({
      type: 'wizard/output/changeDistribution',
      payload: 'rhel-10.3',
    });
  });

  it('switches a known image to its sibling for the selected type', () => {
    const listenerApi = createListenerApi(
      imageModeState({ imageSource: KVM_REF, imageTypes: ['aws'] }),
    );

    resolveOfficialImage(changeImageTypes(['aws']), listenerApi);

    expect(listenerApi.dispatch).toHaveBeenCalledWith({
      type: 'wizard/output/changeImageSource',
      payload: AWS_REF,
    });
  });

  it('keeps a known image when its type is selected', () => {
    const listenerApi = createListenerApi(
      imageModeState({ imageSource: AWS_REF, imageTypes: ['aws'] }),
    );

    resolveOfficialImage(changeImageTypes(['aws']), listenerApi);

    expect(listenerApi.dispatch).not.toHaveBeenCalled();
  });

  it('does not change an unknown image reference', () => {
    const listenerApi = createListenerApi(
      imageModeState({
        imageSource: 'localhost/my-derived-image:latest',
        imageTypes: ['aws'],
      }),
    );

    resolveOfficialImage(changeImageTypes(['aws']), listenerApi);

    expect(listenerApi.dispatch).not.toHaveBeenCalled();
  });

  it('does not select an image for the local source type', () => {
    const listenerApi = createListenerApi(
      imageModeState({
        imageSourceType: 'local',
        imageTypes: ['guest-image'],
      }),
    );

    resolveOfficialImage(changeImageTypes(['guest-image']), listenerApi);

    expect(listenerApi.dispatch).not.toHaveBeenCalled();
  });

  it('does not run in package mode', () => {
    // On-prem package mode also dispatches changeImageTypes (e.g. the
    // architecture filter); the resolver must not touch the state then.
    const listenerApi = createListenerApi(
      createMockState({
        output: {
          ...initialState.output,
          imageTypes: ['aws', 'guest-image'],
        },
      }),
    );

    resolveOfficialImage(changeImageTypes(['aws', 'guest-image']), listenerApi);

    expect(listenerApi.dispatch).not.toHaveBeenCalled();
  });

  it('does not run in the hosted bundle', () => {
    vi.stubEnv('IS_ON_PREMISE', '');
    const listenerApi = createListenerApi(
      imageModeState({ imageTypes: ['guest-image'] }),
    );

    resolveOfficialImage(changeImageTypes(['guest-image']), listenerApi);

    expect(listenerApi.dispatch).not.toHaveBeenCalled();
  });
});
