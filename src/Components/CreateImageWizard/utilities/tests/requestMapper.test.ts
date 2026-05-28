import { describe, expect, it } from 'vitest';

import { RHEL_10, RHEL_9 } from '@/constants';
import {
  BlueprintExportResponse,
  BlueprintResponse,
  Distributions,
} from '@/store/api/backend';

import { mapBlueprintExportToState, mapRequestToState } from '../requestMapper';

const createMinimalBlueprintResponse = (
  overrides: Partial<BlueprintResponse> = {},
): BlueprintResponse => ({
  id: 'test-id',
  name: 'test-blueprint',
  description: '',
  lint: { errors: [], warnings: [] },
  distribution: 'rhel-9' as Distributions,
  customizations: {},
  image_requests: [
    {
      architecture: 'x86_64',
      image_type: 'guest-image',
      upload_request: { type: 'aws.s3', options: {} },
    },
  ],
  ...overrides,
});

const createMinimalBlueprintExportResponse = (
  overrides: Partial<BlueprintExportResponse> = {},
): BlueprintExportResponse => ({
  name: 'test-blueprint',
  description: '',
  distribution: 'rhel-9' as Distributions,
  customizations: {},
  metadata: {
    parent_id: null,
    exported_at: '',
    is_on_prem: false,
  },
  ...overrides,
});

describe('mapRequestToState', () => {
  it('sets blueprintMode to package when bootc is absent', () => {
    const response = createMinimalBlueprintResponse();

    const state = mapRequestToState(response);

    expect(state.blueprintMode).toBe('package');
  });

  it('sets blueprintMode to image when bootc is present', () => {
    const response = createMinimalBlueprintResponse({
      bootc: { reference: 'quay.io/org/image:latest' },
    });

    const state = mapRequestToState(response);

    expect(state.blueprintMode).toBe('image');
  });

  it('maps imageSource from bootc reference', () => {
    const response = createMinimalBlueprintResponse({
      bootc: { reference: 'quay.io/org/image:latest' },
    });

    const state = mapRequestToState(response);

    expect(state.imageSource).toBe('quay.io/org/image:latest');
  });

  it('sets imageSource to undefined for package-mode blueprints', () => {
    const response = createMinimalBlueprintResponse();

    const state = mapRequestToState(response);

    expect(state.imageSource).toBeUndefined();
  });

  it('normalizes distribution via getLatestRelease', () => {
    const response = createMinimalBlueprintResponse({
      distribution: 'rhel-9.2' as Distributions,
    });

    const state = mapRequestToState(response);

    expect(state.distribution).toBe(RHEL_9);
  });

  it('falls back to initial state distribution for legacy bootc blueprints with undefined distribution', () => {
    const response = createMinimalBlueprintResponse({
      distribution: undefined,
      bootc: { reference: 'quay.io/org/image:latest' },
    });

    const state = mapRequestToState(response);

    // Falls back to initialState.distribution, not a hardcoded default
    expect(state.distribution).toBe(RHEL_10);
  });
});

describe('mapBlueprintExportToState', () => {
  it('sets blueprintMode to package when bootc is absent', () => {
    const blueprint = createMinimalBlueprintExportResponse();

    const state = mapBlueprintExportToState(blueprint, []);

    expect(state.blueprintMode).toBe('package');
  });

  it('sets blueprintMode to image when bootc is present', () => {
    const blueprint = createMinimalBlueprintExportResponse({
      bootc: { reference: 'quay.io/org/image:latest' },
    });

    const state = mapBlueprintExportToState(blueprint, []);

    expect(state.blueprintMode).toBe('image');
  });

  it('falls back to initial state distribution for legacy bootc blueprints with undefined distribution', () => {
    const blueprint = createMinimalBlueprintExportResponse({
      distribution: undefined,
      bootc: { reference: 'quay.io/org/image:latest' },
    });

    const state = mapBlueprintExportToState(blueprint, []);

    // Falls back to initialState.distribution, not a hardcoded default
    expect(state.distribution).toBe(RHEL_10);
  });
});
