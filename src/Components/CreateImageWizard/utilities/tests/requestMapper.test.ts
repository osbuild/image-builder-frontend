import { describe, expect, it } from 'vitest';

import { CENTOS_9, RHEL_10, RHEL_8, RHEL_9 } from '@/constants';
import {
  BlueprintExportResponse,
  BlueprintResponse,
  CreateBlueprintRequest,
  Distributions,
  ImageRequest,
} from '@/store/api/backend';
import {
  mapStateToRequest,
  parseStateFromRequest,
} from '@/store/slices/wizard';
import { createTestStore } from '@/test/testUtils';

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

    const state = parseStateFromRequest(response);

    expect(state.details.blueprint.mode).toBe('package');
  });

  it('sets blueprintMode to image when bootc is present', () => {
    const response = createMinimalBlueprintResponse({
      bootc: { reference: 'quay.io/org/image:latest' },
    });

    const state = parseStateFromRequest(response);

    expect(state.details.blueprint.mode).toBe('image');
  });

  it('maps imageSource from bootc reference', () => {
    const response = createMinimalBlueprintResponse({
      bootc: { reference: 'quay.io/org/image:latest' },
    });

    const state = parseStateFromRequest(response);

    expect(state.output.imageSource).toBe('quay.io/org/image:latest');
  });

  it('sets imageSource to undefined for package-mode blueprints', () => {
    const response = createMinimalBlueprintResponse();

    const state = parseStateFromRequest(response);

    expect(state.output.imageSource).toBeUndefined();
  });

  it('normalizes distribution via getLatestRelease', () => {
    const response = createMinimalBlueprintResponse({
      distribution: 'rhel-9.2' as Distributions,
    });

    const state = parseStateFromRequest(response);

    expect(state.output.distribution).toBe(RHEL_9);
  });

  it('falls back to initial state distribution for legacy bootc blueprints with undefined distribution', () => {
    const response = createMinimalBlueprintResponse({
      distribution: undefined,
      bootc: { reference: 'quay.io/org/image:latest' },
    });

    const state = parseStateFromRequest(response);

    // Falls back to initialState.distribution, not a hardcoded default
    expect(state.output.distribution).toBe(RHEL_10);
  });
});

describe('mapBlueprintExportToState', () => {
  it('sets blueprintMode to package when bootc is absent', () => {
    const blueprint = createMinimalBlueprintExportResponse();

    const state = parseStateFromRequest(blueprint);

    expect(state.details.blueprint.mode).toBe('package');
  });

  it('sets blueprintMode to image when bootc is present', () => {
    const blueprint = createMinimalBlueprintExportResponse({
      bootc: { reference: 'quay.io/org/image:latest' },
    });

    const state = parseStateFromRequest(blueprint);

    expect(state.details.blueprint.mode).toBe('image');
  });

  it('falls back to initial state distribution for legacy bootc blueprints with undefined distribution', () => {
    const blueprint = createMinimalBlueprintExportResponse({
      distribution: undefined,
      bootc: { reference: 'quay.io/org/image:latest' },
    });

    const state = parseStateFromRequest(blueprint);

    // Falls back to initialState.distribution, not a hardcoded default
    expect(state.output.distribution).toBe(RHEL_10);
  });
});

const baseTestImageRequest: ImageRequest = {
  architecture: 'x86_64',
  image_type: 'guest-image',
  upload_request: { type: 'aws.s3', options: {} },
};

const aarch64TestImageRequest: ImageRequest = {
  ...baseTestImageRequest,
  architecture: 'aarch64',
};

const editModeFixtures: Record<string, CreateBlueprintRequest> = {
  rhel9_x86_64: {
    distribution: RHEL_9,
    image_requests: [baseTestImageRequest],
    name: 'rhel9_x86_64',
    description: '',
    customizations: {},
  },
  rhel8_x86_64: {
    distribution: RHEL_8,
    image_requests: [baseTestImageRequest],
    name: 'rhel8_x86_64',
    description: '',
    customizations: {},
  },
  centos9_x86_64: {
    distribution: CENTOS_9,
    image_requests: [baseTestImageRequest],
    name: 'centos9_x86_64',
    description: '',
    customizations: {},
  },
  rhel9_aarch64: {
    distribution: RHEL_9,
    image_requests: [aarch64TestImageRequest],
    name: 'rhel9_aarch64',
    description: '',
    customizations: {},
  },
};

const toBlueprintResponse = (
  request: CreateBlueprintRequest,
): BlueprintResponse => ({
  ...request,
  description: request.description ?? '',
  id: 'test-round-trip-id',
  lint: { errors: [], warnings: [] },
});

const stripUndefined = <T extends Record<string, unknown>>(obj: T): T =>
  JSON.parse(JSON.stringify(obj)) as T;

describe('round-trip: mapRequestToState + mapStateToRequest', () => {
  it.each(Object.entries(editModeFixtures))(
    'round-trips correctly for %s blueprint',
    (_, expectedRequest) => {
      const response = toBlueprintResponse(expectedRequest);
      const wizardState = parseStateFromRequest(response);
      const store = createTestStore(wizardState);
      const result = stripUndefined(mapStateToRequest(store.getState()));
      expect(result).toEqual(expectedRequest);
    },
  );
});
