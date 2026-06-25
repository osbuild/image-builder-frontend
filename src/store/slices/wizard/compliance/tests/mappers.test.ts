import { describe, expect, it } from 'vitest';

import { createMockState } from '../../tests/mockWizardState';
import { mapComplianceCustomizations } from '../mappers';
import { initialState } from '../state';
import type { ComplianceSlice } from '../types';

const createState = (overrides: Partial<ComplianceSlice> = {}) =>
  createMockState({
    compliance: { ...initialState, ...overrides },
  });

describe('mapComplianceCustomizations', () => {
  it('returns empty object when compliance type is none', () => {
    const state = createState();
    expect(mapComplianceCustomizations(state)).toEqual({});
  });

  it('returns openscap with profile_id for openscap type', () => {
    const state = createState({
      type: 'openscap',
      profileID: 'xccdf_org.ssgproject.content_profile_cis',
    });
    expect(mapComplianceCustomizations(state)).toEqual({
      openscap: {
        profile_id: 'xccdf_org.ssgproject.content_profile_cis',
      },
    });
  });

  it('returns openscap with policy_id for compliance type', () => {
    const state = createState({
      type: 'compliance',
      policyID: 'policy-123',
    });
    expect(mapComplianceCustomizations(state)).toEqual({
      openscap: {
        policy_id: 'policy-123',
      },
    });
  });

  it('returns undefined openscap when openscap type has no profile', () => {
    const state = createState({ type: 'openscap' });
    expect(mapComplianceCustomizations(state)).toEqual({});
  });

  it('returns undefined openscap when compliance type has no policy', () => {
    const state = createState({ type: 'compliance' });
    expect(mapComplianceCustomizations(state)).toEqual({});
  });

  it('returns fips when enabled', () => {
    const state = createState({ fips: { enabled: true } });
    expect(mapComplianceCustomizations(state)).toEqual({
      fips: { enabled: true },
    });
  });

  it('omits fips key when disabled', () => {
    const state = createState({ fips: { enabled: false } });
    const result = mapComplianceCustomizations(state);
    expect(result).not.toHaveProperty('fips');
  });

  it('returns both openscap and fips when both are set', () => {
    const state = createState({
      type: 'openscap',
      profileID: 'xccdf_org.ssgproject.content_profile_cis',
      fips: { enabled: true },
    });
    expect(mapComplianceCustomizations(state)).toEqual({
      openscap: {
        profile_id: 'xccdf_org.ssgproject.content_profile_cis',
      },
      fips: { enabled: true },
    });
  });
});
